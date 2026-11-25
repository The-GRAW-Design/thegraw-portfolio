import { ArrowLink } from "@/components/ui/arrow-link";
import { Magnet } from "@/components/ui/react-bits/magnet";
import { Reveal } from "@/components/ui/reveal";
import { SplitReveal } from "@/components/ui/split-reveal";
import { CONTACT_DITHER } from "@/constants/dither";
import { HOME_PAGE } from "@/constants/pages";
import { PROPOSAL_HREF } from "@/constants/services";
import { DitherImage } from "@/features/dither-image";

/**
 * Figma home "Frame 81" (1920×788; phones 393×852): the red blackletter call
 * over a light grain, the line and the red "Solicite sua proposta" button.
 */
export function ContactSection() {
  const { title, copy, cta } = HOME_PAGE.contact;

  return (
    <section
      id="contato"
      data-header-theme="dark"
      className="relative h-svh min-h-640 overflow-hidden bg-white-graw text-black-graw lg:h-788 lg:min-h-0"
    >
      <DitherImage {...CONTACT_DITHER} animation="scroll" />
      <div className="absolute inset-0 lg:top-1/2 lg:left-527 lg:h-219 lg:w-872 lg:-translate-y-1/2">
        {/* Phones: three huge lines centred past the screen edges (617px box). */}
        <SplitReveal
          as="h2"
          split="words"
          className="absolute top-[calc(50%-var(--mobile)*255)] left-1/2 w-[calc(var(--mobile)*617.75)] -translate-x-1/2 text-center font-gothic text-together-sm text-red-graw uppercase lg:static lg:w-full lg:translate-x-0 lg:text-together"
        >
          {title}
        </SplitReveal>
        <Reveal
          stagger={0.1}
          className="absolute top-[calc(50%+var(--mobile)*171)] left-1/2 flex w-312 -translate-x-1/2 flex-col items-center gap-11 lg:static lg:mx-auto lg:mt-41 lg:w-817 lg:translate-x-0 lg:flex-row lg:items-start lg:justify-between lg:gap-0"
        >
          <p
            data-reveal
            className="w-309 self-end font-flex text-together-copy leading-[1.1] lg:w-373 lg:self-auto lg:leading-[0.93]"
          >
            {copy}
          </p>
          <div data-reveal>
            {/* The button pulls toward the cursor (React Bits Magnet). */}
            <Magnet padding={70} magnetStrength={4} maxOffset={14}>
              <ArrowLink
                href={PROPOSAL_HREF}
                tone="graw"
                iconClassName="size-27.25 lg:size-20"
                className="h-40 w-312 justify-center gap-4 bg-red-graw px-31 font-flex text-proposal-sm font-medium lg:h-30 lg:w-auto lg:gap-8 lg:px-25 lg:text-caption"
              >
                {cta}
              </ArrowLink>
            </Magnet>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
