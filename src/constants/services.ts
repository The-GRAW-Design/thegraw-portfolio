import { STUDIO_INFO } from "@/constants/studio";
import type { ServiceId } from "@/types/project";

/** Where the "Solicite sua proposta" buttons lead: an e-mail to the studio. */
export const PROPOSAL_HREF = `mailto:${STUDIO_INFO.email}`;

export type ServiceOffer = {
  id: ServiceId;
  /** Its line in the list. */
  title: string;
  /**
   * Its text beside the list. The Figma 2.0 box still holds Lorem ipsum: each
   * service keeps the text the Figma gave it before.
   */
  description: string;
  /**
   * Type size of its line: the Figma sets "Design de Produto" smaller so it
   * fits the list box; the others share the size of "Marcas".
   */
  size: string;
};

/**
 * The Figma "Services" 2.0 list (3120:938), in the order it turns: the
 * selected service sits at the bottom, in Pirata One, under the two that
 * follow it. Marcas, Design de Produto and Embalagens take the places of
 * Branding, Web design and Packpaging.
 */
export const SERVICE_OFFER: readonly ServiceOffer[] = [
  {
    id: "branding",
    title: "Marcas",
    description:
      "Marcas com personalidade, propósito e posicionamento. Desenvolvemos identidades visuais que vão além do logotipo, traduzindo a essência de cada negócio em uma linguagem única e consistente. Criamos sistemas de identidade que conectam pessoas, diferenciam marcas e deixam impressões que permanecem.",
    size: "text-title-sm lg:text-title",
  },
  {
    id: "web-design",
    title: "Design de Produto",
    description:
      "Experiências digitais que conectam estética, estratégia e funcionalidade. Desenvolvemos websites que traduzem a essência de cada marca em interfaces intuitivas, marcantes e pensadas para transformar visitantes em clientes. Cada detalhe é projetado para gerar conexão, fortalecer sua presença digital e destacar sua marca.",
    size: "text-service-sm lg:text-service",
  },
  {
    id: "packpaging",
    title: "Embalagens",
    description:
      "Embalagens em experiências de marca. Desenvolvemos soluções que unem criatividade, identidade e estratégia para destacar produtos, despertar desejo e criar conexões com o consumidor. Do conceito ao acabamento, cada detalhe importa na construção de uma embalagem que comunica antes mesmo de ser aberta.",
    size: "text-title-sm lg:text-title",
  },
];

/** The list for a service: the two after it, then the service itself. */
export function serviceOrder(active: ServiceId) {
  const index = SERVICE_OFFER.findIndex((service) => service.id === active);
  return SERVICE_OFFER.map(
    (_, step) => SERVICE_OFFER[(index + step + 1) % SERVICE_OFFER.length],
  );
}

/** The Figma placeholder text of the "Como fazemos?" rows. */
const METHOD_TEXT =
  "Lorem Ipsum é um texto de exemplo usado na indústria gráfica e na diagramação. É utilizado como padrão desde 1966, quando designers da Letraset e James Mosley, bibliotecário da St Bride Printing Library, em Londres, reorganizaram uma tradução de Cícero de 1914 para criar textos para as folhas Body Type da Letraset. O texto atravessou décadas e a transição para a diagramação eletrônica sem mudanças significativas. Foi popularizado por essas folhas e, mais recentemente, por programas como Aldus PageMaker e Microsoft Word, que incluem versões de Lorem Ipsum.";

export type MethodStep = {
  title: string;
  text: string;
  /** Desktop gap above the rule before this row (Figma: 65 and 90). */
  ruleClassName?: string;
};

/** Figma rows under the projects, a rule between each two. */
export const METHOD_STEPS: readonly MethodStep[] = [
  { title: "Como fazemos?", text: METHOD_TEXT },
  { title: "Metodologia", text: METHOD_TEXT, ruleClassName: "lg:mt-65" },
  { title: "Idealização", text: METHOD_TEXT, ruleClassName: "lg:mt-90" },
];

export const SERVICES_PAGE = {
  title: "Serviços",
  defaultService: "branding",
  /** Figma "Project view": the same four slides for every service. */
  slides: ["allce", "grupo-penguin", "conexao-duo", "elle-fanning"],
  projectsLabel: "Projetos",
  methodLabel: "Como fazemos",
} as const;
