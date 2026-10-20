"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { MessageCircle, Search, X } from "lucide-react";
import { SocialIcon } from "@/components/common/social-icon";
import { toDisplayProduct } from "@/lib/shopify/to-display-product";
import { pickProductImage } from "@/lib/product-image";
import { ProductImage } from "@/components/product/product-image";
import { whatsappLink } from "@/lib/constants";
import { trackEvent } from "@/lib/analytics";
import type { Product } from "@/lib/data/types";
import type { ShopifyProduct } from "@/lib/shopify/shopify-types";

export function ProductChatWidget() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Product[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  useEffect(() => {
    const term = query.trim();
    if (!term) {
      setResults([]);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    const timeout = setTimeout(async () => {
      try {
        const response = await fetch(`/api/products/search?q=${encodeURIComponent(term)}&limit=8`);
        if (response.ok) {
          const data = await response.json();
          const products: ShopifyProduct[] = data.data || [];
          setResults(products.map(toDisplayProduct));
          trackEvent("search", { search_term: term });
        }
      } catch (error) {
        console.error("Error searching products:", error);
      } finally {
        setIsSearching(false);
      }
    }, 350);

    return () => clearTimeout(timeout);
  }, [query]);

  const whatsappHref = whatsappLink("Hi, I'd like to ask about a product.");

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col items-end gap-3">
      {open && (
        <div className="flex h-[28rem] w-80 flex-col overflow-hidden rounded-lg border border-border bg-white shadow-xl sm:w-96">
          <div className="flex items-center justify-between bg-brand-gradient px-4 py-3 text-white">
            <div>
              <p className="text-sm font-bold">Find a Product</p>
              <p className="text-xs text-white/80">Search by name or brand</p>
            </div>
            <button
              type="button"
              aria-label="Close"
              onClick={() => setOpen(false)}
              className="flex size-8 items-center justify-center rounded-full hover:bg-white/10 cursor-pointer"
            >
              <X className="size-5" />
            </button>
          </div>

          <div className="border-b border-border p-3">
            <div className="flex items-center gap-2 rounded-md border border-border px-3 py-2">
              <Search className="size-4 shrink-0 text-neutral-400" />
              <input
                ref={inputRef}
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="e.g. Toshiba, NAS, SSD..."
                className="w-full text-sm outline-none placeholder:text-neutral-400"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-2">
            {isSearching && (
              <p className="p-3 text-center text-sm text-neutral-500">Searching...</p>
            )}
            {!isSearching && query.trim() && results.length === 0 && (
              <p className="p-3 text-center text-sm text-neutral-500">
                No products found for &ldquo;{query}&rdquo;.
              </p>
            )}
            {!isSearching && !query.trim() && (
              <p className="p-3 text-center text-sm text-neutral-500">
                Start typing a product name or brand to search our catalog.
              </p>
            )}
            <div className="space-y-1">
              {results.map((product) => (
                <Link
                  key={product.id}
                  href={`/products/${product.id}`}
                  onClick={() => setOpen(false)}
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
            </div>
          </div>

          <a
            href={whatsappHref}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => trackEvent("whatsapp_enquiry", { enquiry_source: "chat_widget" })}
            className="flex items-center justify-center gap-2 border-t border-border bg-emerald-600 py-3 text-sm font-bold text-white hover:bg-emerald-700 cursor-pointer"
          >
            <SocialIcon name="whatsapp" className="size-4" />
            Chat with a Dealer
          </a>
        </div>
      )}

      <button
        type="button"
        aria-label={open ? "Close product search" : "Search products"}
        onClick={() => setOpen((prev) => !prev)}
        className="flex size-14 items-center justify-center rounded-full bg-brand-gradient text-white shadow-lg hover:opacity-90 cursor-pointer"
      >
        {open ? <X className="size-6" /> : <MessageCircle className="size-6" />}
      </button>
    </div>
  );
}
