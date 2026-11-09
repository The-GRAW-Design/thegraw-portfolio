import Image from "next/image";
import type { CollageSlot } from "@/features/cases/types";
import { cn } from "@/utils/cn";

/** Size of the Figma "Projeto" collage, the base of every rectangle. */
export const COLLAGE_SIZE = { width: 1276, height: 655 } as const;

/** Position and size of a collage rectangle, as % of the collage. */
export function collageBoxStyle({ rect }: CollageSlot) {
  return {
    left: `${(rect.x / COLLAGE_SIZE.width) * 100}%`,
    top: `${(rect.y / COLLAGE_SIZE.height) * 100}%`,
    width: `${(rect.width / COLLAGE_SIZE.width) * 100}%`,
    height: `${(rect.height / COLLAGE_SIZE.height) * 100}%`,
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
