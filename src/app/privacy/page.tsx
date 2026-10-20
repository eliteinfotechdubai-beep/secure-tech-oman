import type { Metadata } from "next";
import { Breadcrumb } from "@/components/layout/breadcrumb";
import { CONTACT, SITE_NAME, SITE_URL } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: `How ${SITE_NAME} collects, uses, and protects your information.`,
  alternates: { canonical: `${SITE_URL}/privacy` },
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Privacy Policy" }]} />
      <div className="mx-auto max-w-3xl px-8 lg:px-28 py-12">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Privacy Policy</h1>
        <div className="space-y-4 text-gray-700 leading-relaxed">
          <p>
            {SITE_NAME} collects the information you provide when requesting a quote or contacting us —
            such as your name, email, phone number, and company details — solely to respond to your
            request and process orders.
          </p>
          <p>
            <span className="font-semibold text-gray-900">We do not sell your information</span> to third
            parties. Information is shared only with the shipping and payment providers needed to fulfil an
            order.
          </p>
          <p>
            You can request access to, correction of, or deletion of your information at any time by
            emailing{" "}
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
