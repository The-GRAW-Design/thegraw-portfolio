"use client";

import { useRef } from "react";
import {
  STUDIO_FOUNDATIONS_DITHER,
  STUDIO_PILLARS_DITHER,
  STUDIO_PURPOSE_DITHER,
} from "@/constants/dither";
import { STUDIO_PAGE } from "@/constants/pages";
import { DitherImage } from "@/features/dither-image";
import { useStepInput } from "@/hooks/use-step-input";
import { EASE, gsap, ScrollTrigger, useGSAP } from "@/lib/gsap";
import { getLenis } from "@/lib/smooth-scroll-provider";
import { cn } from "@/utils/cn";

const DITHER = {
  purpose: STUDIO_PURPOSE_DITHER,
  pillars: STUDIO_PILLARS_DITHER,
  foundations: STUDIO_FOUNDATIONS_DITHER,
} as const;

/** Seconds a slide to the next panel takes. */
const SLIDE = 1;
/** A panel's background scale as it slides in (1 once it has locked). */
const BACKGROUND_ZOOM = 1.12;
/** How far a panel's words rise as they come in, in px. */
const WORDS_RISE = 60;
/** Leaving the strip, the page goes on by this share of the screen. */
const CARRY = 0.5;
/** Scroll (px) away from the lock that means the page moved some other way. */
const DRIFT = 4;
/** A pause (ms) between wheel events that starts a new gesture. */
const QUIET_GAP = 180;
/** Right after locking, a moving page (a touch fling) is put back (ms). */
const SETTLE = 450;

type LockInput = { active: boolean; step: (step: 1 | -1) => void };

/**
 * Site 2.0 studio "Propósito", "Pilares" and "Fundamentos" (Figma frames
 * 35052/35053/35054, laid side by side in a strip; each block keeps its own
 * frame's place). When the strip reaches the top of the screen the page locks
 * there: each scroll, swipe or arrow key slides to the next panel, which
 * locks in place (its background easing out of a slight zoom into its Figma
 * framing) before its words rise. Past the first or the last panel the page
 * scrolls on. Without motion the panels stack.
 */
