
"use client";

import Link from "next/link";
import Image from "next/image";
import { ChevronRight, Menu } from "lucide-react";
import { SUPPORT_LINK } from "@/lib/constants";
import {
  useMemo,
  useRef,
  useState,
  useEffect,
  useLayoutEffect,
} from "react";
import { createPortal } from "react-dom";

interface Category {
  id: string;
  title: string;
  handle: string;
  description?: string;
  image?: { url: string; altText?: string };
  isMainCategory?: boolean;
  order?: number;
  subCategories: Category[];
}

type CategoryData = {
  sections: {
    title: string;
    href: string;
    items: {
      label: string;
      href: string;
    }[];
  }[];
  image?: { url: string; altText?: string };
};

const CATEGORIES_KEY = "__shop_by_category__";
const BRAND_KEY = "__brands__";

// All 28 brands.
const BRAND_NAMES = [
  "Dahua",
  "Ezviz",
  "UNV",
  "Hikvision",
  "Anker",
  "IMOU",
  "Huawei",
  "Seagate",
  "WD",
  "Grandstream",
  "Toshiba",
  "Ruijie",
  "Fyber",
  "Kingston",
  "Haing",
  "Ubiquiti",
  "Tapo",
  "Ring",
  "TP Link",
  "Lexar",
  "Uniarch",
  "SanDisk",
  "Teklo",
  "Cudy",
  "Garmin",
  "Soundcore",
  "Eufy",
  "Mercusys",
];

// Display name to Shopify vendor mapping.
const BRAND_VENDOR_NAMES: Record<string, string> = {
  WD: "Western Digital",
};

// Display name to logo filename mapping.
const BRAND_LOGO_FILES: Record<string, string> = {
  "TP Link": "tp-link.webp",
  WD: "wd.webp",
};

// Return logo file path.
function getBrandLogo(brand: string) {
  const filename =
    BRAND_LOGO_FILES[brand] ??
    `${brand.toLowerCase().replace(/\s+/g, "-")}.webp`;

  return `/brands/${filename}`;
}

