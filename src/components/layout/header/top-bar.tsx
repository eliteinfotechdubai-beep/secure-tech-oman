import Link from "next/link";
import { Mail, Phone } from "lucide-react";
import { SocialIcon } from "@/components/common/social-icon";
import { CONTACT, SOCIAL_LINKS } from "@/lib/constants";

export function TopBar() {
  return (
    <div className="hidden border-b border-border bg-background sm:block">
      <div className="mx-auto flex  items-center justify-between px-8 lg:px-28 py-2 text-sm ">
        <div className="flex items-center gap-5">
          <span className="flex items-center gap-1.5">
            <span className="font-medium ">Need Help?</span>
            <Phone className="size-3.5" />
            {CONTACT.phone}
          </span>
          <span className="hidden items-center gap-1.5 lg:flex">
            <Mail className="size-3.5" />
            {CONTACT.email}
          </span>
          <div className="flex items-center gap-2">
            {SOCIAL_LINKS.map((social) => (
              <Link
                key={social.label}
                href={social.href}
                aria-label={social.label}
                className="flex size-6 items-center justify-center rounded-full  hover:bg-white hover:text-brand-900"
              >
                <SocialIcon name={social.icon} className="size-3.5" />
              </Link>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-5">
          <span className="hidden  lg:inline">
            Enterprise Solution And Service Center
          </span>
          <Link href="/about" className="hover:/70 cursor-pointer">
            About Us
          </Link>
          <Link
            href="/contact"
            className="hover:/70 cursor-pointer"
          >
            Contact Us
          </Link>
        </div>
      </div>
    </div>
  );
}
