import Link from "next/link";
import { Reveal } from "@/components/ui/reveal";
import { ScrollFloat } from "@/components/ui/react-bits/scroll-float";
import { PROJECT_END_DITHER } from "@/constants/dither";
import { PROJECT_PAGE } from "@/constants/pages";
import { PROJECTS } from "@/constants/projects";
import { EASE } from "@/lib/gsap";
import { CasesTrack } from "@/features/cases/components/cases-track";
import { DitherImage } from "@/features/dither-image";
import type { Project } from "@/types/project";

type ProjectMoreSectionProps = {
  project: Project;
};

/**
 * Figma "Project Open" closing block (1920×1039.658): the credits with the
 * orange END, then the other cases on the track, over the studio texture.
 */
export function ProjectMoreSection({ project }: ProjectMoreSectionProps) {
  return (
    <section
      data-header-theme="light"
      className="relative overflow-hidden bg-black-graw pt-48 pb-64 text-white lg:h-1039.75 lg:p-0"
    >
      <DitherImage {...PROJECT_END_DITHER} animation="scroll" />

      <div className="relative grid px-16 lg:absolute lg:top-32.5 lg:left-300 lg:p-0">
        <Reveal className="col-start-1 row-start-1 grid grid-cols-2 gap-x-24 lg:flex lg:w-1034 lg:gap-90 lg:p-10">
          {project.credits.map((column, columnIndex) => (
            <dl
              key={columnIndex}
              data-reveal
              className={
                columnIndex === 0
                  ? "flex flex-col gap-46 lg:w-428"
                  : "flex flex-col gap-46 lg:w-496"
              }
            >
              {column.map((credit) => (
                <div key={credit.label} className="flex flex-col gap-6">
                  <dt className="text-heading tracking-tight">
                    {credit.label}
                  </dt>
                  <dd className="text-credit">{credit.value}</dd>
                </div>
              ))}
            </dl>
          ))}
        </Reveal>
        {/* The letters float up with the scroll (React Bits ScrollFloat). */}
        <ScrollFloat
          tag="p"
          ease={EASE.inOut}
          stagger={0.06}
          containerClassName="pointer-events-none col-start-1 row-start-1 mt-auto justify-self-end text-end text-orange lg:mt-55 lg:ml-714 lg:h-334 lg:w-606 lg:justify-self-start"
        >
          {PROJECT_PAGE.end}
        </ScrollFloat>
      </div>

      <Reveal className="relative mt-48 lg:absolute lg:inset-x-0 lg:top-504.5 lg:mt-0">
        <CasesTrack
          projects={PROJECTS}
          className="gap-32 lg:gap-69.25"
          footerClassName="w-full px-16 lg:ml-318 lg:w-1285 lg:self-start lg:px-0"
          aside={
            <Link
              href="/cases/all"
              className="text-more whitespace-nowrap transition-colors duration-300 ease-power3 hover:text-red-graw"
            >
              {PROJECT_PAGE.viewAll}
            </Link>
          }
        />
      </Reveal>
    </section>
  );
}
