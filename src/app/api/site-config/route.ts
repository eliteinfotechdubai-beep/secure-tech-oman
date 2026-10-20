import { getSiteSettings } from '@/lib/shopify/shopify-metaobjects';
import { NO_CACHE_HEADERS } from '@/lib/http/no-cache';
import { NextResponse } from 'next/server';

// Site settings are edited in the Shopify admin and must show up immediately, so this
// route stays out of the build-time prerender, the ISR cache and the Data Cache.
export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

export async function GET() {
  try {
    const settings = await getSiteSettings();

    if (!settings) {
      return NextResponse.json(
        {
          success: false,
          error: 'Site settings not found',
        },
        { status: 404, headers: NO_CACHE_HEADERS }
      );
    }

    return NextResponse.json(
      {
        success: true,
        data: settings,
      },
      { headers: NO_CACHE_HEADERS }
    );
  } catch (error) {
    console.error('Error fetching site config:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch site config',
      },
      { status: 500, headers: NO_CACHE_HEADERS }
    );
  }
}
