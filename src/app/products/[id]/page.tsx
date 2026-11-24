import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { cache } from "react";
import { Breadcrumb, type BreadcrumbItem } from "@/components/layout/breadcrumb";
import { JsonLd } from "@/components/seo/json-ld";
import { pickProductImage } from "@/lib/product-image";
import {
  getAllProductsShared,
  getProductByHandle as fetchProductByHandle,
} from "@/lib/shopify/shopify-products";
import { toDisplayProduct } from "@/lib/shopify/to-display-product";
import { findDeepestCategoryPath, getCategoryTree } from "@/lib/shopify/category-tree";
import { seoDescription, seoTitle, seoTitleText } from "@/lib/shopify/resolve-seo";
import { SITE_URL } from "@/lib/constants";
import { ProductDetailClient } from "./product-detail-client";

// generateMetadata and the page both need the product; one Shopify request per page view.
const getProductByHandle = cache(fetchProductByHandle);

// No generateStaticParams: the root layout renders every page per request (see
// category-sitemap.tsx), so the build threw away all ~742 product prerenders anyway — after
// spending thousands of Shopify requests on them and throttling the API bucket the live site
// shares. Every handle is rendered on demand, exactly as it already was in production.

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const shopifyProduct = await getProductByHandle(id);
  if (!shopifyProduct) {
    return { title: "Product Not Found" };
  }

  const product = toDisplayProduct(shopifyProduct);
  const image = pickProductImage(product.images);

  // The merchant's "Search engine listing" fields win where they are filled in; everything
  // below falls back to the on-page name and description, so products nobody has touched
  // in the admin keep exactly the metadata they had before.
  const { seo } = shopifyProduct;
  const description = seoDescription(
    seo,
    product.description,
    `${product.name} — available from Secure Tech Oman. Request a quote today.`,
  );

  return {
    title: seoTitle(seo, product.name),
    description,
    alternates: { canonical: `${SITE_URL}/products/${product.id}` },
    openGraph: {
      title: seoTitleText(seo, product.name),
      description,
      url: `${SITE_URL}/products/${product.id}`,
      ...(image ? { images: [{ url: image }] } : {}),
    },
  };
}

export default async function ProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const shopifyProduct = await getProductByHandle(id);
  if (!shopifyProduct) {
    notFound();
  }

  const product = toDisplayProduct(shopifyProduct);

  // Related products: other products from the same vendor (products without a vendor get none).
  const vendor = shopifyProduct.vendor?.trim().toLowerCase();
  // Shared catalogue copy (see getAllProductsShared); on failure the page shows no related
  // products, as before.
  const allProducts = vendor
    ? await getAllProductsShared().catch((error) => {
        console.error("Error fetching related products:", error);
        return [];
      })
    : [];
  const relatedProducts = allProducts
    .filter((p) => p.handle !== id && p.vendor?.trim().toLowerCase() === vendor)
    .slice(0, 6)
    .map(toDisplayProduct);

  const image = pickProductImage(product.images);

  const productJsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description,
    ...(image ? { image: image.startsWith("http") ? image : `${SITE_URL}${image}` } : {}),
    sku: product.sku || product.id,
    category: product.category,
    ...(product.vendor ? { brand: { "@type": "Brand", name: product.vendor } } : {}),
    ...(product.badge === "In Stock"
      ? { offers: { "@type": "Offer", availability: "https://schema.org/InStock", url: `${SITE_URL}/products/${product.id}` } }
      : {}),
  };

  // Home / Root / Group / Leaf / Product from the product's most specific collection in the
  // cached category tree (no extra Shopify request: the product query already returns its
  // collections). Products in no collection, or a tree that could not be loaded, keep
  // Home / Products / Product.
  const categoryTree = await getCategoryTree().catch(() => null);
  const categoryPath = categoryTree
    ? findDeepestCategoryPath(
        categoryTree,
        (shopifyProduct.collections ?? []).map((collection) => collection.handle)
      )
    : null;
  const breadcrumbItems: BreadcrumbItem[] = [
    ...(categoryPath
      ? categoryPath.map((category) => ({
          // Short labels: each step already sits under its parent ("Recorders & NVR / IMOU").
          label: category.menuTitle,
          href: `/collections/${category.handle}`,
        }))
      : [{ label: "Products", href: "/products" }]),
    { label: product.name, href: `/products/${product.id}` },
  ];

  return (
    <>
      <JsonLd data={productJsonLd} />
      <Breadcrumb items={breadcrumbItems} />
      <ProductDetailClient product={product} relatedProducts={relatedProducts} />
    </>
  );
}
