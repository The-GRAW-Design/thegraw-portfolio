"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useLayoutEffect, useRef } from "react";
import { registerPageTransition } from "@/features/page-transition/utils/controller";
import { EASE, gsap } from "@/lib/gsap";
import { getLenis } from "@/lib/smooth-scroll-provider";

/** Seconds each layer takes to cover the page, and the gap between them. */
const COVER = 0.7;
const LAYER_GAP = 0.1;
/** Seconds the curtain takes to leave. */
const REVEAL = 0.9;
/**
 * The curtain waits for the new page to get through its first paint (images,
 * dither bake): this many frames in a row under this many ms each, or until
 * this many ms went by.
 */
const STEADY_FRAMES = 4;
const STEADY_FRAME = 34;
const MAX_SETTLE = 700;
/** Longest wait for the new page before the curtain leaves anyway. */
const MAX_WAIT = 5;
/** A page change this soon after a history move is a back/forward one. */
const HISTORY_WINDOW = 1500;
/** Slant of the curtain edges, as a share of the viewport height. */
const SLANT = 0.24;

type Phase = "idle" | "covering" | "waiting" | "revealing";
type Controls = { reveal: () => void; coverNow: () => void };

const useIsomorphicLayoutEffect =
  typeof window !== "undefined" ? useLayoutEffect : useEffect;

const reducedMotion = () =>
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/** Calls back once frames flow steadily again; returns a way to give up. */
function whenSettled(callback: () => void) {
  const started = performance.now();
  let last = started;
  let steady = 0;
  let frame = requestAnimationFrame(function check(now) {
    steady = now - last < STEADY_FRAME ? steady + 1 : 0;
    last = now;
    if (steady >= STEADY_FRAMES || now - started > MAX_SETTLE) {
      callback();
      return;
    }
    frame = requestAnimationFrame(check);
  });
  return () => cancelAnimationFrame(frame);
}

/** Path of a link without its trailing slash, query or hash. */
function pagePath(href: string) {
  const { pathname } = new URL(href, window.location.origin);
  return pathname.replace(/\/+$/, "") || "/";
}

/**
 * Curtain between pages: a red and a black layer rise with a slanted edge
 * (the slant of the menu panel) and cover the page, the route changes behind
 * them, and the black one keeps rising to uncover the new page. Back and
 * forward, which cannot wait for the cover, only get the second half.
 */
export function PageTransition() {
  const rootRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  const router = useRouter();
  const phaseRef = useRef<Phase>("idle");
  const pathRef = useRef(pathname);
  const historyMoveRef = useRef(0);
  const controlsRef = useRef<Controls | null>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const [lead, cover] = gsap.utils.toArray<HTMLElement>(
      "[data-curtain]",
      root,
    );
    let wait: gsap.core.Tween | null = null;
    let cancelSettle: (() => void) | null = null;
    /** Travel that takes a layer, slant included, off the viewport. */
    const away = () => window.innerHeight * (1 + SLANT);

    const reveal = () => {
      wait?.kill();
      wait = null;
      phaseRef.current = "revealing";
      getLenis()?.start();
      // The black layer hides the red one, which leaves at once.
      gsap.set(lead, { y: () => -away() });
      cancelSettle?.();
      cancelSettle = whenSettled(() => {
        cancelSettle = null;
        gsap.to(cover, {
          y: () => -away(),
          duration: REVEAL,
          ease: EASE.inOut,
          overwrite: true,
          onComplete: () => {
            gsap.set(root, { visibility: "hidden" });
            phaseRef.current = "idle";
          },
        });
      });
    };

    const coverNow = () => {
      gsap.killTweensOf([lead, cover]);
      gsap.set([lead, cover], { y: 0 });
      gsap.set(root, { visibility: "visible" });
    };

    const start = (href: string) => {
      phaseRef.current = "covering";
      getLenis()?.stop();
      router.prefetch(href);
      gsap.set(root, { visibility: "visible" });
      gsap
        .timeline({ defaults: { duration: COVER, ease: EASE.inOut } })
        .fromTo(lead, { y: () => away() }, { y: 0 })
        .fromTo(cover, { y: () => away() }, { y: 0 }, LAYER_GAP)
        .call(() => {
          phaseRef.current = "waiting";
          router.push(href);
          wait = gsap.delayedCall(MAX_WAIT, reveal);
        });
    };

    controlsRef.current = { reveal, coverNow };
    const unregister = registerPageTransition((href) => {
      if (reducedMotion()) return false;
      // A click during a transition is swallowed: one page change at a time.
      if (phaseRef.current !== "idle") return true;
      if (pagePath(href) === pathRef.current) return false;
      start(href);
      return true;
    });
    const onHistoryMove = () => {
      historyMoveRef.current = performance.now();
    };
    window.addEventListener("popstate", onHistoryMove);

    return () => {
      unregister();
      window.removeEventListener("popstate", onHistoryMove);
      controlsRef.current = null;
      wait?.kill();
      cancelSettle?.();
      gsap.killTweensOf([lead, cover]);
    };
  }, [router]);

  // The new page is in place: uncover it before the browser paints it.
  useIsomorphicLayoutEffect(() => {
    const path = pathname.replace(/\/+$/, "") || "/";
    if (path === pathRef.current) return;
    pathRef.current = path;

    const controls = controlsRef.current;
    if (!controls) return;
    if (phaseRef.current === "waiting") {
      controls.reveal();
      return;
    }
    const historyMove =
      performance.now() - historyMoveRef.current < HISTORY_WINDOW;
    if (phaseRef.current === "idle" && historyMove && !reducedMotion()) {
      controls.coverNow();
      controls.reveal();
    }
  }, [pathname]);

  return (
    <div
      ref={rootRef}
      aria-hidden
      className="invisible fixed inset-0 z-60 overflow-hidden [--slant:24svh]"
    >
      {["bg-red-graw", "bg-black-graw"].map((tone) => (
        <div
          key={tone}
          data-curtain
          className={`absolute inset-x-0 top-[calc(var(--slant)*-1)] h-[calc(100%+var(--slant)*2)] will-change-transform [clip-path:polygon(0_0,100%_var(--slant),100%_100%,0_calc(100%-var(--slant)))] ${tone}`}
        />
      ))}
    </div>
  );
}
