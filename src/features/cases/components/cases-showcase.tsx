"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useMemo, useRef, useState, type MouseEvent } from "react";
import { CASE_COLLAGE, CASES_PAGE, SERVICE_TABS } from "@/constants/cases";
import { getProjectHref, PROJECTS } from "@/constants/projects";
import { CasesDrawer } from "@/features/cases/components/cases-drawer";
import {
  CollageImage,
  collageBoxStyle,
  COLLAGE_SIZE,
} from "@/features/cases/components/collage-image";
import { SwapText } from "@/features/cases/components/swap-text";
import { usePieceVisibility } from "@/features/cases/hooks/use-piece-visibility";
import { useStepInput } from "@/features/cases/hooks/use-step-input";
import { openCaseTransition } from "@/features/cases/utils/open-case-transition";
import { useReducedMotion } from "@/hooks/use-reduced-motion";
import { ComingSoon } from "@/components/ui/coming-soon";
import { DURATION, EASE, gsap, useGSAP } from "@/lib/gsap";
import type { Project, ServiceId } from "@/types/project";
import { cn } from "@/utils/cn";

/** Share of the eased distance covered per 60fps frame. */
const FOLLOW = 0.18;
/** Distance between stacked cases, in viewport heights. */
const STACK_GAP = 0.92;
/** How much a case shrinks while it is away from the center. */
const AWAY_SCALE = 0.06;
/** Cursor parallax of the main image and of the pieces, in px. */
const MAIN_PARALLAX = 16;
const PIECE_PARALLAX = 70;
/** A hovered piece pushes the others away: strength and falloff, in px. */
const REPEL_STRENGTH = 185;
const REPEL_RANGE = 1000;
/** Share of the push covered per 60fps frame. */
const REPEL_FOLLOW = 0.02;

/** Center of each piece, in Figma px of the collage. */
const PIECE_CENTERS = CASE_COLLAGE.pieces.map(({ rect }) => ({
  x: rect.x + rect.width / 2,
  y: rect.y + rect.height / 2,
}));

/**
 * The collage box: 1276×655 design px, placed like the Figma frame (its main
 * image centered on the page) in `--u`, a design pixel that keeps the whole
 * 1920×1080 composition inside the viewport.
 */
const COLLAGE_BOX =
  "absolute top-[calc(50%-var(--u)*302)] left-[calc(50%-var(--u)*668)] aspect-[1276/655] w-[calc(var(--u)*1276)]";

const pad = (value: number) => String(value).padStart(2, "0");

/**
 * Figma "Cases", with the mechanics of julia-paternostro.com: one case per
 * wheel notch, swipe or arrow key, eased toward the target; the cases stack
 * vertically in an endless loop, shrinking away from the center; the pieces
 * around the main image float, follow the cursor, push away from the hovered
 * one and blink in and out (see `usePieceVisibility`).
 */
