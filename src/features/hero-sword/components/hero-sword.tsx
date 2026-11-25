"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef } from "react";
import { useWebGLSupport } from "@/features/dither-image/hooks/use-webgl-support";
import { useReducedMotion } from "@/hooks/use-reduced-motion";

const SwordCanvas = dynamic(
  () =>
    import("@/features/hero-sword/components/sword-canvas").then(
      (module) => module.SwordCanvas,
    ),
  { ssr: false },
);

/**
 * The home sword: in 3D (Three.js) with WebGL and motion; otherwise the
 * sword slots show the Figma image. Goes inside `[data-hero-stack]`, which
 * holds the `[data-sword-slot]` boxes.
 */
export function HeroSword() {
  const markerRef = useRef<HTMLSpanElement>(null);
  const webgl = useWebGLSupport();
  const reducedMotion = useReducedMotion();
  const live = webgl === true && !reducedMotion;

  useEffect(() => {
    const stack = markerRef.current?.closest<HTMLElement>("[data-hero-stack]");
    if (!stack || webgl === null || live) return;
    stack.dataset.sword = "static";
    return () => {
      delete stack.dataset.sword;
    };
  }, [webgl, live]);

  return (
    <>
      <span ref={markerRef} hidden />
      {live && <SwordCanvas />}
    </>
  );
}
