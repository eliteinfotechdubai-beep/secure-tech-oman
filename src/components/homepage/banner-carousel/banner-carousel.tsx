"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";

const CAROUSEL_BANNERS = [
  { src: "banner1.jpg", alt: "Seagate Exos Enterprise hard drives — simplified, unified, unstoppable, up to 30TB" },
  { src: "banner2.jpg", alt: "Toshiba hard disk drives for every storage application — MG Series, N300 and S300 Surveillance" },
  { src: "banner3.jpg", alt: "Seagate Exos Enterprise hard drives — simplified, unified, unstoppable, up to 30TB" },
];
const SIDE_BANNERS = [
  { src: "half-banner1.jpg", alt: "Featured promotion" },
  { src: "half-banner2.jpg", alt: "Featured promotion" },
];

export function BannerCarousel() {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const [currentSlide, setCurrentSlide] = useState(0);

  const scroll = (direction: 1 | -1) => {
    const el = scrollerRef.current;
    if (!el) return;

    const newSlide = (currentSlide + direction + CAROUSEL_BANNERS.length) % CAROUSEL_BANNERS.length;
    setCurrentSlide(newSlide);

    el.scrollBy({
      left: direction * el.clientWidth,
      behavior: "smooth"
    });
  };

  return (
    <section className="px-8 lg:px-28 py-10">
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        {/* Carousel Section - Left side (spans 2 columns on desktop) */}
        <div className="lg:col-span-2">
          <div className="group/carousel relative">
            <div
              ref={scrollerRef}
              className="flex snap-x scroll-px-1 gap-5 overflow-x-auto scroll-smooth pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
            >
              {CAROUSEL_BANNERS.map((banner, idx) => (
                <div
                  key={idx}
                  className="w-full shrink-0 snap-start relative aspect-video overflow-hidden rounded-lg"
                >
                  <Image
                    src={`/assets/${banner.src}`}
                    alt={banner.alt}
                    fill
                    className="object-contain"
                    sizes="(max-width: 768px) 100vw, 66vw"
                  />
                </div>
              ))}
            </div>

            {/* Carousel Controls */}
            <button
              type="button"
              aria-label="Previous banner"
              onClick={() => scroll(-1)}
              className="absolute left-0 top-1/2 z-10 flex size-10 -translate-x-4 -translate-y-1/2 items-center justify-center rounded-full border border-border bg-white text-neutral-700 opacity-0 shadow-md transition-opacity duration-200 hover:bg-neutral-50 group-hover/carousel:opacity-100"
            >
              <ChevronLeft className="size-5" />
            </button>
            <button
              type="button"
              aria-label="Next banner"
              onClick={() => scroll(1)}
              className="absolute right-0 top-1/2 z-10 flex size-10 translate-x-4 -translate-y-1/2 items-center justify-center rounded-full border border-border bg-white text-neutral-700 opacity-0 shadow-md transition-opacity duration-200 hover:bg-neutral-50 group-hover/carousel:opacity-100"
            >
              <ChevronRight className="size-5" />
            </button>

            {/* Carousel Indicators */}
            <div className="mt-4 flex justify-center gap-2">
              {CAROUSEL_BANNERS.map((_, idx) => (
                <button
                  key={idx}
                  type="button"
                  aria-label={`Go to banner ${idx + 1}`}
                  onClick={() => {
                    setCurrentSlide(idx);
                    const el = scrollerRef.current;
                    if (el) {
                      el.scrollTo({ left: idx * el.clientWidth, behavior: "smooth" });
                    }
                  }}
                  className={`h-2 rounded-full transition-all ${
                    currentSlide === idx
                      ? "w-8 bg-brand-700"
                      : "w-2 bg-neutral-300 hover:bg-neutral-400"
                  }`}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Side Banners Section - Right side */}
        <div className="flex flex-col gap-5">
          {SIDE_BANNERS.map((banner, idx) => (
            <div
              key={idx}
              className="relative aspect-square overflow-hidden rounded-lg flex-1"
            >
              <Image
                src={`/assets/${banner.src}`}
                alt={banner.alt}
                fill
                className="object-contain"
                sizes="(max-width: 768px) 100vw, 33vw"
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
