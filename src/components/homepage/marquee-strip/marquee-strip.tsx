import { MARQUEE_PARTNERS } from "@/lib/constants";

export function MarqueeStrip() {
  const items = [...MARQUEE_PARTNERS, ...MARQUEE_PARTNERS];

  return (
    <div className="overflow-hidden bg-brand-gradient py-3">
      <div className="flex w-max animate-marquee gap-16 whitespace-nowrap">
        {items.map((item, index) => (
          <span
            key={`${item}-${index}`}
            className="text-sm font-semibold uppercase tracking-wide text-white"
          >
            {item}
          </span>
        ))}
      </div>
    </div>
  );
}
