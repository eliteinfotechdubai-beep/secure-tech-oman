export const dynamic = 'force-dynamic';

export async function GET() {
  return Response.json({
    hasStoreName: !!process.env.SHOPIFY_STORE_NAME,
    hasAdminKey: !!process.env.SHOPIFY_ADMIN_API_KEY,
    hasStorefrontKey: !!process.env.SHOPIFY_STOREFRONT_API_KEY,
    nodeEnv: process.env.NODE_ENV || null,
  });
}
