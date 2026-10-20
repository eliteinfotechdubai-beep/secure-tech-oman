import type { Metadata } from "next";
import { Breadcrumb } from "@/components/layout/breadcrumb";

export const metadata: Metadata = {
  title: "Wishlist",
  robots: { index: false, follow: false },
};

export default function WishlistPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Wishlist" }]} />
      <div className="mx-auto max-w-3xl px-8 lg:px-28 py-12">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Wishlist</h1>
        <p className="text-gray-700">Your wishlist is empty. Browse products and save your favorites here.</p>
      </div>
    </div>
  );
}
