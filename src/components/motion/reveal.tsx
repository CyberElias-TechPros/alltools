"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * Scroll-triggered reveal (GSAP ScrollTrigger).
 *
 * Wraps children in a div and animates opacity / y / blur when it enters the
 * viewport. Respects `prefers-reduced-motion` by rendering statically.
 * `as` is intentionally limited to a div — semantic landmarks stay semantic
 * in the parent markup.
 */
export function Reveal({
  children,
  className,
  delay = 0,
  y = 28,
  once = true,
  id,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
  y?: number;
  once?: boolean;
  id?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let ctx: { revert: () => void } | null = null;
    let cancelled = false;
    (async () => {
      try {
        const [{ gsap }, { ScrollTrigger }] = await Promise.all([
          import("gsap"),
          import("gsap/ScrollTrigger"),
        ]);
        if (cancelled || !ref.current) return;
        gsap.registerPlugin(ScrollTrigger);
        ctx = gsap.context(() => {
          gsap.fromTo(
            el,
            { opacity: 0, y, filter: "blur(6px)" },
            {
              opacity: 1,
              y: 0,
              filter: "blur(0px)",
              duration: 0.9,
              delay,
              ease: "power3.out",
              overwrite: true,
              scrollTrigger: {
                trigger: el,
                start: "top 88%",
                once,
              },
            },
          );
        }, el);
      } catch {
        /* leave content visible */
      }
    })();
    return () => {
      cancelled = true;
      ctx?.revert();
    };
  }, [delay, y, once]);

  return (
    <div ref={ref} id={id} className={cn("reveal", className)}>
      {children}
    </div>
  );
}

/**
 * Staggered children reveal — apply to a grid/list container.
 * Direct children get `[data-reveal-item]` treatment via GSAP batch.
 */
export function RevealGroup({
  children,
  className,
  stagger = 0.06,
}: {
  children: ReactNode;
  className?: string;
  stagger?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let ctx: { revert: () => void } | null = null;
    let cancelled = false;
    (async () => {
      try {
        const [{ gsap }, { ScrollTrigger }] = await Promise.all([
          import("gsap"),
          import("gsap/ScrollTrigger"),
        ]);
        if (cancelled || !ref.current) return;
        gsap.registerPlugin(ScrollTrigger);
        const items = el.querySelectorAll<HTMLElement>("[data-reveal-item]");
        if (!items.length) return;
        ctx = gsap.context(() => {
          gsap.fromTo(
            items,
            { opacity: 0, y: 24, filter: "blur(4px)" },
            {
              opacity: 1,
              y: 0,
              filter: "blur(0px)",
              duration: 0.8,
              stagger,
              ease: "power3.out",
              overwrite: true,
              scrollTrigger: { trigger: el, start: "top 85%", once: true },
            },
          );
        }, el);
      } catch {
        /* visible by default */
      }
    })();
    return () => {
      cancelled = true;
      ctx?.revert();
    };
  }, [stagger]);

  return (
    <div ref={ref} className={cn("reveal-group", className)}>
      {children}
    </div>
  );
}
