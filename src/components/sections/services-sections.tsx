"use client";

import { useCallback, useRef, useState } from "react";
import { ServicesIntroSection } from "@/components/sections/services-intro-section";
import { ServicesMethodSection } from "@/components/sections/services-method-section";
import { ServicesProjectsSection } from "@/components/sections/services-projects-section";
import { SERVICES_PAGE } from "@/constants/services";
import { ScrollLoop } from "@/features/scroll-loop";
import type { ServiceId } from "@/types/project";

/** Milliseconds a strip stays still before the other copy follows it. */
const SETTLE = 120;

/**
 * Keeps the strips of both copies of the loop on the same slide: once one
 * stops scrolling sideways, the other jumps to it. Waiting for it to settle
 * keeps the snap of the follower from fighting a swipe still under way.
 */
function useLinkedStrips() {
  const viewports = useRef(new Set<HTMLElement>());
  return useCallback((viewport: HTMLElement) => {
    const all = viewports.current;
    let timer = 0;
    const settle = () => {
      window.clearTimeout(timer);
      timer = window.setTimeout(() => {
        all.forEach((other) => {
          if (other === viewport) return;
          if (Math.abs(other.scrollLeft - viewport.scrollLeft) > 1)
            other.scrollLeft = viewport.scrollLeft;
        });
      }, SETTLE);
    };
    all.add(viewport);
    viewport.addEventListener("scroll", settle, { passive: true });
    return () => {
      window.clearTimeout(timer);
      all.delete(viewport);
      viewport.removeEventListener("scroll", settle);
    };
  }, []);
}

/**
 * Figma "Services" 2.0: the services, the projects and how the studio works,
 * on and on: past "Idealização" the page carries on from the start (desktop
 * and phones), its repeat sharing the selected service.
 */
export function ServicesSections() {
  const [active, setActive] = useState<ServiceId>(SERVICES_PAGE.defaultService);
  const linkStrip = useLinkedStrips();

  return (
    <ScrollLoop className="font-flex text-white">
      {(copy) => (
        <>
          <ServicesIntroSection
            active={active}
            onSelect={setActive}
            copy={copy}
          />
          <ServicesProjectsSection copy={copy} onViewport={linkStrip} />
          <ServicesMethodSection copy={copy} />
        </>
      )}
    </ScrollLoop>
  );
}
