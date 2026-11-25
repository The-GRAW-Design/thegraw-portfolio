import { STUDIO_INFO } from "@/constants/studio";
import { asset } from "@/utils/asset";

/** Each link carries the thumbnail the menu opens beside it. */
export const NAV_LINKS = [
  { label: "Início", href: "/", visual: asset("/images/menu/home.webp") },
  {
    label: "Projetos",
    href: "/cases",
    visual: asset("/images/menu/cases.webp"),
  },
  {
    label: "Estúdio",
    href: "/studio",
    visual: asset("/images/menu/studio.webp"),
  },
  {
    label: "Serviços",
    href: "/services",
    visual: asset("/images/menu/services.webp"),
  },
] as const;

export const FOOTER_LINKS = [
  { label: "Work", href: "/cases" },
  { label: "Studio", href: "/studio" },
] as const;

/** Site 2.0 footer links (desktop). */
export const FOOTER_LINKS_PT = [
  { label: "Projetos", href: "/cases" },
  { label: "Estúdio", href: "/studio" },
] as const;

/** Header "contato" (Figma HOTBAR, desktop only): an e-mail to the studio. */
export const CONTACT_LINK = {
  label: "contato",
  href: `mailto:${STUDIO_INFO.email}`,
} as const;
