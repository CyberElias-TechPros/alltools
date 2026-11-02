import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import type { ToolDefinition } from "@/lib/tools/types";
import { getCategory } from "@/lib/tools/categories";
import { CategoryIcon, categoryTone } from "./category-icon";

export function ToolCard({
  tool,
  showCategory = false,
  compact = false,
}: {
  tool: ToolDefinition;
  showCategory?: boolean;
  compact?: boolean;
}) {
  const category = getCategory(tool.category);

  return (
    <Link
      href={`/tools/${tool.slug}/`}
      className="group relative flex flex-col gap-3 rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4 transition-all hover:-translate-y-0.5 hover:border-[var(--border-strong)] hover:shadow-[var(--shadow-soft)]"
    >
      <div className="flex items-start justify-between gap-2">
        <span
          className={`flex size-9 shrink-0 items-center justify-center rounded-lg ${categoryTone(category.accent)}`}
        >
          <CategoryIcon id={tool.category} className="size-[1.05rem]" />
        </span>
        <ArrowUpRight
          className="size-4 shrink-0 text-[var(--text-subtle)] opacity-0 transition-opacity group-hover:opacity-100"
          aria-hidden
        />
      </div>
      <div className="min-w-0 flex-1">
        <h3 className="text-[0.95rem] font-semibold leading-snug text-[var(--text)]">
          {tool.name}
        </h3>
        {!compact ? (
          <p className="mt-1 line-clamp-2 text-[0.82rem] leading-relaxed text-[var(--text-muted)]">
            {tool.tagline}
          </p>
        ) : null}
      </div>
      {showCategory ? (
        <span className="text-[0.7rem] font-medium uppercase tracking-[0.07em] text-[var(--text-subtle)]">
          {category.shortName}
        </span>
      ) : null}
    </Link>
  );
}

export function PlannedToolPill({ name }: { name: string }) {
  return (
    <li className="flex items-center justify-between gap-3 rounded-lg border border-dashed border-[var(--border)] px-3 py-2 text-sm text-[var(--text-muted)]">
      <span>{name}</span>
      <span className="shrink-0 text-[0.65rem] font-semibold uppercase tracking-[0.08em] text-[var(--text-subtle)]">
        Planned
      </span>
    </li>
  );
}
