"use client";

import Image from "next/image";
import { TransitionLink } from "@/features/page-transition";
import { useState } from "react";
import { ParallaxImage } from "@/components/ui/parallax-image";
import { GlareHover } from "@/components/ui/react-bits/glare-hover";
import { Magnet } from "@/components/ui/react-bits/magnet";
import { SplitReveal } from "@/components/ui/split-reveal";
import { STUDIO_DITHER } from "@/constants/dither";
import { STUDIO_PAGE, TEAM_MEMBERS } from "@/constants/pages";
import { FEATURED_PROJECT, getProjectHref } from "@/constants/projects";
import { DitherImage } from "@/features/dither-image";
import { asset } from "@/utils/asset";
import { cn } from "@/utils/cn";

const MEMBER_COUNT = TEAM_MEMBERS.length;

/** Figma "Studio" hero: portrait, team member, project lead card and headline. */
export function StudioHeroSection() {
  const [index, setIndex] = useState(0);
  const member = TEAM_MEMBERS[index];
  const go = (step: number) =>
    setIndex((current) => (current + step + MEMBER_COUNT) % MEMBER_COUNT);

  return (
    <section
      data-header-theme="light"
      className="@container relative flex min-h-svh flex-col overflow-hidden bg-black-graw text-white lg:block lg:h-svh"
    >
      <DitherImage {...STUDIO_DITHER} animation="intro" />

      <div className="relative h-[60svh] w-full lg:absolute lg:inset-y-0 lg:left-0 lg:h-auto lg:w-897">
        <ParallaxImage
          src={STUDIO_PAGE.portrait}
          alt=""
          priority
          sizes="(min-width: 1024px) 47vw, 100vw"
          imageClassName="object-[50%_30%]"
          settle="load"
        />
      </div>

      <h1 className="sr-only">{STUDIO_PAGE.title}</h1>

      <div
        aria-roledescription="carrossel"
        aria-label="Equipe"
        className="relative flex flex-col gap-24 px-16 pt-32 lg:absolute lg:top-88 lg:left-960 lg:w-556 lg:gap-37 lg:p-0"
      >
        {/* The arrows pull toward the cursor (React Bits Magnet). */}
        <div className="flex gap-11">
          <Magnet padding={36} magnetStrength={3} maxOffset={10}>
            <button
              type="button"
              aria-label="Pessoa anterior"
              className="block transition-[scale] duration-300 ease-power3 active:scale-90"
              onClick={() => go(-1)}
            >
              <Image
                src={asset("/icons/arrow-prev.svg")}
                alt=""
                width={48}
                height={48}
                className="size-40 rotate-180 lg:size-48"
              />
            </button>
          </Magnet>
          <Magnet padding={36} magnetStrength={3} maxOffset={10}>
            <button
              type="button"
              aria-label="Próxima pessoa"
              className="block transition-[scale] duration-300 ease-power3 active:scale-90"
              onClick={() => go(1)}
            >
              <Image
                src={asset("/icons/arrow-next.svg")}
                alt=""
                width={48}
                height={48}
                className="size-40 lg:size-48"
              />
            </button>
          </Magnet>
        </div>
        <div key={index} className="flex flex-col gap-15">
          <SplitReveal
            as="h2"
            split="chars"
            trigger="load"
            className="text-subheading leading-[1.2] tracking-tight whitespace-nowrap"
          >
            {member.name}
          </SplitReveal>
          <SplitReveal
            split="lines"
            trigger="load"
            delay={0.15}
            className="text-nav leading-[1.03] text-white-graw lg:h-271"
          >
            {member.bio}
          </SplitReveal>
        </div>
      </div>

      <div className="relative flex flex-col gap-12 px-16 pt-32 lg:absolute lg:top-[50.46%] lg:left-1475 lg:p-0">
        <p className="text-label">{STUDIO_PAGE.projectsLead}</p>
        <TransitionLink
          href={getProjectHref(FEATURED_PROJECT)}
          className="group flex items-center"
        >
          <span className="relative block h-90 w-160 overflow-hidden lg:h-150 lg:w-267">
            <Image
              src={STUDIO_PAGE.projectsLeadImage}
              alt={FEATURED_PROJECT.name}
              fill
              sizes="(min-width: 1024px) 14vw, 160px"
              className="object-cover transition-transform duration-500 ease-power3 group-hover:scale-105"
            />
            <GlareHover
              borderRadius="0"
              glareOpacity={0.3}
              glareAngle={-35}
              glareSize={45}
              rimGlint={false}
              transitionDuration={800}
              className="absolute inset-0 border-0"
            />
          </span>
          <span className="flex h-90 w-56 items-center justify-center bg-wine lg:h-150 lg:w-93">
            <Image
              src={asset("/icons/chevron-right-light.svg")}
              alt=""
              width={37}
              height={37}
              className="size-24 transition-transform duration-300 ease-power3 group-hover:translate-x-3 lg:size-36.5"
            />
          </span>
        </TransitionLink>
      </div>

      {/* Scaled with the section (not the viewport) and its Figma side margin,
          so the line fits the width that is really there. */}
      <SplitReveal
        key={index}
        as="p"
        split="chars"
        trigger="load"
        delay={0.2}
        className={cn(
          "relative mt-auto px-[calc(var(--fluid)*50)] pt-48 pb-16 whitespace-nowrap [--fluid:calc(100cqw/1920)] lg:absolute lg:mt-0 lg:p-0",
          member.roleClassName,
        )}
      >
        {member.role}
      </SplitReveal>
    </section>
  );
}
