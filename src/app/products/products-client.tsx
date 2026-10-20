"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { ChevronDown, ChevronRight, Grid2X2, Grid3X3, List } from "lucide-react";
import { ProductCard } from "@/components/product/product-card";
import { SkeletonProductGrid } from "@/components/product/skeleton-product-grid";
import { toDisplayProduct } from "@/lib/shopify/to-display-product";
import { gaItem, trackEvent } from "@/lib/analytics";
import type { Product } from "@/lib/data/types";
import type { CollectionBottomContent } from "@/lib/shopify/shopify-types";

type ViewMode = "grid-2" | "grid-3" | "grid-4" | "list";

const PRODUCTS_PER_PAGE = 30;

// Up to 5 page numbers, centered on the current page and clamped to the valid range.
function getPageNumbers(currentPage: number, totalPages: number): number[] {
  const windowSize = 5;
  let start = Math.max(1, currentPage - Math.floor(windowSize / 2));
  const end = Math.min(totalPages, start + windowSize - 1);
  start = Math.max(1, end - windowSize + 1);

  return Array.from({ length: end - start + 1 }, (_, i) => start + i);
}

interface Category {
  id: string;
  title: string;
  handle: string;
  description?: string;
  subCategories: Category[];
}

// The tree is nested to three levels (root → brand → model range) and a category at any
// of them can be the selected one, so the lookup walks the whole branch rather than only
// the roots. The whole path is returned, not just the match: the sidebar needs the
// ancestors above the selection to know which branches to open.
function findCategoryPath(categories: Category[], handle: string): Category[] {
  for (const category of categories) {
    if (category.handle === handle) return [category];
    const below = findCategoryPath(category.subCategories ?? [], handle);
    if (below.length > 0) return [category, ...below];
  }
  return [];
}

// Brand cards filter by Shopify's vendor field, which is a name rather than a handle, so
// the collection mirroring that brand is found by title. The two are maintained
// separately in the admin and their casing drifts ("IMOU" the vendor, "Imou" the
// collection), so the comparison ignores it.
function findCategoryByTitle(categories: Category[], title: string): Category | undefined {
  const target = title.trim().toLowerCase();

  for (const category of categories) {
    if (category.title.trim().toLowerCase() === target) return category;
    const match = findCategoryByTitle(category.subCategories ?? [], title);
    if (match) return match;
  }
  return undefined;
}

// Past this, a Shopify description is long enough to push the grid below the fold, so it
// is collapsed behind "Read more" instead. Counting characters keeps the decision the
// same on the server and the client - measuring the rendered height would not.
const DESCRIPTION_CLAMP_LENGTH = 260;

interface CategoryFilterItemProps {
  category: Category;
  /** 0 for a root; anything deeper is rendered indented and in the smaller type. */
  depth: number;
  selectedCategory: string;
  expandedCategories: Set<string>;
  /** Attached to whichever row is selected so the list can scroll it into view. */
  selectedRowRef: React.RefObject<HTMLDivElement | null>;
  onSelect: (handle: string) => void;
  onToggle: (handle: string) => void;
}

