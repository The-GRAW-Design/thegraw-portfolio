/** Path of a URL without its trailing slash (`/` for the home). */
function trimPath(pathname: string) {
  return pathname.replace(/\/+$/, "") || "/";
}

/**
 * The page the site opened on: read once, when the app first loads (this
 * module comes with the layout), so client navigations never change it.
 */
const openingPath =
  typeof window === "undefined" ? null : trimPath(window.location.pathname);

/** The visitor has gone to another page since the site opened. */
let movedOn = false;

/** Called by the page transition whenever the route changes. */
export function markPageChange() {
  movedOn = true;
}

/**
 * True while the visitor is still on the page the site opened with (a first
 * visit to it): false once they come back to it from another page.
 */
export function isOpeningPage() {
  if (openingPath === null || movedOn) return false;
  return trimPath(window.location.pathname) === openingPath;
}
