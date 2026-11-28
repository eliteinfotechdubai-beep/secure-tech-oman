import { unstable_cache } from 'next/cache';
import { shopifyFetch } from './shopify-client';

export interface CategoryRef {
  id: string;
  title: string;
  handle: string;
}

export interface OrganizedCategory {
  id: string;
  /** Full Shopify title: page headings, SEO titles and the current breadcrumb step. */
  title: string;
  /**
   * Label for menus, the footer, filters and intermediate breadcrumbs, where the parent
   * category is already shown. Brand collections titled "<Brand> <Parent>" (e.g. "IMOU
   * Recorders & NVR" under "Recorders & NVR") get just the brand ("IMOU"); every other
   * collection, and brand collections still titled with the bare brand, use the title.
   */
  menuTitle: string;
  handle: string;
  description?: string;
  image?: { url: string; altText?: string } | null;
  order?: number;
  /** custom.main_category is ticked. The header nav row shows only these. */
  isMainCategory: boolean;
  /** Resolved custom.parent_categories references, deduped by id. See file header. */
  parentCategories: CategoryRef[];
  /** Resolved custom.child_categories references, deduped by id. See file header. */
  childCategories: CategoryRef[];
  subCategories: OrganizedCategory[];
}

// Hierarchy metafields (namespace "custom"), both type list.collection_reference:
//   child_categories  – despite the name, this points upward: the collection's own
//                        immediate-parent reference(s) (e.g. a brand pointing up to the
//                        root(s) it sits under, or a sub-collection pointing up to its
//                        merged brand). This is the ONLY field used to place a collection
//                        under a parent - it is never a stored list of downward children.
//   parent_categories – the broader root(s) a collection ultimately belongs to. NOT used
//                        for placement: it's a scope tag, checked only when deciding
//                        whether a child_categories hit belongs in a SPECIFIC root's
//                        branch (see toCategory). A brand can belong under more than one
//                        root, but that doesn't mean every one of its own collections
//                        belongs under every one of those roots too - parent_categories is
//                        what keeps e.g. a brand's access-control line out of its
//                        appearance under a security-camera root.
//   main_category     – boolean; ticked on the handful of roots that belong in the header
//                        nav row.
//   order             – optional number used for sorting siblings.
// Downward "children" don't exist as a field - they're derived by reversing child_categories
// across every collection, then scoping each branch by parent_categories (see
// buildCategoryTree). Both reference fields are read via `references(first: N)`, the
// connection Shopify exposes for metafields whose type is a resource reference list.
const GET_COLLECTION_TREE = `
  query GetCollectionTree($first: Int!, $after: String, $refFirst: Int!) {
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
          parentCategories: metafield(namespace: "custom", key: "parent_categories") {
            references(first: $refFirst) {
              nodes {
                ... on Collection {
                  id
                  title
                  handle
                }
              }
              pageInfo {
                hasNextPage
                endCursor
              }
            }
          }
          childCategories: metafield(namespace: "custom", key: "child_categories") {
            references(first: $refFirst) {
              nodes {
                ... on Collection {
                  id
                  title
                  handle
                }
              }
              pageInfo {
                hasNextPage
                endCursor
              }
            }
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

// Follow-up query for a single collection's reference list, used only when the first page
// (fetched above) reports more pages - keeps a long parent_categories/child_categories list
// from being silently capped at REFERENCE_PAGE_SIZE.
const GET_COLLECTION_REFERENCE_OVERFLOW = `
  query GetCollectionReferenceOverflow(
    $collectionId: ID!
    $namespace: String!
    $key: String!
    $first: Int!
    $after: String
  ) {
    collection(id: $collectionId) {
      metafield(namespace: $namespace, key: $key) {
        references(first: $first, after: $after) {
          nodes {
            ... on Collection {
              id
              title
              handle
            }
          }
          pageInfo {
            hasNextPage
            endCursor
          }
        }
      }
    }
  }
