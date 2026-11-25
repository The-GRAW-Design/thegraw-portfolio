"use client";

import { useEffect, useRef } from "react";
import { ParallaxImage } from "@/components/ui/parallax-image";
import { ProgressiveBlur } from "@/components/ui/progressive-blur";
import { SplitReveal } from "@/components/ui/split-reveal";
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
 * Like the home hero it is sticky: once its bottom reaches the bottom of the
 * screen it stays put, and the projects slide over it.
 */
export function ServicesHeroSection({
  active,
  onSelect,
}: ServicesHeroSectionProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const itemRefs = useRef(new Map<ServiceId, HTMLLIElement>());
  /** Where each item was before the list turned (FLIP). */
  const lastTops = useRef<Map<ServiceId, number> | null>(null);

  // Its height feeds the sticky offset (taller than the screen on desktop,
  // and on phones whenever the text does not fit).
  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;
    const observer = new ResizeObserver(() => {
      section.style.setProperty("--hero-h", `${section.offsetHeight}px`);
    });
    observer.observe(section);
    return () => observer.disconnect();
  }, []);

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
      ref={sectionRef}
      data-header-theme="light"
      className="sticky top-[min(0px,calc(100svh-var(--hero-h,100svh)))] flex min-h-svh flex-col justify-end overflow-hidden bg-black-graw px-16 pt-120 pb-64 text-white lg:block lg:h-1400 lg:min-h-0 lg:p-0"
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
          settle="load"
        />
      ))}
      {/* Figma: a 41.6 background blur growing along the darkening gradient. */}
      <ProgressiveBlur angle={149.38} from={42.738} to={103.51} blur={41.6} />
      <div
        aria-hidden
        className="absolute inset-0 bg-[linear-gradient(149.38deg,transparent_42.738%,var(--color-dusk)_103.51%)]"
      />
      {/* Figma: the same gradient turned 180°, darkening the top-left corner
          behind the text (no blur). */}
      <div
        aria-hidden
        className="absolute inset-0 rotate-180 bg-[linear-gradient(149.38deg,transparent_42.738%,var(--color-dusk)_103.51%)]"
      />

      {/* Figma 386, raised on short screens so the text (496 design px from
          the list top to its bottom) stays in the first screen, clear of the
          header. */}
      <div className="relative flex flex-col items-end text-right lg:absolute lg:inset-x-0 lg:top-[max(calc(var(--spacing)*120),min(calc(var(--spacing)*386),calc(100svh-var(--spacing)*594)))]">
        <h1 className="sr-only">{SERVICES_PAGE.title}</h1>
        {/* The services end where the header "Menu" ends: that word (2.38em
            of `text-hotbar`) is centred in the button, 101.75 wide at the edge
            (phone) or 129 wide 37 from it (desktop), and the last letter of
            each service keeps 0.05em of side bearing inside its box. */}
        <ul
          ref={listRef}
          aria-label={SERVICES_PAGE.title}
          className="mr-[calc((var(--spacing)*101.75-var(--text-hotbar)*2.38)/2-var(--text-title)*0.05)] lg:mr-[calc(var(--spacing)*37+(var(--spacing)*129-var(--text-hotbar)*2.38)/2-var(--text-title)*0.05)]"
        >
          {serviceOrder(active).map((service, index) => {
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
                {/* Right-aligned as in the Figma; the padding takes back the
                    tracking the browser adds after the last letter. */}
                <button
                  type="button"
                  aria-pressed={pressed}
                  className={cn(
                    "ml-auto block pr-[0.07em] text-title whitespace-nowrap transition-colors duration-300 ease-power3",
                    pressed
                      ? "text-white"
                      : "text-white/54 hover:text-white/80",
                  )}
                  onClick={() => select(service.id)}
                >
                  {/* Each word rises from under its line, one after the other. */}
                  <SplitReveal
                    as="span"
                    split="lines"
                    trigger="load"
                    delay={0.2 + index * 0.1}
                    className="block whitespace-nowrap"
                  >
                    {service.title}
                  </SplitReveal>
                </button>
              </li>
            );
          })}
        </ul>
        {/* Each service's text, at the left of the frame (Figma x 37, 276
            below the list top); the selected one fades in with its photo. */}
        <div className="mt-32 grid self-stretch text-left lg:absolute lg:top-276 lg:left-37 lg:mt-0">
          {SERVICE_OFFER.map((service) => (
            <div
              key={service.id}
              aria-hidden={service.id !== active}
              className={cn(
                "col-start-1 row-start-1 transition-opacity duration-800 ease-power3",
                service.id === active ? "opacity-100" : "opacity-0",
              )}
            >
              <SplitReveal
                split="lines"
                trigger="load"
                delay={0.45}
                className={cn(
                  "text-body lg:h-220",
                  service.descriptionClassName,
                )}
              >
                {service.description}
              </SplitReveal>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
