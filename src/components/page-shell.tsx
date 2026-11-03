import type { ReactNode } from "react";
import { Breadcrumbs, type Crumb } from "./breadcrumbs";

export function PageShell({
  title,
  intro,
  breadcrumbs,
  updated,
  children,
  narrow = true,
}: {
  title: string;
  intro?: string;
  breadcrumbs: Crumb[];
  updated?: string;
  children: ReactNode;
  narrow?: boolean;
}) {
  return (
    <div className="mx-auto max-w-6xl px-4 pb-16 pt-8 sm:px-6">
      <Breadcrumbs items={breadcrumbs} />
      <header className="max-w-3xl border-b border-[var(--border)] pb-6">
        <h1 className="display text-[clamp(2.1rem,4.6vw,3.35rem)] text-[var(--text)]">{title}</h1>
        {intro ? <p className="lede mt-4">{intro}</p> : null}
        {updated ? (
          <p className="eyebrow mt-5">Last reviewed — {updated}</p>
        ) : null}
      </header>
      <div className={`prose-tool mt-8 ${narrow ? "max-w-3xl" : ""}`}>{children}</div>
    </div>
  );
}
