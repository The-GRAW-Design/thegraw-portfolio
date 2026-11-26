"use client";

import { SplitText } from "@/components/ui/react-bits/split-text";
import { EASE } from "@/lib/gsap";
import { LINE_MASK_ROOM, MASK_ROOM } from "@/utils/mask-room";

type SplitRevealProps = {
  as?: "h1" | "h2" | "h3" | "p" | "span";
  children: string;
  /** Unit that slides up from under its mask. */
  split?: "chars" | "words" | "lines";
  /** Play on mount or when the element scrolls into view. */
  trigger?: "load" | "scroll";
  /**
   * Play once the page has scrolled this many px instead (wherever the text
   * is), never forced to its end by a fast scroll.
   */
  revealAt?: number;
  /** Seconds before the first unit moves. */
  delay?: number;
  className?: string;
};

/** Milliseconds between units. */
const STAGGER = { chars: 25, words: 60, lines: 100 } as const;
/** Letters tip into place as they rise; words and lines rise straight. */
const TILT = { chars: 7, words: 0, lines: 0 } as const;
/**
 * Start offset, in % of the unit height: low enough that accents and other
 * marks above the letters stay below the mask (and its room for glyphs)
 * until the unit rises, even with tight line heights.
 */
const START = 200;

/**
 * Text revealed by chars, words or lines rising from under their masks
 * (React Bits SplitText), the letters tipping upright on the way. The masks keep room around the glyphs, so tight
 * line heights and negative tracking are not cut.
 */
export function SplitReveal({
  as = "p",
  children,
  split = "words",
  trigger = "scroll",
  revealAt,
  delay = 0,
  className,
}: SplitRevealProps) {
  return (
    <SplitText
      tag={as}
      text={children}
      splitType={split}
      mask
      maskStyle={split === "lines" ? LINE_MASK_ROOM : MASK_ROOM}
      from={{
        yPercent: START,
        rotation: TILT[split],
        transformOrigin: "0% 100%",
      }}
      to={{ yPercent: 0, rotation: 0, delay }}
      ease={EASE.expo}
      duration={split === "chars" ? 1.1 : 1}
      delay={STAGGER[split]}
      trigger={trigger === "load" && revealAt === undefined ? "load" : "view"}
      scrollTrigger={
        revealAt === undefined
          ? undefined
          : { start: revealAt, end: "max", fastScrollEnd: false }
      }
      threshold={0.12}
      rootMargin="0px"
      className={className}
    />
  );
}
