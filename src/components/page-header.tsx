import type { ReactNode } from "react";

/**
 * Editorial page head: numbered section label, oversized display title, lede and
 * an optional right-hand meta column. Closed by an ink rule so every page opens
 * the same way.
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
    <header className="border-b border-[var(--text)] pb-6">
      <div className="grid gap-6 lg:grid-cols-12 lg:gap-10">
        <div className="lg:col-span-8">
          <p className="eyebrow">{label}</p>
          <h1 className="display mt-3 text-[clamp(2.2rem,5.2vw,3.9rem)] text-[var(--text)]">
            {title}
          </h1>
          {lede ? <p className="lede mt-4">{lede}</p> : null}
        </div>
        {meta ? (
          <div className="self-end border-t border-[var(--border)] pt-3 lg:col-span-4 lg:border-l lg:border-t-0 lg:pl-6 lg:pt-0">
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
    <div className="flex items-baseline justify-between gap-4 border-b border-[var(--border)] py-2 last:border-b-0">
      <span className="font-mono text-[0.6rem] uppercase tracking-[0.14em] text-[var(--text-subtle)]">
        {label}
      </span>
      <span className="font-display text-lg font-bold tracking-[-0.03em] text-[var(--text)]">
        {value}
      </span>
    </div>
  );
}
