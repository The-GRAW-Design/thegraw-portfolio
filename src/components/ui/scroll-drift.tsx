"use client";

import { useRef, type ReactNode } from "react";
import { gsap, useGSAP } from "@/lib/gsap";
import { cn } from "@/utils/cn";

type ScrollDriftProps = {
  children: ReactNode;
  className?: string;
  /** Travel while the scope scrolls away, in viewport heights (negative: up). */
  amount?: number;
  /** Closest ancestor whose scroll drives the travel. */
  scope?: string;
};

/**
 * Content that drifts against the scroll while its section leaves the
 * viewport, so it reads as a layer in front of what is behind it.
 */
export function ScrollDrift({
  children,
  className,
  amount = -0.2,
  scope = "section",
}: ScrollDriftProps) {
  const ref = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const content = ref.current;
      const trigger = content?.closest(scope);
      if (!content || !trigger) return;

      const media = gsap.matchMedia();
      media.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.to(content, {
          y: () => window.innerHeight * amount,
          ease: "none",
          scrollTrigger: {
            trigger,
            start: "top top",
            end: "bottom top",
            scrub: true,
            invalidateOnRefresh: true,
          },
        });
      });
      return () => media.revert();
    },
    { scope: ref },
  );

  return (
    <div ref={ref} className={cn("will-change-transform", className)}>
      {children}
    </div>
  );
}
