"use client";

import { useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { ProductCard } from "@/components/product/product-card";
import type { Product } from "@/lib/data/types";

export function FeaturedProducts({ products }: { products: Product[] }) {
  const scrollerRef = useRef<HTMLDivElement>(null);

  if (products.length < 5) {
    return null;
  }

  const [left1, left2, hero, right1, right2] = products;

  const scroll = (direction: 1 | -1) => {
    const el = scrollerRef.current;
    if (!el) return;
    el.scrollBy({ left: direction * el.clientWidth * 0.9, behavior: "smooth" });
  };

  return (
    <section className=" py-3 lg:py-14">
      <div className="mx-auto px-8 lg:px-28">
        <div className="mb-6">
          <h2 className="text-[24px] font-normal leading-6 tracking-[-0.5px] text-[#222222]">
            Featured Products
          </h2>
          <span className="mt-1.5 block h-0.5 w-10 bg-brand-700" />
        </div>

        {/* Mobile carousel - show only one */}
        <div className="lg:hidden group/carousel relative">
          <div
            ref={scrollerRef}
            className="flex snap-x scroll-px-1 gap-4 overflow-x-auto scroll-smooth pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          >
            {[left1, left2, hero, right1, right2].map((product, idx) => (
              <div key={idx} className="w-full shrink-0 snap-start">
                <ProductCard product={product} layout="horizontal" showBadge={false} showQuickActions={false} />
              </div>
            ))}
          </div>

          <button
            type="button"
            aria-label="Scroll left"
            onClick={() => scroll(-1)}
            className="absolute left-0 top-1/2 z-10 flex size-10 -translate-x-4 -translate-y-1/2 items-center justify-center rounded-full border border-border bg-white text-neutral-700 opacity-0 shadow-md transition-opacity duration-200 hover:bg-neutral-50 group-hover/carousel:opacity-100"
          >
            <ChevronLeft className="size-5" />
          </button>
          <button
            type="button"
            aria-label="Scroll right"
            onClick={() => scroll(1)}
            className="absolute right-0 top-1/2 z-10 flex size-10 translate-x-4 -translate-y-1/2 items-center justify-center rounded-full border border-border bg-white text-neutral-700 opacity-0 shadow-md transition-opacity duration-200 hover:bg-neutral-50 group-hover/carousel:opacity-100"
          >
            <ChevronRight className="size-5" />
          </button>
        </div>

        {/* Desktop grid layout */}
        <div className="hidden lg:grid grid-cols-1 gap-5 lg:grid-cols-12 lg:grid-rows-2">
          <div className="min-w-0 lg:col-span-3">
            <ProductCard product={left1} layout="horizontal" showBadge={false} showQuickActions={false} />
          </div>
          <div className="min-w-0 lg:col-start-4 lg:col-span-6 lg:row-span-2">
            <ProductCard product={hero} layout="horizontal" showBadge={false} showQuickActions={false} />
          </div>
          <div className="min-w-0 lg:col-span-3">
            <ProductCard product={right1} layout="horizontal" showBadge={false} showQuickActions={false} />
          </div>
          <div className="min-w-0 lg:col-span-3">
            <ProductCard product={left2} layout="horizontal" showBadge={false} showQuickActions={false} />
          </div>
          <div className="min-w-0 lg:col-span-3">
            <ProductCard product={right2} layout="horizontal" showBadge={false} showQuickActions={false} />
          </div>
        </div>
      </div>
    </section>
  );
}
