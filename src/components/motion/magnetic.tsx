"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * React Bits–style Magnet: the child is gently pulled toward the cursor
 * while hovering, then springs back. Pointer-fine devices only.
 */
export function Magnet({
  children,
  className,
  strength = 0.35,
  padding = 24,
}: {
  children: ReactNode;
  className?: string;
  strength?: number;
  padding?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (!window.matchMedia("(pointer: fine)").matches) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let ctx: { revert: () => void } | null = null;
    let cancelled = false;
    (async () => {
      try {
        const { gsap } = await import("gsap");
        if (cancelled || !ref.current) return;
        const inner = el.firstElementChild as HTMLElement | null;
        if (!inner) return;
        const xTo = gsap.quickTo(inner, "x", { duration: 0.4, ease: "power3" });
        const yTo = gsap.quickTo(inner, "y", { duration: 0.4, ease: "power3" });
        const onMove = (e: MouseEvent) => {
          const rect = el.getBoundingClientRect();
          const relX = e.clientX - (rect.left + rect.width / 2);
          const relY = e.clientY - (rect.top + rect.height / 2);
          xTo(relX * strength);
          yTo(relY * strength);
        };
        const onLeave = () => {
          xTo(0);
          yTo(0);
        };
        el.addEventListener("mousemove", onMove);
        el.addEventListener("mouseleave", onLeave);
        ctx = { revert: () => { el.removeEventListener("mousemove", onMove); el.removeEventListener("mouseleave", onLeave); } };
      } catch {
        /* no-op */
      }
    })();
    return () => {
      cancelled = true;
      ctx?.revert();
    };
  }, [strength, padding]);

  return (
    <div ref={ref} className={cn("magnetic inline-block", className)} style={{ padding }}>
      {children}
    </div>
  );
}

/** 3D tilt on hover (React Bits Tilt / CardTilt). */
export function Tilt({
  children,
  className,
  max = 8,
}: {
  children: ReactNode;
  className?: string;
  max?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (!window.matchMedia("(pointer: fine)").matches) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let cleanup = () => {};
    let cancelled = false;
    (async () => {
      try {
        const { gsap } = await import("gsap");
        if (cancelled || !ref.current) return;
        gsap.set(el, { transformPerspective: 900 });
        const rx = gsap.quickTo(el, "rotationX", { duration: 0.5, ease: "power3" });
        const ry = gsap.quickTo(el, "rotationY", { duration: 0.5, ease: "power3" });
        const onMove = (e: MouseEvent) => {
          const rect = el.getBoundingClientRect();
          const px = (e.clientX - rect.left) / rect.width - 0.5;
          const py = (e.clientY - rect.top) / rect.height - 0.5;
          ry(px * max * 2);
          rx(-py * max * 2);
        };
        const onLeave = () => { rx(0); ry(0); };
        el.addEventListener("mousemove", onMove);
        el.addEventListener("mouseleave", onLeave);
        cleanup = () => { el.removeEventListener("mousemove", onMove); el.removeEventListener("mouseleave", onLeave); };
      } catch {
        /* no-op */
      }
    })();
    return () => { cancelled = true; cleanup(); };
  }, [max]);

  return (
    <div ref={ref} className={cn("tilt", className)}>
      {children}
    </div>
  );
}
