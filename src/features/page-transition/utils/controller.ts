/** Takes the visitor to `href`; `false` leaves the navigation to the link. */
type PageTransitionHandler = (href: string) => boolean;

let handler: PageTransitionHandler | null = null;

/** The mounted curtain registers itself as the way to change page. */
export function registerPageTransition(next: PageTransitionHandler) {
  handler = next;
  return () => {
    if (handler === next) handler = null;
  };
}

/**
 * Asks the curtain to cover the page and open `href` behind it. Returns
 * `false` when there is no curtain to do it (not mounted, reduced motion,
 * same page), so the caller navigates as usual.
 */
export function requestPageTransition(href: string) {
  return handler?.(href) ?? false;
}
