"use client";

import type { RefObject } from "react";
import type { DitherUniforms } from "@/features/dither-image/hooks/use-dither-scene";
import type { DitherAnimation } from "@/features/dither-image/types";
import { EASE, gsap, ScrollTrigger, useGSAP } from "@/lib/gsap";

const ENTRY_COARSE = 8;
const SCROLL_COARSE = 2.5;

/**
 * GSAP-driven uniforms: entry reveal, scroll coarsening and cursor lens.
 * `coveredBy`: see `DitherImageProps`.
 */
export function useDitherAnimation(
  containerRef: RefObject<HTMLDivElement | null>,
  uniforms: DitherUniforms | null,
  animation: DitherAnimation,
  coveredBy?: string,
) {
  useGSAP(
    () => {
      const container = containerRef.current;
      if (!container || !uniforms || animation === "none") return;

      // Entry: cells materialize in Bayer order while the grain sharpens.
      const intro = gsap
        .timeline({ paused: animation === "scroll" })
        .fromTo(
          uniforms.uReveal,
          { value: 0 },
          { value: 1, duration: 1.2, ease: EASE.inOut },
        )
        .fromTo(
          uniforms.uEntryCoarse,
          { value: ENTRY_COARSE },
          { value: 1, duration: 1.2, ease: EASE.expo },
          0.1,
        );

      if (animation === "scroll") {
        ScrollTrigger.create({
          trigger: container,
          start: "top 80%",
          once: true,
          onEnter: () => intro.play(),
        });
      }

      // Scroll: coarser grain while the section leaves (intro) or enters
      // (scroll); a sticky image "leaves" while its cover slides over it.
      const leaving = animation === "intro";
      const cover =
        leaving && coveredBy
          ? document.querySelector<HTMLElement>(coveredBy)
          : null;
      gsap.fromTo(
        uniforms.uScrollCoarse,
        { value: leaving ? 1 : SCROLL_COARSE / 2 },
        {
          value: leaving ? SCROLL_COARSE : 1,
          ease: leaving ? "power2.in" : "power2.out",
          scrollTrigger: {
            trigger: cover ?? container,
            start: cover ? "top bottom" : leaving ? "top top" : "top bottom",
            end: cover ? "top top" : leaving ? "bottom top" : "top 40%",
            scrub: 0.6,
          },
        },
      );
      // Once the cover has gone by (its texts may show the image through
      // them), hidden: the render loop stops as the scene's observer sees it
      // leave.
      const uncover = () => {
        container.style.display = "";
      };
      if (cover) {
        ScrollTrigger.create({
          trigger: cover,
          start: "bottom top",
          onEnter: () => {
            container.style.display = "none";
          },
          onLeaveBack: uncover,
        });
      }
      // Cursor: a lens of coarser cells follows the pointer (desktop only).
      if (!window.matchMedia("(pointer: fine)").matches) return uncover;
      const mouse = uniforms.uMouse.value;
      const moveX = gsap.quickTo(mouse, "x", { duration: 0.8, ease: EASE.out });
      const moveY = gsap.quickTo(mouse, "y", { duration: 0.8, ease: EASE.out });
      const strength = gsap.quickTo(uniforms.uMouseStrength, "value", {
        duration: 0.6,
        ease: EASE.out,
      });

      // Last pointer position: the lens follows it on scroll as well.
      let pointer: { x: number; y: number } | null = null;
      const track = () => {
        if (!pointer) return;
        const rect = container.getBoundingClientRect();
        const x = (pointer.x - rect.left) / rect.width;
        const y = (pointer.y - rect.top) / rect.height;
        const inside = x >= 0 && x <= 1 && y >= 0 && y <= 1;
        moveX(x);
        moveY(y);
        strength(inside ? 1 : 0);
      };
      const onPointerMove = (event: PointerEvent) => {
        pointer = { x: event.clientX, y: event.clientY };
        track();
      };
      const onPointerLeave = () => {
        pointer = null;
        strength(0);
      };

      window.addEventListener("pointermove", onPointerMove, { passive: true });
      window.addEventListener("scroll", track, { passive: true });
      document.documentElement.addEventListener("pointerleave", onPointerLeave);
      return () => {
        uncover();
        window.removeEventListener("pointermove", onPointerMove);
        window.removeEventListener("scroll", track);
        document.documentElement.removeEventListener(
          "pointerleave",
          onPointerLeave,
        );
      };
    },
    { dependencies: [uniforms, animation, coveredBy], revertOnUpdate: true },
  );
}