// One row of the category filter, rendered recursively so every level of the tree is
// reachable - a leaf such as "Dahua 4G Cameras" sits two levels below its root.
function CategoryFilterItem({
  category,
  depth,
  selectedCategory,
  expandedCategories,
  selectedRowRef,
  onSelect,
  onToggle,
}: CategoryFilterItemProps) {
  const subCategories = category.subCategories ?? [];
  const hasSubCategories = subCategories.length > 0;
  const isExpanded = expandedCategories.has(category.handle);
  const isSelected = selectedCategory === category.handle;

  return (
    <div>
      <div
        ref={isSelected ? selectedRowRef : undefined}
        className="flex items-center gap-1"
      >
        <label className="flex flex-1 items-center gap-3 cursor-pointer min-w-0">
          <input
            type="radio"
            name="category"
            checked={isSelected}
            onChange={() => onSelect(category.handle)}
            className="w-4 h-4 shrink-0"
          />
          <span
            className={`truncate ${
              depth === 0 ? "text-gray-700 font-medium" : "text-gray-600 text-sm"
            }`}
          >
            {category.title}
          </span>
        </label>
        {hasSubCategories && (
          <button
            type="button"
            onClick={() => onToggle(category.handle)}
            aria-label={isExpanded ? `Collapse ${category.title}` : `Expand ${category.title}`}
            aria-expanded={isExpanded}
            className="shrink-0 p-1 text-gray-400 hover:text-gray-700 cursor-pointer"
          >
            {isExpanded ? (
              <ChevronDown className="w-4 h-4" />
            ) : (
              <ChevronRight className="w-4 h-4" />
            )}
          </button>
        )}
      </div>
      {hasSubCategories && isExpanded && (
        <div className="ml-7 mt-2 space-y-2">
          {subCategories.map((subCategory) => (
            <CategoryFilterItem
              key={subCategory.handle}
              category={subCategory}
              depth={depth + 1}
              selectedCategory={selectedCategory}
              expandedCategories={expandedCategories}
              selectedRowRef={selectedRowRef}
              onSelect={onSelect}
              onToggle={onToggle}
            />
          ))}
        </div>
      )}
    </div>
  );
}

interface ProductsPageClientProps {
  /**
   * Set by /collections/[handle]. The path segment is the canonical way to scope the grid
   * to a collection; ?collection= is kept working for older links via a redirect.
   */
  initialCollection?: string;
  /**
   * The collection page already resolved these server-side, so the heading renders with
   * the first paint instead of waiting for the category tree to arrive.
   */
  initialCollectionTitle?: string;
  initialCollectionDescription?: string;
  /**
   * The page linked in the collection's custom.bottom_page. Passed in so it is part of the
   * server-rendered page, where search engines read it, rather than arriving with the grid.
   */
  initialCollectionBottomContent?: CollectionBottomContent;
}

