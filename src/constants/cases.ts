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
 * Figma "Mobile - home" collage (Group 34963, 354×460): the same pieces, in
 * the same order, around a portrait main image.
 */
export const CASE_COLLAGE_MOBILE: CaseCollage = {
  main: { rect: { x: 58.88, y: 38.11, width: 246.47, height: 398.51 } },
  pieces: [
    {
      ...CASE_COLLAGE.pieces[0],
      rect: { x: 202, y: 111, width: 151.09, height: 85.93 },
    },
    {
      ...CASE_COLLAGE.pieces[1],
      rect: { x: 146, y: 0, width: 136.24, height: 76.27 },
    },
    {
      ...CASE_COLLAGE.pieces[2],
      rect: { x: 165.32, y: 354, width: 188.66, height: 105.76 },
    },
    {
      ...CASE_COLLAGE.pieces[3],
      rect: { x: 0, y: 237, width: 113, height: 63.23 },
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
  "elle-fanning",
  "conexao-duo",
  "rotulos-naturallis",
] as const;
