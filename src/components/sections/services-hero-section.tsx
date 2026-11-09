"use client";

import { useRef } from "react";
import { ParallaxImage } from "@/components/ui/parallax-image";
import { SplitReveal } from "@/components/ui/split-reveal";
import { LOREM_LONG } from "@/constants/pages";
import { SERVICE_OFFER, SERVICES_PAGE } from "@/constants/services";
import { EASE, gsap, useGSAP } from "@/lib/gsap";
import type { ServiceId } from "@/types/project";
import { cn } from "@/utils/cn";

type ServicesHeroSectionProps = {
  active: ServiceId;
  onSelect: (service: ServiceId) => void;
};

/**
 * Figma "Services" hero (1920×1400): the photo, darker and blurred toward the
 * bottom-right corner, and the three services; the one in white is the one
 * whose projects are listed below.
 */
export function ServicesHeroSection({
  active,
  onSelect,
}: ServicesHeroSectionProps) {
  const listRef = useRef<HTMLUListElement>(null);

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

  return (
    <section
      data-header-theme="light"
      className="relative flex min-h-svh flex-col justify-end overflow-hidden bg-black-graw px-16 pt-120 pb-64 text-white lg:block lg:h-1400 lg:min-h-0 lg:p-0"
    >
      <ParallaxImage
        src={SERVICES_PAGE.heroImage}
        alt=""
        priority
        // Figma mirrors the photo; on the wrapper, since the parallax owns the
        // image transform.
        className="-scale-x-100"
        imageClassName="object-[50%_35.7%]"
      />
      <div
        aria-hidden
        className="absolute inset-0 [mask-image:linear-gradient(149.38deg,transparent_42.738%,var(--color-black)_103.51%)] backdrop-blur-hero"
      />
      <div
        aria-hidden
        className="absolute inset-0 bg-[linear-gradient(149.38deg,transparent_42.738%,var(--color-dusk)_103.51%)]"
      />

      {/* Higher than the Figma 386: centered in the first screen (the block
          is 712 design px tall), clear of the header. */}
      <div className="relative flex flex-col items-end text-right lg:absolute lg:top-[max(calc(var(--spacing)*120),calc((100svh-var(--spacing)*712)/2))] lg:left-1036 lg:w-747">
        <h1 className="sr-only">{SERVICES_PAGE.title}</h1>
        <ul ref={listRef} aria-label={SERVICES_PAGE.title}>
          {SERVICE_OFFER.map((service) => {
            const pressed = service.id === active;
            return (
              <li
                key={service.id}
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
                  onClick={() => onSelect(service.id)}
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
