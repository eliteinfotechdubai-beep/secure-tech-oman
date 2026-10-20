import { shopifyFetch } from './shopify-client';
import {
  GET_ALL_PRODUCTS,
  GET_PRODUCTS_BY_QUERY,
  GET_PRODUCT_BY_HANDLE,
  GET_ALL_COLLECTIONS,
  GET_COLLECTION_HANDLES,
  GET_COLLECTION_BY_HANDLE,
  GET_VENDORS,
  GET_HOMEPAGE_SECTION_BY_HANDLE,
  GET_PRODUCTS_PAGE,
  GET_PRODUCT_CURSORS,
  GET_PRODUCTS_COUNT,
  GET_COLLECTION_ID,
  GET_COLLECTION_BOTTOM_PAGE,
} from './shopify-queries';
import type { ShopifyProduct, ShopifyCollection, CollectionBottomContent } from './shopify-types';

function mapMetafieldEdges(edges: any[] | undefined) {
  return (
    edges?.map((edge: any) => ({
      key: edge.node.key,
      value: edge.node.value,
      namespace: edge.node.namespace,
    })) || []
  );
}

function mapProductEdges(edges: any[]): ShopifyProduct[] {
  return edges.map((edge: any) => {
    const node = edge.node;
    return {
      id: node.id,
      title: node.title,
      handle: node.handle,
      description: node.description,
      vendor: node.vendor,
      priceRange: node.priceRange,
      featuredImage: node.featuredImage,
      images: node.images?.edges?.map((img: any) => img.node) || [],
      variants: node.variants?.edges?.map((v: any) => v.node) || [],
      tags: node.tags || [],
      metafields: mapMetafieldEdges(node.metafields?.edges),
    } as ShopifyProduct;
  });
}

export async function getProductsByQuery(query: string, limit: number = 20): Promise<ShopifyProduct[]> {
  try {
    const data = await shopifyFetch(GET_PRODUCTS_BY_QUERY, { query, first: limit });

    if (!data.products) return [];

    return mapProductEdges(data.products.edges);
  } catch (error) {
    console.error(`Error fetching products for query "${query}":`, error);
    return [];
  }
}

// Shopify caps a single `products(first:)` page at 250, so the whole catalog has to be
// paged through. Leave `limit` undefined to get every product.
const PRODUCT_PAGE_SIZE = 250;

export async function getAllProducts(limit?: number): Promise<ShopifyProduct[]> {
  const products: ShopifyProduct[] = [];
  let after: string | null = null;

  try {
    for (;;) {
      const first =
        limit === undefined
          ? PRODUCT_PAGE_SIZE
          : Math.min(PRODUCT_PAGE_SIZE, limit - products.length);
      if (first <= 0) break;

      const data = await shopifyFetch(GET_ALL_PRODUCTS, { first, after });
      const connection = data.products;
      if (!connection) break;

      products.push(
        ...connection.edges.map((edge: any) => {
          const node = edge.node;
          return {
            id: node.id,
            title: node.title,
            handle: node.handle,
            description: node.description,
            vendor: node.vendor,
            priceRange: node.priceRange,
            featuredImage: node.featuredImage,
            images: node.images?.edges?.map((img: any) => img.node) || [],
            variants: node.variants?.edges?.map((v: any) => v.node) || [],
            tags: node.tags || [],
            collections: node.collections?.edges?.map((c: any) => c.node) || [],
            metafields: mapMetafieldEdges(node.metafields?.edges),
          } as ShopifyProduct;
        })
      );

      if (!connection.pageInfo.hasNextPage) break;
      after = connection.pageInfo.endCursor;
    }
  } catch (error) {
    console.error('Error fetching all products:', error);
  }

  return products;
}

