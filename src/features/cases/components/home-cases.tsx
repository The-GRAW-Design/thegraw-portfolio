"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useRef, useState, type MouseEvent, type ReactNode } from "react";
import { Counter } from "@/components/ui/react-bits/counter";
import { CASE_COLLAGE, CASE_COLLAGE_MOBILE } from "@/constants/cases";
import { HOME_PAGE } from "@/constants/pages";
import { findProject, getProjectHref } from "@/constants/projects";
import {
  CollageImage,
  collageBoxStyle,
  COLLAGE_SIZE,
  COLLAGE_SIZE_MOBILE,
} from "@/features/cases/components/collage-image";
import { SwapText } from "@/features/cases/components/swap-text";
import { openCaseTransition } from "@/features/cases/utils/open-case-transition";
import { useDeviceTilt } from "@/hooks/use-device-tilt";
import { useMediaQuery } from "@/hooks/use-media-query";
import { useReducedMotion } from "@/hooks/use-reduced-motion";
import { gsap, ScrollTrigger, useGSAP } from "@/lib/gsap";
import type { Project, ProjectCollage } from "@/types/project";
import { cn } from "@/utils/cn";

type CaseWithCollage = Project & { collage: ProjectCollage };

const CASES = HOME_PAGE.cases
  .map((slug) => findProject(slug))
  .filter((project): project is CaseWithCollage => Boolean(project?.collage));

/** Scroll per case, in viewport heights, while the section is pinned. */
const SCROLL_PER_CASE = 0.85;
/** Share of the eased distance covered per 60fps frame. */
const FOLLOW = 0.16;
/** Distance between stacked cases, in stage heights. */
const STACK_GAP = 0.92;
/** How much a case shrinks while it is away from the center. */
const AWAY_SCALE = 0.06;
/**
 * Parallax of the main image and the pieces (× each piece depth), in design
 * px: following the cursor on desktop, the phone tilt on phones.
 */
const PARALLAX = {
  desktop: { main: 16, pieces: 70 },
  phone: { main: 12, pieces: 48 },
} as const;

const pad = (value: number) => String(value).padStart(2, "0");

/**
 * Figma home "Cases" (1920×1080; phones "iPhone 16 - 2"): the collages of
 * the cases page, one at a time, stepped through by the scroll while the
 * section stays pinned. The pieces float and follow the cursor, or the tilt
 * of the phone (left tilts move them left). Phones use the portrait collage
 * and keep the "Ver todos" band at the bottom of the same screen.
 */
type HomeCasesProps = {
  /** Phones: the "Ver todos" band, kept at the bottom of the pinned screen. */
  band?: ReactNode;
};

