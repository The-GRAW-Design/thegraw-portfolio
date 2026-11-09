import { ArrowLink } from "@/components/ui/arrow-link";
import { EdgeFades } from "@/components/ui/edge-fades";
import { Marquee } from "@/components/ui/marquee";
import { Reveal } from "@/components/ui/reveal";
import { TypeText } from "@/components/ui/type-text";
import { LETS_WORK, PROPOSAL_CTA, PROPOSAL_HREF } from "@/constants/services";

const BAR_COUNT = 5;

/** Figma "Frame 81" (942px): placeholder bars, headline and proposal CTA. */
export function LetsWorkSection() {
  return (
    <section
      data-header-theme="dark"
      className="relative flex flex-col gap-48 overflow-hidden bg-white-graw pb-96 text-black-graw lg:block lg:h-942 lg:p-0"
    >
      <div className="relative h-120 pt-24 lg:absolute lg:inset-x-0 lg:top-121 lg:h-195 lg:pt-36">
        <Marquee speed={50} itemsClassName="gap-40 pr-40 lg:gap-80 lg:pr-80">
          {Array.from({ length: BAR_COUNT }, (_, index) => (
            <div
              key={index}
              className="h-64 w-192 shrink-0 bg-bar lg:h-111 lg:w-333"
            />
          ))}
        </Marquee>
        <EdgeFades tone="light" className="w-48 lg:w-105" />
      </div>

      <TypeText
        as="h2"
        className="mx-16 text-display lg:absolute lg:top-445 lg:left-285 lg:m-0 lg:w-626"
      >
        {LETS_WORK.title}
      </TypeText>

      <Reveal className="flex flex-col items-start gap-32 px-16 lg:absolute lg:top-510 lg:left-1373 lg:w-373 lg:p-0">
        <p data-reveal className="text-body leading-[0.93] tracking-snug">
          {LETS_WORK.copy[0]}
          <br />
          {LETS_WORK.copy[1]}
        </p>
        <div data-reveal>
          <ArrowLink href={PROPOSAL_HREF} tone="red">
            {PROPOSAL_CTA}
          </ArrowLink>
        </div>
      </Reveal>
    </section>
  );
}
