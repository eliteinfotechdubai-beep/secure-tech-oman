"use client";

import { useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { ProductCard } from "@/components/product/product-card";
import type { Product } from "@/lib/data/types";

export function ProductCarousel({ products }: { products: Product[] }) {
  const scrollerRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 1 | -1) => {
    const el = scrollerRef.current;
    if (!el) return;
    el.scrollBy({ left: direction * el.clientWidth * 0.9, behavior: "smooth" });
  };

  return (
    <div className="group/carousel relative">
      <button
        type="button"
        aria-label="Scroll left"
        onClick={() => scroll(-1)}
        className="absolute left-0 top-1/2 z-10 flex size-10 -translate-x-4 -translate-y-1/2 items-center justify-center rounded-full border border-border bg-white text-neutral-700 opacity-0 shadow-md transition-opacity duration-200 hover:bg-neutral-50 group-hover/carousel:opacity-100"
      >
        <ChevronLeft className="size-5" />
      </button>

      <div
        ref={scrollerRef}
        className="flex snap-x scroll-px-1 gap-2 sm:gap-4 overflow-x-auto scroll-smooth pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {products.map((product) => (
          <div
            key={product.id}
            className="w-[calc((100%-1.25rem)/1.5)] shrink-0 snap-start sm:w-[calc((100%-2*1.25rem)/3)] lg:w-[calc((100%-4*1.25rem)/4)] 2xl:w-[calc((100%-4*1.25rem)/5)]"
          >
            <ProductCard product={product} />
          </div>
        ))}
      </div>

      <button
        type="button"
        aria-label="Scroll right"
        onClick={() => scroll(1)}
        className="absolute right-0 top-1/2 z-10 flex size-10 -translate-y-1/2 translate-x-4 items-center justify-center rounded-full border border-border bg-white text-neutral-700 opacity-0 shadow-md transition-opacity duration-200 hover:bg-neutral-50 group-hover/carousel:opacity-100"
      >
        <ChevronRight className="size-5" />
      </button>
    </div>
  );
}
