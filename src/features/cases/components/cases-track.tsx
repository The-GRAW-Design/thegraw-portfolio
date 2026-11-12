"use client";

import Image from "next/image";
import Link from "next/link";
import { useRef, type ReactNode } from "react";
import { ComingSoon } from "@/components/ui/coming-soon";
import { GlareHover } from "@/components/ui/react-bits/glare-hover";
import { getProjectHref } from "@/constants/projects";
import { useReducedMotion } from "@/hooks/use-reduced-motion";
import { gsap, useGSAP } from "@/lib/gsap";
import type { Project } from "@/types/project";
import { cn } from "@/utils/cn";

/** Figma: the 2338px card row is centered on the 1920 frame. */
const START_OFFSET = -209 / 1920;
/** Pointer travel that turns a press into a drag (and cancels the click). */
const DRAG_THRESHOLD = 6;

type CasesTrackProps = {
  projects: readonly Project[];
  /** Classes of the row under the cards that holds the progress bar. */
  footerClassName?: string;
  /** Shown next to the progress bar (e.g. "view all"). */
  aside?: ReactNode;
  className?: string;
};

/**
 * Figma cases track (568×320 cards, 22px apart) with its progress bar: the
 * wheel and a drag move a target the track eases to; focused cards scroll
 * into view. Items carry `data-track-item` for entrance animations.
 */
export function CasesTrack({
  projects,
  footerClassName,
  aside,
  className,
}: CasesTrackProps) {
  const viewportRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLUListElement>(null);
  const thumbRef = useRef<HTMLSpanElement>(null);
  const reducedMotion = useReducedMotion();

  useGSAP(
    () => {
      const viewport = viewportRef.current;
      const track = trackRef.current;
      const thumb = thumbRef.current;
      if (!viewport || !track || !thumb) return;

      const range = () => Math.min(0, viewport.clientWidth - track.scrollWidth);
      const clamp = (value: number) => gsap.utils.clamp(range(), 0, value);
      let target = clamp(viewport.clientWidth * START_OFFSET);
      let x = target;
      let dragging: { pointer: number; start: number; from: number } | null =
        null;
      let dragged = false;

      const onWheel = (event: WheelEvent) => {
        // Vertical wheels scroll the page unless the track can still move.
        const delta =
          Math.abs(event.deltaX) > Math.abs(event.deltaY)
            ? event.deltaX
            : event.deltaY;
        const next = clamp(target - delta);
        if (next === target) return;
        event.preventDefault();
        target = next;
      };
      const onPointerDown = (event: PointerEvent) => {
        if (event.pointerType === "mouse" && event.button !== 0) return;
        dragging = {
          pointer: event.pointerId,
          start: event.clientX,
          from: target,
        };
        dragged = false;
      };
      const onPointerMove = (event: PointerEvent) => {
        if (dragging?.pointer !== event.pointerId) return;
        const distance = event.clientX - dragging.start;
        if (!dragged && Math.abs(distance) > DRAG_THRESHOLD) {
          dragged = true;
          viewport.setPointerCapture(event.pointerId);
        }
        if (dragged) target = clamp(dragging.from + distance);
      };
      const onPointerUp = () => {
        dragging = null;
      };
      // A drag must not open the card it started on.
      const onClick = (event: MouseEvent) => {
        if (!dragged) return;
        event.preventDefault();
        dragged = false;
      };
      const onFocusIn = (event: FocusEvent) => {
        const card = (event.target as HTMLElement).closest("li");
        if (!card) return;
        const left = card.offsetLeft + x;
        const right = left + card.offsetWidth;
        if (left < 0) target = clamp(target - left);
        else if (right > viewport.clientWidth)
          target = clamp(target - (right - viewport.clientWidth));
      };

      const tick = (_time: number, deltaTime: number) => {
        const ease = reducedMotion ? 1 : 1 - Math.pow(0.86, deltaTime / 16.67);
        x += (target - x) * ease;
        track.style.transform = `translate3d(${x.toFixed(2)}px, 0, 0)`;
        const min = range();
        const visible = Math.min(1, viewport.clientWidth / track.scrollWidth);
        const progress = min < 0 ? x / min : 0;
        thumb.style.width = `${visible * 100}%`;
        thumb.style.left = `${progress * (1 - visible) * 100}%`;
      };

      viewport.addEventListener("wheel", onWheel, { passive: false });
      viewport.addEventListener("pointerdown", onPointerDown);
      viewport.addEventListener("pointermove", onPointerMove);
      viewport.addEventListener("pointerup", onPointerUp);
      viewport.addEventListener("pointercancel", onPointerUp);
      viewport.addEventListener("click", onClick, true);
      viewport.addEventListener("focusin", onFocusIn);
      gsap.ticker.add(tick);
      return () => {
        gsap.ticker.remove(tick);
        viewport.removeEventListener("wheel", onWheel);
        viewport.removeEventListener("pointerdown", onPointerDown);
        viewport.removeEventListener("pointermove", onPointerMove);
        viewport.removeEventListener("pointerup", onPointerUp);
        viewport.removeEventListener("pointercancel", onPointerUp);
        viewport.removeEventListener("click", onClick, true);
        viewport.removeEventListener("focusin", onFocusIn);
      };
    },
    { dependencies: [projects, reducedMotion], revertOnUpdate: true },
  );

  return (
    <div className={cn("flex w-full flex-col items-center", className)}>
      <div
        ref={viewportRef}
        className="relative w-full cursor-grab touch-pan-y select-none active:cursor-grabbing"
      >
        <ul ref={trackRef} className="flex w-max gap-12 lg:gap-22">
          {projects.map((project) => (
            <li
              key={project.slug}
              data-track-item
              className="w-[72vw] shrink-0 lg:w-568"
            >
              <Link
                href={getProjectHref(project)}
                draggable={false}
                className="group relative block aspect-[568/320] overflow-hidden bg-gray-graw"
              >
                {project.cover ? (
                  <Image
                    src={project.cover}
                    alt={project.name}
                    fill
                    sizes="(min-width: 1024px) 30vw, 72vw"
                    draggable={false}
                    className="object-cover transition-transform duration-700 ease-power3 group-hover:scale-105 group-focus-visible:scale-105"
                  />
                ) : (
                  <>
                    <ComingSoon sizes="(min-width: 1024px) 30vw, 72vw" />
                    <span className="sr-only">{project.name}</span>
                  </>
                )}
                <GlareHover
                  borderRadius="0"
                  glareOpacity={0.25}
                  glareAngle={-35}
                  glareSize={40}
                  rimGlint={false}
                  transitionDuration={800}
                  className="absolute inset-0 border-0"
                />
              </Link>
            </li>
          ))}
        </ul>
      </div>
      <div
        data-track-item
        className={cn("flex items-center justify-between", footerClassName)}
      >
        <div aria-hidden className="relative h-4 w-[60vw] lg:w-609">
          <span className="absolute inset-x-0 top-1/2 h-2 -translate-y-1/2 rounded-full bg-track" />
          <span
            ref={thumbRef}
            className="absolute inset-y-0 left-0 w-1/3 rounded-full bg-red-graw"
          />
        </div>
        {aside}
      </div>
    </div>
  );
}
