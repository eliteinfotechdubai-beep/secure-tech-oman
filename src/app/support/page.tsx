import type { Metadata } from "next";
import { Breadcrumb } from "@/components/layout/breadcrumb";
import { CONTACT, SITE_NAME, SITE_URL } from "@/lib/constants";

export const metadata: Metadata = {
  title: "RMA / Support Portal",
  description: `Request a return, replacement, or technical support from ${SITE_NAME}.`,
  alternates: { canonical: `${SITE_URL}/support` },
};

export default function SupportPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "RMA / Support Portal" }]} />
      <div className="mx-auto max-w-3xl px-8 lg:px-28 py-12">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">RMA / Support Portal</h1>
        <div className="space-y-4 text-gray-700 leading-relaxed">
          <p>
            Need a return, replacement, or technical support for a product you purchased from {SITE_NAME}?
            Our support team will confirm your warranty status and next steps.
          </p>
          <p>
            <span className="font-semibold text-gray-900">Support line: </span>
            {CONTACT.phone}
          </p>
          <p>
            <span className="font-semibold text-gray-900">Email: </span>
            <a href={`mailto:${CONTACT.email}`} className="text-brand-700 hover:underline">
              {CONTACT.email}
            </a>
          </p>
          <p>Please include your order or SKU number so we can look up your product faster.</p>
        </div>
      </div>
    </div>
  );
}
