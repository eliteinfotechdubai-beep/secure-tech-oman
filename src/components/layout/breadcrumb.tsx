import Link from "next/link";
import { JsonLd } from "@/components/seo/json-ld";
import { SITE_URL } from "@/lib/constants";

/** One step of the trail. `href` is a site path ("/collections/storage"). */
export type BreadcrumbItem = { label: string; href: string };

const HOME: BreadcrumbItem = { label: "Home", href: "/" };

/**
 * The visible breadcrumb and its BreadcrumbList JSON-LD, built from the same list so the two
 * can never disagree. "Home" is added here; pass the rest of the trail, ending with the
 * current page (whose href should be the page's canonical path).
 *
 * `schema={false}` for pages that are not indexed (account, wishlist).
 */
export function Breadcrumb({
  items,
  schema = true,
}: {
  items: BreadcrumbItem[];
  schema?: boolean;
}) {
  const trail = [HOME, ...items];

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: trail.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.label,
      item: item.href === "/" ? SITE_URL : `${SITE_URL}${item.href}`,
    })),
  };

  return (
    <>
      {schema && <JsonLd data={breadcrumbJsonLd} />}
      <div className="border-b bg-white">
        <div className="mx-auto px-8 lg:px-28 py-4">
          <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-sm text-gray-600">
            <ol className="flex flex-wrap items-center gap-2">
              {trail.map((item, index) => {
                const isCurrent = index === trail.length - 1;
                return (
                  <li key={`${index}:${item.href}`} className="flex items-center gap-2">
                    {index > 0 && <span aria-hidden="true">/</span>}
                    {isCurrent ? (
                      <span aria-current="page" className="text-gray-900 font-medium">
                        {item.label}
                      </span>
                    ) : (
                      <Link href={item.href} className="hover:text-brand-700 cursor-pointer">
                        {item.label}
                      </Link>
                    )}
                  </li>
                );
              })}
            </ol>
          </nav>
        </div>
      </div>
    </>
  );
}
