// Brand data and preview logic shared by the desktop Brands mega menu (category-nav.tsx)
// and the phone Brands section (mobile-menu.tsx).
import { SITE_NAME } from "@/lib/constants";

// All 28 brands.
export const BRAND_NAMES = [
  "Hikvision",
  "Dahua",
  "UNV",
  "Ezviz",
  "IMOU",
  "Uniarch",
  "Ubiquiti",
  "Ruijie",
  "TP Link",
  "Grandstream",
  "Huawei",
  "Cudy",
  "Mercusys",
  "Seagate",
  "WD",
  "Toshiba",
  "Kingston",
  "SanDisk",
  "Lexar",
  "Fyber",
  "Tapo",
  "Ring",
  "Eufy",
  "Anker",
  "Soundcore",
  "Garmin",
  "Haing",
  "Teklo",
];

// Display name to Shopify vendor mapping.
const BRAND_VENDOR_NAMES: Record<string, string> = {
  WD: "Western Digital",
};

// Display name to logo filename mapping.
const BRAND_LOGO_FILES: Record<string, string> = {
  "TP Link": "tp-link.webp",
  WD: "wd.webp",
};

// Return logo file path.
export function getBrandLogo(brand: string) {
  const filename =
    BRAND_LOGO_FILES[brand] ??
    `${brand.toLowerCase().replace(/\s+/g, "-")}.webp`;

  return `/brands/${filename}`;
}

// Brand shown in the desktop preview panel when the Brands menu opens.
export const DEFAULT_PREVIEW_BRAND = "IMOU";

// Brand entry from the existing /api/featured-brands route (Shopify metaobject).
export type FeaturedBrand = {
  name?: string;
  image?: string | null;
};

// Name a brand's image is stored under in Shopify's featured_brands, where it differs.
const BRAND_IMAGE_NAMES: Record<string, string> = {
  Haing: "Hang",
};

// Existing brand banners in public/assets, used only when Shopify has no image for the brand.
const BRAND_LOCAL_IMAGES: Record<string, string> = {
  SanDisk: "/assets/hardware5.jpeg",
  Lexar: "/assets/hardware6.jpeg",
  Huawei: "/assets/network4.jpeg",
};

// Brand-specific collection, e.g. "IMOU" under "Smart Home".
export type BrandCollection = {
  rootTitle: string;
  handle: string;
  description?: string;
};

// The part of a /api/collections/organized category the brand preview reads.
export type BrandSourceCategory = {
  title: string;
  handle: string;
  description?: string;
  subCategories?: BrandSourceCategory[];
};

// Normalise names so "TP-Link" matches "TP Link" and "kingston" matches "Kingston".
export function brandKey(name: string) {
  return name.toLowerCase().replace(/[^a-z0-9]/g, "");
}

// Existing product listing for a brand.
export function getBrandHref(brand: string) {
  const vendor = BRAND_VENDOR_NAMES[brand] ?? brand;

  return `/products?brand=${encodeURIComponent(vendor)}`;
}

// Loads the featured_brands entries; an empty list when the route fails.
export async function fetchFeaturedBrands(): Promise<FeaturedBrand[]> {
  const response = await fetch("/api/featured-brands");
  const data = response.ok ? await response.json() : null;
  const groups: { brands?: FeaturedBrand[] }[] = data?.data ?? [];

  return groups.flatMap((group) => group.brands ?? []);
}

// Brand image by normalised name.
export function buildBrandImages(featuredBrands: FeaturedBrand[] | null) {
  const images = new Map<string, string>();

  for (const brand of featuredBrands ?? []) {
    if (brand.name && brand.image) {
      images.set(brandKey(brand.name), brand.image);
    }
  }

  return images;
}

// Brand-specific collections by normalised brand name.
export function buildBrandCollections(categories: BrandSourceCategory[]) {
  const collections = new Map<string, BrandCollection[]>();

  for (const root of categories) {
    for (const child of root.subCategories ?? []) {
      const key = brandKey(child.title);
      const list = collections.get(key) ?? [];

      list.push({
        rootTitle: root.title,
        handle: child.handle,
        description: child.description,
      });

      collections.set(key, list);
    }
  }

  return collections;
}

// Preview panel content for a brand, matched by display name or Shopify vendor name.
export function getBrandPreview(
  brand: string,
  brandImages: Map<string, string>,
  brandCollections: Map<string, BrandCollection[]>
) {
  const keys = [
    brandKey(brand),
    brandKey(BRAND_VENDOR_NAMES[brand] ?? brand),
  ];

  const collections =
    keys
      .map((key) => brandCollections.get(key))
      .find((list) => list && list.length > 0) ?? [];

  const imageKeys = BRAND_IMAGE_NAMES[brand]
    ? [...keys, brandKey(BRAND_IMAGE_NAMES[brand])]
    : keys;

  const image =
    imageKeys
      .map((key) => brandImages.get(key))
      .find(Boolean) ?? BRAND_LOCAL_IMAGES[brand];

  const categoryTitles = [
    ...new Set(collections.map((item) => item.rootTitle)),
  ];

  // Shopify collection description when one is set, otherwise a summary of the brand's categories.
  const description =
    collections
      .find((item) => item.description?.trim())
      ?.description?.trim() ??
    (categoryTitles.length === 0
      ? `Browse all ${brand} products available at ${SITE_NAME}.`
      : categoryTitles.length > 3
        ? `Shop ${brand} ${categoryTitles.slice(0, 3).join(", ")} and more at ${SITE_NAME}.`
        : `Shop ${brand} ${categoryTitles
            .join(", ")
            .replace(/, ([^,]*)$/, " and $1")} at ${SITE_NAME}.`);

  return { image, description };
}
