"use client";

import Link from "next/link";

export function SkeletonCarousel({ title, description }: { title: string; description?: string }) {
  return (
    <section className="bg-secondary/40 py-14">
      <div className="mx-auto px-28">
        <div className="mb-6 flex items-end justify-between">
          <div>
            <h2 className="text-[24px] font-normal leading-6 tracking-[-0.5px] text-[#222222]">
              {title}
            </h2>
            <span className="mt-1.5 block h-0.5 w-10 bg-brand-700" />
            {description && (
              <p className="mt-3 text-sm text-neutral-500">
                {description}
              </p>
            )}
          </div>
          <Link href="/products" className="hidden shrink-0 text-sm font-semibold text-brand-700 hover:text-brand-800 sm:block">
            View All Products
          </Link>
        </div>

        <div className="flex gap-4 overflow-x-auto rounded-lg pb-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className="group flex h-96 min-w-60 flex-col overflow-hidden rounded-lg border border-border bg-white animate-pulse"
            >
              <div className="h-80 bg-neutral-200" />
              <div className="flex flex-1 flex-col gap-4 p-6">
                <div className="h-4 w-3/4 bg-neutral-200 rounded" />
                <div className="h-10 bg-neutral-200 rounded mt-auto" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
