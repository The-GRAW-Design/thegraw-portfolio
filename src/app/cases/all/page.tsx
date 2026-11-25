import type { Metadata } from "next";
import { LegacyFooter } from "@/components/layout/legacy-footer";
import { AllProjectsSection } from "@/components/sections/all-projects-section";
import { CASES_PAGE } from "@/constants/cases";

export const metadata: Metadata = {
  title: CASES_PAGE.allTitle,
};

export default function AllProjectsPage() {
  return (
    <>
      <main id="conteudo">
        <AllProjectsSection />
      </main>
      <LegacyFooter tone="dark" />
    </>
  );
}
