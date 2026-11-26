"use client";

import { useRef } from "react";
import { PROJECTS_INTRO_DITHER } from "@/constants/dither";
import { HOME_PAGE } from "@/constants/pages";
import { DitherImage } from "@/features/dither-image";
import { SwordSlot } from "@/features/hero-sword";
import { useTextKnockout } from "@/hooks/use-text-knockout";

/**
 * Figma home "Projetos" (1920×617, phones 393×412): the title and its line
 * over a light grain, with the sword between them (it settles here from the
 * hero). The section slides over the hero, and its texts are cut out of the
 * grain like the menu words on hover, showing the hero through them, blurred.
 * It is the hero's cover (`data-hero-cover`): the hero holds still under it.
 */
export function ProjectsIntroSection() {
  const ref = useRef<HTMLElement>(null);
  const { title, body } = HOME_PAGE.projects;
  useTextKnockout(ref);

  return (
    <section
      ref={ref}
      data-hero-cover
      data-header-theme="dark"
      className="relative z-10 h-412 overflow-hidden text-black lg:h-617"
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
        <DitherImage {...PROJECTS_INTRO_DITHER} animation="scroll" />
      </div>
      <div className="lg:absolute lg:top-1/2 lg:left-1/2 lg:flex lg:w-1579 lg:-translate-x-1/2 lg:-translate-y-1/2 lg:items-center lg:gap-444">
        <h2
          data-knockout-text
          className="absolute top-103 left-1/2 w-195 -translate-x-1/2 text-center font-gothic text-projects-sm lg:static lg:w-696.5 lg:translate-x-0 lg:text-left lg:text-projects"
        >
          {title}
        </h2>
        <p
          data-knockout-text
          className="absolute top-253 left-1/2 w-196 -translate-x-1/2 text-center font-flex text-projects-copy font-light lg:static lg:w-auto lg:flex-1 lg:translate-x-0 lg:text-left"
        >
          {body}
        </p>
      </div>
      {/* Figma "sword 1": upright between the texts on desktop, flat
          between them on phones. */}
      <SwordSlot
        name="projects"
        rest={{ base: "flat", lg: "upright" }}
        className="absolute top-178 left-1/2 h-60.5 w-338.5 -translate-x-1/2 lg:top-39 lg:h-553.25 lg:w-99"
      />
    </section>
  );
}
