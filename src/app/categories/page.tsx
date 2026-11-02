import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { HeaderStat, PageHeader } from "@/components/page-header";
import { CategoryTile } from "@/components/category-icon";
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

      <ul className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {categories.map((category) => {
          const count = toolCountByCategory[category.id] ?? 0;
          const planned = count === 0;
          return (
            <li key={category.id} className="min-w-0">
              <Link
                href={`/categories/${category.id}/`}
                className="card card-lift group flex h-full flex-col p-5"
              >
                <div className="flex items-start justify-between gap-3">
                  <CategoryTile id={category.id} size="lg" />
                  <span
                    className={`shrink-0 rounded-full border border-[var(--border)] px-2.5 py-1 font-mono text-[0.58rem] uppercase tracking-[0.1em] ${
                      planned ? "text-[var(--text-subtle)]" : "text-[var(--text-muted)]"
                    }`}
                  >
                    {planned ? "Planned" : `${count} tools`}
                  </span>
                </div>
                <h2 className="mt-4 font-display text-[1.15rem] font-semibold leading-tight tracking-[-0.03em] text-[var(--text)]">
                  {category.name}
                </h2>
                <p className="mt-1.5 text-[0.86rem] leading-relaxed text-[var(--text-muted)]">
                  {category.tagline}
                </p>
                <span className="mt-4 inline-flex items-center gap-1 text-[0.8rem] font-medium text-[var(--accent-text)]">
                  Browse
                  <ArrowUpRight
                    className="size-3.5 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
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
