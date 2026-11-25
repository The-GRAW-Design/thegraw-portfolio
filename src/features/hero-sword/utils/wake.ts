import type { DitherDisturbance } from "@/features/dither-image";

/**
 * The sword's push on the hero dither: the blade from tip to pommel, in
 * viewport px, written by the sword scene every frame and read by the hero
 * dither render loop.
 */
export const SWORD_WAKE: DitherDisturbance = {
  a: { x: 0, y: 0 },
  b: { x: 0, y: 0 },
  strength: 0,
  ring: 0,
  ringStrength: 0,
};

export function resetSwordWake() {
  SWORD_WAKE.strength = 0;
  SWORD_WAKE.ring = 0;
  SWORD_WAKE.ringStrength = 0;
}
