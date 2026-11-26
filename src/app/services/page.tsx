import type { Metadata } from "next";
import { ServicesSections } from "@/components/sections/services-sections";
import { SERVICES_PAGE } from "@/constants/services";

export const metadata: Metadata = {
  title: SERVICES_PAGE.title,
};

/** Figma "Services" 2.0: black on desktop, BLACK GRAW on phones. */
export default function ServicesPage() {
  return (
    <main id="conteudo" className="bg-black-graw lg:bg-black">
      <ServicesSections />
    </main>
  );
}
