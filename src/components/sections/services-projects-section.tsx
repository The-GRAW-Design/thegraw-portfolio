"use client";

import Image from "next/image";
import { TransitionLink } from "@/features/page-transition";
import { useRef } from "react";
import {
  ProjectBrand,
  ProjectDisciplines,
  ProjectMeta,
} from "@/components/ui/project-meta";
import { GradualBlur } from "@/components/ui/react-bits/gradual-blur";
import { Magnet } from "@/components/ui/react-bits/magnet";
import { SplitReveal } from "@/components/ui/split-reveal";
import { findProject, getProjectHref } from "@/constants/projects";
import { SERVICES_PAGE } from "@/constants/services";
import { useLenis } from "@/hooks/use-lenis";
import { EASE, gsap, useGSAP } from "@/lib/gsap";
import type { Project, ProjectShowcase } from "@/types/project";

type ServicesProjectsSectionProps = {
  /** "projects <branding>": the label of the selected service. */
  label: string;
  /** Re-runs the entrance when the service changes. */
  serviceId: string;
};

/** Figma side fades: 222px wide, blurred up to the 13.05px of `--blur-fade` (12 × 1.09). */
const EDGES = ["left", "right"] as const;
const EDGE_BLUR = 1.09;

const SLIDES = SERVICES_PAGE.slides
  .map((slug) => findProject(slug))
  .filter(
    (project): project is Project & { showcase: ProjectShowcase } =>
      project?.showcase !== undefined,
  );

/**
 * Figma "Projetos" (7656×1080): the "Project view" slides side by side, each a
 * home slide ("Projeto Allce") without its card.
 * The section pins and the vertical scroll moves the slides sideways; without
 * motion it is a plain horizontal scroller.
 */
export function ServicesProjectsSection({
  label,
  serviceId,
}: ServicesProjectsSectionProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const viewportRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLUListElement>(null);
  const lenis = useLenis();

  useGSAP(
    () => {
      const section = sectionRef.current;
      const viewport = viewportRef.current;
      const track = trackRef.current;
      if (!section || !viewport || !track) return;

      const media = gsap.matchMedia();
      media.add("(prefers-reduced-motion: no-preference)", () => {
        viewport.style.overflowX = "hidden";
        const distance = () => track.scrollWidth - viewport.clientWidth;
        const slide = gsap.to(track, {
          x: () => -distance(),
          ease: "none",
          scrollTrigger: {
            trigger: section,
            start: "top top",
            end: () => `+=${distance()}`,
            pin: true,
            scrub: 0.8,
            invalidateOnRefresh: true,
          },
        });

        gsap.utils
          .toArray<HTMLElement>("[data-slide]", section)
          .forEach((item, index) => {
            const image = item.querySelector("[data-slide-image]");
            const content = item.querySelectorAll("[data-slide-content] > *");
            gsap.fromTo(
              image,
              { xPercent: -5 },
              {
                xPercent: 5,
                ease: "none",
                scrollTrigger: {
                  trigger: item,
                  containerAnimation: slide,
                  start: "left right",
                  end: "right left",
                  scrub: true,
                },
              },
            );
            gsap.from(content, {
              x: 140,
              autoAlpha: 0,
              duration: 1,
              ease: EASE.out,
              stagger: 0.08,
              scrollTrigger:
                index === 0
                  ? { trigger: section, start: "top 60%", once: true }
                  : {
                      trigger: item,
                      containerAnimation: slide,
                      start: "left 75%",
                      toggleActions: "play none none reverse",
                    },
            });
          });

        return () => {
          viewport.style.overflowX = "";
        };
      });
      return () => media.revert();
    },
    { scope: sectionRef, dependencies: [serviceId], revertOnUpdate: true },
  );

  const backToTop = () => {
    if (lenis) lenis.scrollTo(0, { duration: 1.6 });
    else window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <section
      ref={sectionRef}
      data-header-theme="light"
      aria-label={label}
      className="@container relative h-svh overflow-hidden bg-black-graw text-white"
    >
      <div
        ref={viewportRef}
        data-lenis-prevent-horizontal
        className="absolute inset-0 snap-x snap-mandatory [scrollbar-width:none] overflow-x-auto"
      >
        <ul ref={trackRef} className="flex h-full w-max">
          {SLIDES.map((project) => (
            <li
              key={`${serviceId}-${project.slug}`}
              data-slide
              className="relative h-full w-[100cqw] shrink-0 snap-start overflow-hidden"
            >
              <TransitionLink
                href={getProjectHref(project)}
                aria-label={project.name}
                className="group absolute inset-0 block focus-visible:outline-offset-[-4px]"
              >
                <div
                  data-slide-image
                  className="absolute inset-y-0 -left-[6%] w-[112%]"
                >
                  <Image
                    src={project.showcase.background}
                    alt=""
                    fill
                    sizes="112vw"
                    className="object-cover transition-transform duration-700 ease-power3 group-hover:scale-[1.02]"
                  />
                </div>
                {/* Figma: the meta at the top, brand and disciplines at the bottom (63px margins). */}
                <div
                  data-slide-content
                  className="absolute inset-x-16 bottom-104 flex flex-col gap-32 lg:inset-x-auto lg:top-63 lg:bottom-63 lg:left-177 lg:w-672.75 lg:justify-between lg:gap-0"
                >
                  <ProjectMeta
                    info={project.showcase}
                    className="w-full lg:w-514.25"
                  />
                  <div className="flex flex-col gap-24 lg:flex-row lg:items-end lg:justify-between">
                    <ProjectBrand
                      info={project.showcase}
                      className="gap-24 lg:gap-71.5"
                    />
                    <ProjectDisciplines
                      info={project.showcase}
                      className="lg:w-226.25"
                    />
                  </div>
                </div>
              </TransitionLink>
            </li>
          ))}
        </ul>
      </div>

      {/* Progressive blur and tint on both edges (React Bits GradualBlur). */}
      {EDGES.map((edge) => (
        <GradualBlur
          key={edge}
          position={edge}
          width="calc(var(--spacing) * 222)"
          strength={EDGE_BLUR}
          layers={6}
          tint="var(--color-fade-dark)"
          zIndex={10}
          className="hidden lg:block"
        />
      ))}

      {/* The label rises letter by letter whenever the service changes. */}
      <SplitReveal
        key={label}
        split="chars"
        className="pointer-events-none absolute top-72 left-1/2 z-20 -translate-x-1/2 text-section whitespace-nowrap text-red-graw lg:top-31"
      >
        {label}
      </SplitReveal>

      <button
        type="button"
        className="group absolute bottom-24 left-1/2 z-20 flex h-48 w-96 -translate-x-1/2 items-center justify-center bg-coal text-back text-red-graw transition-[scale] duration-300 ease-power3 active:scale-95 lg:bottom-45 lg:h-59 lg:w-118"
        onClick={backToTop}
      >
        <Magnet as="span" padding={40} magnetStrength={3} maxOffset={8}>
          {SERVICES_PAGE.back}
        </Magnet>
      </button>
    </section>
  );
}
