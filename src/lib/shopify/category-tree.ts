import { shopifyFetch } from './shopify-client';

export interface OrganizedCategory {
  id: string;
  title: string;
  handle: string;
  description?: string;
  image?: { url: string; altText?: string } | null;
  order?: number;
  /** custom.main_category is ticked. The header nav row shows only these. */
  isMainCategory: boolean;
  subCategories: OrganizedCategory[];
}

// Hierarchy metafields (namespace "custom"):
//   child_category  – collection_reference to the IMMEDIATE parent (GID). Empty on root collections.
//   category_level  – collection_reference to the ROOT collection of the branch. Only used to flag bad data.
//   main_category   – boolean; ticked on the handful of roots that belong in the header nav row.
//   order           – optional number used for sorting siblings.
// Reading them as aliased single metafields avoids the `metafields(first: N)` list cutting them off.
const GET_COLLECTION_TREE = `
  query GetCollectionTree($first: Int!, $after: String) {
    collections(first: $first, after: $after) {
      pageInfo {
        hasNextPage
        endCursor
      }
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
          childCategory: metafield(namespace: "custom", key: "child_category") {
            value
          }
          categoryLevel: metafield(namespace: "custom", key: "category_level") {
            value
          }
          mainCategory: metafield(namespace: "custom", key: "main_category") {
            value
          }
          order: metafield(namespace: "custom", key: "order") {
            value
          }
        }
      }
    }
  }
`;

const PAGE_SIZE = 250; // Admin API maximum
const MAX_PAGES = 40; // safety cap: 10,000 collections

interface CollectionNode {
  id: string;
  title: string;
  handle: string;
  description?: string;
  image?: { url: string; altText?: string } | null;
  childCategory?: { value: string } | null;
  categoryLevel?: { value: string } | null;
  mainCategory?: { value: string } | null;
  order?: { value: string } | null;
}

export async function getCategoryTree(): Promise<OrganizedCategory[]> {
  const collections = await fetchAllCollections();
  return buildCategoryTree(collections);
}

async function fetchAllCollections(): Promise<CollectionNode[]> {
  const collections: CollectionNode[] = [];
  let after: string | null = null;

  for (let page = 0; page < MAX_PAGES; page++) {
    const data = await shopifyFetch(
      GET_COLLECTION_TREE,
      { first: PAGE_SIZE, after },
      { cache: 'no-store' }
    );
    const connection = data?.collections;
    if (!connection) break;

    collections.push(...connection.edges.map((edge: { node: CollectionNode }) => edge.node));

    if (!connection.pageInfo.hasNextPage) break;
    after = connection.pageInfo.endCursor;
  }

  return collections;
}

function buildCategoryTree(collections: CollectionNode[]): OrganizedCategory[] {
  const byId = new Map(collections.map((collection) => [collection.id, collection]));
  const childrenByParentId = new Map<string, CollectionNode[]>();
  const roots: CollectionNode[] = [];

  for (const collection of collections) {
    const parentId = collection.childCategory?.value?.trim();

    if (!parentId) {
      roots.push(collection);
      continue;
    }

    if (!byId.has(parentId)) {
      // Parent is deleted, unpublished, or the reference is wrong – nothing to attach it to.
      console.warn(
        `[category-tree] "${collection.title}" (${collection.id}) references missing parent ${parentId}; skipped.`
      );
      continue;
    }

    const siblings = childrenByParentId.get(parentId) ?? [];
    siblings.push(collection);
    childrenByParentId.set(parentId, siblings);
  }

  // Each collection has at most one parent, so walking down from the roots can never loop.
  // Collections caught in a reference cycle are simply unreachable and reported below.
  const visited = new Set<string>();

  const toCategory = (collection: CollectionNode, rootId: string): OrganizedCategory => {
    visited.add(collection.id);

    const declaredRoot = collection.categoryLevel?.value?.trim();
    if (declaredRoot && collection.id !== rootId && declaredRoot !== rootId) {
      console.warn(
        `[category-tree] "${collection.title}" has category_level ${declaredRoot} but sits under root ${rootId}.`
      );
    }

    const orderValue = collection.order?.value;
    const order = orderValue ? parseInt(orderValue, 10) : undefined;

    const subCategories = (childrenByParentId.get(collection.id) ?? []).map((child) =>
      toCategory(child, rootId)
    );
    sortByOrder(subCategories);

    return {
      id: collection.id,
      title: collection.title,
      handle: collection.handle,
      description: collection.description,
      image: collection.image ?? null,
      order: Number.isNaN(order) ? undefined : order,
      // Shopify stores boolean metafields as the strings "true"/"false"; unset reads as false.
      isMainCategory: collection.mainCategory?.value?.trim() === 'true',
      subCategories,
    };
  };

  const tree = roots.map((root) => toCategory(root, root.id));
  sortByOrder(tree);

  const unreachable = collections.filter(
    (collection) => !visited.has(collection.id) && byId.has(collection.childCategory?.value?.trim() ?? '')
  );
  if (unreachable.length > 0) {
    console.warn(
      `[category-tree] ${unreachable.length} collection(s) form a child_category cycle and were skipped:`,
      unreachable.map((collection) => collection.title)
    );
  }

  return tree;
}

function sortByOrder(categories: OrganizedCategory[]): void {
  categories.sort((a, b) => {
    if (a.order !== undefined && b.order !== undefined) return a.order - b.order;
    if (a.order !== undefined) return -1;
    if (b.order !== undefined) return 1;
    return a.title.localeCompare(b.title);
  });
}
