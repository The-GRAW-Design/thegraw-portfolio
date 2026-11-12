import Link from "next/link";
import { ComingSoon } from "@/components/ui/coming-soon";
import { ParallaxImage } from "@/components/ui/parallax-image";
import { GlareHover } from "@/components/ui/react-bits/glare-hover";
import { Reveal } from "@/components/ui/reveal";
import { ALL_PROJECTS_ORDER, CASES_PAGE } from "@/constants/cases";
import { findProject, getProjectHref } from "@/constants/projects";

const GRID = ALL_PROJECTS_ORDER.map((slug) => findProject(slug)).filter(
  (project) => project !== undefined,
);

/** Figma "all projects": two columns of 884.5×983 covers on BLACK GRAW. */
export function AllProjectsSection() {
  return (
    <section
      data-header-theme="light"
      className="bg-black-graw px-16 pt-112 pb-96 lg:px-0 lg:pt-231 lg:pb-148"
    >
      <h1 className="sr-only">{CASES_PAGE.allTitle}</h1>
      <ul className="grid gap-16 lg:mx-auto lg:w-1798 lg:grid-cols-2 lg:gap-29">
        {GRID.map((project, index) => (
          <li key={project.slug}>
            <Reveal wipe="up">
              <Link
                href={getProjectHref(project)}
                className="group relative block aspect-[884.5/983] overflow-hidden bg-coal"
              >
                {project.cover ? (
                  <ParallaxImage
                    src={project.cover}
                    alt=""
                    sizes="(min-width: 1024px) 47vw, 100vw"
                    priority={index < 2}
                    amount={4}
                    imageClassName="transition-transform duration-700 ease-power3 group-hover:scale-[1.04] group-focus-visible:scale-[1.04]"
                  />
                ) : (
                  <ComingSoon
                    sizes="(min-width: 1024px) 47vw, 100vw"
                    className="transition-transform duration-700 ease-power3 group-hover:scale-[1.02] group-focus-visible:scale-[1.02]"
                  />
                )}
                {/* A light streak sweeps the cover on hover (React Bits GlareHover). */}
                <GlareHover
                  borderRadius="0"
                  glareOpacity={0.25}
                  glareAngle={-35}
                  glareSize={35}
                  rimGlint={false}
                  transitionDuration={1000}
                  className="absolute inset-0 border-0"
                />
                <span className="sr-only">{project.name}</span>
              </Link>
            </Reveal>
          </li>
        ))}
      </ul>
    </section>
  );
}
