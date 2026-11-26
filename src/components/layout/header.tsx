"use client";

import { TransitionLink } from "@/features/page-transition";
import { loopedScroll } from "@/features/scroll-loop";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { HeaderLogo } from "@/components/layout/header-logo";
import { SiteMenu } from "@/components/layout/site-menu";
import { ShuffleText } from "@/components/ui/shuffle-text";
import { CONTACT_LINK } from "@/constants/navigation";
import { DURATION, EASE, gsap, ScrollTrigger, useGSAP } from "@/lib/gsap";
import { cn } from "@/utils/cn";

const HIDE_AFTER = 120;

export function Header() {
  const headerRef = useRef<HTMLElement>(null);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const menuOpenRef = useRef(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();
  const closeMenu = useCallback(() => setMenuOpen(false), []);

  useEffect(() => {
    menuOpenRef.current = menuOpen;
  }, [menuOpen]);

  // First load: the logo and the menu button drop in, after the page starts.
  useGSAP(
    () => {
      // Hidden in the markup, so nothing shows before it drops in.
      gsap.set("[data-header-row]", { visibility: "visible" });
      const media = gsap.matchMedia();
      media.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.from("[data-header-item]", {
          yPercent: -140,
          opacity: 0,
          duration: DURATION.enter,
          ease: EASE.expo,
          stagger: 0.1,
          delay: 0.5,
          // The classes own these again (the button fades with the menu).
          clearProps: "transform,opacity",
        });
      });
      return () => media.revert();
    },
    { scope: headerRef },
  );

  useGSAP(
    () => {
      const header = headerRef.current;
      if (!header) return;

      // Header color follows the section underneath it.
      const sections = gsap.utils.toArray<HTMLElement>("[data-header-theme]");
      const line = () => header.offsetTop + header.offsetHeight / 2;
      header.dataset.theme = sections[0]?.dataset.headerTheme ?? "light";
      sections.forEach((section) => {
        ScrollTrigger.create({
          trigger: section,
          start: () => `top ${line()}px`,
          end: () => `bottom ${line()}px`,
          onToggle: (self) => {
            if (self.isActive)
              header.dataset.theme = section.dataset.headerTheme;
          },
        });
      });

      // Hide while scrolling down, show again on the way up. On a looping
      // page the scroll jumps back to the start: follow the unrolled one.
      let hidden = false;
      let last = loopedScroll(window.scrollY);
      ScrollTrigger.create({
        start: 0,
        end: "max",
        onUpdate: (self) => {
          const scroll = loopedScroll(self.scroll());
          const direction = Math.sign(scroll - last);
          last = scroll;
          if (direction === 0) return;
          const shouldHide =
            direction === 1 && scroll > HIDE_AFTER && !menuOpenRef.current;
          if (shouldHide === hidden) return;
          hidden = shouldHide;
          gsap.to(header, {
            yPercent: hidden ? -150 : 0,
            duration: DURATION.hover + 0.1,
            ease: EASE.out,
            overwrite: "auto",
          });
        },
      });
    },
    { dependencies: [pathname], revertOnUpdate: true },
  );

  return (
    <>
      <header
        ref={headerRef}
        inert={menuOpen}
        className="group/header pointer-events-none fixed inset-x-0 top-0 z-40 pt-24 pl-14 text-white transition-colors duration-300 data-[theme=dark]:text-black lg:pt-30 lg:pr-37 lg:pl-36"
      >
        {/* Figma HOTBAR: "contato", the logo in the middle and "Menu"; phones
            keep the logo and "Menu" only. */}
        <div
          data-header-row
          className="invisible flex items-center justify-between lg:grid lg:grid-cols-[1fr_auto_1fr]"
        >
          <a
            href={CONTACT_LINK.href}
            data-header-item
            className="group pointer-events-auto hidden h-45 w-129 items-center justify-center text-nav transition-[scale] duration-300 ease-power3 active:scale-95 lg:flex lg:justify-self-start"
          >
            <ShuffleText>{CONTACT_LINK.label}</ShuffleText>
          </a>
          <TransitionLink
            href="/"
            data-header-item
            aria-label="The Graw, página inicial"
            className="pointer-events-auto block"
          >
            <HeaderLogo />
          </TransitionLink>
          <button
            ref={menuButtonRef}
            data-header-item
            type="button"
            aria-expanded={menuOpen}
            aria-controls="site-menu"
            className={cn(
              "group pointer-events-auto flex h-35.5 w-101.75 items-center justify-center text-nav transition-[opacity,scale] duration-300 ease-power3 active:scale-95 max-lg:text-hotbar lg:h-45 lg:w-129 lg:justify-self-end",
              menuOpen && "opacity-0",
            )}
            onClick={() => setMenuOpen(true)}
          >
            <ShuffleText>Menu</ShuffleText>
          </button>
        </div>
      </header>
      <SiteMenu
        open={menuOpen}
        onClose={closeMenu}
        returnFocusRef={menuButtonRef}
      />
    </>
  );
}
