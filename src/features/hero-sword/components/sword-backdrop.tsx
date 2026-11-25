"use client";

import { DitherImage, type DitherImageProps } from "@/features/dither-image";
import { SWORD_WAKE } from "@/features/hero-sword/utils/wake";

type SwordBackdropProps = Omit<DitherImageProps, "disturbance">;

/** A dither image whose cells the home sword pushes around as it moves. */
export function SwordBackdrop(props: SwordBackdropProps) {
  return <DitherImage {...props} disturbance={SWORD_WAKE} />;
}
