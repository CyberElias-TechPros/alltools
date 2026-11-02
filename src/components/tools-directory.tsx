"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Search, X } from "lucide-react";
import { ToolCard } from "@/components/tool-card";
import { CategoryIcon, categoryTone } from "@/components/category-icon";
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
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search
            className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[var(--text-subtle)]"
            aria-hidden
          />
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Filter by name, task or keyword…"
            aria-label="Filter tools"
            className="input !pl-9 !pr-9"
          />
          {query ? (
            <button
              type="button"
              onClick={() => setQuery("")}
              aria-label="Clear filter"
              className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded p-1 text-[var(--text-subtle)] hover:text-[var(--text)]"
            >
              <X className="size-3.5" aria-hidden />
            </button>
          ) : null}
        </div>
        <p className="shrink-0 text-sm text-[var(--text-muted)]" aria-live="polite">
          {results.length} {results.length === 1 ? "tool" : "tools"}
        </p>
      </div>

      <div className="mt-3 flex flex-wrap gap-1.5">
        <button
          type="button"
          onClick={() => setCategory("all")}
          aria-pressed={category === "all"}
          className={cn(
            "rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors",
            category === "all"
              ? "border-brand-500 bg-brand-600 text-white"
              : "border-[var(--border)] bg-[var(--surface)] text-[var(--text-muted)] hover:border-[var(--border-strong)]",
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
                "inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors",
                category === item.id
                  ? "border-brand-500 bg-brand-600 text-white"
                  : "border-[var(--border)] bg-[var(--surface)] text-[var(--text-muted)] hover:border-[var(--border-strong)]",
              )}
            >
              <CategoryIcon id={item.id} className="size-3" />
              {item.shortName}
              <span className={cn("text-[0.65rem]", category === item.id ? "text-white/70" : "text-[var(--text-subtle)]")}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {results.length ? (
        <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {results.map((tool) => (
            <ToolCard key={tool.slug} tool={tool} showCategory />
          ))}
        </div>
      ) : (
        <div className="mt-6 rounded-xl border border-dashed border-[var(--border-strong)] p-10 text-center">
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

      <p className="mt-6 text-xs text-[var(--text-subtle)]">
        Tip: press <kbd className="kbd">⌘</kbd> <kbd className="kbd">K</kbd> anywhere on the site to
        search without leaving the page.
      </p>
      <div className={cn("hidden", categoryTone("brand"))} aria-hidden />
    </div>
  );
}
