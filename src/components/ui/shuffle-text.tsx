"use client";

import { Shuffle } from "@/components/ui/react-bits/shuffle";
import { EASE } from "@/lib/gsap";

type ShuffleTextProps = {
  children: string;
  className?: string;
};

/**
 * Link and button label whose letters roll up through a shuffle when it comes
 * into view and on hover or keyboard focus of its link or button (React Bits
 * Shuffle).
 */
export function ShuffleText({ children, className }: ShuffleTextProps) {
  return (
    <Shuffle
      tag="span"
      text={children}
      shuffleDirection="up"
      duration={0.35}
      shuffleTimes={1}
      animationMode="evenodd"
      stagger={0.03}
      ease={EASE.out}
      threshold={0}
      rootMargin="0px"
      triggerOnHover
      className={className}
    />
  );
}
