import Image from "next/image";
import { Camera, Database, HardDrive, Monitor, Server, Shield, Tablet, Wifi } from "lucide-react";
import type { Product } from "@/lib/data/types";
import { cn } from "@/lib/utils";

const ICONS: Record<Product["icon"], typeof HardDrive> = {
  nas: Database,
  drive: HardDrive,
  server: Server,
  tablet: Tablet,
  network: Wifi,
  monitor: Monitor,
  filter: Shield,
  camera: Camera,
};

/** Light grey product-type icon shown wherever a product has no image. Fills its container. */
export function ProductImagePlaceholder({
  icon = "drive",
  label,
  className,
  iconClassName,
}: {
  icon?: Product["icon"];
  label?: string;
  className?: string;
  iconClassName?: string;
}) {
  const Icon = ICONS[icon] ?? HardDrive;

  return (
    <div
      role="img"
      aria-label={label ? `${label} – no image available` : "No image available"}
      className={cn("flex h-full w-full items-center justify-center", className)}
    >
      <Icon className={cn("size-1/2 text-neutral-200", iconClassName)} strokeWidth={1} />
    </div>
  );
}

/**
 * A product image in `fill` mode, or the placeholder when the product has no image.
 * The parent must be `relative` and have a size.
 */
export function ProductImage({
  src,
  alt,
  icon,
  sizes,
  className,
  iconClassName,
}: {
  src?: string;
  alt: string;
  icon?: Product["icon"];
  sizes?: string;
  className?: string;
  iconClassName?: string;
}) {
  if (!src) {
    return <ProductImagePlaceholder icon={icon} label={alt} iconClassName={iconClassName} />;
  }

  return <Image src={src} alt={alt} fill sizes={sizes} className={cn("object-contain", className)} />;
}
