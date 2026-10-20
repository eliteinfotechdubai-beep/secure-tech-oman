import type { Metadata } from "next";
import { Breadcrumb } from "@/components/layout/breadcrumb";
import { CONTACT, SITE_NAME, SITE_URL } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Request for Wholesale",
  description: `Wholesale and bulk-order pricing from ${SITE_NAME} for resellers and system integrators.`,
  alternates: { canonical: `${SITE_URL}/wholesale` },
};

export default function WholesalePage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Request for Wholesale" }]} />
      <div className="mx-auto max-w-3xl px-8 lg:px-28 py-12">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Request for Wholesale</h1>
        <div className="space-y-4 text-gray-700 leading-relaxed">
          <p>
            We offer wholesale pricing on storage, networking, server, and surveillance hardware for
            resellers, system integrators, and corporate buyers ordering in volume.
          </p>
          <p>
            To get a wholesale quote, use the &quot;Request For Quote&quot; button on any product, or contact
            our sales team directly with your company details and the quantities you need.
          </p>
          <p>
            <span className="font-semibold text-gray-900">Wholesale enquiries: </span>
            {CONTACT.phone} —{" "}
            <a href={`mailto:${CONTACT.email}`} className="text-brand-700 hover:underline">
              {CONTACT.email}
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
