"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, type KeyboardEvent, type RefObject } from "react";
import { ShuffleText } from "@/components/ui/shuffle-text";
import { NAV_LINKS } from "@/constants/navigation";
import { useMenuKnockout } from "@/hooks/use-menu-knockout";
import { useReducedMotion } from "@/hooks/use-reduced-motion";
import { DURATION, EASE, gsap, useGSAP } from "@/lib/gsap";
import { getLenis } from "@/lib/smooth-scroll-provider";
import { themeColor } from "@/utils/theme-color";

type SiteMenuProps = {
  open: boolean;
  onClose: () => void;
  returnFocusRef: RefObject<HTMLButtonElement | null>;
};

const FOCUSABLE = "a[href], button:not([disabled])";
/** Words rise in red and settle into the link gray (hover still wins). */
const LINK_TINT = "--menu-link-tint";

// The panel wipes down with a slanted edge while its links straighten up
// from a tilted zoom, and the blur veils the page behind it.
const CLIP_CLOSED = "polygon(0% 0%, 100% 0%, 100% 0%, 0% 0%)";
const CLIP_OPEN = "polygon(0% 0%, 100% 0%, 100% 175%, 0% 100%)";
const CONTENT_AWAY = {
  rotation: -15,
  x: -100,
  y: -100,
  scale: 1.5,
  opacity: 0.25,
};
const CONTENT_AT_REST = { rotation: 0, x: 0, y: 0, scale: 1, opacity: 1 };

/**
 * Entrance timeline. Closing plays it backwards, so the exit mirrors the
 * entrance and either direction can take over midway.
 */
function buildMenuTimeline(root: HTMLElement, onClosed: () => void) {
  const veil = root.querySelector("[data-menu-veil]");
  const panel = root.querySelector("[data-menu-panel]");
  const content = root.querySelector("[data-menu-content]");
  const links = gsap.utils.toArray<HTMLElement>("[data-menu-link]", root);
  const visuals = gsap.utils.toArray<HTMLElement>("[data-menu-visual]", root);

  // GSAP writes into the vars it receives, so each tween gets fresh copies.
  const timeline = gsap
    .timeline({
      paused: true,
      defaults: { ease: EASE.menu, duration: DURATION.menu },
      onReverseComplete: () => {
        gsap.set(root, { visibility: "hidden" });
        gsap.set([veil, panel, content, ...links, ...visuals], {
          clearProps: "all",
        });
        onClosed();
      },
    })
    .fromTo(veil, { opacity: 0 }, { opacity: 1 }, 0)
    .fromTo(panel, { clipPath: CLIP_CLOSED }, { clipPath: CLIP_OPEN }, 0)
    .fromTo(content, { ...CONTENT_AWAY }, { ...CONTENT_AT_REST }, 0)
    .fromTo(
      links,
      // Far enough down to clear the clip's room for descenders.
      { yPercent: 160 },
      { yPercent: 0, duration: 1.5, ease: EASE.menuLinks, stagger: 0.05 },
      0.8,
    )
    .fromTo(
      links,
      { [LINK_TINT]: themeColor("red-graw") },
      {
        [LINK_TINT]: themeColor("menu-link"),
        duration: 0.8,
        ease: EASE.inOut,
        stagger: 0.05,
      },
      1.5,
    );
  return timeline;
}

