import type { Metadata } from "next";
import { Header } from "@/components/layout/header";
import { SkipLink } from "@/components/layout/skip-link";
import { SITE_CONFIG } from "@/constants/site";
import { PageTransition } from "@/features/page-transition";
import { seagram, sfPro } from "@/lib/fonts";
import { SmoothScrollProvider } from "@/lib/smooth-scroll-provider";
import { asset } from "@/utils/asset";
import "lenis/dist/lenis.css";
import "@/styles/globals.css";

export const metadata: Metadata = {
  title: {
    default: SITE_CONFIG.name,
    template: `%s | ${SITE_CONFIG.name}`,
  },
  description: SITE_CONFIG.description,
  // The THE GRAW sword mark on RED GRAW, with an ICO for the small sizes.
  icons: {
    icon: [
      { url: asset("/favicon.png"), type: "image/png", sizes: "192x192" },
      { url: asset("/favicon.ico"), sizes: "16x16 32x32 48x48" },
    ],
    apple: asset("/apple-touch-icon.png"),
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang={SITE_CONFIG.locale}
      className={`${sfPro.variable} ${seagram.variable}`}
    >
      <body className="overflow-x-clip bg-white-graw font-sans text-black-graw antialiased">
        <SmoothScrollProvider>
          <SkipLink />
          <Header />
          {children}
          <PageTransition />
        </SmoothScrollProvider>
      </body>
    </html>
  );
}
