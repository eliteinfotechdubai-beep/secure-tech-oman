
"use client";

import Link from "next/link";
import Image from "next/image";
import { ArrowRight, ChevronRight, Menu } from "lucide-react";
import { SUPPORT_LINK } from "@/lib/constants";
import {
  BRAND_NAMES,
  DEFAULT_PREVIEW_BRAND,
  buildBrandCollections,
  buildBrandImages,
  fetchFeaturedBrands,
  getBrandHref,
  getBrandLogo,
  getBrandPreview,
  type FeaturedBrand,
} from "./brand-menu-data";
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

  // Brands mega menu: brand shown in the right preview panel.
  const [previewBrand, setPreviewBrand] = useState(
    DEFAULT_PREVIEW_BRAND
  );

  // Brand images from /api/featured-brands; null until first loaded.
  const [featuredBrands, setFeaturedBrands] =
    useState<FeaturedBrand[] | null>(null);

  const brandsTriggerRef =
    useRef<HTMLDivElement | null>(null);

  // Pointer type of the last press, so touch taps can preview before navigating.
  const lastPointerTypeRef = useRef<string | null>(null);

  // Whether the Brands menu was already open when the current tap started.
  const brandsOpenAtPressRef = useRef(false);

  // Load brand images the first time the Brands menu opens.
  useEffect(() => {
    if (hoveredCategory !== BRAND_KEY || featuredBrands !== null) return;

    let cancelled = false;

    fetchFeaturedBrands()
      .then((brands) => {
        if (!cancelled) setFeaturedBrands(brands);
      })
      .catch(() => {
        if (!cancelled) setFeaturedBrands([]);
      });

    return () => {
      cancelled = true;
    };
  }, [hoveredCategory, featuredBrands]);

  // Close the Brands menu when tapping or clicking outside it.
  useEffect(() => {
    if (hoveredCategory !== BRAND_KEY) return;

    const handlePointerDown = (event: PointerEvent) => {
      const target = event.target as Node;

      if (
        categoryDropdownRef.current?.contains(target) ||
        brandsTriggerRef.current?.contains(target)
      ) {
        return;
      }

      if (closeTimeoutRef.current) {
        clearTimeout(closeTimeoutRef.current);
        closeTimeoutRef.current = null;
      }

      setHoveredCategory(null);
      setDropdownPosition(null);
    };

    document.addEventListener("pointerdown", handlePointerDown);

    return () =>
      document.removeEventListener("pointerdown", handlePointerDown);
  }, [hoveredCategory]);

  // Brand image by normalised name.
  const brandImages = useMemo(
    () => buildBrandImages(featuredBrands),
    [featuredBrands]
  );

  // Brand-specific collections by normalised brand name.
  const brandCollections = useMemo(
    () => buildBrandCollections(categories),
    [categories]
  );

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

  // Brands preview panel content.
  const {
    image: previewImage,
    description: previewDescription,
  } = getBrandPreview(previewBrand, brandImages, brandCollections);

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
                  ref={brandsTriggerRef}
                  className="relative shrink-0"
                  onPointerDown={(e) => {
                    lastPointerTypeRef.current = e.pointerType;
                    brandsOpenAtPressRef.current =
                      hoveredCategory === BRAND_KEY;
                  }}
                  onMouseEnter={(e) => {
                    if (hoveredCategory !== BRAND_KEY) {
                      setPreviewBrand(DEFAULT_PREVIEW_BRAND);
                    }

                    openDropdown(
                      BRAND_KEY,
                      e.currentTarget
                    );
                  }}
                  onMouseLeave={scheduleClose}
                >
                  <Link
                    href="/products"
                    onClick={(e) => {
                      const isTouch =
                        lastPointerTypeRef.current === "touch";

                      lastPointerTypeRef.current = null;

                      // First tap on touch screens opens the menu instead of navigating.
                      if (isTouch && !brandsOpenAtPressRef.current) {
                        e.preventDefault();
                        setPreviewBrand(DEFAULT_PREVIEW_BRAND);

                        if (brandsTriggerRef.current) {
                          openDropdown(
                            BRAND_KEY,
                            brandsTriggerRef.current
                          );
                        }
                      }
                    }}
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

      {/* Brands mega menu - logo grid with brand preview */}
      {hoveredCategory === BRAND_KEY &&
        dropdownPosition &&
        typeof document !== "undefined" &&
        createPortal(
          <div
            ref={categoryDropdownRef}
            className="absolute z-50 flex h-[min(80vh,36rem)] w-[min(calc(100vw-2rem),60rem)] overflow-hidden rounded-md border border-gray-200 bg-white shadow-xl"
            style={{
              top: dropdownPosition.top,
              left: dropdownPosition.left,
            }}
            onMouseEnter={clearCloseTimeout}
            onMouseLeave={scheduleClose}
          >

            {/* All 28 brand logos */}
            <div className="min-w-0 flex-1 touch-pan-y overflow-y-auto overscroll-contain p-4 lg:p-5">
              <div className="grid grid-cols-3 gap-2.5 lg:grid-cols-4 lg:gap-3">

                {BRAND_NAMES.map((brand) => {
                  const isSelected = brand === previewBrand;

                  return (
                    <Link
                      key={brand}
                      href={getBrandHref(brand)}
                      aria-current={isSelected ? "true" : undefined}
                      onPointerEnter={(e) => {
                        if (e.pointerType !== "touch") {
                          setPreviewBrand(brand);
                        }
                      }}
                      onFocus={(e) => {
                        // Keyboard focus previews; touch focus is handled on tap.
                        if (e.currentTarget.matches(":focus-visible")) {
                          setPreviewBrand(brand);
                        }
                      }}
                      onPointerDown={(e) => {
                        lastPointerTypeRef.current = e.pointerType;
                      }}
                      onClick={(e) => {
                        const isTouch =
                          lastPointerTypeRef.current === "touch";

                        lastPointerTypeRef.current = null;

                        // On touch screens the first tap previews the brand; a second tap opens its products.
                        if (isTouch && !isSelected) {
                          e.preventDefault();
                          setPreviewBrand(brand);
                          return;
                        }

                        closeDropdown();
                      }}
                      className={`group flex min-w-0 flex-col items-center gap-2 rounded-xl border bg-white p-2.5 text-center transition-all duration-200 ${
                        isSelected
                          ? "border-brand-500 ring-2 ring-blue-100"
                          : "border-gray-200 hover:border-gray-300 hover:shadow-sm"
                      }`}
                    >

                      {/* Brand logo */}
                      <div className="flex h-14 w-full items-center justify-center lg:h-16">
                        <Image
                          src={getBrandLogo(brand)}
                          alt={`${brand} logo`}
                          width={140}
                          height={90}
                          unoptimized
                          className="max-h-full max-w-full object-contain"
                        />
                      </div>

                      {/* Brand name */}
                      <span
                        className={`w-full truncate text-[13px] font-medium leading-tight transition-colors ${
                          isSelected
                            ? "text-brand-700"
                            : "text-gray-900 group-hover:text-brand-700"
                        }`}
                      >
                        {brand}
                      </span>
                    </Link>
                  );
                })}
              </div>
            </div>

            {/* Brand preview */}
            <aside className="flex w-60 shrink-0 flex-col gap-4 overflow-y-auto overscroll-contain bg-brand-700 p-5 text-white lg:w-80">
              <div className="flex h-20 shrink-0 items-center justify-center rounded-lg bg-white p-3">
                <Image
                  key={previewBrand}
                  src={getBrandLogo(previewBrand)}
                  alt={`${previewBrand} logo`}
                  width={180}
                  height={80}
                  unoptimized
                  className="max-h-full max-w-full object-contain"
                />
              </div>

              <div>
                <h3 className="text-lg font-semibold leading-tight">
                  {previewBrand}
                </h3>

                <p className="mt-1.5 text-[13px] leading-relaxed text-white/80">
                  {previewDescription}
                </p>
              </div>

              {/* Brand product image from Shopify, when one is set */}
              {previewImage && (
                <div className="relative aspect-[4/3] w-full shrink-0 overflow-hidden rounded-lg bg-white">
                  <Image
                    key={previewImage}
                    src={previewImage}
                    alt={`${previewBrand} products`}
                    fill
                    sizes="(min-width: 1024px) 280px, 200px"
                    className="object-contain"
                  />
                </div>
              )}

              <Link
                href={getBrandHref(previewBrand)}
                onClick={closeDropdown}
                className="mt-auto inline-flex shrink-0 items-center justify-center gap-2 rounded-md bg-white px-4 py-2.5 text-sm font-semibold text-brand-700 transition-colors hover:bg-blue-50"
              >
                Shop Brand
                <ArrowRight className="size-4" />
              </Link>
            </aside>
          </div>,
          document.body
        )}
    </div>
  );
}
