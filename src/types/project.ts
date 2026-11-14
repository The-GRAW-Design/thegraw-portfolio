/** Studio services, used to filter the cases. */
export type ServiceId = "branding" | "web-design" | "packpaging";

export type Credit = { label: string; value: string };

/** A logo drawn from its Figma SVG layers. */
export type LogoArt = {
  /** Logo box in Figma px. */
  width: number;
  height: number;
  /** Each layer with its Figma inset (% of the logo box: top right bottom left). */
  layers: readonly { src: string; inset: string }[];
};

/** A logo on a colored panel (gallery box). */
export type ProjectLogo = LogoArt & {
  /** Panel color, as a theme background class. */
  panelClassName: string;
};

/** Figma "Projeto Allce" slide details (home and services). */
export type ShowcaseInfo = {
  client: string;
  year: string;
  handle: string;
  logo?: LogoArt;
  description: string;
  disciplines: readonly string[];
};

/** A project's home slide: full-frame background and the device card. */
export type ProjectShowcase = ShowcaseInfo & {
  /** Cropped to the 1920×1080 frame. */
  background: string;
  /** Cropped to the 450.45×605.111 card. */
  card: string;
};

/** A gallery box in Figma px: an image already cropped to it, or a logo panel. */
export type ProjectMedia = {
  width: number;
  height: number;
} & ({ src: string; logo?: never } | { logo: ProjectLogo; src?: never });

/** The Figma "Project Open" gallery, in the order of the page. */
export type ProjectGallery = {
  /** Full-width boxes above the split row. */
  lead: readonly ProjectMedia[];
  /** The box next to "Solution". */
  split: ProjectMedia;
  /** Frames after the split row, each with one or more boxes. */
  middle: readonly (readonly ProjectMedia[])[];
  /** The boxes after "process" and "results". */
  closing: readonly ProjectMedia[];
  /** The full-width image before the credits; `bleed` drops the frame padding. */
  final: ProjectMedia & { bleed?: boolean };
};

/** Case study texts, in the order of the page. */
export type ProjectCopy = {
  intro: string;
  solution: string;
  process: string;
  results: string;
};

/** The cases page collage of a case: main image and the pieces around it. */
export type ProjectCollage = {
  main: string;
  /** Bottom (behind the main), top-left, right and left, as in the Figma. */
  pieces?: readonly [string, string, string, string];
};

export type Project = {
  slug: string;
  /** Short name used on cards and the cases index ("Allce"). */
  name: string;
  /** Headline of the project page. */
  title: string;
  category: string;
  services: readonly ServiceId[];
  /** Card image (all projects, tracks); `null` shows the {EM BREVE} card. */
  cover: string | null;
  /**
   * Project page hero, with its focal point as an `object-[x_y]` class;
   * `null` shows the {EM BREVE} glass there instead.
   */
  hero: { src: string; position?: string } | null;
  /** Cases page collage; `null` shows the {EM BREVE} card there too. */
  collage: ProjectCollage | null;
  /** Credits, in two columns of two. */
  credits: readonly (readonly Credit[])[];
  /** Logo panel shown under the intro of a page without a gallery. */
  logo?: ProjectLogo;
  /** Case study gallery; without one the page shows {EM BREVE}. */
  gallery?: ProjectGallery;
  /** Case study texts; without them the gallery keeps the Figma placeholder. */
  copy?: ProjectCopy;
  /** Home slide (Figma "Projeto Allce" variants). */
  showcase?: ProjectShowcase;
};
