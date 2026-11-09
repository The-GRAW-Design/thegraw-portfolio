import { asset } from "@/utils/asset";

/** Figma placeholder copy, kept as written in the design. */
export const LOREM_LONG =
  "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since 1966, when designers at Letraset and James Mosley, the librarian at St Bride Printing Library in London, took a 1914 Cicero translation and scrambled it to make dummy text for Letraset's Body Type sheets. It has survived not only many decades, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised thanks to these sheets and more recently with desktop publishing software like Aldus PageMaker and Microsoft Word including versions of Lorem Ipsum.";

export const HOME_PAGE = {
  caseStudies: {
    title: ["case", "studies"],
    body: "A closer look at how strategy, design, and development shape each project.",
  },
  /** The four "Projeto Allce" slides of the Figma home, in order. */
  showcases: ["allce", "grupo-penguin", "conexao-duo", "gilberto-do-acordeon"],
  viewAllCases: "View All Cases",
  viewAllImage: asset("/images/home/view-all-band.webp"),
} as const;

export const NOT_FOUND_PAGE = {
  title: "Page not found",
  code: "error 404",
  back: "back to home",
} as const;

export const PROJECT_PAGE = {
  viewAll: "view all",
  solution: "Solution",
  process: "process",
  results: "results",
  resultsBody:
    "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since 1966, when designers at Letraset and James Mosley, the librarian at St Bride Printing Library in London, took a 1914 Cicero translation and scrambled it to make dummy text for Letraset's Body Type sheets. It has survived not only many",
  end: "END",
} as const;

const TEAM_BIO =
  "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since 1966, when";

/**
 * Figma team frames (André, Alan, Erick, Tatá): one portrait placeholder,
 * each with its own headline, sized to fill the frame width and placed as a
 * share of its 1080px height.
 */
export const TEAM_MEMBERS = [
  {
    name: "André Gonçalves",
    role: "CREATIVE DIRECTOR",
    bio: TEAM_BIO,
    roleClassName: "text-role-director lg:top-[72.34%] lg:left-51",
  },
  {
    name: "Alan Erick",
    role: "MOTION DESIGNER",
    bio: TEAM_BIO,
    roleClassName: "text-role-motion lg:top-[71.61%] lg:left-51",
  },
  {
    name: "Eric Elias",
    role: "DEVELOPER",
    bio: TEAM_BIO,
    roleClassName: "text-giant lg:top-[71.13%] lg:left-640",
  },
  {
    name: "Tatá Gomes",
    role: "PROJECT MANAGER",
    bio: TEAM_BIO,
    roleClassName: "text-role-manager lg:top-[72.39%] lg:left-51",
  },
] as const;

export const STUDIO_PAGE = {
  title: "Studio",
  projectsLead: "Projects Lead",
  portrait: asset("/images/studio/portrait.webp"),
  projectsLeadImage: asset("/images/studio/projects-lead.webp"),
  /** Shown one at a time while scrolling, each with its Figma photo. */
  sections: [
    {
      heading: "Purpose",
      image: asset("/images/studio/purpose.webp"),
      body: [
        "We move brands forward through clear thinking, distinctive design, and digital experiences built with purpose.",
      ],
    },
    {
      heading: "Pillars",
      image: asset("/images/studio/pillars.webp"),
      body: [
        "Clarity — We turn complex ideas into clear, focused experiences.",
        "Identity — We create distinctive visual languages that make each brand recognizable.",
        "Craft — We bring strategy, design, and development together with care.",
      ],
    },
    {
      heading: "Foundations",
      image: asset("/images/studio/foundations.webp"),
      body: [
        "Good work starts with listening. We ask the right questions, understand the challenge, and make deliberate decisions at every step — from the first idea to the final detail.",
      ],
    },
  ],
  videoCover: asset("/images/studio/video-cover.webp"),
  play: "play",
} as const;
