import type { NextConfig } from "next";

// Old URLs that now 404, each matched to the live Shopify page for the same product,
// or to the closest collection where the product or collection is no longer stocked.
const RETIRED_URLS: Array<[source: string, destination: string]> = [
  ["/collections/storage-huawei-enterprise-storage", "/collections/storage"],
  ["/collections/storage-huawei-ssd-storage", "/collections/storage"],
  ["/collections/storage-uniarch-flash-memory", "/collections/storage"],
  ["/collections/storage-unv-surveillance-hard-drives", "/collections/storage"],
  ["/products/cctv-dhi-lm22-4", "/products/dahua-dhi-lm22-l200n-cctv-monitor"],
  ["/products/cctv-dhi-lm22-5", "/products/dahua-dhi-lm22-l200n-cctv-monitor"],
  ["/products/cctv-dhi-lm22-8", "/products/dahua-dhi-lm22-l200n-cctv-monitor"],
  ["/products/dh-cs4006-4gt-60", "/products/dahua-dh-cs4006-4gt-60-poe-switch"],
  ["/products/dh-cs4010-8et2gt-110", "/products/dahua-dh-cs4010-8et2gt-110-poe-switch"],
  ["/products/imou-ipc-k2mp-5h1we", "/products/imou-ipc-k2mp-5h1we-5mp-wifi-security-camera"],
  ["/products/imou-ipc-ps3dp-5m0", "/products/imou-ipc-ps3dp-5m0-0280b-v-5mp-poe-bullet-security-camera"],
  ["/products/imou-ipc-ps5ep-3v0", "/products/imou-ipc-ps5ep-3v0-3mp-poe-outdoor-security-camera"],
  ["/products/imou-ipc-ps8ep-5v0", "/collections/cctv-security-cameras-imou-poe-cameras"],
  ["/products/imou-nvr-n110-8a0e", "/products/imou-nvr-n110-8a0e-10-channel-4k-wired-nvr"],
  ["/products/imou-wifi-asl-cub-1", "/products/imou-asl-cubo1-k-d-smart-lock-fingerprint-wi-fi"],
];

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
      ...RETIRED_URLS.map(([source, destination]) => ({ source, destination, permanent: true })),
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
