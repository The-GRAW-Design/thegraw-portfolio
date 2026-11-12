"use client";

import Link from "next/link";
import { useEffect, useRef, useState, type RefObject } from "react";
import { ShuffleText } from "@/components/ui/shuffle-text";
import { CASES_PAGE } from "@/constants/cases";
import { CASES_DRAWER_DITHER } from "@/constants/dither";
import { CasesTrack } from "@/features/cases/components/cases-track";
import { DitherImage } from "@/features/dither-image";
import { useReducedMotion } from "@/hooks/use-reduced-motion";
import { DURATION, EASE, gsap, useGSAP } from "@/lib/gsap";
import type { Project } from "@/types/project";

type CasesDrawerProps = {
  open: boolean;
  onClose: () => void;
  projects: readonly Project[];
  returnFocusRef: RefObject<HTMLElement | null>;
};

/**
 * Figma "Cases - all view": the page blurs and a panel rises with every case
 * on a horizontal track (wheel, drag or keyboard) and its progress bar.
 */
export function CasesDrawer({
  open,
  onClose,
  projects,
  returnFocusRef,
}: CasesDrawerProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(open);
  const reducedMotion = useReducedMotion();
  if (open && !mounted) setMounted(true);

  // Enter and leave.
  useGSAP(
    () => {
      if (!mounted) return;
      const timeline = gsap.timeline({ defaults: { ease: EASE.expo } });
      if (open) {
        timeline
          .fromTo(
            "[data-drawer-veil]",
            { autoAlpha: 0 },
            { autoAlpha: 1, duration: 0.6, ease: EASE.out },
          )
          .fromTo(
            "[data-drawer-panel]",
            { yPercent: 100 },
            { yPercent: 0, duration: DURATION.enterSlow },
            0,
          )
          .fromTo(
            "[data-drawer-item], [data-track-item]",
            { y: 60, autoAlpha: 0 },
            { y: 0, autoAlpha: 1, duration: DURATION.enter, stagger: 0.04 },
            0.25,
          );
      } else {
        timeline
          .to("[data-drawer-panel]", {
            yPercent: 100,
            duration: 0.8,
            ease: EASE.inOut,
            overwrite: "auto",
          })
          .to(
            "[data-drawer-veil]",
            {
              autoAlpha: 0,
              duration: 0.6,
              ease: EASE.inOut,
              overwrite: "auto",
            },
            0.2,
          )
          .call(() => setMounted(false));
      }
      if (reducedMotion) timeline.progress(1);
    },
    { scope: rootRef, dependencies: [open, mounted, reducedMotion] },
  );

  // Focus, Escape and the page behind.
  useEffect(() => {
    if (!open) return;
    const returnTo = returnFocusRef.current;
    // The panel still sits below the fold: focusing must not scroll the stage.
    rootRef.current
      ?.querySelector<HTMLElement>("a")
      ?.focus({ preventScroll: true });
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      returnTo?.focus({ preventScroll: true });
    };
  }, [open, onClose, returnFocusRef]);

  if (!mounted) return null;

  return (
    <div
      ref={rootRef}
      role="dialog"
      aria-modal="true"
      aria-label={CASES_PAGE.viewAll}
      className="fixed inset-0 z-45"
    >
      <div
        data-drawer-veil
        aria-hidden
        className="invisible absolute inset-0 backdrop-blur-veil"
        onClick={onClose}
      />
      <div
        data-drawer-panel
        className="absolute inset-x-0 bottom-0 flex flex-col items-center overflow-hidden bg-paper pt-32 pb-40 lg:h-620 lg:pt-39 lg:pb-0"
      >
        <DitherImage {...CASES_DRAWER_DITHER} animation="intro" />
        <Link
          data-drawer-item
          href="/cases/all"
          className="group relative text-more text-red-graw"
        >
          <ShuffleText>{CASES_PAGE.viewAll}</ShuffleText>
        </Link>
        <CasesTrack
          projects={projects}
          className="relative mt-32 gap-32 lg:mt-77 lg:gap-77"
        />
      </div>
    </div>
  );
}
