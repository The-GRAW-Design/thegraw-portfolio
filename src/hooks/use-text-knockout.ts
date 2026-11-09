"use client";

import { useEffect, type RefObject } from "react";
import { EASE, gsap, ScrollTrigger } from "@/lib/gsap";

/** Opacity of the layer inside the glyphs: 1 = solid, 0 = see-through. */
const FILL = "--knockout-fill";
/** Room around the text for glyph ink past its boxes, in em. */
const BLEED = 0.3;

type Box = { left: number; top: number; width: number; height: number };

/** Every glyph of the texts, drawn opaque on transparent where it is laid out. */
function drawGlyphs(texts: HTMLElement[], area: Box) {
  const ratio = Math.min(window.devicePixelRatio, 2);
  const canvas = document.createElement("canvas");
  canvas.width = Math.ceil(area.width * ratio);
  canvas.height = Math.ceil(area.height * ratio);
  const context = canvas.getContext("2d");
  if (!context) return null;
  context.scale(ratio, ratio);

  const range = document.createRange();
  texts.forEach((element) => {
    const style = getComputedStyle(element);
    context.font = `${style.fontStyle} ${style.fontWeight} ${style.fontSize} ${style.fontFamily}`;
    const { fontBoundingBoxAscent: ascent } = context.measureText("M");
    const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT);
    for (let node = walker.nextNode(); node; node = walker.nextNode()) {
      const text = node.textContent ?? "";
      for (let index = 0; index < text.length; index++) {
        if (/\s/.test(text[index])) continue;
        range.setStart(node, index);
        range.setEnd(node, index + 1);
        // The layout already holds kerning, tracking and line wraps.
        const rect = range.getClientRects()[0];
        if (!rect) continue;
        context.fillText(
          text[index],
          rect.left - area.left,
          rect.top - area.top + ascent,
        );
      }
    }
  });
  return canvas.toDataURL();
}

/**
 * Cuts texts out of an opaque layer, like the menu words on hover: the
 * glyphs show what is behind the section, blurred by a glass placed under
 * them. The cut opens when the section scrolls in. Without mask compositing
 * the texts simply stay visible.
 *
 * Inside `rootRef`: `[data-knockout-layer]` (the opaque layer),
 * `[data-knockout-glass]` (the blur, before the layer) and the
 * `[data-knockout-text]` elements.
 */
export function useTextKnockout(rootRef: RefObject<HTMLElement | null>) {
  useEffect(() => {
    const root = rootRef.current;
    const layer = root?.querySelector<HTMLElement>("[data-knockout-layer]");
    const glass = root?.querySelector<HTMLElement>("[data-knockout-glass]");
    const texts = Array.from(
      root?.querySelectorAll<HTMLElement>("[data-knockout-text]") ?? [],
    );
    if (!root || !layer || !glass || texts.length === 0) return;
    if (!CSS.supports("mask-composite", "subtract")) return;

    let cancelled = false;
    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    layer.style.setProperty(FILL, reduced ? "0" : "1");

    const draw = () => {
      if (cancelled) return;
      const origin = root.getBoundingClientRect();
      const bleed =
        Math.max(
          ...texts.map((text) => parseFloat(getComputedStyle(text).fontSize)),
        ) * BLEED;
      const boxes = texts.map((text) => text.getBoundingClientRect());
      const left = Math.min(...boxes.map((box) => box.left)) - bleed;
      const top = Math.min(...boxes.map((box) => box.top)) - bleed;
      const area = {
        left,
        top,
        width: Math.max(...boxes.map((box) => box.right)) + bleed - left,
        height: Math.max(...boxes.map((box) => box.bottom)) + bleed - top,
      };
      const url = drawGlyphs(texts, area);
      if (!url) return;

      const x = area.left - origin.left;
      const y = area.top - origin.top;
      // Top to bottom: see-through amount, whole layer, minus the glyphs.
      layer.style.setProperty(
        "mask-image",
        `linear-gradient(rgb(0 0 0 / var(${FILL})) 0 0), linear-gradient(#000 0 0), url(${url})`,
      );
      layer.style.setProperty("mask-composite", "add, subtract, add");
      layer.style.setProperty("mask-repeat", "no-repeat");
      layer.style.setProperty(
        "mask-size",
        `100% 100%, 100% 100%, ${area.width}px ${area.height}px`,
      );
      layer.style.setProperty("mask-position", `0 0, 0 0, ${x}px ${y}px`);
      Object.assign(glass.style, {
        left: `${x}px`,
        top: `${y}px`,
        width: `${area.width}px`,
        height: `${area.height}px`,
      });
      // The cut takes over from the texts themselves.
      texts.forEach((text) => (text.style.color = "transparent"));
    };

    void document.fonts.ready.then(draw);
    const observer = new ResizeObserver(() => draw());
    observer.observe(root);

    const trigger = reduced
      ? null
      : ScrollTrigger.create({
          trigger: root,
          start: "top 75%",
          once: true,
          onEnter: () =>
            gsap.to(layer, {
              [FILL]: 0,
              duration: 1.2,
              ease: EASE.out,
            }),
        });

    return () => {
      cancelled = true;
      observer.disconnect();
      trigger?.kill();
      gsap.killTweensOf(layer);
      [
        "mask-image",
        "mask-composite",
        "mask-repeat",
        "mask-size",
        "mask-position",
        FILL,
      ].forEach((property) => layer.style.removeProperty(property));
      texts.forEach((text) => text.style.removeProperty("color"));
    };
  }, [rootRef]);
}
