import type { Metadata } from "next";
import { Breadcrumb } from "@/components/layout/breadcrumb";
import { CONTACT, SITE_DESCRIPTION, SITE_NAME, SITE_URL } from "@/lib/constants";

export const metadata: Metadata = {
  title: "About Us",
  description: SITE_DESCRIPTION,
  alternates: { canonical: `${SITE_URL}/about` },
};

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "About Us" }]} />
      <div className="mx-auto max-w-3xl px-8 lg:px-28 py-12">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">About {SITE_NAME}</h1>
        <div className="space-y-4 text-gray-700 leading-relaxed">
          <p>{SITE_DESCRIPTION}</p>
          <p>
            We work directly with corporates, resellers, and system integrators to source enterprise-grade
            storage, networking, and surveillance hardware, backed by wholesale pricing and dedicated
            request-for-quote support for bulk and project orders.
          </p>
          <p>
            Have a question about a product or a bulk order? Reach us at{" "}
            <a href={`mailto:${CONTACT.email}`} className="text-brand-700 hover:underline">
              {CONTACT.email}
            </a>{" "}
            or {CONTACT.phone}.
          </p>
        </div>
      </div>
    </div>
  );
}
