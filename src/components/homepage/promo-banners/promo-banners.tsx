"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { SkeletonBanner } from "@/components/common/skeleton-banner";
import type { PromoBanner } from "@/lib/shopify/shopify-types";

export type PromoBannerImage = {
  src: string;
  alt?: string;
  /** Classes applied to the image's wrapper — controls aspect ratio, grid span, etc. */
  className?: string;
  sizes?: string;
};

/**
 * Renders one fetched banner, linked only when the merchant actually set an `href`.
 *
 * A blank link field must not be passed to <Link>: next/link runs a non-string href
 * through formatUrl(), which destructures it and throws "Cannot destructure property
 * 'auth' of 'e' as it is null" — and because these banners are fetched client-side,
 * that throw escapes hydration and blanks the whole page.
 */
function PromoBannerTile({
  banner,
  className,
  sizes,
}: {
  banner: PromoBanner;
  className: string;
  sizes: string;
}) {
  const content = (
    <div className="relative aspect-[2.3/1] overflow-hidden">
      <Image
        src={banner.image}
        alt={banner.alt || "Promo banner"}
        fill
        className="object-cover object-center"
        sizes={sizes}
      />
    </div>
  );

  if (!banner.href) {
    return <div className={className}>{content}</div>;
  }

  return (
    <Link href={banner.href} className={className}>
      {content}
    </Link>
  );
}

