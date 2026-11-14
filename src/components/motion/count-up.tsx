"use client";

import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

/**
 * React Bits–style CountUp: animates a number from 0 to `end` when it
 * scrolls into view. Renders the final value in SSR HTML so SEO and
 * no-JS visitors see the real number.
 */
export function CountUp({
  end,
  duration = 1.6,
  className,
  suffix = "",
  prefix = "",
}: {
  end: number;
  duration?: number;
  className?: string;
  suffix?: string;
  prefix?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);

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
        const obj = { value: 0 };
        ctx = gsap.context(() => {
          gsap.to(obj, {
            value: end,
            duration,
            ease: "power2.out",
            scrollTrigger: { trigger: el, start: "top 92%", once: true },
            onUpdate: () => {
              el.textContent = `${prefix}${Math.round(obj.value).toLocaleString("en-US")}${suffix}`;
            },
          });
        }, el);
      } catch {
        /* final value already in DOM */
      }
    })();
    return () => {
      cancelled = true;
      ctx?.revert();
    };
  }, [end, duration, prefix, suffix]);

  return (
    <span ref={ref} className={cn("count-up", className)}>
      {prefix}
      {end.toLocaleString("en-US")}
      {suffix}
    </span>
  );
}
