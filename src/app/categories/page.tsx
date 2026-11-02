import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { HeaderStat, PageHeader } from "@/components/page-header";
import { CategoryIcon } from "@/components/category-icon";
import { categories } from "@/lib/tools/categories";
import { toolCountByCategory } from "@/lib/tools/registry";

export const metadata: Metadata = {
  title: "Tool Categories — Browse by Task",
  description:
    "Twelve categories of free online tools: text, calculators, finance, developer, everyday converters, SEO and more. See what is live and what is planned.",
  alternates: { canonical: "/categories/" },
};

export default function CategoriesPage() {
  const liveCount = categories.filter((category) => category.status === "live").length;

  return (
    <div className="mx-auto max-w-6xl px-4 pb-16 pt-8 sm:px-6">
      <Breadcrumbs items={[{ href: "/categories/", label: "Categories" }]} />

      <PageHeader
        label="Shelf"
        title={
          <>
            Twelve shelves.
            <br />
            No filler<span className="text-[var(--accent-text)]">.</span>
          </>
        }
        lede="Every category has a clear scope and an honest status. Live categories contain working, tested tools; planned categories show what is coming and are never presented as finished."
        meta={
          <div>
            <HeaderStat label="Live" value={`${liveCount} categories`} />
            <HeaderStat label="Planned" value={`${categories.length - liveCount} categories`} />
            <HeaderStat
              label="Tools"
              value={String(Object.values(toolCountByCategory).reduce((a, b) => a + b, 0))}
            />
          </div>
        }
      />

      <ul className="mt-2 border-t border-[var(--border)]">
        {categories.map((category, index) => {
          const count = toolCountByCategory[category.id] ?? 0;
          const planned = count === 0;
          return (
            <li key={category.id} className="border-b border-[var(--border)]">
              <Link
                href={`/categories/${category.id}/`}
                className="group grid grid-cols-[2rem_1fr_auto] items-baseline gap-x-4 gap-y-1 py-5 transition-colors hover:bg-[var(--surface-muted)] sm:grid-cols-[2.5rem_1.5rem_1fr_8rem_auto] sm:px-2"
              >
                <span className="font-mono text-[0.62rem] tracking-[0.1em] text-[var(--text-subtle)]">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <span
                  className={`col-start-2 hidden sm:block ${planned ? "text-[var(--text-subtle)]" : "text-[var(--text)]"}`}
                >
                  <CategoryIcon id={category.id} className="size-[1.05rem]" />
                </span>
                <span className="col-start-2 min-w-0 sm:col-start-3">
                  <span
                    className={`block font-display text-[1.2rem] font-semibold leading-tight tracking-[-0.03em] transition-colors ${
                      planned
                        ? "text-[var(--text-subtle)]"
                        : "text-[var(--text)] group-hover:text-[var(--accent-text)]"
                    }`}
                  >
                    {category.name}
                  </span>
                  <span className="mt-1 block max-w-2xl text-[0.86rem] leading-relaxed text-[var(--text-muted)]">
                    {category.tagline}
                  </span>
                </span>
                <span
                  className={`hidden font-mono text-[0.6rem] uppercase tracking-[0.12em] sm:block ${
                    planned ? "text-[var(--text-subtle)]" : "text-[var(--accent-text)]"
                  }`}
                >
                  {planned ? "Planned" : `${count} live`}
                </span>
                <span className="col-start-3 flex items-center gap-3 self-center sm:col-start-5">
                  <span className="font-mono text-[0.6rem] uppercase tracking-[0.12em] text-[var(--text-subtle)] sm:hidden">
                    {planned ? "Planned" : `${count} live`}
                  </span>
                  <ArrowUpRight
                    className="size-4 text-[var(--text-subtle)] transition-all group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-[var(--accent-text)]"
                    aria-hidden
                  />
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
