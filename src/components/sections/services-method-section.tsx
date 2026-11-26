"use client";

import { Fragment, useRef } from "react";
import { SplitReveal } from "@/components/ui/split-reveal";
import { METHOD_STEPS, SERVICES_PAGE } from "@/constants/services";
import { EASE, gsap, useGSAP } from "@/lib/gsap";
import { cn } from "@/utils/cn";

type ServicesMethodSectionProps = {
  /** The repeat of the page start at the end of the loop. */
  copy?: boolean;
};

const MOTION = "(prefers-reduced-motion: no-preference)";

/**
 * Figma "Services" 2.0, under the projects: "Como fazemos?", "Metodologia"
 * and "Idealização" at the left (x 86), each text at x 1190, a #3C3C3C rule
 * between the rows. The mobile frame has no such rows: phones stack each
 * title over its text with the list's sizes.
 */
export function ServicesMethodSection({
  copy = false,
}: ServicesMethodSectionProps) {
  const sectionRef = useRef<HTMLElement>(null);

  // The rules draw from the left as they come in.
  useGSAP(
    () => {
      if (copy) return;
      const media = gsap.matchMedia();
      media.add(MOTION, () => {
        gsap.utils
          .toArray<HTMLElement>("[data-rule]", sectionRef.current)
          .forEach((rule) => {
            gsap.from(rule, {
              scaleX: 0,
              transformOrigin: "0% 50%",
              duration: 1.2,
              ease: EASE.expo,
              scrollTrigger: { trigger: rule, start: "top 90%", once: true },
            });
          });
      });
      return () => media.revert();
    },
    { scope: sectionRef, dependencies: [copy] },
  );

  return (
    <section
      ref={sectionRef}
      data-header-theme="light"
      aria-label={SERVICES_PAGE.methodLabel}
      className="px-14 pt-36 pb-36 lg:px-0 lg:pt-84.75 lg:pb-73"
    >
      {METHOD_STEPS.map((step, index) => (
        <Fragment key={step.title}>
          {index > 0 && (
            <hr
              data-rule
              className={cn(
                "my-22 h-px border-0 bg-iron lg:mr-119 lg:mb-52 lg:ml-99 lg:h-2",
                step.ruleClassName,
              )}
            />
          )}
          <div className="lg:grid lg:grid-cols-[calc(var(--spacing)*1104)_calc(var(--spacing)*608)] lg:pl-86">
            <SplitReveal
              as="h2"
              split="lines"
              className="text-service-sm text-white/54 lg:text-service"
            >
              {step.title}
            </SplitReveal>
            <SplitReveal
              split="lines"
              className="mt-10 w-304 text-service-copy-sm lg:mt-26 lg:w-auto lg:text-service-copy"
            >
              {step.text}
            </SplitReveal>
          </div>
        </Fragment>
      ))}
    </section>
  );
}
