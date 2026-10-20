import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Breadcrumb } from "@/components/layout/breadcrumb";
import { JsonLd } from "@/components/seo/json-ld";
import { pickProductImage } from "@/lib/product-image";
import { getAllProducts, getProductByHandle } from "@/lib/shopify/shopify-products";
import { toDisplayProduct } from "@/lib/shopify/to-display-product";
import { seoDescription, seoTitle, seoTitleText } from "@/lib/shopify/resolve-seo";
import { SITE_URL } from "@/lib/constants";
import { ProductDetailClient } from "./product-detail-client";

export async function generateStaticParams() {
  const products = await getAllProducts();
  return products.map((product) => ({ id: product.handle }));
}

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
  const allProducts = vendor ? await getAllProducts() : [];
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

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
      { "@type": "ListItem", position: 2, name: "Products", item: `${SITE_URL}/products` },
      { "@type": "ListItem", position: 3, name: product.name, item: `${SITE_URL}/products/${product.id}` },
    ],
  };

  return (
    <>
      <JsonLd data={productJsonLd} />
      <JsonLd data={breadcrumbJsonLd} />
      <Breadcrumb
        items={[{ label: "Home", href: "/" }, { label: "Products", href: "/products" }, { label: product.name }]}
      />
      <ProductDetailClient product={product} relatedProducts={relatedProducts} />
    </>
  );
}
