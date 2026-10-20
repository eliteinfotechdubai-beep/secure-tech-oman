"use client";

import { useEffect, useState } from "react";
import { toDisplayProduct } from "@/lib/shopify/to-display-product";
import type { Product } from "@/lib/data/types";
import type { ShopifyProduct } from "@/lib/shopify/shopify-types";

export function useProductSearch(query: string, limit: number = 6) {
  const [results, setResults] = useState<Product[]>([]);
  const [isSearching, setIsSearching] = useState(false);

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
        const response = await fetch(`/api/products/search?q=${encodeURIComponent(term)}&limit=${limit}`);
        if (response.ok) {
          const data = await response.json();
          const products: ShopifyProduct[] = data.data || [];
          setResults(products.map(toDisplayProduct));
        }
      } catch (error) {
        console.error("Error searching products:", error);
      } finally {
        setIsSearching(false);
      }
    }, 300);

    return () => clearTimeout(timeout);
  }, [query, limit]);

  return { results, isSearching };
}
