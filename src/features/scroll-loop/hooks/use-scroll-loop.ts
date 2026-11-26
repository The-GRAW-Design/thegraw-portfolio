"use client";

import { useEffect, type RefObject } from "react";
import {
  getLoopPeriod,
  setLoopPeriod,
} from "@/features/scroll-loop/utils/looped-scroll";
import { useLenis } from "@/hooks/use-lenis";
import { ScrollTrigger } from "@/lib/gsap";
import { loopLenis } from "@/lib/smooth-scroll-provider";

/**
 * Makes the page endless. `copy` repeats its start after its end and is kept
 * exactly one screen tall, so the page scrolls just as far as where the copy
 * begins: that is the period, and the copy looks the same there as the start
 * does at the top. Lenis then wraps its scroll at that limit (`infinite`, with
 * touch going through Lenis too, or a swipe would stop at the end); without
 * Lenis (reduced motion) the scroll jumps back one period at the end.
 */
export function useScrollLoop(copyRef: RefObject<HTMLElement | null>) {
  const lenis = useLenis();

  useEffect(() => {
    const copy = copyRef.current;
    if (!copy) return;
    const measure = () => {
      copy.style.height = `${window.innerHeight}px`;
      setLoopPeriod(copy.getBoundingClientRect().top + window.scrollY);
    };
    measure();
    // Pins and late fonts move the copy: ScrollTrigger refreshes after both.
    window.addEventListener("resize", measure);
    ScrollTrigger.addEventListener("refresh", measure);
    return () => {
      window.removeEventListener("resize", measure);
      ScrollTrigger.removeEventListener("refresh", measure);
      copy.style.height = "";
      setLoopPeriod(0);
    };
  }, [copyRef]);

  // Keys, the scrollbar and, without Lenis, every scroll move the page
  // natively, up to its end: there the view is the start's, so jump back
  // one period and they carry on. Lenis's own smooth scroll wraps itself.
  useEffect(() => {
    const wrap = () => {
      if (lenis?.isScrolling === "smooth") return;
      const period = getLoopPeriod();
      if (period > 0 && window.scrollY >= period - 1) {
        window.scrollTo({ top: window.scrollY - period, behavior: "instant" });
      }
    };
    window.addEventListener("scroll", wrap, { passive: true });
    return () => window.removeEventListener("scroll", wrap);
  }, [lenis]);

  useEffect(() => {
    if (!lenis) return;
    const unloop = loopLenis(lenis);
    // Lenis measures the page 250ms after it changes: a refresh (a pin
    // added or moved) has to reach its limit at once, or the wrap misses.
    const measure = () => lenis.dimensions.resize();
    ScrollTrigger.addEventListener("refresh", measure);
    return () => {
      ScrollTrigger.removeEventListener("refresh", measure);
      unloop();
    };
  }, [lenis]);
}