export function StudioPillars() {
  const rootRef = useRef<HTMLElement>(null);
  const inputRef = useRef<LockInput>({ active: false, step: () => {} });
  const sections = STUDIO_PAGE.sections;

  useStepInput(
    rootRef,
    (step) => inputRef.current.step(step),
    () => inputRef.current.active,
  );

  useGSAP(
    () => {
      const root = rootRef.current;
      const track = root?.querySelector<HTMLElement>("[data-track]");
      if (!root || !track) return;
      const panels = gsap.utils.toArray<HTMLElement>("[data-block]", root);
      const words = panels.map((panel) =>
        gsap.utils.toArray<HTMLElement>("[data-text]", panel),
      );
      const backgrounds = panels.map((panel) =>
        panel.querySelector<HTMLElement>("[data-bg]"),
      );
      const count = panels.length;
      const input = inputRef.current;
      const media = gsap.matchMedia();

      media.add("(prefers-reduced-motion: no-preference)", () => {
        let index = 0;
        let sliding = false;
        let state: "before" | "locked" | "after" = "before";
        // One gesture moves one panel: the rest of it (or a trackpad's
        // glide) is ignored until a new one starts (a pause in the wheel,
        // a new touch, a key).
        let armed = false;
        let lastInput = 0;
        const onInput = (event: Event) => {
          const now = performance.now();
          if (event.type !== "wheel" || now - lastInput > QUIET_GAP) {
            armed = true;
          }
          lastInput = now;
        };
        const shown = panels.map(() => false);

        gsap.set(words.flat(), { autoAlpha: 0, y: WORDS_RISE });
        const showWords = (panel: number, delay = 0) => {
          shown[panel] = true;
          gsap.to(words[panel], {
            autoAlpha: 1,
            y: 0,
            duration: 1,
            delay,
            ease: EASE.expo,
            stagger: 0.08,
            overwrite: true,
          });
        };
        const hideWords = (panel: number) => {
          shown[panel] = false;
          gsap.to(words[panel], {
            autoAlpha: 0,
            y: WORDS_RISE,
            duration: 0.35,
            ease: EASE.out,
            overwrite: true,
          });
        };

        /** Puts the page at the lock. */
        const hold = (at: number) => {
          const lenis = getLenis();
          if (lenis) lenis.scrollTo(at, { immediate: true, force: true });
          else window.scrollTo(0, at);
        };
        let settleUntil = 0;

        // The page's scroll where the strip fills the screen.
        const place = ScrollTrigger.create({
          trigger: root,
          start: "top top",
          onRefresh: (self) => {
            if (state === "locked") hold(self.start);
          },
        });
        state = window.scrollY > place.start + DRIFT ? "after" : "before";

        const lock = () => {
          state = "locked";
          // The page's smooth scroll leaves the strip's input alone, and the
          // page stays still (that also ends a touch fling on the way in).
          root.setAttribute("data-lenis-prevent", "");
          getLenis()?.stop();
          settleUntil = performance.now() + SETTLE;
          hold(place.start);
          input.active = true;
          armed = false;
          lastInput = performance.now();
          if (!shown[index]) showWords(index, 0.15);
        };

        const release = (direction: 1 | -1, carry: boolean) => {
          state = direction > 0 ? "after" : "before";
          input.active = false;
          root.removeAttribute("data-lenis-prevent");
          getLenis()?.start();
          if (!carry) return;
          const to = place.start + direction * window.innerHeight * CARRY;
          const lenis = getLenis();
          // Locked: the rest of the swipe doesn't stop it.
          if (lenis) lenis.scrollTo(to, { lock: true });
          else window.scrollTo({ top: to, behavior: "smooth" });
        };

        const slideTo = (next: number) => {
          sliding = true;
          hideWords(index);
          gsap.fromTo(
            backgrounds[next],
            { scale: BACKGROUND_ZOOM },
            { scale: 1, duration: SLIDE + 0.4, ease: EASE.expo },
          );
          gsap.to(track, {
            xPercent: -(100 / count) * next,
            duration: SLIDE,
            ease: EASE.inOut,
            overwrite: true,
            // Locked in place: now the words come in.
            onComplete: () => {
              sliding = false;
              showWords(next);
            },
          });
          index = next;
        };

        input.step = (step) => {
          if (state !== "locked" || sliding || !armed) return;
          armed = false;
          const next = index + step;
          if (next < 0 || next >= count) release(step, true);
          else slideTo(next);
        };

        // Locks when the scroll reaches the strip from either side; any other
        // way of scrolling away (keys, scrollbar) lets it go.
        let last = window.scrollY;
        const onScroll = () => {
          const y = window.scrollY;
          const at = place.start;
          if (state === "locked") {
            if (Math.abs(y - at) <= DRIFT) {
              // In place.
            } else if (performance.now() < settleUntil) hold(at);
            else release(y > at ? 1 : -1, false);
          } else if (state === "before" && last < at && y >= at) {
            lock();
          } else if (state === "after" && last > at && y <= at) {
            lock();
          }
          last = y;
        };
        window.addEventListener("scroll", onScroll, { passive: true });
        // Seen before the strip's input (capture), to arm it for this event.
        const inputs = ["wheel", "touchstart", "keydown"] as const;
        inputs.forEach((type) =>
          window.addEventListener(type, onInput, {
            capture: true,
            passive: true,
          }),
        );

        return () => {
          window.removeEventListener("scroll", onScroll);
          inputs.forEach((type) =>
            window.removeEventListener(type, onInput, { capture: true }),
          );
          root.removeAttribute("data-lenis-prevent");
          if (state === "locked") getLenis()?.start();
          input.active = false;
          input.step = () => {};
        };
      });
      return () => media.revert();
    },
    { scope: rootRef },
  );

  return (
    <section
      ref={rootRef}
      data-header-theme="light"
      className="relative h-lvh min-h-640 overflow-hidden bg-black-graw text-white-graw motion-reduce:h-auto lg:min-h-0"
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
