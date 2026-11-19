"use client";

import Image from "next/image";
import { useCallback, useRef, useState, type PointerEvent } from "react";
import { ParallaxImage } from "@/components/ui/parallax-image";
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
/** Parallax travel of the photos, in percent of their height. */
const PHOTO_DRIFT = 3;
/** Photo hover: how far it pans toward the cursor (px) and how much it zooms. */
const PAN = 18;
const PAN_ZOOM = 1.05;
/** Photo swap: the new photo wipes in over the old one, which drifts away. */
const SWAP_DURATION = 1.1;
const SWAP_ZOOM = 1.12;
/** How far the new photo slides in and the old one drifts out (percent). */
const SWAP_SHIFT_IN = 8;
const SWAP_SHIFT_OUT = 12;
/** How dark the old photo gets as it leaves. */
const SWAP_SHADE = 0.55;
/** Clip that hides a photo on the side it comes from. */
const CLIP_SHOWN = "inset(0% 0% 0% 0%)";
const clipHidden = (direction: 1 | -1) =>
  direction === 1 ? "inset(0% 0% 0% 100%)" : "inset(0% 100% 0% 0%)";

/** Figma "Studio" hero: portrait, team member and headline. */
export function StudioHeroSection() {
  const [index, setIndex] = useState(0);
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

  // Swap: the next photo wipes in from the arrow's side, settling from a
  // slight zoom, while the current one drifts the other way and darkens.
  const shownRef = useRef(0);
  const swapRef = useRef<gsap.core.Timeline | null>(null);
  useGSAP(
    () => {
      const from = shownRef.current;
      if (from === index) return;
      shownRef.current = index;
      // A click during a swap finishes it first, so the layers stay in order.
      swapRef.current?.progress(1).kill();

      const slides = gsap.utils.toArray<HTMLElement>("[data-slide]");
      const outgoing = slides[from];
      const incoming = slides[index];
      slides.forEach((slide) => {
        if (slide !== outgoing && slide !== incoming)
          gsap.set(slide, { autoAlpha: 0, zIndex: 0 });
      });
      const reset = () => {
        gsap.set(outgoing, { autoAlpha: 0, zIndex: 0 });
        gsap.set(outgoing.querySelector("[data-slide-inner]"), {
          clearProps: "transform",
        });
        gsap.set(outgoing.querySelector("[data-slide-shade]"), { opacity: 0 });
      };
      gsap.set(incoming, { autoAlpha: 1, zIndex: 2, clipPath: CLIP_SHOWN });
      gsap.set(outgoing, { zIndex: 1, clipPath: CLIP_SHOWN });
      if (reducedMotion) {
        reset();
        return;
      }

      const timeline = gsap.timeline({ onComplete: reset });
      timeline
        .fromTo(
          incoming,
          { clipPath: clipHidden(direction) },
          { clipPath: CLIP_SHOWN, duration: SWAP_DURATION, ease: EASE.inOut },
        )
        .fromTo(
          incoming.querySelector("[data-slide-inner]"),
          { scale: SWAP_ZOOM, xPercent: SWAP_SHIFT_IN * direction },
          {
            scale: 1,
            xPercent: 0,
            duration: SWAP_DURATION * 1.4,
            ease: EASE.expo,
          },
          0,
        )
        .to(
          outgoing.querySelector("[data-slide-inner]"),
          {
            xPercent: -SWAP_SHIFT_OUT * direction,
            duration: SWAP_DURATION,
            ease: EASE.inOut,
          },
          0,
        )
        .to(
          outgoing.querySelector("[data-slide-shade]"),
          { opacity: SWAP_SHADE, duration: SWAP_DURATION, ease: EASE.inOut },
          0,
        );
      swapRef.current = timeline;
    },
    { scope: photoRef, dependencies: [index] },
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

      {/* Each member's photo; a new one wipes in over the last. Isolated, so
          the stacked slides stay under the role headline. */}
      <div
        ref={photoRef}
        onPointerMove={onPhotoMove}
        onPointerLeave={onPhotoLeave}
        className="relative isolate h-[60svh] w-full overflow-hidden lg:absolute lg:inset-y-0 lg:left-0 lg:h-auto lg:w-897"
      >
        <div data-pan className="absolute inset-0">
          {TEAM_MEMBERS.map((person, personIndex) => (
            <div
              key={person.name}
              data-slide
              className={cn(
                "absolute inset-0 overflow-hidden",
                personIndex !== 0 && "invisible",
              )}
            >
              <div data-slide-inner className="absolute inset-0">
                {/* A shorter drift than the default, so its zoom keeps the
                    room above the head. A box wider than the photo (tablets,
                    wide screens) crops it near the top to keep the hair; the
                    thin band of a phone held sideways centres on the eyes. */}
                <ParallaxImage
                  src={person.photo}
                  alt=""
                  priority={personIndex === 0}
                  sizes="(min-width: 1024px) 47vw, 100vw"
                  amount={PHOTO_DRIFT}
                  imageClassName="object-[50%_20%] max-lg:landscape:object-[50%_35%]"
                  settle="load"
                />
              </div>
              <div
                data-slide-shade
                aria-hidden
                className="pointer-events-none absolute inset-0 bg-black-graw opacity-0"
              />
            </div>
          ))}
        </div>
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
