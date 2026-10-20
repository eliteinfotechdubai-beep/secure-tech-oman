import type { ShopifyProduct } from "@/lib/shopify/shopify-types";
import type { Product, ProductBadge } from "@/lib/data/types";

function badgeFromTags(tags: string[]): ProductBadge {
  const normalized = tags.map((tag) => tag.toLowerCase());
  if (normalized.some((tag) => tag === "new")) return "New";
  if (normalized.some((tag) => tag.includes("pre-order") || tag.includes("preorder"))) return "Pre-Order";
  return "In Stock";
}

// Merchants write the whole write-up (intro, Key Features, Technical Specifications, ...)
// as one rich-text description in Shopify Admin. This pulls just the intro — everything
// before the first heading — for use as the short teaser/SEO description.
function shortDescriptionFrom(descriptionHtml: string | undefined, fallback: string | undefined): string | undefined {
  if (!descriptionHtml) return fallback;

  const intro = descriptionHtml
    .split(/<h[1-6][^>]*>/i)[0]
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  return intro || fallback;
}

export function toDisplayProduct(product: ShopifyProduct): Product {
  const images = product.images.length > 0
    ? product.images.map((image) => image.url)
    : product.featuredImage
      ? [product.featuredImage.url]
      : [];

  return {
    id: product.handle,
    name: product.title,
    category: product.vendor || "Featured",
    badge: badgeFromTags(product.tags),
    icon: "drive",
    description: shortDescriptionFrom(product.descriptionHtml, product.description),
    descriptionHtml: product.descriptionHtml,
    sku: product.variants[0]?.sku,
    vendor: product.vendor,
    productType: product.productType,
    images,
  };
}
