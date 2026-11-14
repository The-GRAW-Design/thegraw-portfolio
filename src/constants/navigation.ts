import { asset } from "@/utils/asset";

/** Each link carries the thumbnail the menu opens beside it. */
export const NAV_LINKS = [
  { label: "home", href: "/", visual: asset("/images/menu/home.webp") },
  { label: "cases", href: "/cases", visual: asset("/images/menu/cases.webp") },
  {
    label: "studio",
    href: "/studio",
    visual: asset("/images/menu/studio.webp"),
  },
  {
    label: "services",
    href: "/services",
    visual: asset("/images/menu/services.webp"),
  },
] as const;

export const FOOTER_LINKS = [
  { label: "Work", href: "/cases" },
  { label: "Studio", href: "/studio" },
] as const;
