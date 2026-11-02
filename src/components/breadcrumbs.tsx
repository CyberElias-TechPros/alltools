import Link from "next/link";
import { ChevronRight } from "lucide-react";

export interface Crumb {
  href: string;
  label: string;
}

export function Breadcrumbs({ items }: { items: Crumb[] }) {
  return (
    <nav aria-label="Breadcrumb" className="mb-6">
      <ol className="flex flex-wrap items-center gap-1.5 font-mono text-[0.6rem] uppercase tracking-[0.14em] text-[var(--text-subtle)]">
        <li>
          <Link href="/" className="transition-colors hover:text-[var(--accent-text)]">
            Home
          </Link>
        </li>
        {items.map((item, index) => {
          const last = index === items.length - 1;
          return (
            <li key={item.href} className="flex items-center gap-1.5">
              <ChevronRight className="size-3 text-[var(--border-strong)]" aria-hidden />
              {last ? (
                <span aria-current="page" className="text-[var(--text)]">
                  {item.label}
                </span>
              ) : (
                <Link href={item.href} className="transition-colors hover:text-[var(--accent-text)]">
                  {item.label}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
