export type BrandCategory =
  | "storage"
  | "drives"
  | "networking"
  | "servers"
  | "other";

export type Brand = {
  id: string;
  name: string;
  wordmarkClassName: string;
  category: BrandCategory;
  image?: string;
};

export type ProductBadge = "In Stock" | "Pre-Order" | "New";
export type ProductFeature = "bestselling" | "featured";

export type DriveVisual = {
  brand: string;
  series: [string, string];
  capacity: string;
  chassisFrom: string;
  chassisTo: string;
  labelBg: string;
  labelBgTo?: string;
  labelText: string;
  brandText: string;
  accentFrom: string;
  accentTo: string;
  bandBg: string;
  bandText: string;
  style: "stripe" | "swoosh" | "plain";
};

export type SimpleVisual = {
  kind: "tablet" | "server" | "monitor" | "filter" | "camera";
  brand: string;
  model: string;
  chassisFrom: string;
  chassisTo: string;
  accentFrom: string;
  accentTo: string;
};

export type Product = {
  id: string;
  name: string;
  category: string;
  badge: ProductBadge;
  icon: "nas" | "drive" | "server" | "tablet" | "network" | "monitor" | "filter" | "camera";
  visual?: DriveVisual;
  simpleVisual?: SimpleVisual;
  description?: string;
  descriptionHtml?: string;
  stock?: number;
  liveViewers?: number;
  sku?: string;
  barcode?: string;
  productType?: string;
  vendor?: string;
  images?: string[];
  features?: ProductFeature[];
};
