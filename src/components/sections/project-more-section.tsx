import { TransitionLink } from "@/features/page-transition";
import { Reveal } from "@/components/ui/reveal";
import { ShuffleText } from "@/components/ui/shuffle-text";
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

/** Figma: the 2927px card row is centered 17px left of the 1920 frame. */
const TRACK_START = -520.75 / 1920;

/**
 * Site 2.0 "Project Open" closing band (1920×1151; phones 393×326): the
 * credits with the orange FIM, then the other cases on the track and "ver
 * todos", over the studio texture.
 */
export function ProjectMoreSection({ project }: ProjectMoreSectionProps) {
  return (
    <section
      data-header-theme="light"
      className="relative my-30 h-326.25 overflow-hidden bg-black-graw font-flex text-white lg:mt-51 lg:mb-0 lg:h-1151"
    >
      <DitherImage {...PROJECT_END_DITHER} animation="scroll" />

      <Reveal
        blur={6}
        className="absolute top-56.25 left-14 flex h-83.5 w-271.5 gap-16 p-1.75 lg:top-60 lg:left-92.75 lg:h-450.25 lg:w-1301 lg:gap-86.5 lg:p-9.5"
      >
        {project.credits.map((column, columnIndex) => (
          <dl
            key={columnIndex}
            data-reveal
            className="flex flex-1 flex-col gap-8.25 lg:gap-44.25"
          >
            {/* Rows of a fixed height, as in the Figma: a label on two lines
                runs past its row instead of pushing the next one down. */}
            {column.map((credit) => (
              <div
                key={credit.label}
                className="flex min-h-0 flex-1 flex-col gap-1 lg:gap-5.75"
              >
                <dt className="text-credit-title-sm lg:text-credit-title">
                  {credit.label}
                </dt>
                <dd className="h-12 text-credit-name-sm lg:h-65.5 lg:text-credit-name">
                  {credit.value}
                </dd>
              </div>
            ))}
          </dl>
        ))}
      </Reveal>

      {/* The letters flip up with the scroll (React Bits ScrollFloat), with
          nothing clipping them on the way, and land as soon as the whole
          word is on screen: on short screens the band sits at the top before
          the default end. */}
      <ScrollFloat
        tag="p"
        effect="flip"
        scrollStart="top bottom"
        scrollEnd="bottom bottom"
        ease={EASE.inOut}
        stagger={0.08}
        containerClassName="pointer-events-none absolute top-92.75 right-14 -translate-y-1/2 overflow-visible font-gothic text-fim-sm text-orange lg:top-257.25 lg:right-78 lg:text-fim"
      >
        {PROJECT_PAGE.end}
      </ScrollFloat>

      <Reveal className="absolute inset-x-0 top-164.5 lg:top-501">
        <CasesTrack
          projects={PROJECTS}
          startOffset={TRACK_START}
          mobileStartOffset={0}
          className="gap-18.5 lg:gap-63.25"
          listClassName="gap-6 lg:gap-27.5"
          itemClassName="w-153 lg:w-711.25"
          sizes="(min-width: 1024px) 37vw, 40vw"
          barClassName="h-4 w-108.5 lg:h-12.5 lg:w-337"
          railClassName="h-2 bg-haze lg:h-6.25 lg:bg-rail"
          footerClassName="h-27 w-[calc(100%-var(--spacing)*28)] lg:relative lg:left-46 lg:h-83 lg:w-776"
          aside={
            <TransitionLink
              href="/cases/all"
              className="group text-view-all whitespace-nowrap transition-colors duration-300 ease-power3 hover:text-red-graw"
            >
              <ShuffleText>{PROJECT_PAGE.viewAll}</ShuffleText>
            </TransitionLink>
          }
        />
      </Reveal>
    </section>
  );
}
