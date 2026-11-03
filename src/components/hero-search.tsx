"use client";

import { Search } from "lucide-react";

export function HeroSearch({ count }: { count: number }) {
  return (
    <button
      type="button"
      onClick={() => window.dispatchEvent(new Event("tools:open-search"))}
      className="group flex h-[62px] w-full items-center gap-3 rounded-2xl border border-[var(--border)] bg-[var(--surface)] pl-5 pr-3 text-left shadow-[0_2px_4px_rgb(20_22_26/0.04),0_18px_40px_-24px_rgb(20_22_26/0.3)] transition-all hover:border-[var(--border-strong)] hover:shadow-[0_4px_8px_rgb(20_22_26/0.06),0_24px_48px_-24px_rgb(20_22_26/0.35)]"
      aria-label={`Search ${count} tools`}
    >
      <Search className="size-[1.15rem] shrink-0 text-[var(--text-subtle)] transition-colors group-hover:text-[var(--accent-text)]" aria-hidden />
      <span className="flex-1 text-[0.98rem] text-[var(--text-subtle)]">
        Search <span className="font-medium text-[var(--text-muted)]">{count} tools</span> — try “percentage”, “JSON” or “PDF”
      </span>
      <span className="hidden items-center gap-1 sm:flex">
        <kbd className="kbd">⌘</kbd>
        <kbd className="kbd">K</kbd>
      </span>
    </button>
  );
}
