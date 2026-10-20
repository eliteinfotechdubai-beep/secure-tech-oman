import type { Metadata } from "next";
import { Breadcrumb } from "@/components/layout/breadcrumb";
import { CONTACT, SITE_NAME, SITE_URL } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Our Showroom",
  description: `Visit the ${SITE_NAME} showroom to see our storage, networking, and surveillance hardware in person.`,
  alternates: { canonical: `${SITE_URL}/showroom` },
};

export default function ShowroomPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Our Showroom" }]} />
      <div className="mx-auto max-w-3xl px-8 lg:px-28 py-12">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Our Showroom</h1>
        <div className="space-y-4 text-gray-700 leading-relaxed">
          <p>
            Prefer to see hardware before you buy? Visit our showroom to browse live demo units of NAS
            enclosures, hard drives, servers, networking gear, and surveillance cameras, and talk through
            your project with our team in person.
          </p>
          <p>
            <span className="font-semibold text-gray-900">Address: </span>
            {CONTACT.addressLine1}, {CONTACT.addressLine2}
          </p>
          <p>
            <span className="font-semibold text-gray-900">Call ahead: </span>
            {CONTACT.phone}
          </p>
        </div>
      </div>
    </div>
  );
}
