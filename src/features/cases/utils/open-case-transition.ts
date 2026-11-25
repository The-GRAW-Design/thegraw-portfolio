import { COMING_SOON_IMAGE } from "@/constants/projects";
import { DURATION, EASE, gsap } from "@/lib/gsap";
import type { Project } from "@/types/project";
import { firstGalleryMedia } from "@/utils/project-gallery";

/**
 * Site 2.0 "Project Open": the first gallery box, 1763 wide at (79, 705) of
 * the 1920 frame; phones 14px from the sides, under the name.
 */
const DESKTOP = "(min-width: 64rem)";
const FRAME = 1920;
const BOX = { left: 79, top: 705, width: 1763, height: 1017 } as const;
/** Phones: where the box roughly starts, as a share of the screen height. */
const MOBILE_TOP = 0.45;
/** Longest wait for the project page before the overlay lets go anyway. */
const MAX_WAIT = 4000;

type OpenCaseOptions = {
  /** The case image that was clicked: the overlay starts on its box. */
  source: HTMLElement;
  /** Image shown in it (the case collage, or none for {EM BREVE}). */
  sourceImage: string | null;
  project: Project;
  href: string;
  navigate: (href: string) => void;
};

/** The image a case opens into: its first gallery box, or its hero. */
function landing(project: Project) {
  const media = project.gallery ? firstGalleryMedia(project.gallery) : null;
  const ratio = media ? media.height / media.width : BOX.height / BOX.width;
  const src = media?.src ?? project.hero?.src ?? COMING_SOON_IMAGE;
  return { src, ratio, blurred: !media?.src && !project.hero };
}

/** Where that box sits once the page opens at its top. */
function landingBox(ratio: number) {
  if (window.matchMedia(DESKTOP).matches) {
    const unit = window.innerWidth / FRAME;
    const width = BOX.width * unit;
    return {
      top: BOX.top * unit,
      left: BOX.left * unit,
      width,
      height: width * ratio,
    };
  }
  const width = window.innerWidth - 28;
  return {
    top: window.innerHeight * MOBILE_TOP,
    left: 14,
    width,
    height: width * ratio,
  };
}

function layer(src: string, className: string) {
  const image = document.createElement("img");
  image.src = src;
  image.alt = "";
  image.decoding = "async";
  image.className = `absolute inset-0 size-full object-cover ${className}`;
  return image;
}

/** Resolves with the page's first box once its image is in (or after a while). */
function projectPageReady(slug: string) {
  return new Promise<HTMLElement | null>((resolve) => {
    const started = performance.now();
    const check = () => {
      const box = document.querySelector<HTMLElement>("[data-project-hero]");
      const image = box?.querySelector("img");
      const here = window.location.pathname.includes(`/cases/${slug}`);
      if (here && box && (!image || image.complete)) {
        resolve(box);
        return;
      }
      if (performance.now() - started > MAX_WAIT) {
        resolve(null);
        return;
      }
      requestAnimationFrame(check);
    };
    requestAnimationFrame(check);
  });
}

/**
 * Opens a case: its image leaves the collage and grows into the first box of
 * the project page while the stage fades to the page's dark and that box's
 * image comes through; the page changes underneath, the image settles on the
 * box where it really is, and the overlay lets go.
 */
export function openCaseTransition({
  source,
  sourceImage,
  project,
  href,
  navigate,
}: OpenCaseOptions) {
  const from = source.getBoundingClientRect();

  // Under the header (z-40), over everything else.
  const overlay = document.createElement("div");
  overlay.setAttribute("aria-hidden", "true");
  overlay.className = "pointer-events-auto fixed inset-0 z-30";
  const backdrop = document.createElement("div");
  backdrop.className = "absolute inset-0 bg-black-graw opacity-0";
  const frame = document.createElement("div");
  frame.className = "absolute overflow-hidden bg-coal";
  const target = landing(project);
  const hero = layer(target.src, target.blurred ? "blur-soon" : "");
  hero.style.opacity = "0";
  if (sourceImage) frame.append(layer(sourceImage, ""));
  frame.append(hero);
  overlay.append(backdrop, frame);
  document.body.append(overlay);

  gsap
    .timeline({ defaults: { ease: EASE.inOut } })
    .to(backdrop, { opacity: 1, duration: 0.6, ease: EASE.out }, 0)
    .fromTo(
      frame,
      {
        top: from.top,
        left: from.left,
        width: from.width,
        height: from.height,
      },
      { ...landingBox(target.ratio), duration: DURATION.enterSlow },
      0,
    )
    .to(hero, { opacity: 1, duration: 0.7, ease: EASE.out }, 0.3)
    .call(() => navigate(href), undefined, DURATION.enterSlow);

  void projectPageReady(project.slug).then((box) => {
    const timeline = gsap.timeline({ onComplete: () => overlay.remove() });
    if (box) {
      const rect = box.getBoundingClientRect();
      timeline.to(frame, {
        top: rect.top,
        left: rect.left,
        width: rect.width,
        height: rect.height,
        duration: 0.5,
        ease: EASE.out,
      });
    }
    timeline.to(overlay, { opacity: 0, duration: 0.6, ease: EASE.out });
  });
}
