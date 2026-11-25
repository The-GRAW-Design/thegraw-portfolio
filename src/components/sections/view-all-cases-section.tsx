import Image from "next/image";
import { TransitionLink } from "@/features/page-transition";
import { GlareHover } from "@/components/ui/react-bits/glare-hover";
import { ShuffleText } from "@/components/ui/shuffle-text";
import { HOME_PAGE } from "@/constants/pages";
import { cn } from "@/utils/cn";

/**
 * Figma "Frame 35025": a band over a heavily blurred photo (167px; 132px on
 * phones, where it closes the cases screen), to all the projects.
 */
export function ViewAllCasesSection({ className }: { className?: string }) {
  return (
    <section
      data-header-theme="light"
      className={cn("relative shrink-0 bg-black-graw", className)}
    >
      <TransitionLink
        href="/cases/all"
        className="group relative flex h-132 items-center justify-center overflow-hidden text-white lg:h-167"
      >
        <Image
          src={HOME_PAGE.viewAllImage}
          alt=""
          width={640}
          height={360}
          className="absolute -top-629 -left-262 h-1345 w-2390 max-w-none blur-band transition-transform duration-700 ease-power3 group-hover:scale-110"
        />
        {/* A streak runs along the band on hover (React Bits GlareHover). */}
        <GlareHover
          borderRadius="0"
          glareOpacity={0.35}
          glareAngle={-70}
          glareSize={18}
          rimGlint={false}
          transitionDuration={1100}
          className="absolute inset-0 border-0"
        />
        <span className="relative font-flex text-band">
          <ShuffleText>{HOME_PAGE.viewAllCases}</ShuffleText>
        </span>
      </TransitionLink>
    </section>
  );
}
