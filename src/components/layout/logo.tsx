import Image from "next/image";
import Link from "next/link";
import { SITE_NAME, SITE_TAGLINE } from "@/lib/constants";
import { cn } from "@/lib/utils";

export function Logo({ variant = "light" }: { variant?: "light" | "dark" }) {
  return (
    <Link href="/" className="flex flex-col leading-tight">
      <span className="flex items-center gap-2">
        <Image
          src="/assets/logo/Secure tech oman/Secure-tech-oman-logo.jpg"
          alt={SITE_NAME}
          width={190}
          height={190}
          priority
          className="h-12 w-12 object-cover"
        />
        <Image
          src="/assets/logo/Secure tech oman/Secure-tech-oman-logo-2-cropped.png"
          alt={SITE_NAME}
          width={471}
          height={124}
          priority
          className="h-8 w-auto object-contain"
        />
      </span>
    </Link>
  );
}
