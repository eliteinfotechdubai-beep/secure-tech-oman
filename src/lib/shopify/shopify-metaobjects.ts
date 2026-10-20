import { shopifyFetch } from './shopify-client';
import { GET_METAOBJECTS } from './shopify-queries';
import type {
  HeroBanner,
  SideBanner,
  PromoBanner,
  SubBanner,
  SiteSettings,
} from './shopify-types';

interface MetaobjectField {
  key: string;
  // Shopify returns null — not "" — for a field the merchant left blank.
  value: string | null;
  reference?: {
    image?: {
      url: string;
      altText?: string;
    };
  } | null;
}

interface MetaobjectNode {
  id: string;
  type: string;
  fields: MetaobjectField[];
}

// Blank fields collapse to "" so the record matches its type. Without this a blank
// `href` reached <Link href={null}>, which throws inside next/link's formatUrl and
// takes down the whole client render — see getPromoBanners below.
function parseMetaobjectFields(fields: MetaobjectField[]): Record<string, string> {
  const result: Record<string, string> = {};
  fields.forEach((field) => {
    result[field.key] = field.reference?.image?.url || field.value || '';
  });
  return result;
}

// A blank `order` parses to NaN, and a comparator that returns NaN makes Array#sort
// leave the list in whatever order Shopify happened to return it in.
function parseOrder(value: string): number {
  const order = parseInt(value, 10);
  return Number.isNaN(order) ? 0 : order;
}

export async function getHeroBanners(): Promise<HeroBanner[]> {
  try {
    const data = await shopifyFetch(GET_METAOBJECTS, {
      type: 'hero_banner',
      first: 10,
    });

    if (!data.metaobjects) return [];

    return data.metaobjects.edges
      .map((edge: { node: MetaobjectNode }) => {
        const fields = parseMetaobjectFields(edge.node.fields);
        return {
          id: edge.node.id,
          image: fields.image,
          alt: fields.alt || '',
          order: parseOrder(fields.order),
        } as HeroBanner;
      })
      .sort((a: HeroBanner, b: HeroBanner) => a.order - b.order);
  } catch (error) {
    console.error('Error fetching hero banners:', error);
    return [];
  }
}

export async function getSideBanners(): Promise<SideBanner[]> {
  try {
    const data = await shopifyFetch(GET_METAOBJECTS, {
      type: 'side_banner',
      first: 10,
    });

    if (!data.metaobjects) return [];

    return data.metaobjects.edges
      .map((edge: { node: MetaobjectNode }) => {
        const fields = parseMetaobjectFields(edge.node.fields);
        return {
          id: edge.node.id,
          image: fields.image,
          alt: fields.alt || '',
          href: fields.href || '',
          order: parseOrder(fields.order),
        } as SideBanner;
      })
      .sort((a: SideBanner, b: SideBanner) => a.order - b.order);
  } catch (error) {
    console.error('Error fetching side banners:', error);
    return [];
  }
}

export async function getPromoBanners(): Promise<PromoBanner[]> {
  try {
    const data = await shopifyFetch(GET_METAOBJECTS, {
      type: 'promo_banner',
      first: 10,
    });

    if (!data.metaobjects) return [];

    return data.metaobjects.edges
      .map((edge: { node: MetaobjectNode }) => {
        const fields = parseMetaobjectFields(edge.node.fields);
        return {
          name: fields.name,
          image: fields.image,
          href: fields.href || '',
          alt: fields.alt || '',
          order: parseOrder(fields.order),
        } as PromoBanner;
      })
      .sort((a: PromoBanner, b: PromoBanner) => a.order - b.order);
  } catch (error) {
    console.error('Error fetching promo banners:', error);
    return [];
  }
}

export async function getSubBanners(): Promise<SubBanner[]> {
  try {
    const data = await shopifyFetch(GET_METAOBJECTS, {
      type: 'sub_banner',
      first: 10,
    });

    if (!data.metaobjects) return [];

    return data.metaobjects.edges
      .map((edge: { node: MetaobjectNode }) => {
        const fields = parseMetaobjectFields(edge.node.fields);
        return {
          id: fields.id,
          image: fields.image,
          title: fields.title || '',
          order: parseOrder(fields.order),
        } as SubBanner;
      })
      .sort((a: SubBanner, b: SubBanner) => a.order - b.order);
  } catch (error) {
    console.error('Error fetching sub banners:', error);
    return [];
  }
}

export async function getSiteSettings(): Promise<SiteSettings | null> {
  try {
    const data = await shopifyFetch(GET_METAOBJECTS, {
      type: 'site_settings',
      first: 1,
    });

    if (!data.metaobjects || data.metaobjects.edges.length === 0) return null;

    const fields = parseMetaobjectFields(data.metaobjects.edges[0].node.fields);

    return {
      siteName: fields.siteName || 'Elite Store',
      tagline: fields.tagline,
      siteUrl: fields.siteUrl,
      phone: fields.phone,
      email: fields.email,
      address: fields.address,
      facebook: fields.facebook,
      instagram: fields.instagram,
      linkedin: fields.linkedin,
    };
  } catch (error) {
    console.error('Error fetching site settings:', error);
    return null;
  }
}
