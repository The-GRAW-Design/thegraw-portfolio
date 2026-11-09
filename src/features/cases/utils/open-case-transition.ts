import { COMING_SOON_IMAGE } from "@/constants/projects";
import { DURATION, EASE, gsap } from "@/lib/gsap";
import type { Project } from "@/types/project";

/** Figma "Project Open" hero: 692 of the 1920 frame (60svh on phones). */
const HERO_HEIGHT = 692 / 1920;
const DESKTOP = "(min-width: 64rem)";
/** `ParallaxImage` travel (5% each way) and zoom, to land on its frame. */
const PARALLAX = 5;
const PARALLAX_SCALE = 1 + (PARALLAX * 2.5) / 100;
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

function heroHeight() {
  return window.matchMedia(DESKTOP).matches
    ? window.innerWidth * HERO_HEIGHT
    : window.innerHeight * 0.6;
}

function layer(src: string, className: string) {
  const image = document.createElement("img");
  image.src = src;
  image.alt = "";
  image.decoding = "async";
  image.className = `absolute inset-0 size-full object-cover ${className}`;
  return image;
}

/** Resolves once the project page shows its hero image (or after a while). */
function projectPageReady(slug: string) {
  return new Promise<void>((resolve) => {
    const started = performance.now();
    const check = () => {
      const image = document.querySelector<HTMLImageElement>(
        "[data-project-hero] img",
      );
      const here = window.location.pathname.includes(`/cases/${slug}`);
      if ((here && image?.complete) || performance.now() - started > MAX_WAIT) {
        resolve();
        return;
      }
      requestAnimationFrame(check);
    };
    requestAnimationFrame(check);
  });
}

/**
 * Opens a case from the cases page: its image leaves the collage and grows
 * into the project hero while the stage fades to black and the hero photo
 * comes through; the page changes underneath and the overlay lets go once
 * the project hero is there.
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
  const hero = layer(
    project.hero?.src ?? COMING_SOON_IMAGE,
    project.hero ? (project.hero.position ?? "") : "blur-soon",
  );
  // Where the hero parallax sits at the top of the page: hand over in place.
  const progress = window.innerHeight / (window.innerHeight + heroHeight());
  hero.style.opacity = "0";
  hero.style.transform = `translateY(${-PARALLAX + 2 * PARALLAX * progress}%) scale(${PARALLAX_SCALE})`;
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
      {
        top: 0,
        left: 0,
        width: () => window.innerWidth,
        height: heroHeight,
        duration: DURATION.enterSlow,
      },
      0,
    )
    .to(hero, { opacity: 1, duration: 0.7, ease: EASE.out }, 0.3)
    .call(() => navigate(href), undefined, DURATION.enterSlow);

  void projectPageReady(project.slug).then(() => {
    gsap.to(overlay, {
      opacity: 0,
      duration: 0.6,
      delay: 0.1,
      ease: EASE.out,
      onComplete: () => overlay.remove(),
    });
  });
}
