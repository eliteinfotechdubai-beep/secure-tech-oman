import Link from "next/link";
import { getCategoryTree } from "@/lib/shopify/category-tree";

// Server-rendered so every category/subcategory link is crawlable straight out of the
// initial HTML — the point of this section is SEO coverage, not interactivity.
export async function CategorySitemap() {
  const categories = await getCategoryTree();

  if (categories.length === 0) return null;

  return (
    <div className="border-t border-neutral-800 px-5 sm:px-28 py-8">
      <p className="text-sm font-semibold text-white mb-4">Shop By Category</p>

      {/* One continuous column flow for every root + its groups, instead of a grid per root —
          otherwise a root with only 2-3 groups leaves the rest of its row empty instead of
          letting the next root's content fill it. */}
      <div className="columns-2 gap-4 sm:columns-3 lg:columns-5 2xl:columns-6">
        {categories.map((root) => (
          <div key={root.id} className="mb-3 break-inside-avoid-column">
            <Link
              href={`/collections/${root.handle}`}
              className="text-xs font-bold text-white hover:text-brand-500"
            >
              {root.title}
            </Link>

            {root.subCategories.map((group) => (
              <div key={group.id} className="mt-2 break-inside-avoid">
                <Link
                  href={`/collections/${group.handle}`}
                  className="text-xs font-semibold text-neutral-200 hover:text-white"
                >
                  {group.title}
                </Link>
                {group.subCategories.length > 0 && (
                  <ul className="mt-1 space-y-0.5">
                    {group.subCategories.map((leaf) => (
                      <li key={leaf.id}>
                        <Link
                          href={`/collections/${leaf.handle}`}
                          className="text-xs text-neutral-400 hover:text-white"
                        >
                          {leaf.title}
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