`;

const PAGE_SIZE = 250; // Admin API maximum, outer collections connection
const MAX_PAGES = 40; // safety cap: 10,000 collections
const REFERENCE_PAGE_SIZE = 50; // per-collection reference-list page size
const MAX_REFERENCE_PAGES = 10; // safety cap per collection per field: 500 references

interface ReferenceConnection {
  nodes: CategoryRef[];
  pageInfo: { hasNextPage: boolean; endCursor: string | null };
}

interface RawCollectionNode {
  id: string;
  title: string;
  handle: string;
  description?: string;
  image?: { url: string; altText?: string } | null;
  parentCategories?: { references: ReferenceConnection } | null;
  childCategories?: { references: ReferenceConnection } | null;
  mainCategory?: { value: string } | null;
  order?: { value: string } | null;
}

interface CollectionNode {
  id: string;
  title: string;
  handle: string;
  description?: string;
  image?: { url: string; altText?: string } | null;
  parentCategories: CategoryRef[];
  childCategories: CategoryRef[];
  mainCategory?: { value: string } | null;
  order?: { value: string } | null;
}

// The footer (every page), /api/collections/organized (header, mobile menu, category nav,
// product grid) and brand metadata all need this tree. Building it fresh for each of them
// spent ~136 Shopify points several times per page view and got the site THROTTLED, so one
// copy is shared for 5 minutes: admin edits to categories show up within that time.
const CATEGORY_TREE_REVALIDATE_SECONDS = 300;

// The key is versioned with the tree's shape: a copy cached before this version existed is
// never served to code that reads it. Bumped to v3 for the parent_categories/child_categories
// metafield migration - a v2 copy cached from the old single-reference schema must never
// leak into the few minutes after this deploys.
const getCachedCategoryTree = unstable_cache(
  async () => buildCategoryTree(await fetchAllCollections()),
  ['category-tree-v3'],
  { revalidate: CATEGORY_TREE_REVALIDATE_SECONDS, tags: ['category-tree'] }
);

// The last tree this server built, served if Shopify is briefly unavailable.
let lastGoodTree: OrganizedCategory[] | null = null;

export async function getCategoryTree(): Promise<OrganizedCategory[]> {
  try {
    const tree = await getCachedCategoryTree();
    lastGoodTree = tree;
    return tree;
  } catch (error) {
    if (lastGoodTree) {
      console.warn('[category-tree] Shopify request failed; serving the last good tree.', error);
      return lastGoodTree;
    }
    throw error;
  }
}

/** Root-to-collection path for `handle`, or null when the collection is not in the tree. */
export function findCategoryPath(
  tree: OrganizedCategory[],
  handle: string
): OrganizedCategory[] | null {
  for (const node of tree) {
    if (node.handle === handle) return [node];
    const below = findCategoryPath(node.subCategories, handle);
    if (below) return [node, ...below];
  }
  return null;
}

/**
 * The deepest path among a product's collections: its most specific category. Products sit
 * in one root > group > leaf chain, so this is the leaf; on a tie the first collection wins.
 */
export function findDeepestCategoryPath(
  tree: OrganizedCategory[],
  handles: string[]
): OrganizedCategory[] | null {
  let deepest: OrganizedCategory[] | null = null;
  for (const handle of handles) {
    const path = findCategoryPath(tree, handle);
    if (path && (!deepest || path.length > deepest.length)) deepest = path;
  }
  return deepest;
}

async function fetchAllCollections(): Promise<CollectionNode[]> {
  const rawNodes: RawCollectionNode[] = [];
  let after: string | null = null;

  for (let page = 0; page < MAX_PAGES; page++) {
    const data = await shopifyFetch(
      GET_COLLECTION_TREE,
      { first: PAGE_SIZE, after, refFirst: REFERENCE_PAGE_SIZE },
      { cache: 'no-store' }
    );
    const connection = data?.collections;
    if (!connection) break;

    rawNodes.push(...connection.edges.map((edge: { node: RawCollectionNode }) => edge.node));

    if (!connection.pageInfo.hasNextPage) break;
    after = connection.pageInfo.endCursor;
  }

  return Promise.all(
    rawNodes.map(async (node) => ({
      id: node.id,
      title: node.title,
      handle: node.handle,
      description: node.description,
      image: node.image ?? null,
      parentCategories: await resolveReferenceList(node.id, 'parent_categories', node.parentCategories),
      childCategories: await resolveReferenceList(node.id, 'child_categories', node.childCategories),
      mainCategory: node.mainCategory,
      order: node.order,
    }))
  );
}

async function resolveReferenceList(
  collectionId: string,
  key: 'parent_categories' | 'child_categories',
  field: { references: ReferenceConnection } | null | undefined
): Promise<CategoryRef[]> {
  if (!field?.references) return [];

  const nodes = [...field.references.nodes];
  let hasNextPage = field.references.pageInfo.hasNextPage;
  let endCursor = field.references.pageInfo.endCursor;
  let pages = 0;

  while (hasNextPage && pages < MAX_REFERENCE_PAGES) {
    const data = await shopifyFetch(
      GET_COLLECTION_REFERENCE_OVERFLOW,
      { collectionId, namespace: 'custom', key, first: REFERENCE_PAGE_SIZE, after: endCursor },
      { cache: 'no-store' }
    );
    const connection = data?.collection?.metafield?.references;
    if (!connection) break;

    nodes.push(...connection.nodes);
    hasNextPage = connection.pageInfo.hasNextPage;
    endCursor = connection.pageInfo.endCursor;
    pages++;
  }

  if (hasNextPage) {
    console.warn(
      `[category-tree] "${key}" on collection ${collectionId} has more than ${MAX_REFERENCE_PAGES * REFERENCE_PAGE_SIZE} references; the rest were truncated.`
    );
  }

  return nodes;
}

function dedupeRefs(refs: CategoryRef[]): CategoryRef[] {
  const seen = new Set<string>();
  return refs.filter((ref) => {
    if (seen.has(ref.id)) return false;
    seen.add(ref.id);
    return true;
  });
}

function buildCategoryTree(collections: CollectionNode[]): OrganizedCategory[] {
  const byId = new Map(collections.map((collection) => [collection.id, collection]));

  // child_categories is the ONLY field that places a collection under a parent - it's the
  // upward link to the collection's immediate structural parent(s) (see file header).
  // parent_categories is never used for placement here; it's a root-scope tag, checked only
  // inside toCategory() to decide whether a node belongs in a SPECIFIC root's rendered
  // branch. Without that check, a brand's collections from an unrelated root (e.g. a
  // security brand's access-control line) would leak into every root the brand itself
  // belongs to.
  const upwardIds = new Map<string, string[]>();
  for (const collection of collections) {
    const seen = new Set<string>();
    const ids: string[] = [];

    for (const ref of collection.childCategories) {
      if (ref.id === collection.id) {
        console.warn(
          `[category-tree] "${collection.title}" (${collection.id}) references itself in child_categories; skipped.`
        );
        continue;
      }
      if (!byId.has(ref.id)) {
        console.warn(
          `[category-tree] "${collection.title}" (${collection.id}) references missing collection ${ref.id} in child_categories; skipped.`
        );
        continue;
      }
      if (seen.has(ref.id)) continue;
      seen.add(ref.id);
      ids.push(ref.id);
    }

    upwardIds.set(collection.id, ids);
  }

  // Reverse the upward links into a downward map. A collection can now have more than one
  // parent, so it can be added under more than one entry here.
  const childrenByParentId = new Map<string, string[]>();
  const roots: CollectionNode[] = [];

  for (const collection of collections) {
    const parentIds = upwardIds.get(collection.id) ?? [];
    if (parentIds.length === 0) {
      roots.push(collection);
      continue;
    }
    for (const parentId of parentIds) {
      const siblings = childrenByParentId.get(parentId) ?? [];
      siblings.push(collection.id);
      childrenByParentId.set(parentId, siblings);
    }
  }

  // The same collection can legitimately appear in more than one branch now, so cycle
  // detection tracks the ancestor chain of the CURRENT branch rather than every collection
  // seen anywhere in the tree - a global "visited once" set would incorrectly hide a
  // multi-parent collection from its second and later branches.
  const renderedIds = new Set<string>();
  // Every id considered as a child of some parent, before the parent_categories scope
  // filter runs - used below to tell a true orphan apart from a collection that's linked
  // via child_categories but whose parent_categories never matches any branch it's in.
  const candidateIds = new Set<string>();

  // `parentTitle` is set only for a root's direct children: the brand level.
  const toCategory = (
    collection: CollectionNode,
    rootId: string,
    ancestorIds: ReadonlySet<string>,
    parentTitle?: string
  ): OrganizedCategory | null => {
    if (ancestorIds.has(collection.id)) {
      console.warn(
        `[category-tree] "${collection.title}" (${collection.id}) forms a cycle; skipped in this branch.`
      );
      return null;
    }

    renderedIds.add(collection.id);
    const nextAncestors = new Set(ancestorIds);
    nextAncestors.add(collection.id);

    const orderValue = collection.order?.value;
    const order = orderValue ? parseInt(orderValue, 10) : undefined;

    const isRoot = collection.id === rootId;
    const childIds = childrenByParentId.get(collection.id) ?? [];
    const subCategories = childIds
      .map((childId) => byId.get(childId)!)
      .filter((child) => {
        candidateIds.add(child.id);
        // Scope to the active root: a collection can be a valid child_categories hit here
        // and still belong to a different root's branch (see file header comment above).
        return child.parentCategories.some((ref) => ref.id === rootId);
      })
      .map((child) => toCategory(child, rootId, nextAncestors, isRoot ? collection.title : undefined))
      .filter((category): category is OrganizedCategory => category !== null);
    sortByOrder(subCategories);

    return {
      id: collection.id,
      title: collection.title,
      menuTitle: parentTitle ? withoutParentSuffix(collection.title, parentTitle) : collection.title,
      handle: collection.handle,
      description: collection.description,
      image: collection.image ?? null,
      order: Number.isNaN(order) ? undefined : order,
      // Shopify stores boolean metafields as the strings "true"/"false"; unset reads as false.
      isMainCategory: collection.mainCategory?.value?.trim() === 'true',
      parentCategories: dedupeRefs(collection.parentCategories),
      childCategories: dedupeRefs(collection.childCategories),
      subCategories,
    };
  };

  const tree = roots
    .map((root) => toCategory(root, root.id, new Set()))
    .filter((category): category is OrganizedCategory => category !== null);
  sortByOrder(tree);

  const trueOrphans = collections.filter(
    (collection) => !renderedIds.has(collection.id) && !candidateIds.has(collection.id)
  );
  if (trueOrphans.length > 0) {
    console.warn(
      `[category-tree] ${trueOrphans.length} collection(s) are unreachable from any root (cycle, or all child_categories references were invalid):`,
      trueOrphans.map((collection) => collection.title)
    );
  }

  const scopeMismatches = collections.filter(
    (collection) => candidateIds.has(collection.id) && !renderedIds.has(collection.id)
  );
  if (scopeMismatches.length > 0) {
    console.warn(
      `[category-tree] ${scopeMismatches.length} collection(s) are linked via child_categories but never render anywhere, because their parent_categories doesn't match any root they're linked under:`,
      scopeMismatches.map((collection) => collection.title)
    );
  }

  return tree;
}

/**
 * "IMOU Recorders & NVR" under "Recorders & NVR" -> "IMOU". A title that does not end with
 * " <parent>" (case ignored), or would be left empty, is returned unchanged.
 */
export function withoutParentSuffix(title: string, parentTitle: string): string {
  const trimmed = title.trim();
  const suffix = ` ${parentTitle.trim()}`;

  if (suffix.length > 1 && trimmed.toLowerCase().endsWith(suffix.toLowerCase())) {
    const brand = trimmed.slice(0, -suffix.length).trim();
    if (brand) return brand;
  }

  return title;
}

function sortByOrder(categories: OrganizedCategory[]): void {
  categories.sort((a, b) => {
    if (a.order !== undefined && b.order !== undefined) return a.order - b.order;
    if (a.order !== undefined) return -1;
    if (b.order !== undefined) return 1;
    return a.title.localeCompare(b.title);
  });
}
