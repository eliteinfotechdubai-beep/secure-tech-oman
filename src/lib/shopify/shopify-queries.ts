export const GET_ALL_PRODUCTS = `
  query GetAllProducts($first: Int!, $after: String) {
    products(first: $first, after: $after) {
      edges {
        node {
          id
          title
          handle
          description
          vendor
          collections(first: 5) {
            edges {
              node {
                id
                title
                handle
              }
            }
          }
          priceRange {
            minVariantPrice {
              amount
              currencyCode
            }
            maxVariantPrice {
              amount
              currencyCode
            }
          }
          featuredImage {
            url
            altText
          }
          images(first: 5) {
            edges {
              node {
                url
                altText
              }
            }
          }
          variants(first: 5) {
            edges {
              node {
                id
                title
                sku
                price
              }
            }
          }
          tags
          metafields(first: 20) {
            edges {
              node {
                key
                value
                namespace
              }
            }
          }
        }
      }
      pageInfo {
        hasNextPage
        endCursor
      }
    }
  }
`;

export const GET_PRODUCTS_BY_QUERY = `
  query GetProductsByQuery($query: String!, $first: Int!) {
    products(first: $first, query: $query) {
      edges {
        node {
          id
          title
          handle
          description
          vendor
          priceRange {
            minVariantPrice {
              amount
              currencyCode
            }
            maxVariantPrice {
              amount
              currencyCode
            }
          }
          featuredImage {
            url
            altText
          }
          images(first: 5) {
            edges {
              node {
                url
                altText
              }
            }
          }
          variants(first: 5) {
            edges {
              node {
                id
                title
                sku
                price
              }
            }
          }
          tags
          metafields(first: 20) {
            edges {
              node {
                key
                value
                namespace
              }
            }
          }
        }
      }
    }
  }
`;

export const GET_PRODUCT_BY_HANDLE = `
  query GetProductByHandle($handle: String!) {
    productByHandle(handle: $handle) {
      id
      title
      handle
      description
      descriptionHtml
      seo {
        title
        description
      }
      vendor
      productType
      priceRange {
        minVariantPrice {
          amount
          currencyCode
        }
      }
      featuredImage {
        url
        altText
      }
      images(first: 10) {
        edges {
          node {
            url
            altText
          }
        }
      }
      variants(first: 10) {
        edges {
          node {
            id
            title
            sku
            price
          }
        }
      }
      tags
      collections(first: 5) {
        edges {
          node {
            id
            title
            handle
          }
        }
      }
      metafields(first: 20) {
        edges {
          node {
            key
            value
            namespace
          }
        }
      }
    }
  }
`;

export const GET_ALL_COLLECTIONS = `
  query GetAllCollections($first: Int!) {
    collections(first: $first) {
      edges {
        node {
          id
          title
          handle
          description
          image {
            url
            altText
          }
          metafields(first: 10) {
            edges {
              node {
                key
                value
                namespace
              }
            }
          }
          products(first: 20) {
            edges {
              node {
                id
                title
                handle
                priceRange {
                  minVariantPrice {
                    amount
                  }
                }
                featuredImage {
                  url
                  altText
                }
              }
            }
            pageInfo {
              hasNextPage
            }
          }
        }
      }
    }
  }
`;

export const GET_COLLECTION_BY_HANDLE = `
  query GetCollectionByHandle($handle: String!, $first: Int!) {
    collectionByHandle(handle: $handle) {
      id
      title
      handle
      description
      seo {
        title
        description
      }
      image {
        url
        altText
      }
      products(first: $first) {
        edges {
          node {
            id
            title
            handle
            vendor
            priceRange {
              minVariantPrice {
                amount
                currencyCode
              }
            }
            featuredImage {
              url
              altText
            }
            tags
          }
        }
      }
    }
  }
`;

export const GET_METAOBJECTS = `
  query GetMetaobjects($type: String!, $first: Int!) {
    metaobjects(type: $type, first: $first) {
      edges {
        node {
          id
          type
          fields {
            key
            value
            reference {
              ... on MediaImage {
                image {
                  url
                  altText
                }
              }
            }
          }
        }
      }
    }
  }
`;

