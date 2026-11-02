"use client";

import { Search } from "lucide-react";

export function HeroSearch({ count }: { count: number }) {
  return (
    <button
      type="button"
      onClick={() => window.dispatchEvent(new Event("toolora:open-search"))}
      className="group flex min-h-[54px] w-full items-stretch border border-[var(--border-strong)] bg-[var(--surface)] text-left transition-colors hover:border-[var(--text)]"
      aria-label={`Search ${count} tools`}
    >
      <span className="flex w-[52px] shrink-0 items-center justify-center border-r border-[var(--border)] text-[var(--text-subtle)] transition-colors group-hover:bg-[var(--text)] group-hover:text-[var(--page)]">
        <Search className="size-4" aria-hidden />
      </span>
      <span className="flex flex-1 items-center px-4 py-3 font-mono text-[0.68rem] uppercase tracking-[0.1em] text-[var(--text-subtle)]">
        Search {count} tools
      </span>
      <span className="hidden items-center gap-1 self-center pr-3 sm:flex">
        <kbd className="kbd">⌘</kbd>
        <kbd className="kbd">K</kbd>
      </span>
    </button>
  );
}
