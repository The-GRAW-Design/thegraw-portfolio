"use client";

import { useCallback, useRef, useState, type PointerEvent } from "react";
import { ArrowButton } from "@/components/ui/arrow-button";
import { ParallaxImage } from "@/components/ui/parallax-image";
import { ProximityText } from "@/components/ui/proximity-text";
import { SplitReveal } from "@/components/ui/split-reveal";
import { STUDIO_DITHER } from "@/constants/dither";
import { STUDIO_PAGE, TEAM_MEMBERS } from "@/constants/pages";
import { DitherImage } from "@/features/dither-image";
import { useReducedMotion } from "@/hooks/use-reduced-motion";
import { EASE, gsap, useGSAP } from "@/lib/gsap";
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

/**
 * Site 2.0 studio team (Figma ANDRÉ/ALAN/TATÁ/ERIK, 1920×950; phones
 * "Mobile - Estúdio", 393×746): the photo on top, the member's name and bio
 * over it and the role filling the band below. The arrows swap the member.
 */
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
      className="relative h-746 overflow-hidden bg-black-graw font-flex text-white lg:h-950"
    >
      {/* The grain: the band under the photo on phones, the whole frame on
          desktop (a 1080px box from the top, as in the Figma). */}
      <div className="absolute inset-x-0 top-644 h-102 lg:top-0 lg:h-1080">
        <DitherImage {...STUDIO_DITHER} animation="intro" />
      </div>

      {/* Each member's photo; a new one wipes in over the last. Isolated, so
          the stacked slides stay under the name and the role. */}
      <div
        ref={photoRef}
        onPointerMove={onPhotoMove}
        onPointerLeave={onPhotoLeave}
        className="absolute inset-x-0 top-0 isolate h-644 overflow-hidden lg:h-651"
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
                <ParallaxImage
                  src={person.photo}
                  alt=""
                  priority={personIndex === 0}
                  sizes="100vw"
                  amount={PHOTO_DRIFT}
                  imageClassName={person.photoClassName}
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

      {/* Phones: the arrows at the photo's sides and the name over its foot;
          desktop: one card, arrows above the name. */}
      <div
        aria-roledescription="carrossel"
        aria-label="Equipe"
        className={cn(
          "max-lg:contents lg:absolute lg:top-285 lg:flex lg:flex-col lg:gap-37",
          member.cardClassName,
        )}
      >
        {/* RED GRAW sweeps through the arrows on hover (`ArrowButton`). */}
        <div className="absolute top-451 right-14 left-15 flex justify-between lg:static lg:justify-start lg:gap-11">
          <ArrowButton
            direction="prev"
            aria-label="Pessoa anterior"
            onClick={() => go(-1)}
          />
          <ArrowButton
            direction="next"
            aria-label="Próxima pessoa"
            onClick={() => go(1)}
          />
        </div>
        <div
          key={index}
          className="absolute top-494 left-15 flex w-313 flex-col gap-5 lg:static lg:w-auto lg:gap-15"
        >
          <ProximityText
            as="h2"
            trigger="load"
            className="text-member whitespace-nowrap"
          >
            {member.name}
          </ProximityText>
          <SplitReveal
            split="lines"
            trigger="load"
            delay={0.15}
            className="text-bio text-white-graw"
          >
            {member.bio}
          </SplitReveal>
        </div>
      </div>

      {/* The role under the photo: centred on phones, filling the 1822px
          line of the desktop frame. */}
      <ProximityText
        key={index}
        as="p"
        trigger="load"
        delay={0.2}
        className={cn(
          "absolute top-663.25 left-1/2 w-364 -translate-x-1/2 text-center whitespace-nowrap uppercase lg:top-651 lg:left-51 lg:w-1822 lg:translate-x-0 lg:text-left",
          member.roleClassName,
        )}
      >
        {member.role}
      </ProximityText>
    </section>
  );
}
