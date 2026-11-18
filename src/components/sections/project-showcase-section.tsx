import { ParallaxImage } from "@/components/ui/parallax-image";
import {
  ProjectBrand,
  ProjectDisciplines,
  ProjectMeta,
} from "@/components/ui/project-meta";
import { Reveal } from "@/components/ui/reveal";
import { ShowcaseCard } from "@/components/ui/showcase-card";
import { UnderReveal } from "@/components/ui/under-reveal";
import { getProjectHref } from "@/constants/projects";
import type { Project, ProjectShowcase } from "@/types/project";

type ProjectShowcaseSectionProps = {
  project: Project & { showcase: ProjectShowcase };
};

/**
 * Figma "Projeto Allce" (1920×1080): a full-screen project, its card on the
 * left and the details on the right. Each one slides out from under the
 * section above.
 */
export function ProjectShowcaseSection({
  project,
}: ProjectShowcaseSectionProps) {
  const { showcase } = project;

  return (
    <section
      data-header-theme="light"
      aria-label={project.name}
      className="relative overflow-hidden bg-black-graw text-white lg:h-1080"
    >
      <UnderReveal className="min-h-svh lg:absolute lg:inset-0 lg:min-h-0">
        <ParallaxImage src={showcase.background} alt="" amount={4} />
        {/* Phones: the details sit low over the photo, so it darkens there
            (the Figma image shade) to keep them readable on light photos. */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 bottom-0 h-[55%] bg-linear-to-t from-shade to-transparent lg:hidden"
        />
        {/* Phones: card and details share one screen, the card shrinking on
            short screens (down to 240px) to leave room for the details. */}
        <div className="relative flex min-h-svh flex-col justify-between gap-32 px-16 pt-96 pb-48 lg:absolute lg:top-63 lg:left-177 lg:min-h-0 lg:w-1566 lg:flex-row lg:items-end lg:justify-between lg:gap-48 lg:p-0">
          <ShowcaseCard
            href={getProjectHref(project)}
            image={showcase.card}
            handle={showcase.handle}
            className="w-[min(100%,max(var(--spacing)*240,(100svh-var(--spacing)*400)*450.45/605.111))]"
          />
          <Reveal
            stagger={0.1}
            blur={6}
            className="flex flex-col gap-32 lg:w-672.75 lg:gap-738.5"
          >
            <div data-reveal>
              <ProjectMeta info={showcase} className="lg:w-514.25" />
            </div>
            <div className="flex flex-col gap-24 lg:flex-row lg:items-end lg:justify-between">
              <div data-reveal>
                <ProjectBrand
                  info={showcase}
                  name={project.name}
                  className="gap-24 lg:gap-71.5"
                />
              </div>
              <div data-reveal>
                <ProjectDisciplines info={showcase} className="lg:w-226.25" />
              </div>
            </div>
          </Reveal>
        </div>
      </UnderReveal>
    </section>
  );
}
