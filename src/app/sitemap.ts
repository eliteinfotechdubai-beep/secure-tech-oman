import type { MetadataRoute } from "next";
import { allProducts } from "@/lib/data/products";
import { getAllCollectionHandles } from "@/lib/shopify/shopify-products";
import { SITE_URL } from "@/lib/constants";

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

  return [...staticEntries, ...collectionEntries, ...productEntries];
}
