export const SITE_NAME = "Secure Tech Oman";
export const SITE_TAGLINE = "Hardware You Can Rely On";
export const SITE_URL = "https://securetechoman.com";

/** GA4 measurement ID from NEXT_PUBLIC_GA_ID. Unset means no analytics script loads and nothing is sent. */
export const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_ID;

export const SITE_DESCRIPTION =
  "Secure Tech Oman is a leading IT hardware distributor, partnering with top storage, networking, and creative-hardware brands. We specialize in NAS storage solutions, high-performance HDDs/SSDs, NAS and SAN systems, UPS, servers, laptops, computers, desktops, and reliable data-backup products for corporates, resellers, and system integrators. Secure Tech Oman is a trusted computer hardware retailer.";

export const CONTACT = {
  // Single store number used for calls and WhatsApp everywhere on the site.
  phone: "+968 96079052",
  email: "sales@securetechoman.com",
  addressLine1: "Suite 602, Floor 6, Meridian Business Tower",
  addressLine2: "48 Commerce Boulevard, Elite City, 10245",
};

/** `tel:` link for CONTACT.phone. */
export const PHONE_HREF = `tel:${CONTACT.phone.replace(/[^\d+]/g, "")}`;

/** WhatsApp chat link to CONTACT.phone, optionally with a pre-filled message. */
export function whatsappLink(message?: string) {
  const number = CONTACT.phone.replace(/\D/g, "");
  return `https://wa.me/${number}${message ? `?text=${encodeURIComponent(message)}` : ""}`;
}

export const QUICK_LINKS: Array<{ label: string; href: string }> = [
  { label: "About Us", href: "/about" },
  { label: "Our Showroom", href: "/showroom" },
  { label: "Terms & Conditions", href: "/terms" },
  { label: "Privacy Policy", href: "/privacy" },
  { label: "Shipping & Cancellation", href: "/shipping" },
  { label: "Request for Wholesale", href: "/wholesale" },
  { label: "Contact", href: "/contact" },
];

// Top-level Shopify collection handles. These replace the old /categories/ slugs, which
// were hardcoded against local sample data and had no collection behind them.
export const FOOTER_CATEGORIES: Array<{ label: string; href: string }> = [
  { label: "Storage", href: "/collections/storage" },
  { label: "CCTV & Security Cameras", href: "/collections/cctv-security-cameras" },
  { label: "Recorders & NVR", href: "/collections/recorders-nvr" },
  { label: "Networking", href: "/collections/networking" },
  { label: "Access Control", href: "/collections/access-control" },
  { label: "IT & Server Solutions", href: "/collections/it-server-solutions" },
];

export const SUPPORT_LINK = { label: "RMA / Support Portal", href: "/support" };

export const MARQUEE_PARTNERS: string[] = [
  "IMOU",
  "Dahua",
  "Ezviz",
  "Hikvision",
  "Eufy",
  "Tapco",
  "Ubiquiti",
  "UNV",
  "Seagate",
  "Western Digital",
  "Toshiba",
  "Kingston",
  "Lexar",
  "SanDisk",
  "Ruijie",
  "Mercusys",
  "Grandstream",
  "Anker",
  "Soundcore",
  "Garmin",
  "Hang",
  "Teklo",
];

export const SOCIAL_LINKS: Array<{ label: string; href: string; icon: "facebook" | "instagram" | "whatsapp" }> = [
  { label: "Facebook", href: "#", icon: "facebook" },
  { label: "Instagram", href: "#", icon: "instagram" },
  { label: "WhatsApp", href: "#", icon: "whatsapp" },
];
