import { ParallaxImage } from "@/components/ui/parallax-image";
import { COMING_SOON_IMAGE } from "@/constants/projects";
import { cn } from "@/utils/cn";

export const COMING_SOON_LABEL = "{EM BREVE}";

type ComingSoonProps = {
  /** Image seen through the blur (the Figma "Delete This" one by default). */
  image?: string;
  /**
   * `box`: scales with its box like the 886px Figma card (cards, collage);
   * `page`: keeps the Figma size of the page (project page block).
   */
  scale?: "box" | "page";
  sizes?: string;
  className?: string;
};

/**
 * Figma "{EM BREVE}" (3164:889): the label over its image blurred into a
 * frosted glass, for what has no content yet. Fills its positioned parent.
 */
export function ComingSoon({
  image = COMING_SOON_IMAGE,
  scale = "box",
  sizes = "40vw",
  className,
}: ComingSoonProps) {
  return (
    <div
      className={cn(
        "absolute inset-0 overflow-hidden bg-white",
        scale === "box" && "@container",
        className,
      )}
    >
      <div
        className={cn(
          "absolute inset-0",
          scale === "box" && "[--fluid:calc(100cqw/886)]",
        )}
      >
        {/* Figma: the image overflows the card by ~10% so the blur keeps its edges. */}
        <div className="absolute -top-[10.38%] -left-[10.38%] h-[120.75%] w-[120.77%] blur-soon">
          <ParallaxImage src={image} alt="" sizes={sizes} amount={3} />
        </div>
        <p className="relative flex h-full items-center justify-center text-soon font-medium whitespace-nowrap text-white">
          {COMING_SOON_LABEL}
        </p>
      </div>
    </div>
  );
}
