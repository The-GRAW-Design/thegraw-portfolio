"use client";

import { useRef } from "react";
import {
  STUDIO_FOUNDATIONS_DITHER,
  STUDIO_PILLARS_DITHER,
  STUDIO_PURPOSE_DITHER,
} from "@/constants/dither";
import { STUDIO_PAGE } from "@/constants/pages";
import { DitherImage } from "@/features/dither-image";
import { EASE, gsap, ScrollTrigger, useGSAP } from "@/lib/gsap";
import { cn } from "@/utils/cn";

const DITHER = {
  purpose: STUDIO_PURPOSE_DITHER,
  pillars: STUDIO_PILLARS_DITHER,
  foundations: STUDIO_FOUNDATIONS_DITHER,
} as const;

/** Desktop: scroll, in viewport heights, that each section stays on screen. */
const STEP = 0.6;
/** How far a block rises as it stacks under the previous one, in px. */
const RISE = 60;
const SHOWN = "inset(0% 0% 0% 0%)";
const HIDDEN = "inset(100% 0% 0% 0%)";

/**
 * Site 2.0 studio "Propósito", "Pilares" and "Fundamentos" (Figma frames
 * 35052/35053/35054 and the stacked 35056). Desktop: the screen pins and each
 * block stacks under the last while its background unveils from the bottom.
 * Phones: the three 393×852 panels side by side, walked through sideways as
 * the page scrolls.
 */
export function StudioPillars() {
  const rootRef = useRef<HTMLElement>(null);
  const sections = STUDIO_PAGE.sections;

  useGSAP(
    () => {
      const root = rootRef.current;
      if (!root) return;
      const track = root.querySelector<HTMLElement>("[data-track]");
      const backgrounds = gsap.utils.toArray<HTMLElement>("[data-bg]", root);
      const blocks = sections.map((section) =>
        gsap.utils.toArray<HTMLElement>(
          `[data-block="${section.id}"] [data-text]`,
          root,
        ),
      );
      const count = sections.length;
      const media = gsap.matchMedia();

      media.add(
        // One condition always matches: the callback only runs when one does.
        {
          desktop: "(min-width: 64rem)",
          phone: "(max-width: 63.99rem)",
          reduced: "(prefers-reduced-motion: reduce)",
        },
        (context) => {
          const { desktop, reduced } = context.conditions ?? {};
          const pace = reduced ? 0 : 1;

          if (!desktop) {
            if (reduced || !track) return;
            // The panels slide by as the page scrolls, one screen each.
            gsap.to(track, {
              x: () => -(track.scrollWidth - root.clientWidth),
              ease: "none",
              scrollTrigger: {
                trigger: root,
                start: "top top",
                end: () => `+=${window.innerWidth * (count - 1)}`,
                pin: true,
                scrub: 0.6,
                snap: {
                  snapTo: 1 / (count - 1),
                  // The nearest panel from where the scroll stops: a short
                  // swipe or a fast fling never skips one.
                  directional: false,
                  inertia: false,
                  duration: { min: 0.3, max: 0.7 },
                  ease: EASE.inOut,
                },
                invalidateOnRefresh: true,
              },
            });
            return;
          }

          let current = 0;
          blocks.forEach((texts, index) =>
            gsap.set(texts, {
              autoAlpha: index === 0 ? 1 : 0,
              y: index === 0 ? 0 : RISE,
            }),
          );
          gsap.set(backgrounds, {
            clipPath: (index) => (index === 0 ? SHOWN : HIDDEN),
          });

          const show = (next: number) => {
            if (next === current) return;
            blocks.forEach((texts, index) => {
              const stacked = index <= next;
              gsap.to(texts, {
                autoAlpha: stacked ? 1 : 0,
                y: stacked ? 0 : RISE,
                duration: (stacked ? 1 : 0.5) * pace,
                ease: stacked ? EASE.expo : EASE.out,
                stagger: stacked ? 0.08 * pace : 0,
                overwrite: true,
              });
            });
            backgrounds.forEach((background, index) => {
              gsap.to(background, {
                clipPath: index <= next ? SHOWN : HIDDEN,
                duration: 1.1 * pace,
                ease: EASE.expo,
                overwrite: true,
              });
            });
            if (next > current) {
              gsap.fromTo(
                backgrounds[next].firstElementChild,
                { scale: 1.15 },
                { scale: 1, duration: 1.4 * pace, ease: EASE.expo },
              );
            }
            current = next;
          };

          ScrollTrigger.create({
            trigger: root,
            start: "top top",
            end: () => `+=${window.innerHeight * STEP * count}`,
            pin: true,
            invalidateOnRefresh: true,
            onUpdate: (self) =>
              show(Math.min(count - 1, Math.floor(self.progress * count))),
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
      className="relative h-svh min-h-640 overflow-hidden bg-black-graw text-white-graw max-lg:motion-reduce:h-auto lg:min-h-0"
    >
      <div
        data-track
        className="flex h-full w-[300%] max-lg:will-change-transform max-lg:motion-reduce:w-full max-lg:motion-reduce:flex-col lg:block lg:w-full"
      >
        {sections.map((section, index) => (
          <div
            key={section.id}
            data-block={section.id}
            className="relative h-full w-1/3 shrink-0 overflow-hidden max-lg:motion-reduce:h-svh max-lg:motion-reduce:w-full lg:static lg:w-auto lg:overflow-visible"
          >
            <div
              data-bg
              className={cn(
                "absolute inset-0 overflow-hidden",
                index > 0 && "lg:[clip-path:inset(100%_0%_0%_0%)]",
              )}
            >
              <div className="absolute inset-0">
                <DitherImage {...DITHER[section.id]} animation="scroll" />
              </div>
            </div>

            {/* Phones: title over text at the panel's left; desktop: the
                title at x 251 and the text on its own column, one row per
                block (the rows stack down the screen). */}
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
                  index > 0 && "lg:opacity-0",
                  section.className,
                )}
              >
                {section.heading}
              </h2>
              <div
                data-text
                className={cn(
                  "font-flex text-pillar-copy-sm lg:absolute lg:z-10 lg:w-550 lg:text-together-copy",
                  index > 0 && "lg:opacity-0",
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
