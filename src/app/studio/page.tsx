import type { Metadata } from "next";
import { LegacyFooter } from "@/components/layout/legacy-footer";
import { StudioContentSection } from "@/components/sections/studio-content-section";
import { StudioHeroSection } from "@/components/sections/studio-hero-section";
import { STUDIO_PAGE } from "@/constants/pages";

export const metadata: Metadata = {
  title: STUDIO_PAGE.title,
};

export default function StudioPage() {
  return (
    <>
      <main id="conteudo">
        <StudioHeroSection />
        <StudioContentSection />
      </main>
      <LegacyFooter />
    </>
  );
}
