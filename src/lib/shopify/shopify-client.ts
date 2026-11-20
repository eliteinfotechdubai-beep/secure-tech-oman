const SHOPIFY_STORE_NAME = process.env.SHOPIFY_STORE_NAME;
const SHOPIFY_ADMIN_API_KEY = process.env.SHOPIFY_ADMIN_API_KEY;

if (!SHOPIFY_STORE_NAME || !SHOPIFY_ADMIN_API_KEY) {
  throw new Error('Missing Shopify environment variables');
}

const SHOPIFY_GRAPHQL_ENDPOINT = `https://${SHOPIFY_STORE_NAME}/admin/api/2024-01/graphql.json`;

interface ShopifyFetchOptions {
  /**
   * Pass 'no-store' from routes that must always hit Shopify. Omit it to keep the
   * caller's segment-level caching (`export const revalidate`) in charge.
   */
  cache?: RequestCache;
}

// Temporary Shopify failures (THROTTLED, HTTP 429, 5xx) are retried a few times with backoff.
// Everything else (bad queries, auth, network/TLS problems) fails straight away, as before.
// The build prerenders hundreds of pages against one API bucket, so it may wait longer than a
// visitor's request should.
const IS_BUILD = process.env.NEXT_PHASE === 'phase-production-build';
const MAX_RETRIES = IS_BUILD ? 6 : 3;
const MAX_TOTAL_WAIT_MS = IS_BUILD ? 60_000 : 8_000;
const MIN_DELAY_MS = 500;

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

function isThrottled(errors: unknown): boolean {
  return (
    Array.isArray(errors) &&
    errors.some((error) => error?.extensions?.code === 'THROTTLED')
  );
}

interface ShopifyCostExtension {
  extensions?: {
    cost?: {
      requestedQueryCost?: number;
      throttleStatus?: { currentlyAvailable: number; restoreRate: number };
    };
  };
}

// How long Shopify needs to refill enough points for this query; exponential backoff when the
// response did not say.
function retryDelayMs(data: ShopifyCostExtension | null, attempt: number): number {
  const cost = data?.extensions?.cost;
  const status = cost?.throttleStatus;
  let delay = 1000 * 2 ** attempt;

  if (cost && status && typeof cost.requestedQueryCost === 'number' && status.restoreRate > 0) {
    const missing = cost.requestedQueryCost - status.currentlyAvailable;
    delay = (Math.max(missing, 0) / status.restoreRate) * 1000;
  }

  // Jitter, so parallel requests that were throttled together do not retry together.
  return Math.max(delay, MIN_DELAY_MS) + Math.random() * 250;
}

export async function shopifyFetch(
  query: string,
  variables: any = {},
  options: ShopifyFetchOptions = {}
) {
  let waitedMs = 0;

  try {
    for (let attempt = 0; ; attempt++) {
      const response = await fetch(SHOPIFY_GRAPHQL_ENDPOINT, {
        method: 'POST',
        ...(options.cache ? { cache: options.cache } : {}),
        headers: {
          'Content-Type': 'application/json',
          'X-Shopify-Access-Token': SHOPIFY_ADMIN_API_KEY!,
        },
        body: JSON.stringify({
          query,
          variables,
        }),
      });

      const temporaryHttpError = response.status === 429 || response.status >= 500;
      const data = temporaryHttpError ? await response.json().catch(() => null) : await response.json();
      const temporary = temporaryHttpError || isThrottled(data?.errors);

      if (temporary && attempt < MAX_RETRIES) {
        const delay = retryDelayMs(data, attempt);
        if (waitedMs + delay <= MAX_TOTAL_WAIT_MS) {
          console.warn(
            `Shopify ${temporaryHttpError ? `HTTP ${response.status}` : 'THROTTLED'}; retry ${attempt + 1}/${MAX_RETRIES} in ${Math.round(delay)}ms`
          );
          waitedMs += delay;
          await sleep(delay);
          continue;
        }
      }

      if (temporaryHttpError && !data?.errors) {
        throw new Error(`Shopify API error: HTTP ${response.status}`);
      }

      if (data.errors) {
        console.error('Shopify GraphQL Error:', data.errors);
        throw new Error(`Shopify API error: ${JSON.stringify(data.errors)}`);
      }

      return data.data;
    }
  } catch (error) {
    console.error('Shopify API fetch error:', error);
    throw error;
  }
}
