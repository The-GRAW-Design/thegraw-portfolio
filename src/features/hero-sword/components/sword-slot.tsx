import Image from "next/image";
import type { SwordRest, SwordSlotName } from "@/features/hero-sword/types";
import { asset } from "@/utils/asset";
import { cn } from "@/utils/cn";

/** The Figma sword image, cropped to the sword: pommel at the top. */
export const SWORD_IMAGE = {
  src: asset("/images/home/sword.webp"),
  width: 545,
  height: 3040,
} as const;

const CENTERED =
  "absolute top-1/2 left-1/2 max-w-none -translate-x-1/2 -translate-y-1/2";
const REST = {
  upright: "h-[100cqh] w-[100cqw] rotate-0",
  flat: "h-[100cqw] w-[100cqh] rotate-90",
} as const;
const REST_LG = {
  upright: "lg:h-[100cqh] lg:w-[100cqw] lg:rotate-0",
  flat: "lg:h-[100cqw] lg:w-[100cqh] lg:rotate-90",
} as const;

type SwordSlotProps = {
  name: SwordSlotName;
  /** How the sword lies: upright (hilt up) or flat (hilt to the right). */
  rest: { base: SwordRest; lg: SwordRest };
  /** Position and size: the box around the sword, as in the Figma frame. */
  className?: string;
};

/**
 * A place where the home sword rests. The 3D sword fits itself to this box;
 * without WebGL or with reduced motion the box shows the Figma image instead.
 */
export function SwordSlot({ name, rest, className }: SwordSlotProps) {
  return (
    <div
      aria-hidden
      data-sword-slot={name}
      className={cn("[container-type:size] pointer-events-none", className)}
    >
      <Image
        src={SWORD_IMAGE.src}
        alt=""
        width={SWORD_IMAGE.width}
        height={SWORD_IMAGE.height}
        className={cn(
          CENTERED,
          REST[rest.base],
          REST_LG[rest.lg],
          "invisible in-data-[sword=static]:visible",
        )}
      />
    </div>
  );
}
