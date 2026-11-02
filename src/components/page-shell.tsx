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
    <div className={`mx-auto px-4 py-8 sm:px-6 ${narrow ? "max-w-3xl" : "max-w-6xl"}`}>
      <Breadcrumbs items={breadcrumbs} />
      <h1 className="text-3xl font-bold tracking-[-0.03em] text-[var(--text)] sm:text-[2.2rem]">
        {title}
      </h1>
      {intro ? (
        <p className="mt-2 text-[1rem] leading-relaxed text-[var(--text-muted)]">{intro}</p>
      ) : null}
      {updated ? (
        <p className="mt-2 text-xs text-[var(--text-subtle)]">Last reviewed {updated}</p>
      ) : null}
      <div className="prose-tool mt-6">{children}</div>
    </div>
  );
}
