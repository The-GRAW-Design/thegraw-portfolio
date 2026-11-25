import { Footer } from "@/components/layout/footer";
import { HeroSection } from "@/components/sections/hero-section";
import { LetsWorkSection } from "@/components/sections/lets-work-section";
import { ProjectShowcaseSection } from "@/components/sections/project-showcase-section";
import { ProjectsIntroSection } from "@/components/sections/projects-intro-section";
import { ViewAllCasesSection } from "@/components/sections/view-all-cases-section";
import { HOME_PAGE } from "@/constants/pages";
import { findProject } from "@/constants/projects";
import { HeroSword } from "@/features/hero-sword";
import type { Project, ProjectShowcase } from "@/types/project";

const SHOWCASES = HOME_PAGE.showcases
  .map((slug) => findProject(slug))
  .filter(
    (project): project is Project & { showcase: ProjectShowcase } =>
      project?.showcase !== undefined,
  );

export default function HomePage() {
  return (
    <>
      <main id="conteudo">
        <div data-hero-stack className="relative">
          <HeroSection />
          <ProjectsIntroSection />
          <HeroSword />
        </div>
        {SHOWCASES.map((project) => (
          <ProjectShowcaseSection key={project.slug} project={project} />
        ))}
        <ViewAllCasesSection />
        <LetsWorkSection />
      </main>
      <Footer />
    </>
  );
}