export async function getProductByHandle(handle: string): Promise<ShopifyProduct | null> {
  try {
    const data = await shopifyFetch(GET_PRODUCT_BY_HANDLE, { handle });

    if (!data.productByHandle) return null;

    const node = data.productByHandle;
    return {
      id: node.id,
      title: node.title,
      handle: node.handle,
      description: node.description,
      descriptionHtml: node.descriptionHtml,
      seo: node.seo,
      vendor: node.vendor,
      productType: node.productType,
      priceRange: node.priceRange,
      featuredImage: node.featuredImage,
      images: node.images?.edges?.map((img: any) => img.node) || [],
      variants: node.variants?.edges?.map((v: any) => v.node) || [],
      tags: node.tags || [],
      collections: node.collections?.edges?.map((c: any) => c.node) || [],
      metafields: mapMetafieldEdges(node.metafields?.edges),
    } as ShopifyProduct;
  } catch (error) {
    console.error(`Error fetching product by handle ${handle}:`, error);
    return null;
  }
}

export async function getAllCollections(limit: number = 50): Promise<ShopifyCollection[]> {
  try {
    const data = await shopifyFetch(GET_ALL_COLLECTIONS, { first: limit });

    if (!data.collections) return [];

    return data.collections.edges.map((edge: any) => {
      const node = edge.node;

      return {
        id: node.id,
        title: node.title,
        handle: node.handle,
        description: node.description,
        image: node.image,
        metafields: mapMetafieldEdges(node.metafields?.edges),
      } as ShopifyCollection;
    });
  } catch (error) {
    console.error('Error fetching all collections:', error);
    return [];
  }
}

// Every collection handle, paged. The sitemap needs all of them (there are well over the
// 250 a single request returns), and only the handle.
export async function getAllCollectionHandles(): Promise<string[]> {
  const handles: string[] = [];
  let after: string | null = null;

  try {
    for (;;) {
      const data = await shopifyFetch(GET_COLLECTION_HANDLES, { first: 250, after });
      const connection = data.collections;
      if (!connection) break;

      handles.push(...connection.nodes.map((node: any) => node.handle));
      if (!connection.pageInfo.hasNextPage) break;
      after = connection.pageInfo.endCursor;
    }
  } catch (error) {
    console.error('Error fetching collection handles:', error);
  }

  return handles;
}

export async function getCollectionByHandle(
  handle: string,
  productLimit: number = 20
): Promise<{
  collection: ShopifyCollection;
  products: ShopifyProduct[];
} | null> {
  try {
    const data = await shopifyFetch(GET_COLLECTION_BY_HANDLE, {
      handle,
      first: productLimit,
    });

    if (!data.collectionByHandle) return null;

    const node = data.collectionByHandle;
    const collection: ShopifyCollection = {
      id: node.id,
      title: node.title,
      handle: node.handle,
      description: node.description,
      seo: node.seo,
      image: node.image,
    };

    const products: ShopifyProduct[] = node.products.edges.map((edge: any) => {
      const prod = edge.node;
      return {
        id: prod.id,
        title: prod.title,
        handle: prod.handle,
        vendor: prod.vendor,
        priceRange: prod.priceRange,
        featuredImage: prod.featuredImage,
        images: [],
        variants: [],
        tags: prod.tags || [],
      } as ShopifyProduct;
    });

    return { collection, products };
  } catch (error) {
    console.error(`Error fetching collection ${handle}:`, error);
    return null;
  }
}

export async function getProductsByCollection(collectionHandle: string): Promise<ShopifyProduct[]> {
  try {
    const result = await getCollectionByHandle(collectionHandle, 100);
    return result?.products || [];
  } catch (error) {
    console.error(`Error fetching products for collection ${collectionHandle}:`, error);
    return [];
  }
}

/**
 * Products for one brand, matched against Shopify's `vendor` field.
 *
 * The brand cards on the homepage come from the `featured_brands` metaobject, whose
 * `brand_name` is matched to `vendor` here — so a brand only returns products once its
 * products carry that exact vendor in the Shopify admin.
 *
 * Vendor names contain spaces ("Western Digital"), so the value is quoted; Shopify's
 * search syntax would otherwise read the second word as a separate term.
 */
