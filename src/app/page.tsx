
import { Fragment } from "react";
import type { Metadata } from "next";
import { GET as getHomepageSections, type HomePageSection } from "@/app/api/homepage-sections/route";
import { getProductsByQuery } from "@/lib/shopify/shopify-products";
import { toDisplayProduct } from "@/lib/shopify/to-display-product";
import { Hero } from "@/components/homepage/hero/hero";
import { MarqueeStrip } from "@/components/homepage/marquee-strip/marquee-strip";
import { ShopByCategory } from "@/components/homepage/shop-by-category/shop-by-category";
import { ProductSection } from "@/components/homepage/product-section/product-section";
import { PromoBanners } from "@/components/homepage/promo-banners/promo-banners";
import { FeaturedProducts } from "@/components/homepage/featured-products/featured-products";
import { SITE_URL } from "@/lib/constants";

const seoTitle =
  "IT Hardware & Security Solutions Supplier | Secure Tech Oman";

const seoDescription =
  "Secure Tech Oman supplies IT hardware, CCTV cameras, NAS storage, HDDs, SSDs and networking products for businesses, resellers and system integrators in Oman.";

export const metadata: Metadata = {
  title: {
    absolute: seoTitle,
  },
  description: seoDescription,
  alternates: {
    canonical: `${SITE_URL}/`,
  },
  openGraph: {
    type: "website",
    siteName: "Secure Tech Oman",
    title: seoTitle,
    description: seoDescription,
    url: `${SITE_URL}/`,
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: seoTitle,
    description: seoDescription,
  },
};

export default async function HomePage() {
  const homepageSectionsRes = await getHomepageSections();
  const homepageSectionsJson = await homepageSectionsRes.json();
  const activeSections: HomePageSection[] = (homepageSectionsJson.data ?? []).filter(
    (section: HomePageSection) => section.active
  );

  const sections = await Promise.all(
    activeSections.map(async (section) => {
      const sectionProducts = await getProductsByQuery(
        `metafields.custom.featured_products:"${section.id}"`,
        20
      );
      return { section, products: sectionProducts.map(toDisplayProduct) };
    })
  );

  const featuredSection = sections.find(({ section }) => section.title === "Featured Products");
  const otherSections = sections.filter(({ section }) => section.title !== "Featured Products");

  return (
    <>
      <h1 className="sr-only">
        Secure Tech Oman — IT Hardware, Storage, Networking &amp; Surveillance Solutions
      </h1>
      <Hero />
      <MarqueeStrip />
      <ShopByCategory />
      {otherSections.map(({ section, products }, index) => (
        <Fragment key={section.id}>
          <ProductSection
            title={section.title}
            description={section.description ?? ""}
            products={products}
            href={section.handle ? `/products?section=${encodeURIComponent(section.handle)}` : "/products"}
            index={index}
          />
          {index === 0 && <PromoBanners limit={3} offset={0} columns={3} />}
          {index === 1 && (
            <>
              {featuredSection && <FeaturedProducts products={featuredSection.products} />}
              <PromoBanners limit={2} offset={3} />
            </>
          )}
        </Fragment>
      ))}
    </>
  );
}
