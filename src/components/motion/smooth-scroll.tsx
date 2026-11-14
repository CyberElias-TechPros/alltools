"use client";

import { useEffect, type ReactNode } from "react";

/**
 * Lenis smooth scroll, wired into GSAP's ticker + ScrollTrigger.
 *
 * - Dynamically imported so the ~30 kB Lenis runtime never blocks first paint
 *   and never runs during SSR / tests.
 * - Disabled entirely under `prefers-reduced-motion` and on touch devices
 *   where native momentum scrolling is already smooth.
 * - Exposes the instance on `window.__lenis` so anchor links and the search
 *   dialog can pause / resume it without prop-drilling.
 * - Handles in-page anchors (`#main`, `#categories`, …) with a smooth
 *   `lenis.scrollTo` instead of the browser's instant jump.
 */
export function SmoothScroll({ children }: { children: ReactNode }) {
  useEffect(() => {
    if (typeof window === "undefined") return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const coarse = window.matchMedia("(pointer: coarse)").matches;
    if (reduced) return;

    let lenis: {
      raf: (time: number) => void;
      destroy: () => void;
      stop: () => void;
      start: () => void;
      scrollTo: (target: string | number, opts?: { offset?: number }) => void;
      on: (event: string, cb: () => void) => void;
    } | null = null;
    let rafId = 0;
    let cancelled = false;
    let gsapTicker: ((time: number) => void) | null = null;
    let gsapRef: { ticker?: { add: (fn: (t: number) => void) => void; remove: (fn: (t: number) => void) => void } } | null = null;

    (async () => {
      try {
        const [{ default: Lenis }, gsapModule] = await Promise.all([
          import("lenis"),
          import("gsap"),
        ]);
        if (cancelled) return;
        const gsap = gsapModule.gsap ?? gsapModule.default ?? gsapModule;
        gsapRef = gsap as never;

        lenis = new Lenis({
          duration: 1.15,
          easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
          smoothWheel: !coarse,
          touchMultiplier: 1.4,
        }) as never;

        (window as unknown as { __lenis?: unknown }).__lenis = lenis;

        // Drive Lenis from GSAP's ticker so ScrollTrigger stays in sync.
        gsapTicker = (time: number) => lenis?.raf(time * 1000);
        gsap.ticker.add(gsapTicker);
        gsap.ticker.lagSmoothing(0);

        // Anchor handling: smooth-scroll to in-page targets.
        const onClick = (event: MouseEvent) => {
          const anchor = (event.target as HTMLElement).closest?.(
            'a[href^="#"]',
          ) as HTMLAnchorElement | null;
          if (!anchor) return;
          const hash = anchor.getAttribute("href");
          if (!hash || hash === "#") return;
          const target = document.querySelector(hash);
          if (!target) return;
          event.preventDefault();
          lenis?.scrollTo(hash, { offset: -88 });
          history.replaceState(null, "", hash);
        };
        document.addEventListener("click", onClick);
        (lenis as unknown as { __onClick?: typeof onClick }).__onClick = onClick;
      } catch {
        // Lenis/GSAP failed to load — native scrolling is a fine fallback.
        if (!cancelled) {
          const fallback = (time: number) => {
            lenis?.raf(time);
            rafId = requestAnimationFrame(fallback);
          };
          rafId = requestAnimationFrame(fallback);
        }
      }
    })();

    return () => {
      cancelled = true;
      cancelAnimationFrame(rafId);
      const onClick = (lenis as unknown as { __onClick?: EventListener } | null)?.__onClick;
      if (onClick) document.removeEventListener("click", onClick as EventListener);
      if (gsapTicker && gsapRef?.ticker) gsapRef.ticker.remove(gsapTicker);
      lenis?.destroy();
      (window as unknown as { __lenis?: unknown }).__lenis = undefined;
    };
  }, []);

  return <>{children}</>;
}

export function lenisStop() {
  const lenis = (window as unknown as { __lenis?: { stop?: () => void } }).__lenis;
  lenis?.stop?.();
}

export function lenisStart() {
  const lenis = (window as unknown as { __lenis?: { start?: () => void } }).__lenis;
  lenis?.start?.();
}
