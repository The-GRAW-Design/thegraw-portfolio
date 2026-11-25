"use client";

import { useState } from "react";
import { ScrollReveal } from "@/components/ui/react-bits/scroll-reveal";
import { PROJECT_PAGE } from "@/constants/pages";
import { cn } from "@/utils/cn";

type ProjectOverviewProps = {
  children: string;
};

/**
 * Figma "Project Open" "visão geral": the case's intro. Phones show its first
 * six lines and open the rest with "ver mais +" ("Mobile - overview").
 */
export function ProjectOverview({ children }: ProjectOverviewProps) {
  const [open, setOpen] = useState(false);

  return (
    <div className="flex flex-col gap-20 lg:w-710">
      <h2 className="font-bold uppercase">{PROJECT_PAGE.overview}</h2>
      <div className="flex flex-col items-start">
        {/* Its words come in one after the other (React Bits ScrollReveal). */}
        <ScrollReveal
          tag="p"
          mode="enter"
          stagger={0.012}
          duration={0.7}
          baseOpacity={0}
          blurStrength={6}
          containerClassName={cn(
            "max-lg:w-344",
            !open && "max-lg:line-clamp-6",
          )}
        >
          {children}
        </ScrollReveal>
        <button
          type="button"
          aria-expanded={open}
          onClick={() => setOpen((value) => !value)}
          className="whitespace-pre text-red-graw underline lg:hidden"
        >
          {open ? PROJECT_PAGE.less : PROJECT_PAGE.more}
        </button>
      </div>
    </div>
  );
}
