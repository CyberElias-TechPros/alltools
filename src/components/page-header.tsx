import type { ReactNode } from "react";

/**
 * Page head used by every interior page: a small label, a large display title,
 * an optional lede and a right-hand meta column rendered as stat cards.
 */
export function PageHeader({
  label,
  title,
  lede,
  meta,
  children,
}: {
  label: string;
  title: ReactNode;
  lede?: string;
  meta?: ReactNode;
  children?: ReactNode;
}) {
  return (
    <header className="pb-2">
      <div className="grid gap-8 lg:grid-cols-[1.65fr_1fr] lg:items-end lg:gap-12">
        <div>
          <p className="eyebrow">{label}</p>
          <h1 className="display mt-3 text-[clamp(2.15rem,4.6vw,3.5rem)] text-[var(--text)]">
            {title}
          </h1>
          {lede ? <p className="lede mt-4">{lede}</p> : null}
        </div>
        {meta ? (
          <div className="grid gap-2 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-3 shadow-[var(--shadow-soft)] sm:grid-cols-3 lg:grid-cols-1">
            {meta}
          </div>
        ) : null}
      </div>
      {children}
    </header>
  );
}

export function HeaderStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between gap-4 rounded-xl px-1 py-1.5 lg:px-2">
      <span className="font-mono text-[0.6rem] uppercase tracking-[0.12em] text-[var(--text-subtle)]">
        {label}
      </span>
      <span className="font-display text-lg font-bold tracking-[-0.03em] text-[var(--text)]">
        {value}
      </span>
    </div>
  );
}
