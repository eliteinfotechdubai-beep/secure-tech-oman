"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import { Expand, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Product } from "@/lib/data/types";
import { cn } from "@/lib/utils";
import { productImageUrls } from "@/lib/product-image";
import { ProductImagePlaceholder } from "@/components/product/product-image";

export function QuickViewModal({
  product,
  onClose,
  onRequestQuote,
}: {
  product: Product;
  onClose: () => void;
  /**
   * Hands the quote request back to the parent, which owns the quote modal.
   * Rendering that modal inside this portal would nest it under the quick-view
   * backdrop and fight over the same z-index.
   */
  onRequestQuote?: () => void;
}) {
  const [zoomOpen, setZoomOpen] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const images = productImageUrls(product.images);
  const selectedImage: string | undefined = images[selectedImageIndex] ?? images[0];

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      if (zoomOpen) setZoomOpen(false);
      else onClose();
    };
    document.addEventListener("keydown", onKeyDown);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [onClose, zoomOpen]);

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={product.name}
    >
      <div
        className="relative flex max-h-[90vh] w-full max-w-3xl flex-col gap-8 overflow-y-auto rounded-lg bg-white p-6 shadow-xl sm:flex-row sm:p-8"
        onClick={(event) => event.stopPropagation()}
      >
        <button
          type="button"
          aria-label="Close"
          onClick={onClose}
          className="absolute right-4 top-4 flex size-9 items-center justify-center rounded-md bg-brand-gradient text-white opacity-90 hover:opacity-100"
        >
          <X className="size-5" />
        </button>

        <div className="flex flex-col items-center gap-4 sm:w-2/5 sm:shrink-0">
          {selectedImage ? (
            <div
              className="group relative flex h-80 w-full cursor-zoom-in items-center justify-center rounded-lg border border-border bg-white p-4"
              onClick={() => setZoomOpen(true)}
            >
              <button
                type="button"
                aria-label="Zoom image"
                onClick={(event) => {
                  event.stopPropagation();
                  setZoomOpen(true);
                }}
                className="absolute right-3 top-3 z-10 flex size-9 items-center justify-center rounded-full border border-border bg-white text-neutral-600 shadow-sm hover:bg-neutral-100"
              >
                <Expand className="size-4" />
              </button>
              <div className="relative h-full w-full">
                <Image
                  src={selectedImage}
                  alt={product.name}
                  fill
                  sizes="(max-width: 640px) 90vw, 300px"
                  className="object-contain"
                />
              </div>
            </div>
          ) : (
            <div className="flex h-80 w-full items-center justify-center rounded-lg border border-border bg-white">
              <ProductImagePlaceholder icon={product.icon} label={product.name} iconClassName="size-40" />
            </div>
          )}
          {images.length > 1 && (
            <div className="flex items-center gap-1.5">
              {images.map((image, index) => (
                <button
                  key={`${image}-${index}`}
                  type="button"
                  aria-label={`Show image ${index + 1}`}
                  aria-pressed={index === selectedImageIndex}
                  onClick={() => setSelectedImageIndex(index)}
                  className={cn(
                    "size-2 cursor-pointer rounded-full border border-neutral-400",
                    index === selectedImageIndex ? "bg-neutral-900" : "bg-transparent"
                  )}
                />
              ))}
            </div>
          )}
        </div>

        <div className="flex flex-1 flex-col gap-4">
          <h2 className="text-xl font-bold leading-snug text-brand-700 sm:text-2xl">{product.name}</h2>

          {product.description && (
            <p className="text-sm leading-relaxed text-neutral-600">
              {product.description}{" "}
              <span className="cursor-pointer font-medium text-neutral-900 underline">View more</span>
            </p>
          )}

          <p className="text-sm font-bold text-neutral-900">Stock Available: {product.stock ?? 0}</p>

          <p className="text-sm font-semibold leading-relaxed text-emerald-700">
            Available for purchase! Occasional oversell due to in-store sales or high online demand; We will
            provide estimated lead time in such cases. Contact us for best wholesale price.
          </p>

          <div className="flex items-center gap-2 text-sm text-neutral-600">
            <span>Real Time</span>
            <span className="rounded bg-neutral-900 px-2 py-0.5 text-xs font-bold text-white">
              {product.liveViewers ?? 1}
            </span>
            <span>visitor{(product.liveViewers ?? 1) === 1 ? "" : "s"} right now</span>
          </div>

          <dl className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1.5 border-t border-border pt-4 text-sm">
            <dt className="text-neutral-500">Sku:</dt>
            <dd className="font-semibold text-neutral-900">{product.sku ?? "—"}</dd>
            <dt className="text-neutral-500">Barcode:</dt>
            <dd className="font-semibold text-neutral-900">{product.barcode ?? "—"}</dd>
            <dt className="text-neutral-500">Product Type:</dt>
            <dd className="font-semibold text-neutral-900">{product.productType ?? "—"}</dd>
            <dt className="text-neutral-500">Vendor:</dt>
            <dd className="font-semibold text-neutral-900">{product.vendor ?? "—"}</dd>
          </dl>

          <Button
            variant="success"
            size="default"
            className="mt-auto w-full sm:w-fit"
            onClick={onRequestQuote}
          >
            Request For Quote
          </Button>
        </div>
      </div>

      {zoomOpen && selectedImage && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/85 p-8"
          onClick={(event) => {
            event.stopPropagation();
            setZoomOpen(false);
          }}
        >
          <button
            type="button"
            aria-label="Close zoom"
            onClick={(event) => {
              event.stopPropagation();
              setZoomOpen(false);
            }}
            className="absolute right-6 top-6 flex size-10 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20"
          >
            <X className="size-6" />
          </button>
          <div
            className="relative h-[80vh] w-[min(90vw,64rem)] rounded-lg bg-white"
            onClick={(event) => event.stopPropagation()}
          >
            <Image
              src={selectedImage}
              alt={product.name}
              fill
              sizes="90vw"
              className="object-contain p-6"
            />
          </div>
        </div>
      )}
    </div>,
    document.body
  );
}
