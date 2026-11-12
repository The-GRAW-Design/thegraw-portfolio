import Link from "next/link";
import { Reveal } from "@/components/ui/reveal";
import { ShuffleText } from "@/components/ui/shuffle-text";
import { SplitReveal } from "@/components/ui/split-reveal";
import { NOT_FOUND_DITHER } from "@/constants/dither";
import { NOT_FOUND_PAGE } from "@/constants/pages";
import { DitherImage } from "@/features/dither-image";

/**
 * 404: the home hero on a single screen (dithered knight and blackletter
 * headline, scaled with the section like the hero's), with the way back home
 * under it. On desktop the block sits on the bottom edge, so it stays on
 * screen however short the window is.
 */
export function NotFoundSection() {
  return (
    <section
      data-header-theme="light"
      className="@container relative h-svh overflow-hidden bg-red-graw"
    >
      <DitherImage {...NOT_FOUND_DITHER} animation="intro" />
      <Reveal className="absolute inset-x-0 top-[60svh] flex flex-col items-center gap-16 text-white-graw lg:top-auto lg:bottom-42 lg:gap-0">
        <p data-reveal className="pl-[0.57em] text-index uppercase">
          {NOT_FOUND_PAGE.code}
        </p>
        <SplitReveal
          as="h1"
          split="chars"
          trigger="load"
          delay={0.35}
          className="font-blackletter text-hero whitespace-nowrap [--fluid:calc(100cqw/1920)]"
        >
          {NOT_FOUND_PAGE.title}
        </SplitReveal>
        <Link data-reveal href="/" className="group text-more">
          <ShuffleText>{NOT_FOUND_PAGE.back}</ShuffleText>
        </Link>
      </Reveal>
    </section>
  );
}
