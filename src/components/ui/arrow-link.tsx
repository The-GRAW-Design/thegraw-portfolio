import Image from "next/image";
import { ShuffleText } from "@/components/ui/shuffle-text";
import { cn } from "@/utils/cn";
import { asset } from "@/utils/asset";

type ArrowLinkProps = {
  href: string;
  children: string;
  tone?: "light" | "dark" | "red";
  className?: string;
};

const TONES = {
  light: { text: "text-white", icon: asset("/icons/arrow-up-right-light.svg") },
  dark: {
    text: "text-black-graw",
    icon: asset("/icons/arrow-up-right-dark.svg"),
  },
  red: { text: "text-red-graw", icon: asset("/icons/arrow-up-right-red.svg") },
} as const;

const ARROW =
  "absolute inset-0 size-20 transition-transform duration-500 ease-expo motion-reduce:transition-none";
const ARROW_OUT =
  "group-hover:translate-x-full group-hover:-translate-y-full group-focus-visible:translate-x-full group-focus-visible:-translate-y-full";
const ARROW_IN =
  "-translate-x-full translate-y-full group-hover:translate-x-0 group-hover:translate-y-0 group-focus-visible:translate-x-0 group-focus-visible:translate-y-0";

/** Uppercase CTA with the Figma "arrow-up-right" icon. */
export function ArrowLink({
  href,
  children,
  tone = "light",
  className,
}: ArrowLinkProps) {
  return (
    <a
      href={href}
      className={cn(
        "group inline-flex items-center gap-8 text-caption uppercase",
        TONES[tone].text,
        className,
      )}
    >
      <ShuffleText>{children}</ShuffleText>
      {/* The arrow leaves through its corner and a copy takes its place. */}
      <span className="relative block size-20 overflow-hidden">
        <Image
          src={TONES[tone].icon}
          alt=""
          width={20}
          height={20}
          className={cn(ARROW, ARROW_OUT)}
        />
        <Image
          src={TONES[tone].icon}
          alt=""
          width={20}
          height={20}
          className={cn(ARROW, ARROW_IN)}
        />
      </span>
    </a>
  );
}
