"use client";

import { useCallback, useEffect, useRef, type RefObject } from "react";
import { EASE, gsap } from "@/lib/gsap";

/** Time between blinks, in ms. */
const BLINK_EVERY = 1600;
/** How long the pieces stay away after a shake, in ms. */
const SHAKE_AWAY = 1100;
/** Shake energy that sends the pieces away. */
const SHAKE_ENERGY = 260;
/** Show and hide, in seconds. */
const SHOW = 0.6;
/** The hovered piece: fade and pop, in seconds. */
const HOVER_FADE = 0.24;
const HOVER_POP = 0.78;
/** Opacity of a resting piece (the hovered one goes to 1). */
export const REST_OPACITY = 0.9;
const HOVER_SCALE = 1.04;
const HIDDEN_SCALE = 0.88;

type PieceVisibilityOptions = {
  stageRef: RefObject<HTMLElement | null>;
  /** Per case, the inner element of each piece (the one that fades and scales). */
  innerRefs: RefObject<(HTMLElement | null)[][]>;
  /** The case on stage, an index into `innerRefs`. */
  activeIndex: number;
  /** Changes whenever a new case takes the stage. */
  caseKey: string;
  reducedMotion: boolean;
};

/**
 * Visibility of the collage pieces, as on julia-paternostro.com: every case
 * arrives with all of them in place, then one or two blink out at a time
 * while it rests, the one under the cursor pops forward (and comes back if it
 * had blinked out), and shaking the mouse sends them all away for a moment.
 */
export function usePieceVisibility({
  stageRef,
  innerRefs,
  activeIndex,
  caseKey,
  reducedMotion,
}: PieceVisibilityOptions) {
  /** The hovered piece, which pushes the others away. */
  const repelRef = useRef<number | null>(null);
  const hoverRef = useRef<(index: number, entering: boolean) => void>(() => {});

  useEffect(() => {
    const stage = stageRef.current;
    const inners = innerRefs.current[activeIndex] ?? [];
    const elements = inners.filter((element) => element !== null);
    const count = inners.length;
    if (!stage || elements.length === 0) return;

    if (reducedMotion) {
      gsap.set(elements, { opacity: 1, scale: 1 });
      return;
    }

    let shown = false;
    let blinking = new Set<number>();
    let hovered: number | null = null;
    let delays = inners.map(() => 0);
    let blinkTimer = 0;
    let showTimer = 0;

    const apply = (index: number) => {
      const element = inners[index];
      if (!element) return;
      const isHovered = hovered === index;
      const visible = shown && (!blinking.has(index) || isHovered);
      const delay = shown && !isHovered ? delays[index] : 0;
      gsap.killTweensOf(element);
      gsap.to(element, {
        opacity: visible ? (isHovered ? 1 : REST_OPACITY) : 0,
        duration: isHovered ? HOVER_FADE : SHOW,
        delay,
        ease: EASE.expo,
      });
      gsap.to(element, {
        scale: visible ? (isHovered ? HOVER_SCALE : 1) : HIDDEN_SCALE,
        duration: isHovered ? HOVER_POP : SHOW,
        delay,
        ease: EASE.expo,
      });
    };
    const applyAll = () => inners.forEach((_, index) => apply(index));

    const blink = () => {
      const next = new Set<number>();
      const size = Math.min(1 + Math.round(Math.random()), count - 1);
      while (next.size < size) next.add(Math.floor(Math.random() * count));
      blinking = next;
      applyAll();
    };
    const startBlinking = () => {
      window.clearInterval(blinkTimer);
      if (count > 1) blinkTimer = window.setInterval(blink, BLINK_EVERY);
    };
    const show = () => {
      shown = true;
      delays = inners.map(() => 0.012 + 0.11 * Math.random());
      applyAll();
      startBlinking();
    };
    const hide = () => {
      shown = false;
      blinking = new Set();
      hovered = null;
      window.clearInterval(blinkTimer);
      window.clearTimeout(showTimer);
      applyAll();
      showTimer = window.setTimeout(show, SHAKE_AWAY);
    };

    // A new case arrives with all its pieces in place; they blink later.
    gsap.killTweensOf(elements);
    gsap.set(elements, { opacity: REST_OPACITY, scale: 1 });
    shown = true;
    startBlinking();

    hoverRef.current = (index, entering) => {
      if (!entering && hovered !== index) return;
      const previous = hovered;
      hovered = entering ? index : null;
      if (previous !== null && previous !== index) apply(previous);
      apply(index);
    };

    // Shaking the mouse (fast moves, sudden turns) sends the pieces away.
    const motion = { x: 0, y: 0, dx: 0, dy: 0, energy: 0 };
    const onPointerMove = (event: PointerEvent) => {
      if (event.pointerType !== "mouse") return;
      const dx = event.clientX - motion.x;
      const dy = event.clientY - motion.y;
      const turned = dx * motion.dx < 0 || dy * motion.dy < 0;
      motion.energy =
        motion.energy * 0.86 + Math.hypot(dx, dy) * (turned ? 2.2 : 0.4);
      motion.x = event.clientX;
      motion.y = event.clientY;
      motion.dx = dx;
      motion.dy = dy;
      if (motion.energy > SHAKE_ENERGY && shown) {
        motion.energy = 0;
        hide();
      }
    };

    stage.addEventListener("pointermove", onPointerMove);
    return () => {
      stage.removeEventListener("pointermove", onPointerMove);
      window.clearInterval(blinkTimer);
      window.clearTimeout(showTimer);
      hoverRef.current = () => {};
      // Leaving the stage, every piece comes back, so the case is whole
      // whenever it shows up again.
      gsap.killTweensOf(elements);
      gsap.to(elements, {
        opacity: REST_OPACITY,
        scale: 1,
        duration: SHOW,
        ease: EASE.expo,
      });
    };
  }, [stageRef, innerRefs, activeIndex, caseKey, reducedMotion]);

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
