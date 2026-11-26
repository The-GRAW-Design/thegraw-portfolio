"use client";

import { useRef } from "react";
import { useDitherAnimation } from "@/features/dither-image/hooks/use-dither-animation";
import { useDitherScene } from "@/features/dither-image/hooks/use-dither-scene";
import type {
  DitherAnimation,
  DitherDisturbance,
  DitherFrame,
  DitherPalette,
  DitherQuantize,
} from "@/features/dither-image/types";

type DitherCanvasProps = {
  src: string;
  video?: string;
  palette: DitherPalette;
  pixelSize: number;
  opacity: number;
  offset: number;
  scatter: number;
  quantize: DitherQuantize;
  levels: number;
  brightness: number;
  contrast: number;
  frame: DitherFrame;
  animation: DitherAnimation;
  disturbance?: DitherDisturbance;
  coveredBy?: string;
};

export function DitherCanvas({
  animation,
  disturbance,
  coveredBy,
  ...sceneOptions
}: DitherCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const uniforms = useDitherScene(containerRef, {
    ...sceneOptions,
    continuous: animation !== "none",
    disturbance,
  });

  useDitherAnimation(containerRef, uniforms, animation, coveredBy);

  return <div ref={containerRef} className="absolute inset-0" />;
}
