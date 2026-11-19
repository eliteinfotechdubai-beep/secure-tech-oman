import { NextResponse, type NextRequest } from "next/server";
// Brand filter redirect
import { findBrandByName, getBrandHref } from "@/components/layout/header/brand-menu-data";

// Campaign and click-tracking parameters, safe to carry over to a brand page. Any other
// parameter could be a filter the brand page would drop, so it keeps the old URL in place.
const TRACKING_PARAM =
  /^(utm_[a-z0-9_]+|gclid|gclsrc|dclid|gbraid|wbraid|gad_source|gad_campaignid|fbclid|msclkid|ttclid|twclid|li_fat_id|mc_cid|mc_eid|_gl|srsltid)$/i;

/**
 * /products?brand=<name> was the old brand URL. A known brand moves permanently to
 * /brands/<slug> when the brand is the only filter; tracking parameters go along with it.
 * Unknown brands, a repeated ?brand=, and links that also search or filter stay on /products.
 */
function redirectBrandFilter(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const names = params.getAll("brand");
  if (names.length !== 1) return NextResponse.next();

  const brand = findBrandByName(names[0]);
  if (!brand) return NextResponse.next();

  for (const key of params.keys()) {
    if (key !== "brand" && !TRACKING_PARAM.test(key)) return NextResponse.next();
  }

  const url = request.nextUrl.clone();
  url.pathname = getBrandHref(brand);
  url.searchParams.delete("brand");
  return NextResponse.redirect(url, 308);
}

/**
 * /products?collection=<handle> was the old collection URL. A redirect in next.config.ts
 * cannot express this one, because Next always forwards the original query string to the
 * destination — the visitor would land on /collections/<handle>?collection=<handle>.
 * Doing it here lets us drop the param and redirect to the clean canonical path.
 */
export function middleware(request: NextRequest) {
  const handle = request.nextUrl.searchParams.get("collection");
  if (!handle) return redirectBrandFilter(request);

  const url = request.nextUrl.clone();
  url.pathname = `/collections/${handle}`;
  url.searchParams.delete("collection");
  return NextResponse.redirect(url, 308);
}

export const config = {
  matcher: "/products",
};
