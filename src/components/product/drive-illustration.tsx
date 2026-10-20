import { cn } from "@/lib/utils";
import type { DriveVisual } from "@/lib/data/types";

export function DriveIllustration({
  visual,
  id,
  className,
}: {
  visual: DriveVisual;
  id: string;
  className?: string;
}) {
  const chassisGrad = `chassis-${id}`;
  const labelGrad = `label-${id}`;
  const accentGrad = `accent-${id}`;
  const capacityMatch = visual.capacity.match(/^(\d+)(\D+)$/);
  const capacityNumber = capacityMatch?.[1] ?? visual.capacity;
  const capacityUnit = capacityMatch?.[2] ?? "";

  return (
    <svg
      viewBox="0 0 200 260"
      className={cn("h-64 w-48 drop-shadow-md", className)}
      role="img"
      aria-label={`${visual.brand} ${visual.series.join(" ")} ${visual.capacity}`}
    >
      <defs>
        <linearGradient id={chassisGrad} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor={visual.chassisFrom} />
          <stop offset="100%" stopColor={visual.chassisTo} />
        </linearGradient>
        <linearGradient id={labelGrad} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={visual.labelBg} />
          <stop offset="100%" stopColor={visual.labelBgTo ?? visual.labelBg} />
        </linearGradient>
        <linearGradient id={accentGrad} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor={visual.accentFrom} />
          <stop offset="100%" stopColor={visual.accentTo} />
        </linearGradient>
      </defs>

      <rect x="8" y="8" width="184" height="244" rx="16" fill={`url(#${chassisGrad})`} />

      {[
        [28, 28],
        [172, 28],
        [28, 232],
        [172, 232],
      ].map(([cx, cy]) => (
        <circle key={`${cx}-${cy}`} cx={cx} cy={cy} r="5" fill="#00000033" stroke="#ffffff40" strokeWidth="1" />
      ))}

      <rect x="26" y="42" width="148" height="150" rx="6" fill={`url(#${labelGrad})`} />

      {visual.style === "stripe" && (
        <rect x="26" y="118" width="148" height="6" fill={`url(#${accentGrad})`} />
      )}
      {visual.style === "swoosh" && (
        <path
          d="M26 162 Q100 122 174 162 L174 182 Q100 148 26 182 Z"
          fill={`url(#${accentGrad})`}
          opacity="0.85"
        />
      )}

      <text x="100" y="66" textAnchor="middle" fontSize="10" fontWeight="700" letterSpacing="1.5" fill={visual.brandText}>
        {visual.brand.toUpperCase()}
      </text>
      <text x="100" y="92" textAnchor="middle" fontSize="15" fontWeight="800" fill={visual.labelText}>
        {visual.series[0]}
      </text>
      <text x="100" y="109" textAnchor="middle" fontSize="11" fontWeight="600" fill={visual.labelText} opacity="0.85">
        {visual.series[1]}
      </text>

      <path
        d="M8 200 h184 v28 a16 16 0 0 1 -16 16 h-152 a16 16 0 0 1 -16 -16 Z"
        fill={visual.bandBg}
      />
      <text x="100" y="232" textAnchor="middle" fill={visual.bandText}>
        <tspan fontSize="26" fontWeight="800">
          {capacityNumber}
        </tspan>
        <tspan fontSize="11" fontWeight="700" dx="2">
          {capacityUnit}
        </tspan>
      </text>
    </svg>
  );
}
