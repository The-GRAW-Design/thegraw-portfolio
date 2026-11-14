import { StudioPillars } from "@/components/sections/studio-pillars";
import { ParallaxImage } from "@/components/ui/parallax-image";
import { Magnet } from "@/components/ui/react-bits/magnet";
import { Reveal } from "@/components/ui/reveal";
import { STUDIO_PAGE } from "@/constants/pages";

/** Figma "Studio" body: purpose, pillars and foundations, then the video. */
export function StudioContentSection() {
  return (
    <section
      data-header-theme="dark"
      className="bg-paper px-16 py-64 text-black lg:px-0 lg:pt-113 lg:pb-112"
    >
      <StudioPillars />

      <Reveal
        wipe="up"
        className="relative mt-64 flex aspect-[1749/840] w-full items-center justify-center overflow-hidden lg:mx-auto lg:mt-112 lg:w-1749"
      >
        <ParallaxImage
          src={STUDIO_PAGE.videoCover}
          alt=""
          sizes="(min-width: 1024px) 91vw, 100vw"
          settle="scroll"
        />
        {/* The play label drifts toward the cursor (React Bits Magnet). */}
        <Magnet padding={220} magnetStrength={4} maxOffset={60}>
          <span className="relative flex h-48 items-center justify-center bg-glass px-20 text-nav leading-[1.03] text-white lg:h-58 lg:w-116 lg:px-25">
            {STUDIO_PAGE.play}
          </span>
        </Magnet>
      </Reveal>
    </section>
  );
}
