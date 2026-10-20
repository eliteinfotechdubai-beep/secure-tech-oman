"use client";

import { useState } from "react";
import { X } from "lucide-react";
import Image from "next/image";
import { ProductImagePlaceholder } from "@/components/product/product-image";
import { Button } from "@/components/ui/button";
import { whatsappLink } from "@/lib/constants";
import { trackEvent } from "@/lib/analytics";
import { buildQuoteFallbackText } from "@/lib/whatsapp/format-quote";

interface RequestQuoteModalProps {
  isOpen: boolean;
  onClose: () => void;
  productId: string;
  productName?: string;
  productImage?: string;
  productDescription?: string;
  productSku?: string;
}

export function RequestQuoteModal({
  isOpen,
  onClose,
  productId,
  productName,
  productImage,
  productDescription,
  productSku,
}: RequestQuoteModalProps) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    company: "",
    quantity: "1",
    message: "",
  });

  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sentViaWhatsApp, setSentViaWhatsApp] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    // Opened here, synchronously, while we are still inside the click gesture.
    // A window.open() after the await below is treated as an unsolicited popup
    // and blocked, which would swallow the WhatsApp hand-off.
    const whatsappTab = window.open("", "_blank");

    try {
      const response = await fetch("/api/quote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          productName,
          productSku,
        }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || "Failed to submit quote request");
      }

      // Counted once the request is accepted, however it is delivered. Only the product and
      // quantity go to analytics; the customer's name, contact details and company stay out.
      trackEvent("generate_lead", {
        enquiry_type: "request_quote",
        quantity: Number(formData.quantity),
        items: [{ item_id: productId, item_name: productName ?? "" }],
      });

      if (result.data?.mode === "deeplink") {
        const url = whatsappLink(
          buildQuoteFallbackText({ ...formData, productName: productName ?? "", productSku })
        );
        // If the popup was blocked anyway, navigate this tab instead — a direct
        // location change is never blocked.
        if (whatsappTab) whatsappTab.location.href = url;
        else window.location.href = url;
        setSentViaWhatsApp(true);
      } else {
        // The server already delivered it; no tab needed.
        whatsappTab?.close();
      }

      setIsSubmitted(true);
      setTimeout(() => {
        onClose();
        setIsSubmitted(false);
        setSentViaWhatsApp(false);
        setFormData({
          name: "",
          email: "",
          phone: "",
          company: "",
          quantity: "1",
          message: "",
        });
      }, 2500);
    } catch (err) {
      whatsappTab?.close();
      setError(err instanceof Error ? err.message : "Failed to submit quote request");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-4xl bg-white rounded-lg shadow-lg max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b px-6 py-4 sticky top-0 bg-white">
          <h2 className="text-xl font-bold text-gray-900">Request for Quote</h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded cursor-pointer transition-colors"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {isSubmitted ? (
            <div className="text-center py-12">
              <div className="text-5xl mb-4">✓</div>
              {sentViaWhatsApp ? (
                <>
                  <h3 className="text-2xl font-semibold text-gray-900 mb-2">Opening WhatsApp…</h3>
                  <p className="text-gray-600">
                    Your details are ready in WhatsApp — just press send and we&apos;ll get back to you.
                  </p>
                </>
              ) : (
                <>
                  <h3 className="text-2xl font-semibold text-gray-900 mb-2">Request Submitted!</h3>
                  <p className="text-gray-600">Thank you for your quote request. We&apos;ll get back to you soon.</p>
                </>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Left: Product Details */}
              <div className="flex flex-col gap-6">
                {/* Product Image */}
                <div className="bg-gray-50 rounded-lg p-4 flex items-center justify-center h-56">
                  {productImage ? (
                    <Image
                      src={productImage}
                      alt={productName || "Product"}
                      width={300}
                      height={300}
                      className="object-contain max-w-full max-h-full"
                    />
                  ) : (
                    <ProductImagePlaceholder label={productName} iconClassName="size-32" />
                  )}
                </div>

                {/* Product Name */}
                {productName && (
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">{productName}</h3>
                  </div>
                )}

                {/* Product Description */}
                {productDescription && (
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Description</h4>
                    <p className="text-sm text-gray-600 leading-relaxed">{productDescription}</p>
                  </div>
                )}

                {/* Product Info Box */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-sm text-gray-700">
                    <span className="font-semibold">Need bulk pricing?</span> Fill out the form to get a custom quote for your requirements.
                  </p>
                </div>
              </div>

              {/* Right: Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="John Doe"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-700 cursor-text"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email *
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="john@example.com"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-700 cursor-text"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phone *
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="+968 9XXX XXXX"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-700 cursor-text"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Company *
                  </label>
                  <input
                    type="text"
                    name="company"
                    value={formData.company}
                    onChange={handleChange}
                    placeholder="Your Company"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-700 cursor-text"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Quantity *
                  </label>
                  <input
                    type="number"
                    name="quantity"
                    value={formData.quantity}
                    onChange={handleChange}
                    min="1"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-700 cursor-text"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Message
                  </label>
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    placeholder="Enter any additional details..."
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-700 resize-none cursor-text"
                  />
                </div>

                {error && (
                  <p className="text-sm text-red-600" role="alert">
                    {error}
                  </p>
                )}

                <div className="flex gap-3 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={onClose}
                    disabled={isSubmitting}
                    className="flex-1 cursor-pointer"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    variant="success"
                    disabled={isSubmitting}
                    className="flex-1 cursor-pointer"
                  >
                    {isSubmitting ? "Submitting..." : "Submit Quote Request"}
                  </Button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
