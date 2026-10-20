import type { Metadata } from "next";
import { Suspense } from "react";
import { Breadcrumb } from "@/components/layout/breadcrumb";
import { JsonLd } from "@/components/seo/json-ld";
import { SITE_URL } from "@/lib/constants";
import { ProductsPageClient } from "./products-client";

export const metadata: Metadata = {
  title: "Shop All Products",
  description:
    "Browse NAS storage, hard drives, SSDs, servers, networking gear, surveillance cameras and more from Secure Tech Oman's full product catalog.",
  alternates: { canonical: `${SITE_URL}/products` },
};

const breadcrumbJsonLd = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
    { "@type": "ListItem", position: 2, name: "Products", item: `${SITE_URL}/products` },
  ],
};

export default function ProductsPage() {
  return (
    <>
      <h1 className="sr-only">Shop All Products</h1>
      <JsonLd data={breadcrumbJsonLd} />
      <Breadcrumb items={[{ label: "Products", href: "/products" }]} />
      <Suspense fallback={null}>
        <ProductsPageClient />
      </Suspense>
    </>
  );
}
