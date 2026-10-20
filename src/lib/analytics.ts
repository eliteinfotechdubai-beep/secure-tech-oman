import { sendGAEvent } from "@next/third-parties/google";
import { GA_MEASUREMENT_ID } from "@/lib/constants";
import type { Product } from "@/lib/data/types";

/** A product in the item shape GA4 ecommerce events expect. Never put customer details here. */
export function gaItem(product: Pick<Product, "id" | "name" | "vendor" | "productType">) {
  return {
    item_id: product.id,
    item_name: product.name,
    item_brand: product.vendor,
    item_category: product.productType,
  };
}

/** Sends a GA4 event. Does nothing until the GoogleAnalytics script is mounted, which needs the ID. */
export function trackEvent(name: string, params: Record<string, unknown> = {}) {
  if (!GA_MEASUREMENT_ID) return;
  sendGAEvent("event", name, params);
}
