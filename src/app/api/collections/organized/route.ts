import { getCategoryTree } from '@/lib/shopify/category-tree';
import { NO_CACHE_HEADERS } from '@/lib/http/no-cache';

// The category tree is edited in the admin. `force-dynamic` keeps this route out of the
// build-time prerender and the ISR cache, and `revalidate = 0` removes the segment-level
// cache lifetime. getCategoryTree() shares one copy for 5 minutes (see category-tree.ts),
// so the header, mobile menu, category nav and product grid no longer each cost a Shopify
// query. No `fetchCache = 'force-no-store'` here: Next skips unstable_cache entirely under
// it, and the tree's Shopify fetches already pass `cache: 'no-store'` themselves.
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  try {
    const tree = await getCategoryTree();

    return Response.json({ success: true, data: tree }, { headers: NO_CACHE_HEADERS });
  } catch (error) {
    console.error('Error fetching organized collections:', error);
    // Almost always Shopify throttling or a brief outage: 503 + Retry-After says "try again
    // shortly" rather than reporting a server bug.
    return Response.json(
      { success: false, error: 'Failed to fetch collections' },
      { status: 503, headers: { ...NO_CACHE_HEADERS, 'Retry-After': '5' } }
    );
  }
}
