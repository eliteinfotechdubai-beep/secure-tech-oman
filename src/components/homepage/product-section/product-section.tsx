import Link from "next/link";
import { ProductCarousel } from "@/components/product/product-carousel";
import type { Product } from "@/lib/data/types";

interface ProductSectionProps {
  title: string;
  description: string;
  products: Product[];
  href?: string;
  index?: number;
}

export function ProductSection({ title, description, products, href = "/products", index = 0 }: ProductSectionProps) {
  return (
    <section className={`${index % 2 === 0 ? "bg-gray-100" : "bg-white"} py-10 lg:py-14`}>
      <div className="mx-auto px-8 lg:px-28">
        <div className="mb-6 flex items-end justify-between">
          <div>
            <h2 className="text-[24px] font-normal leading-6 tracking-[-0.5px] text-[#222222]">
              {title}
            </h2>
            <span className="mt-1.5 block h-0.5 w-10 bg-brand-700" />
            <p className="mt-3 text-sm text-neutral-500">
              {description}
            </p>
          </div>
          <Link href={href} className="hidden shrink-0 text-sm font-semibold text-brand-700 hover:text-brand-800 sm:block">
            View All Products
          </Link>
        </div>

        <ProductCarousel products={products} />
      </div>
    </section>
  );
}
