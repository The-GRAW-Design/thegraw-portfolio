import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ProjectDetailSection } from "@/components/sections/project-detail-section";
import { ProjectMoreSection } from "@/components/sections/project-more-section";
import { findProject, PROJECTS } from "@/constants/projects";

export const dynamicParams = false;

export function generateStaticParams() {
  return PROJECTS.map((project) => ({ slug: project.slug }));
}

export async function generateMetadata({
  params,
}: PageProps<"/cases/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const project = findProject(slug);
  return { title: project?.name };
}

export default async function ProjectPage({
  params,
}: PageProps<"/cases/[slug]">) {
  const { slug } = await params;
  const project = findProject(slug);
  if (!project) notFound();

  return (
    <main id="conteudo" className="bg-black-graw">
      <ProjectDetailSection project={project} />
      <ProjectMoreSection project={project} />
    </main>
  );
}
