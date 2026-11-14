import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import type { ToolDefinition } from "@/lib/tools/types";
import { getCategory } from "@/lib/tools/categories";
import { cn } from "@/lib/utils";
import { CategoryTile } from "./category-icon";

const pad = (value?: number) => (value ? String(value).padStart(2, "0") : null);

export function ToolCard({
  tool,
  showCategory = false,
  compact = false,
  variant = "tile",
  index,
  className,
}: {
  tool: ToolDefinition;
  showCategory?: boolean;
  compact?: boolean;
  variant?: "tile" | "row";
  index?: number;
  className?: string;
}) {
  const category = getCategory(tool.category);

  if (variant === "row") {
    return (
      <li>
        <Link
          href={`/tools/${tool.slug}/`}
          className="index-row group grid-cols-[1.75rem_1fr_auto] sm:grid-cols-[2.25rem_1fr_9rem_auto]"
        >
          <span className="index-row-num">{pad(index) ?? "—"}</span>
          <span className="min-w-0">
            <span className="index-row-title block">{tool.name}</span>
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
      className={cn(
        "card card-lift group relative flex h-full flex-col overflow-hidden p-5",
        compact && "p-4",
        className,
      )}
    >
      {/* hover wash */}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(120%_80%_at_100%_0%,color-mix(in_oklab,var(--ring)_9%,transparent),transparent_60%)] opacity-0 transition-opacity duration-500 group-hover:opacity-100"
      />
      <div className="relative flex items-start justify-between gap-2">
        <CategoryTile id={tool.category} size={compact ? "sm" : "md"} />
        {showCategory ? (
          <span className="mt-1 font-mono text-[0.58rem] uppercase tracking-[0.12em] text-[var(--text-subtle)]">
            {category.shortName}
          </span>
        ) : (
          <span className="mt-1 flex items-center gap-2">
            {typeof index === "number" ? (
              <span className="font-mono text-[0.58rem] tabular-nums tracking-[0.1em] text-[var(--text-subtle)]/70">
                {pad(index)}
              </span>
            ) : null}
            <ArrowUpRight
              className="size-4 text-[var(--text-subtle)] transition-all duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-[var(--accent-text)]"
              aria-hidden
            />
          </span>
        )}
      </div>

      <div className="relative mt-4 min-w-0">
        <h3 className="font-display text-[1.02rem] font-semibold leading-snug tracking-[-0.025em] text-[var(--text)]">
          {tool.name}
        </h3>
        <p className="mt-1.5 line-clamp-2 text-[0.82rem] leading-relaxed text-[var(--text-muted)]">
          {tool.tagline}
        </p>
      </div>
      <span
        aria-hidden
        className="mt-4 h-px w-full origin-left scale-x-0 bg-gradient-to-r from-[var(--ring)] to-transparent transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-x-100"
      />
    </Link>
  );
}

export function PlannedToolPill({ name }: { name: string }) {
  return (
    <li className="flex items-center justify-between gap-3 rounded-xl border border-dashed border-[var(--border-strong)] px-3.5 py-2.5 text-sm text-[var(--text-muted)]">
      <span>{name}</span>
      <span className="shrink-0 font-mono text-[0.58rem] uppercase tracking-[0.12em] text-[var(--text-subtle)]">
        Planned
      </span>
    </li>
  );
}
