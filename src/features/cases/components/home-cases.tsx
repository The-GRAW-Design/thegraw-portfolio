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
import {
  REST_OPACITY,
  usePieceVisibility,
} from "@/features/cases/hooks/use-piece-visibility";
import {
  createPieceMotion,
  MAIN_PARALLAX,
  PIECE_PARALLAX,
} from "@/features/cases/utils/collage-motion";
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
 * Parallax of the case and of the pieces (× each piece depth), in design px:
 * the cases page's on desktop (cursor), a shorter one with the phone tilt.
 */
const PARALLAX = {
  desktop: { main: MAIN_PARALLAX, pieces: PIECE_PARALLAX },
  phone: { main: 12, pieces: 48 },
} as const;
/** Where the collage box sits from the stage center, in design px (its CSS). */
const BOX_FROM_CENTER = {
  desktop: { x: 668, y: 327.5 },
  phone: { x: 176.5, y: 157 },
} as const;

const pad = (value: number) => String(value).padStart(2, "0");

/**
 * Figma home "Cases" (1920×1080; phones "iPhone 16 - 2"): the collages of
 * the cases page, one at a time, stepped through by the scroll while the
 * section stays pinned. The collage moves like the cases page's: the pieces
 * float and follow the cursor, the hovered one pops and pushes the others
 * away, and they make room for the cursor over the main image; on phones
 * they follow the tilt (left tilts move them left). Phones use the portrait collage
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
  const pieceRefs = useRef<(HTMLElement | null)[][]>([]);
  /** Per case, the inner box of each piece (the one that fades and pops). */
  const innerRefs = useRef<(HTMLElement | null)[][]>([]);
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

  const { repelRef, onPieceEnter, onPieceLeave } = usePieceVisibility({
    innerRefs,
    activeIndex: active,
    caseKey: String(active),
    reducedMotion,
  });

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

      const pointer = { x: 0, y: 0, clientX: 0, clientY: 0, inside: false };
      const onPointerMove = (event: PointerEvent) => {
        if (event.pointerType !== "mouse") return;
        const bounds = stage.getBoundingClientRect();
        pointer.x = ((event.clientX - bounds.left) / bounds.width) * 2 - 1;
        pointer.y = ((event.clientY - bounds.top) / bounds.height) * 2 - 1;
        pointer.clientX = event.clientX;
        pointer.clientY = event.clientY;
        pointer.inside = true;
      };
      const onPointerLeave = () => {
        pointer.x = 0;
        pointer.y = 0;
        pointer.inside = false;
      };
      const smooth = { x: 0, y: 0 };
      const movePieces = createPieceMotion(collage);
      const strength = desktop ? PARALLAX.desktop : PARALLAX.phone;
      const fromCenter = desktop
        ? BOX_FROM_CENTER.desktop
        : BOX_FROM_CENTER.phone;

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

        // The whole case leans with the cursor (or the tilt), like the
        // cases page; the pieces add their own travel on top.
        slideRefs.current.forEach((slide, index) => {
          if (!slide) return;
          const offset = index - position;
          const distance = Math.abs(offset);
          const near = Math.max(0, 1 - distance);
          const x = strength.main * unit * smooth.x * near;
          const y =
            offset * STACK_GAP * height +
            strength.main * unit * smooth.y * near;
          const scale = 1 - AWAY_SCALE * Math.min(distance, 1);
          slide.style.transform = `translate3d(${x.toFixed(2)}px, ${y.toFixed(2)}px, 0) scale(${scale.toFixed(4)})`;
          slide.style.visibility = distance > 1.25 ? "hidden" : "visible";
        });

        // The cursor in collage design px (the case on stage sits at the
        // stage center, like the CSS of its box).
        let cursor: { x: number; y: number } | null = null;
        if (still && desktop && pointer.inside) {
          const bounds = stage.getBoundingClientRect();
          cursor = {
            x:
              (pointer.clientX - bounds.left - bounds.width / 2) / unit +
              fromCenter.x,
            y:
              (pointer.clientY - bounds.top - bounds.height / 2) / unit +
              fromCenter.y,
          };
        }
        const offsets = movePieces({
          frames,
          time,
          still,
          // The cursor as it is (cases page); the tilt already eased.
          input: desktop ? pointer : smooth,
          cursor,
          unit,
          amplitude: unit,
          parallax: strength.pieces,
          repel: repelRef.current,
        });
        offsets.forEach(({ x, y }, index) => {
          const transform = `translate3d(${x.toFixed(2)}px, ${y.toFixed(2)}px, 0)`;
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
    isActive: boolean,
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
          className={cn(
            "absolute will-change-transform",
            isActive && "pointer-events-auto",
          )}
          style={collageBoxStyle(piece, collageSize)}
          onPointerEnter={(event) => {
            if (isActive && event.pointerType === "mouse") onPieceEnter(index);
          }}
          onPointerLeave={() => onPieceLeave(index)}
          onClick={(event) => openCase(event, project, images[index])}
        >
          <div
            ref={(element) => {
              (innerRefs.current[slideIndex] ??= [])[index] = element;
            }}
            className="absolute inset-0 overflow-hidden"
            style={{ opacity: REST_OPACITY }}
          >
            <CollageImage
              src={images[index]}
              sizes="(min-width: 1024px) 21vw, 50vw"
            />
          </div>
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
                {renderPieces(project, index, isActive, true)}
                <Link
                  href={getProjectHref(project)}
                  tabIndex={isActive ? 0 : -1}
                  aria-label={project.name}
                  className={cn(
                    "group absolute block overflow-hidden",
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
                {renderPieces(project, index, isActive, false)}
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
