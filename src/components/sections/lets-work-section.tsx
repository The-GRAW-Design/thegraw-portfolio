import { TextType } from "@/components/ui/react-bits/text-type";
import { ArrowLink } from "@/components/ui/arrow-link";
import { Reveal } from "@/components/ui/reveal";
import { LETS_WORK, PROPOSAL_CTA, PROPOSAL_HREF } from "@/constants/services";

/** Figma "Frame 81" (942px): the large headline, typed in, and the CTA. */
export function LetsWorkSection() {
  return (
    <section
      data-header-theme="dark"
      className="relative flex flex-col gap-48 overflow-hidden bg-white-graw pt-120 pb-96 text-black-graw lg:block lg:h-942 lg:p-0"
    >
      {/* The hidden copy holds the final size, so nothing moves while the
          headline is typed (React Bits TextType). */}
      <h2 className="mx-16 grid text-lets lg:absolute lg:top-157 lg:left-196 lg:m-0 lg:w-1032">
        <span aria-hidden className="invisible col-start-1 row-start-1">
          {LETS_WORK.title}
        </span>
        <TextType
          as="span"
          text={LETS_WORK.title}
          startOnVisible
          loop={false}
          initialDelay={250}
          typingSpeed={60}
          variableSpeed={{ min: 40, max: 95 }}
          cursorStyle="bar"
          cursorBlinkDuration={0.5}
          cursorClassName="text-red-graw"
          className="col-start-1 row-start-1"
        />
      </h2>

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
