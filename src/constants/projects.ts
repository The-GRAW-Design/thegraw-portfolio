import type {
  Credit,
  LogoArt,
  Project,
  ProjectCollage,
  ProjectLogo,
  ProjectMedia,
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

/** A Figma "Projeto" collage variant, each image cropped to its box. */
const figmaCollage = (slug: string): ProjectCollage => {
  const piece = (name: string) =>
    asset(`/images/projects/${slug}/collage-${name}.webp`);
  return {
    main: piece("main"),
    pieces: [piece("bottom"), piece("top"), piece("right"), piece("left")],
  };
};

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

/** Figma gallery boxes of the project pages (1517.428 frame minus its 11.109 padding). */
const FIGMA_WIDE = { width: 1495.21, height: 829.81 } as const;
const FIGMA_SPLIT = { width: 867.58, height: 829.81 } as const;
const FIGMA_FINAL = { width: 1900, height: 799 } as const;

/** Figma "Lorena Lourenço" project page (3023:1263). */
const LORENA_WIDE = (file: string) =>
  image("lorena-lourenco", file, FIGMA_WIDE.width, FIGMA_WIDE.height);

/** Figma "Conexão Duo" project page (3023:1441). */
const CONEXAO_WIDE = (file: string) =>
  image("conexao-duo", file, FIGMA_WIDE.width, FIGMA_WIDE.height);

/** Screens of the live E² Company site, captured at 1920×1080. */
const E2_SCREEN = (file: string) => image("e2-company", file, 1507, 848);

/**
 * Figma "Elle Fanning" page (3023:1708): screens of the site composed in the
 * design, each box rendered from the Figma at 2x.
 */
const ELLE_BOX = (file: string, width: number, height: number) =>
  image("elle-fanning", file, width, height);

/** Figma "ELLE FANNING" logo over the hero (group 3298:3859). */
const ELLE_HERO_LOGO: LogoArt = {
  width: 1489.82,
  height: 126.633,
  layers: [logoLayer("elle-fanning", "0% 0% 0% 0%")],
};

/** Figma "Tati Hotelzinho Pet" page (3023:1797): its photos, as boxes. */
const TATI_WIDE = (file: string) =>
  image("tati-hotelzinho-pet", file, FIGMA_WIDE.width, FIGMA_WIDE.height);
const TATI_HALF = (file: string) =>
  image("tati-hotelzinho-pet", file, 742.05, 829.81);

/** Screens of the live Naturallis site, captured at 1920×1080. */
const NATURALLIS_SCREEN = (file: string) =>
  image("site-naturallis", file, 1507, 848);

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

/** Figma "Isolation_Mode" (3298:1047): Gilberto do Acordeon's logo on its slide. */
const GILBERTO_LOGO_LIGHT: LogoArt = {
  width: 131,
  height: 39,
  layers: [logoLayer("gilberto-do-acordeon", "0% 0% 0% 0%")],
};

/** Figma "Elle fanning" slide logo: "ELLE" over "FANNING." (3309:4947). */
const ELLE_LOGO_LIGHT: LogoArt = {
  width: 112.776,
  height: 49.742,
  layers: [
    logoLayer("elle-fanning-slide-elle", "0% 57.86% 54.17% 0%"),
    logoLayer("elle-fanning-slide-fanning", "52.15% 0% 0% 0%"),
  ],
};

/** Disciplines of the branding slides, as written in the Figma. */
const VISUAL_IDENTITY = ["branding", "Visual Identy"];

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
 * The Figma project pages, in canvas order (Maria Clara Lopes left out at the
 * user's request), and Gilberto do Acordeon (its Figma page is still a
 * placeholder). Allce, Grupo Penguin, Lorena Lourenço,
 * Conexão Duo, Elle Fanning and Tati Hotelzinho Pet have their Figma galleries
 * and texts; e2 company and Site Naturallis have screens and texts of their
 * live sites; the others have names, credits and the photos of the "all
 * projects" grid and of the home slides, and show {EM BREVE} where the case
 * study will go.
 */
const ALL_PROJECTS: readonly Project[] = [
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
    copy: {
      intro:
        "A Allce nasce da conexão entre movimento, bem-estar e estilo de vida. Uma marca que acredita que o conforto e a autenticidade devem acompanhar cada pessoa em sua jornada. O projeto busca construir uma identidade visual contemporânea, capaz de transmitir energia, liberdade e personalidade, conectando o universo esportivo ao cotidiano.",
      solution:
        "A solução foi desenvolver uma identidade que traduzisse a essência da marca por meio de uma linguagem visual forte e versátil. O logotipo, a paleta de cores e os elementos gráficos foram pensados para criar reconhecimento e consistência em diferentes pontos de contato, desde peças de vestuário até materiais promocionais e ambientes físicos.",
      process:
        "O processo criativo partiu da exploração de referências ligadas ao esporte, à moda e ao comportamento contemporâneo. A partir disso, foram desenvolvidos os elementos da identidade, explorando tipografia, composição e aplicações em diferentes superfícies. Cada detalhe foi pensado para manter uma comunicação visual coerente, equilibrando funcionalidade e expressão estética.",
      results:
        "O resultado é uma identidade visual marcante, que aproxima o universo fitness do lifestyle. A marca ganha presença em diferentes formatos, mantendo sua personalidade em produtos, materiais gráficos, comunicação digital e experiências físicas. Uma linguagem visual construída para acompanhar o movimento e transmitir a essência da Allce.",
    },
    showcase: {
      ...showcaseImages("allce"),
      client: "RH SPORTS",
      year: "2024",
      handle: "/allce",
      logo: ALLCE_LOGO_LIGHT,
      description: "A fashion brand for sport life style",
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
    // Figma "Projeto" variant "Projeto 1".
    collage: figmaCollage("grupo-penguin"),
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
    copy: {
      intro:
        "O Grupo Penguin apresenta um universo visual construído a partir da criatividade, da comunicação e da identidade. O projeto explora uma linguagem gráfica expressiva, utilizando o universo do pinguim como elemento central para desenvolver uma marca reconhecível, dinâmica e cheia de personalidade.",
      solution:
        "A proposta foi desenvolver uma identidade visual capaz de se adaptar a diferentes contextos e materiais. A combinação de cores vibrantes, elementos gráficos marcantes e uma tipografia característica estabelece uma comunicação visual consistente. O sistema foi pensado para funcionar tanto em materiais editoriais quanto em aplicações institucionais, promocionais e digitais.",
      process:
        "O processo criativo começou pela definição do conceito visual e pela exploração de elementos que representassem a personalidade do grupo. Foram desenvolvidas aplicações em publicações, materiais impressos, sinalização, produtos personalizados e peças de comunicação, explorando diferentes formatos sem perder a unidade visual.",
      results:
        "O resultado é um universo de marca versátil e expressivo, que conecta identidade, comunicação e aplicações físicas. A linguagem desenvolvida proporciona reconhecimento visual e permite que o Grupo Penguin mantenha uma presença consistente em diferentes ambientes, reforçando sua personalidade em cada ponto de contato.",
    },
    showcase: {
      ...showcaseImages("grupo-penguin"),
      client: "grupo penguin",
      year: "2025",
      handle: "/grupopenguin",
      logo: PENGUIN_LOGO_LIGHT,
      description: "A youthful brand for digital marketing consultancies",
      descriptionWidth: 287,
      disciplines: VISUAL_IDENTITY,
    },
  },
  {
    slug: "e2-company",
    // Taken off the site for now at the user's request (hidden in the Figma grid).
    hidden: true,
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
      { label: "Dev", value: "Erik Elias" },
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
    // Figma "Projeto" variant "Projeto 2".
    collage: figmaCollage("lorena-lourenco"),
    credits: credits(
      { label: "Project director", value: DIRECTOR },
      "Lorena Lourenço",
      { label: "Motion Designer", value: "Alan Erick" },
      "2026",
    ),
    copy: {
      intro:
        "O projeto Lorena Lourenço nasce da proposta de construir uma identidade visual que traduza personalidade, elegância e posicionamento profissional. Uma marca que une sofisticação e autenticidade, refletindo a essência de uma presença feminina contemporânea. A proposta é transformar sua imagem em uma identidade consistente, capaz de comunicar confiança, exclusividade e profissionalismo.",
      solution:
        "A solução foi desenvolver uma identidade visual minimalista e atemporal, explorando uma combinação de tipografias sofisticadas, formas delicadas e uma paleta de cores neutras. Os tons de verde-oliva, off-white e preto reforçam a sensação de equilíbrio e requinte, enquanto a construção do logotipo estabelece uma assinatura visual elegante e reconhecível.",
      process:
        "O processo criativo partiu da construção de um universo visual alinhado à personalidade e ao posicionamento da marca. Foram exploradas diferentes composições tipográficas, aplicações do logotipo, variações cromáticas e elementos gráficos. A identidade foi desdobrada em materiais institucionais, comunicação digital e peças promocionais, mantendo uma linguagem visual uniforme e sofisticada.",
      results:
        "O resultado é uma identidade visual que traduz profissionalismo e elegância por meio de uma estética limpa e refinada. A combinação entre tipografia, cores e fotografia constrói uma presença marcante, fortalecendo o reconhecimento da marca e criando uma comunicação visual coerente em todos os seus pontos de contato.",
    },
    logo: LORENA_LOGO,
    // The Figma page has two boxes after "results" (its third one is empty).
    gallery: {
      lead: [LORENA_WIDE("logo-light")],
      split: image(
        "lorena-lourenco",
        "logo-dark",
        FIGMA_SPLIT.width,
        FIGMA_SPLIT.height,
      ),
      middle: [
        [LORENA_WIDE("about")],
        [LORENA_WIDE("gilroy")],
        [LORENA_WIDE("cavas")],
      ],
      closing: [LORENA_WIDE("versions"), LORENA_WIDE("palette")],
      final: image(
        "lorena-lourenco",
        "portraits",
        FIGMA_FINAL.width,
        FIGMA_FINAL.height,
      ),
    },
  },
  {
    slug: "site-naturallis",
    // Taken off the site for now at the user's request (hidden in the Figma grid).
    hidden: true,
    name: "Site Naturallis",
    title: "Web Naturallis",
    category: "Web",
    services: ["web-design"],
    cover: cover("site-naturallis"),
    hero: hero("site-naturallis", "object-[50%_45%]"),
    collage: {
      main: asset("/images/projects/site-naturallis/home.webp"),
      pieces: [
        asset("/images/projects/site-naturallis/skin-line.webp"),
        asset("/images/projects/site-naturallis/products.webp"),
        asset("/images/projects/site-naturallis/before-after.webp"),
        asset("/images/projects/site-naturallis/cta.webp"),
      ],
    },
    credits: credits(
      { label: "Project director", value: DIRECTOR },
      "Naturallis",
      { label: "Dev", value: "Erik Elias" },
      "2026",
    ),
    gallery: {
      lead: [image("site-naturallis", "home", 1496, 844)],
      split: image("site-naturallis", "product", 868, 847),
      middle: [
        [NATURALLIS_SCREEN("products"), NATURALLIS_SCREEN("skin-line")],
        [NATURALLIS_SCREEN("care")],
        [NATURALLIS_SCREEN("shop")],
      ],
      closing: [
        NATURALLIS_SCREEN("before-after"),
        NATURALLIS_SCREEN("testimonials"),
        NATURALLIS_SCREEN("cta"),
      ],
      final: { ...image("site-naturallis", "footer", 1920, 822), bleed: true },
    },
    copy: {
      intro:
        "The institutional site and storefront of Naturallis, a compounding pharmacy with more than thirty years in business. Custom formulas, supplements and care products share one calm system of green and white pages, from the home to the catalogue, the product page, the ingredients and the formula request.",
      solution:
        "The home opens inside the pharmacy, with the numbers of the house counting up beside the portrait, and moves through the best sellers, the skin line, the care pillars, the ingredients and a before and after slider. Products come in carousels and in a catalogue with categories and filters, and each one has its own page with sizes, details, how to use and a cart.",
      process:
        "Built with Next.js, Tailwind CSS, GSAP with ScrollTrigger and Lenis. The hero and skin line photos become a Three.js distortion scene when WebGL is available, and stay as plain images when it is not or when reduced motion is on. A preloader, page transitions, a custom cursor and magnetic buttons tie the pages together.",
      results:
        "A static site published on GitHub Pages at every push, with home, catalogue, product, formulas, ingredients, about, contact, cart and account pages. The cart and the formula request hand the order over to the pharmacy's WhatsApp, so the store works with no server behind it.",
    },
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
    // Figma has no pieces for it yet (HYRO placeholder): pieces from its gallery.
    collage: {
      main: asset("/images/projects/conexao-duo/hero.webp"),
      pieces: [
        asset("/images/projects/conexao-duo/bags.webp"),
        asset("/images/projects/conexao-duo/flag.webp"),
        asset("/images/projects/conexao-duo/campaign.webp"),
        asset("/images/projects/conexao-duo/inegociavel.webp"),
      ],
    },
    credits: credits(
      { label: "Project director", value: DIRECTOR },
      "Conexão Duo",
      { label: "Motion Designer", value: "Alan Erick" },
      "2026",
    ),
    logo: CONEXAO_LOGO,
    gallery: {
      lead: [CONEXAO_WIDE("flag")],
      split: image(
        "conexao-duo",
        "symbol",
        FIGMA_SPLIT.width,
        FIGMA_SPLIT.height,
      ),
      middle: [
        [CONEXAO_WIDE("colors")],
        [CONEXAO_WIDE("inegociavel")],
        [CONEXAO_WIDE("campaign")],
      ],
      closing: [
        CONEXAO_WIDE("bags"),
        CONEXAO_WIDE("posts"),
        CONEXAO_WIDE("seo"),
      ],
      final: image(
        "conexao-duo",
        "stamp",
        FIGMA_FINAL.width,
        FIGMA_FINAL.height,
      ),
    },
    copy: {
      intro:
        "A Conexão Duo representa o encontro entre estratégia, relacionamento e novas possibilidades. Inspirado na força das conexões e na construção de oportunidades, o projeto propõe uma identidade visual que une elementos clássicos e contemporâneos, transmitindo solidez, confiança e personalidade.",
      solution:
        "O desenvolvimento da identidade buscou traduzir visualmente o conceito de conexão por meio de formas geométricas, símbolos e uma linguagem gráfica de forte presença. A combinação entre referências históricas e elementos modernos cria um universo visual próprio, permitindo que a marca se destaque e mantenha consistência em diferentes aplicações.",
      process:
        "A construção do projeto envolveu pesquisas visuais, exploração de conceitos e desenvolvimento de elementos gráficos que representassem a essência da marca. A identidade foi aplicada em materiais institucionais, peças promocionais, produtos personalizados e comunicação digital, criando uma experiência visual integrada.",
      results:
        "O resultado é uma identidade com personalidade e posicionamento bem definidos. A combinação de elementos visuais, materiais e aplicações fortalece a presença da Conexão Duo, transmitindo profissionalismo e criando uma comunicação consistente em diferentes plataformas e experiências de marca.",
    },
    showcase: {
      background: asset("/images/projects/conexao-duo/hero.webp"),
      card: asset("/images/projects/conexao-duo/card.webp"),
      client: "Lorera lOURENÇO",
      year: "2026",
      handle: "/conexãoduo",
      logo: {
        width: 113,
        height: 29,
        layers: [logoLayer("conexao-duo", "0% 0% 0% 0%")],
      },
      description: "A youthful brand for digital solutions for lawyers",
      descriptionWidth: 276,
      disciplines: VISUAL_IDENTITY,
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
    slug: "elle-fanning",
    name: "Elle Fanning",
    title: "Elle Fanning",
    category: "Web",
    services: ["web-design"],
    cover: cover("elle-fanning"),
    hero: {
      ...hero("elle-fanning"),
      overlay: { logo: ELLE_HERO_LOGO, left: 215, top: 252 },
    },
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
    // Several boxes run to the right edge of their frame, as in the Figma.
    gallery: {
      lead: [{ ...ELLE_BOX("characters-arc", 1506.32, 1122.89), flush: true }],
      split: { ...ELLE_BOX("loading", 878.6, 829.81), flush: true },
      middle: [
        [ELLE_BOX("filmography", 1495.21, 822)],
        [ELLE_BOX("phones", 1495.6, 934.75)],
        [ELLE_BOX("character-open", 1495.21, 1089.48)],
      ],
      closing: [
        { ...ELLE_BOX("now-showing", 1506.32, 661.49), flush: true },
        { ...ELLE_BOX("home-cover", 1506.32, 1568.6), flush: true },
        ELLE_BOX("people", 1495.21, 1108.17),
      ],
      final: { ...ELLE_BOX("loader", 1910, 1083), flush: true },
    },
    copy: {
      intro:
        "Um projeto visual inspirado na trajetória e na versatilidade de Elle Fanning, explorando sua presença no cinema, suas diferentes interpretações e sua identidade artística. A proposta é construir um universo editorial que conecta fotografia, tipografia e narrativa cinematográfica, transformando sua carreira em uma experiência visual contemporânea e expressiva.",
      solution:
        "A solução criativa parte de uma identidade editorial que combina elegância, personalidade e referências cinematográficas. A direção de arte explora contrastes tipográficos, composições fotográficas e uma paleta marcada pelo rosa, criando uma linguagem visual que equilibra delicadeza e força. O conceito se estende por diferentes formatos, mantendo unidade e reconhecimento em cada aplicação.",
      process:
        "O desenvolvimento envolveu pesquisa de referências visuais, seleção de imagens e exploração de diferentes linguagens editoriais. Foram construídas composições para capas, publicações, peças digitais e materiais promocionais, utilizando a fotografia como elemento central da narrativa. Cada aplicação foi pensada para destacar diferentes fases e personagens da carreira da atriz.",
      results:
        "O resultado é um projeto editorial que traduz a versatilidade artística de Elle Fanning em uma identidade visual marcante. A combinação entre fotografia, tipografia e composição cria uma narrativa consistente, explorando diferentes perspectivas de sua trajetória e transformando sua imagem em um universo gráfico próprio.",
    },
    showcase: {
      ...showcaseImages("elle-fanning"),
      client: "THE GRAW",
      year: "2026",
      handle: "/ellefanning",
      logo: ELLE_LOGO_LIGHT,
      description: "A fashion brand for sport life style",
      disciplines: ["WebSite"],
    },
  },
  {
    slug: "tati-hotelzinho-pet",
    name: "Tati Hotelzinho Pet",
    title: "Tati Hotelzinho Pet",
    category: "brand identy",
    services: ["branding"],
    cover: cover("tati-hotelzinho-pet"),
    hero: { src: asset("/images/projects/tati-hotelzinho-pet/hero-dog.webp") },
    // Figma "Projeto" variant "Projeto 3".
    collage: figmaCollage("tati-hotelzinho-pet"),
    credits: credits(
      { label: "Project director", value: DIRECTOR },
      "Tati Sousa",
      { label: "Motion Designer", value: "Julio Victor" },
      "2023",
    ),
    copy: {
      intro:
        "A Tati Hotelzinho Pet nasce com a proposta de transformar o cuidado com os animais em uma experiência acolhedora, divertida e cheia de personalidade. O projeto busca traduzir o carinho e a atenção dedicados aos pets por meio de uma identidade visual alegre, descontraída e facilmente reconhecível, aproximando a marca de tutores e seus companheiros.",
      solution:
        "A solução foi desenvolver uma identidade visual vibrante, construída a partir de cores intensas, formas orgânicas e um mascote que representa o universo dos animais de estimação. A combinação entre roxo, rosa e amarelo cria uma comunicação energética e amigável, enquanto o logotipo e os elementos gráficos garantem versatilidade em diferentes aplicações da marca.",
      process:
        "O processo criativo começou pela construção de um conceito visual que transmitisse diversão, confiança e acolhimento. A partir dele, foram desenvolvidos o logotipo, a paleta cromática, os elementos gráficos e suas aplicações em materiais institucionais, uniformes, embalagens, acessórios, comunicação digital e publicidade. Cada peça foi pensada para manter a identidade consistente e presente em diferentes pontos de contato.",
      results:
        "O resultado é uma marca expressiva e cheia de personalidade, que transforma o universo pet em uma experiência visual divertida e memorável. A identidade se adapta a diferentes produtos, ambientes e plataformas, fortalecendo o reconhecimento da Tati Hotelzinho Pet e transmitindo seus valores de carinho, cuidado e proximidade.",
    },
    // The Figma closing frames touch; two rows hold a pair of photos each.
    gallery: {
      lead: [TATI_WIDE("logo-patterns")],
      split: image(
        "tati-hotelzinho-pet",
        "logo",
        FIGMA_SPLIT.width,
        FIGMA_SPLIT.height,
      ),
      middle: [
        { row: [TATI_HALF("ribbon"), TATI_HALF("tape")] },
        [TATI_WIDE("versions")],
        [TATI_WIDE("tshirt")],
      ],
      closing: [
        TATI_WIDE("backpack"),
        TATI_WIDE("laptop"),
        { row: [TATI_HALF("dogs"), TATI_HALF("cape")] },
      ],
      closingJoined: true,
      final: image("tati-hotelzinho-pet", "poster", 1900, 1049),
    },
  },
  {
    // Home slide "projeto"; its Figma page (3309:5006) is still a placeholder.
    slug: "gilberto-do-acordeon",
    // Taken off the site for now at the user's request.
    hidden: true,
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
      client: "Gilberto do acordeon",
      year: "2026",
      handle: "/gilbertodoacordeon",
      logo: GILBERTO_LOGO_LIGHT,
      description: "A singer and accordion player from the south",
      disciplines: VISUAL_IDENTITY,
    },
  },
];

export const SHOWCASE_LABELS = {
  client: "Client",
  year: "year",
  explore: "Explore project",
} as const;

/** The cases on the site: every project but the hidden ones. */
export const PROJECTS = ALL_PROJECTS.filter((project) => !project.hidden);

export function getProjectHref(project: Pick<Project, "slug">) {
  return `/cases/${project.slug}`;
}

export function findProject(slug: string) {
  return PROJECTS.find((project) => project.slug === slug);
}
