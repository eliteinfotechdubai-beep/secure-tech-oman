import { NextResponse, type NextRequest } from "next/server";

/**
 * /products?collection=<handle> was the old collection URL. A redirect in next.config.ts
 * cannot express this one, because Next always forwards the original query string to the
 * destination — the visitor would land on /collections/<handle>?collection=<handle>.
 * Doing it here lets us drop the param and redirect to the clean canonical path.
 */
export function middleware(request: NextRequest) {
  const handle = request.nextUrl.searchParams.get("collection");
  if (!handle) return NextResponse.next();

  const url = request.nextUrl.clone();
  url.pathname = `/collections/${handle}`;
  url.searchParams.delete("collection");
  return NextResponse.redirect(url, 308);
}

export const config = {
  matcher: "/products",
};
