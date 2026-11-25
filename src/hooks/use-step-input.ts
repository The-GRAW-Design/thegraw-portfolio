"use client";

import { useEffect, useEffectEvent, type RefObject } from "react";

/** Wheel distance that counts as one step. */
const WHEEL_THRESHOLD = 26;
/** Touch swipe distance that counts as one step. */
const SWIPE_THRESHOLD = 40;
/** Pause after a step, so one notch or swipe moves one project. */
const COOLDOWN = 140;
/** A weaker wheel event this soon after the last one is the trackpad's inertia. */
const INERTIA_WINDOW = 110;

type Step = 1 | -1;

/**
 * Turns wheel, trackpad, touch swipes and the up/down arrow keys into single
 * steps (one project or panel at a time), ignoring the inertia tail of
 * trackpads. While enabled they don't scroll the page. `enabled` can also be
 * a check run on each event (the input then passes through while it is false).
 */
export function useStepInput(
  ref: RefObject<HTMLElement | null>,
  onStep: (step: Step) => void,
  enabled: boolean | (() => boolean) = true,
) {
  const step = useEffectEvent(onStep);
  const active = useEffectEvent(() =>
    typeof enabled === "function" ? enabled() : enabled,
  );
  const attached = enabled !== false;

  useEffect(() => {
    const element = ref.current;
    if (!element || !attached) return;

    let total = 0;
    let blockedUntil = 0;
    let lastSize = 0;
    let lastDirection = 0;
    let tailUntil = 0;

    const commit = (direction: Step, now: number) => {
      total = 0;
      blockedUntil = now + COOLDOWN;
      tailUntil = now + INERTIA_WINDOW;
      step(direction);
    };

    const onWheel = (event: WheelEvent) => {
      if (!active()) return;
      event.preventDefault();
      const now = performance.now();
      const size = Math.abs(event.deltaY);
      const direction = Math.sign(event.deltaY);
      if (!direction) return;

      const inertia =
        now < tailUntil && direction === lastDirection && size < lastSize;
      lastSize = size;
      lastDirection = direction;
      tailUntil = now + INERTIA_WINDOW;
      if (now < blockedUntil || inertia) {
        total = 0;
        return;
      }

      total += event.deltaY;
      if (Math.abs(total) >= WHEEL_THRESHOLD) commit(total > 0 ? 1 : -1, now);
    };

    let touchStart = 0;
    let swiped = false;
    const onTouchStart = (event: TouchEvent) => {
      touchStart = event.touches[0]?.clientY ?? 0;
      swiped = false;
    };
    const onTouchMove = (event: TouchEvent) => {
      if (!active()) return;
      event.preventDefault();
      const now = performance.now();
      if (swiped || now < blockedUntil) return;
      const distance = touchStart - (event.touches[0]?.clientY ?? touchStart);
      if (Math.abs(distance) < SWIPE_THRESHOLD) return;
      swiped = true;
      commit(distance > 0 ? 1 : -1, now);
    };

    const onKeyDown = (event: KeyboardEvent) => {
      if (!active()) return;
      if (event.altKey || event.ctrlKey || event.metaKey || event.shiftKey)
        return;
      const direction =
        event.key === "ArrowDown" || event.key === "PageDown"
          ? 1
          : event.key === "ArrowUp" || event.key === "PageUp"
            ? -1
            : 0;
      if (!direction) return;
      const target = event.target as HTMLElement | null;
      if (target?.closest("input, textarea, select, [contenteditable]")) return;
      event.preventDefault();
      const now = performance.now();
      if (now >= blockedUntil) commit(direction, now);
    };

    element.addEventListener("wheel", onWheel, { passive: false });
    element.addEventListener("touchstart", onTouchStart, { passive: true });
    element.addEventListener("touchmove", onTouchMove, { passive: false });
    window.addEventListener("keydown", onKeyDown);
    return () => {
      element.removeEventListener("wheel", onWheel);
      element.removeEventListener("touchstart", onTouchStart);
      element.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [ref, attached]);
}
