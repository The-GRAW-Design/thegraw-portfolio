"use client";

import { useRef } from "react";
import {
  STUDIO_FOUNDATIONS_DITHER,
  STUDIO_PILLARS_DITHER,
  STUDIO_PURPOSE_DITHER,
} from "@/constants/dither";
import { STUDIO_PAGE } from "@/constants/pages";
import { DitherImage } from "@/features/dither-image";
import { EASE, gsap, useGSAP } from "@/lib/gsap";
import { cn } from "@/utils/cn";

const DITHER = {
  purpose: STUDIO_PURPOSE_DITHER,
  pillars: STUDIO_PILLARS_DITHER,
  foundations: STUDIO_FOUNDATIONS_DITHER,
} as const;

/** A panel's background scale as it starts sliding in (1 once it is in). */
const BACKGROUND_ZOOM = 1.12;
/** How far a panel's words come from, in viewport widths (at most 140px). */
const WORDS_TRAVEL = 0.12;

/**
 * Site 2.0 studio "Propósito", "Pilares" and "Fundamentos" (Figma frames
 * 35052/35053/35054, laid side by side in a strip; each block keeps its own
 * frame's place). The screen pins and the vertical scroll slides the panels
 * sideways, settling on one at a time: each background eases out of a slight
 * zoom into its Figma framing as it comes in, and its words follow from the
 * right. Without motion the panels stack.
 */
export function StudioPillars() {
  const rootRef = useRef<HTMLElement>(null);
  const sections = STUDIO_PAGE.sections;

  useGSAP(
    () => {
      const root = rootRef.current;
      const track = root?.querySelector<HTMLElement>("[data-track]");
      if (!root || !track) return;
      const panels = gsap.utils.toArray<HTMLElement>("[data-block]", root);
      const count = panels.length;
      const media = gsap.matchMedia();

      media.add(
        // One condition always matches: the callback only runs when one does.
        {
          desktop: "(min-width: 64rem)",
          phone: "(max-width: 63.99rem)",
          reduced: "(prefers-reduced-motion: reduce)",
        },
        (context) => {
          const { desktop = false, reduced } = context.conditions ?? {};
          if (reduced) return;
          const distance = () => track.scrollWidth - root.clientWidth;
          // Scroll per panel: a screen's shorter side.
          const perPanel = () =>
            Math.min(window.innerWidth, window.innerHeight);
          const slide = gsap.to(track, {
            x: () => -distance(),
            ease: "none",
            scrollTrigger: {
              trigger: root,
              start: "top top",
              end: () => `+=${perPanel() * (count - 1)}`,
              pin: true,
              scrub: 0.6,
              snap: {
                snapTo: 1 / (count - 1),
                // Mouse: any scroll moves on to the next panel that way.
                // Touch: the nearest panel from where the swipe stops, so a
                // short swipe or a fast fling never skips one.
                directional: desktop,
                inertia: false,
                duration: { min: 0.3, max: 0.7 },
                ease: EASE.inOut,
              },
              invalidateOnRefresh: true,
            },
          });

          panels.forEach((panel, index) => {
            const background = panel.querySelector("[data-bg]");
            const words = panel.querySelectorAll("[data-text]");
            if (index > 0) {
              gsap.fromTo(
                background,
                { scale: BACKGROUND_ZOOM },
                {
                  scale: 1,
                  ease: "none",
                  scrollTrigger: {
                    trigger: panel,
                    containerAnimation: slide,
                    start: "left right",
                    end: "left left",
                    scrub: true,
                  },
                },
              );
            }
            gsap.from(words, {
              x: () => Math.min(140, window.innerWidth * WORDS_TRAVEL),
              autoAlpha: 0,
              duration: 1,
              ease: EASE.out,
              stagger: 0.08,
              scrollTrigger:
                index === 0
                  ? { trigger: root, start: "top 60%", once: true }
                  : {
                      trigger: panel,
                      containerAnimation: slide,
                      start: "left 75%",
                      toggleActions: "play none none reverse",
                    },
            });
          });
        },
      );
      return () => media.revert();
    },
    { scope: rootRef },
  );

  return (
    <section
      ref={rootRef}
      data-header-theme="light"
      className="relative h-svh min-h-640 overflow-hidden bg-black-graw text-white-graw motion-reduce:h-auto lg:min-h-0"
    >
      <div
        data-track
        className="flex h-full w-[300%] will-change-transform motion-reduce:w-full motion-reduce:flex-col"
      >
        {sections.map((section) => (
          <div
            key={section.id}
            data-block={section.id}
            className="relative h-full w-1/3 shrink-0 overflow-hidden motion-reduce:h-svh motion-reduce:w-full"
          >
            {/* Pixelated while it zooms: no colors between the dither's. */}
            <div
              data-bg
              className="absolute inset-0 [&_canvas]:[image-rendering:pixelated]"
            >
              <DitherImage {...DITHER[section.id]} animation="scroll" />
            </div>

            {/* Phones: title over text at the panel's left; desktop: the
                title at x 251 and the text on its own column, at the row's
                place in the panel's Figma frame. */}
            <div
              className={cn(
                "absolute left-15 flex w-324 flex-col gap-16 lg:contents",
                section.mobileClassName,
              )}
            >
              <h2
                data-text
                className={cn(
                  "font-gothic text-pillar-sm uppercase lg:absolute lg:left-251 lg:z-10 lg:text-together",
                  section.className,
                )}
              >
                {section.heading}
              </h2>
              <div
                data-text
                className={cn(
                  "font-flex text-pillar-copy-sm lg:absolute lg:z-10 lg:w-550 lg:text-together-copy",
                  section.className,
                  section.textClassName,
                )}
              >
                {"items" in section ? (
                  <ul className="flex flex-col gap-20 lg:gap-54">
                    {section.items.map((item) => (
                      <li key={item.label}>
                        <strong className="font-bold">{item.label}</strong>{" "}
                        {item.text}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p>{section.body}</p>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
