"use client";

import Image from "next/image";
import { useCallback, useRef, useState, type PointerEvent } from "react";
import { ParallaxImage } from "@/components/ui/parallax-image";
import { PixelSwap } from "@/components/ui/pixel-swap";
import { ProximityText } from "@/components/ui/proximity-text";
import { Magnet } from "@/components/ui/react-bits/magnet";
import { SplitReveal } from "@/components/ui/split-reveal";
import { STUDIO_DITHER } from "@/constants/dither";
import { STUDIO_PAGE, TEAM_MEMBERS } from "@/constants/pages";
import { DitherImage } from "@/features/dither-image";
import { useReducedMotion } from "@/hooks/use-reduced-motion";
import { EASE, gsap, useGSAP } from "@/lib/gsap";
import { asset } from "@/utils/asset";
import { cn } from "@/utils/cn";

const MEMBER_COUNT = TEAM_MEMBERS.length;
/** Photo hover: how far it pans toward the cursor (px) and how much it zooms. */
const PAN = 18;
const PAN_ZOOM = 1.05;

/** Figma "Studio" hero: portrait, team member and headline. */
export function StudioHeroSection() {
  const [index, setIndex] = useState(0);
  /** The photo on screen: it changes under the pixels, halfway through the swap. */
  const [shown, setShown] = useState(0);
  const [direction, setDirection] = useState<1 | -1>(1);
  const member = TEAM_MEMBERS[index];
  const go = (step: 1 | -1) => {
    setDirection(step);
    setIndex((current) => (current + step + MEMBER_COUNT) % MEMBER_COUNT);
  };

  const photoRef = useRef<HTMLDivElement>(null);
  const panTo = useRef<{
    x: (value: number) => void;
    y: (value: number) => void;
    scale: (value: number) => void;
  } | null>(null);
  const reducedMotion = useReducedMotion();

  useGSAP(
    () => {
      const pan = photoRef.current?.querySelector("[data-pan]");
      if (!pan || reducedMotion) return;
      const options = { duration: 0.9, ease: EASE.out };
      // `quickTo` takes one real property: "scale" is split into its axes.
      const scaleX = gsap.quickTo(pan, "scaleX", options);
      const scaleY = gsap.quickTo(pan, "scaleY", options);
      panTo.current = {
        x: gsap.quickTo(pan, "x", options),
        y: gsap.quickTo(pan, "y", options),
        scale: (value) => {
          scaleX(value);
          scaleY(value);
        },
      };
      return () => {
        panTo.current = null;
      };
    },
    { scope: photoRef, dependencies: [reducedMotion] },
  );

  // The photo leans toward the cursor and zooms in a little.
  const onPhotoMove = useCallback((event: PointerEvent<HTMLDivElement>) => {
    const pan = panTo.current;
    if (!pan || event.pointerType !== "mouse") return;
    const bounds = event.currentTarget.getBoundingClientRect();
    const x = (event.clientX - bounds.left) / bounds.width - 0.5;
    const y = (event.clientY - bounds.top) / bounds.height - 0.5;
    pan.x(x * PAN);
    pan.y(y * PAN);
    pan.scale(PAN_ZOOM);
  }, []);
  const onPhotoLeave = useCallback(() => {
    const pan = panTo.current;
    if (!pan) return;
    pan.x(0);
    pan.y(0);
    pan.scale(1);
  }, []);

  return (
    <section
      data-header-theme="light"
      className="@container relative flex min-h-svh flex-col overflow-hidden bg-black-graw text-white lg:block lg:h-svh"
    >
      <DitherImage {...STUDIO_DITHER} animation="intro" />

      {/* Each member's photo; a new one comes in under a sweep of pixels. */}
      <div
        ref={photoRef}
        onPointerMove={onPhotoMove}
        onPointerLeave={onPhotoLeave}
        className="relative h-[60svh] w-full overflow-hidden lg:absolute lg:inset-y-0 lg:left-0 lg:h-auto lg:w-897"
      >
        <div data-pan className="absolute inset-0">
          {TEAM_MEMBERS.map((person, personIndex) => (
            <ParallaxImage
              key={person.name}
              src={person.photo}
              alt=""
              priority={personIndex === 0}
              sizes="(min-width: 1024px) 47vw, 100vw"
              className={personIndex === shown ? "opacity-100" : "opacity-0"}
              settle="load"
            />
          ))}
        </div>
        <PixelSwap index={index} direction={direction} onSwap={setShown} />
      </div>

      <h1 className="sr-only">{STUDIO_PAGE.title}</h1>

      <div
        aria-roledescription="carrossel"
        aria-label="Equipe"
        className={cn(
          "relative flex flex-col gap-24 px-16 pt-32 lg:absolute lg:top-88 lg:left-960 lg:gap-37 lg:p-0",
          member.cardClassName,
        )}
      >
        {/* The arrows pull toward the cursor (React Bits Magnet) and nudge
            the way they point. */}
        <div className="flex gap-11">
          <Magnet padding={36} magnetStrength={3} maxOffset={10}>
            <button
              type="button"
              aria-label="Pessoa anterior"
              className="group block transition-[scale] duration-300 ease-power3 active:scale-90"
              onClick={() => go(-1)}
            >
              <Image
                src={asset("/icons/arrow-prev.svg")}
                alt=""
                width={48}
                height={48}
                className="size-40 rotate-180 transition-[translate,opacity] duration-300 ease-power3 group-hover:-translate-x-6 group-hover:opacity-80 lg:size-48"
              />
            </button>
          </Magnet>
          <Magnet padding={36} magnetStrength={3} maxOffset={10}>
            <button
              type="button"
              aria-label="Próxima pessoa"
              className="group block transition-[scale] duration-300 ease-power3 active:scale-90"
              onClick={() => go(1)}
            >
              <Image
                src={asset("/icons/arrow-next.svg")}
                alt=""
                width={48}
                height={48}
                className="size-40 transition-[translate,opacity] duration-300 ease-power3 group-hover:translate-x-6 group-hover:opacity-80 lg:size-48"
              />
            </button>
          </Magnet>
        </div>
        <div key={index} className="flex flex-col gap-15">
          <ProximityText
            as="h2"
            trigger="load"
            className="text-subheading leading-[1.2] tracking-tight whitespace-nowrap"
          >
            {member.name}
          </ProximityText>
          <SplitReveal
            split="lines"
            trigger="load"
            delay={0.15}
            // 2 design px of slack: the browser measures some lines a hair
            // wider than the Figma box (0.4px on André's first line).
            className="text-nav leading-[1.03] text-white-graw lg:h-271 lg:w-[calc(100%+var(--spacing)*2)]"
          >
            {member.bio}
          </SplitReveal>
        </div>
      </div>

      {/* Scaled with the section (not the viewport) and its Figma side margin,
          so the line fits the width that is really there. */}
      <ProximityText
        key={index}
        as="p"
        trigger="load"
        delay={0.2}
        className={cn(
          "relative mt-auto px-[calc(var(--fluid)*50)] pt-48 pb-16 whitespace-nowrap [--fluid:calc(100cqw/1920)] lg:absolute lg:mt-0 lg:p-0",
          member.roleClassName,
        )}
      >
        {member.role}
      </ProximityText>
    </section>
  );
}
