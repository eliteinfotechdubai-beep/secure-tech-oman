import type { Metadata } from "next";
import type { ShopifySeo } from "./shopify-types";

// Shopify leaves the "Search engine listing" fields as null when untouched, but hands back
// "" once a merchant has opened and cleared them — so blank has to be normalised away
// before any fallback chain, or an empty override would win over a good default.
function clean(value: string | null | undefined): string | undefined {
  const trimmed = value?.trim();
  return trimmed || undefined;
}

/**
 * The page title to hand Next.js, given the merchant's SEO title and the on-page name.
 *
 * A merchant writing an SEO title almost always includes the brand themselves ("... — Best
 * Price in Oman"), so applying the root layout's `%s | ${SITE_NAME}` template on top would
 * double it. Those bypass the template; the untouched fallback keeps it.
 */
export function seoTitle(seo: ShopifySeo | undefined, fallback: string): Metadata["title"] {
  const title = clean(seo?.title);
  return title ? { absolute: title } : fallback;
}

/** The merchant's SEO description, or the first non-blank fallback after it. */
export function seoDescription(
  seo: ShopifySeo | undefined,
  ...fallbacks: (string | null | undefined)[]
): string | undefined {
  return [seo?.description, ...fallbacks].map(clean).find(Boolean);
}

/**
 * The plain string form of the title, for og:title — OpenGraph has no template to bypass,
 * so it takes the resolved text rather than the `{ absolute }` wrapper.
 */
export function seoTitleText(seo: ShopifySeo | undefined, fallback: string): string {
  return clean(seo?.title) ?? fallback;
}
