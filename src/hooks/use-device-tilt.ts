"use client";

import { useEffect, useRef } from "react";

/** Phone tilt mapped to -1–1 on each screen axis (x: right, y: down). */
export type DeviceTilt = { x: number; y: number };

/** Degrees of tilt from the resting hold for the full -1–1 range. */
const RANGE = 18;
/** Share of the way the resting hold follows the phone, per reading. */
const RECENTER = 0.004;

type OrientationWithPermission = typeof DeviceOrientationEvent & {
  requestPermission?: () => Promise<"granted" | "denied">;
};

const clamp = (value: number) => Math.min(1, Math.max(-1, value));

/**
 * How far the phone is tilted from the way it is being held: tilting it to
 * the left gives a negative x, tipping its top away a positive y. The resting
 * hold slowly follows the phone, so any comfortable angle reads as level.
 * Where the browser asks for permission (iOS), it does on the first tap.
 * Read `ref.current` in a frame loop.
 */
export function useDeviceTilt(enabled: boolean) {
  const tilt = useRef<DeviceTilt>({ x: 0, y: 0 });

  useEffect(() => {
    if (!enabled || typeof DeviceOrientationEvent === "undefined") return;

    const state = tilt.current;
    let rest: { x: number; y: number } | null = null;
    const onOrientation = (event: DeviceOrientationEvent) => {
      if (event.beta === null || event.gamma === null) return;
      // Device axes to screen axes, for the way the screen is turned.
      const angle = screen.orientation?.angle ?? 0;
      let x = event.gamma;
      let y = event.beta;
      if (angle === 90) [x, y] = [event.beta, -event.gamma];
      else if (angle === 180) [x, y] = [-event.gamma, -event.beta];
      else if (angle === 270) [x, y] = [-event.beta, event.gamma];

      rest ??= { x, y };
      rest.x += (x - rest.x) * RECENTER;
      rest.y += (y - rest.y) * RECENTER;
      state.x = clamp((x - rest.x) / RANGE);
      state.y = clamp((y - rest.y) / RANGE);
    };
    window.addEventListener("deviceorientation", onOrientation);

    // iOS (and newer Chromium) send readings only once a tap allows them.
    const Orientation = DeviceOrientationEvent as OrientationWithPermission;
    const gestures = ["touchend", "click"] as const;
    const stopAsking = () =>
      gestures.forEach((type) => window.removeEventListener(type, ask));
    const ask = () => {
      Orientation.requestPermission?.()
        .then(stopAsking)
        // Not a gesture the browser accepts: try again on the next one.
        .catch(() => {});
    };
    if (typeof Orientation.requestPermission === "function") {
      gestures.forEach((type) =>
        window.addEventListener(type, ask, { passive: true }),
      );
    }

    return () => {
      stopAsking();
      window.removeEventListener("deviceorientation", onOrientation);
      state.x = 0;
      state.y = 0;
    };
  }, [enabled]);

  return tilt;
}