export function CasesShowcase() {
  const stageRef = useRef<HTMLElement>(null);
  const viewMoreRef = useRef<HTMLButtonElement>(null);
  const slideRefs = useRef<(HTMLDivElement | null)[]>([]);
  const layerRefs = useRef<(HTMLDivElement | null)[]>([]);
  const pieceRefs = useRef<(HTMLElement | null)[]>([]);
  const innerRefs = useRef<(HTMLElement | null)[]>([]);
  const targetRef = useRef(0);
  const activeRef = useRef(0);
  const [service, setService] = useState<ServiceId>(SERVICE_TABS[0].id);
  const [active, setActive] = useState(0);
  const [direction, setDirection] = useState<1 | -1>(1);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const reducedMotion = useReducedMotion();
  const closeDrawer = useCallback(() => setDrawerOpen(false), []);
  const router = useRouter();

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

  const projects = useMemo(
    () => PROJECTS.filter((project) => project.services.includes(service)),
    [service],
  );
  const count = projects.length;
  const current = projects[active] ?? projects[0];
  const pieces = current?.collage?.pieces;

  const { repelRef, onPieceEnter, onPieceLeave } = usePieceVisibility({
    stageRef,
    innerRefs,
    caseKey: `${service}-${active}`,
    reducedMotion,
  });

  useStepInput(
    stageRef,
    (step) => {
      targetRef.current = Math.round(targetRef.current) + step;
      setDirection(step);
    },
    !drawerOpen && count > 1,
  );

  // Frame loop: position, stack, parallax and float.
  useGSAP(
    () => {
      const stage = stageRef.current;
      if (!stage || count === 0) return;

      targetRef.current = 0;
      activeRef.current = 0;
      let position = 0;
      const pointer = { x: 0, y: 0 };
      const smooth = { x: 0, y: 0 };
      const drift = CASE_COLLAGE.pieces.map(() => ({ x: 0, y: 0 }));
      const push = CASE_COLLAGE.pieces.map(() => ({ x: 0, y: 0 }));

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

      const tick = (time: number, deltaTime: number) => {
        const frames = deltaTime / (1000 / 60);
        const follow = reducedMotion ? 1 : 1 - Math.pow(1 - FOLLOW, frames);
        position += (targetRef.current - position) * follow;
        if (Math.abs(targetRef.current - position) < 0.0005)
          position = targetRef.current;

        const still = reducedMotion ? 0 : 1;
        const lag = 1 - Math.pow(0.9, frames);
        smooth.x += (pointer.x * still - smooth.x) * lag;
        smooth.y += (pointer.y * still - smooth.y) * lag;

        const height = stage.clientHeight;
        // Design px → CSS px, from the rendered collage width.
        const unit =
          (layerRefs.current[0]?.offsetWidth ?? COLLAGE_SIZE.width) /
          COLLAGE_SIZE.width;

        slideRefs.current.forEach((slide, index) => {
          if (!slide) return;
          let offset = (((index - position) % count) + count) % count;
          if (offset > count / 2) offset -= count;
          const distance = Math.abs(offset);
          const near = Math.max(0, 1 - distance);
          const x = MAIN_PARALLAX * smooth.x * near;
          const y =
            offset * STACK_GAP * height + MAIN_PARALLAX * smooth.y * near;
          const scale = 1 - AWAY_SCALE * Math.min(distance, 1);
          slide.style.transform = `translate3d(${x.toFixed(2)}px, ${y.toFixed(2)}px, 0) scale(${scale.toFixed(4)})`;
          slide.style.visibility = distance > 1.25 ? "hidden" : "visible";
        });

        // The pieces belong to the nearest case and leave with it.
        const nearest = Math.round(position);
        const shift = nearest - position;
        layerRefs.current.forEach((layer) => {
          if (!layer) return;
          layer.style.transform = `translate3d(0, ${(shift * STACK_GAP * height).toFixed(2)}px, 0)`;
          layer.style.opacity = Math.max(0, 1 - 7 * Math.abs(shift)).toFixed(3);
        });

        const seconds = time;
        const source = still ? repelRef.current : null;
        const pushLag = 1 - Math.pow(1 - REPEL_FOLLOW, frames);
        CASE_COLLAGE.pieces.forEach((piece, index) => {
          const element = pieceRefs.current[index];
          if (!element) return;
          const [seedX, seedY] = piece.seed;
          const followX = Math.min(1, (0.045 + 0.12 * seedX) * frames);
          const followY = Math.min(1, (0.045 + 0.12 * seedY) * frames);
          const goalX = pointer.x * still * piece.depth * PIECE_PARALLAX;
          const goalY = pointer.y * still * piece.depth * PIECE_PARALLAX;
          drift[index].x += (goalX - drift[index].x) * followX;
          drift[index].y += (goalY - drift[index].y) * followY;
          const floatX =
            still *
            Math.sin(seconds * (0.3 + 0.5 * seedX) + Math.PI * 2 * seedX) *
            (4 + 9 * seedX);
          const floatY =
            still *
            Math.cos(seconds * (0.28 + 0.5 * seedY) + Math.PI * 2 * seedY) *
            (4 + 9 * seedY);

          // Away from the hovered piece, harder the closer it is.
          let pushX = 0;
          let pushY = 0;
          if (source !== null && source !== index) {
            let awayX =
              (PIECE_CENTERS[index].x - PIECE_CENTERS[source].x) * unit;
            let awayY =
              (PIECE_CENTERS[index].y - PIECE_CENTERS[source].y) * unit;
            let distance = Math.hypot(awayX, awayY);
            if (distance < 1) {
              awayX = Math.cos(Math.PI * 2 * seedX);
              awayY = Math.sin(Math.PI * 2 * seedX);
              distance = 1;
            }
            const force = REPEL_STRENGTH * Math.exp(-distance / REPEL_RANGE);
            pushX = (awayX / distance) * force;
            pushY = (awayY / distance) * force;
          }
          push[index].x += (pushX - push[index].x) * pushLag;
          push[index].y += (pushY - push[index].y) * pushLag;

          const x = drift[index].x + floatX + push[index].x;
          const y = drift[index].y + floatY + push[index].y;
          element.style.transform = `translate3d(${x.toFixed(2)}px, ${y.toFixed(2)}px, 0)`;
        });

        const index = ((nearest % count) + count) % count;
        if (index !== activeRef.current) {
          activeRef.current = index;
          setActive(index);
        }
      };

      stage.addEventListener("pointermove", onPointerMove);
      stage.addEventListener("pointerleave", onPointerLeave);
      gsap.ticker.add(tick);
      return () => {
        gsap.ticker.remove(tick);
        stage.removeEventListener("pointermove", onPointerMove);
        stage.removeEventListener("pointerleave", onPointerLeave);
      };
    },
    { dependencies: [count, service, reducedMotion] },
  );

  // First load: the stage settles in.
  useGSAP(
    () => {
      const media = gsap.matchMedia();
      media.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.from("[data-cases-chrome]", {
          autoAlpha: 0,
          y: 24,
          duration: DURATION.enter,
          ease: EASE.out,
          stagger: 0.08,
          delay: 0.3,
        });
        gsap.from("[data-cases-slides]", {
          autoAlpha: 0,
          yPercent: 12,
          scale: 0.94,
          duration: DURATION.enterSlow,
          ease: EASE.expo,
        });
      });
      return () => media.revert();
    },
    { scope: stageRef },
  );

  const pieceLayer = (behind: boolean, layerIndex: number) => (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 will-change-transform"
    >
      <div
        ref={(element) => {
          layerRefs.current[layerIndex] = element;
        }}
        className={COLLAGE_BOX}
      >
        {CASE_COLLAGE.pieces.map((piece, index) =>
          pieces && Boolean(piece.behind) === behind ? (
            <Link
              key={`${current.slug}-${index}`}
              ref={(element) => {
                pieceRefs.current[index] = element;
              }}
              href={current ? getProjectHref(current) : "#"}
              tabIndex={-1}
              draggable={false}
              className="pointer-events-auto absolute will-change-transform"
              style={collageBoxStyle(piece)}
              onPointerEnter={(event) => {
                if (event.pointerType === "mouse") onPieceEnter(index);
              }}
              onPointerLeave={() => onPieceLeave(index)}
              onClick={(event) => openCase(event, current, pieces[index])}
            >
              <div
                ref={(element) => {
                  innerRefs.current[index] = element;
                }}
                className="absolute inset-0 overflow-hidden opacity-0"
              >
                <CollageImage
                  src={pieces[index]}
                  sizes="(min-width: 1024px) 21vw, 30vw"
                />
              </div>
            </Link>
          ) : null,
        )}
      </div>
    </div>
  );

  return (
    <section
      ref={stageRef}
      data-header-theme="light"
      data-lenis-prevent
      aria-roledescription="carrossel"
      aria-label={CASES_PAGE.title}
      className="relative h-svh touch-none overflow-hidden bg-black-graw text-white select-none [--fluid:var(--u)] [--u:calc(100vw/1400)] lg:[--spacing:var(--u)] lg:[--u:min(calc(100vw/1920),calc(100svh/1080))]"
    >
      <h1 className="sr-only">{CASES_PAGE.title}</h1>

      <div data-cases-slides className="absolute inset-0">
        {pieceLayer(true, 0)}
        {projects.map((project, index) => {
          const isActive = index === active;
          return (
            <div
              key={project.slug}
              ref={(element) => {
                slideRefs.current[index] = element;
              }}
              aria-hidden={!isActive}
              className="pointer-events-none absolute inset-0 will-change-transform"
            >
              <div className={COLLAGE_BOX}>
                <Link
                  href={getProjectHref(project)}
                  tabIndex={isActive ? 0 : -1}
                  aria-label={project.name}
                  className={cn(
                    "group absolute block overflow-hidden",
                    isActive && "pointer-events-auto",
                  )}
                  style={collageBoxStyle(CASE_COLLAGE.main)}
                  onClick={(event) =>
                    openCase(event, project, project.collage?.main ?? null)
                  }
                >
                  {project.collage ? (
                    <CollageImage
                      src={project.collage.main}
                      priority={index < 2}
                      className="transition-transform duration-700 ease-power3 group-hover:scale-[1.03]"
                    />
                  ) : (
                    <ComingSoon />
                  )}
                </Link>
              </div>
            </div>
          );
        })}
        {pieceLayer(false, 1)}
      </div>

      <div
        role="group"
        aria-label="Serviços"
        data-cases-chrome
        className="absolute top-72 left-1/2 flex -translate-x-1/2 gap-8 lg:top-29 lg:gap-12"
      >
        {SERVICE_TABS.map((tab) => {
          const pressed = tab.id === service;
          return (
            <button
              key={tab.id}
              type="button"
              aria-pressed={pressed}
              className={cn(
                "flex h-36 items-center px-10 text-tab whitespace-nowrap transition-colors duration-300 ease-power3 lg:h-40 lg:px-11.5",
                pressed
                  ? "bg-red-graw text-white"
                  : "bg-chip text-chip-text hover:text-white",
              )}
              onClick={() => {
                if (pressed) return;
                setService(tab.id);
                setActive(0);
              }}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      <p
        aria-live="polite"
        data-cases-chrome
        className="absolute bottom-96 left-16 text-index uppercase lg:top-[calc(50%-var(--u)*7.5)] lg:bottom-auto lg:left-62 lg:-translate-x-1/2 lg:-translate-y-1/2 lg:-rotate-90"
      >
        <span className="sr-only">Case atual: </span>
        <SwapText direction={direction}>{current?.name ?? ""}</SwapText>
      </p>

      <div
        data-cases-chrome
        className="absolute right-16 bottom-80 flex w-44 flex-col items-center gap-7.25 text-center text-counter lg:top-1/2 lg:right-47 lg:bottom-auto lg:-translate-y-1/2"
      >
        <SwapText direction={direction} className="text-white">
          {pad(active + 1)}
        </SwapText>
        <span aria-hidden className="h-[0.611px] w-full bg-white" />
        <span className="text-dim">
          <span className="sr-only">de </span>
          {pad(count)}
        </span>
      </div>

      <button
        ref={viewMoreRef}
        type="button"
        data-cases-chrome
        aria-haspopup="dialog"
        aria-expanded={drawerOpen}
        className="group absolute bottom-32 left-1/2 -translate-x-1/2 text-more lg:bottom-42"
        onClick={() => setDrawerOpen(true)}
      >
        <span className="relative">
          {CASES_PAGE.viewMore}
          <span className="absolute inset-x-0 -bottom-2 h-px origin-left scale-x-0 bg-current transition-transform duration-300 ease-power3 group-hover:scale-x-100" />
        </span>
      </button>

      <CasesDrawer
        open={drawerOpen}
        onClose={closeDrawer}
        projects={projects}
        returnFocusRef={viewMoreRef}
      />
    </section>
  );
}
