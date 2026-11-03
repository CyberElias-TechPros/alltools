"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { LayoutGrid, Search, X } from "lucide-react";
import { ToolCard } from "@/components/tool-card";
import { CategoryIcon, CategoryTile } from "@/components/category-icon";
import { searchTools } from "@/lib/search";
import { cn } from "@/lib/utils";
import type { ToolDefinition, CategoryId } from "@/lib/tools/types";
import type { CategoryDefinition } from "@/lib/tools/types";

export function ToolsDirectory({
  tools,
  categories,
}: {
  tools: ToolDefinition[];
  categories: CategoryDefinition[];
}) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<CategoryId | "all">("all");

  useEffect(() => {
    const initial = new URLSearchParams(window.location.search).get("q");
    if (initial) setQuery(initial);
  }, []);

  const searchable = useMemo(
    () =>
      tools.map((tool) => ({
        slug: tool.slug,
        name: tool.name,
        tagline: tool.tagline,
        category: tool.category,
        keywords: tool.keywords,
        popularity: tool.popularity,
      })),
    [tools],
  );

  const results = useMemo(() => {
    const pool = category === "all" ? tools : tools.filter((tool) => tool.category === category);
    if (!query.trim()) {
      return [...pool].sort((a, b) => a.name.localeCompare(b.name));
    }
    const ranked = searchTools(
      searchable.filter((tool) => category === "all" || tool.category === category),
      query,
      pool.length,
    );
    const order = new Map(ranked.map((tool, index) => [tool.slug, index]));
    return pool
      .filter((tool) => order.has(tool.slug))
      .sort((a, b) => (order.get(a.slug) ?? 0) - (order.get(b.slug) ?? 0));
  }, [tools, searchable, query, category]);

  const activeCategories = categories.filter(
    (item) => item.status === "live" || tools.some((tool) => tool.category === item.id),
  );

  const countFor = (id: CategoryId) => tools.filter((tool) => tool.category === id).length;

  return (
    <div className="grid gap-8 lg:grid-cols-[16.5rem_1fr] lg:gap-10">
      {/* ── Sidebar ───────────────────────────────────────────── */}
      <aside className="lg:sticky lg:top-24 lg:self-start">
        <div className="card p-2.5">
          <p className="px-2.5 pb-2 pt-1.5 font-mono text-[0.58rem] uppercase tracking-[0.14em] text-[var(--text-subtle)]">
            Categories
          </p>
          <nav aria-label="Tool categories" className="flex flex-col gap-0.5">
            <button
              type="button"
              onClick={() => setCategory("all")}
              aria-pressed={category === "all"}
              className={cn(
                "flex items-center gap-2.5 rounded-xl px-2.5 py-2 text-left text-[0.88rem] transition-colors",
                category === "all"
                  ? "bg-[var(--surface-muted)] font-medium text-[var(--text)]"
                  : "text-[var(--text-muted)] hover:bg-[var(--surface-muted)] hover:text-[var(--text)]",
              )}
            >
              <span className="cat-tile cat-neutral size-8 rounded-[8px]">
                <LayoutGrid className="size-4" aria-hidden />
              </span>
              <span className="flex-1">All tools</span>
              <span className="font-mono text-[0.6rem] text-[var(--text-subtle)]">{tools.length}</span>
            </button>
            {activeCategories.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setCategory(item.id)}
                aria-pressed={category === item.id}
                className={cn(
                  "flex items-center gap-2.5 rounded-xl px-2.5 py-2 text-left text-[0.88rem] transition-colors",
                  category === item.id
                    ? "bg-[var(--surface-muted)] font-medium text-[var(--text)]"
                    : "text-[var(--text-muted)] hover:bg-[var(--surface-muted)] hover:text-[var(--text)]",
                )}
              >
                <span className="cat-tile cat-neutral size-8 rounded-[8px]">
                  <CategoryIcon id={item.id} className="size-4" />
                </span>
                <span className="flex-1">{item.shortName}</span>
                <span className="font-mono text-[0.6rem] text-[var(--text-subtle)]">{countFor(item.id)}</span>
              </button>
            ))}
          </nav>
        </div>

        <div className="mt-3 rounded-2xl border border-[var(--border)] bg-[var(--surface-muted)] p-4">
          <p className="font-mono text-[0.58rem] uppercase tracking-[0.12em] text-[var(--text-subtle)]">
            Keyboard
          </p>
          <p className="mt-2 text-[0.8rem] leading-relaxed text-[var(--text-muted)]">
            Press <kbd className="kbd">⌘</kbd> <kbd className="kbd">K</kbd> anywhere to search all{" "}
            {tools.length} tools without leaving the page.
          </p>
        </div>
      </aside>

      {/* ── Results ───────────────────────────────────────────── */}
      <div className="min-w-0">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative flex flex-1 items-center rounded-full border border-[var(--border)] bg-[var(--surface)] pl-4 shadow-[0_1px_2px_rgb(20_22_26/0.04)] transition-colors focus-within:border-[var(--ring)] focus-within:shadow-[0_0_0_3px_var(--ring-soft)]">
            <Search className="size-4 shrink-0 text-[var(--text-subtle)]" aria-hidden />
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search by name, task or keyword…"
              aria-label="Filter tools"
              className="w-full bg-transparent px-3 py-3 text-[0.9rem] text-[var(--text)] outline-none placeholder:text-[var(--text-subtle)]"
            />
            {query ? (
              <button
                type="button"
                onClick={() => setQuery("")}
                aria-label="Clear filter"
                className="mr-3 rounded-full p-1 text-[var(--text-subtle)] transition-colors hover:text-[var(--accent-text)]"
              >
                <X className="size-4" aria-hidden />
              </button>
            ) : null}
          </div>
          <p
            className="shrink-0 rounded-full border border-[var(--border)] bg-[var(--surface)] px-4 py-2.5 font-mono text-[0.62rem] uppercase tracking-[0.1em] text-[var(--text-subtle)]"
            aria-live="polite"
          >
            <span className="text-[var(--text)]">{results.length}</span>{" "}
            {results.length === 1 ? "tool" : "tools"}
          </p>
        </div>

        {/* Mobile category chips */}
        <div className="-mx-4 mt-3 flex gap-1.5 overflow-x-auto px-4 pb-1 sm:mx-0 sm:px-0 lg:hidden">
          <button
            type="button"
            onClick={() => setCategory("all")}
            aria-pressed={category === "all"}
            className={cn(
              "chip shrink-0",
              category === "all" && "border-[var(--text)] bg-[var(--text)] text-[var(--page)]",
            )}
          >
            All
          </button>
          {activeCategories.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setCategory(item.id)}
              aria-pressed={category === item.id}
              className={cn(
                "chip shrink-0",
                category === item.id && "border-[var(--text)] bg-[var(--text)] text-[var(--page)]",
              )}
            >
              <CategoryIcon id={item.id} className="size-3" />
              {item.shortName}
            </button>
          ))}
        </div>

        {results.length ? (
          <ol className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {results.map((tool) => (
              <li key={tool.slug} className="min-w-0">
                <ToolCard
                  tool={tool}
                  compact
                  showCategory={category === "all"}
                  className="h-full"
                />
              </li>
            ))}
          </ol>
        ) : (
          <div className="mt-5 rounded-2xl border border-dashed border-[var(--border-strong)] bg-[var(--surface)] p-12 text-center">
            <p className="text-sm font-semibold text-[var(--text)]">No tools match “{query}”</p>
            <p className="mx-auto mt-1.5 max-w-sm text-sm text-[var(--text-muted)]">
              Try a shorter word, or{" "}
              <Link href="/roadmap/" className="link">
                check the roadmap
              </Link>{" "}
              — we may already have it planned.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
