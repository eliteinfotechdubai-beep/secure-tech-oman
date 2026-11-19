import { shopifyFetch } from './shopify-client';
import { GET_PRODUCTS_COUNT } from './shopify-queries';
import { quoteQueryValue } from './shopify-products';

// Every vendor with at least one product. A single cheap query, so the sitemap does not
// spend a request per brand while the build is prerendering hundreds of other pages.
const GET_PRODUCT_VENDORS = `
  query GetProductVendors {
    shop {
      productVendors(first: 250) {
        edges {
          node
        }
      }
    }
  }
`;

// Null when Shopify cannot be reached. Throttled attempts are already retried inside
// shopifyFetch, so this only turns the final failure into null.
async function fetchWithThrottleRetry<T>(
  label: string,
  request: () => Promise<T>
): Promise<T | null> {
  try {
    return await request();
  } catch (error) {
    console.error(`Error fetching ${label}:`, error);
    return null;
  }
}

/**
 * How many Shopify products a brand page lists: the same `vendor:` query the product grid
 * sends through /api/products?brand=, so the two always agree.
 *
 * Null when Shopify cannot be reached. getProductsPage() reports that as 0, which would
 * look like an empty brand and mark a page with products as noindex.
 */
export async function getVendorProductCount(vendor: string): Promise<number | null> {
  // No cache option: the brand pages are force-dynamic, so this is fresh per request.
  const data = await fetchWithThrottleRetry(`product count for vendor "${vendor}"`, () =>
    shopifyFetch(GET_PRODUCTS_COUNT, { query: `vendor:${quoteQueryValue(vendor)}` })
  );
  const count = data?.productsCount?.count;
  return typeof count === 'number' ? count : null;
}

/** Shopify vendor names that have products, or null when Shopify cannot be reached. */
export async function getProductVendors(): Promise<string[] | null> {
  const data = await fetchWithThrottleRetry('product vendors', () =>
    shopifyFetch(GET_PRODUCT_VENDORS)
  );
  const edges: { node: string }[] | undefined = data?.shop?.productVendors?.edges;
  return edges ? edges.map((edge) => edge.node) : null;
}
