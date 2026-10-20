"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { SkeletonBanner } from "@/components/common/skeleton-banner";
import type { HeroBanner, SideBanner } from "@/lib/shopify/shopify-types";

export function Hero() {
  const [active, setActive] = useState(0);
  const [heroBanners, setHeroBanners] = useState<HeroBanner[]>([]);
  const [sideBanners, setSideBanners] = useState<SideBanner[]>([]);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);

    async function fetchBanners() {
      try {
        const [heroRes, sideRes] = await Promise.all([
          fetch("/api/banners/hero"),
          fetch("/api/banners/side"),
        ]);

        if (heroRes.ok) {
          const heroData = await heroRes.json();
          setHeroBanners(heroData.data || []);
        }

        if (sideRes.ok) {
          const sideData = await sideRes.json();
          setSideBanners(sideData.data || []);
        }
      } catch (error) {
        console.error("Error fetching banners:", error);
      }
    }

    fetchBanners();
  }, []);

  useEffect(() => {
    if (heroBanners.length === 0) return;

    const timer = setInterval(() => {
      setActive((current) => (current + 1) % heroBanners.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [heroBanners.length]);

  // Show skeleton while loading or if no data
  if (!isClient || heroBanners.length === 0 || sideBanners.length === 0) {
    return <SkeletonBanner variant="hero" />;
  }

  const slide = heroBanners[active];

  return (
    <section className="bg-secondary/40 py-6">
      <div className="mx-2 lg:mx-28 grid grid-cols-1 gap-0.5 lg:grid-cols-12 items-start">
        <div className="group relative aspect-1080/534 overflow-hidden rounded-lg lg:col-span-8">
          <Link href="/" className="absolute inset-0">
            <Image
              src={slide.image}
              alt={slide.alt}
              fill
              priority
              className="object-cover object-center"
              sizes="(max-width: 1024px) 100vw, 66vw"
            />
          </Link>

          <button
            type="button"
            aria-label="Previous slide"
            onClick={() =>
              setActive(
                (current) => (current - 1 + heroBanners.length) % heroBanners.length,
              )
            }
            className="absolute left-3 top-1/2 flex size-9 -translate-y-1/2 items-center justify-center rounded-full bg-black/25 text-white opacity-0 transition-opacity group-hover:opacity-100 hover:bg-black/40"
          >
            <ChevronLeft className="size-5" />
          </button>
          <button
            type="button"
            aria-label="Next slide"
            onClick={() =>
              setActive((current) => (current + 1) % heroBanners.length)
            }
            className="absolute right-3 top-1/2 flex size-9 -translate-y-1/2 items-center justify-center rounded-full bg-black/25 text-white opacity-0 transition-opacity group-hover:opacity-100 hover:bg-black/40"
          >
            <ChevronRight className="size-5" />
          </button>

          <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-2">
            {heroBanners.map((item, index) => (
              <button
                key={item.id}
                type="button"
                aria-label={`Go to slide ${index + 1}`}
                onClick={() => setActive(index)}
                className={cn(
                  "h-1.5 rounded-full bg-white transition-all",
                  index === active ? "w-6 opacity-100" : "w-1.5 opacity-50",
                )}
              />
            ))}
          </div>
        </div>

        <div className="hidden lg:flex lg:col-span-4 w-full flex-wrap gap-0 items-start content-start">
          {sideBanners.map((banner) => (
            <Link
              key={banner.id}
              href={banner.href || "/"}
              className="relative aspect-square overflow-hidden border border-border bg-white p-3 basis-1/2 hover:shadow-md transition-shadow"
            >
              <Image
                src={banner.image}
                alt={banner.alt}
                fill
                className="object-contain object-center"
                sizes="(max-width: 1024px) 50vw, 17vw"
              />
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