export const GET_VENDORS = `
  query GetVendors {
    productVendors(first: 100) {
      edges {
        node
      }
    }
  }
`;

// Handle-only listing for the sitemap. GET_ALL_COLLECTIONS returns no endCursor, so it
// cannot page past its first batch; this one can.
export const GET_COLLECTION_HANDLES = `
  query GetCollectionHandles($first: Int!, $after: String) {
    collections(first: $first, after: $after) {
      pageInfo {
        hasNextPage
        endCursor
      }
      nodes {
        handle
      }
    }
  }
`;

/**
 * One page of products for the /products grid.
 *
 * Deliberately leaner than GET_ALL_PRODUCTS: it asks only for what `toDisplayProduct`
 * and ProductCard actually render, so the grid stops shipping prices, collections and
 * metafields it never shows.
 *
 * `query` carries whatever filter the grid has active - vendor:"...", collection_id:...,
 * a metafield match or a raw search term - so one paginated path serves all of them.
 * Sorted by title so a page number means the same thing between requests; Shopify's
 * default product order is not stable enough to page through.
 */
export const GET_PRODUCTS_PAGE = `
  query GetProductsPage($first: Int!, $after: String, $query: String) {
    products(first: $first, after: $after, query: $query, sortKey: TITLE) {
      edges {
        node {
          id
          title
          handle
          description
          vendor
          productType
          tags
          featuredImage {
            url
            altText
          }
          images(first: 5) {
            edges {
              node {
                url
                altText
              }
            }
          }
          variants(first: 1) {
            edges {
              node {
                sku
              }
            }
          }
        }
      }
      pageInfo {
        hasNextPage
        endCursor
      }
    }
  }
`;

/**
 * Cursor-only walk used to turn a page offset into a Shopify cursor.
 *
 * Shopify pages by cursor, not offset, so reaching page N means walking there. Asking
 * for no node fields keeps that walk cheap however heavy the products are - it returns
 * cursors and nothing else.
 */
export const GET_PRODUCT_CURSORS = `
  query GetProductCursors($first: Int!, $after: String, $query: String) {
    products(first: $first, after: $after, query: $query, sortKey: TITLE) {
      pageInfo {
        hasNextPage
        endCursor
      }
      edges {
        cursor
      }
    }
  }
`;

// Total for the filtered set, so the grid can show "of 480" while holding only 15.
export const GET_PRODUCTS_COUNT = `
  query GetProductsCount($query: String) {
    productsCount(query: $query) {
      count
    }
  }
`;

// Numeric collection id for a handle, for use as `collection_id:` in a products query.
export const GET_COLLECTION_ID = `
  query GetCollectionId($handle: String!) {
    collectionByHandle(handle: $handle) {
      id
    }
  }
`;

// Body of the Shopify page linked in a collection's custom.bottom_page, shown below the
// product grid. Kept out of the other collection queries: resolving a Page needs the
// read_online_store_pages scope, and an access error here must not take the whole
// collection down with it.
export const GET_COLLECTION_BOTTOM_PAGE = `
  query GetCollectionBottomPage($handle: String!) {
    collectionByHandle(handle: $handle) {
      bottomPage: metafield(namespace: "custom", key: "bottom_page") {
        reference {
          ... on Page {
            title
            body
          }
        }
      }
    }
  }
`;

// Resolves a homepage_sections metaobject handle ("best-selling-products") to its id.
// Products are linked to a section by that id in custom.featured_products, so the id is
// what the product search needs — but the id is a gid and makes for an ugly public URL.
export const GET_HOMEPAGE_SECTION_BY_HANDLE = `
  query GetHomepageSectionByHandle($handle: MetaobjectHandleInput!) {
    metaobjectByHandle(handle: $handle) {
      id
      handle
      displayName
      field(key: "title") {
        value
      }
    }
  }
`;
