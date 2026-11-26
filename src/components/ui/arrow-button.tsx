import type { ButtonHTMLAttributes } from "react";
import { cn } from "@/utils/cn";

type ArrowButtonProps = Omit<
  ButtonHTMLAttributes<HTMLButtonElement>,
  "children"
> & {
  /** Which way the chevron points. */
  direction: "prev" | "next";
};

/**
 * Figma arrow box (48px, 26.5px on phones): a chevron over ash at 20% and a
 * light blur. On hover or keyboard focus RED GRAW sweeps in from behind the
 * chevron and, on leaving, sweeps on out the way it points, while the
 * chevron nudges that way; it gives under a press.
 */
export function ArrowButton({
  direction,
  className,
  type = "button",
  ...props
}: ArrowButtonProps) {
  const back = direction === "prev";

  return (
    <button
      type={type}
      className={cn(
        "group relative block size-26.5 overflow-hidden bg-ash/20 text-white-graw backdrop-blur-[1.2px] transition-[scale] duration-300 ease-power3 active:scale-90 lg:size-48",
        className,
      )}
      {...props}
    >
      <span
        aria-hidden
        className={cn(
          "absolute inset-0 scale-x-0 bg-red-graw transition-[scale] duration-350 ease-power3 group-hover:scale-x-100 group-focus-visible:scale-x-100",
          back
            ? "origin-left group-hover:origin-right group-focus-visible:origin-right"
            : "origin-right group-hover:origin-left group-focus-visible:origin-left",
        )}
      />
      <svg
        aria-hidden
        viewBox="0 0 47.9926 47.9926"
        className={cn(
          "relative block size-full transition-[translate] duration-350 ease-power3",
          back
            ? "-scale-x-100 group-hover:-translate-x-4 group-focus-visible:-translate-x-4"
            : "group-hover:translate-x-4 group-focus-visible:translate-x-4",
        )}
      >
        <path
          d="M18.0956 40.125L32.2574 25.5699L18.0956 11.0147"
          fill="none"
          stroke="currentColor"
          strokeWidth={1.57353}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </button>
  );
}
