interface SkeletonProductGridProps {
  /** Match the page size so the grid doesn't resize when the real cards arrive. */
  count?: number;
  /** The same grid column classes the loaded grid uses, so the skeleton lays out identically. */
  gridClass?: string;
}

// Mirrors the vertical <ProductCard /> box model — image area, two-line title, quote
// button — so swapping in the loaded products doesn't shift anything on the page.
export function SkeletonProductGrid({
  count = 15,
  gridClass = "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
}: SkeletonProductGridProps) {
  return (
    <div
      className={`grid gap-3 ${gridClass}`}
      role="status"
      aria-busy="true"
      aria-label="Loading products"
    >
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="flex h-full animate-pulse flex-col overflow-hidden rounded-lg border border-border bg-white"
        >
          <div className="flex h-44 items-center justify-center p-4 lg:h-70">
            <div className="mt-4 aspect-200/260 h-32 rounded bg-neutral-200 lg:h-56" />
          </div>

          <div className="flex flex-1 flex-col gap-1 p-2 sm:gap-2 sm:p-3">
            <div className="h-3 w-full rounded bg-neutral-200 sm:h-3.5" />
            <div className="h-3 w-2/3 rounded bg-neutral-200 sm:h-3.5" />
            <div className="mt-auto h-8 w-full rounded-md bg-neutral-200 sm:h-10" />
          </div>
        </div>
      ))}
    </div>
  );
}
