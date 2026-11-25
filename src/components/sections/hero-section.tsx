import { ScrollDrift } from "@/components/ui/scroll-drift";
import { SplitReveal } from "@/components/ui/split-reveal";
import { HERO_DITHER } from "@/constants/dither";
import { HOME_PAGE } from "@/constants/pages";
import { SwordBackdrop, SwordSlot } from "@/features/hero-sword";

/**
 * Figma "Desktop - 2" / "Mobile - home": the dithered knight with the
 * blackletter headline and the sword across it. It starts empty: the knight
 * forms, the words rise, then the sword flies in (`HeroSword`) and stirs the
 * dither. On desktop the image goes on for 30% more below the first screen
 * and stays put there, so "Projetos" slides over it while the words keep
 * drifting up in front; phones keep a single screen.
 */
export function HeroSection() {
  const { title, lines } = HOME_PAGE.hero;

  return (
    <section
      data-header-theme="light"
      className="sticky top-0 h-svh overflow-hidden bg-black-graw text-white-graw lg:top-[-30svh] lg:h-[130svh]"
    >
      <SwordBackdrop {...HERO_DITHER} animation="intro" />
      <ScrollDrift
        amount={-0.3}
        scope="[data-hero-stack]"
        className="absolute inset-0"
      >
        <div className="absolute top-199 left-14 flex w-[calc(var(--mobile)*305)] flex-col gap-25 lg:contents">
          <SplitReveal
            as="h1"
            split="chars"
            trigger="load"
            delay={0.5}
            className="font-gothic text-headline-sm uppercase lg:absolute lg:top-365 lg:left-319 lg:w-1318 lg:text-headline lg:whitespace-nowrap"
          >
            {title}
          </SplitReveal>
          <SplitReveal
            split="lines"
            trigger="load"
            delay={0.9}
            className="w-192 font-flex text-strap uppercase lg:absolute lg:top-659 lg:left-398 lg:w-auto lg:whitespace-nowrap"
          >
            {lines[0]}
          </SplitReveal>
          <SplitReveal
            split="lines"
            trigger="load"
            delay={1}
            className="w-193 font-flex text-strap uppercase lg:absolute lg:top-707 lg:right-875 lg:w-auto lg:text-right lg:whitespace-nowrap"
          >
            {lines[1]}
          </SplitReveal>
        </div>
      </ScrollDrift>
      {/* Where the sword rests: across the headline on desktop, upright on
          the right on phones (Figma "sword 1"). */}
      <SwordSlot
        name="hero"
        rest={{ base: "upright", lg: "flat" }}
        className="absolute top-[9.5svh] left-[80.92%] aspect-[545/3040] h-[79.11svh] -translate-x-1/2 lg:top-416.5 lg:left-80.5 lg:aspect-auto lg:h-314 lg:w-1751.5 lg:translate-x-0"
      />
    </section>
  );
}
