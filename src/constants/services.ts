import { STUDIO_INFO } from "@/constants/studio";
import type { ServiceId } from "@/types/project";
import { asset } from "@/utils/asset";

/** Figma CTA copy, kept as written in the design. */
export const PROPOSAL_CTA = "Socilite sua proposta";
export const PROPOSAL_HREF = `mailto:${STUDIO_INFO.email}`;

export const LETS_WORK = {
  title: "Let's work together",
  copy: [
    "Work with us if average isn't your thing.",
    "Drop it, we'll build it!",
  ],
} as const;

export type ServiceOffer = {
  id: ServiceId;
  title: string;
  /** Hero photo of the service, cropped to the 1920×1400 Figma frame. */
  image: string;
};

/**
 * Figma "Services" hero states, in the order the list turns: the selected
 * service sits at the bottom, in white, under the two that follow it.
 */
export const SERVICE_OFFER: readonly ServiceOffer[] = [
  {
    id: "branding",
    title: "Branding",
    image: asset("/images/services/branding.webp"),
  },
  {
    id: "web-design",
    title: "Web design",
    image: asset("/images/services/web-design.webp"),
  },
  {
    id: "packpaging",
    title: "Packpaging",
    image: asset("/images/services/packpaging.webp"),
  },
];

/** The hero list for a service: the two after it, then the service itself. */
export function serviceOrder(active: ServiceId) {
  const index = SERVICE_OFFER.findIndex((service) => service.id === active);
  return SERVICE_OFFER.map(
    (_, step) => SERVICE_OFFER[(index + step + 1) % SERVICE_OFFER.length],
  );
}

export const SERVICES_PAGE = {
  title: "Services",
  defaultService: "branding",
  /** Three slides per service in the Figma. */
  slidesPerService: 3,
  back: "back",
} as const;

export function projectsLabel(title: string) {
  return `projects <${title.toLowerCase()}>`;
}
