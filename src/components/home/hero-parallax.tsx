"use client";

import { useEffect, useRef, type ReactNode } from "react";

/**
 * Mouse parallax for hero decorations: elements with `[data-parallax]`
 * drift at different depths as the cursor moves. Pointer-fine only.
 */
export function HeroParallax({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = ref.current;
    if (!root) return;
    if (!window.matchMedia("(pointer: fine)").matches) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let ctx: { revert: () => void } | null = null;
    let cancelled = false;
    (async () => {
      try {
        const { gsap } = await import("gsap");
        if (cancelled || !ref.current) return;
        const layers = root.querySelectorAll<HTMLElement>("[data-parallax]");
        const setters = [...layers].map((el) => ({
          depth: Number(el.dataset.parallax || 12),
          x: gsap.quickTo(el, "x", { duration: 0.9, ease: "power3" }),
          y: gsap.quickTo(el, "y", { duration: 0.9, ease: "power3" }),
        }));
        const onMove = (e: MouseEvent) => {
          const nx = e.clientX / window.innerWidth - 0.5;
          const ny = e.clientY / window.innerHeight - 0.5;
          setters.forEach((s) => {
            s.x(nx * s.depth);
            s.y(ny * s.depth);
          });
        };
        // Gentle idle float for the same layers.
        const floats = [...layers].map((el, i) =>
          gsap.to(el, {
            y: `+=${6 + i * 2}`,
            duration: 3 + i * 0.6,
            yoyo: true,
            repeat: -1,
            ease: "sine.inOut",
          }),
        );
        window.addEventListener("mousemove", onMove, { passive: true });
        ctx = {
          revert: () => {
            window.removeEventListener("mousemove", onMove);
            floats.forEach((f) => f.kill());
          },
        };
      } catch {
        /* static */
      }
    })();
    return () => {
      cancelled = true;
      ctx?.revert();
    };
  }, []);

  return (
    <div ref={ref} className="contents">
      {children}
    </div>
  );
}