export function ProductsPageClient({
  initialCollection,
  initialCollectionTitle,
  initialCollectionDescription,
  initialCollectionBottomContent,
}: ProductsPageClientProps = {}) {
  const searchParams = useSearchParams();
  const collectionParam = initialCollection ?? searchParams.get("collection");
  const searchQuery = searchParams.get("q") || "";
  // Set by the brand cards on the homepage. Matched against Shopify's vendor field.
  const brandParam = searchParams.get("brand") || "";
  // Set by a homepage section's "View All Products" link. A homepage_sections handle.
  const sectionParam = searchParams.get("section") || "";

  const [viewMode, setViewMode] = useState<ViewMode>("grid-3");
  const [sortBy, setSortBy] = useState("best-selling");
  const [selectedCategory, setSelectedCategory] = useState(collectionParam || "all");
  const [selectedBrand, setSelectedBrand] = useState(brandParam);
  const [selectedSection, setSelectedSection] = useState(sectionParam);
  // Resolved by the API from the section handle, so the grid can show "Best Selling
  // Products" rather than "best-selling-products".
  const [sectionTitle, setSectionTitle] = useState("");
  // Merchant-written copy shown below the grid, from the selected collection's
  // custom.bottom_page. Only collection filters carry it.
  const [bottomContent, setBottomContent] = useState<CollectionBottomContent | null>(
    initialCollectionBottomContent ?? null
  );
  const [inStockOnly, setInStockOnly] = useState(true);
  const [categories, setCategories] = useState<Category[]>([]);
  // `products` holds only the page being shown; the totals describe the whole filtered
  // set and come from Shopify's count rather than from the length of what was fetched.
  const [products, setProducts] = useState<Product[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const latestRequest = useRef(0);
  const categoryListRef = useRef<HTMLDivElement | null>(null);
  const selectedCategoryRowRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    setSelectedCategory(collectionParam || "all");
  }, [collectionParam]);

  // Following a different brand card re-scopes the grid without a full remount.
  useEffect(() => {
    setSelectedBrand(brandParam);
    if (brandParam) {
      setSelectedCategory("all");
      setSelectedSection("");
    }
  }, [brandParam]);

  // Same for a "View All Products" link from a homepage section.
  useEffect(() => {
    setSelectedSection(sectionParam);
    if (sectionParam) {
      setSelectedCategory("all");
      setSelectedBrand("");
    }
  }, [sectionParam]);

  // Picking a category is a deliberate move away from the brand or section filter.
  const chooseCategory = (handle: string) => {
    setSelectedCategory(handle);
    setSelectedBrand("");
    setSelectedSection("");
  };

  useEffect(() => {
    async function fetchCategories() {
      try {
        const response = await fetch("/api/collections/organized");
        if (response.ok) {
          const data = await response.json();
          setCategories(data.data || []);
        }
      } catch (error) {
        console.error("Error fetching categories:", error);
      }
    }

    fetchCategories();
  }, []);

  // Changing a filter has to restart at page 1, and the fetch below has to see that in
  // the same render - resetting from an effect would fire one request for the stale page
  // first. Adjusting state during render is React's own answer to this.
  const filterKey = `${selectedCategory}|${selectedBrand}|${selectedSection}|${searchQuery}`;
  const [lastFilterKey, setLastFilterKey] = useState(filterKey);
  if (lastFilterKey !== filterKey) {
    setLastFilterKey(filterKey);
    setCurrentPage(1);
    // The heading below now belongs to a different category, so its description starts
    // collapsed again rather than inheriting the previous one's expanded state.
    setIsDescriptionExpanded(false);
    // Likewise the bottom copy: the previous category's must not sit under the new grid
    // while its products load.
    setBottomContent(null);
  }

  useEffect(() => {
    // Only the newest request may write to state: pages and filters can change faster
    // than Shopify answers, and a slow earlier response must not land on a newer one.
    const request = ++latestRequest.current;

    async function fetchProducts() {
      setIsLoading(true);
      try {
        const params = new URLSearchParams({
          page: String(currentPage),
          pageSize: String(PRODUCTS_PER_PAGE),
        });
        if (searchQuery) params.set("q", searchQuery);
        else if (selectedSection) params.set("section", selectedSection);
        else if (selectedBrand) params.set("brand", selectedBrand);
        else if (selectedCategory !== "all") params.set("collection", selectedCategory);

        const response = await fetch(`/api/products?${params}`);
        if (request !== latestRequest.current) return;

        if (response.ok) {
          const data = await response.json();
          if (request !== latestRequest.current) return;
          const pageProducts: Product[] = (data.data || []).map(toDisplayProduct);
          setProducts(pageProducts);
          setTotalCount(data.totalCount ?? 0);
          setTotalPages(Math.max(1, data.totalPages ?? 1));
          setSectionTitle(data.sectionTitle || "");
          setBottomContent(data.bottomContent ?? null);
          // Counted for each page shown, named after the filter the request above used.
          trackEvent("view_item_list", {
            item_list_name: searchQuery || selectedSection || selectedBrand || selectedCategory,
            items: pageProducts.map(gaItem),
          });
        } else {
          // A deleted or renamed section handle 404s; show an empty grid rather
          // than the previous filter's products.
          setProducts([]);
          setTotalCount(0);
          setTotalPages(1);
          setSectionTitle("");
          setBottomContent(null);
        }
      } catch (error) {
        console.error("Error fetching products:", error);
      } finally {
        if (request === latestRequest.current) setIsLoading(false);
      }
    }

    fetchProducts();
  }, [selectedCategory, selectedBrand, selectedSection, searchQuery, currentPage]);

  // Every search is counted once, whichever search box or shared link it came from.
  useEffect(() => {
    if (searchQuery) trackEvent("search", { search_term: searchQuery });
  }, [searchQuery]);

  // The selected category and every ancestor above it, root first. Empty for "all", and
  // empty until the tree has loaded.
  const selectedCategoryPath = useMemo(
    () => (selectedCategory === "all" ? [] : findCategoryPath(categories, selectedCategory)),
    [categories, selectedCategory]
  );

  // Landing on /collections/<sub-category>, or following a nav link to one, has to reveal
  // it in the filter: otherwise the checked radio is hidden inside a collapsed branch and
  // the sidebar reads as though nothing is filtered. Branches the visitor opened by hand
  // stay open.
  useEffect(() => {
    const ancestors = selectedCategoryPath.slice(0, -1);
    if (ancestors.length === 0) return;

    setExpandedCategories((prev) => {
      if (ancestors.every((ancestor) => prev.has(ancestor.handle))) return prev;
      const next = new Set(prev);
      for (const ancestor of ancestors) next.add(ancestor.handle);
      return next;
    });
  }, [selectedCategoryPath]);

  // Opening the branch is not enough on its own - the list is a fixed-height scroller, so
  // the revealed row can still be below its fold. Only the list scrolls here; nudging the
  // page itself would yank the visitor away from the grid.
  useEffect(() => {
    const list = categoryListRef.current;
    const row = selectedCategoryRowRef.current;
    if (!list || !row) return;

    const listBox = list.getBoundingClientRect();
    const rowBox = row.getBoundingClientRect();
    if (rowBox.top >= listBox.top && rowBox.bottom <= listBox.bottom) return;

    list.scrollTop += rowBox.top - listBox.top - list.clientHeight / 2 + rowBox.height / 2;
  }, [selectedCategoryPath, expandedCategories]);

  const toggleCategoryExpanded = (handle: string) => {
    setExpandedCategories((prev) => {
      const next = new Set(prev);
      if (next.has(handle)) {
        next.delete(handle);
      } else {
        next.add(handle);
      }
      return next;
    });
  };

  const getGridClass = () => {
    switch (viewMode) {
      case "grid-2":
        return "grid-cols-1 sm:grid-cols-2";
      case "grid-3":
        return "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3";
      case "grid-4":
        return "grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4";
      case "list":
        return "grid-cols-1";
      default:
        return "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3";
    }
  };

  const allCategories: Category[] = [
    { id: "all", title: "All Categories", handle: "all", subCategories: [] },
    ...categories,
  ];

  const selectedCategoryNode = selectedCategoryPath[selectedCategoryPath.length - 1];

  // A brand card narrows the grid by vendor, but nearly every brand is also a collection
  // in the tree - "IMOU" sits under CCTV & Security Cameras. Pairing them by title lets a
  // brand-filtered grid carry the same heading and description as that collection.
  const brandCategory = useMemo(
    () => (selectedBrand ? findCategoryByTitle(categories, selectedBrand) : undefined),
    [categories, selectedBrand]
  );

  // Whichever category the heading is describing. Brand and category filters replace one
  // another, so only one of these is ever set.
  const headingCategory = selectedBrand ? brandCategory : selectedCategoryNode;

  // Until the tree arrives, a collection page can still name the category it was rendered
  // for. Once another category is picked, that server-supplied fallback no longer applies.
  const isInitialCollection =
    Boolean(initialCollection) && selectedCategory === initialCollection;
  // A brand with no collection of its own still gets a heading, just without the copy.
  const fallbackTitle =
    selectedBrand || (isInitialCollection ? initialCollectionTitle : undefined);
  const fallbackDescription =
    !selectedBrand && isInitialCollection ? initialCollectionDescription : undefined;

  const categoryTitle = headingCategory?.title ?? fallbackTitle;
  const categoryDescription = (headingCategory?.description ?? fallbackDescription)?.trim();

  // A search, or a homepage section, is showing something assembled from across the
  // catalogue, so a single category's heading would be describing the wrong set.
  const showCategoryHeader = !searchQuery && !selectedSection && Boolean(categoryTitle);
  const isDescriptionClamped =
    !!categoryDescription && categoryDescription.length > DESCRIPTION_CLAMP_LENGTH;
  // The collection page hands over its <h1>; on /products the page keeps its own.
  const CategoryHeading = initialCollection ? "h1" : "h2";

  const selectedCategoryTitle = searchQuery
    ? `Search results for "${searchQuery}"`
    : selectedSection
      ? sectionTitle || selectedSection
      : categoryTitle || "All Products";

  // The server already returned exactly this page, so there is nothing left to slice.
  const safePage = Math.min(currentPage, totalPages);
  const pageStart = (safePage - 1) * PRODUCTS_PER_PAGE;
  const paginatedProducts = products;
  const goToPage = (page: number) => {
    setCurrentPage(Math.min(Math.max(page, 1), totalPages));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto px-8 lg:px-28 py-8">
        {/* Selected Category Header */}
        {showCategoryHeader && (
          <div className="mb-6 border-b border-gray-200 pb-6">
            <CategoryHeading className="text-2xl font-bold text-gray-900 lg:text-3xl">
              {categoryTitle}
            </CategoryHeading>
            {categoryDescription && (
              <>
                <p
                  className={`mt-3 max-w-4xl text-gray-600 ${
                    isDescriptionClamped && !isDescriptionExpanded ? "line-clamp-3" : ""
                  }`}
                >
                  {categoryDescription}
                </p>
                {isDescriptionClamped && (
                  <button
                    type="button"
                    onClick={() => setIsDescriptionExpanded((expanded) => !expanded)}
                    aria-expanded={isDescriptionExpanded}
                    className="mt-2 text-sm font-medium text-brand-700 underline cursor-pointer hover:text-brand-500"
                  >
                    {isDescriptionExpanded ? "Show less" : "Read more"}
                  </button>
                )}
              </>
            )}
          </div>
        )}

        {/* Mobile/Tablet Categories - Horizontal Scrollable Pills */}
        <div className="lg:hidden mb-6">
          <div className="flex overflow-x-auto gap-2 pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {allCategories.map((category) => (
              <button
                key={category.handle}
                onClick={() => chooseCategory(category.handle)}
                className={`px-4 py-2 rounded-full whitespace-nowrap cursor-pointer transition-colors font-medium text-sm shrink-0 ${
                  selectedCategory === category.handle
                    ? "bg-brand-gradient text-white"
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }`}
              >
                {category.title}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-4">
          {/* Sidebar - Desktop Only */}
          <div className="hidden lg:block lg:col-span-1">
            <div className="bg-white rounded-lg p-6 lg:sticky lg:top-4">
              <h3 className="text-lg font-bold mb-6">Product Categories</h3>
              <div
                ref={categoryListRef}
                className="space-y-3 max-h-[28rem] overflow-y-auto pr-2"
              >
                {allCategories.map((category) => (
                  <CategoryFilterItem
                    key={category.handle}
                    category={category}
                    depth={0}
                    selectedCategory={selectedCategory}
                    expandedCategories={expandedCategories}
                    selectedRowRef={selectedCategoryRowRef}
                    onSelect={chooseCategory}
                    onToggle={toggleCategoryExpanded}
                  />
                ))}
              </div>

              <div className="mt-8 pt-8 border-t">
                <h4 className="font-bold mb-4">Stock Status</h4>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={inStockOnly}
                    onChange={(e) => setInStockOnly(e.target.checked)}
                    className="w-4 h-4"
                  />
                  <span className="text-gray-700">In Stock</span>
                </label>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* Header with Controls */}
            <div className="bg-white rounded-lg p-6 mb-8 lg:sticky lg:top-0 lg:z-10">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  {isLoading ? (
                    <div className="h-5 w-64 max-w-full animate-pulse rounded bg-gray-200" />
                  ) : (
                    <p className="text-gray-600">
                      Showing <strong>{products.length === 0 ? 0 : pageStart + 1}-{pageStart + products.length}</strong> of{" "}
                      <strong>{totalCount}</strong> results in{" "}
                      <strong>{selectedCategoryTitle}</strong>
                    </p>
                  )}
                </div>

                {/* View Mode Buttons */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setViewMode("grid-2")}
                    className={`p-2 rounded cursor-pointer ${
                      viewMode === "grid-2"
                        ? "bg-brand-gradient text-white"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                    title="2 Columns"
                  >
                    <Grid2X2 className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => setViewMode("grid-3")}
                    className={`p-2 rounded cursor-pointer ${
                      viewMode === "grid-3"
                        ? "bg-brand-gradient text-white"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                    title="3 Columns"
                  >
                    <Grid3X3 className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => setViewMode("grid-4")}
                    className={`p-2 rounded cursor-pointer ${
                      viewMode === "grid-4"
                        ? "bg-brand-gradient text-white"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                    title="4 Columns"
                  >
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <rect x="3" y="3" width="4" height="4" />
                      <rect x="10" y="3" width="4" height="4" />
                      <rect x="17" y="3" width="4" height="4" />
                      <rect x="3" y="10" width="4" height="4" />
                      <rect x="10" y="10" width="4" height="4" />
                      <rect x="17" y="10" width="4" height="4" />
                      <rect x="3" y="17" width="4" height="4" />
                      <rect x="10" y="17" width="4" height="4" />
                      <rect x="17" y="17" width="4" height="4" />
                    </svg>
                  </button>
                  <button
                    onClick={() => setViewMode("list")}
                    className={`p-2 rounded cursor-pointer ${
                      viewMode === "list"
                        ? "bg-brand-gradient text-white"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                    title="List View"
                  >
                    <List className="w-5 h-5" />
                  </button>
                </div>

                {/* Sort Dropdown */}
                <div className="flex items-center gap-2">
                  <label className="text-gray-600 text-sm font-medium">Sort by:</label>
                  <div className="relative">
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                      className="appearance-none bg-white border border-gray-300 rounded px-3 py-2 pr-8 text-sm focus:outline-none focus:ring-2 focus:ring-brand-700 cursor-pointer"
                    >
                      <option value="best-selling">Best selling</option>
                      <option value="newest">Newest</option>
                      <option value="price-low">Price: Low to High</option>
                      <option value="price-high">Price: High to Low</option>
                      <option value="name">Name: A to Z</option>
                    </select>
                    <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none text-gray-500" />
                  </div>
                </div>
              </div>
            </div>

            {/* Products Grid */}
            {isLoading ? (
              <SkeletonProductGrid count={PRODUCTS_PER_PAGE} gridClass={getGridClass()} />
            ) : products.length > 0 ? (
              <div className={`grid gap-3 ${getGridClass()}`}>
                {paginatedProducts.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    layout="vertical"
                    showBadge={true}
                    showQuickActions={true}
                  />
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center gap-3 py-12">
                <p className="text-gray-600">
                  {selectedSection
                    ? `No products found in ${sectionTitle || selectedSection}.`
                    : selectedBrand
                      ? `No products found for ${selectedBrand}.`
                      : "No products found in this category."}
                </p>
                {(selectedBrand || selectedSection) && (
                  <button
                    type="button"
                    onClick={() => chooseCategory("all")}
                    className="text-brand-700 underline cursor-pointer hover:text-brand-500"
                  >
                    Browse all products
                  </button>
                )}
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-8 flex items-center justify-center gap-2">
                <button
                  onClick={() => goToPage(safePage - 1)}
                  disabled={safePage === 1}
                  className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-100 cursor-pointer disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-white"
                >
                  Previous
                </button>
                {getPageNumbers(safePage, totalPages).map((page) => (
                  <button
                    key={page}
                    onClick={() => goToPage(page)}
                    aria-current={page === safePage ? "page" : undefined}
                    className={`px-4 py-2 rounded cursor-pointer ${
                      page === safePage
                        ? "bg-brand-gradient text-white"
                        : "border border-gray-300 hover:bg-gray-100"
                    }`}
                  >
                    {page}
                  </button>
                ))}
                <button
                  onClick={() => goToPage(safePage + 1)}
                  disabled={safePage === totalPages}
                  className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-100 cursor-pointer disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-white"
                >
                  Next
                </button>
              </div>
            )}
          </div>
        </div>

        {/* The Shopify page linked in the collection's custom.bottom_page */}
        {bottomContent && (
          <section className="mt-16 border-t border-gray-200 pt-10">
            {bottomContent.title && (
              <h2 className="mb-6 text-3xl font-semibold text-gray-900 lg:text-4xl">
                {bottomContent.title}
              </h2>
            )}
            <div
              className="shopify-rich-text collection-bottom-content"
              dangerouslySetInnerHTML={{ __html: bottomContent.html }}
            />
          </section>
        )}
      </div>
    </div>
  );
}
