import { shopifyFetch } from '@/lib/shopify/shopify-client';
import { NO_CACHE_HEADERS } from '@/lib/http/no-cache';

// Featured brands are edited in the Shopify admin and must show up immediately, so this
// route stays out of the build-time prerender, the ISR cache and the Data Cache.
export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

const GET_FEATURED_BRANDS = `
  query {
    metaobjects(type: "featured_brands", first: 100) {
      edges {
        node {
          id
          fields {
            key
            value
            reference {
              ... on MediaImage {
                image {
                  url
                }
              }
            }
          }
        }
      }
    }
  }
`;

export async function GET() {
  try {
    const response = await shopifyFetch(GET_FEATURED_BRANDS, {}, { cache: 'no-store' });

    if (!response.metaobjects || !response.metaobjects.edges) {
      return Response.json(
        { success: false, error: 'No metaobjects found' },
        { status: 404, headers: NO_CACHE_HEADERS }
      );
    }

    // Parse brands
    const brands = response.metaobjects.edges.map((edge: any) => {
      const fieldsMap = new Map<string, any>(
        edge.node.fields.map((f: any) => [f.key, f])
      );

      const name = fieldsMap.get('brand_name')?.value;
      const link = fieldsMap.get('brand_link')?.value;

      return {
        category: fieldsMap.get('category')?.value || 'Uncategorized',
        name,
        image: fieldsMap.get('brand_image')?.reference?.image?.url || null,
        logo: fieldsMap.get('brand_logo')?.reference?.image?.url || null,
        // brand_name drives the link so every card lands on that brand's products.
        // brand_link is only a fallback for a metaobject with no brand_name, because
        // the links set in the admin today point at the unfiltered /products page.
        href: name ? `/products?brand=${encodeURIComponent(name)}` : link || '#',
        order: parseInt(fieldsMap.get('display_order')?.value || '0'),
      };
    });

    // Group by category
    const grouped = brands.reduce((acc: any[], brand: any) => {
      const categoryIndex = acc.findIndex(c => c.category === brand.category);
      const { category, ...brandData } = brand;

      if (categoryIndex === -1) {
        acc.push({ category, brands: [brandData] });
      } else {
        acc[categoryIndex].brands.push(brandData);
      }

      return acc;
    }, []);

    // Sort brands within each category by order
    grouped.forEach((cat: any) => {
      cat.brands.sort((a: any, b: any) => a.order - b.order);
    });

    return Response.json({ success: true, data: grouped }, { headers: NO_CACHE_HEADERS });
  } catch (error) {
    console.error('Error fetching featured brands:', error);
    return Response.json(
      { success: false, error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500, headers: NO_CACHE_HEADERS }
    );
  }
}
