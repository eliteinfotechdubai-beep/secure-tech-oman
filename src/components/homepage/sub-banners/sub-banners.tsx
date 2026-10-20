"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { SkeletonBanner } from "@/components/common/skeleton-banner";
import type { SubBanner } from "@/lib/shopify/shopify-types";

interface SubBannersProps {
  limit?: number;
  offset?: number;
  columns?: number;
}

const gridClasses: Record<number, string> = {
  2: "lg:grid-cols-2",
  3: "lg:grid-cols-3",
  4: "lg:grid-cols-4",
  5: "lg:grid-cols-5",
};

export function SubBanners({
  limit = 5,
  offset = 0,
  columns = 5,
}: SubBannersProps) {
  const [banners, setBanners] = useState<SubBanner[]>([]);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);

    async function fetchBanners() {
      try {
        const response = await fetch("/api/banners/sub");
        if (response.ok) {
          const data = await response.json();
          setBanners(data.data || []);
        }
      } catch (error) {
        console.error("Error fetching sub banners:", error);
      }
    }

    fetchBanners();
  }, []);

  // Show skeleton while loading or if no data
  if (!isClient || banners.length === 0) {
    return <SkeletonBanner count={limit} variant="sub" columns={columns} />;
  }

  const displayBanners = limit ? banners.slice(offset, offset + limit) : banners;

  if (displayBanners.length === 0) {
    return <SkeletonBanner count={limit} variant="sub" columns={columns} />;
  }

  const gridClass = gridClasses[columns] || "lg:grid-cols-5";

  return (
    <section className="px-6 lg:px-28 py-5 lg:py-10">
      <div className={cn("grid grid-cols-2 gap-3 sm:grid-cols-3", gridClass)}>
        {displayBanners.map((banner) => (
          <Link
            key={banner.id}
            href="/"
            className="group relative overflow-hidden rounded-lg transition-all duration-300 hover:scale-[1.02] hover:shadow-lg"
          >
            <div className="relative aspect-[2.3/1] overflow-hidden">
              <Image
                src={banner.image}
                alt={banner.title || "Sub banner"}
                fill
                className="object-cover object-center"
                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
              />
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
