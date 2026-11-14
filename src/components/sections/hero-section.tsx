import { ScrollDrift } from "@/components/ui/scroll-drift";
import { SplitReveal } from "@/components/ui/split-reveal";
import { HERO_DITHER } from "@/constants/dither";
import { DitherImage } from "@/features/dither-image";

/**
 * Figma "Desktop - 1": dithered knight with the blackletter headline. The
 * first screen matches the frame; the image goes on for 30% more below it.
 * The headline scales with the section, not the viewport, so its first and
 * last letters stay clear of the scrollbar. Once that extra 30% is shown it
 * stays put, so the case studies glass slides over it, while the headline
 * keeps drifting up in front of the image.
 */
export function HeroSection() {
  return (
    <section
      data-header-theme="light"
      className="@container sticky top-[-30svh] h-[130svh] overflow-hidden bg-red-graw"
    >
      <DitherImage {...HERO_DITHER} animation="intro" />
      <ScrollDrift
        amount={-0.3}
        scope="[data-hero-stack]"
        className="absolute top-[60svh] left-1/2 -translate-x-1/2"
      >
        <SplitReveal
          as="h1"
          split="chars"
          trigger="load"
          delay={0.35}
          className="font-blackletter text-hero whitespace-nowrap text-white-graw [--fluid:calc(100cqw/1920)]"
        >
          Building for victory
        </SplitReveal>
      </ScrollDrift>
    </section>
  );
}
