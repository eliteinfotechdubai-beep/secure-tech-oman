import { getAllCollections } from '@/lib/shopify/shopify-products';
import { NO_CACHE_HEADERS } from '@/lib/http/no-cache';
import { NextResponse } from 'next/server';

// Collections are edited in the Shopify admin and must show up immediately, so this
// route stays out of the build-time prerender, the ISR cache and the Data Cache.
export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

export async function GET() {
  try {
    const collections = await getAllCollections();

    return NextResponse.json(
      {
        success: true,
        data: collections,
        count: collections.length,
      },
      { headers: NO_CACHE_HEADERS }
    );
  } catch (error) {
    console.error('Error fetching collections:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch collections',
      },
      { status: 500, headers: NO_CACHE_HEADERS }
    );
  }
}
