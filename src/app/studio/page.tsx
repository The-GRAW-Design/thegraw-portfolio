import type { Metadata } from "next";
import { Footer } from "@/components/layout/footer";
import { ContactSection } from "@/components/sections/contact-section";
import { StudioHeroSection } from "@/components/sections/studio-hero-section";
import { StudioPillars } from "@/components/sections/studio-pillars";
import { STUDIO_PAGE } from "@/constants/pages";

export const metadata: Metadata = {
  title: STUDIO_PAGE.title,
};

export default function StudioPage() {
  return (
    <>
      <main id="conteudo">
        <StudioHeroSection />
        <StudioPillars />
        <ContactSection cta="link" />
      </main>
      <Footer />
    </>
  );
}
