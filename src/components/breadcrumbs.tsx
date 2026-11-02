import Link from "next/link";
import { ChevronRight } from "lucide-react";

export interface Crumb {
  href: string;
  label: string;
}

export function Breadcrumbs({ items }: { items: Crumb[] }) {
  return (
    <nav aria-label="Breadcrumb" className="mb-5">
      <ol className="flex flex-wrap items-center gap-1 text-[0.78rem] text-[var(--text-subtle)]">
        <li>
          <Link href="/" className="hover:text-[var(--text)]">
            Home
          </Link>
        </li>
        {items.map((item, index) => {
          const last = index === items.length - 1;
          return (
            <li key={item.href} className="flex items-center gap-1">
              <ChevronRight className="size-3" aria-hidden />
              {last ? (
                <span aria-current="page" className="font-medium text-[var(--text-muted)]">
                  {item.label}
                </span>
              ) : (
                <Link href={item.href} className="hover:text-[var(--text)]">
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
