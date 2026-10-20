import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  async redirects() {
    return [
      // Note: /products?collection=<handle> -> /collections/<handle> is handled in
      // src/middleware.ts instead, so the stale query param can be stripped.
      //
      // /categories/* was a separate static catalogue built on hardcoded sample data, with
      // five slugs that never existed as Shopify collections. Point each at its real
      // collection so existing links and indexed URLs keep working.
      {
        source: "/categories/storage-devices",
        destination: "/collections/storage",
        permanent: true,
      },
      {
        source: "/categories/hard-drives-ssds",
        destination: "/collections/storage",
        permanent: true,
      },
      {
        source: "/categories/servers-workstations",
        destination: "/collections/it-server-solutions",
        permanent: true,
      },
      {
        source: "/categories/accessories",
        destination: "/collections/accessories-components",
        permanent: true,
      },
      {
        source: "/categories/networking",
        destination: "/collections/networking",
        permanent: true,
      },
      // Drawing tablets have no Shopify collection at all, so send them to the full
      // catalogue rather than 404ing. Temporary, in case one is added later.
      {
        source: "/categories/drawing-tablets",
        destination: "/products",
        permanent: false,
      },
      // Anything else that was under the retired route.
      {
        source: "/categories/:slug",
        destination: "/products",
        permanent: false,
      },
    ];
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "cdn.shopify.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "*.shopifycdn.com",
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;
