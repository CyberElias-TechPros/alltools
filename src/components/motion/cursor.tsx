"use client";

import { useEffect, useRef } from "react";

/**
 * Custom cursor accent: a small dot + trailing ring that expands over
 * interactive elements. The native cursor stays visible (accessibility),
 * this is purely a cinematic accent layer. Pointer-fine only.
 */
export function Cursor() {
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!window.matchMedia("(pointer: fine)").matches) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const dot = dotRef.current;
    const ring = ringRef.current;
    if (!dot || !ring) return;

    let raf = 0;
    let mx = -100;
    let my = -100;
    let rx = -100;
    let ry = -100;
    let scale = 1;
    let targetScale = 1;

    const onMove = (e: MouseEvent) => {
      mx = e.clientX;
      my = e.clientY;
      const target = e.target as HTMLElement | null;
      const interactive = target?.closest?.("a,button,[data-cursor],input,textarea,select,summary");
      targetScale = interactive ? 2.6 : 1;
    };

    const loop = () => {
      rx += (mx - rx) * 0.16;
      ry += (my - ry) * 0.16;
      scale += (targetScale - scale) * 0.18;
      dot.style.transform = `translate(${mx}px, ${my}px) translate(-50%, -50%)`;
      ring.style.transform = `translate(${rx}px, ${ry}px) translate(-50%, -50%) scale(${scale})`;
      raf = requestAnimationFrame(loop);
    };

    document.addEventListener("mousemove", onMove, { passive: true });
    raf = requestAnimationFrame(loop);
    return () => {
      document.removeEventListener("mousemove", onMove);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <>
      <div
        ref={dotRef}
        aria-hidden
        className="cursor-dot pointer-events-none fixed left-0 top-0 z-[150] hidden size-1.5 rounded-full bg-[var(--ring)] md:block"
      />
      <div
        ref={ringRef}
        aria-hidden
        className="cursor-ring pointer-events-none fixed left-0 top-0 z-[149] hidden size-8 rounded-full border border-[var(--ring)]/50 md:block"
      />
    </>
  );
}
