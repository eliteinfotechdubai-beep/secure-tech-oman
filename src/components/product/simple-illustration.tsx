import { cn } from "@/lib/utils";
import type { SimpleVisual } from "@/lib/data/types";

export function SimpleIllustration({
  visual,
  id,
  className,
}: {
  visual: SimpleVisual;
  id: string;
  className?: string;
}) {
  const chassisGrad = `s-chassis-${id}`;
  const accentGrad = `s-accent-${id}`;

  return (
    <svg
      viewBox="0 0 260 200"
      className={cn("h-52 w-full max-w-[240px] drop-shadow-md", className)}
      role="img"
      aria-label={`${visual.brand} ${visual.model}`}
    >
      <defs>
        <linearGradient id={chassisGrad} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor={visual.chassisFrom} />
          <stop offset="100%" stopColor={visual.chassisTo} />
        </linearGradient>
        <linearGradient id={accentGrad} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor={visual.accentFrom} />
          <stop offset="100%" stopColor={visual.accentTo} />
        </linearGradient>
      </defs>

      {visual.kind === "tablet" && (
        <>
          <rect x="20" y="15" width="150" height="120" rx="12" fill={`url(#${chassisGrad})`} />
          <rect x="32" y="27" width="126" height="96" rx="6" fill={`url(#${accentGrad})`} />
          <path
            d="M50 95 Q70 60 90 85 T130 70"
            fill="none"
            stroke="#ffffff"
            strokeWidth="3"
            strokeLinecap="round"
            opacity="0.85"
          />
          <g transform="rotate(28 210 85)">
            <rect x="203" y="35" width="11" height="95" rx="5.5" fill={`url(#${chassisGrad})`} />
            <circle cx="208.5" cy="42" r="4" fill={visual.accentFrom} />
          </g>
        </>
      )}

      {visual.kind === "server" && (
        <>
          <rect x="15" y="52" width="230" height="86" rx="8" fill={`url(#${chassisGrad})`} />
          <rect x="15" y="52" width="230" height="7" fill={`url(#${accentGrad})`} />
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <rect
              key={i}
              x={30 + i * 11}
              y="68"
              width="6"
              height="54"
              rx="2"
              fill="#00000028"
            />
          ))}
          <circle cx="222" cy="70" r="4" fill={visual.accentFrom} />
          <circle cx="222" cy="84" r="4" fill="#ffffff55" />
        </>
      )}

      {visual.kind === "monitor" && (
        <>
          <rect x="35" y="10" width="190" height="125" rx="10" fill={`url(#${chassisGrad})`} />
          <rect x="45" y="20" width="170" height="100" rx="4" fill={`url(#${accentGrad})`} />
          <rect x="118" y="135" width="24" height="18" fill={visual.chassisTo} />
          <rect x="95" y="150" width="70" height="8" rx="4" fill={visual.chassisTo} />
        </>
      )}

      {visual.kind === "filter" && (
        <>
          <rect x="35" y="10" width="190" height="125" rx="10" fill={`url(#${chassisGrad})`} />
          <rect x="45" y="20" width="170" height="100" rx="4" fill={visual.chassisFrom} />
          <polygon points="150,20 215,20 190,120 125,120" fill={`url(#${accentGrad})`} opacity="0.6" />
          <polygon points="160,20 172,20 154,120 142,120" fill="#ffffff" opacity="0.18" />
          <rect x="118" y="135" width="24" height="18" fill={visual.chassisTo} />
          <rect x="95" y="150" width="70" height="8" rx="4" fill={visual.chassisTo} />
        </>
      )}

      <rect x="10" y="158" width="240" height="34" rx="10" fill={visual.chassisTo} />
      <text x="130" y="173" textAnchor="middle" fontSize="10" fontWeight="700" letterSpacing="1" fill="#ffffff">
        {visual.brand.toUpperCase()}
      </text>
      <text x="130" y="186" textAnchor="middle" fontSize="9" fontWeight="500" fill="#ffffffcc">
        {visual.model}
      </text>
    </svg>
  );
}
