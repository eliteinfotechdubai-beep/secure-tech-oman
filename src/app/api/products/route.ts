import {
  getAllProducts,
  getProductsByCollection,
  getProductsByVendor,
  getProductsBySection,
  getFeaturedProducts,
  getBestSellingProducts,
  getProductsPage,
  getCollectionIdForHandle,
  getCollectionBottomContent,
  getSectionFilter,
  quoteQueryValue,
} from '@/lib/shopify/shopify-products';
import type { CollectionBottomContent } from '@/lib/shopify/shopify-types';
import { NO_CACHE_HEADERS } from '@/lib/http/no-cache';
import { NextResponse, NextRequest } from 'next/server';

// Products, prices and stock are edited in the Shopify admin and must show up
// immediately, so this route stays out of the build-time prerender, the ISR cache
// and the Data Cache.
export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

// Fallback only: the grid sends its own ?pageSize. Kept in step with PRODUCTS_PER_PAGE
// in products-client.tsx so a caller that omits it still gets a sensible page.
const DEFAULT_PAGE_SIZE = 30;

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const collection = searchParams.get('collection');
    const type = searchParams.get('type');
    // Set by the brand cards on the homepage; matched against Shopify's vendor field.
    const brand = searchParams.get('brand');
    // Set by a homepage section's "View All Products" link; a homepage_sections handle.
    const section = searchParams.get('section');
    // No ?limit= means the whole catalog: the products page paginates client-side, so
    // truncating here would hide everything past the first page.
    const limitParam = searchParams.get('limit');
    const parsedLimit = limitParam ? parseInt(limitParam, 10) : NaN;
    const limit = Number.isFinite(parsedLimit) && parsedLimit > 0 ? parsedLimit : undefined;

    let products;
    // Only set for a section request, so the grid can be labelled with the section's
    // title instead of its handle.
    let sectionTitle: string | undefined;

    // ?page= opts into server-side pagination, which is what the /products grid uses.
    // Without it the route answers exactly as it did before, so the homepage and every
    // other caller are unaffected.
    const pageParam = parseInt(searchParams.get('page') || '', 10);
    if (Number.isFinite(pageParam) && pageParam > 0) {
      const pageSizeParam = parseInt(searchParams.get('pageSize') || '', 10);
      const pageSize =
        Number.isFinite(pageSizeParam) && pageSizeParam > 0 ? pageSizeParam : DEFAULT_PAGE_SIZE;
      // Free-text search from the grid's search box.
      const q = (searchParams.get('q') || '').trim();

      // Each filter becomes a Shopify query string so one paginated path serves them
      // all. Undefined means the unfiltered catalogue.
      let query: string | undefined;
      // Only set for a collection request: the body of its custom.bottom_page.
      let bottomContentRequest: Promise<CollectionBottomContent | undefined> | undefined;

      if (section) {
        const filter = await getSectionFilter(section);
        if (!filter) {
          return NextResponse.json(
            { success: false, error: 'Section not found' },
            { status: 404, headers: NO_CACHE_HEADERS }
          );
        }
        query = filter.query;
        sectionTitle = filter.title;
      } else if (q) {
        query = q;
      } else if (brand) {
        query = `vendor:${quoteQueryValue(brand)}`;
      } else if (collection && collection !== 'all') {
        // Started before the id lookup so it overlaps it and the products fetch below.
        bottomContentRequest = getCollectionBottomContent(collection);
        const collectionId = await getCollectionIdForHandle(collection);
        if (!collectionId) {
          return NextResponse.json(
            { success: false, error: 'Collection not found' },
            { status: 404, headers: NO_CACHE_HEADERS }
          );
        }
        query = `collection_id:${collectionId}`;
      }

      const [result, bottomContent] = await Promise.all([
        getProductsPage({ page: pageParam, pageSize, query }),
        bottomContentRequest,
      ]);

      return NextResponse.json(
        {
          success: true,
          data: result.products,
          count: result.products.length,
          totalCount: result.totalCount,
          page: result.page,
          pageSize: result.pageSize,
          totalPages: result.totalPages,
          ...(sectionTitle ? { sectionTitle } : {}),
          ...(bottomContent ? { bottomContent } : {}),
        },
        { headers: NO_CACHE_HEADERS }
      );
    }

    if (section) {
      const result = await getProductsBySection(section);
      if (!result) {
        return NextResponse.json(
          { success: false, error: 'Section not found' },
          { status: 404, headers: NO_CACHE_HEADERS }
        );
      }
      products = result.products;
      sectionTitle = result.title;
    } else if (type === 'featured') {
      products = await getFeaturedProducts();
    } else if (type === 'bestselling') {
      products = await getBestSellingProducts();
    } else if (brand) {
      products = await getProductsByVendor(brand);
    } else if (collection) {
      products = await getProductsByCollection(collection);
    } else {
      products = await getAllProducts(limit);
    }

    const data = limit ? products.slice(0, limit) : products;

    return NextResponse.json(
      {
        success: true,
        data,
        count: data.length,
        ...(sectionTitle ? { sectionTitle } : {}),
      },
      { headers: NO_CACHE_HEADERS }
    );
  } catch (error) {
    console.error('Error fetching products:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch products',
      },
      { status: 500, headers: NO_CACHE_HEADERS }
    );
  }
}
