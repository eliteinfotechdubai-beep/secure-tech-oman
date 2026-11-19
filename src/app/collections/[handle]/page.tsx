import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { Breadcrumb, type BreadcrumbItem } from "@/components/layout/breadcrumb";
import { SITE_URL } from "@/lib/constants";
import { findCategoryPath, getCategoryTree } from "@/lib/shopify/category-tree";
import { getCollectionBottomContent, getCollectionByHandle } from "@/lib/shopify/shopify-products";
import { seoDescription, seoTitle } from "@/lib/shopify/resolve-seo";
import { ProductsPageClient } from "@/app/products/products-client";

// Collections are created and renamed in the Shopify admin, so resolve the handle per
// request rather than prerendering a fixed list that would go stale.
export const dynamic = "force-dynamic";

// Only the collection itself is needed here (title, description); the grid loads its own
// products client-side, so ask Shopify for the smallest product page it will accept.
async function loadCollection(handle: string) {
  const result = await getCollectionByHandle(handle, 1);
  return result?.collection ?? null;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ handle: string }>;
}): Promise<Metadata> {
  const { handle } = await params;
  const collection = await loadCollection(handle);
  if (!collection) return {};

  // A merchant-written SEO description is already snippet-length and deliberate, so it is
  // used whole; only the raw collection body copy still gets truncated.
  return {
    title: seoTitle(collection.seo, collection.title),
    description: seoDescription(
      collection.seo,
      collection.description?.trim().slice(0, 160),
      `Shop ${collection.title} at Secure Tech Oman — browse our full range and request a wholesale quote.`,
    ),
    alternates: { canonical: `${SITE_URL}/collections/${handle}` },
  };
}

export default async function CollectionPage({
  params,
}: {
  params: Promise<{ handle: string }>;
}) {
  const { handle } = await params;
  const [collection, bottomContent, categoryTree] = await Promise.all([
    loadCollection(handle),
    getCollectionBottomContent(handle),
    // The cached tree the footer and menus already use: no extra Shopify request.
    getCategoryTree().catch(() => null),
  ]);
  if (!collection) notFound();

  // Home / Root / Group / Leaf from the category tree. A collection outside the tree, or a
  // tree that could not be loaded, falls back to Home / Products / Collection.
  const categoryPath = categoryTree ? findCategoryPath(categoryTree, handle) : null;
  const breadcrumbItems: BreadcrumbItem[] = categoryPath
    ? categoryPath.map((category, index) => ({
        // The page's own title for the last step, so it matches the heading exactly.
        label: index === categoryPath.length - 1 ? collection.title : category.title,
        href: `/collections/${category.handle}`,
      }))
    : [
        { label: "Products", href: "/products" },
        { label: collection.title, href: `/collections/${handle}` },
      ];

  return (
    <>
      <Breadcrumb items={breadcrumbItems} />
      <Suspense fallback={null}>
        {/* The grid renders the visible <h1> from these, so this page has no separate one. */}
        <ProductsPageClient
          initialCollection={handle}
          initialCollectionTitle={collection.title}
          initialCollectionDescription={collection.description}
          initialCollectionBottomContent={bottomContent}
        />
      </Suspense>
    </>
  );
}
