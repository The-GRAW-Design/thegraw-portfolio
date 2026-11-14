"use client";

import Image from "next/image";
import { useRef } from "react";
import { EASE, gsap, useGSAP } from "@/lib/gsap";
import { cn } from "@/utils/cn";

type ParallaxImageProps = {
  src: string;
  alt: string;
  /** Classes for the clipping wrapper (defaults to filling its parent). */
  className?: string;
  /** Classes for the image, e.g. a Figma crop via `object-[x_y]`. */
  imageClassName?: string;
  sizes?: string;
  priority?: boolean;
  /** Travel in percent of the image height. */
  amount?: number;
  /**
   * Entrance: the image starts zoomed in and settles into its frame, on load
   * or once it scrolls into view.
   */
  settle?: "load" | "scroll";
};

/** Zoom the image settles from, and how long it takes. */
const SETTLE_SCALE = 1.2;
const SETTLE_DURATION = 1.8;

/** Cover image that drifts against the scroll. */
export function ParallaxImage({
  src,
  alt,
  className,
  imageClassName,
  sizes = "100vw",
  priority = false,
  amount = 5,
  settle,
}: ParallaxImageProps) {
  const wrapperRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const media = gsap.matchMedia();
      media.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.fromTo(
          "img",
          { yPercent: -amount, scale: 1 + (amount * 2.5) / 100 },
          {
            yPercent: amount,
            ease: "none",
            scrollTrigger: {
              trigger: wrapperRef.current,
              start: "top bottom",
              end: "bottom top",
              scrub: true,
            },
          },
        );
        if (!settle) return;
        // On its own layer, so it adds to the parallax instead of fighting it.
        gsap.from("[data-parallax-settle]", {
          scale: SETTLE_SCALE,
          duration: SETTLE_DURATION,
          ease: EASE.expo,
          scrollTrigger:
            settle === "scroll"
              ? { trigger: wrapperRef.current, start: "top 90%", once: true }
              : undefined,
        });
      });
      return () => media.revert();
    },
    { scope: wrapperRef },
  );

  return (
    <div
      ref={wrapperRef}
      className={cn("absolute inset-0 overflow-hidden", className)}
    >
      <div
        data-parallax-settle
        className={cn("absolute inset-0", settle && "will-change-transform")}
      >
        <Image
          src={src}
          alt={alt}
          fill
          sizes={sizes}
          priority={priority}
          className={cn("object-cover will-change-transform", imageClassName)}
        />
      </div>
    </div>
  );
}
