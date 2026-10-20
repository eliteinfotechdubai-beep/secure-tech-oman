"use client";

import Link from "next/link";
import Image from "next/image";
import { ChevronRight, Menu } from "lucide-react";
import { SUPPORT_LINK } from "@/lib/constants";
import { useMemo, useRef, useState, useEffect, useLayoutEffect } from "react";
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
  // A section is a child category: its heading links to that collection, its items to the
  // sub-categories under it. Both levels are browsable, so both carry an href.
  sections: { title: string; href: string; items: { label: string; href: string }[] }[];
  image?: { url: string; altText?: string };
};

// Sentinel key for the "Shop By Category" dropdown so it can share the hover state
// with the individual category triggers — only one panel is ever open.
const CATEGORIES_KEY = "__shop_by_category__";

export function CategoryNav() {
  const [hoveredCategory, setHoveredCategory] = useState<string | null>(null);
  const [dropdownPosition, setDropdownPosition] = useState<{ top: number; left: number } | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [activeRootHandle, setActiveRootHandle] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const closeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const categoryDropdownRef = useRef<HTMLDivElement | null>(null);

  // The panel opens under its trigger; for triggers near the right edge, slide it left so it stays on screen.
  useLayoutEffect(() => {
    const panel = categoryDropdownRef.current;
    if (!panel || !dropdownPosition) return;
    const gutter = 16;
    const maxLeft = window.scrollX + document.documentElement.clientWidth - panel.offsetWidth - gutter;
    panel.style.left = `${Math.max(window.scrollX + gutter, Math.min(dropdownPosition.left, maxLeft))}px`;
  }, [hoveredCategory, dropdownPosition]);

  useEffect(() => {
    async function fetchCategories() {
      try {
        const response = await fetch('/api/collections/organized');
        if (response.ok) {
          const data = await response.json();
          setCategories(data.data || []);
        }
      } catch (error) {
        console.error('Error fetching categories:', error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchCategories();
  }, []);

  // The nav row is the curated shortlist: roots ticked as custom.main_category in Shopify.
  // Falling back to every root keeps the row from rendering empty if nothing is ticked yet.
  const mainCategories = useMemo(() => {
    const flagged = categories.filter((category) => category.isMainCategory);
    return flagged.length > 0 ? flagged : categories;
  }, [categories]);

  // Default to the first category until the user picks one.
  const selectedRoot =
    categories.find((category) => category.handle === activeRootHandle) ?? categories[0];

  const clearCloseTimeout = () => {
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current);
      closeTimeoutRef.current = null;
    }
  };

  const openDropdown = (label: string, target: HTMLElement) => {
    clearCloseTimeout();
    const rect = target.getBoundingClientRect();
    setDropdownPosition({ top: rect.bottom + window.scrollY, left: rect.left + window.scrollX });
    setHoveredCategory(label);
  };

  const scheduleClose = () => {
    clearCloseTimeout();
    closeTimeoutRef.current = setTimeout(closeDropdown, 100);
  };

  const closeDropdown = () => {
    clearCloseTimeout();
    setHoveredCategory(null);
    setDropdownPosition(null);
    setActiveRootHandle(null);
  };

  const transformToSections = (category: Category): CategoryData => {
    if (category.subCategories.length === 0) {
      return { sections: [] };
    }

    const sections = category.subCategories.map(subCat => ({
      title: subCat.title,
      href: `/collections/${subCat.handle}`,
      items: subCat.subCategories.map(item => ({
        label: item.title,
        href: `/collections/${item.handle}`
      }))
    }));

    return {
      sections,
      image: category.image
    };
  };

  const getCategoryData = (title: string): CategoryData | null => {
    const category = categories.find(cat => cat.title === title);
    return category ? transformToSections(category) : null;
  };

  const activeCategoryData = hoveredCategory ? getCategoryData(hoveredCategory) : null;

  if (isLoading) {
    return (
      <div className="hidden border-b border-border bg-background md:block">
        <div className="mx-auto flex items-center gap-8 px-8 lg:px-28 py-3.5">
          <div className="h-4 w-24 bg-gray-200 rounded animate-pulse" />
          <div className="flex-1 flex gap-7">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-4 w-24 bg-gray-200 rounded animate-pulse" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="hidden border-b border-border bg-background md:block">
      <div className="mx-auto flex items-center gap-8 px-8 lg:px-28 py-3.5">
        {/* Negative margins let the trigger fill the row height so the open state reads as a tab joined to the panel */}
        <div
          className="-my-3.5 -ml-4 w-56 shrink-0 border-r border-gray-200 hover:bg-gray-50"
          onMouseEnter={(e) => categories.length > 0 && openDropdown(CATEGORIES_KEY, e.currentTarget)}
          onMouseLeave={scheduleClose}
        >
          <Link
            href="/products"
            className={`flex items-center gap-2 px-4 py-3.5 text-sm font-semibold cursor-pointer transition-colors ${
              hoveredCategory === CATEGORIES_KEY
                ? "bg-brand-700 text-white"
                : "text-neutral-900 hover:text-brand-700"
            }`}
          >
            <Menu className="size-4" />
            Shop By Category
          </Link>
        </div>
        <nav className="relative flex min-w-0 flex-1 items-center gap-7 overflow-x-auto whitespace-nowrap text-sm font-medium text-neutral-700 scrollbar-hide">
          {mainCategories.map((category) => {
            const categoryData = getCategoryData(category.title);
            const hasData = categoryData && categoryData.sections.length > 0;

            return (
              <div
                key={category.id}
                className="relative shrink-0"
                data-category={category.title}
                onMouseEnter={(e) =>
                  hasData && openDropdown(category.title, e.currentTarget)
                }
                onMouseLeave={scheduleClose}
              >
                <Link
                  href={`/collections/${category.handle}`}
                  className="py-2 px-1 hover:text-neutral-950 cursor-pointer transition-colors border-b-2 border-transparent group-hover:border-brand-700 group-hover:text-brand-700"
                >
                  {category.title}
                </Link>
              </div>
            );
          })}
        </nav>
        <Link
          href={SUPPORT_LINK.href}
          className="shrink-0 text-sm font-bold text-brand-700 hover:text-brand-800 cursor-pointer transition-colors"
        >
          {SUPPORT_LINK.label}
        </Link>
      </div>

      {hoveredCategory === CATEGORIES_KEY &&
        dropdownPosition &&
        categories.length > 0 &&
        typeof document !== "undefined" &&
        createPortal(
          <div
            className="absolute z-50 flex h-[min(80vh,36rem)] w-[min(90vw,56rem)] overflow-hidden rounded-b-md border border-t-0 border-gray-200 bg-white shadow-lg"
            style={{ top: dropdownPosition.top, left: dropdownPosition.left }}
            onMouseEnter={clearCloseTimeout}
            onMouseLeave={scheduleClose}
          >
            {/* Left: every top-level category, not just the ones in the nav row above */}
            <ul className="w-60 shrink-0 overflow-y-auto border-r border-gray-200 px-5 py-1">
              {categories.map((category) => {
                const isSelected = selectedRoot?.handle === category.handle;
                return (
                  <li key={category.id}>
                    <button
                      type="button"
                      onClick={() => setActiveRootHandle(category.handle)}
                      aria-pressed={isSelected}
                      className={`flex w-full cursor-pointer items-center justify-between gap-2 border-b border-gray-200 py-3 text-left text-[14px] transition-colors hover:text-brand-700 ${
                        isSelected ? "font-medium text-brand-700" : "text-[#222222]"
                      }`}
                    >
                      <span className="min-w-0 truncate">{category.title}</span>
                      <ChevronRight className="size-4 shrink-0 text-neutral-500" />
                    </button>
                  </li>
                );
              })}
            </ul>

            {/* Right: the selected category's children, each heading followed by its own children */}
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

                  {selectedRoot.subCategories.length > 0 ? (
                    <div className="grid grid-cols-2 gap-x-8 gap-y-6 lg:grid-cols-3">
                      {selectedRoot.subCategories.map((child) => (
                        <div key={child.id} className="min-w-0">
                          <Link
                            href={`/collections/${child.handle}`}
                            onClick={closeDropdown}
                            className="block text-[14px] font-medium text-[#222222] hover:text-brand-700"
                          >
                            {child.title}
                          </Link>

                          {child.subCategories.length > 0 && (
                            <div className="mt-3 space-y-1.5">
                              {child.subCategories.map((leaf) => (
                                <Link
                                  key={leaf.id}
                                  href={`/collections/${leaf.handle}`}
                                  onClick={closeDropdown}
                                  className="block text-[14px] font-normal leading-snug text-[#666666] hover:text-brand-700"
                                >
                                  {leaf.title}
                                </Link>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-[14px] text-[#666666]">
                      No sub-categories yet — browse {selectedRoot.title} directly.
                    </p>
                  )}
                </>
              )}
            </div>
          </div>,
          document.body,
        )}

      {hoveredCategory &&
        hoveredCategory !== CATEGORIES_KEY &&
        dropdownPosition &&
        activeCategoryData &&
        activeCategoryData.sections.length > 0 &&
        typeof document !== "undefined" &&
        createPortal(
          <div
            ref={categoryDropdownRef}
            className="absolute z-50 max-h-[min(75vh,36rem)] w-[min(calc(100vw-2rem),48rem)] overflow-y-auto rounded-md border border-gray-200 bg-white px-6 pt-6 pb-4 shadow-lg"
            style={{ top: dropdownPosition.top, left: dropdownPosition.left }}
            onMouseEnter={clearCloseTimeout}
            onMouseLeave={scheduleClose}
          >
            <div className="flex gap-8">
              {/* Left side: brand sections, three per row */}
              <div className="grid min-w-0 flex-1 grid-cols-3 gap-x-8 gap-y-6">
                {activeCategoryData.sections.map((section) => (
                  <div key={section.title} className="min-w-0">
                    <h4 className="mb-1">
                      <Link
                        href={section.href}
                        className="block font-medium text-[14px] text-[#222222] hover:text-brand-700 cursor-pointer transition-colors"
                      >
                        {section.title}
                      </Link>
                    </h4>
                    <div className="space-y-1.5 mt-3">
                      {section.items.map((item) => (
                        <Link
                          key={item.label}
                          href={item.href}
                          className="block text-[14px] font-normal text-[#666666] hover:text-brand-700 cursor-pointer transition-colors"
                        >
                          {item.label}
                        </Link>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              {/* Right side: product image or placeholder */}
              {activeCategoryData.image ? (
                <div className="w-36 h-36 shrink-0 ml-4 flex items-center justify-center">
                  <Image
                    src={activeCategoryData.image.url}
                    alt={activeCategoryData.image.altText || hoveredCategory || ""}
                    width={144}
                    height={144}
                    className="w-full h-full object-contain"
                  />
                </div>
              ) : null}
            </div>
          </div>,
          document.body,
        )}
    </div>
  );
}