export function PromoBanners({
  skeletonCount,
  images,
  limit,
  offset = 0,
  columns = 2,
}: { skeletonCount?: number; images?: PromoBannerImage[]; limit?: number; offset?: number; columns?: number } = {}) {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const [banners, setBanners] = useState<PromoBanner[]>([]);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);

    async function fetchBanners() {
      try {
        const response = await fetch("/api/banners/promo");
        if (response.ok) {
          const data = await response.json();
          setBanners(data.data || []);
        }
      } catch (error) {
        console.error("Error fetching promo banners:", error);
      }
    }

    fetchBanners();
  }, []);

  const scroll = (direction: 1 | -1) => {
    const el = scrollerRef.current;
    if (!el) return;
    el.scrollBy({ left: direction * el.clientWidth * 0.9, behavior: "smooth" });
  };

  useEffect(() => {
    const timer = setInterval(() => {
      const el = scrollerRef.current;
      if (!el) return;
      const atEnd = el.scrollLeft + el.clientWidth >= el.scrollWidth - 4;
      el.scrollTo({
        left: atEnd ? 0 : el.scrollLeft + el.clientWidth * 0.9,
        behavior: "smooth",
      });
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  // Render fetched promo banners (image-based) if available
  if (!images && !skeletonCount) {
    // A banner with no image can't be rendered at all — next/image throws on an empty
    // src — so drop those before slicing rather than letting one break the page.
    const renderable = banners.filter((banner) => Boolean(banner.image));

    // Show skeleton while loading OR if no data exists
    if (!isClient || renderable.length === 0) {
      return <SkeletonBanner count={limit || 2} variant="promo" columns={columns} />;
    }

    const displayBanners = limit ? renderable.slice(offset, offset + limit) : renderable;

    if (displayBanners.length === 0) {
      return <SkeletonBanner count={limit || 2} variant="promo" columns={columns} />;
    }

    return (
      <section className="px-6 lg:px-28 py-5 lg:py-10">
        <div className="group/carousel relative lg:hidden">
          <div
            ref={scrollerRef}
            className="flex snap-x scroll-px-1 gap-3 overflow-x-auto scroll-smooth pb-1 [-ms-overflow-style:none] scrollbar-none [&::-webkit-scrollbar]:hidden"
          >
            {displayBanners.map((banner) => (
              <PromoBannerTile
                key={banner.name}
                banner={banner}
                className="group relative w-full shrink-0 snap-start overflow-hidden rounded-lg transition-all duration-300 hover:scale-[1.02] hover:shadow-lg sm:w-[calc(50%-0.375rem)]"
                sizes="(max-width: 640px) 100vw, 50vw"
              />
            ))}
          </div>

          <button
            type="button"
            aria-label="Scroll left"
            onClick={() => scroll(-1)}
            className="absolute left-0 top-1/2 z-10 flex size-8 -translate-x-2 -translate-y-1/2 items-center justify-center rounded-full bg-white text-neutral-700 opacity-0 shadow-md transition-opacity duration-200 hover:bg-neutral-50 group-hover/carousel:opacity-100"
          >
            <ChevronLeft className="size-4" />
          </button>
          <button
            type="button"
            aria-label="Scroll right"
            onClick={() => scroll(1)}
            className="absolute right-0 top-1/2 z-10 flex size-8 translate-x-2 -translate-y-1/2 items-center justify-center rounded-full bg-white text-neutral-700 opacity-0 shadow-md transition-opacity duration-200 hover:bg-neutral-50 group-hover/carousel:opacity-100"
          >
            <ChevronRight className="size-4" />
          </button>
        </div>

        {/* Desktop grid layout */}
        <div className={cn("hidden lg:grid gap-4", columns === 3 ? "lg:grid-cols-3" : "lg:grid-cols-2")}>
          {displayBanners.map((banner) => (
            <PromoBannerTile
              key={banner.name}
              banner={banner}
              className="group relative overflow-hidden rounded-lg transition-all duration-300 hover:scale-[1.02] hover:shadow-lg"
              sizes="50vw"
            />
          ))}
        </div>
      </section>
    );
  }

  // Image-based banners — each image's size/aspect ratio is supplied by the parent.
  // Mobile shows 1 banner at a time and tablet shows 2, both via horizontal scroll;
  // the full grid only kicks in at lg (desktop).
  if (images && images.length > 0) {
    return (
      <section className="px-6 lg:px-28 py-5 lg:py-10">
        <div className="group/carousel relative lg:hidden">
          <div
            ref={scrollerRef}
            className="flex snap-x scroll-px-1 gap-3 overflow-x-auto scroll-smooth pb-1 [-ms-overflow-style:none] scrollbar-none [&::-webkit-scrollbar]:hidden"
          >
            {images.map((image, i) => (
              <div
                key={`${image.src}-${i}`}
                className={cn(
                  "group relative w-full shrink-0 snap-start overflow-hidden rounded-lg transition-all duration-300 hover:scale-[1.02] hover:shadow-lg sm:w-[calc(50%-0.375rem)]",
                  image.className ?? "aspect-[2.3/1]",
                )}
              >
                <Image
                  src={`/assets/${image.src}`}
                  alt={image.alt ?? `Promo banner ${i + 1}`}
                  fill
                  className="object-cover"
                  sizes={image.sizes ?? "(max-width: 640px) 100vw, 50vw"}
                />
              </div>
            ))}
          </div>

          <button
            type="button"
            aria-label="Scroll left"
            onClick={() => scroll(-1)}
            className="absolute left-0 top-1/2 z-10 flex size-8 -translate-x-2 -translate-y-1/2 items-center justify-center rounded-full bg-white text-neutral-700 opacity-0 shadow-md transition-opacity duration-200 hover:bg-neutral-50 group-hover/carousel:opacity-100"
          >
            <ChevronLeft className="size-4" />
          </button>
          <button
            type="button"
            aria-label="Scroll right"
            onClick={() => scroll(1)}
            className="absolute right-0 top-1/2 z-10 flex size-8 translate-x-2 -translate-y-1/2 items-center justify-center rounded-full bg-white text-neutral-700 opacity-0 shadow-md transition-opacity duration-200 hover:bg-neutral-50 group-hover/carousel:opacity-100"
          >
            <ChevronRight className="size-4" />
          </button>
        </div>

        {/* Desktop grid layout */}
        <div
          className={cn(
            "hidden lg:grid gap-1",
            images.length === 2 ? "lg:grid-cols-2" : "lg:grid-cols-3",
          )}
        >
          {images.map((image, i) => (
            <div
              key={`${image.src}-${i}`}
              className={cn(
                "group relative overflow-hidden rounded-lg transition-all duration-300 hover:scale-[1.02] hover:shadow-lg",
                image.className ?? "aspect-[2.3/1]",
              )}
            >
              <Image
                src={`/assets/${image.src}`}
                alt={image.alt ?? `Promo banner ${i + 1}`}
                fill
                className="object-cover"
                sizes={image.sizes ?? "33vw"}
              />
            </div>
          ))}
        </div>
      </section>
    );
  }

  if (skeletonCount) {
    return (
      <section className="px-6 lg:px-28 py-5 lg:py-10">
        <div className={cn("grid grid-cols-1 gap-5", skeletonCount === 2 ? "md:grid-cols-2 lg:grid-cols-2" : "md:grid-cols-2 lg:grid-cols-3")}>
          {Array.from({ length: skeletonCount }).map((_, i) => (
            <div
              key={i}
              className="group aspect-[2.3/1] animate-pulse overflow-hidden rounded-lg bg-neutral-200 transition-all duration-300 hover:scale-[1.02] hover:shadow-lg"
            />
          ))}
        </div>
      </section>
    );
  }

  return null;
}
