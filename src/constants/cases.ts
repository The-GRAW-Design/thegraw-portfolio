import type { CaseCollage } from "@/features/cases/types";
import type { ServiceId } from "@/types/project";
import { asset } from "@/utils/asset";

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
 * Figma "Projeto" collage (1276×655): the main image plus the pieces around
 * it, each image cropped like in the design (`crop` as % of its box, matched
 * against the Figma render). All ten variants use the same placeholder.
 */
export const CASE_COLLAGE: CaseCollage = {
  main: {
    src: asset("/images/cases/collage-main.webp"),
    rect: { x: 200, y: 56, width: 936, height: 526 },
    crop: { width: 100, height: 222.43, left: 0, top: -54.54 },
  },
  pieces: [
    {
      src: asset("/images/cases/collage-bottom.webp"),
      rect: { x: 310, y: 481, width: 310, height: 174 },
      crop: { width: 101.94, height: 227.59, left: -1.29, top: -54.02 },
      behind: true,
      depth: 0.5,
      seed: [0.35, 0.9],
    },
    {
      src: asset("/images/cases/collage-top.webp"),
      rect: { x: 112, y: 0, width: 396, height: 222 },
      crop: { width: 106.06, height: 236.94, left: -2.53, top: -63.06 },
      depth: 0.64,
      seed: [0.2, 0.7],
    },
    {
      src: asset("/images/cases/collage-right.webp"),
      rect: { x: 978, y: 261, width: 298, height: 174 },
      crop: { width: 106.04, height: 227.59, left: 0, top: -9.2 },
      depth: 0.76,
      seed: [0.55, 0.3],
    },
    {
      src: asset("/images/cases/collage-left.webp"),
      rect: { x: 0, y: 307, width: 310, height: 174 },
      crop: { width: 110.32, height: 349.43, left: -4.52, top: -120.69 },
      depth: 0.7,
      seed: [0.8, 0.1],
    },
  ],
};

/** "all projects" grid, in Figma order: name, image, case slug (when there is a page). */
const GRID: readonly (readonly [string, string, string | null])[] = [
  ["Grupo Penguin", "grupo-penguin", "grupo-penguin"],
  ["Lorena Lourenço", "lorena-lourenco", "lorena-lourenco"],
  ["Allce", "allce", "allce"],
  ["Tati Hotelzinho Pet", "tati-hotelzinho-pet", null],
  ["e2 company", "e2-company", "e2-company"],
  ["Elle Fanning", "elle-fanning", "elle-fanning"],
  ["Site Naturallis", "site-naturallis", "site-naturallis"],
  ["Medalha", "medal", null],
];

export const ALL_PROJECTS_GRID = GRID.map(([name, image, slug]) => ({
  name,
  image: asset(`/images/cases/covers/${image}.webp`),
  slug,
}));
