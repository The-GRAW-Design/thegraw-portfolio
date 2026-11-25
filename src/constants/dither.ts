import type { DitherFrame, DitherImageProps } from "@/features/dither-image";
import { asset } from "@/utils/asset";

type DitherPreset = Omit<DitherImageProps, "alt" | "animation" | "className">;

/** Plain cover of the container, used on small screens. */
const COVER_FRAME: DitherFrame = { x: 0, y: 0, width: 1, height: 1 };

/** The desktop hero runs 30% past the first screen (`lg:h-[130svh]`). */
const HERO_SCREENS = 1.3;

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
 * Figma "Desktop - 2" gradient map (white → blood → char), rendered like the
 * first hero at the user's request: grain and visible 3px pixels, which the
 * wind moves (the Figma Dither at pixel 1 is too fine to show it).
 */
export const HERO_DITHER: DitherPreset = {
  src: asset("/images/home/hero-banner.webp"),
  palette: [
    { token: "white", position: 0 },
    { token: "blood", position: 0.5 },
    { token: "char", position: 1 },
  ],
  pixelSize: 3.75,
  scatter: 0.3,
  quantize: "posterize",
  levels: 16,
  // The Figma Dither brightness, which sets the tone.
  brightness: 82,
  // Kept on the first screen: the image already runs past it, into the extra 30%.
  frame: {
    ...HERO_FRAME,
    y: HERO_FRAME.y / HERO_SCREENS,
    height: HERO_FRAME.height / HERO_SCREENS,
  },
  mobileFrame: { x: -0.01527, y: 0, width: 1.02036, height: 1 },
};

/** 404: the home hero on a single screen (the image keeps its Figma frame). */
export const NOT_FOUND_DITHER: DitherPreset = {
  ...HERO_DITHER,
  frame: HERO_FRAME,
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

/**
 * Figma home "Frame 81" (1920×788, phones 393×852): the "Projetos" grain on
 * another photo, 2336×1314 at (-208, -220); phones 1526×858 at (-594, 0).
 */
export const CONTACT_DITHER: DitherPreset = {
  ...PROJECTS_INTRO_DITHER,
  src: asset("/images/home/contact-texture.webp"),
  frame: { x: -0.10833, y: -0.27919, width: 1.21667, height: 1.66751 },
  mobileFrame: { x: -1.5125, y: 0, width: 3.88295, height: 1.00704 },
};

/**
 * Site 2.0 footer (Figma home "Footer", 1920×608; phones 393×612): the dark
 * footer grain, the figure 509×856 at (-55, -4) on phones.
 */
export const FOOTER_GRAW_DITHER: DitherPreset = {
  ...FOOTER_DARK_DITHER,
  mobileFrame: { x: -0.13995, y: -0.00654, width: 1.29517, height: 1.39869 },
};

/**
 * Figma "Studio" team frames: image at 14% over BLACK GRAW, offset −15%,
 * scatter 50%, in a 1920×1080 box from the top (phones: the 393×102 band
 * under the photo).
 */
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
 * Site 2.0 studio panels (Figma "Frame 35052/35053/35054", 1920×1069; phones
 * 393×852 side by side, each image in a 396px box at x −2): gradient maps
 * with Figma's own scatter per frame, no pixelation.
 */
const STUDIO_PANEL_MOBILE: DitherFrame = {
  x: -0.00509,
  y: 0,
  width: 1.00763,
  height: 0.99883,
};

/** Propósito: the serpent mapped #151515 → #0d0d0d (56.25%) → RED GRAW. */
export const STUDIO_PURPOSE_DITHER: DitherPreset = {
  src: asset("/images/studio/purpose.webp"),
  palette: [
    { token: "soot", position: 0 },
    { token: "night", position: 0.5625 },
    { token: "red-graw", position: 1 },
  ],
  pixelSize: 1,
  offset: -0.15,
  scatter: 0.187,
  mobileScatter: 0.053,
  quantize: "none",
  frame: COVER_FRAME,
  // 396×976 on phones: taller than the panel.
  mobileFrame: { ...STUDIO_PANEL_MOBILE, height: 1.14554 },
};

/** Pilares: the crows mapped #151515 → RED GRAW (56.25%) → #1f1f1f. */
export const STUDIO_PILLARS_DITHER: DitherPreset = {
  src: asset("/images/studio/pillars.webp"),
  palette: [
    { token: "soot", position: 0 },
    { token: "red-graw", position: 0.5625 },
    { token: "pitch", position: 1 },
  ],
  pixelSize: 1,
  offset: -0.15,
  scatter: 0.382,
  mobileScatter: 0.174,
  quantize: "none",
  frame: COVER_FRAME,
  mobileFrame: STUDIO_PANEL_MOBILE,
};

/** Fundamentos: the rider mapped #060606 → #2c2c2c → #999999, no offset. */
export const STUDIO_FOUNDATIONS_DITHER: DitherPreset = {
  src: asset("/images/studio/foundations.webp"),
  palette: [
    { token: "abyss", position: 0 },
    { token: "slate", position: 0.5 },
    { token: "stone", position: 1 },
  ],
  pixelSize: 1,
  scatter: 0.3,
  mobileScatter: 0.079,
  quantize: "none",
  // 2954×1378 at (-803.5, -250) in the 1920×1069 frame.
  frame: { x: -0.4185, y: -0.234, width: 1.5385, height: 1.2894 },
  mobileFrame: STUDIO_PANEL_MOBILE,
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
 * Site 2.0 "Project Open" closing band (1920×1151 under the gallery; phones
 * 393×326.356): the studio texture at 14% over BLACK GRAW (the page stays
 * dark, as in the first version, at the user's request), behind the
 * credits and the cases track.
 */
export const PROJECT_END_DITHER: DitherPreset = {
  ...STUDIO_DITHER,
  frame: { x: -0.37323, y: -0.85491, width: 1.77958, height: 4.47116 },
  mobileFrame: { x: -0.39822, y: -0.61375, width: 1.84654, height: 3.34914 },
};
