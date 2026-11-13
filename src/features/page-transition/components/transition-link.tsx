"use client";

import Link from "next/link";
import type { ComponentProps } from "react";
import { requestPageTransition } from "@/features/page-transition/utils/controller";

type TransitionLinkProps = Omit<
  ComponentProps<typeof Link>,
  "href" | "onNavigate"
> & {
  href: string;
};

/**
 * `next/link` whose client-side navigations go through the page curtain.
 * Modified clicks, new tabs and cancelled clicks behave like any link.
 */
export function TransitionLink({ href, ...props }: TransitionLinkProps) {
  return (
    <Link
      href={href}
      onNavigate={(event) => {
        if (requestPageTransition(href)) event.preventDefault();
      }}
      {...props}
    />
  );
}
