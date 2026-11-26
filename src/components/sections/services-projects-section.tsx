"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";
import { findProject, getProjectHref } from "@/constants/projects";
import { SERVICES_PAGE } from "@/constants/services";
import { TransitionLink } from "@/features/page-transition";
import { EASE, gsap, ScrollTrigger, useGSAP } from "@/lib/gsap";
import type { Project, ProjectShowcase } from "@/types/project";

type ServicesProjectsSectionProps = {
  /** The repeat of the page start at the end of the loop: it never pins. */
  copy?: boolean;
  /** Pairs this strip's swipes with the other copy's; returns the undo. */
  onViewport?: (viewport: HTMLElement) => () => void;
};

const SLIDES = SERVICES_PAGE.slides
  .map((slug) => findProject(slug))
  .filter(
    (project): project is Project & { showcase: ProjectShowcase } =>
      project?.showcase !== undefined,
  );

/** Pinned scroll with a mouse; native swipe on touch screens. */
const MOTION = "(prefers-reduced-motion: no-preference)";
const MOUSE = "(hover: hover) and (pointer: fine)";
const TOUCH = "(pointer: coarse)";
/** How far the swipe hint pulls the track, in viewport widths. */
const SWIPE_HINT = 0.14;
/**
 * One slide away from its place, an image lags 2.5% of its slide behind it
 * and is 6% larger (3% of room on each side, so no edge ever shows). At rest
 * it is framed exactly as in the Figma.
 */
const DRIFT = 2.5;
const DRIFT_ZOOM = 0.06;

/** Each image lags behind its slide as the strip moves (`offset` in slides). */
function drift(images: HTMLElement[], offset: number) {
  images.forEach((image, index) => {
    const away = gsap.utils.clamp(-1, 1, index - offset);
    gsap.set(image, {
      xPercent: -DRIFT * away,
      scale: 1 + DRIFT_ZOOM * Math.abs(away),
    });
  });
}

/**
 * Figma "Projetos" (2.0): the "Project view" slides, 1711.6×966.3, the first
 * one at x 89 and the next peeking at the right edge; on phones a full-width
 * strip. Edge to edge, without the Figma side fades (the user's call): the
 * dark gap at the left only shows before the strip moves. With a mouse the
 * strip pins in the middle of the screen and the vertical scroll moves the
 * slides until the last one meets the right edge; on touch screens they are
 * swiped, and without motion it is a plain horizontal scroller.
 */
