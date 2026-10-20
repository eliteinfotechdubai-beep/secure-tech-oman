import type { Brand } from "./types";

export const brands: Brand[] = [
  // CCTV
  { id: "imou", name: "Imou", wordmarkClassName: "font-bold text-orange-600", category: "storage" },
  { id: "dahua", name: "Dahua", wordmarkClassName: "font-bold text-blue-700", category: "storage" },
  { id: "ezviz", name: "Ezviz", wordmarkClassName: "font-bold text-sky-600", category: "storage" },
  { id: "hikvision", name: "Hikvision", wordmarkClassName: "font-extrabold text-brand-700", category: "storage" },
  { id: "eufy", name: "Eufy", wordmarkClassName: "font-bold text-slate-800", category: "storage" },
  { id: "tapo", name: "Tapo", wordmarkClassName: "font-bold text-emerald-600", category: "storage" },
  { id: "ubiquiti-cctv", name: "Ubiquiti", wordmarkClassName: "font-semibold text-emerald-700", category: "storage" },
  { id: "unv", name: "UNV", wordmarkClassName: "font-extrabold uppercase tracking-wide text-neutral-800", category: "storage" },

  // Hard Drives / SSD
  { id: "toshiba", name: "Toshiba", wordmarkClassName: "font-black uppercase tracking-wide text-slate-800", category: "drives", image: "/assets/hardware1.jpeg" },
  { id: "seagate", name: "Seagate", wordmarkClassName: "font-bold text-neutral-800", category: "drives", image: "/assets/hardware2.jpeg" },
  { id: "kingston", name: "Kingston", wordmarkClassName: "font-bold italic text-orange-600", category: "drives", image: "/assets/hardware3.jpeg" },
  { id: "westerndigital", name: "Western Digital", wordmarkClassName: "font-extrabold text-brand-700", category: "drives", image: "/assets/hardware4.jpeg" },
  { id: "sandisk", name: "SanDisk", wordmarkClassName: "font-bold text-brand-600", category: "drives", image: "/assets/hardware5.jpeg" },
  { id: "lexar", name: "Lexar", wordmarkClassName: "font-bold text-neutral-900", category: "drives", image: "/assets/hardware6.jpeg" },

  // Networking
  { id: "mercusys", name: "Mercusys", wordmarkClassName: "font-medium lowercase text-neutral-900", category: "networking", image: "/assets/network1.jpeg" },
  { id: "ruijie", name: "Ruijie | Reyee", wordmarkClassName: "font-bold text-blue-600", category: "networking", image: "/assets/network2.jpeg" },
  { id: "ubiquiti", name: "Ubiquiti", wordmarkClassName: "font-semibold text-emerald-700", category: "networking", image: "/assets/network3.jpeg" },
  { id: "fyber", name: "Fyber", wordmarkClassName: "font-bold uppercase tracking-wider text-slate-600", category: "networking", image: "/assets/network4.jpeg" },
  { id: "huawei", name: "Huawei eKit", wordmarkClassName: "font-bold text-cyan-600 tracking-wide", category: "networking", image: "/assets/network5.jpeg" },

  // Servers / Workstations / Gaming / UPS
  { id: "rackforge", name: "RackForge", wordmarkClassName: "font-bold text-emerald-700", category: "servers" },
  { id: "computeaxis", name: "ComputeAxis", wordmarkClassName: "font-extrabold text-neutral-900", category: "servers" },
  { id: "forgeworks", name: "ForgeWorks", wordmarkClassName: "font-bold text-brand-800", category: "servers" },
  { id: "voltguard", name: "VoltGuard", wordmarkClassName: "font-bold uppercase tracking-wide text-amber-700", category: "servers" },

  // Other brands — accessories, tablets, backup
  { id: "inkpoint", name: "InkPoint", wordmarkClassName: "font-semibold text-neutral-500 tracking-wide", category: "other" },
  { id: "shieldoptics", name: "ShieldOptics", wordmarkClassName: "font-medium text-slate-600", category: "other" },
  { id: "tapevault", name: "TapeVault", wordmarkClassName: "font-bold text-neutral-800", category: "other" },
  { id: "signpad", name: "SignPad", wordmarkClassName: "font-bold text-blue-700", category: "other" },
  { id: "grandstream", name: "Grandstream", wordmarkClassName: "font-bold text-blue-800", category: "other" },
  { id: "anker", name: "Anker", wordmarkClassName: "font-extrabold text-neutral-900", category: "other" },
  { id: "soundcore", name: "Soundcore", wordmarkClassName: "font-bold text-indigo-600", category: "other" },
  { id: "garwin", name: "Garwin", wordmarkClassName: "font-semibold text-amber-700", category: "other" },
  { id: "hang", name: "Hang", wordmarkClassName: "font-bold text-brand-600", category: "other" },
  { id: "teklo", name: "Teklo", wordmarkClassName: "font-bold uppercase tracking-wide text-slate-700", category: "other" },
];

export function brandsByCategory(category: Brand["category"]) {
  return brands.filter((brand) => brand.category === category);
}
