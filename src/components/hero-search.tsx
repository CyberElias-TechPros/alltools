"use client";

import { Search } from "lucide-react";

export function HeroSearch({ count }: { count: number }) {
  return (
    <button
      type="button"
      onClick={() => window.dispatchEvent(new Event("toolora:open-search"))}
      className="group flex w-full max-w-xl items-center gap-3 rounded-2xl border border-[var(--border-strong)] bg-[var(--surface)] px-4 py-3.5 text-left shadow-[var(--shadow-soft)] transition-all hover:border-brand-400 hover:shadow-lg"
      aria-label="Search all tools"
    >
      <Search className="size-5 shrink-0 text-[var(--text-subtle)]" aria-hidden />
      <span className="flex-1 text-[0.95rem] text-[var(--text-subtle)]">
        Search {count} tools — try “word”, “percentage”, “JWT”…
      </span>
      <span className="hidden items-center gap-1 sm:flex">
        <kbd className="kbd">⌘</kbd>
        <kbd className="kbd">K</kbd>
      </span>
    </button>
  );
}
