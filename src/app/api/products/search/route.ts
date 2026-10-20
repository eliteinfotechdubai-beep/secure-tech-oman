import { getProductsByQuery } from '@/lib/shopify/shopify-products';
import { NO_CACHE_HEADERS } from '@/lib/http/no-cache';
import { NextResponse, NextRequest } from 'next/server';

// Reading searchParams already forces this route to run per request; these keep the
// Shopify result itself out of the Data Cache so new products are searchable at once.
export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const q = (searchParams.get('q') || '').trim();
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : 8;

    if (!q) {
      return NextResponse.json({ success: true, data: [] }, { headers: NO_CACHE_HEADERS });
    }

    const products = await getProductsByQuery(q, limit);

    return NextResponse.json(
      {
        success: true,
        data: products,
      },
      { headers: NO_CACHE_HEADERS }
    );
  } catch (error) {
    console.error('Error searching products:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to search products',
      },
      { status: 500, headers: NO_CACHE_HEADERS }
    );
  }
}
