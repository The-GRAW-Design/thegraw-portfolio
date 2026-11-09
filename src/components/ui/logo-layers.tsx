import Image from "next/image";
import type { CSSProperties } from "react";
import type { LogoArt } from "@/types/project";
import { cn } from "@/utils/cn";

type LogoLayersProps = {
  logo: LogoArt;
  /** Accessible name; without it the logo is decorative. */
  alt?: string;
  className?: string;
  style?: CSSProperties;
};

/** A logo rebuilt from its Figma SVG layers, each at its own inset. */
export function LogoLayers({ logo, alt, className, style }: LogoLayersProps) {
  return (
    <div
      role={alt ? "img" : undefined}
      aria-label={alt}
      aria-hidden={alt ? undefined : true}
      className={cn("relative", className)}
      style={{ aspectRatio: `${logo.width} / ${logo.height}`, ...style }}
    >
      {logo.layers.map((layer) => (
        <div
          key={layer.src}
          className="absolute"
          style={{ inset: layer.inset }}
        >
          <Image src={layer.src} alt="" fill sizes="40vw" />
        </div>
      ))}
    </div>
  );
}
