import { cn } from "@/lib/utils";

interface SkeletonBannerProps {
  count?: number;
  variant?: "hero" | "side" | "promo" | "sub";
  columns?: number;
}

export function SkeletonBanner({
  count = 1,
  variant = "promo",
  columns = 2,
}: SkeletonBannerProps) {
  const aspectRatios: Record<string, string> = {
    hero: "aspect-1080/534",
    side: "aspect-square",
    promo: "aspect-[2.3/1]",
    sub: "aspect-[2.3/1]",
  };

  const gridClasses: Record<number, string> = {
    1: "grid-cols-1",
    2: "lg:grid-cols-2",
    3: "lg:grid-cols-3",
    4: "lg:grid-cols-4",
    5: "lg:grid-cols-5",
  };

  const aspectRatio = aspectRatios[variant] || "aspect-[2.3/1]";
  const gridClass = gridClasses[columns] || "lg:grid-cols-2";

  // Hero variant (single large banner with side banners)
  if (variant === "hero") {
    return (
      <section className="bg-secondary/40 py-6">
        <div className="mx-2 lg:mx-28 grid grid-cols-1 gap-0.5 lg:grid-cols-12 items-start">
          <div className={cn("rounded-lg lg:col-span-8", aspectRatios.hero)}>
            <div className="w-full h-full bg-gradient-to-r from-neutral-200 to-neutral-300 dark:from-neutral-700 dark:to-neutral-800 animate-pulse rounded-lg" />
          </div>

          <div className="hidden lg:flex lg:col-span-4 w-full flex-wrap gap-0 items-start content-start">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="relative aspect-square overflow-hidden border border-border bg-neutral-100 dark:bg-neutral-800 p-3 basis-1/2 animate-pulse"
              />
            ))}
          </div>
        </div>
      </section>
    );
  }

  // Grid layout for other variants
  return (
    <section className="px-6 lg:px-28 py-5 lg:py-10">
      <div className={cn("grid grid-cols-1 gap-3 sm:grid-cols-2", gridClass)}>
        {Array.from({ length: count }).map((_, i) => (
          <div
            key={i}
            className={cn(
              "overflow-hidden rounded-lg bg-gradient-to-r from-neutral-200 to-neutral-300 dark:from-neutral-700 dark:to-neutral-800 animate-pulse",
              aspectRatio
            )}
          />
        ))}
      </div>
    </section>
  );
}
