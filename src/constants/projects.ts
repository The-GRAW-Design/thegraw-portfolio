import type {
  Credit,
  LogoArt,
  Project,
  ProjectLogo,
  ProjectMedia,
  ShowcaseInfo,
} from "@/types/project";
import { asset } from "@/utils/asset";

const DIRECTOR = "André Gonçalves";

const credits = (
  lead: Credit,
  client: string,
  team: Credit,
  date: string,
): Project["credits"] => [
  [lead, { label: "Client", value: client }],
  [team, { label: "Date", value: date }],
];

const image = (slug: string, file: string, width: number, height: number) => ({
  src: asset(`/images/projects/${slug}/${file}.webp`),
  width,
  height,
});

const hero = (slug: string, position?: string) => ({
  src: asset(`/images/projects/${slug}/hero.webp`),
  position,
});

const cover = (slug: string) => asset(`/images/cases/covers/${slug}.webp`);

const logoLayer = (file: string, inset: string) => ({
  src: asset(`/images/logos/${file}.svg`),
  inset,
});

/** Figma placeholder ("Delete This") of the cases with no image yet. */
export const COMING_SOON_IMAGE = asset("/images/cases/coming-soon.webp");

/** Figma "Allce" project page (3023:996). */
const ALLCE_WIDE = (file: string) => image("allce", file, 1507, 848);

/** Figma "Grupo Penguin" project page (3023:1085). */
const PENGUIN_WIDE = (file: string) => image("grupo-penguin", file, 1507, 850);

/** Screens of the live E² Company site, captured at 1920×1080. */
const E2_SCREEN = (file: string) => image("e2-company", file, 1507, 848);

/** Screens of the live Elle Fanning site, captured at 1920×1080. */
const ELLE_SCREEN = (file: string) => image("elle-fanning", file, 1507, 848);

const PENGUIN_LOGO: ProjectLogo = {
  width: 595.22,
  height: 198.618,
  layers: [
    logoLayer("grupo-penguin-word-dark", "15.09% 2.79% 16.61% 29.08%"),
    logoLayer("grupo-penguin-tm-dark", "28.69% 0% 64.75% 95.23%"),
    logoLayer("grupo-penguin-mark-dark", "0.01% 71.06% -0.01% 0%"),
  ],
  panelClassName: "bg-smoke",
};

/** Figma symbol "logo - LORENA LOURENÇO" (3149:956). */
const LORENA_LOGO: ProjectLogo = {
  width: 707.68,
  height: 255.79,
  layers: [
    logoLayer("lorena-lourenco-top", "0% 0% 44.99% 0%"),
    logoLayer("lorena-lourenco-bottom", "62.26% 7.17% 0% 8.23%"),
  ],
  panelClassName: "bg-white-graw",
};

/** Figma symbol "Logo conexão Duo" (3149:957). */
const CONEXAO_LOGO: ProjectLogo = {
  width: 708,
  height: 183.247,
  layers: [logoLayer("conexao-duo", "0% 0% 0% 0%")],
  panelClassName: "bg-gray-graw",
};

/** Figma symbol "Logo allce", white (home slide, 113×44). */
const ALLCE_LOGO_LIGHT: LogoArt = {
  width: 113,
  height: 44,
  layers: [
    logoLayer("allce-light", "0% 0% 0% 0%"),
    logoLayer("allce-registered-light", "10.21% 0.03% 81.12% 96.56%"),
  ],
};

/** Figma "Logo Grupo Penguin", white (home and services slides). */
const PENGUIN_LOGO_LIGHT: LogoArt = {
  width: 98.596,
  height: 32.865,
  layers: [logoLayer("grupo-penguin", "0% 0% 0% 0%")],
};

/** Figma copy of the slides, written for Grupo Penguin and kept on all of them. */
const SHOWCASE_DESCRIPTION = "A calm, editorial, website for a wellness brand";
const SHOWCASE_DISCIPLINES = ["branding", "web design", "development"];

/** Home slide images, cropped to the frame and to the card. */
const showcaseImages = (slug: string) => ({
  background: asset(`/images/projects/${slug}/showcase.webp`),
  card: asset(`/images/projects/${slug}/card.webp`),
});

/** The 867.58×829.81 box next to "Solution" (Grupo Penguin page). */
const PENGUIN_SPLIT: ProjectMedia = {
  width: 867.58,
  height: 829.81,
  logo: PENGUIN_LOGO,
};

/**
 * The ten Figma project pages, in canvas order, and the home-only Gilberto do
 * Acordeon. Allce and Grupo Penguin have their Figma galleries; e2 company
 * and Elle Fanning have screens and texts of their live sites; the others
 * have names, credits and the photos of the "all projects" grid and of the
 * home slides, and show {EM BREVE} where the case study will go.
 */
