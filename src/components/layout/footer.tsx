import Image from "next/image";
import Link from "next/link";
import { RollText } from "@/components/ui/roll-text";
import { UnderReveal } from "@/components/ui/under-reveal";
import { FOOTER_DARK_DITHER, FOOTER_DITHER } from "@/constants/dither";
import { FOOTER_LINKS } from "@/constants/navigation";
import { STUDIO_INFO } from "@/constants/studio";
import { DitherImage } from "@/features/dither-image";
import { asset } from "@/utils/asset";
import { cn } from "@/utils/cn";

const LINK_POSITION = ["lg:left-886", "lg:left-1522"] as const;

type FooterProps = {
  /** `dark`: the shorter black footer of the Figma "all projects" page. */
  tone?: "red" | "dark";
};

/**
 * Figma "Footer" (937px): dithered figure behind the studio details, which
 * are kept together at its bottom. It slides out from under the section
 * above, like the project under the hero.
 */
export function Footer({ tone = "red" }: FooterProps) {
  const [emailUser, emailDomain] = STUDIO_INFO.email.split("@");

  return (
    <footer
      data-header-theme="light"
      className={cn(
        "relative overflow-hidden text-white-graw",
        tone === "red" ? "bg-red-graw lg:h-937" : "bg-black-graw lg:h-608",
      )}
    >
      <UnderReveal className="lg:absolute lg:inset-0">
        <DitherImage
          {...(tone === "red" ? FOOTER_DITHER : FOOTER_DARK_DITHER)}
          animation="scroll"
        />
        {/* The details sit together at the bottom (the Figma 608px block),
            so they come out from under the page above all at once. */}
        <div
          className={cn(
            "relative flex flex-col gap-48 px-16 pt-96 pb-64 lg:absolute lg:inset-x-0 lg:block lg:h-608 lg:p-0",
            tone === "red" ? "lg:bottom-29" : "lg:bottom-0",
          )}
        >
          <Image
            src={asset("/icons/logo-the-graw-wordmark.svg")}
            alt="The Graw"
            width={174}
            height={31}
            className="h-auto w-140 lg:absolute lg:top-24 lg:left-134 lg:w-174"
          />

          <nav aria-label="Rodapé" className="flex gap-48 lg:contents">
            {FOOTER_LINKS.map((link, index) => (
              <Link
                key={link.href}
                href={link.href}
                className={`group text-nav lg:absolute lg:top-10 ${LINK_POSITION[index]}`}
              >
                <RollText>{link.label}</RollText>
              </Link>
            ))}
          </nav>

          <p className="max-w-552 text-nav leading-[1.03] lg:absolute lg:top-157 lg:left-886 lg:w-552">
            {STUDIO_INFO.tagline[0]}
            <br />
            {STUDIO_INFO.tagline[1]}
          </p>

          <div className="grid grid-cols-2 gap-x-24 gap-y-32 text-small lg:contents">
            <p className="leading-[1.2] lg:absolute lg:top-413 lg:left-886">
              by {STUDIO_INFO.founder}
            </p>
            <p className="leading-[1.2] lg:absolute lg:top-413 lg:left-1522">
              {STUDIO_INFO.code}
            </p>
            <p className="lg:absolute lg:top-500 lg:left-138 lg:w-130">
              {STUDIO_INFO.since}
            </p>
            <p className="lg:absolute lg:top-500 lg:left-591 lg:w-146">
              {STUDIO_INFO.instagram}
            </p>
            <p className="lg:absolute lg:top-500 lg:left-886 lg:w-173">
              {STUDIO_INFO.pitch}
            </p>
            <a
              href={`mailto:${STUDIO_INFO.email}`}
              className="underline-offset-4 hover:underline lg:absolute lg:top-500 lg:left-1522 lg:w-130"
            >
              {emailUser}
              <br />@{emailDomain}
            </a>
            <p className="lg:absolute lg:top-446 lg:left-1762 lg:w-57">
              {STUDIO_INFO.phone.map((part, index) => (
                <span key={index} className="block">
                  {part}
                </span>
              ))}
            </p>
          </div>
        </div>
      </UnderReveal>
    </footer>
  );
}
