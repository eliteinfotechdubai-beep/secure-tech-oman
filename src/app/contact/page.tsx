import type { Metadata } from "next";
import { Breadcrumb } from "@/components/layout/breadcrumb";
import { CONTACT, SITE_NAME, SITE_URL } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Contact Us",
  description: `Get in touch with ${SITE_NAME} for product questions, wholesale pricing, or support.`,
  alternates: { canonical: `${SITE_URL}/contact` },
};

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Contact" }]} />
      <div className="mx-auto max-w-3xl px-8 lg:px-28 py-12">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Contact Us</h1>
        <div className="space-y-4 text-gray-700 leading-relaxed">
          <p>
            Our team is available to help with product questions, wholesale pricing, and order support.
            Reach out using any of the details below.
          </p>
          <dl className="space-y-2">
            <div>
              <dt className="font-semibold text-gray-900 inline">Sales &amp; Support: </dt>
              <dd className="inline">{CONTACT.phone}</dd>
            </div>
            <div>
              <dt className="font-semibold text-gray-900 inline">Request a Quote: </dt>
              <dd className="inline">{CONTACT.phone}</dd>
            </div>
            <div>
              <dt className="font-semibold text-gray-900 inline">Email: </dt>
              <dd className="inline">
                <a href={`mailto:${CONTACT.email}`} className="text-brand-700 hover:underline">
                  {CONTACT.email}
                </a>
              </dd>
            </div>
          </dl>
        </div>
      </div>
    </div>
  );
}
