import type { ReactNode } from "react";

/**
 * Page head used by every interior page: a small label, a large display title,
 * an optional lede and a right-hand meta column rendered as stat cards.
 *
 * Editorial variant of the homepage language: oversized display type with a
 * signal-colour full stop, hairline rule, and a glass meta card.
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
    <header className="relative isolate pb-2">
      <div
        className="pointer-events-none absolute -inset-x-6 -top-12 -z-10 h-72 bg-[radial-gradient(55%_110%_at_15%_0%,var(--ring-soft),transparent_70%)]"
        aria-hidden
      />
      <div className="grid gap-8 lg:grid-cols-[1.65fr_1fr] lg:items-end lg:gap-12">
        <div>
          <p className="flex items-center gap-2.5 font-mono text-[0.58rem] uppercase tracking-[0.22em] text-[var(--text-subtle)]">
            <span className="size-1 rounded-full bg-[var(--ring)]" aria-hidden />
            {label}
          </p>
          <h1 className="display mt-4 text-[clamp(2.15rem,4.6vw,3.6rem)] text-[var(--text)]">
            {title}
          </h1>
          {lede ? <p className="lede mt-5 max-w-xl">{lede}</p> : null}
        </div>
        {meta ? (
          <div className="glass grid gap-1 rounded-2xl p-3 sm:grid-cols-3 lg:grid-cols-1">
            {meta}
          </div>
        ) : null}
      </div>
      <div className="mt-8 h-px w-full bg-[var(--border)]" aria-hidden />
      {children}
    </header>
  );
}

export function HeaderStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between gap-4 rounded-xl px-1 py-1.5 lg:px-2">
      <span className="font-mono text-[0.58rem] uppercase tracking-[0.14em] text-[var(--text-subtle)]">
        {label}
      </span>
      <span className="font-display text-lg font-bold tracking-[-0.03em] text-[var(--text)]">
        {value}
      </span>
    </div>
  );
}
