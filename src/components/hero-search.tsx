"use client";

import { Search } from "lucide-react";

export function HeroSearch({ count }: { count: number }) {
  return (
    <button
      type="button"
      onClick={() => window.dispatchEvent(new Event("toolz:open-search"))}
      className="group relative flex h-[64px] w-full items-center gap-3.5 overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface)]/80 pl-5 pr-3 text-left shadow-[0_2px_4px_rgb(20_22_26/0.04),0_24px_60px_-30px_rgb(20_22_26/0.45)] backdrop-blur-xl transition-all duration-300 hover:-translate-y-0.5 hover:border-[var(--ring)]/40 hover:shadow-[0_4px_8px_rgb(20_22_26/0.06),0_32px_70px_-30px_color-mix(in_oklab,var(--ring)_45%,transparent)]"
      aria-label={`Search ${count} tools`}
    >
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[linear-gradient(110deg,transparent_20%,color-mix(in_oklab,var(--ring)_9%,transparent)_45%,transparent_70%)] opacity-0 transition-opacity duration-500 group-hover:opacity-100"
      />
      <span className="relative inline-flex size-9 shrink-0 items-center justify-center rounded-xl bg-[var(--surface-muted)] text-[var(--text-muted)] transition-colors group-hover:bg-[var(--ring)] group-hover:text-white">
        <Search className="size-[1.05rem]" aria-hidden />
      </span>
      <span className="relative flex-1 truncate text-[0.98rem] text-[var(--text-subtle)]">
        Search <span className="font-medium text-[var(--text-muted)]">{count} tools</span> — try
        &ldquo;percentage&rdquo;, &ldquo;JSON&rdquo; or &ldquo;PDF&rdquo;
      </span>
      <span className="relative hidden items-center gap-1 sm:flex">
        <kbd className="kbd">⌘</kbd>
        <kbd className="kbd">K</kbd>
      </span>
    </button>
  );
}
