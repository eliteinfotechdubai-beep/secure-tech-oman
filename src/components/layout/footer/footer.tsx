import Link from "next/link";
import { Headset, Mail, MapPin, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/layout/logo";
import { CategorySitemap } from "@/components/layout/footer/category-sitemap";
import {
  CONTACT,
  FOOTER_CATEGORIES,
  QUICK_LINKS,
  SITE_DESCRIPTION,
  SITE_NAME,
  SOCIAL_LINKS,
} from "@/lib/constants";
import { brands } from "@/lib/data/brands";

export function Footer() {
  return (
    <footer className="bg-neutral-950 text-neutral-300">
      <div className="mx-auto grid px-5 sm:px-28 grid-cols-1 gap-10 py-14 lg:grid-cols-[1.4fr_1fr_1fr_1.2fr]">
        <div className="space-y-5">
          <Logo variant="dark" />

          <p className="text-sm leading-relaxed text-neutral-400">{SITE_DESCRIPTION}</p>

          <div className="space-y-4 pt-2">
            <div className="flex items-center gap-3">
              <Headset className="size-8 shrink-0 text-neutral-500" strokeWidth={1.5} />
              <div className="text-sm">
                <p className="text-neutral-400">Got a Question? Call us 24/7!</p>
                <p className="font-semibold text-white">{CONTACT.phone}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <MessageCircle className="size-8 shrink-0 text-neutral-500" strokeWidth={1.5} />
              <div className="text-sm">
                <p className="text-neutral-400">Send us a quote request</p>
                <p className="font-semibold text-white">{CONTACT.phone}</p>
              </div>
            </div>

            <div className="flex items-start gap-3 text-sm text-neutral-400">
              <MapPin className="size-4 shrink-0 translate-y-0.5" />
              <span>
                Address: {CONTACT.addressLine1}, {CONTACT.addressLine2}
              </span>
            </div>

            <div className="flex items-center gap-3 text-sm text-neutral-400">
              <Mail className="size-4 shrink-0" />
              Email: {CONTACT.email}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3 sm:gap-6 lg:contents">
          <div className="space-y-3">
            <p className="text-sm font-semibold text-white">Categories</p>
            <ul className="space-y-2.5">
              {FOOTER_CATEGORIES.map((category) => (
                <li key={category.href}>
                  <Link href={category.href} className="text-sm hover:text-white">
                    {category.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="space-y-3">
            <p className="text-sm font-semibold text-white">Brands</p>
            <ul className="space-y-2.5">
              {brands.slice(0, 6).map((brand) => (
                <li key={brand.id} className="text-sm">
                  {brand.name}
                </li>
              ))}
              {brands.length > 6 && (
                <li className="text-sm text-neutral-500">+{brands.length - 6} more</li>
              )}
            </ul>
          </div>

          <div className="space-y-3">
            <p className="text-sm font-semibold text-white">Quick Links</p>
            <ul className="space-y-2.5">
              {QUICK_LINKS.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-sm hover:text-white">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      <CategorySitemap />

      <div className="border-t border-neutral-800">
        <div className="mx-auto flex justify-end sm:justify-center lg:justify-end px-5 sm:px-28 py-10">
          <div className="w-full max-w-xs space-y-3">
            <p className="text-sm font-semibold text-white">
              Subscribe To Our Newsletter
            </p>
            <p className="text-sm text-neutral-400">
              Join our newsletter and get latest product updates.
            </p>
            <div className="flex gap-2">
              <input
                type="email"
                placeholder="Your email address..."
                className="h-10 w-full rounded-md border border-neutral-700 bg-neutral-900 px-3 text-sm text-white outline-none placeholder:text-neutral-500 focus:border-neutral-500"
              />
              <Button type="button" variant="accent" size="default" className="shrink-0">
                Subscribe
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="border-t border-neutral-800 px-28 py-6">
        <div className="mx-auto flex flex-col items-center gap-4">
          <div className="flex gap-3">
            {SOCIAL_LINKS.map((social) => (
              <Link
                key={social.label}
                href={social.href}
                aria-label={social.label}
                className="flex size-9 items-center justify-center rounded-full border border-neutral-700 text-xs font-semibold text-neutral-400 hover:border-neutral-500 hover:text-white"
              >
                {social.label.slice(0, 2).toUpperCase()}
              </Link>
            ))}
          </div>
          <p className="text-center text-xs text-neutral-500">
            Copyright © {SITE_NAME}. All Rights Reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
