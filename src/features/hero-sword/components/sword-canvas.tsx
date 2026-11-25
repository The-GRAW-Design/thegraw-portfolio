"use client";

import { useRef } from "react";
import { useSwordScene } from "@/features/hero-sword/hooks/use-sword-scene";

/** Fixed, see-through layer over the hero stack, under the header. */
export function SwordCanvas() {
  const containerRef = useRef<HTMLDivElement>(null);
  useSwordScene(containerRef);

  return (
    <div
      ref={containerRef}
      aria-hidden
      className="pointer-events-none fixed inset-0 z-30"
    />
  );
}
