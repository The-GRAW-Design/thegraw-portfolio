"use client";

import { useRef, type ElementType } from "react";
import { gsap, ScrollTrigger, SplitText, useGSAP } from "@/lib/gsap";
import { cn } from "@/utils/cn";

type TypeTextProps = {
  as?: ElementType;
  children: string;
  /** Seconds per letter, before the human jitter. */
  speed?: number;
  className?: string;
};

/** Seconds added before the first letter of each new word. */
const WORD_PAUSE = 0.12;
/** Seconds the caret stays on, then off. */
const BLINK = 0.5;

/**
 * When the text scrolls into view, a red caret types it letter by letter
 * (with a slight, fixed jitter and a beat between words) and keeps blinking
 * at the end. Reduced motion shows the text at once, without the caret.
 */
export function TypeText({
  as: Tag = "p",
  children,
  speed = 0.06,
  className,
}: TypeTextProps) {
  const ref = useRef<HTMLElement>(null);
  const textRef = useRef<HTMLSpanElement>(null);
  const caretRef = useRef<HTMLSpanElement>(null);

  useGSAP(
    () => {
      const element = ref.current;
      const text = textRef.current;
      const caret = caretRef.current;
      if (!element || !text || !caret) return;

      // When each letter appears: SplitText chars skip the spaces.
      const times: number[] = [];
      let clock = 0;
      [...children].forEach((char, index) => {
        if (/\s/.test(char)) {
          clock += WORD_PAUSE;
          return;
        }
        times.push(clock);
        clock += speed * (0.65 + ((index * 37) % 11) / 14);
      });

      const media = gsap.matchMedia();
      media.add(
        {
          motion: "(prefers-reduced-motion: no-preference)",
          reduced: "(prefers-reduced-motion: reduce)",
        },
        (context) => {
          gsap.set(element, { visibility: "visible" });
          if (context.conditions?.reduced) {
            gsap.set(caret, { display: "none" });
            return;
          }

          let chars: HTMLElement[] = [];
          let typed = 0;

          // The caret sits right after the last typed letter.
          const place = () => {
            const box = element.getBoundingClientRect();
            const last = chars[Math.max(0, typed - 1)];
            if (!last) return;
            const rect = last.getBoundingClientRect();
            gsap.set(caret, {
              x: (typed === 0 ? rect.left : rect.right) - box.left,
              y: rect.top - box.top + rect.height * 0.08,
              height: rect.height * 0.84,
            });
          };
          const show = () => {
            chars.forEach((char, index) =>
              gsap.set(char, { opacity: index < typed ? 1 : 0 }),
            );
            place();
          };

          const split = SplitText.create(text, {
            type: "words,chars",
            autoSplit: true,
            onSplit: (self) => {
              chars = self.chars as HTMLElement[];
              show();
            },
          });

          const blink = gsap.to(caret, {
            opacity: 0,
            duration: BLINK,
            ease: "steps(1)",
            repeat: -1,
            yoyo: true,
          });

          const typing = gsap.timeline({
            paused: true,
            onStart: () => {
              blink.pause();
              gsap.set(caret, { opacity: 1 });
            },
            onComplete: () => {
              blink.restart();
            },
          });
          times.forEach((time, index) =>
            typing.call(
              () => {
                typed = index + 1;
                show();
              },
              undefined,
              time,
            ),
          );

          const trigger = ScrollTrigger.create({
            trigger: element,
            start: "top 80%",
            once: true,
            onEnter: () => typing.play(),
          });
          const onResize = () => place();
          window.addEventListener("resize", onResize);

          return () => {
            window.removeEventListener("resize", onResize);
            trigger.kill();
            typing.kill();
            blink.kill();
            split.revert();
          };
        },
      );
      return () => media.revert();
    },
    { scope: ref, dependencies: [children, speed] },
  );

  return (
    <Tag
      ref={ref}
      aria-label={children}
      className={cn("invisible relative", className)}
    >
      <span ref={textRef} aria-hidden>
        {children}
      </span>
      <span
        ref={caretRef}
        aria-hidden
        className="pointer-events-none absolute top-0 left-0 w-[0.06em] bg-red-graw"
      />
    </Tag>
  );
}