export function CategoryNav() {
  const [hoveredCategory, setHoveredCategory] =
    useState<string | null>(null);

  const [dropdownPosition, setDropdownPosition] =
    useState<{ top: number; left: number } | null>(
      null
    );

  const [categories, setCategories] =
    useState<Category[]>([]);

  const [activeRootHandle, setActiveRootHandle] =
    useState<string | null>(null);

  const [isLoading, setIsLoading] = useState(true);

  const closeTimeoutRef = useRef<
    ReturnType<typeof setTimeout> | null
  >(null);

  const categoryDropdownRef =
    useRef<HTMLDivElement | null>(null);

  // Keep dropdown inside viewport.
  useLayoutEffect(() => {
    const panel = categoryDropdownRef.current;

    if (!panel || !dropdownPosition) return;

    const gutter = 16;

    const maxLeft =
      window.scrollX +
      document.documentElement.clientWidth -
      panel.offsetWidth -
      gutter;

    panel.style.left = `${Math.max(
      window.scrollX + gutter,
      Math.min(dropdownPosition.left, maxLeft)
    )}px`;
  }, [hoveredCategory, dropdownPosition]);

  // Fetch Shopify categories.
  useEffect(() => {
    async function fetchCategories() {
      try {
        const response = await fetch(
          "/api/collections/organized"
        );

        if (response.ok) {
          const data = await response.json();

          setCategories(data.data || []);
        }
      } catch (error) {
        console.error(
          "Error fetching categories:",
          error
        );
      } finally {
        setIsLoading(false);
      }
    }

    fetchCategories();
  }, []);

  // Main categories.
  const mainCategories = useMemo(() => {
    const flagged = categories.filter(
      (category) => category.isMainCategory
    );

    return flagged.length > 0
      ? flagged
      : categories;
  }, [categories]);

  // Brands appears first, before the main categories.
  const navItems = useMemo(() => {
    type NavItem =
      | {
          type: "category";
          category: Category;
        }
      | {
          type: "brand";
        };

    const categoryItems: NavItem[] = mainCategories
      .filter(
        (category) =>
          category.handle !== "brands" &&
          category.handle !== "brand"
      )
      .map((category) => ({
        type: "category" as const,
        category,
      }));

    const items: NavItem[] = [
      { type: "brand" },
      ...categoryItems,
    ];

    return items;
  }, [mainCategories]);

  const selectedRoot =
    categories.find(
      (category) =>
        category.handle === activeRootHandle
    ) ?? categories[0];

  const clearCloseTimeout = () => {
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current);

      closeTimeoutRef.current = null;
    }
  };

  const closeDropdown = () => {
    clearCloseTimeout();

    setHoveredCategory(null);
    setDropdownPosition(null);
    setActiveRootHandle(null);
  };

  const openDropdown = (
    label: string,
    target: HTMLElement
  ) => {
    clearCloseTimeout();

    const rect = target.getBoundingClientRect();

    setDropdownPosition({
      top: rect.bottom + window.scrollY,
      left: rect.left + window.scrollX,
    });

    setHoveredCategory(label);
  };

  const scheduleClose = () => {
    clearCloseTimeout();

    closeTimeoutRef.current = setTimeout(
      closeDropdown,
      100
    );
  };

  // Transform Shopify categories.
  const transformToSections = (
    category: Category
  ): CategoryData => {
    if (category.subCategories.length === 0) {
      return { sections: [] };
    }

    const sections = category.subCategories.map(
      (subCat) => ({
        title: subCat.title,
        href: `/collections/${subCat.handle}`,
        items: subCat.subCategories.map((item) => ({
          label: item.title,
          href: `/collections/${item.handle}`,
        })),
      })
    );

    return {
      sections,
      image: category.image,
    };
  };

  const getCategoryData = (
    title: string
  ): CategoryData | null => {
    const category = categories.find(
      (cat) => cat.title === title
    );

    return category
      ? transformToSections(category)
      : null;
  };

  const activeCategoryData =
    hoveredCategory &&
    hoveredCategory !== BRAND_KEY
      ? getCategoryData(hoveredCategory)
      : null;

  // Loading skeleton.
  if (isLoading) {
    return (
      <div className="hidden border-b border-border bg-background md:block">
        <div className="mx-auto flex items-center gap-4 px-4 py-3.5 lg:px-8">
          <div className="h-4 w-24 animate-pulse rounded bg-gray-200" />

          <div className="flex flex-1 gap-4">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="h-4 w-20 animate-pulse rounded bg-gray-200"
              />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="hidden border-b border-border bg-background md:block">

      {/* Header navigation row */}
      <div className="mx-auto flex items-center gap-4 px-4 py-3.5 lg:px-8">

        {/* Shop By Category */}
        <div
          className="-my-3.5 -ml-2 w-48 shrink-0 border-r border-gray-200 hover:bg-gray-50"
          onMouseEnter={(e) =>
            categories.length > 0 &&
            openDropdown(
              CATEGORIES_KEY,
              e.currentTarget
            )
          }
          onMouseLeave={scheduleClose}
        >
          <Link
            href="/products"
            className={`flex cursor-pointer items-center gap-2 px-3 py-3.5 text-sm font-semibold transition-colors ${
              hoveredCategory === CATEGORIES_KEY
                ? "bg-brand-700 text-white"
                : "text-neutral-900 hover:text-brand-700"
            }`}
          >
            <Menu className="size-4" />
            Shop By Category
          </Link>
        </div>

        {/* Main navigation */}
        <nav className="relative flex min-w-0 flex-1 items-center gap-4 overflow-x-auto whitespace-nowrap text-sm font-medium text-neutral-700 scrollbar-hide">

          {navItems.map((item) => {

            // Brands navigation.
            if (item.type === "brand") {
              return (
                <div
                  key={BRAND_KEY}
                  className="relative shrink-0"
                  onMouseEnter={(e) =>
                    openDropdown(
                      BRAND_KEY,
                      e.currentTarget
                    )
                  }
                  onMouseLeave={scheduleClose}
                >
                  <Link
                    href="/products"
                    className="cursor-pointer border-b-2 border-transparent px-1 py-2 transition-colors hover:border-brand-700 hover:text-brand-700"
                  >
                    Brands
                  </Link>
                </div>
              );
            }

            // Existing categories.
            const { category } = item;

            const categoryData =
              getCategoryData(category.title);

            const hasData =
              categoryData &&
              categoryData.sections.length > 0;

            return (
              <div
                key={category.id}
                className="relative shrink-0"
                data-category={category.title}
                onMouseEnter={(e) =>
                  hasData &&
                  openDropdown(
                    category.title,
                    e.currentTarget
                  )
                }
                onMouseLeave={scheduleClose}
              >
                <Link
                  href={`/collections/${category.handle}`}
                  className="cursor-pointer border-b-2 border-transparent px-1 py-2 transition-colors hover:border-brand-700 hover:text-neutral-950"
                >
                  {category.title}
                </Link>
              </div>
            );
          })}
        </nav>

        {/* Support link */}
        <Link
          href={SUPPORT_LINK.href}
          className="hidden shrink-0 text-sm font-bold text-brand-700 transition-colors hover:text-brand-800 xl:block"
        >
          {SUPPORT_LINK.label}
        </Link>
      </div>

      {/* Shop By Category mega dropdown */}
      {hoveredCategory === CATEGORIES_KEY &&
        dropdownPosition &&
        categories.length > 0 &&
        typeof document !== "undefined" &&
        createPortal(
          <div
            className="absolute z-50 flex h-[min(80vh,36rem)] w-[min(90vw,56rem)] overflow-hidden rounded-b-md border border-t-0 border-gray-200 bg-white shadow-lg"
            style={{
              top: dropdownPosition.top,
              left: dropdownPosition.left,
            }}
            onMouseEnter={clearCloseTimeout}
            onMouseLeave={scheduleClose}
          >

            {/* Left categories */}
            <ul className="w-60 shrink-0 overflow-y-auto border-r border-gray-200 px-5 py-1">

              {categories.map((category) => {
                const isSelected =
                  selectedRoot?.handle ===
                  category.handle;

                return (
                  <li key={category.id}>
                    <button
                      type="button"
                      onClick={() =>
                        setActiveRootHandle(
                          category.handle
                        )
                      }
                      aria-pressed={isSelected}
                      className={`flex w-full cursor-pointer items-center justify-between gap-2 border-b border-gray-200 py-3 text-left text-[14px] transition-colors hover:text-brand-700 ${
                        isSelected
                          ? "font-medium text-brand-700"
                          : "text-[#222222]"
                      }`}
                    >
                      <span className="min-w-0 truncate">
                        {category.title}
                      </span>

                      <ChevronRight className="size-4 shrink-0 text-neutral-500" />
                    </button>
                  </li>
                );
              })}
            </ul>

            {/* Right category content */}
            <div className="flex-1 overflow-y-auto p-6">
              {selectedRoot && (
                <>
                  <Link
                    href={`/collections/${selectedRoot.handle}`}
                    onClick={closeDropdown}
                    className="mb-5 inline-flex items-center gap-1 text-[15px] font-semibold text-[#222222] hover:text-brand-700"
                  >
                    {selectedRoot.title}
                    <ChevronRight className="size-4" />
                  </Link>

                  {selectedRoot.subCategories.length >
                  0 ? (
                    <div className="grid grid-cols-2 gap-x-8 gap-y-6 lg:grid-cols-3">

                      {selectedRoot.subCategories.map(
                        (child) => (
                          <div
                            key={child.id}
                            className="min-w-0"
                          >
                            <Link
                              href={`/collections/${child.handle}`}
                              onClick={closeDropdown}
                              className="block text-[14px] font-medium text-[#222222] hover:text-brand-700"
                            >
                              {child.title}
                            </Link>

                            {child.subCategories.length >
                              0 && (
                              <div className="mt-3 space-y-1.5">

                                {child.subCategories.map(
                                  (leaf) => (
                                    <Link
                                      key={leaf.id}
                                      href={`/collections/${leaf.handle}`}
                                      onClick={closeDropdown}
                                      className="block text-[14px] font-normal leading-snug text-[#666666] hover:text-brand-700"
                                    >
                                      {leaf.title}
                                    </Link>
                                  )
                                )}
                              </div>
                            )}
                          </div>
                        )
                      )}
                    </div>
                  ) : (
                    <p className="text-[14px] text-[#666666]">
                      No sub-categories yet — browse{" "}
                      {selectedRoot.title} directly.
                    </p>
                  )}
                </>
              )}
            </div>
          </div>,
          document.body
        )}

      {/* Existing category dropdown - unchanged */}
      {hoveredCategory &&
        hoveredCategory !== CATEGORIES_KEY &&
        hoveredCategory !== BRAND_KEY &&
        dropdownPosition &&
        activeCategoryData &&
        activeCategoryData.sections.length > 0 &&
        typeof document !== "undefined" &&
        createPortal(
          <div
            ref={categoryDropdownRef}
            className="absolute z-50 max-h-[min(75vh,36rem)] w-[min(calc(100vw-2rem),48rem)] overflow-y-auto rounded-md border border-gray-200 bg-white px-6 pb-4 pt-6 shadow-lg"
            style={{
              top: dropdownPosition.top,
              left: dropdownPosition.left,
            }}
            onMouseEnter={clearCloseTimeout}
            onMouseLeave={scheduleClose}
          >
            <div className="flex gap-8">

              <div className="grid min-w-0 flex-1 grid-cols-3 gap-x-8 gap-y-6">

                {activeCategoryData.sections.map(
                  (section) => (
                    <div
                      key={section.title}
                      className="min-w-0"
                    >
                      <h4 className="mb-1">
                        <Link
                          href={section.href}
                          onClick={closeDropdown}
                          className="block cursor-pointer text-[14px] font-medium text-[#222222] transition-colors hover:text-brand-700"
                        >
                          {section.title}
                        </Link>
                      </h4>

                      <div className="mt-3 space-y-1.5">

                        {section.items.map(
                          (menuItem) => (
                            <Link
                              key={menuItem.label}
                              href={menuItem.href}
                              onClick={closeDropdown}
                              className="block cursor-pointer text-[14px] font-normal text-[#666666] transition-colors hover:text-brand-700"
                            >
                              {menuItem.label}
                            </Link>
                          )
                        )}
                      </div>
                    </div>
                  )
                )}
              </div>

              {/* Existing category image */}
              {activeCategoryData.image && (
                <div className="ml-4 flex h-36 w-36 shrink-0 items-center justify-center">
                  <Image
                    src={activeCategoryData.image.url}
                    alt={
                      activeCategoryData.image.altText ||
                      hoveredCategory ||
                      ""
                    }
                    width={144}
                    height={144}
                    className="h-full w-full object-contain"
                  />
                </div>
              )}
            </div>
          </div>,
          document.body
        )}

      {/* Brands mega menu - Logos and names */}
      {hoveredCategory === BRAND_KEY &&
        dropdownPosition &&
        typeof document !== "undefined" &&
        createPortal(
          <div
            ref={categoryDropdownRef}
            className="absolute z-50 max-h-[min(80vh,42rem)] w-[min(calc(100vw-2rem),64rem)] overflow-y-auto rounded-md border border-gray-200 bg-white p-5 shadow-xl"
            style={{
              top: dropdownPosition.top,
              left: dropdownPosition.left,
            }}
            onMouseEnter={clearCloseTimeout}
            onMouseLeave={scheduleClose}
          >

            {/* All 28 brand logos */}
            <div className="grid grid-cols-4 gap-x-3 gap-y-5 lg:grid-cols-7">

              {BRAND_NAMES.map((brand) => {
                const vendor =
                  BRAND_VENDOR_NAMES[brand] ?? brand;

                const logo = getBrandLogo(brand);

                return (
                  <Link
                    key={brand}
                    href={`/products?brand=${encodeURIComponent(vendor)}`}
                    onClick={closeDropdown}
                    className="group flex min-w-0 flex-col items-center gap-2 text-center"
                  >

                    {/* Brand logo */}
                    <div className="flex h-24 w-full items-center justify-center overflow-hidden rounded-xl border border-gray-100 bg-gray-50 p-2 transition-all duration-200 group-hover:border-blue-200 group-hover:bg-blue-50 group-hover:shadow-sm">
                      <Image
                        src={logo}
                        alt={`${brand} logo`}
                        width={140}
                        height={90}
                        unoptimized
                        className="max-h-full max-w-full object-contain"
                      />
                    </div>

                    {/* Brand name */}
                    <span className="text-[13px] font-medium leading-tight text-gray-900 transition-colors group-hover:text-brand-700">
                      {brand}
                    </span>
                  </Link>
                );
              })}
            </div>
          </div>,
          document.body
        )}
    </div>
  );
}
