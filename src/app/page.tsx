import { Footer } from "@/components/layout/footer";
import { HeroSection } from "@/components/sections/hero-section";
import { LetsWorkSection } from "@/components/sections/lets-work-section";
import { ProjectsIntroSection } from "@/components/sections/projects-intro-section";
import { ViewAllCasesSection } from "@/components/sections/view-all-cases-section";
import { HomeCases } from "@/features/cases";
import { HeroSword } from "@/features/hero-sword";

export default function HomePage() {
  return (
    <>
      <main id="conteudo">
        <div data-hero-stack className="relative">
          <HeroSection />
          <ProjectsIntroSection />
          <HeroSword />
        </div>
        <HomeCases band={<ViewAllCasesSection className="lg:hidden" />} />
        <ViewAllCasesSection className="max-lg:hidden" />
        <LetsWorkSection />
      </main>
      <Footer />
    </>
  );
}
