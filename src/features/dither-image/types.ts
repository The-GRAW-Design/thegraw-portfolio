/** A gradient-map stop: a Tailwind color token (without `--color-`) at a 0–1 position. */
export type DitherPaletteStop = {
  token: string;
  position: number;
};

/** Up to four stops, in the same order and proportion as the Figma gradient map. */
export type DitherPalette = readonly DitherPaletteStop[];

/**
 * Where the image rectangle sits relative to the container, as fractions of
 * its width/height (Figma lets the image overflow the frame). The image
 * covers this rectangle like `object-fit: cover`.
 */
export type DitherFrame = {
  x: number;
  y: number;
  width: number;
  height: number;
};

/**
 * - `intro`: forms on load, coarsens as the section scrolls away (hero).
 * - `scroll`: forms when the section enters the viewport (footer).
 * - `none`: a single static render.
 */
export type DitherAnimation = "intro" | "scroll" | "none";

/**
 * Figma effect applied after the gradient map:
 * - `ordered`: "Dither" effect, per-channel Bayer 16x16 quantization.
 * - `posterize`: "Pixelate" effect, flat per-channel quantization.
 * - `none`: gradient map only.
 */
export type DitherQuantize = "ordered" | "posterize" | "none";

/**
 * Something moving over the image that pushes its cells around (the hero
 * sword): a segment in viewport px, written every frame by its owner and read
 * by the render loop. Only the effect's own pixels move, no color is added.
 */
export type DitherDisturbance = {
  /** Segment ends (e.g. the blade tip and the pommel), viewport px. */
  a: { x: number; y: number };
  b: { x: number; y: number };
  /** 0–1: cells near the segment are blown away from it. */
  strength: number;
  /** Shockwave from the segment: its distance (px) and strength (0–1). */
  ring: number;
  ringStrength: number;
};

export type DitherImageProps = {
  src: string;
  palette: DitherPalette;
  /** Accessible description; omit for decorative images. */
  alt?: string;
  /** Size of a cell in CSS pixels. */
  pixelSize?: number;
  /** Opacity of the image layer over the container background. */
  opacity?: number;
  /** Gradient-map offset, as in Figma (−0.15 = −15%). */
  offset?: number;
  /** Random per-cell offset amplitude, as in Figma (0.5 = 50%). */
  scatter?: number;
  /** Scatter below the `lg` breakpoint, when the mobile frame sets its own; defaults to `scatter`. */
  mobileScatter?: number;
  quantize?: DitherQuantize;
  /** Quantization levels per channel (Figma "Levels"). */
  levels?: number;
  /** Figma "Dither" brightness (%, 100 = unchanged) and contrast (1 = unchanged). */
  brightness?: number;
  contrast?: number;
  frame?: DitherFrame;
  /** Frame below the `lg` breakpoint (no Figma mobile frames); defaults to `frame`. */
  mobileFrame?: DitherFrame;
  animation?: DitherAnimation;
  /** Live disturbance of the cells (WebGL only). */
  disturbance?: DitherDisturbance;
  /**
   * `intro` only, for an image that holds still (sticky) while a section
   * slides over it: that section's selector. The grain coarsens while it
   * rises over the image, and the image stops drawing once it has gone by.
   */
  coveredBy?: string;
  className?: string;
};

export type RGB = readonly [number, number, number];

export type ResolvedPalette = {
  colors: RGB[];
  positions: number[];
};
