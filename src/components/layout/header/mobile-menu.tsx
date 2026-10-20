"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Mail, Menu, Phone, Search, User, X } from "lucide-react";
import { ProductImage } from "@/components/product/product-image";
import { CONTACT, PHONE_HREF } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { useProductSearch } from "@/hooks/use-product-search";
import { pickProductImage } from "@/lib/product-image";

interface ParentCategory {
  id: string;
  title: string;
  handle: string;
}

export function MobileMenu() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
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
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Open menu"
        className="flex size-10 shrink-0 items-center justify-center rounded-md text-neutral-700 hover:bg-secondary"
      >
        <Menu className="size-6" />
      </button>

      <div
        className={cn(
          "fixed inset-0 z-50 transition-opacity",
          open ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"
        )}
        aria-hidden={!open}
      >
        <div className="absolute inset-0 bg-black/50" onClick={() => setOpen(false)} />
        <div
          className={cn(
            "absolute inset-y-0 left-0 flex w-80 max-w-[85vw] flex-col overflow-y-auto bg-white shadow-xl transition-transform duration-300",
            open ? "translate-x-0" : "-translate-x-full"
          )}
        >
          <div className="flex items-center justify-between border-b border-border px-4 py-4">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const term = searchTerm.trim();
                setSuggestionsOpen(false);
                setOpen(false);
                router.push(term ? `/products?q=${encodeURIComponent(term)}` : "/products");
              }}
              className="relative flex-1"
            >
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-neutral-400" />
              <input
                type="search"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onFocus={() => setSuggestionsOpen(true)}
                onBlur={() => setTimeout(() => setSuggestionsOpen(false), 150)}
                placeholder="Search"
                className="h-10 w-full rounded-md border border-border bg-secondary/60 pl-9 pr-3 text-sm outline-none focus:border-neutral-400"
              />

              {suggestionsOpen && searchTerm.trim() && (
                <div className="absolute top-full z-20 mt-1 w-full rounded-md border border-border bg-white shadow-lg">
                  {isSearching && (
                    <p className="p-3 text-center text-sm text-neutral-500">Searching...</p>
                  )}
                  {!isSearching && suggestions.length === 0 && (
                    <p className="p-3 text-center text-sm text-neutral-500">
                      No products found.
                    </p>
                  )}
                  {!isSearching && suggestions.length > 0 && (
                    <div className="max-h-72 overflow-y-auto p-1">
                      {suggestions.map((product) => (
                        <Link
                          key={product.id}
                          href={`/products/${product.id}`}
                          onClick={() => {
                            setSuggestionsOpen(false);
                            setOpen(false);
                          }}
                          className="flex items-center gap-3 rounded-md p-2 hover:bg-neutral-100 cursor-pointer"
                        >
                          <div className="relative size-9 shrink-0 overflow-hidden rounded border border-border bg-white">
                            <ProductImage
                              src={pickProductImage(product.images)}
                              alt={product.name}
                              icon={product.icon}
                              sizes="36px"
                              iconClassName="size-6"
                            />
                          </div>
                          <p className="min-w-0 truncate text-sm font-medium normal-case text-neutral-900">
                            {product.name}
                          </p>
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </form>
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Close menu"
              className="ml-3 flex size-9 shrink-0 items-center justify-center rounded-md text-neutral-500 hover:bg-secondary"
            >
              <X className="size-5" />
            </button>
          </div>

          <nav className="flex flex-col gap-1 px-4 py-4 text-sm font-semibold uppercase tracking-wide text-neutral-800">
            <Link href="/" onClick={() => setOpen(false)} className="rounded-md px-2 py-2.5 hover:bg-secondary">
              Home
            </Link>
            {categories.map((category) => (
              <Link
                key={category.id}
                href={`/collections/${category.handle}`}
                onClick={() => setOpen(false)}
                className="rounded-md px-2 py-2.5 hover:bg-secondary"
              >
                {category.title}
              </Link>
            ))}
          </nav>

          <div className="mt-auto space-y-4 border-t border-border px-4 py-5 text-sm">
            {/* Login is not available yet, so the button is shown but disabled */}
            <button
              type="button"
              disabled
              className="flex cursor-not-allowed items-center gap-2 font-semibold text-neutral-400"
            >
              <User className="size-4" /> Login / Register
            </button>

            <div className="space-y-1 pt-2">
              <p className="text-xs font-semibold uppercase text-neutral-400">Hotline</p>
              <a
                href={PHONE_HREF}
                className="flex items-center gap-2 font-semibold text-brand-700"
              >
                <Phone className="size-4" /> {CONTACT.phone}
              </a>
            </div>
            <div className="space-y-1">
              <p className="text-xs font-semibold uppercase text-neutral-400">Email Support</p>
              <a
                href={`mailto:${CONTACT.email}`}
                className="flex items-center gap-2 font-semibold text-neutral-800"
              >
                <Mail className="size-4" /> {CONTACT.email}
              </a>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
