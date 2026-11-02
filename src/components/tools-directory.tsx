"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Search, X } from "lucide-react";
import { ToolCard } from "@/components/tool-card";
import { CategoryIcon } from "@/components/category-icon";
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

  return (
    <div>
      <div className="flex flex-col gap-px border border-[var(--border-strong)] bg-[var(--border)] sm:flex-row sm:items-stretch">
        <div className="relative flex flex-1 items-center bg-[var(--surface)]">
          <span className="flex w-12 shrink-0 items-center justify-center self-stretch border-r border-[var(--border)] text-[var(--text-subtle)]">
            <Search className="size-4" aria-hidden />
          </span>
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Filter by name, task or keyword…"
            aria-label="Filter tools"
            className="w-full bg-transparent px-3 py-3 font-mono text-[0.78rem] tracking-[0.02em] text-[var(--text)] outline-none placeholder:text-[var(--text-subtle)]"
          />
          {query ? (
            <button
              type="button"
              onClick={() => setQuery("")}
              aria-label="Clear filter"
              className="mr-2 p-1.5 text-[var(--text-subtle)] transition-colors hover:text-[var(--accent-text)]"
            >
              <X className="size-3.5" aria-hidden />
            </button>
          ) : null}
        </div>
        <p
          className="flex shrink-0 items-center justify-between gap-2 bg-[var(--surface-muted)] px-4 py-3 font-mono text-[0.62rem] uppercase tracking-[0.14em] text-[var(--text-muted)] sm:justify-start"
          aria-live="polite"
        >
          <span className="text-[var(--text)]">{String(results.length).padStart(2, "0")}</span>
          {results.length === 1 ? "tool" : "tools"}
        </p>
      </div>

      <div className="mt-4 flex flex-wrap gap-1.5">
        <button
          type="button"
          onClick={() => setCategory("all")}
          aria-pressed={category === "all"}
          className={cn(
            "border px-2.5 py-1.5 font-mono text-[0.6rem] uppercase tracking-[0.12em] transition-colors",
            category === "all"
              ? "border-[var(--text)] bg-[var(--text)] text-[var(--page)]"
              : "border-[var(--border)] text-[var(--text-muted)] hover:border-[var(--border-strong)] hover:text-[var(--text)]",
          )}
        >
          All categories
        </button>
        {activeCategories.map((item) => {
          const count = tools.filter((tool) => tool.category === item.id).length;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => setCategory(item.id)}
              aria-pressed={category === item.id}
              className={cn(
                "inline-flex items-center gap-1.5 border px-2.5 py-1.5 font-mono text-[0.6rem] uppercase tracking-[0.12em] transition-colors",
                category === item.id
                  ? "border-[var(--text)] bg-[var(--text)] text-[var(--page)]"
                  : "border-[var(--border)] text-[var(--text-muted)] hover:border-[var(--border-strong)] hover:text-[var(--text)]",
              )}
            >
              <CategoryIcon id={item.id} className="size-3" />
              {item.shortName}
              <span
                className={cn(
                  "text-[0.55rem]",
                  category === item.id ? "text-[var(--page)]/60" : "text-[var(--text-subtle)]",
                )}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {results.length ? (
        <ol className="mt-6 border-t border-[var(--border)]">
          {results.map((tool, index) => (
            <ToolCard
              key={tool.slug}
              tool={tool}
              variant="row"
              index={index + 1}
            />
          ))}
        </ol>
      ) : (
        <div className="mt-6 border border-dashed border-[var(--border-strong)] p-10 text-center">
          <p className="text-sm font-semibold text-[var(--text)]">No tools match “{query}”</p>
          <p className="mx-auto mt-1 max-w-sm text-sm text-[var(--text-muted)]">
            Try a shorter word, or{" "}
            <Link href="/roadmap/" className="link">
              check the roadmap
            </Link>{" "}
            — we may already have it planned.
          </p>
        </div>
      )}

      <p className="mt-8 flex flex-wrap items-center gap-2 font-mono text-[0.62rem] uppercase tracking-[0.12em] text-[var(--text-subtle)]">
        Tip: press <kbd className="kbd">⌘</kbd> <kbd className="kbd">K</kbd> anywhere to search
        without leaving the page.
      </p>
    </div>
  );
}