export function HomeCases({ band }: HomeCasesProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const slideRefs = useRef<(HTMLDivElement | null)[]>([]);
  const mainRefs = useRef<(HTMLElement | null)[]>([]);
  const pieceRefs = useRef<(HTMLElement | null)[][]>([]);
  const boxRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [active, setActive] = useState(0);
  const [direction, setDirection] = useState<1 | -1>(1);
  const desktop = useMediaQuery("(min-width: 64rem)");
  const reducedMotion = useReducedMotion();
  const tilt = useDeviceTilt(!desktop && !reducedMotion);
  const router = useRouter();
  const count = CASES.length;
  const collage = desktop ? CASE_COLLAGE : CASE_COLLAGE_MOBILE;
  const collageSize = desktop ? COLLAGE_SIZE : COLLAGE_SIZE_MOBILE;
  const current = CASES[active];

  // A plain click opens the case with the image growing into its hero.
  const openCase = (
    event: MouseEvent<HTMLAnchorElement>,
    project: Project,
    sourceImage: string | null,
  ) => {
    if (
      reducedMotion ||
      event.button !== 0 ||
      event.metaKey ||
      event.ctrlKey ||
      event.shiftKey ||
      event.altKey
    )
      return;
    event.preventDefault();
    openCaseTransition({
      source: event.currentTarget,
      sourceImage,
      project,
      href: getProjectHref(project),
      navigate: (href) => router.push(href),
    });
  };

  useGSAP(
    () => {
      const section = sectionRef.current;
      const stage = stageRef.current;
      if (!section || !stage || count === 0) return;

      let target = 0;
      let position = 0;
      let shown = 0;
      const trigger = ScrollTrigger.create({
        trigger: section,
        pin: true,
        start: "top top",
        end: () => `+=${(count - 1) * window.innerHeight * SCROLL_PER_CASE}`,
        invalidateOnRefresh: true,
        // One case per stretch of scroll: the stack eases to the nearest.
        onUpdate: (self) => {
          target = Math.round(self.progress * (count - 1));
        },
      });

      const pointer = { x: 0, y: 0 };
      const onPointerMove = (event: PointerEvent) => {
        if (event.pointerType !== "mouse") return;
        const bounds = stage.getBoundingClientRect();
        pointer.x = ((event.clientX - bounds.left) / bounds.width) * 2 - 1;
        pointer.y = ((event.clientY - bounds.top) / bounds.height) * 2 - 1;
      };
      const onPointerLeave = () => {
        pointer.x = 0;
        pointer.y = 0;
      };
      const smooth = { x: 0, y: 0 };
      const drift = collage.pieces.map(() => ({ x: 0, y: 0 }));
      const strength = desktop ? PARALLAX.desktop : PARALLAX.phone;

      const tick = (time: number, deltaTime: number) => {
        const frames = deltaTime / (1000 / 60);
        const follow = reducedMotion ? 1 : 1 - Math.pow(1 - FOLLOW, frames);
        position += (target - position) * follow;
        if (Math.abs(target - position) < 0.0005) position = target;

        const still = reducedMotion ? 0 : 1;
        const input = desktop ? pointer : tilt.current;
        const lag = 1 - Math.pow(0.9, frames);
        smooth.x += (input.x * still - smooth.x) * lag;
        smooth.y += (input.y * still - smooth.y) * lag;

        // Design px of the collage -> CSS px.
        const unit =
          (boxRefs.current[0]?.offsetWidth ?? collageSize.width) /
          collageSize.width;
        const height = stage.clientHeight;

        slideRefs.current.forEach((slide, index) => {
          if (!slide) return;
          const offset = index - position;
          const distance = Math.abs(offset);
          const near = Math.max(0, 1 - distance);
          const scale = 1 - AWAY_SCALE * Math.min(distance, 1);
          slide.style.transform = `translate3d(0, ${(offset * STACK_GAP * height).toFixed(2)}px, 0) scale(${scale.toFixed(4)})`;
          slide.style.visibility = distance > 1.25 ? "hidden" : "visible";
          const main = mainRefs.current[index];
          if (main) {
            const x = strength.main * unit * smooth.x * near;
            const y = strength.main * unit * smooth.y * near;
            main.style.transform = `translate3d(${x.toFixed(2)}px, ${y.toFixed(2)}px, 0)`;
          }
        });

        collage.pieces.forEach((piece, index) => {
          const [seedX, seedY] = piece.seed;
          const followX = Math.min(1, (0.045 + 0.12 * seedX) * frames);
          const followY = Math.min(1, (0.045 + 0.12 * seedY) * frames);
          const reach = piece.depth * strength.pieces * unit;
          drift[index].x += (smooth.x * reach - drift[index].x) * followX;
          drift[index].y += (smooth.y * reach - drift[index].y) * followY;
          const floatX =
            still *
            Math.sin(time * (0.3 + 0.5 * seedX) + Math.PI * 2 * seedX) *
            (4 + 9 * seedX) *
            unit;
          const floatY =
            still *
            Math.cos(time * (0.28 + 0.5 * seedY) + Math.PI * 2 * seedY) *
            (4 + 9 * seedY) *
            unit;
          const transform = `translate3d(${(drift[index].x + floatX).toFixed(2)}px, ${(drift[index].y + floatY).toFixed(2)}px, 0)`;
          pieceRefs.current.forEach((pieces) => {
            const element = pieces?.[index];
            if (element) element.style.transform = transform;
          });
        });

        const nearest = Math.min(count - 1, Math.max(0, Math.round(position)));
        if (nearest !== shown) {
          setDirection(nearest > shown ? 1 : -1);
          shown = nearest;
          setActive(nearest);
        }
      };

      // Runs only while the section is on screen.
      const observer = new IntersectionObserver(([entry]) => {
        gsap.ticker.remove(tick);
        if (entry.isIntersecting) gsap.ticker.add(tick);
      });
      observer.observe(section);
      stage.addEventListener("pointermove", onPointerMove);
      stage.addEventListener("pointerleave", onPointerLeave);
      return () => {
        observer.disconnect();
        gsap.ticker.remove(tick);
        trigger.kill();
        stage.removeEventListener("pointermove", onPointerMove);
        stage.removeEventListener("pointerleave", onPointerLeave);
      };
    },
    { dependencies: [count, desktop, reducedMotion], revertOnUpdate: true },
  );

  const renderPieces = (
    project: CaseWithCollage,
    slideIndex: number,
    behind: boolean,
  ) => {
    const images = project.collage.pieces;
    if (!images) return null;
    return collage.pieces.map((piece, index) =>
      Boolean(piece.behind) === behind ? (
        <Link
          key={index}
          ref={(element) => {
            (pieceRefs.current[slideIndex] ??= [])[index] = element;
          }}
          href={getProjectHref(project)}
          tabIndex={-1}
          aria-hidden
          draggable={false}
          className="pointer-events-auto absolute overflow-hidden will-change-transform"
          style={collageBoxStyle(piece, collageSize)}
          onClick={(event) => openCase(event, project, images[index])}
        >
          <CollageImage
            src={images[index]}
            sizes="(min-width: 1024px) 21vw, 50vw"
          />
        </Link>
      ) : null,
    );
  };

  return (
    <section
      ref={sectionRef}
      data-header-theme="light"
      aria-roledescription="carrossel"
      aria-label={HOME_PAGE.casesLabel}
      className="relative flex h-svh flex-col bg-black-graw text-white"
    >
      <div
        ref={stageRef}
        className="relative flex-1 overflow-hidden select-none [--u:min(calc(100vw/393),calc((100svh-var(--spacing)*132)/720))] lg:[--u:min(calc(100vw/1920),calc(100svh/1080))]"
      >
        {CASES.map((project, index) => {
          const isActive = index === active;
          const main =
            !desktop && project.collage.mainPortrait
              ? project.collage.mainPortrait
              : project.collage.main;
          return (
            <div
              key={project.slug}
              ref={(element) => {
                slideRefs.current[index] = element;
              }}
              aria-hidden={!isActive}
              className="pointer-events-none absolute inset-0 will-change-transform"
            >
              <div
                ref={(element) => {
                  boxRefs.current[index] = element;
                }}
                className="absolute top-[calc(50%-var(--u)*157)] left-[calc(50%-var(--u)*176.5)] aspect-[354/460] w-[calc(var(--u)*354)] lg:top-[calc(50%-var(--u)*327.5)] lg:left-[calc(50%-var(--u)*668)] lg:aspect-[1276/655] lg:w-[calc(var(--u)*1276)]"
              >
                {renderPieces(project, index, true)}
                <Link
                  ref={(element) => {
                    mainRefs.current[index] = element;
                  }}
                  href={getProjectHref(project)}
                  tabIndex={isActive ? 0 : -1}
                  aria-label={project.name}
                  className={cn(
                    "group absolute block overflow-hidden will-change-transform",
                    isActive && "pointer-events-auto",
                  )}
                  style={collageBoxStyle(collage.main, collageSize)}
                  onClick={(event) => openCase(event, project, main)}
                >
                  <CollageImage
                    src={main}
                    priority={index === 0}
                    className="transition-transform duration-700 ease-power3 group-hover:scale-[1.03]"
                  />
                </Link>
                {renderPieces(project, index, false)}
              </div>
            </div>
          );
        })}

        {/* Phones: the name and the counter in a row above the collage, and
            a bar at each side (Figma "Frame 35058"). */}
        <p
          aria-live="polite"
          className="absolute top-[calc(50%-var(--u)*211.5)] left-14 font-flex text-index uppercase lg:top-1/2 lg:left-62 lg:-translate-x-1/2 lg:-translate-y-1/2 lg:-rotate-90"
        >
          <span className="sr-only">Case atual: </span>
          <SwapText direction={direction}>{current?.name ?? ""}</SwapText>
        </p>
        <div className="absolute top-[calc(50%-var(--u)*218)] right-15 flex items-center gap-7.25 font-flex text-counter-sm lg:top-1/2 lg:right-47 lg:w-44 lg:-translate-y-1/2 lg:flex-col lg:text-counter">
          <span className="text-red-graw lg:text-white">
            <Counter value={active + 1} minDigits={2} />
          </span>
          <span
            aria-hidden
            className="h-19 w-[0.5px] bg-white lg:h-[0.611px] lg:w-full"
          />
          <span className="text-dim">
            <span className="sr-only">de </span>
            {pad(count)}
          </span>
        </div>
        <span
          aria-hidden
          className="absolute top-[calc(50%+var(--u)*32)] left-10.5 h-[calc(var(--u)*92)] w-2 rounded-full bg-ash lg:hidden"
        />
        <span
          aria-hidden
          className="absolute top-[calc(50%+var(--u)*32)] right-8.5 h-[calc(var(--u)*92)] w-2 rounded-full bg-ash lg:hidden"
        />
      </div>
      {band}
    </section>
  );
}
