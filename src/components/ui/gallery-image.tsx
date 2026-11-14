import { LogoLayers } from "@/components/ui/logo-layers";
import { ParallaxImage } from "@/components/ui/parallax-image";
import { Reveal } from "@/components/ui/reveal";
import type { ProjectLogo, ProjectMedia } from "@/types/project";
import { cn } from "@/utils/cn";

type GalleryImageProps = {
  media: ProjectMedia;
  sizes?: string;
  /** Classes of the frame around the box (its Figma padding). */
  className?: string;
};

/** A logo centered on its panel, drawn from its Figma layers. */
function LogoPanel({ logo, box }: { logo: ProjectLogo; box: ProjectMedia }) {
  return (
    <div
      className={cn(
        "absolute inset-0 flex items-center justify-center",
        logo.panelClassName,
      )}
    >
      <LogoLayers
        logo={logo}
        style={{ width: `${(logo.width / box.width) * 100}%` }}
      />
    </div>
  );
}

/**
 * Project gallery box: an image that settles from a zoom as it is unveiled
 * and drifts against the scroll, or a logo panel.
 */
export function GalleryImage({
  media,
  sizes = "(min-width: 1024px) 80vw, 100vw",
  className,
}: GalleryImageProps) {
  return (
    <Reveal wipe="up" className={cn("p-10 lg:p-11", className)}>
      <div
        className="relative w-full overflow-hidden bg-coal"
        style={{ aspectRatio: `${media.width} / ${media.height}` }}
      >
        {media.logo ? (
          <LogoPanel logo={media.logo} box={media} />
        ) : (
          <ParallaxImage src={media.src} alt="" sizes={sizes} settle="scroll" />
        )}
      </div>
    </Reveal>
  );
}
