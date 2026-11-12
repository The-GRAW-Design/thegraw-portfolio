import Image from "next/image";
import Link from "next/link";
import { ShuffleText } from "@/components/ui/shuffle-text";
import { HOME_PAGE } from "@/constants/pages";

/** Figma "Frame 35025": a 56px band over a heavily blurred photo, to the cases. */
export function ViewAllCasesSection() {
  return (
    <section data-header-theme="light" className="relative bg-black-graw">
      <Link
        href="/cases"
        className="group relative flex h-56 items-center justify-center overflow-hidden text-white"
      >
        <Image
          src={HOME_PAGE.viewAllImage}
          alt=""
          width={640}
          height={360}
          className="absolute top-[-33vw] -left-[14vw] h-[70vw] w-[125vw] max-w-none blur-band transition-transform duration-700 ease-power3 group-hover:scale-110 lg:-top-629 lg:-left-262 lg:h-1345 lg:w-2390"
        />
        <span className="relative text-body leading-normal">
          <ShuffleText>{HOME_PAGE.viewAllCases}</ShuffleText>
        </span>
      </Link>
    </section>
  );
}