export const PROJECTS: readonly Project[] = [
  {
    slug: "allce",
    name: "Allce",
    title: "Allce",
    category: "brand identy",
    services: ["branding"],
    cover: cover("allce"),
    hero: hero("allce"),
    collage: {
      main: asset("/images/projects/allce/wall.webp"),
      pieces: [
        asset("/images/projects/allce/tshirt.webp"),
        asset("/images/projects/allce/gym.webp"),
        asset("/images/projects/allce/news.webp"),
        asset("/images/projects/allce/chairs.webp"),
      ],
    },
    credits: credits(
      { label: "Project director", value: DIRECTOR },
      "Allce. Co",
      { label: "Motion Designer", value: "Alan Erick" },
      "2024",
    ),
    gallery: {
      lead: [image("allce", "logo", 1496, 844)],
      split: image("allce", "solution", 868, 847),
      middle: [
        [ALLCE_WIDE("gym"), ALLCE_WIDE("wall")],
        [ALLCE_WIDE("app")],
        [ALLCE_WIDE("tshirt")],
      ],
      closing: [
        image("allce", "chairs", 1496, 841),
        image("allce", "comfort", 1507, 847),
        image("allce", "news", 1507, 847),
      ],
      final: image("allce", "stage", 1920, 822),
    },
    showcase: {
      ...showcaseImages("allce"),
      client: "Allce. Co",
      year: "2024",
      handle: "/allce",
      logo: ALLCE_LOGO_LIGHT,
      description: SHOWCASE_DESCRIPTION,
      disciplines: ["branding", "Visual identy"],
    },
  },
  {
    slug: "grupo-penguin",
    name: "Grupo Penguin",
    title: "Grupo Penguin",
    category: "brand identy",
    services: ["branding"],
    cover: cover("grupo-penguin"),
    hero: hero("grupo-penguin"),
    collage: {
      main: asset("/images/projects/grupo-penguin/magazine.webp"),
      pieces: [
        asset("/images/projects/grupo-penguin/bags.webp"),
        asset("/images/projects/grupo-penguin/palette.webp"),
        asset("/images/projects/grupo-penguin/keys.webp"),
        asset("/images/projects/grupo-penguin/signage.webp"),
      ],
    },
    credits: credits(
      { label: "Project director", value: DIRECTOR },
      "Poliana Fernandes",
      { label: "Motion Designer", value: "Alan Erick" },
      "2025",
    ),
    gallery: {
      lead: [PENGUIN_WIDE("palette")],
      split: PENGUIN_SPLIT,
      middle: [
        [PENGUIN_WIDE("magazine")],
        [PENGUIN_WIDE("billboard")],
        [PENGUIN_WIDE("tags")],
      ],
      closing: [
        image("grupo-penguin", "bags", 1496, 847),
        image("grupo-penguin", "keys", 1496, 850),
        image("grupo-penguin", "signage", 1507, 846),
      ],
      final: { ...image("grupo-penguin", "basket", 1920, 800), bleed: true },
    },
    showcase: {
      ...showcaseImages("grupo-penguin"),
      client: "Poliana Fernandes",
      year: "2025",
      handle: "/grupopenguin",
      logo: PENGUIN_LOGO_LIGHT,
      description: SHOWCASE_DESCRIPTION,
      disciplines: SHOWCASE_DISCIPLINES,
    },
  },
  {
    slug: "e2-company",
    name: "e2 company",
    title: "E2 Company",
    category: "Web",
    services: ["web-design"],
    cover: cover("e2-company"),
    hero: hero("e2-company", "object-[50%_30%]"),
    collage: {
      main: asset("/images/projects/e2-company/home.webp"),
      pieces: [
        asset("/images/projects/e2-company/form.webp"),
        asset("/images/projects/e2-company/method.webp"),
        asset("/images/projects/e2-company/faq.webp"),
        asset("/images/projects/e2-company/purpose.webp"),
      ],
    },
    credits: credits(
      { label: "Project director", value: DIRECTOR },
      "E2 Company",
      { label: "Dev", value: DIRECTOR },
      "2025",
    ),
    gallery: {
      lead: [image("e2-company", "home", 1496, 844)],
      split: image("e2-company", "overview", 868, 847),
      middle: [
        [E2_SCREEN("consultancy"), E2_SCREEN("form")],
        [E2_SCREEN("method")],
        [E2_SCREEN("diagnosis")],
      ],
      closing: [E2_SCREEN("purpose"), E2_SCREEN("growth"), E2_SCREEN("faq")],
      final: { ...image("e2-company", "cta", 1920, 822), bleed: true },
    },
    copy: {
      intro:
        "The one-page institutional site of E² Company, built from the studio's Figma design. From the first free consultancy to the method, the diagnosis and the team's purpose, the page walks the visitor through how the company turns businesses into strong, profitable brands, with the contact form always one step away.",
      solution:
        "A dark page lit in blue and orange, where each section has its own movement: light rays behind the team in the hero, cards that answer the pointer, a form with an electric border and a checklist that springs when ticked. Decorative elements follow the 1920 px Figma frame at any desktop width, and below it the sections rearrange for mobile.",
      process:
        "Built with Next.js, Tailwind CSS, GSAP with ScrollTrigger and Lenis on the same clock, with every animation coming from React Bits components. The four WebGL backgrounds mount only when their section gets close to the screen and pause outside it, and reduced motion turns them and the smooth scroll off.",
      results:
        "A static site published on GitHub Pages at every push: one screen, nine sections and four WebGL backgrounds, with photos in WebP at display size. The form validates on the client and is ready to be connected to an e-mail or CRM service.",
    },
  },
  {
    slug: "lorena-lourenco",
    name: "Lorena Lourenço",
    title: "Lorena Lourenço",
    category: "brand identy",
    services: ["branding"],
    cover: cover("lorena-lourenco"),
    hero: hero("lorena-lourenco"),
    collage: { main: asset("/images/projects/lorena-lourenco/hero.webp") },
    credits: credits(
      { label: "Project director", value: DIRECTOR },
      "Lorena Lourenço",
      { label: "Motion Designer", value: "Alan Erick" },
      "2026",
    ),
    logo: LORENA_LOGO,
  },
  {
    slug: "site-naturallis",
    name: "Site Naturallis",
    title: "Web Naturallis",
    category: "Web",
    services: ["web-design"],
    cover: cover("site-naturallis"),
    hero: hero("site-naturallis", "object-[50%_45%]"),
    collage: { main: asset("/images/projects/site-naturallis/hero.webp") },
    credits: credits(
      { label: "Project director", value: DIRECTOR },
      "Naturallis",
      { label: "Dev", value: "Erik Elias" },
      "2026",
    ),
  },
  {
    slug: "conexao-duo",
    name: "Conexão Duo",
    title: "Conexão Duo",
    category: "brand identy",
    services: ["branding"],
    // The "Delete This" medal of the grid is this case's (home slide).
    cover: asset("/images/projects/conexao-duo/hero.webp"),
    hero: hero("conexao-duo"),
    collage: { main: asset("/images/projects/conexao-duo/hero.webp") },
    credits: credits(
      { label: "Project director", value: DIRECTOR },
      "Conexão Duo",
      { label: "Motion Designer", value: "Alan Erick" },
      "2026",
    ),
    logo: CONEXAO_LOGO,
    showcase: {
      background: asset("/images/projects/conexao-duo/hero.webp"),
      card: asset("/images/projects/conexao-duo/card.webp"),
      client: "Conexão Duo",
      year: "2026",
      handle: "/conexãoduo",
      logo: {
        width: 113,
        height: 29,
        layers: [logoLayer("conexao-duo", "0% 0% 0% 0%")],
      },
      description: SHOWCASE_DESCRIPTION,
      disciplines: SHOWCASE_DISCIPLINES,
    },
  },
  {
    slug: "rotulos-naturallis",
    name: "Rótulos Naturallis",
    title: "Rótulos Naturallis",
    category: "Packpaging",
    services: ["packpaging"],
    cover: null,
    hero: null,
    collage: null,
    credits: credits(
      { label: "Project director", value: "Thawany Gomes" },
      "Naturallis",
      { label: "Designer", value: DIRECTOR },
      "2024-2026",
    ),
  },
  {
    slug: "maria-clara-lopes",
    name: "Maria Clara Lopes",
    title: "Maria Clara Lopes",
    category: "Design",
    services: ["branding"],
    cover: null,
    hero: null,
    collage: null,
    credits: credits(
      { label: "Designer", value: DIRECTOR },
      "Maria Clara",
      { label: "Copie", value: DIRECTOR },
      "2025",
    ),
  },
  {
    slug: "elle-fanning",
    name: "Elle Fanning",
    title: "Elle Fanning",
    category: "brand identy",
    services: ["branding"],
    cover: cover("elle-fanning"),
    hero: hero("elle-fanning", "object-[50%_35%]"),
    collage: {
      main: asset("/images/projects/elle-fanning/home.webp"),
      pieces: [
        asset("/images/projects/elle-fanning/editorial.webp"),
        asset("/images/projects/elle-fanning/maleficent.webp"),
        asset("/images/projects/elle-fanning/now.webp"),
        asset("/images/projects/elle-fanning/characters.webp"),
      ],
    },
    credits: credits(
      { label: "Designer", value: DIRECTOR },
      "The Graw",
      { label: "Dev", value: "Erik Elias" },
      "2026",
    ),
    gallery: {
      lead: [image("elle-fanning", "home", 1496, 844)],
      split: image("elle-fanning", "portrait", 868, 847),
      middle: [
        [ELLE_SCREEN("maleficent"), ELLE_SCREEN("the-great")],
        [ELLE_SCREEN("characters")],
        [ELLE_SCREEN("editorial")],
      ],
      closing: [ELLE_SCREEN("name"), ELLE_SCREEN("now"), ELLE_SCREEN("covers")],
      final: { ...image("elle-fanning", "deck", 1920, 822), bleed: true },
    },
    copy: {
      intro:
        "A fan-made editorial portfolio for Elle Fanning that is also a creative front-end lab. Sixteen films, eight characters and ten magazine covers gathered with the care of a magazine editorial, in a fully static site where the shaders, the spring physics, the choreographed scroll and the sound were all written by hand.",
      solution:
        "Every section is a stage of its own. The hero is a pink field of thousands of 3D blocks, drawn in a single draw call, that ripples under the cursor around her portrait. In Filmography the word opens in half and the posters run between FILMO and GRAPHY like a film reel, while Characters fans eight roles out in a 3D arc that turns with the scroll.",
      process:
        "No template and no visual builder: each effect was written by hand on Next.js, Three.js, GSAP and Lenis, plus what the browser already offers. The choreography lives in pure functions that take a progress and return a pose, so one ticker moves the scroll, the cursor, the stages and the shaders in the same frame. A Web Audio engine adds the ambient track and a sound to every block and poster.",
      results:
        "A 100% static site, published on GitHub Pages at every push. It goes from phone to 4K, with its own composition for each section below 1024 px, respects reduced motion and stays light: WebP images, Three.js loaded on demand and WebGL paused off screen.",
    },
  },
  {
    slug: "tati-hotelzinho-pet",
    name: "Tati Hotelzinho Pet",
    title: "Tati Hotelzinho Pet",
    category: "brand identy",
    services: ["branding"],
    cover: cover("tati-hotelzinho-pet"),
    hero: hero("tati-hotelzinho-pet", "object-[50%_30%]"),
    collage: { main: asset("/images/projects/tati-hotelzinho-pet/hero.webp") },
    credits: credits(
      { label: "Project director", value: DIRECTOR },
      "Tati Hotelzinho Pet",
      { label: "Motion Designer", value: "Alan Erick" },
      "2024",
    ),
  },
  {
    // Only on the home (Figma "Projeto Allce" variant "projeto").
    slug: "gilberto-do-acordeon",
    name: "Gilberto do Acordeon",
    title: "Gilberto do Acordeon",
    category: "brand identy",
    services: ["branding"],
    cover: asset("/images/projects/gilberto-do-acordeon/card.webp"),
    hero: hero("gilberto-do-acordeon"),
    collage: {
      main: asset("/images/projects/gilberto-do-acordeon/hero.webp"),
    },
    credits: [[{ label: "Client", value: "Gilberto do Acordeon" }]],
    showcase: {
      background: asset("/images/projects/gilberto-do-acordeon/hero.webp"),
      card: asset("/images/projects/gilberto-do-acordeon/card.webp"),
      client: "Gilberto do Acordeon",
      year: "2026",
      handle: "/gilbertodoacordeon",
      description: SHOWCASE_DESCRIPTION,
      disciplines: SHOWCASE_DISCIPLINES,
    },
  },
];

/**
 * Figma "Projeto view Services" slides: every variant shows this Grupo
 * Penguin placeholder.
 */
export const PROJECT_SHOWCASE = {
  slug: "grupo-penguin",
  image: asset("/images/services/project-slide.webp"),
  info: {
    client: "grupo penguin",
    year: "2026",
    handle: "/grupopenguin",
    logo: PENGUIN_LOGO_LIGHT,
    description: SHOWCASE_DESCRIPTION,
    disciplines: SHOWCASE_DISCIPLINES,
  } satisfies ShowcaseInfo,
} as const;

export const SHOWCASE_LABELS = {
  client: "Client",
  year: "year",
  explore: "Explore project",
} as const;

export function getProjectHref(project: Pick<Project, "slug">) {
  return `/cases/${project.slug}`;
}

export function findProject(slug: string) {
  return PROJECTS.find((project) => project.slug === slug);
}

/** Studio "Projects Lead" card. */
export const FEATURED_PROJECT = PROJECTS[0];
