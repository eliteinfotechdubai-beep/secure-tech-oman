import type { Metadata } from "next";
import { unstable_cache } from "next/cache";
import { notFound, permanentRedirect } from "next/navigation";
import { Suspense } from "react";
import { Breadcrumb } from "@/components/layout/breadcrumb";
import { JsonLd } from "@/components/seo/json-ld";
import { SITE_URL } from "@/lib/constants";
import { getCategoryTree } from "@/lib/shopify/category-tree";
import { getVendorProductCount } from "@/lib/shopify/brand-products";
import {
  buildBrandCollections,
  findBrandBySlug,
  getBrandPreview,
  getBrandSlug,
  getBrandVendor,
} from "@/components/layout/header/brand-menu-data";
import { ProductsPageClient } from "@/app/products/products-client";

// Products are edited in the Shopify admin, so the product count (which decides indexing)
// is read per request, like the collection pages.
export const dynamic = "force-dynamic";

// The category tree only feeds the description. It is one of the costliest Shopify queries
// and the footer already runs it on every page, so brand pages reuse a copy for 10 minutes
// rather than adding another full tree query to each visit.
const getCachedCategoryTree = unstable_cache(getCategoryTree, ["brand-page-category-tree"], {
  revalidate: 600,
});

type BrandPageProps = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

// The query string again, so a redirect to the canonical slug keeps tracking parameters.
function toQueryString(searchParams: Record<string, string | string[] | undefined>) {
  const query = new URLSearchParams();

  for (const [key, value] of Object.entries(searchParams)) {
    for (const item of Array.isArray(value) ? value : [value]) {
      if (item !== undefined) query.append(key, item);
    }
  }

  const text = query.toString();
  return text ? `?${text}` : "";
}

export async function generateMetadata({ params }: BrandPageProps): Promise<Metadata> {
  const { slug } = await params;
  const brand = findBrandBySlug(slug);
  // Unknown slugs 404 and alias slugs redirect, so neither needs metadata.
  if (!brand || getBrandSlug(brand) !== slug) return {};

  const vendor = getBrandVendor(brand);
  const [count, categories] = await Promise.all([
    getVendorProductCount(vendor),
    getCachedCategoryTree().catch(() => []),
  ]);

  // Shopify collection description where one is set, otherwise a sentence built from the
  // brand's categories: the same text as the Brands menu preview panel.
  const { description } = getBrandPreview(
    brand,
    new Map(),
    buildBrandCollections(categories),
    vendor
  );

  return {
    title: `${vendor} Products in Oman`,
    description,
    alternates: { canonical: `${SITE_URL}/brands/${slug}` },
    // An empty brand stays reachable from the menus but out of search results until it has
    // products. A failed count (null) keeps the default, so an outage cannot de-index a brand.
    ...(count === 0 ? { robots: { index: false, follow: true } } : {}),
  };
}

export default async function BrandPage({ params, searchParams }: BrandPageProps) {
  const { slug } = await params;
  const brand = findBrandBySlug(slug);
  if (!brand) notFound();

  // /brands/wd, /brands/Dahua and the like move permanently to the one canonical slug.
  const canonicalSlug = getBrandSlug(brand);
  if (slug !== canonicalSlug) {
    permanentRedirect(`/brands/${canonicalSlug}${toQueryString(await searchParams)}`);
  }

  const vendor = getBrandVendor(brand);

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
      { "@type": "ListItem", position: 2, name: "Products", item: `${SITE_URL}/products` },
      {
        "@type": "ListItem",
        position: 3,
        name: vendor,
        item: `${SITE_URL}/brands/${canonicalSlug}`,
      },
    ],
  };

  return (
    <>
      <JsonLd data={breadcrumbJsonLd} />
      <Breadcrumb items={[{ label: "Products", href: "/products" }, { label: vendor }]} />
      <Suspense fallback={null}>
        {/* The grid renders the visible <h1> (the brand name), so this page has no separate one. */}
        <ProductsPageClient initialBrand={vendor} />
      </Suspense>
    </>
  );
}
