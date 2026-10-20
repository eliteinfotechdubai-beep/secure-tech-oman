import { shopifyFetch } from '@/lib/shopify/shopify-client';
import { NO_CACHE_HEADERS } from '@/lib/http/no-cache';

// Homepage sections are edited in the Shopify admin and must show up immediately, so this
// route stays out of the build-time prerender, the ISR cache and the Data Cache.
export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

const GET_HOMEPAGE_SECTIONS = `
  query {
    metaobjects(type: "homepage_sections", first: 50) {
      edges {
        node {
          id
          handle
          fields {
            key
            value
          }
        }
      }
    }
  }
`;

export interface HomePageSection {
  id: string;
  title: string;
  type: string;
  handle: string;
  order: number;
  description?: string;
  active: boolean;
}

export async function GET() {
  try {
    const response = await shopifyFetch(GET_HOMEPAGE_SECTIONS, {}, { cache: 'no-store' });

    if (!response.metaobjects || !response.metaobjects.edges) {
      return Response.json({
        success: false,
        error: 'No homepage sections found',
        data: []
      }, { status: 404, headers: NO_CACHE_HEADERS });
    }

    // Parse sections
    const sections = response.metaobjects.edges.map((edge: any) => {
      const fieldsMap = new Map(
        edge.node.fields.map((f: any) => [f.key, f.value])
      );

      const orderValue = fieldsMap.get('order');

      return {
        id: edge.node.id,
        title: fieldsMap.get('title'),
        type: fieldsMap.get('type'),
        // The metaobject's own handle ("best-selling-products"), which is what the
        // "View All Products" links use. There is no `handle` field on the metaobject
        // definition, so reading one from fieldsMap always came back undefined.
        handle: edge.node.handle ?? fieldsMap.get('handle'),
        order: Number.parseInt(String(orderValue ?? '0'), 10),
        description: fieldsMap.get('description'),
        active: String(fieldsMap.get('active')) === 'true',
      } as HomePageSection;
    });

    // Sort by order
    sections.sort((a:any, b:any) => a.order - b.order);

    return Response.json({
      success: true,
      data: sections
    }, { headers: NO_CACHE_HEADERS });
  } catch (error) {
    console.error('Error fetching homepage sections:', error);
    return Response.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      data: []
    }, { status: 500, headers: NO_CACHE_HEADERS });
  }
}
