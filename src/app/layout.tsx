import type { Metadata } from "next";
import { Figtree, Outfit } from "next/font/google";
import { GoogleAnalytics } from "@next/third-parties/google";
import "./globals.css";
import { TopBar } from "@/components/layout/header/top-bar";
import { SiteHeader } from "@/components/layout/header/site-header";
import { CategoryNav } from "@/components/layout/header/category-nav";
import { BrandStrip } from "@/components/homepage/brand-strip/brand-strip";
import { Footer } from "@/components/layout/footer/footer";
import { ProductChatWidget } from "@/components/common/product-chat-widget";
import { JsonLd } from "@/components/seo/json-ld";
import { GA_MEASUREMENT_ID, SITE_DESCRIPTION, SITE_NAME, SITE_URL } from "@/lib/constants";

const figtree = Figtree({
  variable: "--font-figtree",
  subsets: ["latin"],
  style: ["normal", "italic"],
});

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: SITE_NAME,
    template: `%s | ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  keywords: [
    "IT hardware distributor",
    "NAS storage",
    "hard drives",
    "SSD",
    "networking equipment",
    "servers",
    "surveillance cameras",
    "computer hardware retailer",
  ],
  openGraph: {
    type: "website",
    siteName: SITE_NAME,
    title: SITE_NAME,
    description: SITE_DESCRIPTION,
    url: SITE_URL,
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_NAME,
    description: SITE_DESCRIPTION,
  },
  robots: {
    index: true,
    follow: true,
  },
  verification: {
    google: "aeZ0CcRuGQMzkL-BSCpaahq5wutoF02DTd1LKTuOFwU",
  },
};

const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: SITE_NAME,
  url: SITE_URL,
  description: SITE_DESCRIPTION,
};

const websiteJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: SITE_NAME,
  url: SITE_URL,
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${figtree.variable} ${outfit.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col" suppressHydrationWarning>
        <JsonLd data={organizationJsonLd} />
        <JsonLd data={websiteJsonLd} />
        <TopBar />
        <SiteHeader />
        <CategoryNav />
        <main className="flex-1">{children}</main>
        <BrandStrip />
        <Footer />
        <ProductChatWidget />
        {GA_MEASUREMENT_ID && <GoogleAnalytics gaId={GA_MEASUREMENT_ID} />}
      </body>
    </html>
  );
}
