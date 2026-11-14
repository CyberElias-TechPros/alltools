"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Cinematic intro loader: a counter + wordmark that curtains away.
 *
 * - Rendered only on the client after mount, so SSR HTML (and crawlers)
 *   always see the real page underneath — the loader is purely decorative.
 * - Skipped under `prefers-reduced-motion` and on repeat visits within the
 *   same tab session (sessionStorage flag).
 * - `aria-hidden`: it never blocks assistive technology.
 */
export function Preloader() {
  const [mounted, setMounted] = useState(false);
  const [done, setDone] = useState(false);
  const [count, setCount] = useState(0);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (sessionStorage.getItem("toolz:intro-seen")) return;
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    sessionStorage.setItem("toolz:intro-seen", "1");
    let cancelled = false;
    (async () => {
      try {
        const { gsap } = await import("gsap");
        if (cancelled) return;
        const obj = { v: 0 };
        const tl = gsap.timeline({
          onComplete: () => {
            setDone(true);
            window.dispatchEvent(new Event("toolz:intro-done"));
          },
        });
        tl.to(obj, {
          v: 100,
          duration: 1.1,
          ease: "power2.inOut",
          onUpdate: () => setCount(Math.round(obj.v)),
        })
          .to(".preloader-word", {
            yPercent: -120,
            duration: 0.5,
            ease: "power3.in",
            stagger: 0.05,
          }, "+=0.1")
          .to(rootRef.current, {
            yPercent: -100,
            duration: 0.8,
            ease: "power4.inOut",
          }, "-=0.15");
      } catch {
        setDone(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [mounted]);

  if (!mounted || done) return null;

  return (
    <div
      ref={rootRef}
      aria-hidden
      className="preloader fixed inset-0 z-[200] flex flex-col items-center justify-center bg-[#0b0c0e] text-[#f4f3ee]"
    >
      <div className="overflow-hidden">
        <p className="preloader-word font-display text-[clamp(2.2rem,7vw,4.5rem)] font-extrabold leading-none tracking-[-0.05em]">
          TOOLZ<span className="text-[#ff4b00]">.</span>
        </p>
      </div>
      <div className="mt-6 flex items-center gap-4">
        <div className="h-px w-40 overflow-hidden bg-white/15">
          <div
            className="h-full bg-[#ff4b00] transition-[width] duration-100 ease-linear"
            style={{ width: `${count}%` }}
          />
        </div>
        <span className="font-mono text-xs tabular-nums text-white/60">{count}%</span>
      </div>
      <p className="preloader-word mt-4 font-mono text-[0.62rem] uppercase tracking-[0.22em] text-white/40">
        Nothing uploaded · everything local
      </p>
    </div>
  );
}
