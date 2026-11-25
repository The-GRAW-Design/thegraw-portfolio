import { ComingSoon } from "@/components/ui/coming-soon";
import { GalleryImage } from "@/components/ui/gallery-image";
import { Reveal } from "@/components/ui/reveal";
import { SplitReveal } from "@/components/ui/split-reveal";
import { ProjectOverview } from "@/components/sections/project-overview";
import type { Project, ProjectMedia, ProjectRow } from "@/types/project";
import { galleryItems } from "@/utils/project-gallery";

type ProjectDetailSectionProps = {
  project: Project;
};

/** Figma "Project Open" gallery box (1763×1017), for the {EM BREVE} glass. */
const BOX = { width: 1763, height: 1017 } as const;

/** A box key: its image, or its logo layer. */
const mediaKey = (media: ProjectMedia) => media.src ?? media.logo.layers[0].src;

/** Boxes side by side, sized by their aspect so they share one height. */
function GalleryRow({ row }: { row: ProjectRow }) {
  return (
    <div className="flex gap-7.25 lg:gap-36">
      {row.row.map((media) => (
        <div
          key={mediaKey(media)}
          style={{ flex: `${media.width / media.height} 1 0%` }}
        >
          <GalleryImage
            media={media}
            sizes="(min-width: 1024px) 46vw, 50vw"
            className="p-0 lg:p-0"
          />
        </div>
      ))}
    </div>
  );
}

/**
 * Site 2.0 "Project Open" (1920 frame on white; phones "Mobile - overview"):
 * the name, the overview with the case's lists, then its gallery one box
 * under the other. A case without its gallery yet shows its logo (when there
 * is one) and the {EM BREVE} glass.
 */
export function ProjectDetailSection({ project }: ProjectDetailSectionProps) {
  const { gallery, copy, scope } = project;

  return (
    <section
      data-header-theme="dark"
      className="bg-white px-14 pt-96.5 font-flex text-black lg:px-79 lg:pt-178"
    >
      <div className="flex flex-col gap-13 lg:gap-45">
        <SplitReveal
          as="h1"
          split="chars"
          trigger="load"
          className="text-project-title font-medium"
        >
          {project.title}
        </SplitReveal>
        {(copy || scope) && (
          <div className="flex flex-col text-overview-sm lg:flex-row lg:gap-330 lg:text-overview">
            {copy && <ProjectOverview>{copy.intro}</ProjectOverview>}
            {scope && (
              <Reveal
                stagger={0.08}
                className="hidden lg:flex lg:h-225 lg:w-719 lg:gap-225"
              >
                {scope.map((group) => (
                  <div
                    key={group.title}
                    data-reveal
                    className="flex flex-1 flex-col gap-19"
                  >
                    <h3 className="font-bold uppercase">{group.title}</h3>
                    <ul className="flex flex-col gap-8">
                      {group.items.map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </ul>
                  </div>
                ))}
              </Reveal>
            )}
          </div>
        )}
      </div>

      <div className="mt-30 flex flex-col gap-8 lg:mt-164.25 lg:gap-43">
        {gallery ? (
          galleryItems(gallery).map((item, index) => (
            // The first box is where an opened case's image lands.
            <div
              key={"row" in item ? mediaKey(item.row[0]) : mediaKey(item)}
              data-project-hero={index === 0 ? "" : undefined}
            >
              {"row" in item ? (
                <GalleryRow row={item} />
              ) : (
                <GalleryImage
                  media={item}
                  sizes="(min-width: 1024px) 92vw, 100vw"
                  className="p-0 lg:p-0"
                />
              )}
            </div>
          ))
        ) : (
          <>
            {project.logo && (
              <GalleryImage
                media={{ ...BOX, logo: project.logo }}
                className="p-0 lg:p-0"
              />
            )}
            <Reveal wipe="up">
              <div
                data-project-hero
                className="relative w-full overflow-hidden"
                style={{ aspectRatio: `${BOX.width} / ${BOX.height}` }}
              >
                <ComingSoon
                  image={project.hero?.src}
                  scale="page"
                  sizes="92vw"
                />
              </div>
            </Reveal>
          </>
        )}
      </div>
    </section>
  );
}
