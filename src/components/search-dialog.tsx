"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, CornerDownLeft, Search } from "lucide-react";
import { searchTools } from "@/lib/search";
import type { SearchableTool } from "@/lib/search";
import { cn } from "@/lib/utils";
import { CategoryIcon } from "./category-icon";
import type { CategoryId } from "@/lib/tools/types";

const RECENT_KEY = "toolora:recent";

export function readRecentSlugs(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const parsed = JSON.parse(window.localStorage.getItem(RECENT_KEY) ?? "[]");
    return Array.isArray(parsed) ? parsed.filter((item) => typeof item === "string").slice(0, 6) : [];
  } catch {
    return [];
  }
}

export function rememberTool(slug: string): void {
  if (typeof window === "undefined") return;
  try {
    const next = [slug, ...readRecentSlugs().filter((item) => item !== slug)].slice(0, 6);
    window.localStorage.setItem(RECENT_KEY, JSON.stringify(next));
  } catch {
    /* storage may be unavailable in private mode — ignore */
  }
}

export function SearchDialog({ index }: { index: SearchableTool[] }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const [recent, setRecent] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  const results = useMemo(() => {
    if (query.trim()) return searchTools(index, query, 8);
    const recentTools = recent
      .map((slug) => index.find((tool) => tool.slug === slug))
      .filter((tool): tool is SearchableTool => Boolean(tool));
    const popular = [...index]
      .sort((a, b) => (b.popularity ?? 0) - (a.popularity ?? 0))
      .slice(0, 6);
    const merged = [...recentTools];
    for (const tool of popular) {
      if (!merged.some((item) => item.slug === tool.slug)) merged.push(tool);
    }
    return merged.slice(0, 6);
  }, [index, query, recent]);

  const close = useCallback(() => {
    setOpen(false);
    setQuery("");
    setActive(0);
  }, []);

  const go = useCallback(
    (slug: string) => {
      rememberTool(slug);
      close();
      router.push(`/tools/${slug}/`);
    },
    [close, router],
  );

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      const target = event.target as HTMLElement | null;
      const isTyping =
        target?.tagName === "INPUT" ||
        target?.tagName === "TEXTAREA" ||
        target?.isContentEditable;

      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setOpen((value) => !value);
        return;
      }
      if (event.key === "/" && !isTyping) {
        event.preventDefault();
        setOpen(true);
      }
    }

    function onOpen() {
      setOpen(true);
    }

    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("toolora:open-search", onOpen);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("toolora:open-search", onOpen);
    };
  }, []);

  useEffect(() => {
    if (!open) return undefined;

    // Remember where focus came from so closing the dialog returns the visitor
    // to the control they were using (required for keyboard and screen readers).
    const opener = document.activeElement as HTMLElement | null;
    setRecent(readRecentSlugs());
    const frame = requestAnimationFrame(() => inputRef.current?.focus());
    document.documentElement.style.overflow = "hidden";

    return () => {
      cancelAnimationFrame(frame);
      document.documentElement.style.overflow = "";
      opener?.focus?.();
    };
  }, [open]);

  useEffect(() => {
    setActive(0);
  }, [query]);

  function handleKeyDown(event: React.KeyboardEvent) {
    if (event.key === "Escape") {
      event.preventDefault();
      close();
    } else if (event.key === "ArrowDown") {
      event.preventDefault();
      setActive((value) => (value + 1) % Math.max(results.length, 1));
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setActive((value) => (value - 1 + results.length) % Math.max(results.length, 1));
    } else if (event.key === "Tab") {
      const container = event.currentTarget as HTMLElement;
      const focusable = Array.from(
        container.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), input, select, textarea, [tabindex]:not([tabindex="-1"])',
        ),
      ).filter((node) => node.offsetParent !== null);
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    } else if (event.key === "Enter") {
      event.preventDefault();
      const target = results[active];
      if (target) go(target.slug);
      else if (query.trim()) router.push(`/tools/?q=${encodeURIComponent(query.trim())}`);
    }
  }

  useEffect(() => {
    const node = listRef.current?.children[active] as HTMLElement | undefined;
    node?.scrollIntoView({ block: "nearest" });
  }, [active]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="group flex h-10 items-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3 text-sm text-[var(--text-subtle)] transition-colors hover:border-[var(--border-strong)] hover:text-[var(--text-muted)] md:min-w-56 md:justify-between"
        aria-label="Search tools"
      >
        <span className="flex items-center gap-2">
          <Search className="size-4" aria-hidden />
          <span className="hidden md:inline">Search tools…</span>
        </span>
        <span className="hidden items-center gap-1 md:flex">
          <kbd className="kbd">⌘</kbd>
          <kbd className="kbd">K</kbd>
        </span>
      </button>

      {open ? (
        <div
          className="fixed inset-0 z-[90] flex items-start justify-center bg-black/40 p-3 pt-[8vh] backdrop-blur-sm sm:pt-[12vh]"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) close();
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Search tools"
            onKeyDown={handleKeyDown}
            className="animate-in w-full max-w-xl overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--page-elevated)] shadow-2xl"
          >
            <div className="flex items-center gap-3 border-b border-[var(--border)] px-4">
              <Search className="size-4 shrink-0 text-[var(--text-subtle)]" aria-hidden />
              <input
                ref={inputRef}
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder={`Search ${index.length} tools — try “json”, “percent”, “password”…`}
                className="h-14 w-full bg-transparent text-[0.95rem] text-[var(--text)] outline-none placeholder:text-[var(--text-subtle)]"
                aria-label="Search query"
                aria-controls="search-results"
                aria-activedescendant={results[active] ? `search-${results[active].slug}` : undefined}
                role="combobox"
                aria-expanded="true"
                autoComplete="off"
                spellCheck={false}
              />
              <button
                type="button"
                onClick={close}
                className="shrink-0 rounded-md border border-[var(--border)] px-1.5 py-0.5 text-[0.68rem] font-semibold text-[var(--text-subtle)]"
                aria-label="Close search"
              >
                ESC
              </button>
            </div>

            <ul
              id="search-results"
              ref={listRef}
              role="listbox"
              aria-label="Tool results"
              className="max-h-[min(60vh,26rem)] overflow-y-auto p-2"
            >
              {results.length === 0 ? (
                <li className="px-3 py-8 text-center text-sm text-[var(--text-muted)]">
                  No tools match “{query}”. Try a shorter word, or{" "}
                  <Link href="/tools/" className="link" onClick={close}>
                    browse all tools
                  </Link>
                  .
                </li>
              ) : (
                results.map((tool, position) => (
                  <li key={tool.slug} role="none">
                    <button
                      type="button"
                      id={`search-${tool.slug}`}
                      role="option"
                      aria-selected={position === active}
                      onMouseEnter={() => setActive(position)}
                      onClick={() => go(tool.slug)}
                      className={cn(
                        "flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors",
                        position === active ? "bg-[var(--surface-muted)]" : "",
                      )}
                    >
                      <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-[var(--surface-muted)] text-[var(--text-muted)]">
                        <CategoryIcon
                          id={tool.category as CategoryId}
                          className="size-[1.05rem]"
                        />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-semibold text-[var(--text)]">
                          {tool.name}
                        </span>
                        <span className="block truncate text-xs text-[var(--text-subtle)]">
                          {tool.tagline}
                        </span>
                      </span>
                      {position === active ? (
                        <CornerDownLeft
                          className="size-4 shrink-0 text-[var(--text-subtle)]"
                          aria-hidden
                        />
                      ) : null}
                    </button>
                  </li>
                ))
              )}
            </ul>

            <div className="flex flex-wrap items-center justify-between gap-2 border-t border-[var(--border)] px-4 py-2.5 text-[0.7rem] text-[var(--text-subtle)]">
              <span className="flex items-center gap-3">
                <span>↑↓ to move</span>
                <span>↵ to open</span>
              </span>
              <Link
                href="/tools/"
                onClick={close}
                className="inline-flex items-center gap-1 font-semibold text-[var(--text-muted)]"
              >
                Browse all tools
                <ArrowRight className="size-3" aria-hidden />
              </Link>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