export function SiteMenu({ open, onClose, returnFocusRef }: SiteMenuProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const timelineRef = useRef<gsap.core.Timeline | null>(null);
  const wasOpenRef = useRef(false);
  const reducedMotion = useReducedMotion();
  const pathname = usePathname();
  const { contextSafe } = useGSAP({ scope: rootRef });
  useMenuKnockout(rootRef, open);

  useEffect(() => {
    if (open === wasOpenRef.current) return;
    wasOpenRef.current = open;

    const root = rootRef.current;
    if (!root) return;

    if (open) {
      getLenis()?.stop();
      document.documentElement.style.overflow = "hidden";
      // Reopening mid-exit keeps the running timeline and plays it forward.
      timelineRef.current ??= contextSafe(buildMenuTimeline)(root, () => {
        timelineRef.current?.kill();
        timelineRef.current = null;
        document.documentElement.style.overflow = "";
        getLenis()?.start();
      });
      gsap.set(root, { visibility: "visible" });
      if (reducedMotion) timelineRef.current.progress(1);
      else timelineRef.current.play();
      // Visible before focusing: hidden elements cannot receive focus.
      closeRef.current?.focus({ preventScroll: true });
      return;
    }

    const timeline = timelineRef.current;
    if (!timeline) return;
    if (root.contains(document.activeElement)) {
      returnFocusRef.current?.focus({ preventScroll: true });
    }
    if (reducedMotion) timeline.progress(0);
    else timeline.reverse();
  }, [open, contextSafe, reducedMotion, returnFocusRef]);

  useEffect(() => {
    if (!open) return;
    const onEscape = (event: globalThis.KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onEscape);
    return () => document.removeEventListener("keydown", onEscape);
  }, [open, onClose]);

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key !== "Tab" || !rootRef.current) return;

    const focusable = Array.from(
      rootRef.current.querySelectorAll<HTMLElement>(FOCUSABLE),
    );
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last?.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first?.focus();
    }
  };

  return (
    <div
      ref={rootRef}
      id="site-menu"
      role="dialog"
      aria-modal="true"
      aria-label="Menu"
      className="invisible fixed inset-0 z-50"
      onKeyDown={handleKeyDown}
    >
      <div
        data-menu-veil
        aria-hidden
        className="absolute inset-0 backdrop-blur-menu"
        onClick={onClose}
      />
      <div
        data-menu-panel
        className="absolute top-24 right-17 left-14 h-576 overflow-hidden bg-menu [clip-path:polygon(0%_0%,100%_0%,100%_0%,0%_0%)] lg:inset-x-auto lg:top-31 lg:right-55 lg:h-629 lg:w-1339"
      >
        <nav
          data-menu-content
          aria-label="Principal"
          className="absolute inset-0"
        >
          {/* Phones: one right-aligned column under "Voltar". Desktop: two
              columns, the right one starting early enough for its words to
              be pushed by the thumbnail like the left one, inside the panel. */}
          <ul className="absolute top-132.5 right-53 flex w-256 flex-col items-end gap-41 lg:top-146 lg:right-auto lg:left-101 lg:grid lg:w-auto lg:grid-flow-col lg:grid-cols-[calc(var(--spacing)*568)_auto] lg:grid-rows-2 lg:gap-x-0 lg:gap-y-54">
            {NAV_LINKS.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  aria-current={pathname === link.href ? "page" : undefined}
                  className="group relative flex items-center lg:-ml-8"
                  onClick={onClose}
                >
                  <span
                    data-menu-visual
                    aria-hidden
                    className="relative hidden h-112 w-0 shrink-0 overflow-hidden rounded-[calc(var(--spacing)*4.8)] transition-[width] duration-800 ease-menu-visual group-hover:w-168 group-focus-visible:w-168 lg:mr-8 lg:block"
                  >
                    <Image
                      src={link.visual}
                      alt=""
                      fill
                      sizes="(min-width: 64rem) 9vw, 67px"
                      className="object-cover"
                    />
                  </span>
                  {/* The clip, sized like the word so its em are the word's, leaves
                      room for accents above and descenders below the 0.93
                      line ("j" of Projetos, "ç" of Serviços). */}
                  <span className="-my-[0.15em] -mr-[0.06em] block overflow-hidden py-[0.15em] pr-[0.06em] pl-8 font-flex text-menu-word lg:-ml-[0.06em] lg:pr-8 lg:pl-[0.06em]">
                    <span
                      data-menu-link
                      className="block text-[color:var(--menu-link-tint,var(--color-menu-link))] transition-colors duration-300 ease-power3 will-change-transform group-data-knockout:text-transparent max-lg:lowercase"
                    >
                      {link.label}
                    </span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <button
          ref={closeRef}
          type="button"
          aria-label="Fechar menu"
          className="group absolute top-10.25 right-53 pt-5 pb-4 pl-19 font-flex text-menu-close text-red-graw lg:top-14.25 lg:right-11 lg:px-19"
          onClick={onClose}
        >
          <ShuffleText>Voltar</ShuffleText>
        </button>
      </div>
    </div>
  );
}
