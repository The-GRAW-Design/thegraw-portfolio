"use client";

import Image from "next/image";
import { Fragment, useEffect, useRef } from "react";
import { GradualBlur } from "@/components/ui/react-bits/gradual-blur";
import { findProject, getProjectHref } from "@/constants/projects";
import { SERVICES_PAGE } from "@/constants/services";
import { TransitionLink } from "@/features/page-transition";
import { EASE, gsap, ScrollTrigger, useGSAP } from "@/lib/gsap";
import type { Project, ProjectShowcase } from "@/types/project";
import { cn } from "@/utils/cn";

type ServicesProjectsSectionProps = {
  /** The repeat of the page start at the end of the loop: it never pins. */
  copy?: boolean;
  /** Pairs this strip's swipes with the other copy's; returns the undo. */
  onViewport?: (viewport: HTMLElement) => () => void;
};

/**
 * Figma side fades (Rectangles 52/53, read in the Figma editor): 198.63 wide
 * with a 3% tint, and a progressive background blur from 0 to 48.58 (24.29px
 * in CSS) growing evenly over the outer 161.6 toward the edge
 * (GradualBlur: 12px per unit of strength).
 */
const EDGES = [
  { side: "left", tint: "left-0 bg-linear-to-l" },
  { side: "right", tint: "right-0 bg-linear-to-r" },
] as const;
const EDGE_BLUR_WIDTH = "calc(var(--spacing) * 161.6)";
const EDGE_BLUR = 24.29 / 12;

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
 * One slide away from the window, an image lags 2.5% of its slide behind it
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
 * Figma "Projetos" (2.0): the "Project view" slides in a 1711.6×966.3 window
 * at x 89, blurred at both sides; on phones a full-width strip. With a mouse
 * the strip pins in the middle of the screen and the vertical scroll moves
 * the slides through the window; on touch screens they are swiped, and
 * without motion it is a plain horizontal scroller.
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
              drift(images, self.progress * (images.length - 1)),
          },
        });
        return release;
      });

      // Touch: native swipes with snap, the drift following that scroll.
      // Once the strip comes in, it nudges sideways to show it can be swiped.
      media.add(`${MOTION} and ${TOUCH}`, () => {
        const follow = () =>
          drift(images, viewport.scrollLeft / viewport.clientWidth);
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
    <div ref={pinRef} data-header-theme="light" className="lg:pl-89">
      <section
        aria-label={SERVICES_PAGE.projectsLabel}
        className="@container relative aspect-[393/432.3] overflow-hidden bg-black-graw lg:aspect-auto lg:h-966.25 lg:w-1711.5"
      >
        {/* Lenis contains the overscroll of `data-lenis-prevent-horizontal` on
            both axes; the vertical one is let through so a vertical swipe
            over the slides still scrolls the page. */}
        <div
          ref={viewportRef}
          data-lenis-prevent-horizontal
          className="absolute inset-0 snap-x snap-mandatory [scrollbar-width:none] overflow-x-auto overscroll-y-auto!"
        >
          <ul ref={trackRef} className="flex h-full w-max">
            {SLIDES.map((project, index) => (
              <li
                key={project.slug}
                className="relative h-full w-[100cqw] shrink-0 snap-start overflow-hidden"
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

        {/* Tint and progressive blur on both edges (React Bits GradualBlur). */}
        {EDGES.map((edge) => (
          <Fragment key={edge.side}>
            <div
              aria-hidden
              className={cn(
                "pointer-events-none absolute inset-y-0 z-10 hidden w-[calc(var(--spacing)*198.629)] from-transparent to-fade-faint lg:block",
                edge.tint,
              )}
            />
            <GradualBlur
              position={edge.side}
              width={EDGE_BLUR_WIDTH}
              strength={EDGE_BLUR}
              curve="linear"
              exponential={false}
              layers={8}
              zIndex={10}
              className="hidden lg:block"
            />
          </Fragment>
        ))}
      </section>
    </div>
  );
}
