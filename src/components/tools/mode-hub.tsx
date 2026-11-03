"use client";

import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * Hub layout for multi-mode tools.
 *
 * Instead of hiding three calculators behind a segmented switch — where the
 * visitor sees one at a time and has to discover the rest — a hub shows every
 * mode at once as its own small card, each with its own inputs and its own
 * answer. It matches how people actually arrive: with one specific question.
 */
export function ModeHub({
  children,
  intro,
  footer,
  columns = 2,
}: {
  children: ReactNode;
  intro?: ReactNode;
  footer?: ReactNode;
  columns?: 1 | 2 | 3;
}) {
  return (
    (<div>
      {intro ? <div className="mb-4 max-w-2xl text-sm leading-relaxed text-[var(--text-muted)]">{intro}</div> : null}
      <div
        className={cn(
          "grid gap-3",
          columns === 2 && "lg:grid-cols-2",
          columns === 3 && "sm:grid-cols-2 xl:grid-cols-3",
        )}
      >
        {children}
      </div>
      {footer ? <div className="mt-4">{footer}</div> : null}
    </div>)
  );
}

export function ModeCard({
  title,
  hint,
  badge,
  children,
  className,
}: {
  title: string;
  hint?: string;
  badge?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section
      className={cn(
        "flex flex-col rounded-2xl border border-[var(--border)] bg-[var(--surface-muted)]/45 p-4 sm:p-5",
        className,
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="font-display text-[1.02rem] font-semibold leading-snug tracking-[-0.02em] text-[var(--text)]">
            {title}
          </h3>
          {hint ? <p className="mt-1 text-[0.78rem] leading-relaxed text-[var(--text-subtle)]">{hint}</p> : null}
        </div>
        {badge ? (
          <span className="shrink-0 rounded-full border border-[var(--border)] bg-[var(--surface)] px-2 py-0.5 font-mono text-[0.55rem] uppercase tracking-[0.1em] text-[var(--text-subtle)]">
            {badge}
          </span>
        ) : null}
      </div>
      <div className="mt-3 flex flex-1 flex-col">{children}</div>
    </section>
  );
}

/** Compact result block used inside a ModeCard. */
export function ModeResult({
  label,
  value,
  detail,
  error,
}: {
  label: string;
  value: string;
  detail?: string;
  error?: string;
}) {
  return (
    <div
      aria-live="polite"
      className={cn(
        "mt-3 rounded-xl border px-3.5 py-3",
        error
          ? "border-[var(--border)] bg-[var(--surface)]"
          : "border-[var(--result-border)] bg-[var(--result-bg)]",
      )}
    >
      <p className="font-mono text-[0.58rem] uppercase tracking-[0.12em] text-[var(--text-subtle)]">
        {error ? "Cannot calculate" : label}
      </p>
      <p
        className={cn(
          "mt-1 break-words font-mono text-[1.35rem] font-bold leading-tight",
          error ? "text-[var(--text-muted)]" : "stat-number",
        )}
      >
        {error ? "—" : value}
      </p>
      {error ? (
        <p className="mt-1 text-xs text-[var(--text-muted)]">{error}</p>
      ) : detail ? (
        <p className="mt-1 font-mono text-[0.72rem] leading-relaxed text-[var(--text-muted)]">{detail}</p>
      ) : null}
    </div>
  );
}
