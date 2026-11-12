"use client";

import { SplitText } from "@/components/ui/react-bits/split-text";
import { EASE } from "@/lib/gsap";
import { MASK_ROOM } from "@/utils/mask-room";

type SplitRevealProps = {
  as?: "h1" | "h2" | "h3" | "p" | "span";
  children: string;
  /** Unit that slides up from under its mask. */
  split?: "chars" | "words" | "lines";
  /** Play on mount or when the element scrolls into view. */
  trigger?: "load" | "scroll";
  /** Seconds before the first unit moves. */
  delay?: number;
  className?: string;
};

/** Milliseconds between units. */
const STAGGER = { chars: 25, words: 60, lines: 100 } as const;

/**
 * Text revealed by chars, words or lines rising from under their masks
 * (React Bits SplitText). The masks keep room around the glyphs, so tight
 * line heights and negative tracking are not cut.
 */
export function SplitReveal({
  as = "p",
  children,
  split = "words",
  trigger = "scroll",
  delay = 0,
  className,
}: SplitRevealProps) {
  return (
    <SplitText
      tag={as}
      text={children}
      splitType={split}
      mask
      maskStyle={MASK_ROOM}
      from={{ yPercent: 110 }}
      to={{ yPercent: 0, delay }}
      ease={EASE.expo}
      duration={split === "chars" ? 1.1 : 1}
      delay={STAGGER[split]}
      trigger={trigger === "load" ? "load" : "view"}
      threshold={0.12}
      rootMargin="0px"
      className={className}
    />
  );
}
