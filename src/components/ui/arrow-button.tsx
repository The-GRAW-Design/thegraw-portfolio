import type { ButtonHTMLAttributes, CSSProperties } from "react";
import { cn } from "@/utils/cn";

/** The fill's pixels per side. */
const GRID = 6;
/** Time (ms) over which the pixels come in, in a scattered order. */
const SPREAD = 200;

/** Each pixel's delay: a fixed shuffle, so the fill dissolves in at random. */
const PIXEL_DELAYS = (() => {
  const count = GRID * GRID;
  const order = Array.from({ length: count }, (_, index) => index);
  let seed = 7;
  for (let index = count - 1; index > 0; index--) {
    seed = (seed * 16807) % 2147483647;
    const swap = seed % (index + 1);
    [order[index], order[swap]] = [order[swap], order[index]];
  }
  const delays = new Array<number>(count);
  order.forEach((cell, rank) => {
    delays[cell] = Math.round((rank / (count - 1)) * SPREAD);
  });
  return delays;
})();

type ArrowButtonProps = Omit<
  ButtonHTMLAttributes<HTMLButtonElement>,
  "children"
> & {
  /** Which way the chevron points. */
  direction: "prev" | "next";
};

/**
 * Figma arrow box (48px, 26.5px on phones): a chevron over ash at 20% and a
 * light blur. On hover or keyboard focus its inside fills white pixel by
 * pixel (after React Bits "Pixel Transition", like the site's dither), the
 * chevron darkening and nudging the way it points; it gives under a press.
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
        className="absolute inset-0 grid grid-cols-6 grid-rows-6"
      >
        {PIXEL_DELAYS.map((delay, index) => (
          <span
            key={index}
            style={{ "--pixel-delay": `${delay}ms` } as CSSProperties}
            className="bg-white-graw opacity-0 transition-opacity delay-(--pixel-delay) duration-150 ease-power3 group-hover:opacity-100 group-focus-visible:opacity-100"
          />
        ))}
      </span>
      <svg
        aria-hidden
        viewBox="0 0 47.9926 47.9926"
        className={cn(
          "relative block size-full transition-[color,translate] duration-300 ease-power3 group-hover:text-black-graw group-hover:delay-100 group-focus-visible:text-black-graw",
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
