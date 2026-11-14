"use client";

import { Shuffle } from "@/components/ui/react-bits/shuffle";
import { EASE } from "@/lib/gsap";

type ShuffleTextProps = {
  children: string;
  className?: string;
};

/**
 * Link and button label whose letters roll up one after the other, in a
 * wave, on hover or keyboard focus of its link or button (React Bits
 * Shuffle). At rest it is plain text: no shuffle as it scrolls into view.
 */
export function ShuffleText({ children, className }: ShuffleTextProps) {
  return (
    <Shuffle
      tag="span"
      text={children}
      shuffleDirection="up"
      duration={0.4}
      shuffleTimes={1}
      animationMode="sequence"
      stagger={0.022}
      ease={EASE.out}
      playOnEnter={false}
      triggerOnHover
      className={className}
    />
  );
}
