import { isOpeningPage } from "@/features/page-transition";

/** Phones show the hero's words and sword right away. */
const DESKTOP = "(min-width: 64rem)";

/**
 * Whether the home hero waits for the first scroll to bring in its words and
 * the sword: only on desktop, when the site opens on the home. Otherwise they
 * come in on load (back from another page, or on phones).
 */
export function heroWaitsForScroll() {
  return isOpeningPage() && window.matchMedia(DESKTOP).matches;
}
