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
 * keeps drifting up in front of the image. On a phone held upright the line
 * breaks in two, larger, to fill the narrow screen; held sideways it keeps
 * the Figma proportion to the screen height, so it fits the first screen.
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
        className="absolute top-[60svh] left-1/2 -translate-x-1/2 max-lg:portrait:inset-x-16 max-lg:portrait:translate-x-0"
      >
        <SplitReveal
          as="h1"
          split="chars"
          trigger="load"
          delay={0.35}
          className="font-blackletter text-hero whitespace-nowrap text-white-graw [--fluid:calc(100cqw/1920)] max-lg:portrait:whitespace-normal max-lg:portrait:[--fluid:calc(100cqw/1050)] max-lg:landscape:[--fluid:min(calc(100cqw/1920),calc(100svh/1080))]"
        >
          Building for victory
        </SplitReveal>
      </ScrollDrift>
    </section>
  );
}
