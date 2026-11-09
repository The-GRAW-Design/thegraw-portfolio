import { SplitReveal } from "@/components/ui/split-reveal";
import { CASE_STUDIES_DITHER } from "@/constants/dither";
import { HOME_PAGE } from "@/constants/pages";
import { DitherImage } from "@/features/dither-image";

/**
 * Figma home "case studies" (1920×617): the title over a light grain, as a
 * frosted glass that slides over the hero, which shows through it blurred.
 */
export function CaseStudiesIntroSection() {
  const { title, body } = HOME_PAGE.caseStudies;

  return (
    <section
      data-header-theme="dark"
      className="relative z-10 overflow-hidden px-16 py-112 text-black backdrop-blur-veil lg:h-617 lg:p-0"
    >
      <DitherImage
        {...CASE_STUDIES_DITHER}
        animation="scroll"
        className="opacity-70"
      />
      <div className="relative flex flex-col gap-32 lg:absolute lg:top-255.25 lg:left-962.75 lg:w-359.5 lg:gap-69.5">
        <SplitReveal as="h2" split="lines" className="text-cases">
          {title[0]}
          <br />
          {title[1]}
        </SplitReveal>
        <SplitReveal
          split="lines"
          delay={0.15}
          className="text-intro font-light"
        >
          {body}
        </SplitReveal>
      </div>
    </section>
  );
}
