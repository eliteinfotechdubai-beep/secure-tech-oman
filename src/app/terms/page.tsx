import type { Metadata } from "next";
import { Breadcrumb } from "@/components/layout/breadcrumb";
import { CONTACT, SITE_NAME, SITE_URL } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Terms & Conditions",
  description: `Terms and conditions for purchasing and requesting quotes from ${SITE_NAME}.`,
  alternates: { canonical: `${SITE_URL}/terms` },
};

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Terms & Conditions" }]} />
      <div className="mx-auto max-w-3xl px-8 lg:px-28 py-12">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Terms &amp; Conditions</h1>
        <div className="space-y-4 text-gray-700 leading-relaxed">
          <p>
            These terms govern quote requests and orders placed with {SITE_NAME}. By requesting a quote or
            placing an order, you agree to the terms below.
          </p>
          <p>
            <span className="font-semibold text-gray-900">Quotes: </span>
            Pricing shown via the &quot;Request For Quote&quot; flow is an estimate and is confirmed in writing
            before an order is placed. Stock levels are subject to change until an order is confirmed.
          </p>
          <p>
            <span className="font-semibold text-gray-900">Orders: </span>
            Orders are confirmed once payment terms are agreed with our sales team. Product specifications are
            provided by the manufacturer and may change without notice.
          </p>
          <p>
            <span className="font-semibold text-gray-900">Warranty: </span>
            All products carry the manufacturer&apos;s standard warranty unless otherwise stated in writing.
          </p>
          <p>
            Questions about these terms? Contact us at{" "}
            <a href={`mailto:${CONTACT.email}`} className="text-brand-700 hover:underline">
              {CONTACT.email}
            </a>
            .
          </p>
        </div>
      </div>
    </div>
  );
}
