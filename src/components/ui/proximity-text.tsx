"use client";

import { useEffect, useRef } from "react";
import { useReducedMotion } from "@/hooks/use-reduced-motion";
import { EASE, gsap, useGSAP } from "@/lib/gsap";

type ProximityTextProps = {
  as?: "h1" | "h2" | "h3" | "p" | "span";
  children: string;
  /** Play the entrance on mount or when the text scrolls into view. */
  trigger?: "load" | "scroll";
  /** Seconds before the first letter moves. */
  delay?: number;
  className?: string;
};

/** Seconds between letters as they come in. */
const STAGGER = 0.03;
/** Hover reach, in font sizes from the cursor. */
const REACH = 1.4;
/** How far the closest letter lifts (share of its height) and grows. */
const LIFT = 14;
const GROW = 0.06;
/** Share of the eased distance covered per 60fps frame. */
const FOLLOW = 0.16;

/**
 * Large text whose letters rise into place out of a blur, one after the
 * other, and then answer the cursor: the letters near it lift, grow a little
 * and turn red, easing back as it moves away.
 */
export function ProximityText({
  as: Tag = "p",
  children,
  trigger = "scroll",
  delay = 0,
  className,
}: ProximityTextProps) {
  const rootRef = useRef<HTMLElement>(null);
  const reducedMotion = useReducedMotion();
  const words = children.split(" ");

  // Each letter sits in its own box, which drops the font's kerning: put it
  // back as a margin (in em, so it follows the fluid size), measured on the
  // real font once it has loaded.
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    let cancelled = false;
    const kern = () => {
      if (cancelled) return;
      const probe = document.createElement("span");
      probe.style.cssText =
        "position:absolute;left:0;top:0;visibility:hidden;white-space:pre";
      root.appendChild(probe);
      const width = (text: string) => {
        probe.textContent = text;
        return probe.getBoundingClientRect().width;
      };
      const size = parseFloat(getComputedStyle(root).fontSize) || 1;
      root.querySelectorAll<HTMLElement>("[data-word]").forEach((word) => {
        const letters = Array.from(
          word.querySelectorAll<HTMLElement>("[data-letter]"),
        );
        letters.forEach((letter, index) => {
          const next = letters[index + 1];
          const pair = next
            ? (letter.textContent ?? "") + next.textContent
            : "";
          const offset = next
            ? width(pair) -
              width(letter.textContent ?? "") -
              width(next.textContent ?? "")
            : 0;
          letter.style.marginRight =
            Math.abs(offset) > 0.01 ? `${(offset / size).toFixed(4)}em` : "";
        });
      });
      probe.remove();
    };
    document.fonts.ready.then(kern);
    return () => {
      cancelled = true;
    };
  }, [children]);

  useGSAP(
    () => {
      const root = rootRef.current;
      if (!root || reducedMotion) return;

      const letters = gsap.utils.toArray<HTMLElement>("[data-letter]", root);
      gsap.from(letters, {
        yPercent: 70,
        autoAlpha: 0,
        filter: "blur(12px)",
        duration: 1.1,
        ease: EASE.expo,
        stagger: STAGGER,
        delay,
        clearProps: "filter",
        scrollTrigger:
          trigger === "scroll"
            ? { trigger: root, start: "top 85%", once: true }
            : undefined,
      });

      // Hover: only with a mouse.
      if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches)
        return;
      const glyphs = gsap.utils.toArray<HTMLElement>("[data-glyph]", root);
      const amounts = glyphs.map(() => 0);
      const pointer = { x: 0, y: 0, inside: false };
      let running = false;

      const tick = (_time: number, deltaTime: number) => {
        const reach =
          parseFloat(getComputedStyle(root).fontSize) * REACH || 100;
        const ease = 1 - Math.pow(1 - FOLLOW, deltaTime / (1000 / 60));
        // Read every box first (the letter wrappers, which the hover does
        // not move), then write: one layout per frame.
        const boxes = pointer.inside
          ? letters.map((letter) => letter.getBoundingClientRect())
          : null;
        let moving = false;
        glyphs.forEach((glyph, index) => {
          let goal = 0;
          if (boxes) {
            const box = boxes[index];
            const distance = Math.hypot(
              pointer.x - (box.left + box.width / 2),
              pointer.y - (box.top + box.height / 2),
            );
            goal = Math.max(0, 1 - distance / reach);
            goal = goal * goal * (3 - 2 * goal);
          }
          amounts[index] += (goal - amounts[index]) * ease;
          if (Math.abs(goal - amounts[index]) > 0.001) moving = true;
          else amounts[index] = goal;
          const amount = amounts[index];
          glyph.style.transform =
            amount > 0
              ? `translateY(${(-LIFT * amount).toFixed(2)}%) scale(${(1 + GROW * amount).toFixed(4)})`
              : "";
          glyph.style.color =
            amount > 0.01
              ? `color-mix(in srgb, var(--color-red-graw) ${(amount * 100).toFixed(1)}%, currentColor)`
              : "";
        });
        if (!moving && !pointer.inside) {
          gsap.ticker.remove(tick);
          running = false;
        }
      };
      const start = () => {
        if (running) return;
        running = true;
        gsap.ticker.add(tick);
      };
      const onMove = (event: PointerEvent) => {
        if (event.pointerType !== "mouse") return;
        pointer.x = event.clientX;
        pointer.y = event.clientY;
        pointer.inside = true;
        start();
      };
      const onLeave = () => {
        pointer.inside = false;
        start();
      };

      root.addEventListener("pointermove", onMove);
      root.addEventListener("pointerleave", onLeave);
      return () => {
        gsap.ticker.remove(tick);
        root.removeEventListener("pointermove", onMove);
        root.removeEventListener("pointerleave", onLeave);
      };
    },
    { scope: rootRef, dependencies: [children, reducedMotion] },
  );

  return (
    <Tag
      ref={(element: HTMLElement | null) => {
        rootRef.current = element;
      }}
      aria-label={children}
      className={className}
    >
      {words.map((word, wordIndex) => (
        <span key={wordIndex} aria-hidden>
          {wordIndex > 0 && " "}
          <span data-word className="inline-block whitespace-nowrap">
            {Array.from(word).map((letter, letterIndex) => (
              <span key={letterIndex} data-letter className="inline-block">
                <span
                  data-glyph
                  className="inline-block origin-[50%_100%] will-change-transform"
                >
                  {letter}
                </span>
              </span>
            ))}
          </span>
        </span>
      ))}
    </Tag>
  );
}
