"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ChevronDown, ClipboardCheck, Search, User } from "lucide-react";
import { ProductImage } from "@/components/product/product-image";
import { Logo } from "@/components/layout/logo";
import { MobileMenu } from "@/components/layout/header/mobile-menu";
import { useProductSearch } from "@/hooks/use-product-search";
import { pickProductImage } from "@/lib/product-image";

interface ParentCategory {
  id: string;
  title: string;
  handle: string;
}

export function SiteHeader() {
  const router = useRouter();
  const [categories, setCategories] = useState<ParentCategory[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [suggestionsOpen, setSuggestionsOpen] = useState(false);
  const { results: suggestions, isSearching } = useProductSearch(searchTerm, 6);

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

  return (
    <div className="border-b border-border bg-background">
      <div className="mx-auto flex items-center gap-4 px-8 lg:px-24 py-3">
        <MobileMenu />
        <Logo />

        <form
          onSubmit={(e) => {
            e.preventDefault();
            const term = searchTerm.trim();
            setSuggestionsOpen(false);
            router.push(term ? `/products?q=${encodeURIComponent(term)}` : "/products");
          }}
          className="relative hidden flex-1 md:flex items-center justify-center gap-4"
        >
          <div className="flex w-full max-w-xl items-stretch overflow-hidden rounded-md border border-border">
            <div className="relative flex items-center border-r border-border bg-secondary/60 pl-3 pr-8">
              <select
                aria-label="Category"
                defaultValue="all"
                className="appearance-none bg-transparent py-2 pr-4 text-sm text-neutral-700 outline-none"
              >
                <option value="all">All Categories</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.handle}>
                    {category.title}
                  </option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-2.5 size-4 text-neutral-500" />
            </div>
            <input
              type="search"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onFocus={() => setSuggestionsOpen(true)}
              onBlur={() => setTimeout(() => setSuggestionsOpen(false), 150)}
              placeholder="Search for products ..."
              className="flex-1 px-3 text-sm outline-none placeholder:text-neutral-400"
            />
            <button
              type="submit"
              aria-label="Search"
              className="flex w-14 shrink-0 items-center justify-center bg-brand-gradient text-white opacity-90 hover:opacity-100"
            >
              <Search className="size-5" />
            </button>
          </div>

          {suggestionsOpen && searchTerm.trim() && (
            <div className="absolute top-full z-20 mt-1 w-full max-w-xl rounded-md border border-border bg-white shadow-lg">
              {isSearching && (
                <p className="p-3 text-center text-sm text-neutral-500">Searching...</p>
              )}
              {!isSearching && suggestions.length === 0 && (
                <p className="p-3 text-center text-sm text-neutral-500">
                  No products found for &ldquo;{searchTerm}&rdquo;.
                </p>
              )}
              {!isSearching && suggestions.length > 0 && (
                <div className="max-h-96 overflow-y-auto p-1">
                  {suggestions.map((product) => (
                    <Link
                      key={product.id}
                      href={`/products/${product.id}`}
                      onClick={() => setSuggestionsOpen(false)}
                      className="flex items-center gap-3 rounded-md p-2 hover:bg-neutral-100 cursor-pointer"
                    >
                      <div className="relative size-10 shrink-0 overflow-hidden rounded border border-border bg-white">
                        <ProductImage
                          src={pickProductImage(product.images)}
                          alt={product.name}
                          icon={product.icon}
                          sizes="40px"
                          iconClassName="size-6"
                        />
                      </div>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-neutral-900">{product.name}</p>
                        {product.vendor && (
                          <p className="truncate text-xs text-neutral-500">{product.vendor}</p>
                        )}
                      </div>
                    </Link>
                  ))}
                  <button
                    type="submit"
                    className="w-full rounded-md p-2 text-center text-sm font-semibold text-brand-700 hover:bg-neutral-100 cursor-pointer"
                  >
                    See all results for &ldquo;{searchTerm}&rdquo;
                  </button>
                </div>
              )}
            </div>
          )}
        </form>

        <div className="hidden shrink-0 items-center gap-5 lg:flex">
          <Link
            href="/contact"
            className="flex items-center gap-2 rounded-md bg-brand-gradient px-4 py-2.5 text-sm font-semibold text-white opacity-90 transition-opacity hover:opacity-100"
          >
            <ClipboardCheck className="size-4" />
            Request Consultation
          </Link>

          <button type="button" className="flex items-center gap-2">
            <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-brand-gradient text-white">
              <User className="size-4" />
            </span>
            <span className="flex flex-col leading-tight text-sm">
              <span className="text-xs text-neutral-500">Client Portal</span>
              <span className="font-semibold text-neutral-900">Login</span>
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}
