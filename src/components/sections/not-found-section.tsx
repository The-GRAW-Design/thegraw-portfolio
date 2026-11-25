import { TransitionLink } from "@/features/page-transition";
import { Counter } from "@/components/ui/react-bits/counter";
import { Reveal } from "@/components/ui/reveal";
import { ShuffleText } from "@/components/ui/shuffle-text";
import { SplitReveal } from "@/components/ui/split-reveal";
import { NOT_FOUND_DITHER } from "@/constants/dither";
import { NOT_FOUND_PAGE } from "@/constants/pages";
import { DitherImage } from "@/features/dither-image";
import { SwordSlot } from "@/features/hero-sword";

const [CODE_LABEL, CODE] = NOT_FOUND_PAGE.code.split(" ");
const CODE_NUMBER = Number(CODE);

/**
 * 404: the home hero on a single screen. The banner knight forms, the
 * blackletter line sits where the hero headline does, "erro 404" and the
 * way back home take the place of its two lines, and the sword rests across
 * them (the Figma image, `data-sword="static"`: no 3D here).
 */
export function NotFoundSection() {
  return (
    <section
      data-header-theme="light"
      data-sword="static"
      className="relative h-svh overflow-hidden bg-black-graw text-white-graw"
    >
      <DitherImage {...NOT_FOUND_DITHER} animation="intro" />
      <Reveal
        delay={0.9}
        className="absolute top-199 left-14 flex w-[calc(var(--mobile)*365)] flex-col gap-25 lg:contents"
      >
        <SplitReveal
          as="h1"
          split="chars"
          trigger="load"
          delay={0.5}
          className="font-gothic text-headline-sm uppercase lg:absolute lg:top-365 lg:left-319 lg:w-1318 lg:text-headline lg:whitespace-nowrap"
        >
          {NOT_FOUND_PAGE.title}
        </SplitReveal>
        {/* "erro 404": the number rolls in like an odometer (React Bits Counter). */}
        <p
          data-reveal
          className="font-flex text-strap uppercase lg:absolute lg:top-659 lg:left-398"
        >
          {CODE_LABEL} <Counter value={CODE_NUMBER} />
        </p>
        <TransitionLink
          data-reveal
          href="/"
          className="group self-start font-flex text-strap uppercase lg:absolute lg:top-707 lg:right-875 lg:text-right"
        >
          <ShuffleText>{NOT_FOUND_PAGE.back}</ShuffleText>
        </TransitionLink>
      </Reveal>
      <SwordSlot
        name="hero"
        rest={{ base: "upright", lg: "flat" }}
        className="absolute top-[9.5svh] left-[80.92%] aspect-[545/3040] h-[79.11svh] -translate-x-1/2 lg:top-416.5 lg:left-80.5 lg:aspect-auto lg:h-314 lg:w-1751.5 lg:translate-x-0"
      />
    </section>
  );
}
