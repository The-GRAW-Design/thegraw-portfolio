"use client";

import type { ReactNode } from "react";
import {
  AnimatedContent,
  type AnimatedContentWipe,
} from "@/components/ui/react-bits/animated-content";
import { DURATION, EASE } from "@/lib/gsap";

type RevealProps = {
  children: ReactNode;
  className?: string;
  /** Delay between `[data-reveal]` children. */
  stagger?: number;
  /** Horizontal instead of vertical entrance. */
  axis?: "x" | "y";
  /** Soft mask that uncovers the block as it rises (images). */
  wipe?: AnimatedContentWipe;
  /** Starting blur in px, sharpening as it comes in. */
  blur?: number;
  /** Seconds before it starts, e.g. to follow a neighbor. */
  delay?: number;
};

/**
 * Fades `[data-reveal]` children (or the block itself) in with an offset
 * when it scrolls into view (React Bits AnimatedContent).
 */
export function Reveal({
  children,
  className,
  stagger = 0.12,
  axis = "y",
  wipe = "none",
  blur = 0,
  delay = 0,
}: RevealProps) {
  return (
    <AnimatedContent
      selector="[data-reveal]"
      direction={axis === "x" ? "horizontal" : "vertical"}
      distance={56}
      duration={DURATION.enterSlow}
      ease={EASE.expo}
      delay={delay}
      stagger={stagger}
      wipe={wipe}
      blur={blur}
      threshold={0.15}
      className={className}
    >
      {children}
    </AnimatedContent>
  );
}
