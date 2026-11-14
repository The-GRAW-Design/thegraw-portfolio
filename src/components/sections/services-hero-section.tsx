"use client";

import { useRef } from "react";
import { ParallaxImage } from "@/components/ui/parallax-image";
import { ProgressiveBlur } from "@/components/ui/progressive-blur";
import { SplitReveal } from "@/components/ui/split-reveal";
import { LOREM_LONG } from "@/constants/pages";
import {
  SERVICE_OFFER,
  SERVICES_PAGE,
  serviceOrder,
} from "@/constants/services";
import { EASE, gsap, useGSAP } from "@/lib/gsap";
import type { ServiceId } from "@/types/project";
import { cn } from "@/utils/cn";

type ServicesHeroSectionProps = {
  active: ServiceId;
  onSelect: (service: ServiceId) => void;
};

/**
 * Figma "Services" hero (1920×1400), one state per service: its photo, darker
 * and blurred toward the bottom-right corner, and the three services, the
 * selected one at the bottom in white. Picking another one turns the list
 * until it reaches the bottom, and its photo fades in.
 */
export function ServicesHeroSection({
  active,
  onSelect,
}: ServicesHeroSectionProps) {
  const listRef = useRef<HTMLUListElement>(null);
  const itemRefs = useRef(new Map<ServiceId, HTMLLIElement>());
  /** Where each item was before the list turned (FLIP). */
  const lastTops = useRef<Map<ServiceId, number> | null>(null);

  useGSAP(
    () => {
      const media = gsap.matchMedia();
      media.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.from("[data-service-word]", {
          yPercent: 110,
          duration: 1.1,
          ease: EASE.expo,
          stagger: 0.1,
          delay: 0.2,
        });
      });
      return () => media.revert();
    },
    { scope: listRef },
  );

  // Each item glides from where it was to its new line.
  useGSAP(
    () => {
      const before = lastTops.current;
      lastTops.current = null;
      if (!before) return;
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
      itemRefs.current.forEach((item, id) => {
        const top = before.get(id);
        if (top === undefined) return;
        const shift = top - item.getBoundingClientRect().top;
        if (Math.abs(shift) < 1) return;
        gsap.fromTo(
          item,
          { y: shift },
          { y: 0, duration: 0.8, ease: EASE.expo, overwrite: true },
        );
      });
    },
    { dependencies: [active], scope: listRef },
  );

  const select = (service: ServiceId) => {
    if (service === active) return;
    lastTops.current = new Map(
      [...itemRefs.current].map(([id, item]) => [
        id,
        item.getBoundingClientRect().top,
      ]),
    );
    onSelect(service);
  };

  return (
    <section
      data-header-theme="light"
      className="relative flex min-h-svh flex-col justify-end overflow-hidden bg-black-graw px-16 pt-120 pb-64 text-white lg:block lg:h-1400 lg:min-h-0 lg:p-0"
    >
      {SERVICE_OFFER.map((service) => (
        <ParallaxImage
          key={service.id}
          src={service.image}
          alt=""
          priority={service.id === SERVICES_PAGE.defaultService}
          className={cn(
            "transition-opacity duration-800 ease-power3",
            service.id === active ? "opacity-100" : "opacity-0",
          )}
        />
      ))}
      {/* Figma: a 41.6 background blur growing along the darkening gradient. */}
      <ProgressiveBlur angle={149.38} from={42.738} to={103.51} blur={41.6} />
      <div
        aria-hidden
        className="absolute inset-0 bg-[linear-gradient(149.38deg,transparent_42.738%,var(--color-dusk)_103.51%)]"
      />

      {/* Higher than the Figma 386: centered in the first screen (the block
          is 712 design px tall), clear of the header. */}
      <div className="relative flex flex-col items-end text-right lg:absolute lg:top-[max(calc(var(--spacing)*120),calc((100svh-var(--spacing)*712)/2))] lg:left-1036 lg:w-747">
        <h1 className="sr-only">{SERVICES_PAGE.title}</h1>
        <ul ref={listRef} aria-label={SERVICES_PAGE.title}>
          {serviceOrder(active).map((service) => {
            const pressed = service.id === active;
            return (
              <li
                key={service.id}
                ref={(item) => {
                  if (item) itemRefs.current.set(service.id, item);
                  else itemRefs.current.delete(service.id);
                }}
                className="-mx-[0.2em] overflow-hidden px-[0.2em]"
              >
                <button
                  type="button"
                  data-service-word
                  aria-pressed={pressed}
                  className={cn(
                    "block text-title whitespace-nowrap transition-colors duration-300 ease-power3",
                    pressed
                      ? "text-white"
                      : "text-white/54 hover:text-white/80",
                  )}
                  onClick={() => select(service.id)}
                >
                  {service.title}
                </button>
              </li>
            );
          })}
        </ul>
        <SplitReveal
          split="lines"
          trigger="load"
          delay={0.45}
          className="text-body lg:h-220"
        >
          {LOREM_LONG}
        </SplitReveal>
      </div>
    </section>
  );
}
