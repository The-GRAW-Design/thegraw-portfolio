"use client";

import { useEffect, useRef } from "react";
import { useReducedMotion } from "@/hooks/use-reduced-motion";
import { cn } from "@/utils/cn";

type PixelSwapProps = {
  /** The item to show; changing it plays the swap. */
  index: number;
  /** 1 sweeps from the left, -1 from the right. */
  direction: 1 | -1;
  /** Called while the pixels cover the frame, with the item to show. */
  onSwap: (index: number) => void;
  /** Pixel color: any CSS color, theme variables included. */
  color?: string;
  /** Columns of the pixel grid. */
  columns?: number;
  /** Seconds to cover and uncover. */
  duration?: number;
  className?: string;
};

/** 4×4 Bayer matrix: the dither order of the pixels. */
const BAYER = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5];
/** Weights of the sweep, the dither and the noise in each pixel's turn. */
const SWEEP = 0.55;
const DITHER = 0.3;
const NOISE = 0.15;

const hash = (x: number, y: number, seed: number) => {
  let h =
    Math.imul(x + 1, 0x27d4eb2d) ^
    Math.imul(y + 1, 0x165667b1) ^
    Math.imul(seed + 1, 0x2c1b3c6d);
  h = Math.imul(h ^ (h >>> 15), 0x85ebca6b);
  h = Math.imul(h ^ (h >>> 13), 0xc2b2ae35);
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
};

/**
 * A pixel-grid swap laid over a frame (after React Bits PixelTransition):
 * square pixels fill it in dither order, sweeping in the given direction, the
 * new item is put in place underneath, and the pixels clear in the same order.
 */
export function PixelSwap({
  index,
  direction,
  onSwap,
  color = "var(--color-black-graw)",
  columns = 22,
  duration = 0.9,
  className,
}: PixelSwapProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const reducedMotion = useReducedMotion();
  const onSwapRef = useRef(onSwap);
  const playRef = useRef<(next: number, sweep: 1 | -1) => void>(() => {});
  /** The index last asked for, so only a change plays the swap. */
  const shownRef = useRef(index);

  useEffect(() => {
    onSwapRef.current = onSwap;
  }, [onSwap]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d");
    if (!canvas || !context) return;

    const state = {
      progress: 1,
      target: 0,
      swapped: true,
      sweep: 1 as 1 | -1,
      seed: 1,
      fill: "#000",
    };
    let frame = 0;
    let last = 0;

    const resize = () => {
      const ratio = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.max(1, Math.round(canvas.clientWidth * ratio));
      canvas.height = Math.max(1, Math.round(canvas.clientHeight * ratio));
      draw();
    };

    const draw = () => {
      const { width, height } = canvas;
      context.clearRect(0, 0, width, height);
      const progress = state.progress;
      if (progress <= 0 || progress >= 1) return;
      const covering = progress < 0.5;
      const local = covering ? progress * 2 : progress * 2 - 1;
      const cell = width / columns;
      const rows = Math.ceil(height / cell);
      context.fillStyle = state.fill;
      context.beginPath();
      for (let row = 0; row < rows; row++) {
        for (let column = 0; column < columns; column++) {
          const across = (column + 0.5) / columns;
          const sweep = state.sweep === 1 ? across : 1 - across;
          const turn =
            sweep * SWEEP +
            (BAYER[(row & 3) * 4 + (column & 3)] / 16) * DITHER +
            hash(column, row, state.seed) * NOISE;
          // Covering: a pixel is in once its turn has come; uncovering: it
          // leaves in the same order.
          const filled = covering ? local >= turn : local < turn;
          if (!filled) continue;
          const left = Math.round(column * cell);
          const top = Math.round(row * cell);
          context.rect(
            left,
            top,
            Math.round((column + 1) * cell) - left,
            Math.round((row + 1) * cell) - top,
          );
        }
      }
      context.fill();
    };

    const tick = (now: number) => {
      frame = 0;
      const delta = last ? Math.min(0.1, (now - last) / 1000) : 1 / 60;
      last = now;
      state.progress = Math.min(1, state.progress + delta / duration);
      if (!state.swapped && state.progress >= 0.5) {
        state.swapped = true;
        onSwapRef.current(state.target);
      }
      draw();
      if (state.progress < 1) frame = requestAnimationFrame(tick);
    };

    playRef.current = (next, sweep) => {
      canvas.style.color = color;
      state.fill = getComputedStyle(canvas).color;
      state.target = next;
      if (state.progress >= 1) {
        state.progress = 0;
        state.sweep = sweep;
        state.seed = Math.floor(Math.random() * 65536);
      } else if (state.progress > 0.5) {
        // Uncovering already: cover again from the same amount.
        state.progress = 1 - state.progress;
      }
      state.swapped = false;
      if (!frame) {
        last = 0;
        frame = requestAnimationFrame(tick);
      }
    };

    const observer = new ResizeObserver(resize);
    observer.observe(canvas);
    resize();
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      playRef.current = () => {};
    };
  }, [color, columns, duration]);

  // Only a new index plays the swap.
  useEffect(() => {
    if (shownRef.current === index) return;
    shownRef.current = index;
    if (reducedMotion) onSwapRef.current(index);
    else playRef.current(index, direction);
  }, [index, direction, reducedMotion]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      className={cn(
        "pointer-events-none absolute inset-0 size-full",
        className,
      )}
    />
  );
}
