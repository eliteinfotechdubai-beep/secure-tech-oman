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

export async function shopifyFetch(
  query: string,
  variables: any = {},
  options: ShopifyFetchOptions = {}
) {
  try {
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

    const data = await response.json();

    if (data.errors) {
      console.error('Shopify GraphQL Error:', data.errors);
      throw new Error(`Shopify API error: ${JSON.stringify(data.errors)}`);
    }

    return data.data;
  } catch (error) {
    console.error('Shopify API fetch error:', error);
    throw error;
  }
}
