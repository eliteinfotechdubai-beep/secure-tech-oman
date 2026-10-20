export interface ShopifyImage {
  url: string;
  altText?: string;
}

export interface ShopifyPrice {
  amount: string;
  currencyCode: string;
}

export interface ShopifyPriceRange {
  minVariantPrice: ShopifyPrice;
  maxVariantPrice?: ShopifyPrice;
}

export interface ShopifyVariant {
  id: string;
  title: string;
  sku: string;
  price: string;
}

// Shopify Admin's "Search engine listing" fields. Both sides are optional and Shopify
// returns "" as readily as null when a merchant leaves them blank, so every read goes
// through resolveSeo() rather than a bare truthiness check.
export interface ShopifySeo {
  title?: string | null;
  description?: string | null;
}

export interface ShopifyMetafield {
  key: string;
  value: string;
  namespace: string;
}

export interface ShopifyCollection {
  id: string;
  title: string;
  handle: string;
  description?: string;
  seo?: ShopifySeo;
  image?: ShopifyImage;
  metafields?: Array<{
    key: string;
    value: string;
    namespace: string;
  }>;
}

// The Shopify page linked in a collection's custom.bottom_page, shown below the grid.
export interface CollectionBottomContent {
  title?: string;
  /** The page body, with any <h1> already demoted to <h2>. */
  html: string;
}

export interface ShopifyProduct {
  id: string;
  title: string;
  handle: string;
  description?: string;
  descriptionHtml?: string;
  seo?: ShopifySeo;
  vendor?: string;
  productType?: string;
  priceRange: ShopifyPriceRange;
  featuredImage?: ShopifyImage;
  images: ShopifyImage[];
  variants: ShopifyVariant[];
  tags: string[];
  collections?: ShopifyCollection[];
  metafields?: ShopifyMetafield[];
}

export interface HeroBanner {
  id: string;
  image: string;
  alt: string;
  order: number;
}

export interface SideBanner {
  id: string;
  image: string;
  alt: string;
  href: string;
  order: number;
}

export interface PromoBanner {
  name: string;
  image: string;
  href: string;
  alt?: string;
  order: number;
}

export interface SubBanner {
  id: string;
  image: string;
  title: string;
  order: number;
}

export interface SiteSettings {
  siteName: string;
  tagline?: string;
  siteUrl: string;
  phone?: string;
  email?: string;
  address?: string;
  facebook?: string;
  instagram?: string;
  linkedin?: string;
}
