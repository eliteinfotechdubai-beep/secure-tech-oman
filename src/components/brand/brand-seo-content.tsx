import type { ReactNode } from "react";
import { DahuaBrandContent } from "@/components/brand/dahua-brand-content";

// Brand pages that carry SEO copy below the grid, keyed by canonical /brands/<slug>.
// Every other brand page renders exactly as before.
const BRAND_SEO_CONTENT: Record<string, () => ReactNode> = {
  dahua: () => <DahuaBrandContent />,
};

export function getBrandSeoContent(slug: string): ReactNode {
  return Object.hasOwn(BRAND_SEO_CONTENT, slug) ? BRAND_SEO_CONTENT[slug]() : null;
}
