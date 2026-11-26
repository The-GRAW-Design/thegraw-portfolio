import { HERO_VIDEO_DITHER } from "@/constants/dither";
import { HOME_PAGE } from "@/constants/pages";
import { HeroWords, SwordBackdrop, SwordSlot } from "@/features/hero-sword";

/** The section that slides over the hero (see `ProjectsIntroSection`). */
const HERO_COVER = "[data-hero-cover]";

/**
 * Figma "Desktop - 3" then "Desktop - 2" / "Mobile - home": the dithered
 * knight holds still on screen. When the site opens on it on desktop, it
 * shows the background alone (the knight forms) and the first scroll brings
 * in the blackletter headline, its two lines and the sword (`HeroSword`),
 * which stirs the dither as it lands; otherwise (back from another page, or
 * on phones) they come in on load. After a short hold, the white "Projetos" and then the cases slide
 * over it.
 * It fills the large viewport, so no gap opens under it when a phone's
 * browser bars hide; the words and the sword are placed on the small one
 * (always visible), at Figma's proportions (199 of 852 for the words).
 */
export function HeroSection() {
  const { title, lines } = HOME_PAGE.hero;

  return (
    <>
      <section
        data-header-theme="light"
        className="sticky top-0 h-lvh overflow-hidden bg-black-graw text-white-graw"
      >
        <SwordBackdrop
          {...HERO_VIDEO_DITHER}
          animation="intro"
          coveredBy={HERO_COVER}
        />
        <HeroWords title={title} lines={lines} />
        {/* Where the sword rests: across the headline on desktop, upright on
            the right on phones (Figma "sword 1"). */}
        <SwordSlot
          name="hero"
          rest={{ base: "upright", lg: "flat" }}
          className="absolute top-[9.5svh] left-[80.92%] aspect-[545/3040] h-[79.11svh] -translate-x-1/2 lg:top-416.5 lg:left-80.5 lg:aspect-auto lg:h-314 lg:w-1751.5 lg:translate-x-0"
        />
      </section>
      {/* The hold: the hero stays alone on screen while its words and the
          sword come in, before "Projetos" rises over it. */}
      <div aria-hidden data-header-theme="light" className="h-[70svh]" />
    </>
  );
}
