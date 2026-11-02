import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import type { ToolDefinition } from "@/lib/tools/types";
import { getCategory } from "@/lib/tools/categories";
import { CategoryIcon } from "./category-icon";

const pad = (value?: number) => (value ? String(value).padStart(2, "0") : null);

export function ToolCard({
  tool,
  showCategory = false,
  compact = false,
  variant = "tile",
  index,
}: {
  tool: ToolDefinition;
  showCategory?: boolean;
  compact?: boolean;
  variant?: "tile" | "row";
  index?: number;
}) {
  const category = getCategory(tool.category);

  if (variant === "row") {
    return (
      <li>
        <Link
          href={`/tools/${tool.slug}/`}
          className="index-row grid-cols-[1.75rem_1fr_auto] sm:grid-cols-[2.25rem_1fr_9rem_auto]"
        >
          <span className="index-row-num">{pad(index) ?? "—"}</span>
          <span className="min-w-0">
            <span className="index-row-title block text-[var(--text)] group-hover:text-inherit">
              {tool.name}
            </span>
            {!compact ? (
              <span className="index-row-desc mt-1 block truncate text-[0.84rem]">
                {tool.tagline}
              </span>
            ) : null}
          </span>
          <span className="index-row-meta hidden sm:block">{category.shortName}</span>
          <ArrowUpRight className="index-row-arrow size-4" aria-hidden />
        </Link>
      </li>
    );
  }

  return (
    <Link
      href={`/tools/${tool.slug}/`}
      className="group flex h-full flex-col justify-between border border-[var(--border)] bg-[var(--surface)] p-4 transition-colors hover:border-[var(--text)]"
    >
      <div className="flex items-start justify-between gap-2">
        <span className="text-[var(--text-subtle)] transition-colors group-hover:text-[var(--accent-text)]">
          <CategoryIcon id={tool.category} className="size-[1.05rem]" />
        </span>
        {showCategory ? (
          <span className="font-mono text-[0.58rem] uppercase tracking-[0.14em] text-[var(--text-subtle)]">
            {category.shortName}
          </span>
        ) : null}
      </div>

      <div className="mt-6 min-w-0">
        <h3 className="font-display text-[1.02rem] font-semibold leading-tight tracking-[-0.025em] text-[var(--text)]">
          {tool.name}
        </h3>
        {!compact ? (
          <p className="mt-1.5 line-clamp-2 text-[0.82rem] leading-relaxed text-[var(--text-muted)]">
            {tool.tagline}
          </p>
        ) : null}
      </div>

      <div className="mt-4 flex items-center justify-between border-t border-[var(--border)] pt-2.5">
        <span className="font-mono text-[0.58rem] uppercase tracking-[0.14em] text-[var(--text-subtle)]">
          Open tool
        </span>
        <ArrowUpRight
          className="size-3.5 text-[var(--text-subtle)] transition-all group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-[var(--accent-text)]"
          aria-hidden
        />
      </div>
    </Link>
  );
}

export function PlannedToolPill({ name }: { name: string }) {
  return (
    <li className="flex items-center justify-between gap-3 border-b border-dashed border-[var(--border)] py-2.5 text-sm text-[var(--text-muted)]">
      <span>{name}</span>
      <span className="shrink-0 font-mono text-[0.58rem] uppercase tracking-[0.14em] text-[var(--text-subtle)]">
        Planned
      </span>
    </li>
  );
}
