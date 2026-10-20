"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProductCard } from "@/components/product/product-card";
import { ProductCarousel } from "@/components/product/product-carousel";
import { RequestQuoteModal } from "@/components/modals/request-quote-modal";
import { SocialIcon } from "@/components/common/social-icon";
import { useLikedProducts } from "@/hooks/use-liked-products";
import { productImageUrls } from "@/lib/product-image";
import { ProductImagePlaceholder } from "@/components/product/product-image";
import { whatsappLink } from "@/lib/constants";
import { gaItem, trackEvent } from "@/lib/analytics";
import type { Product } from "@/lib/data/types";

export function ProductDetailClient({
  product,
  relatedProducts,
}: {
  product: Product;
  relatedProducts: Product[];
}) {
  const [viewerCount, setViewerCount] = useState(17);
  const [zoomPos, setZoomPos] = useState({ x: 0, y: 0 });
  const [isZoomed, setIsZoomed] = useState(false);
  const [quoteModalOpen, setQuoteModalOpen] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const { likedProducts } = useLikedProducts();

  // Simulate real-time viewer count
  useEffect(() => {
    const interval = setInterval(() => {
      setViewerCount((prev) => prev + Math.floor(Math.random() * 3) - 1);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  // Reset the selected thumbnail when navigating to a different product
  useEffect(() => {
    setSelectedImageIndex(0);
  }, [product.id]);

  useEffect(() => {
    trackEvent("view_item", { items: [gaItem(product)] });
  }, [product]);

  const thumbnails = productImageUrls(product.images);
  const mainImage: string | undefined = thumbnails[selectedImageIndex] ?? thumbnails[0];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Main Product Section */}
      <div className="mx-auto px-8 lg:px-28 py-8">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          {/* Left: Product Image Gallery */}
          <div className="lg:col-span-1">
            <div className="sticky top-4">
              {/* Main Image with Zoom */}
              <div
                className="relative bg-white rounded-lg p-4 mb-4 aspect-square flex items-center justify-center overflow-hidden"
                onMouseEnter={() => setIsZoomed(Boolean(mainImage))}
                onMouseLeave={() => setIsZoomed(false)}
                onMouseMove={(e) => {
                  const rect = e.currentTarget.getBoundingClientRect();
                  const x = ((e.clientX - rect.left) / rect.width) * 100;
                  const y = ((e.clientY - rect.top) / rect.height) * 100;
                  setZoomPos({ x, y });
                }}
              >
                {mainImage ? (
                  <div className={`transition-transform duration-200 ${isZoomed ? "scale-150" : "scale-100"}`}
                    style={isZoomed ? {
                      transformOrigin: `${zoomPos.x}% ${zoomPos.y}%`
                    } : {}}
                  >
                    <Image
                      src={mainImage}
                      alt={product.name}
                      width={400}
                      height={400}
                      className="object-contain max-h-full max-w-full"
                    />
                  </div>
                ) : (
                  <ProductImagePlaceholder icon={product.icon} label={product.name} />
                )}
                <button className="absolute top-4 right-4 p-2 bg-white rounded hover:bg-gray-100 cursor-pointer z-10">
                  <Eye className="w-5 h-5 text-gray-600" />
                </button>
                {isZoomed && (
                  <div className="absolute top-4 left-4 bg-black text-white px-3 py-1 rounded text-sm z-10">
                    🔍 Zoom
                  </div>
                )}
              </div>

              {/* Thumbnail Gallery */}
              {thumbnails.length > 1 && (
                <div className="flex gap-2">
                  {thumbnails.map((thumb, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setSelectedImageIndex(idx)}
                      className={`w-16 h-16 rounded border-2 cursor-pointer bg-white p-1 ${
                        idx === selectedImageIndex
                          ? "border-brand-700"
                          : "border-gray-300 hover:border-brand-700"
                      }`}
                    >
                      <Image
                        src={thumb}
                        alt={`${product.name} thumbnail ${idx + 1}`}
                        width={64}
                        height={64}
                        className="object-contain w-full h-full"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right: Product Info */}
          <div className="lg:col-span-2">
            <h1 className="text-3xl font-bold text-brand-700 mb-4">{product.name}</h1>
            {product.description && (
              <p className="text-gray-600 text-sm mb-6">{product.description}</p>
            )}

            {/* Stock Status */}
            <div className="mb-6">
              {/* <p className="text-lg font-semibold text-gray-900 mb-2">
                Stock Available: <span className="text-green-600">4</span>
              </p> */}
              <p className="text-sm text-green-600 font-medium">
                Available for purchase! Occasional oversell due to in-store sales or high online demand; We
                will provide estimated lead time in such cases. Contact us for best wholesale price.
              </p>
            </div>

            {/* REQUEST FOR QUOTE + WHATSAPP Buttons */}
            <div className="flex flex-col gap-3 mb-6 lg:flex-row">
              <Button
                variant="success"
                size="default"
                className="text-sm font-bold cursor-pointer lg:w-auto"
                onClick={() => setQuoteModalOpen(true)}
              >
                REQUEST FOR QUOTE
              </Button>
              <a
                href={whatsappLink(`Hi, I'm interested in ${product.name}`)}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() =>
                  trackEvent("whatsapp_enquiry", {
                    enquiry_source: "product_detail",
                    items: [gaItem(product)],
                  })
                }
                className="flex items-center justify-center gap-2 rounded-md bg-emerald-600 px-4 py-2 text-sm font-bold text-white hover:bg-emerald-700 cursor-pointer lg:w-auto"
              >
                <SocialIcon name="whatsapp" className="size-4" />
                WhatsApp
              </a>
            </div>

            {/* Real-time Viewer Count */}
            <div className="flex items-center gap-2 text-sm text-gray-600 mb-6">
              <span className="inline-flex items-center gap-1 bg-gray-800 text-white px-3 py-1 rounded">
                {viewerCount}
              </span>
              <span>visitor right now</span>
            </div>

            {/* Product Details */}
            <div className="space-y-3 text-sm">
              <div className="flex gap-4">
                <span className="font-semibold text-gray-700 min-w-20">Sku:</span>
                <span className="text-gray-600">{product.sku || product.id}</span>
              </div>
              <div className="flex gap-4">
                <span className="font-semibold text-gray-700 min-w-20">Product Type:</span>
                <span className="text-gray-600">{product.productType || "—"}</span>
              </div>
              <div className="flex gap-4">
                <span className="font-semibold text-gray-700 min-w-20">Vendor:</span>
                <span className="text-gray-600">{product.vendor || "—"}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Description Section */}
      <div className="border-t bg-white py-12">
        <div className="mx-auto px-8 lg:px-28">
          <h2 className="text-2xl font-bold mb-8 pb-4 border-b-2 border-brand-700 inline-block">
            Description
          </h2>

          <div className="space-y-8">
            <div>
              <h3 className="text-lg font-bold text-gray-900 mb-3">{product.name}</h3>
              {product.vendor && (
                <h4 className="font-bold text-gray-900 mb-2">{product.vendor}</h4>
              )}
              {/* Renders the merchant's Shopify rich-text description as-is (headings, bold,
                  bullet lists) instead of the plain-text field, which strips that formatting. */}
              {product.descriptionHtml ? (
                <div
                  className="shopify-rich-text"
                  dangerouslySetInnerHTML={{ __html: product.descriptionHtml }}
                />
              ) : product.description ? (
                <p className="text-gray-600 leading-relaxed whitespace-pre-line">
                  {product.description}
                </p>
              ) : null}
            </div>
          </div>
        </div>
      </div>

      {/* Related Products (same vendor) */}
      {relatedProducts.length > 0 && (
      <div className="mx-auto px-8 lg:px-28 py-12">
        <h2 className="text-2xl font-bold mb-8 pb-4 border-b-2 border-brand-700 inline-block">
          Related Products
        </h2>

        {/* Same carousel (card widths, snap, arrows) as the homepage product sections */}
        <ProductCarousel products={relatedProducts} />
      </div>
      )}

      {/* Liked Products */}
      {likedProducts.length > 0 && (
        <div className="mx-auto px-8 lg:px-28 py-12">
          <h2 className="text-2xl font-bold mb-8 pb-4 border-b-2 border-brand-700 inline-block">
            Liked Products
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
            {likedProducts.map((likedProduct) => (
              <ProductCard
                key={likedProduct.id}
                product={likedProduct}
                layout="vertical"
                showBadge={true}
                showQuickActions={true}
              />
            ))}
          </div>
        </div>
      )}

      {/* Request Quote Modal */}
      <RequestQuoteModal
        isOpen={quoteModalOpen}
        onClose={() => setQuoteModalOpen(false)}
        productId={product.id}
        productName={product.name}
        productImage={mainImage}
        productDescription={product.description}
        productSku={product.sku}
      />
    </div>
  );
}
