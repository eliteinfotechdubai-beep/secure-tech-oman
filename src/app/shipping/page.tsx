import type { Metadata } from "next";
import { Breadcrumb } from "@/components/layout/breadcrumb";
import { CONTACT, SITE_NAME, SITE_URL } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Shipping & Cancellation",
  description: `Shipping timelines and order cancellation policy for ${SITE_NAME}.`,
  alternates: { canonical: `${SITE_URL}/shipping` },
};

export default function ShippingPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Shipping & Cancellation" }]} />
      <div className="mx-auto max-w-3xl px-8 lg:px-28 py-12">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Shipping &amp; Cancellation</h1>
        <div className="space-y-4 text-gray-700 leading-relaxed">
          <p>
            <span className="font-semibold text-gray-900">Shipping: </span>
            Lead times depend on stock availability and order size — in-stock items typically ship within a
            few business days of order confirmation. Our team will provide an estimated delivery window when
            your quote is confirmed.
          </p>
          <p>
            <span className="font-semibold text-gray-900">Cancellations: </span>
            Orders can be cancelled free of charge before they ship. Once an order has shipped, standard
            return terms apply based on the manufacturer&apos;s policy.
          </p>
          <p>
            For an order status update, contact us at {CONTACT.phone} or{" "}
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
