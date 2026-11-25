import { ArrowLink } from "@/components/ui/arrow-link";
import { Magnet } from "@/components/ui/react-bits/magnet";
import { ProximityText } from "@/components/ui/proximity-text";
import { Reveal } from "@/components/ui/reveal";
import { LETS_WORK, PROPOSAL_CTA, PROPOSAL_HREF } from "@/constants/services";

/** Figma "Frame 81" (942px): the large headline and the CTA. */
export function LetsWorkSection() {
  return (
    <section
      data-header-theme="dark"
      className="relative flex flex-col gap-48 overflow-hidden bg-white-graw pt-120 pb-96 text-black-graw lg:block lg:h-942 lg:p-0"
    >
      {/* The letters rise out of a blur and answer the cursor. */}
      <ProximityText
        as="h2"
        className="mx-16 text-lets lg:absolute lg:top-157 lg:left-196 lg:m-0 lg:w-1032"
      >
        {LETS_WORK.title}
      </ProximityText>

      <Reveal className="flex flex-col items-start gap-20 px-16 lg:absolute lg:top-510 lg:left-1373 lg:w-373 lg:gap-32 lg:p-0">
        <p data-reveal className="text-body leading-[0.93] tracking-snug">
          {LETS_WORK.copy[0]}
          <br />
          {LETS_WORK.copy[1]}
        </p>
        <div data-reveal>
          {/* The CTA pulls toward the cursor (React Bits Magnet). On phones
              it gets a taller tap area, with the same gap above it. */}
          <Magnet padding={70} magnetStrength={4} maxOffset={14}>
            <ArrowLink
              href={PROPOSAL_HREF}
              tone="red"
              className="py-12 lg:py-0"
            >
              {PROPOSAL_CTA}
            </ArrowLink>
          </Magnet>
        </div>
      </Reveal>
    </section>
  );
}
