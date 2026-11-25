import type { DitherFrame, DitherImageProps } from "@/features/dither-image";
import { asset } from "@/utils/asset";

type DitherPreset = Omit<DitherImageProps, "alt" | "animation" | "className">;

/** Plain cover of the container, used on small screens. */
const COVER_FRAME: DitherFrame = { x: 0, y: 0, width: 1, height: 1 };

/** The desktop hero runs 30% past the first screen (`lg:h-[130svh]`). */
const HERO_SCREENS = 1.3;

/** Figma "Desktop - 1" image rectangle (the knight of the first site). */
const KNIGHT_FRAME: DitherFrame = {
  x: -0.02083,
  y: -0.20154,
  width: 1.18438,
  height: 1.91604,
};

/**
 * Figma "Desktop - 2" (site 2.0): the knight with the banner, 2500×2276 at
 * (-153, -424) in the 1920×1080 frame; phones: 401×852 at (-6, 0) in the
 * 393×852 frame.
 */
const HERO_FRAME: DitherFrame = {
  x: -0.07969,
  y: -0.39259,
  width: 1.30208,
  height: 2.10741,
};

/**
 * Figma "Desktop - 2" effects: gradient map white → blood → char, then Dither
 * (Bayer 16x16, 7 levels, brightness 82%, pixel 1).
 */
export const HERO_DITHER: DitherPreset = {
  src: asset("/images/home/hero-banner.webp"),
  palette: [
    { token: "white", position: 0 },
    { token: "blood", position: 0.5 },
    { token: "char", position: 1 },
  ],
  pixelSize: 1,
  quantize: "ordered",
  levels: 7,
  brightness: 82,
  // Kept on the first screen: the image already runs past it, into the extra 30%.
  frame: {
    ...HERO_FRAME,
    y: HERO_FRAME.y / HERO_SCREENS,
    height: HERO_FRAME.height / HERO_SCREENS,
  },
  mobileFrame: { x: -0.01527, y: 0, width: 1.02036, height: 1 },
};

/** 404: the first site's knight, rendered like its footer, on a single screen. */
export const NOT_FOUND_DITHER: DitherPreset = {
  src: asset("/images/home/hero-knight.webp"),
  palette: [
    { token: "white", position: 0 },
    { token: "red-graw", position: 0.5 },
    { token: "red-graw-deep", position: 1 },
  ],
  pixelSize: 3.75,
  scatter: 0.3,
  quantize: "posterize",
  levels: 16,
  frame: KNIGHT_FRAME,
  mobileFrame: COVER_FRAME,
};

/** Figma "Footer": image at 29% over RED GRAW, offset −15%, scatter 50%, then Pixelate (2px, 16 levels). */
export const FOOTER_DITHER: DitherPreset = {
  src: asset("/images/shared/footer-figure.webp"),
  palette: [
    { token: "white", position: 0 },
    { token: "red-graw", position: 0.5 },
    { token: "black", position: 1 },
  ],
  // Visible pixels: 3px cells (Figma pixelates at 2px).
  pixelSize: 3.75,
  opacity: 0.29,
  offset: -0.15,
  scatter: 0.5,
  quantize: "posterize",
  levels: 16,
  // Image rectangle 1920×3227 at (0, -297) in the 1920×937 frame.
  frame: { x: 0, y: -0.31697, width: 1, height: 3.44397 },
  mobileFrame: COVER_FRAME,
};

/**
 * Figma "all projects" footer: the same figure at 6% over BLACK GRAW, mapped
 * white → #d1d1d1 → black, offset −15%, scatter 50%, then Pixelate.
 */
export const FOOTER_DARK_DITHER: DitherPreset = {
  ...FOOTER_DITHER,
  palette: [
    { token: "white", position: 0 },
    { token: "mist", position: 0.5 },
    { token: "black", position: 1 },
  ],
  opacity: 0.06,
  // Image rectangle 1920×3227 at (0, -297) in the 1920×608 frame.
  frame: { x: 0, y: -0.48849, width: 1, height: 5.30757 },
};

/**
 * Figma home "Projetos" (1920×617, phones 393×412): image mapped white →
 * #dfdfdf → #fefefe, offset −15%, scatter 50%, a light grain behind the title.
 */
export const PROJECTS_INTRO_DITHER: DitherPreset = {
  src: asset("/images/home/case-studies-texture.webp"),
  palette: [
    { token: "white", position: 0 },
    { token: "fog", position: 0.5 },
    { token: "snow", position: 1 },
  ],
  pixelSize: 1,
  offset: -0.15,
  scatter: 0.5,
  quantize: "none",
  frame: { x: -0.1262, y: -1.6694, width: 1.2523, height: 5.2269 },
  // 438×851 at (-29, 0) in the 393×412 phone frame.
  mobileFrame: { x: -0.07379, y: 0, width: 1.1145, height: 2.06553 },
};

/** Figma "Studio" hero: image at 14% over BLACK GRAW, offset −15%, scatter 50%. */
export const STUDIO_DITHER: DitherPreset = {
  src: asset("/images/studio/hero-texture.webp"),
  palette: [
    { token: "black", position: 0 },
    { token: "silver", position: 0.5 },
    { token: "black", position: 1 },
  ],
  pixelSize: 1,
  opacity: 0.14,
  offset: -0.15,
  scatter: 0.5,
  quantize: "none",
  frame: { x: -0.0576, y: -0.4935, width: 1.1152, height: 2.9861 },
  mobileFrame: COVER_FRAME,
};

/**
 * Figma "Cases - all view" panel: the same texture at 14% over paper, masked
 * to the 1920×620 panel at the bottom of the 1080 frame.
 */
export const CASES_DRAWER_DITHER: DitherPreset = {
  ...STUDIO_DITHER,
  frame: { x: -0.0576, y: -1.6016, width: 1.1152, height: 5.2016 },
};

/**
 * Figma "Project Open" closing block (1920×1039.658): the studio texture at
 * 14% over BLACK GRAW behind the credits and the cases track.
 */
export const PROJECT_END_DITHER: DitherPreset = {
  ...STUDIO_DITHER,
  frame: { x: -0.2221, y: -0.9883, width: 1.4441, height: 4.0169 },
};
