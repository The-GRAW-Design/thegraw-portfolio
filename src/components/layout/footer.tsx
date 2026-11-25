import Image from "next/image";
import { TransitionLink } from "@/features/page-transition";
import { ScrollReveal } from "@/components/ui/react-bits/scroll-reveal";
import { Reveal } from "@/components/ui/reveal";
import { ShuffleText } from "@/components/ui/shuffle-text";
import { UnderReveal } from "@/components/ui/under-reveal";
import { FOOTER_GRAW_DITHER } from "@/constants/dither";
import { FOOTER_LINKS_PT } from "@/constants/navigation";
import { STUDIO_INFO, STUDIO_INFO_PT } from "@/constants/studio";
import { DitherImage } from "@/features/dither-image";
import { asset } from "@/utils/asset";

const LINK_CLASS = [
  "lg:left-886 lg:text-footer-link",
  "lg:left-1522 lg:text-footer-studio",
] as const;

/**
 * Site 2.0 footer (Figma home "Footer", 1920×608; "Footer mobile", 393×612):
 * the dark grain with the studio details. It slides out from under the
 * section above.
 */
export function Footer() {
  const [emailUser, emailDomain] = STUDIO_INFO.email.split("@");

  return (
    <footer
      data-header-theme="light"
      className="relative h-612 overflow-hidden bg-black-graw font-flex text-white-graw lg:h-608"
    >
      <UnderReveal className="absolute inset-0">
        <DitherImage {...FOOTER_GRAW_DITHER} animation="scroll" />
        <Reveal stagger={0.05} blur={6} className="absolute inset-0">
          <Image
            data-reveal
            src={asset("/icons/logo-the-graw-wordmark.svg")}
            alt="The Graw"
            width={174}
            height={31}
            className="absolute top-39 left-14 h-auto w-174 lg:top-24 lg:left-134"
          />

          <nav aria-label="Rodapé" className="max-lg:hidden">
            {FOOTER_LINKS_PT.map((link, index) => (
              <TransitionLink
                key={link.href}
                data-reveal
                href={link.href}
                className={`group absolute top-10 ${LINK_CLASS[index]}`}
              >
                <ShuffleText>{link.label}</ShuffleText>
              </TransitionLink>
            ))}
          </nav>

          {/* The words light up as the footer comes out (React Bits
              ScrollReveal). */}
          <ScrollReveal
            tag="p"
            containerClassName="absolute top-99 left-14 w-225.25 text-footer-about lg:top-157 lg:left-886 lg:w-552"
            baseOpacity={0.15}
            blurStrength={5}
            stagger={0.04}
          >
            {STUDIO_INFO_PT.about}
          </ScrollReveal>

          <p
            data-reveal
            className="absolute top-189 left-15 text-small-sm lg:top-500 lg:left-138 lg:w-130 lg:text-small"
          >
            {STUDIO_INFO.since}
          </p>
          {/* Phones: the number on one line; desktop stacks it in a 57px column. */}
          <p
            data-reveal
            className="absolute top-189 left-228 text-small-sm lg:top-446 lg:left-1762 lg:w-57 lg:text-small"
          >
            <span className="lg:hidden">{STUDIO_INFO_PT.phoneInline}</span>
            {STUDIO_INFO.phone.map((part, index) => (
              <span key={index} className="block max-lg:hidden">
                {part}
              </span>
            ))}
          </p>
          <p
            data-reveal
            className="absolute top-242 left-14 text-small-sm lg:top-500 lg:left-591 lg:w-146 lg:text-small"
          >
            {STUDIO_INFO.instagram}
          </p>
          <a
            data-reveal
            href={`mailto:${STUDIO_INFO.email}`}
            className="absolute top-281 left-14 text-small-sm after:absolute after:inset-x-0 after:-bottom-4 after:h-px after:origin-left after:scale-x-0 after:bg-current after:transition-transform after:duration-500 after:ease-expo hover:after:scale-x-100 focus-visible:after:scale-x-100 motion-reduce:after:transition-none lg:top-500 lg:left-1522 lg:w-130 lg:text-small"
          >
            {emailUser}
            <br className="max-lg:hidden" />@{emailDomain}
          </a>
          <p
            data-reveal
            className="absolute top-480 left-15 w-212 text-small-sm lg:top-500 lg:left-886 lg:w-173 lg:text-small"
          >
            {STUDIO_INFO_PT.pitch}
          </p>
          {/* Figma "por André Gonçalves", with the site's dev credit under it. */}
          <p
            data-reveal
            className="absolute top-538 left-15 text-footer-credit lg:top-413 lg:left-886"
          >
            {STUDIO_INFO_PT.founder}
            <br />
            {STUDIO_INFO_PT.developer}
          </p>
          <p
            data-reveal
            className="absolute top-538 right-14 text-footer-credit lg:top-413 lg:right-auto lg:left-1522 lg:text-small lg:leading-[1.2]"
          >
            {STUDIO_INFO.code}
          </p>
        </Reveal>
      </UnderReveal>
    </footer>
  );
}
