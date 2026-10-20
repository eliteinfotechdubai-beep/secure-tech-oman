"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";

type FeaturedBrand = {
  name: string;
  image?: string;
  href: string;
  order: number;
};

type BrandGroup = {
  category: string;
  brands: FeaturedBrand[];
};

const SECTIONS: Array<{ title: string; category: string; href: string }> = [
  { title: "Hard Drives / SSD", category: "Hard Drives / SSD", href: "/collections/storage" },
  { title: "CCTV ", category: "CCTV", href: "/collections/cctv-security-cameras" },
  { title: "Networking", category: "Networking", href: "/collections/networking" },
  { title: "Other Brands", category: "Other Brands", href: "/collections/accessories-components" },
];

export function ShopByCategory() {
  const [brandGroups, setBrandGroups] = useState<BrandGroup[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchFeaturedBrands() {
      try {
        const response = await fetch("/api/featured-brands");
        if (response.ok) {
          const data = await response.json();
          setBrandGroups(data.data || []);
        }
      } catch (error) {
        console.error("Error fetching featured brands:", error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchFeaturedBrands();
  }, []);

  const brandsForCategory = (category: string) =>
    brandGroups.find((group) => group.category.trim().toLowerCase() === category.trim().toLowerCase())
      ?.brands || [];

  if (isLoading) {
    return (
      <section className="mx-auto space-y-6 lg:space-y-12 px-8 lg:px-28 py-10 lg:py-14">
        {SECTIONS.map((section) => (
          <div key={section.category}>
            <div className="mb-5">
              <div className="h-6 w-48 bg-gray-200 rounded animate-pulse" />
              <span className="mt-1.5 block h-0.5 w-10 bg-brand-700" />
            </div>
            <div className="grid grid-cols-2 gap-2 sm:gap-4 sm:grid-cols-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-40 w-96 bg-gray-100 rounded-lg animate-pulse" />
              ))}
            </div>
          </div>
        ))}
      </section>
    );
  }

  return (
    <section className="mx-auto space-y-6 lg:space-y-12 px-8 lg:px-28 py-10 lg:py-14">
      {SECTIONS.map((section) => {
        const brands = brandsForCategory(section.category);

        if (brands.length === 0) {
          return null;
        }

        const isScrollable = brands.length > 4;

        return (
          <div key={section.category}>
            <div className="mb-5">
              <h2 className="text-[24px] font-normal leading-6 tracking-[-0.5px] text-[#222222]">
                {section.title}
              </h2>
              <span className="mt-1.5 block h-0.5 w-10 bg-brand-700" />
            </div>
            {isScrollable ? (
              <div className="overflow-x-auto scrollbar-hide">
                <div className="flex gap-2 px-2 md:gap-4 pt-3 pb-4 min-w-max">
                  {brands.map((brand, i) => (
                    <Link
                      key={`${brand.name}-${i}`}
                      href={brand.href}
                      className="flex h-20 w-[calc(50vw-35px)] sm:h-auto sm:aspect-320/131 sm:w-80 shrink-0 items-center justify-center rounded-lg border-2 border-gray-300 bg-white px-4 overflow-hidden transition-all duration-300 ease-in-out shadow-md hover:shadow-2xl hover:border-brand-500 sm:hover:scale-105 sm:hover:-translate-y-1"
                    >
                      {brand.image ? (
                        <Image
                          src={brand.image}
                          alt={brand.name}
                          width={300}
                          height={200}
                          className="w-full h-full object-contain"
                        />
                      ) : (
                        <span className="text-xl font-bold text-neutral-800">{brand.name}</span>
                      )}
                    </Link>
                  ))}
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2 sm:gap-4 sm:grid-cols-4">
                {brands.map((brand, i) => (
                  <Link
                    key={`${brand.name}-${i}`}
                    href={brand.href}
                    className="flex h-24 lg:w-full sm:h-32 xl:h-42 items-center justify-center rounded-lg border-2 border-gray-300 bg-white px-4 overflow-hidden transition-all duration-300 ease-in-out shadow-md hover:shadow-2xl hover:border-brand-500 hover:scale-105 hover:-translate-y-1"
                  >
                    {brand.image ? (
                      <Image
                        src={brand.image}
                        alt={brand.name}
                        width={300}
                        height={200}
                        className="w-full h-full object-contain"
                      />
                    ) : (
                      <span className="text-xl font-bold text-neutral-800">{brand.name}</span>
                    )}
                  </Link>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </section>
  );
}
