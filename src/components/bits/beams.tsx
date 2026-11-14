"use client";

import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

/**
 * React Bits–style Beams: diagonal light shafts sweeping across a section.
 * Implemented as animated CSS gradients (GPU-cheap, no canvas loop).
 */
export function Beams({ className }: { className?: string }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let ctx: { revert: () => void } | null = null;
    let cancelled = false;
    (async () => {
      try {
        const { gsap } = await import("gsap");
        if (cancelled || !ref.current) return;
        const beams = el.querySelectorAll(".beam");
        ctx = gsap.context(() => {
          beams.forEach((beam, i) => {
            gsap.fromTo(
              beam,
              { xPercent: -30, opacity: 0 },
              {
                xPercent: 130,
                opacity: 0.5,
                duration: 7 + i * 2.2,
                repeat: -1,
                ease: "sine.inOut",
                delay: i * 1.4,
              },
            );
          });
        }, el);
      } catch {
        /* static beams remain */
      }
    })();
    return () => {
      cancelled = true;
      ctx?.revert();
    };
  }, []);

  return (
    <div ref={ref} aria-hidden className={cn("pointer-events-none absolute inset-0 overflow-hidden", className)}>
      <div className="beam beam-1" />
      <div className="beam beam-2" />
      <div className="beam beam-3" />
    </div>
  );
}
