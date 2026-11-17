"use client";

import { useCallback, useEffect, useRef, type RefObject } from "react";
import { EASE, gsap } from "@/lib/gsap";

/** The hovered piece: fade and pop, in seconds. */
const HOVER_FADE = 0.24;
const HOVER_POP = 0.78;
/** Opacity of a resting piece (the hovered one goes to 1). */
export const REST_OPACITY = 0.9;
const HOVER_SCALE = 1.04;

type PieceVisibilityOptions = {
  /** Per case, the inner element of each piece (the one that fades and scales). */
  innerRefs: RefObject<(HTMLElement | null)[][]>;
  /** The case on stage, an index into `innerRefs`. */
  activeIndex: number;
  /** Changes whenever a new case takes the stage. */
  caseKey: string;
  reducedMotion: boolean;
};

/**
 * The collage pieces stay on screen all the time: the one under the cursor
 * pops forward and pushes the others away (`repelRef`, read by the frame
 * loop), as on julia-paternostro.com.
 */
export function usePieceVisibility({
  innerRefs,
  activeIndex,
  caseKey,
  reducedMotion,
}: PieceVisibilityOptions) {
  /** The hovered piece, which pushes the others away. */
  const repelRef = useRef<number | null>(null);
  const hoverRef = useRef<(index: number, entering: boolean) => void>(() => {});

  useEffect(() => {
    const inners = innerRefs.current[activeIndex] ?? [];
    const elements = inners.filter((element) => element !== null);
    if (elements.length === 0) return;

    gsap.killTweensOf(elements);
    gsap.set(elements, { opacity: REST_OPACITY, scale: 1 });
    if (reducedMotion) return;

    let hovered: number | null = null;
    const apply = (index: number) => {
      const element = inners[index];
      if (!element) return;
      const isHovered = hovered === index;
      gsap.killTweensOf(element);
      gsap.to(element, {
        opacity: isHovered ? 1 : REST_OPACITY,
        duration: HOVER_FADE,
        ease: EASE.expo,
      });
      gsap.to(element, {
        scale: isHovered ? HOVER_SCALE : 1,
        duration: HOVER_POP,
        ease: EASE.expo,
      });
    };

    hoverRef.current = (index, entering) => {
      if (!entering && hovered !== index) return;
      const previous = hovered;
      hovered = entering ? index : null;
      if (previous !== null && previous !== index) apply(previous);
      apply(index);
    };

    return () => {
      hoverRef.current = () => {};
      gsap.killTweensOf(elements);
      gsap.set(elements, { opacity: REST_OPACITY, scale: 1 });
    };
  }, [innerRefs, activeIndex, caseKey, reducedMotion]);

  const onPieceEnter = useCallback((index: number) => {
    repelRef.current = index;
    hoverRef.current(index, true);
  }, []);
  const onPieceLeave = useCallback((index: number) => {
    if (repelRef.current === index) repelRef.current = null;
    hoverRef.current(index, false);
  }, []);

  return { repelRef, onPieceEnter, onPieceLeave };
}
