function resolveImageUrl(image: string) {
  return /^https?:\/\//.test(image) ? image : `/assets/${image}`;
}

/** All of a product's images as usable URLs; empty when it has none (render ProductImagePlaceholder instead). */
export function productImageUrls(images?: string[]): string[] {
  return images?.map(resolveImageUrl) ?? [];
}

/** The product's main image URL, or undefined when it has none (render ProductImagePlaceholder instead). */
export function pickProductImage(images?: string[]): string | undefined {
  return images && images.length > 0 ? resolveImageUrl(images[0]) : undefined;
}
