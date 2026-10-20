"use client";

import { useCallback, useEffect, useState } from "react";
import type { Product } from "@/lib/data/types";

const STORAGE_KEY = "liked-products";
const CHANGE_EVENT = "liked-products-changed";

function readLikedProducts(): Product[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Product[]) : [];
  } catch {
    return [];
  }
}

function writeLikedProducts(products: Product[]) {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(products));
  window.dispatchEvent(new Event(CHANGE_EVENT));
}

export function useLikedProducts() {
  const [likedProducts, setLikedProducts] = useState<Product[]>([]);

  useEffect(() => {
    setLikedProducts(readLikedProducts());

    const sync = () => setLikedProducts(readLikedProducts());
    window.addEventListener(CHANGE_EVENT, sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener(CHANGE_EVENT, sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  const isLiked = useCallback(
    (id: string) => likedProducts.some((product) => product.id === id),
    [likedProducts]
  );

  const toggleLiked = useCallback((product: Product) => {
    const current = readLikedProducts();
    const next = current.some((p) => p.id === product.id)
      ? current.filter((p) => p.id !== product.id)
      : [...current, product];
    writeLikedProducts(next);
  }, []);

  return { likedProducts, isLiked, toggleLiked };
}
