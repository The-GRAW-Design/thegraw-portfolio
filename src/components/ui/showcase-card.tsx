"use client";

import Image from "next/image";
import Link from "next/link";
import { useRef } from "react";
import { RollText } from "@/components/ui/roll-text";
import { SHOWCASE_LABELS } from "@/constants/projects";
import { EASE, gsap, useGSAP } from "@/lib/gsap";
import { asset } from "@/utils/asset";
import { cn } from "@/utils/cn";

type ShowcaseCardProps = {
  href: string;
  /** Image cropped to the 450.45×605.111 card. */
  image: string;
  handle: string;
  className?: string;
};

/**
 * Figma "Frame 34994": the device shot with the "Explore project" bar and its
 * red arrow box. It unveils from the bottom as it scrolls in.
 */
export function ShowcaseCard({
  href,
  image,
  handle,
  className,
}: ShowcaseCardProps) {
  const ref = useRef<HTMLAnchorElement>(null);

  useGSAP(
    () => {
      const media = gsap.matchMedia();
      media.add("(prefers-reduced-motion: no-preference)", () => {
        const scrollTrigger = {
          trigger: ref.current,
          start: "top 85%",
          once: true,
        };
        gsap.fromTo(
          ref.current,
          { clipPath: "inset(100% 0% 0% 0%)" },
          {
            clipPath: "inset(0% 0% 0% 0%)",
            duration: 1.2,
            ease: EASE.expo,
            scrollTrigger,
          },
        );
        gsap.from("[data-card-image]", {
          scale: 1.2,
          duration: 1.6,
          ease: EASE.expo,
          scrollTrigger,
        });
      });
      return () => media.revert();
    },
    { scope: ref },
  );

  return (
    <Link
      ref={ref}
      href={href}
      className={cn(
        "group relative flex aspect-[450.45/605.111] w-full max-w-450 flex-col justify-end overflow-hidden lg:h-605 lg:w-450.5 lg:max-w-none",
        className,
      )}
    >
      <span data-card-image className="absolute inset-0">
        <Image
          src={image}
          alt=""
          fill
          sizes="(min-width: 1024px) 24vw, 90vw"
          className="object-cover transition-transform duration-700 ease-power3 group-hover:scale-[1.04]"
        />
      </span>
      <span className="relative flex">
        <span className="flex h-48 min-w-0 flex-1 items-center gap-24 bg-night pl-16 whitespace-nowrap lg:h-54 lg:gap-48.25 lg:pl-19.25">
          <span className="text-lead">
            <RollText>{SHOWCASE_LABELS.explore}</RollText>
          </span>
          <span className="text-fine uppercase">{handle}</span>
        </span>
        <Image
          src={asset("/icons/explore-arrow.svg")}
          alt=""
          width={50}
          height={54}
          className="h-48 w-44.5 shrink-0 lg:h-54 lg:w-50.25"
        />
      </span>
    </Link>
  );
}
