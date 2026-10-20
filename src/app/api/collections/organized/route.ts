import { getCategoryTree } from '@/lib/shopify/category-tree';
import { NO_CACHE_HEADERS } from '@/lib/http/no-cache';

// Always hit Shopify: the category tree is edited in the admin and has to show up
// immediately. `force-dynamic` keeps this route out of the build-time prerender and
// the ISR cache, `revalidate = 0` removes the segment-level cache lifetime, and
// `fetchCache` stops the Data Cache from serving a stored Shopify response.
export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

export async function GET() {
  try {
    const tree = await getCategoryTree();

    return Response.json({ success: true, data: tree }, { headers: NO_CACHE_HEADERS });
  } catch (error) {
    console.error('Error fetching organized collections:', error);
    return Response.json(
      { success: false, error: 'Failed to fetch collections' },
      { status: 500, headers: NO_CACHE_HEADERS }
    );
  }
}
