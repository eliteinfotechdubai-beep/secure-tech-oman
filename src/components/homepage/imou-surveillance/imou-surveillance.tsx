import Link from "next/link";
import { ProductCarousel } from "@/components/product/product-carousel";
import { imouProducts } from "@/lib/data/imou-products";

export function ImouSurveillance() {
  return (
    <section className="bg-white py-14">
      <div className="mx-auto px-8 lg:px-28">
        <div className="mb-6 flex items-end justify-between">
          <div>
            <h2 className="text-[24px] font-normal leading-6 tracking-[-0.5px] text-[#222222]">
              IMOU Surveillance Solutions
            </h2>
            <span className="mt-1.5 block h-0.5 w-10 bg-brand-700" />
            <p className="mt-3 text-sm text-neutral-500">
              Professional IP surveillance cameras, NVRs and security systems for comprehensive monitoring.
            </p>
          </div>
          <Link href="/products?brand=imou" className="hidden shrink-0 text-sm font-semibold text-brand-700 hover:text-brand-800 sm:block">
            View All Products
          </Link>
        </div>

        <ProductCarousel products={imouProducts} />
      </div>
    </section>
  );
}
