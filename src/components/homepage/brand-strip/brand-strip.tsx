
import Image from "next/image";

const brandLogos = [
  { name: "Imou", src: "/brands/imou.webp" },
  { name: "Dahua", src: "/brands/dahua.webp" },
  { name: "EZVIZ", src: "/brands/ezviz.webp" },
  { name: "Hikvision", src: "/brands/hikvision.webp" },
  { name: "Eufy", src: "/brands/eufy.webp" },
  { name: "Tapo", src: "/brands/tapo.webp" },
];

export function BrandStrip() {
  return (
    <section
      className="w-full overflow-hidden border-t border-border bg-white py-8"
      aria-label="Our brands"
    >
      <div className="brand-scroll-track flex w-max">
        {[0, 1].map((copy) => (
          <div
            key={copy}
            className="flex shrink-0 items-center gap-12 pr-12 md:gap-20 md:pr-20"
            aria-hidden={copy === 1}
          >
            {brandLogos.map((brand) => (
              <div
                key={`${copy}-${brand.name}`}
                className="flex h-20 w-32 shrink-0 items-center justify-center md:w-40"
              >
                <Image
                  src={brand.src}
                  alt={copy === 0 ? `${brand.name} logo` : ""}
                  width={160}
                  height={80}
                  className="h-16 w-full object-contain"
                />
              </div>
            ))}
          </div>
        ))}
      </div>

      <style>{`
        .brand-scroll-track {
          animation: brand-scroll 25s linear infinite;
        }

        .brand-scroll-track:hover {
          animation-play-state: paused;
        }

        @keyframes brand-scroll {
          from { transform: translateX(0); }
          to { transform: translateX(-50%); }
        }

        @media (prefers-reduced-motion: reduce) {
          .brand-scroll-track {
            animation: none;
          }
        }
      `}</style>
    </section>
  );
}