export async function getProductsByVendor(vendor: string): Promise<ShopifyProduct[]> {
  const escaped = vendor.replace(/["\\]/g, '\\$&');
  // 250 is Shopify's per-page cap. A brand with more products than that would need
  // cursor paging, which GET_PRODUCTS_BY_QUERY does not request.
  return getProductsByQuery(`vendor:"${escaped}"`, 250);
}

/**
 * Products belonging to one homepage section, for its "View All Products" link.
 *
 * Mirrors what the homepage itself does: products are tied to a section by its
 * metaobject id in the `custom.featured_products` metafield. The public URL carries the
 * readable handle instead of the gid, so the handle is resolved to an id first.
 *
 * Returns the section title too, so the products page can label the grid with
 * "Best Selling Products" rather than the handle. Null means no such section.
 */
export async function getProductsBySection(
  handle: string
): Promise<{ title: string; products: ShopifyProduct[] } | null> {
  try {
    const data = await shopifyFetch(GET_HOMEPAGE_SECTION_BY_HANDLE, {
      handle: { type: 'homepage_sections', handle },
    });

    const section = data.metaobjectByHandle;
    if (!section) return null;

    const products = await getProductsByQuery(
      `metafields.custom.featured_products:"${section.id}"`,
      250
    );

    return {
      title: section.field?.value || section.displayName || handle,
      products,
    };
  } catch (error) {
    console.error(`Error fetching products for section ${handle}:`, error);
    return null;
  }
}

export async function getProductsByTag(tag: string): Promise<ShopifyProduct[]> {
  try {
    const allProducts = await getAllProducts();
    return allProducts.filter((product) => product.tags.includes(tag));
  } catch (error) {
    console.error(`Error fetching products with tag ${tag}:`, error);
    return [];
  }
}

export async function getAllVendors(): Promise<string[]> {
  try {
    const data = await shopifyFetch(GET_VENDORS, {});

    if (!data.productVendors) return [];

    return data.productVendors.edges.map((edge: any) => edge.node);
  } catch (error) {
    console.error('Error fetching vendors:', error);
    return [];
  }
}

export async function getFeaturedProducts(limit: number = 20): Promise<ShopifyProduct[]> {
  return getProductsByQuery('metafields.custom.featured:true', limit);
}

export async function getBestSellingProducts(): Promise<ShopifyProduct[]> {
  return getProductsByTag('bestselling');
}

export async function getNewProducts(): Promise<ShopifyProduct[]> {
  return getProductsByTag('new');
}

// ─── /products grid pagination ────────────────────────────────────────────────
// Used only by the product listing page. Everything above keeps its existing
// behaviour; nothing here is on the path of the homepage, collection or detail pages.

export interface ProductsPage {
  products: ShopifyProduct[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

/** Quote a value for Shopify's search syntax, which would otherwise split on spaces. */
export function quoteQueryValue(value: string): string {
  return `"${value.replace(/["\\]/g, '\\$&')}"`;
}

/**
 * Title and body HTML of the Shopify page linked in a collection's custom.bottom_page,
 * ready to render below the product grid. The collection title is already the page's
 * <h1>, so any <h1> in the page body is demoted to <h2> - two <h1>s on one page hurt SEO.
 *
 * Undefined when no page is linked, the page has no body, or the lookup fails (reading
 * a Page needs the read_online_store_pages scope): this copy is optional, so a failure
 * hides it rather than breaking the collection.
 */
export async function getCollectionBottomContent(
  handle: string
): Promise<CollectionBottomContent | undefined> {
  try {
    const data = await shopifyFetch(GET_COLLECTION_BOTTOM_PAGE, { handle });
    const page = data?.collectionByHandle?.bottomPage?.reference;
    const html: string | undefined = page?.body?.trim();
    if (!html) return undefined;
    return {
      title: page.title?.trim() || undefined,
      html: html.replace(/<(\/?)h1\b/gi, '<$1h2'),
    };
  } catch (error) {
    console.error(`Error fetching bottom page for collection ${handle}:`, error);
    return undefined;
  }
}

/**
 * Shopify's `collection_id:` filter wants the numeric id, not the handle or the gid,
 * so the handle is resolved first. Null means no such collection.
 */
export async function getCollectionIdForHandle(handle: string): Promise<string | null> {
  try {
    const data = await shopifyFetch(GET_COLLECTION_ID, { handle });
    const gid: string | undefined = data?.collectionByHandle?.id;
    return gid ? gid.split('/').pop() ?? null : null;
  } catch (error) {
    console.error(`Error resolving collection id for ${handle}:`, error);
    return null;
  }
}

/**
 * Walk forward to the cursor sitting `offset` products into the filtered set.
 *
 * Shopify offers cursors, not offsets, so page N can only be reached by walking there.
 * The walk uses GET_PRODUCT_CURSORS, which selects no node fields, so skipping ahead
 * costs one cheap request per 250 products however heavy a product node is.
 */
async function cursorAtOffset(offset: number, query?: string): Promise<string | null> {
  let cursor: string | null = null;
  let remaining = offset;

  while (remaining > 0) {
    const first = Math.min(PRODUCT_PAGE_SIZE, remaining);
    const data = await shopifyFetch(GET_PRODUCT_CURSORS, { first, after: cursor, query });
    const connection = data?.products;
    const edges: Array<{ cursor: string }> = connection?.edges ?? [];
    if (edges.length === 0) break;

    cursor = edges[edges.length - 1].cursor;
    remaining -= edges.length;
    if (!connection.pageInfo.hasNextPage) break;
  }

  return cursor;
}

/**
 * One page of the catalogue plus the total for the whole filtered set.
 *
 * The total comes from Shopify's `productsCount`, so the grid can say "of 480" while
 * holding only the 15 products it renders. A page past the end returns an empty list
 * rather than failing; `totalPages` tells the caller what it should have asked for.
 */
export async function getProductsPage({
  page = 1,
  pageSize = 15,
  query,
}: {
  page?: number;
  pageSize?: number;
  query?: string;
}): Promise<ProductsPage> {
  const safePageSize = Math.min(Math.max(Math.trunc(pageSize) || 1, 1), PRODUCT_PAGE_SIZE);
  const safePage = Math.max(Math.trunc(page) || 1, 1);

  try {
    const countData = await shopifyFetch(GET_PRODUCTS_COUNT, { query });
    const totalCount: number = countData?.productsCount?.count ?? 0;
    const totalPages = Math.max(1, Math.ceil(totalCount / safePageSize));

    const offset = (safePage - 1) * safePageSize;
    if (offset >= totalCount) {
      return { products: [], totalCount, page: safePage, pageSize: safePageSize, totalPages };
    }

    const after = offset > 0 ? await cursorAtOffset(offset, query) : null;
    const data = await shopifyFetch(GET_PRODUCTS_PAGE, { first: safePageSize, after, query });

    return {
      products: mapProductEdges(data?.products?.edges ?? []),
      totalCount,
      page: safePage,
      pageSize: safePageSize,
      totalPages,
    };
  } catch (error) {
    console.error(`Error fetching products page ${safePage} for query "${query ?? ''}":`, error);
    return { products: [], totalCount: 0, page: safePage, pageSize: safePageSize, totalPages: 1 };
  }
}

/**
 * The Shopify query string for a homepage section, so the grid can page a section the
 * same way it pages anything else. Returns the title to label the grid with too.
 */
export async function getSectionFilter(
  handle: string
): Promise<{ title: string; query: string } | null> {
  try {
    const data = await shopifyFetch(GET_HOMEPAGE_SECTION_BY_HANDLE, {
      handle: { type: 'homepage_sections', handle },
    });

    const section = data.metaobjectByHandle;
    if (!section) return null;

    return {
      title: section.field?.value || section.displayName || handle,
      query: `metafields.custom.featured_products:${quoteQueryValue(section.id)}`,
    };
  } catch (error) {
    console.error(`Error resolving section ${handle}:`, error);
    return null;
  }
}
