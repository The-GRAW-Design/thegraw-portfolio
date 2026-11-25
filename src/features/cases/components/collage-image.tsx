import Image from "next/image";
import type { CollageSlot } from "@/features/cases/types";
import { cn } from "@/utils/cn";

/** Size of the Figma "Projeto" collage, the base of every rectangle. */
export const COLLAGE_SIZE = { width: 1276, height: 655 } as const;

/** Size of the phone collage of the home (Figma "Mobile - home"). */
export const COLLAGE_SIZE_MOBILE = { width: 354, height: 460 } as const;

/** Position and size of a collage rectangle, as % of the collage. */
export function collageBoxStyle(
  { rect }: CollageSlot,
  size: { width: number; height: number } = COLLAGE_SIZE,
) {
  return {
    left: `${(rect.x / size.width) * 100}%`,
    top: `${(rect.y / size.height) * 100}%`,
    width: `${(rect.width / size.width) * 100}%`,
    height: `${(rect.height / size.height) * 100}%`,
  };
}

type CollageImageProps = {
  src: string;
  alt?: string;
  priority?: boolean;
  sizes?: string;
  className?: string;
};

/** A collage image covering its box. */
export function CollageImage({
  src,
  alt = "",
  priority,
  sizes = "(min-width: 1024px) 50vw, 70vw",
  className,
}: CollageImageProps) {
  return (
    <Image
      src={src}
      alt={alt}
      priority={priority}
      fill
      sizes={sizes}
      draggable={false}
      className={cn("object-cover select-none", className)}
    />
  );
}