export function ServicesProjectsSection({
  copy = false,
  onViewport,
}: ServicesProjectsSectionProps) {
  const pinRef = useRef<HTMLDivElement>(null);
  const viewportRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLUListElement>(null);

  useEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport || !onViewport) return;
    return onViewport(viewport);
  }, [onViewport]);

  useGSAP(
    () => {
      const pin = pinRef.current;
      const viewport = viewportRef.current;
      const track = trackRef.current;
      if (!pin || !viewport || !track) return;

      const images = gsap.utils.toArray<HTMLElement>(
        "[data-slide-image]",
        track,
      );
      const slideWidth = () =>
        (track.firstElementChild as HTMLElement | null)?.offsetWidth ||
        viewport.clientWidth;
      const media = gsap.matchMedia();

      // Mouse: the vertical scroll moves the slides. The repeat stays at
      // rest, as the real strip is when the page wraps back to the start.
      media.add(`${MOTION} and ${MOUSE}`, () => {
        viewport.style.overflowX = "hidden";
        drift(images, 0);
        const release = () => {
          viewport.style.overflowX = "";
        };
        if (copy) return release;

        const distance = () => track.scrollWidth - viewport.clientWidth;
        gsap.to(track, {
          x: () => -distance(),
          ease: "none",
          scrollTrigger: {
            trigger: pin,
            start: "clamp(center center)",
            end: () => `+=${distance()}`,
            pin: true,
            // Lenis already smooths the scroll; a lagging scrub would wind
            // the strip back on screen when the page wraps.
            scrub: true,
            invalidateOnRefresh: true,
            onUpdate: (self) =>
              drift(images, (self.progress * distance()) / slideWidth()),
          },
        });
        return release;
      });

      // Touch: native swipes with snap, the drift following that scroll.
      // Once the strip comes in, it nudges sideways to show it can be swiped.
      media.add(`${MOTION} and ${TOUCH}`, () => {
        const follow = () => drift(images, viewport.scrollLeft / slideWidth());
        follow();
        viewport.addEventListener("scroll", follow, { passive: true });
        const stopFollowing = () =>
          viewport.removeEventListener("scroll", follow);
        if (copy) return stopFollowing;

        const nudge = { left: 0 };
        const hint = gsap
          .timeline({
            paused: true,
            onStart: () => {
              viewport.style.scrollSnapType = "none";
            },
            onComplete: () => {
              viewport.style.scrollSnapType = "";
            },
          })
          .to(nudge, {
            left: () => viewport.clientWidth * SWIPE_HINT,
            duration: 0.6,
            ease: EASE.out,
            onUpdate: () => {
              viewport.scrollLeft = nudge.left;
            },
          })
          .to(nudge, {
            left: 0,
            duration: 0.6,
            ease: EASE.inOut,
            onUpdate: () => {
              viewport.scrollLeft = nudge.left;
            },
          });
        const start = gsap.delayedCall(0.6, () => hint.play()).pause();
        const trigger = ScrollTrigger.create({
          trigger: pin,
          start: "top 40%",
          once: true,
          onEnter: () => {
            if (viewport.scrollLeft === 0) start.restart(true);
          },
        });
        // Touching the slides first (or during the hint) cancels it.
        const stopHint = () => {
          start.kill();
          hint.kill();
          viewport.style.scrollSnapType = "";
        };
        viewport.addEventListener("touchstart", stopHint, { passive: true });

        return () => {
          stopFollowing();
          trigger.kill();
          stopHint();
          viewport.removeEventListener("touchstart", stopHint);
        };
      });
      return () => media.revert();
    },
    { scope: pinRef, dependencies: [copy] },
  );

  return (
    <div ref={pinRef} data-header-theme="light">
      {/* Desktop: the page's black shows in the gap before the first slide. */}
      <section
        aria-label={SERVICES_PAGE.projectsLabel}
        className="@container relative aspect-[393/432.3] overflow-hidden bg-black-graw lg:aspect-auto lg:h-966.25 lg:bg-transparent"
      >
        {/* Lenis contains the overscroll of `data-lenis-prevent-horizontal` on
            both axes; the vertical one is let through so a vertical swipe
            over the slides still scrolls the page. */}
        <div
          ref={viewportRef}
          data-lenis-prevent-horizontal
          className="absolute inset-0 snap-x snap-mandatory [scrollbar-width:none] overflow-x-auto overscroll-y-auto!"
        >
          {/* The first slide snaps with its gap; the others edge to edge. */}
          <ul ref={trackRef} className="flex h-full w-max lg:pl-89">
            {SLIDES.map((project, index) => (
              <li
                key={project.slug}
                className="relative h-full w-[100cqw] shrink-0 snap-start overflow-hidden lg:w-1711.5 lg:first:scroll-ml-89"
              >
                <TransitionLink
                  href={getProjectHref(project)}
                  aria-label={project.name}
                  tabIndex={copy ? -1 : undefined}
                  className="group absolute inset-0 block focus-visible:outline-offset-[-4px]"
                >
                  <div data-slide-image className="absolute inset-0">
                    <Image
                      src={project.showcase.background}
                      alt=""
                      fill
                      priority={!copy && index === 0}
                      sizes="(min-width: 1024px) 90vw, 100vw"
                      className="object-cover transition-transform duration-700 ease-power3 group-hover:scale-[1.02]"
                    />
                  </div>
                </TransitionLink>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </div>
  );
}
