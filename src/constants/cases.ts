import type { CaseCollage } from "@/features/cases/types";
import type { ServiceId } from "@/types/project";

export const CASES_PAGE = {
  title: "Cases",
  viewMore: "view more",
  viewAll: "view all",
  allTitle: "All projects",
} as const;

/** Cases tabs: the studio services, as named on the Figma services page. */
export const SERVICE_TABS: readonly { id: ServiceId; label: string }[] = [
  { id: "branding", label: "Branding" },
  { id: "web-design", label: "Web design" },
  { id: "packpaging", label: "Packpaging" },
];

/**
 * Figma "Projeto" collage (1276×655): where the main image and the pieces
 * around it sit. Each case fills it with its own images (`Project.collage`).
 */
export const CASE_COLLAGE: CaseCollage = {
  main: { rect: { x: 200, y: 56, width: 936, height: 526 } },
  pieces: [
    {
      rect: { x: 310, y: 481, width: 310, height: 174 },
      behind: true,
      depth: 0.5,
      seed: [0.35, 0.9],
    },
    {
      rect: { x: 112, y: 0, width: 396, height: 222 },
      depth: 0.64,
      seed: [0.2, 0.7],
    },
    {
      rect: { x: 978, y: 261, width: 298, height: 174 },
      depth: 0.76,
      seed: [0.55, 0.3],
    },
    {
      rect: { x: 0, y: 307, width: 310, height: 174 },
      depth: 0.7,
      seed: [0.8, 0.1],
    },
  ],
};

/**
 * "all projects" grid, in Figma order (its "Delete This" medal is Conexão
 * Duo's), then the cases it does not have yet; the ones without a photo show
 * the {EM BREVE} card.
 */
export const ALL_PROJECTS_ORDER = [
  "grupo-penguin",
  "lorena-lourenco",
  "allce",
  "tati-hotelzinho-pet",
  "e2-company",
  "elle-fanning",
  "site-naturallis",
  "conexao-duo",
  "gilberto-do-acordeon",
  "rotulos-naturallis",
  "maria-clara-lopes",
] as const;
