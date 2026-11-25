import { SplitReveal } from "@/components/ui/split-reveal";
import { HERO_DITHER } from "@/constants/dither";
import { HOME_PAGE } from "@/constants/pages";
import {
  HERO_REVEAL_SCROLL,
  SwordBackdrop,
  SwordSlot,
} from "@/features/hero-sword";

/** The section that slides over the hero (see `ProjectsIntroSection`). */
const HERO_COVER = "[data-hero-cover]";

/**
 * Figma "Desktop - 3" then "Desktop - 2" / "Mobile - home": the dithered
 * knight holds still on screen. It opens on the background alone (the knight
 * forms); the first scroll brings in the blackletter headline, its two lines
 * and the sword (`HeroSword`), which stirs the dither as it lands. After a
 * short hold, the white "Projetos" and then the cases slide over it.
 */
export function HeroSection() {
  const { title, lines } = HOME_PAGE.hero;

  return (
    <>
      <section
        data-header-theme="light"
        className="sticky top-0 h-svh overflow-hidden bg-black-graw text-white-graw"
      >
        <SwordBackdrop
          {...HERO_DITHER}
          animation="intro"
          coveredBy={HERO_COVER}
        />
        <div className="absolute top-199 left-14 flex w-[calc(var(--mobile)*305)] flex-col gap-25 lg:contents">
          <SplitReveal
            as="h1"
            split="chars"
            revealAt={HERO_REVEAL_SCROLL}
            className="font-gothic text-headline-sm uppercase lg:absolute lg:top-365 lg:left-319 lg:w-1318 lg:text-headline lg:whitespace-nowrap"
          >
            {title}
          </SplitReveal>
          <SplitReveal
            split="lines"
            revealAt={HERO_REVEAL_SCROLL}
            delay={0.35}
            className="w-192 font-flex text-strap uppercase lg:absolute lg:top-659 lg:left-398 lg:w-auto lg:whitespace-nowrap"
          >
            {lines[0]}
          </SplitReveal>
          <SplitReveal
            split="lines"
            revealAt={HERO_REVEAL_SCROLL}
            delay={0.45}
            className="w-193 font-flex text-strap uppercase lg:absolute lg:top-707 lg:right-875 lg:w-auto lg:text-right lg:whitespace-nowrap"
          >
            {lines[1]}
          </SplitReveal>
        </div>
        {/* Where the sword rests: across the headline on desktop, upright on
            the right on phones (Figma "sword 1"). */}
        <SwordSlot
          name="hero"
          rest={{ base: "upright", lg: "flat" }}
          className="absolute top-[9.5svh] left-[80.92%] aspect-[545/3040] h-[79.11svh] -translate-x-1/2 lg:top-416.5 lg:left-80.5 lg:aspect-auto lg:h-314 lg:w-1751.5 lg:translate-x-0"
        />
      </section>
      {/* The hold: the hero stays alone on screen while its words and the
          sword come in, before "Projetos" rises over it. */}
      <div aria-hidden data-header-theme="light" className="h-[70svh]" />
    </>
  );
}
