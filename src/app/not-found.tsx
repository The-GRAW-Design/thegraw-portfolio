import type { Metadata } from "next";
import { NotFoundSection } from "@/components/sections/not-found-section";
import { NOT_FOUND_PAGE } from "@/constants/pages";

export const metadata: Metadata = {
  title: NOT_FOUND_PAGE.title,
};

export default function NotFound() {
  return (
    <main id="conteudo">
      <NotFoundSection />
    </main>
  );
}
