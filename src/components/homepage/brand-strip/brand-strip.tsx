import { brands } from "@/lib/data/brands";

export function BrandStrip() {
  return (
    <section className="border-t border-border bg-background py-10">
      <div className="mx-auto flex flex-wrap items-center justify-center gap-x-14 gap-y-6 px-8 lg:px-28">
        {brands
          .slice(0, 6)
          .map((brand) => (
            <span key={brand.id} className={`text-2xl ${brand.wordmarkClassName}`}>
              {brand.name}
            </span>
          ))}
      </div>
    </section>
  );
}
