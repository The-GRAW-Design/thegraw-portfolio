import { ComingSoon } from "@/components/ui/coming-soon";
import { GalleryImage } from "@/components/ui/gallery-image";
import { ParallaxImage } from "@/components/ui/parallax-image";
import { Reveal } from "@/components/ui/reveal";
import { SplitReveal } from "@/components/ui/split-reveal";
import { LOREM_LONG, PROJECT_PAGE } from "@/constants/pages";
import type { Project, ProjectGallery } from "@/types/project";

type ProjectDetailSectionProps = {
  project: Project;
};

/** Gallery box under the intro: 1517.428 wide minus the 11.109px frame. */
const WIDE_BOX = { width: 1495.21, height: 829.81 } as const;

/** Figma gallery: lead boxes, split row with "Solution", story, closing boxes. */
function Gallery({ gallery }: { gallery: ProjectGallery }) {
  return (
    <>
      <div className="flex w-full flex-col gap-10">
        {gallery.lead.map((media) => (
          <GalleryImage key={media.src ?? "lead"} media={media} />
        ))}
        <div className="flex flex-col gap-32 lg:w-1506 lg:flex-row lg:items-start lg:gap-33.25">
          <GalleryImage
            media={gallery.split}
            sizes="(min-width: 1024px) 47vw, 100vw"
            className="lg:w-889.75"
          />
          <Reveal className="flex flex-col gap-16 px-10 lg:w-582.75 lg:gap-15.5 lg:px-0">
            <h2 className="text-chapter">{PROJECT_PAGE.solution}</h2>
            <p className="text-copy">{LOREM_LONG}</p>
          </Reveal>
        </div>
        {gallery.middle.map((group) => (
          <div
            key={group[0].src}
            className="flex flex-col gap-10 p-10 lg:gap-11 lg:p-11"
          >
            {group.map((media) => (
              <GalleryImage
                key={media.src}
                media={media}
                className="p-0 lg:p-0"
              />
            ))}
          </div>
        ))}
      </div>

      <Reveal className="flex flex-col gap-32 px-10 lg:w-1490 lg:flex-row lg:items-start lg:gap-33.25 lg:px-0">
        <div data-reveal className="flex flex-col gap-6.75 lg:w-885.25">
          <h2 className="text-chapter">{PROJECT_PAGE.process}</h2>
          <p className="text-copy">{LOREM_LONG}</p>
        </div>
        <div data-reveal className="flex flex-col gap-6.75 lg:w-571">
          <h2 className="text-chapter">{PROJECT_PAGE.results}</h2>
          <p className="text-copy">{PROJECT_PAGE.resultsBody}</p>
        </div>
      </Reveal>

      <div className="flex w-full flex-col gap-24 lg:gap-45.5">
        {gallery.closing.map((media) => (
          <GalleryImage key={media.src} media={media} />
        ))}
      </div>
    </>
  );
}

/**
 * Figma "Project Open" (1920 frame, BLACK GRAW): hero, intro and the case
 * study. A case without its gallery yet shows its logo (when there is one)
 * and the {EM BREVE} glass right under the intro.
 */
export function ProjectDetailSection({ project }: ProjectDetailSectionProps) {
  const { gallery } = project;

  return (
    <>
      <section data-header-theme="light" className="bg-black-graw">
        <div className="relative h-[60svh] w-full bg-coal lg:h-692">
          <ParallaxImage
            src={project.hero.src}
            alt=""
            priority
            imageClassName={project.hero.position}
          />
        </div>
      </section>

      <section
        data-header-theme="light"
        className="flex flex-col items-center gap-44 bg-black-graw py-44 text-white"
      >
        <div className="flex w-full flex-col gap-32 px-16 lg:w-1496 lg:px-0">
          <div className="flex flex-col gap-16 lg:flex-row lg:items-center lg:justify-between">
            <SplitReveal
              as="h1"
              split="chars"
              trigger="load"
              className="text-title"
            >
              {project.title}
            </SplitReveal>
            <p className="text-meta text-orange lg:w-99">{project.category}</p>
          </div>
          {gallery && (
            <Reveal>
              <p className="text-body lg:w-1037">{LOREM_LONG}</p>
            </Reveal>
          )}
        </div>

        <div className="flex w-full flex-col items-center gap-64 px-6 lg:w-1517.5 lg:gap-62 lg:px-0">
          {gallery ? (
            <Gallery gallery={gallery} />
          ) : (
            <div className="flex w-full flex-col gap-10">
              {project.logo && (
                <GalleryImage media={{ ...WIDE_BOX, logo: project.logo }} />
              )}
              <Reveal className="p-10 lg:p-11">
                <div
                  className="relative w-full overflow-hidden"
                  style={{
                    aspectRatio: `${WIDE_BOX.width} / ${WIDE_BOX.height}`,
                  }}
                >
                  <ComingSoon
                    image={project.hero.src}
                    scale="page"
                    sizes="80vw"
                  />
                </div>
              </Reveal>
            </div>
          )}
        </div>

        {gallery?.final && (
          <GalleryImage
            media={gallery.final}
            sizes="100vw"
            className={
              gallery.final.bleed ? "w-full p-0 lg:p-0" : "w-full lg:p-10"
            }
          />
        )}
      </section>
    </>
  );
}
