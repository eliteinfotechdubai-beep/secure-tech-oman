import type { MetadataRoute } from "next";
import { allProducts } from "@/lib/data/products";
import { getAllCollectionHandles } from "@/lib/shopify/shopify-products";
import { SITE_URL } from "@/lib/constants";
// Brand pages
import { getProductVendors } from "@/lib/shopify/brand-products";
import { BRAND_NAMES, getBrandHref, getBrandVendor } from "@/components/layout/header/brand-menu-data";

const STATIC_ROUTES: Array<{ path: string; changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"]; priority: number }> = [
  { path: "/", changeFrequency: "weekly", priority: 1 },
  { path: "/products", changeFrequency: "daily", priority: 0.9 },
  { path: "/about", changeFrequency: "yearly", priority: 0.5 },
  { path: "/contact", changeFrequency: "yearly", priority: 0.5 },
  { path: "/showroom", changeFrequency: "yearly", priority: 0.5 },
  { path: "/support", changeFrequency: "yearly", priority: 0.5 },
  { path: "/wholesale", changeFrequency: "yearly", priority: 0.5 },
  { path: "/terms", changeFrequency: "yearly", priority: 0.3 },
  { path: "/privacy", changeFrequency: "yearly", priority: 0.3 },
  { path: "/shipping", changeFrequency: "yearly", priority: 0.3 },
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  const staticEntries: MetadataRoute.Sitemap = STATIC_ROUTES.map((route) => ({
    url: `${SITE_URL}${route.path}`,
    lastModified: now,
    changeFrequency: route.changeFrequency,
    priority: route.priority,
  }));

  // Only brand pages that list products: a brand is in when Shopify has products under its
  // vendor name. Empty brands are noindex, so they join once they have products and the
  // sitemap is regenerated. If Shopify cannot be reached, brand URLs are left out this time.
  const vendors = new Set(((await getProductVendors()) ?? []).map((vendor) => vendor.toLowerCase()));
  const brandEntries: MetadataRoute.Sitemap = BRAND_NAMES
    .filter((brand) => vendors.has(getBrandVendor(brand).toLowerCase()))
    .map((brand) => ({
      url: `${SITE_URL}${getBrandHref(brand)}`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.7,
    }));

  // Every Shopify collection gets a /collections/[handle] page. If Shopify is unreachable
  // this comes back empty and the sitemap is still served, just without collection URLs.
  const handles = await getAllCollectionHandles();
  const collectionEntries: MetadataRoute.Sitemap = handles.map((handle) => ({
    url: `${SITE_URL}/collections/${handle}`,
    lastModified: now,
    changeFrequency: "weekly",
    priority: 0.7,
  }));

const productEntries: MetadataRoute.Sitemap = allProducts
  .filter((product) => !/^prod-\d+$/.test(String(product.id)))
  .map((product) => ({
    url: `${SITE_URL}/products/${product.id}`,
    lastModified: now,
    changeFrequency: "weekly",
    priority: 0.6,
  }));

  return [...staticEntries, ...brandEntries, ...collectionEntries, ...productEntries];
}
