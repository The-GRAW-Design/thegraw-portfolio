import { STUDIO_INFO } from "@/constants/studio";
import type { ServiceId } from "@/types/project";
import { asset } from "@/utils/asset";

/** Where the "Solicite sua proposta" buttons lead: an e-mail to the studio. */
export const PROPOSAL_HREF = `mailto:${STUDIO_INFO.email}`;

export type ServiceOffer = {
  id: ServiceId;
  title: string;
  /** Hero photo of the service, cropped to the 1920×1400 Figma frame. */
  image: string;
  /** Hero text of the service, at the left of the frame. */
  description: string;
  /** Its Figma box: width, and drop below the shared top line. */
  descriptionClassName: string;
};

/**
 * Figma "Services" hero states (3071:2068, 3071:2237, 3071:2215), in the order
 * the list turns: the selected service sits at the bottom, in white, under the
 * two that follow it.
 */
export const SERVICE_OFFER: readonly ServiceOffer[] = [
  {
    id: "branding",
    title: "Branding",
    image: asset("/images/services/branding.webp"),
    description:
      "Marcas com personalidade, propósito e posicionamento. Desenvolvemos identidades visuais que vão além do logotipo, traduzindo a essência de cada negócio em uma linguagem única e consistente. Criamos sistemas de identidade que conectam pessoas, diferenciam marcas e deixam impressões que permanecem.",
    descriptionClassName: "lg:w-493",
  },
  {
    id: "web-design",
    title: "Web design",
    image: asset("/images/services/web-design.webp"),
    description:
      "Experiências digitais que conectam estética, estratégia e funcionalidade. Desenvolvemos websites que traduzem a essência de cada marca em interfaces intuitivas, marcantes e pensadas para transformar visitantes em clientes. Cada detalhe é projetado para gerar conexão, fortalecer sua presença digital e destacar sua marca.",
    descriptionClassName: "lg:w-493",
  },
  {
    id: "packpaging",
    title: "Packpaging",
    image: asset("/images/services/packpaging.webp"),
    description:
      "Embalagens em experiências de marca. Desenvolvemos soluções que unem criatividade, identidade e estratégia para destacar produtos, despertar desejo e criar conexões com o consumidor. Do conceito ao acabamento, cada detalhe importa na construção de uma embalagem que comunica antes mesmo de ser aberta.",
    descriptionClassName: "lg:mt-18 lg:w-534",
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
  /** Figma "Project view" (3309:5445): the same four slides on every service. */
  slides: ["allce", "grupo-penguin", "conexao-duo", "elle-fanning"],
  back: "back",
} as const;

export function projectsLabel(title: string) {
  return `projects <${title.toLowerCase()}>`;
}
