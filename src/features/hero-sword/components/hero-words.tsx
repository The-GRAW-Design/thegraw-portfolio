"use client";

import { useState } from "react";
import { SplitReveal } from "@/components/ui/split-reveal";
import { heroWaitsForScroll } from "@/features/hero-sword/utils/intro";
import { HERO_REVEAL_SCROLL } from "@/features/hero-sword/utils/reveal";

type HeroWordsProps = {
  title: string;
  lines: readonly [string, string];
};

/** Seconds before each unit moves: on the first scroll, or on load. */
const DELAYS = { scroll: [0, 0.35, 0.45], load: [0.5, 0.9, 1] } as const;

/**
 * The home headline and its two lines (Figma "Desktop - 2" / "Mobile -
 * home"). When the site opens on the home, on desktop, they wait for the
 * first scroll (the hero shows its background alone until then); otherwise
 * (back from another page, or on phones) they rise on load as the knight
 * forms.
 */
export function HeroWords({ title, lines }: HeroWordsProps) {
  // Decided once per visit of the home; the markup is the same either way.
  const [onScroll] = useState(heroWaitsForScroll);
  const delays = DELAYS[onScroll ? "scroll" : "load"];
  const reveal = onScroll
    ? { revealAt: HERO_REVEAL_SCROLL }
    : { trigger: "load" as const };

  return (
    <div className="absolute top-[23.36svh] left-14 flex w-[calc(var(--mobile)*305)] flex-col gap-25 lg:contents">
      <SplitReveal
        as="h1"
        split="chars"
        {...reveal}
        delay={delays[0]}
        className="font-gothic text-headline-sm uppercase lg:absolute lg:top-365 lg:left-319 lg:w-1318 lg:text-headline lg:whitespace-nowrap"
      >
        {title}
      </SplitReveal>
      <SplitReveal
        split="lines"
        {...reveal}
        delay={delays[1]}
        className="w-192 font-flex text-strap uppercase lg:absolute lg:top-659 lg:left-398 lg:w-auto lg:whitespace-nowrap"
      >
        {lines[0]}
      </SplitReveal>
      <SplitReveal
        split="lines"
        {...reveal}
        delay={delays[2]}
        className="w-193 font-flex text-strap uppercase lg:absolute lg:top-707 lg:right-875 lg:w-auto lg:text-right lg:whitespace-nowrap"
      >
        {lines[1]}
      </SplitReveal>
    </div>
  );
}
