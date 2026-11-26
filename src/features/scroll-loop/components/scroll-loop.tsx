"use client";

import { useRef, type ReactNode } from "react";
import { useScrollLoop } from "@/features/scroll-loop/hooks/use-scroll-loop";

type ScrollLoopProps = {
  /**
   * One turn of the page. It is rendered twice: `copy` is false for the real
   * one and true for the repeat of its start below it, which must look the
   * same as the start at rest (no pins, nothing focusable).
   */
  children: (copy: boolean) => ReactNode;
  className?: string;
};

/**
 * A page that scrolls without end: past its end it carries on from its start
 * and, going up from the start, from its end. The repeat is one screen tall
 * and hidden from assistive tech; its links and buttons still answer clicks,
 * since it is on screen just before the page wraps.
 */
export function ScrollLoop({ children, className }: ScrollLoopProps) {
  const copyRef = useRef<HTMLDivElement>(null);
  useScrollLoop(copyRef);

  return (
    <div className={className}>
      {children(false)}
      <div ref={copyRef} aria-hidden className="h-lvh overflow-hidden">
        {children(true)}
      </div>
    </div>
  );
}
