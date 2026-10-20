"use client";

import { useState } from "react";
import Link from "next/link";
import { Eye, Heart } from "lucide-react";
import { ProductImage } from "@/components/product/product-image";
import { Button } from "@/components/ui/button";
import { QuickViewModal } from "@/components/product/quick-view-modal";
import { RequestQuoteModal } from "@/components/modals/request-quote-modal";
import { SocialIcon } from "@/components/common/social-icon";
import { useLikedProducts } from "@/hooks/use-liked-products";
import type { Product } from "@/lib/data/types";
import { cn } from "@/lib/utils";
import { pickProductImage } from "@/lib/product-image";
import { whatsappLink } from "@/lib/constants";
import { gaItem, trackEvent } from "@/lib/analytics";

const QUICK_ACTIONS = [
  { key: "quick-view", Icon: Eye, label: "Quick view" },
  { key: "wishlist", Icon: Heart, label: "Add to wishlist" },
];

export function ProductCard({
  product,
  layout = "vertical",
  showBadge = true,
  showQuickActions = true,
}: {
  product: Product;
  layout?: "vertical" | "horizontal";
  showBadge?: boolean;
  showQuickActions?: boolean;
}) {
  const [quickViewOpen, setQuickViewOpen] = useState(false);
  const [quoteModalOpen, setQuoteModalOpen] = useState(false);
  const { isLiked, toggleLiked } = useLikedProducts();
  const liked = isLiked(product.id);
  const horizontal = layout === "horizontal";
  const imageSrc = pickProductImage(product.images);

  const imageBox = (
    <div className="relative flex min-w-0 flex-1 items-center justify-center bg-white p-4">
      {showBadge && (
        <span
          className={cn(
            "absolute left-3 top-3 rounded px-2 py-1 text-[11px] font-bold uppercase tracking-wide text-white ",
            product.badge === "New" ? "bg-blue-600" : "bg-emerald-600"
          )}
        >
          {product.badge}
        </span>
      )}

      {showQuickActions && (
        <div className="absolute right-3 top-3 flex flex-col gap-2 opacity-0 transition-opacity group-hover:opacity-100">
          {QUICK_ACTIONS.map(({ key, Icon: ActionIcon, label }) => (
            <button
              key={key}
              type="button"
              aria-label={key === "wishlist" && liked ? "Remove from liked products" : label}
              onClick={
                key === "quick-view"
                  ? () => setQuickViewOpen(true)
                  : key === "wishlist"
                    ? () => toggleLiked(product)
                    : undefined
              }
              className={cn(
                "flex size-8 items-center justify-center rounded-full border border-border bg-white shadow-sm hover:bg-neutral-100 cursor-pointer",
                key === "wishlist" && liked ? "text-red-600" : "text-neutral-700"
              )}
            >
              <ActionIcon className="size-4" fill={key === "wishlist" && liked ? "currentColor" : "none"} />
            </button>
          ))}
          <a
            href={whatsappLink(`Hi, I'm interested in ${product.name}`)}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Chat on WhatsApp"
            onClick={() =>
              trackEvent("whatsapp_enquiry", {
                enquiry_source: "product_card",
                items: [gaItem(product)],
              })
            }
            className="flex size-8 items-center justify-center rounded-full border border-border bg-white text-emerald-600 shadow-sm hover:bg-neutral-100 cursor-pointer"
          >
            <SocialIcon name="whatsapp" className="size-4" />
          </a>
        </div>
      )}

      <div
        className={cn(
          "relative aspect-200/260 mt-4",
          horizontal ? "w-3/5 max-w-42.5" : "h-32 lg:h-56"
        )}
      >
        <ProductImage
          src={imageSrc}
          alt={product.name}
          icon={product.icon}
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
        />
      </div>
    </div>
  );

  const quickViewModal = quickViewOpen && (
    <QuickViewModal
      product={product}
      onClose={() => setQuickViewOpen(false)}
      onRequestQuote={() => {
        setQuickViewOpen(false);
        setQuoteModalOpen(true);
      }}
    />
  );

  if (horizontal) {
    return (
      <div className="group flex h-full min-w-0 flex-col overflow-hidden rounded-lg border border-border bg-white sm:flex-row">
        {/* Container query: the label shortens with the card's own width, so the
            narrow side cards shrink it while the wide hero card keeps full text. */}
        <div className="@container flex min-w-0 flex-col sm:w-1/2">
          {imageBox}
          <div className="p-3 pt-0 @[13rem]:p-6 @[13rem]:pt-0">
            <Button
              variant="success"
              size="default"
              className="h-9 w-full px-2 text-xs @[13rem]:h-10 @[13rem]:px-4 @[13rem]:text-sm"
              onClick={() => setQuoteModalOpen(true)}
            >
              <span className="@[9rem]:hidden">Quote</span>
              <span className="hidden @[9rem]:inline @[13rem]:hidden">Request Quote</span>
              <span className="hidden @[13rem]:inline">Request For Quote</span>
            </Button>
          </div>
        </div>

        <div className="flex min-w-0 items-center justify-center p-6 sm:w-1/2">
          <Link
            href={`/products/${product.id}`}
            className="text-center text-base font-semibold tracking-tight text-neutral-900 hover:text-brand-700 cursor-pointer"
          >
            {product.name}
          </Link>
        </div>

        {quickViewModal}
        <RequestQuoteModal
          isOpen={quoteModalOpen}
          onClose={() => setQuoteModalOpen(false)}
          productId={product.id}
          productName={product.name}
          productImage={imageSrc}
          productDescription={product.description}
          productSku={product.sku}
        />
      </div>
    );
  }

  return (
    <div className="group flex h-full flex-col overflow-hidden rounded-lg border border-border bg-white">
      <div className="h-44 lg:h-70">{imageBox}</div>

      <div className="flex flex-1 flex-col gap-1 p-2 sm:gap-2 sm:p-3">
        <Link
          href={`/products/${product.id}`}
          className="line-clamp-2 text-xs font-bold uppercase leading-tight text-neutral-900 hover:text-brand-700 sm:text-sm cursor-pointer"
        >
          {product.name}
        </Link>
        <Button
          variant="success"
          size="sm"
          className="w-full text-xs sm:text-sm sm:h-10 mt-auto"
          onClick={() => setQuoteModalOpen(true)}
        >
          Request For Quote
        </Button>
      </div>

      {quickViewModal}
      <RequestQuoteModal
        isOpen={quoteModalOpen}
        onClose={() => setQuoteModalOpen(false)}
        productId={product.id}
        productName={product.name}
        productImage={imageSrc}
        productDescription={product.description}
        productSku={product.sku}
      />
    </div>
  );
}
