"use client";

import { useRef } from "react";
import { CASE_STUDIES_DITHER } from "@/constants/dither";
import { HOME_PAGE } from "@/constants/pages";
import { DitherImage } from "@/features/dither-image";
import { useTextKnockout } from "@/hooks/use-text-knockout";

/**
 * Figma home "case studies" (1920×617): the title over a light grain. It
 * slides over the hero, and its texts are cut out of the grain like the menu
 * words on hover, showing the hero through them, blurred.
 */
export function CaseStudiesIntroSection() {
  const ref = useRef<HTMLElement>(null);
  const { title, body } = HOME_PAGE.caseStudies;
  useTextKnockout(ref);

  return (
    <section
      ref={ref}
      data-header-theme="dark"
      className="relative z-10 overflow-hidden px-16 py-112 text-black lg:h-617 lg:p-0"
    >
      <div
        data-knockout-glass
        aria-hidden
        className="absolute backdrop-blur-menu"
      />
      <div
        data-knockout-layer
        aria-hidden
        className="absolute inset-0 bg-white"
      >
        <DitherImage {...CASE_STUDIES_DITHER} animation="scroll" />
      </div>
      <div className="relative flex flex-col gap-32 lg:absolute lg:top-255.25 lg:left-962.75 lg:w-359.5 lg:gap-69.5">
        <h2 data-knockout-text className="text-cases">
          {title[0]}
          <br />
          {title[1]}
        </h2>
        <p data-knockout-text className="text-intro font-light">
          {body}
        </p>
      </div>
    </section>
  );
}
