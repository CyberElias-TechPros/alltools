"use client";

import { ArrowUp } from "lucide-react";

/** Footer "back to top" — uses Lenis when it is running, native scrolling otherwise. */
export function BackToTop() {
  const toTop = () => {
    const lenis = (window as unknown as { __lenis?: { scrollTo?: (t: number) => void } }).__lenis;
    if (lenis?.scrollTo) {
      lenis.scrollTo(0);
      return;
    }
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <button
      type="button"
      onClick={toTop}
      className="group inline-flex items-center gap-2.5 rounded-full border border-[var(--border-strong)] px-4 py-2 font-mono text-[0.56rem] uppercase tracking-[0.18em] text-[var(--text-muted)] transition-colors hover:border-[var(--ring)] hover:text-[var(--text)]"
    >
      Back to top
      <ArrowUp className="size-3.5 transition-transform duration-300 group-hover:-translate-y-0.5" aria-hidden />
    </button>
  );
}
