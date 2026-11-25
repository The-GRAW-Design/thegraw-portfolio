/**
 * Where the sword lies on screen: the center of its box and its length in
 * viewport px, and its angle (0: tip to the left, hilt to the right;
 * π/2: tip down, hilt up).
 */
export type SwordPose = {
  x: number;
  y: number;
  length: number;
  angle: number;
};

/** The two places the sword rests in, as `data-sword-slot` values. */
export type SwordSlotName = "hero" | "projects";

/** How a slot holds the sword, below and from the `lg` breakpoint. */
export type SwordRest = "flat" | "upright";

/**
 * State of the home sword, on `[data-hero-stack]` as `data-sword`:
 * - `live`: the 3D sword is on screen (the slot images stay hidden);
 * - `static`: no WebGL or reduced motion, the slots show the Figma image.
 */
export type SwordMode = "live" | "static";
