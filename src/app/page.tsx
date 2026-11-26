import { Footer } from "@/components/layout/footer";
import { ContactSection } from "@/components/sections/contact-section";
import { HeroSection } from "@/components/sections/hero-section";
import { ProjectsIntroSection } from "@/components/sections/projects-intro-section";
import { ViewAllCasesSection } from "@/components/sections/view-all-cases-section";
import { HomeCases } from "@/features/cases";
import { HeroSword } from "@/features/hero-sword";

export default function HomePage() {
  return (
    <>
      <main id="conteudo">
        {/* The hero stays fixed until "Projetos" and the cases cover it. */}
        <div data-hero-stack className="relative">
          <HeroSection />
          <ProjectsIntroSection />
          <HomeCases band={<ViewAllCasesSection className="lg:hidden" />} />
          <HeroSword />
        </div>
        <ViewAllCasesSection className="max-lg:hidden" />
        <ContactSection />
      </main>
      <Footer />
    </>
  );
}
