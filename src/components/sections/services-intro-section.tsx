"use client";

import { useRef } from "react";
import { SplitReveal } from "@/components/ui/split-reveal";
import {
  SERVICE_OFFER,
  SERVICES_PAGE,
  serviceOrder,
} from "@/constants/services";
import { EASE, gsap, useGSAP } from "@/lib/gsap";
import type { ServiceId } from "@/types/project";
import { cn } from "@/utils/cn";

type ServicesIntroSectionProps = {
  active: ServiceId;
  onSelect: (service: ServiceId) => void;
  /** The repeat of the page start at the end of the loop. */
  copy?: boolean;
};

/**
 * Figma "Services" 2.0, top: the three services, the selected one at the
 * bottom in Pirata One, and its text at the left. Picking another one turns
 * the list until it reaches the bottom, rising in its new face, and its text
 * fades in. Desktop: the list ends where the header "Menu" ends (as asked on
 * 2026-11-19); phones follow the mobile frame, at the left.
 */
export function ServicesIntroSection({
  active,
  onSelect,
  copy = false,
}: ServicesIntroSectionProps) {
  const listRef = useRef<HTMLUListElement>(null);
  const itemRefs = useRef(new Map<ServiceId, HTMLLIElement>());
  /** Where each item was before the list turned (FLIP). */
  const lastTops = useRef<Map<ServiceId, number> | null>(null);

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
      className="grid pt-112 pb-36 lg:pt-0 lg:pb-52"
    >
      <div className="px-14 lg:col-start-1 lg:row-start-1 lg:px-0 lg:pt-189">
        {!copy && <h1 className="sr-only">{SERVICES_PAGE.title}</h1>}
        {/* Desktop: the services end where the header "Menu" ends; that word
            (`text-nav`) is centred in its 129 wide button, 37 from the edge,
            and the last letter of each service keeps 0.05em of side bearing
            inside its box. */}
        <ul
          ref={listRef}
          aria-label={SERVICES_PAGE.title}
          className="flex flex-col items-start lg:mr-[calc(var(--spacing)*37+(var(--spacing)*129-var(--text-nav)*2.38)/2-var(--text-title)*0.05)] lg:items-end"
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
                {/* Right-aligned on desktop; the padding takes back the
                    tracking the browser adds after the last letter (Pirata
                    One has none). */}
                <button
                  type="button"
                  aria-pressed={pressed}
                  tabIndex={copy ? -1 : undefined}
                  className={cn(
                    "block whitespace-nowrap transition-colors duration-300 ease-power3",
                    service.size,
                    pressed
                      ? "font-gothic tracking-normal text-white uppercase"
                      : "text-white/54 hover:text-white/80 lg:pr-[0.07em]",
                  )}
                  onClick={() => select(service.id)}
                >
                  {/* Each word rises from under its line, one after the
                      other, and again whenever it changes face. */}
                  <SplitReveal
                    key={`${service.id}-${pressed}`}
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
      </div>

      {/* Each service's text (Figma x 99, y 528; phones x 14, y 293 in a
          106 tall box); the selected one fades in. It shares the list's cell
          on desktop, so a longer text pushes the projects down instead of
          running into them. */}
      <div className="pointer-events-none mt-22 grid min-h-106 px-14 lg:col-start-1 lg:row-start-1 lg:mt-0 lg:min-h-0 lg:px-0 lg:pt-528 lg:pl-99">
        {SERVICE_OFFER.map((service) => (
          <div
            key={service.id}
            aria-hidden={service.id !== active}
            className={cn(
              "col-start-1 row-start-1 w-304 transition-opacity duration-800 ease-power3 lg:w-608",
              service.id === active
                ? "pointer-events-auto opacity-100"
                : "opacity-0",
            )}
          >
            <SplitReveal
              split="lines"
              trigger="load"
              delay={0.45}
              className="text-service-copy-sm lg:text-service-copy"
            >
              {service.description}
            </SplitReveal>
          </div>
        ))}
      </div>
    </section>
  );
}
