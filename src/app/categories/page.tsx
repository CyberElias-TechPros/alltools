import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { CategoryIcon, categoryTone } from "@/components/category-icon";
import { categories } from "@/lib/tools/categories";
import { toolCountByCategory } from "@/lib/tools/registry";

export const metadata: Metadata = {
  title: "Tool Categories — Browse by Task",
  description:
    "Twelve categories of free online tools: text, calculators, finance, developer, everyday converters, SEO and more. See what is live and what is planned.",
  alternates: { canonical: "/categories/" },
};

export default function CategoriesPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <Breadcrumbs items={[{ href: "/categories/", label: "Categories" }]} />
      <h1 className="text-3xl font-bold tracking-[-0.03em] text-[var(--text)] sm:text-[2.35rem]">
        Browse by category
      </h1>
      <p className="mt-2 max-w-2xl text-[0.98rem] leading-relaxed text-[var(--text-muted)]">
        Every category has a clear scope and an honest status. Live categories contain working,
        tested tools; planned categories show what is coming and are never presented as finished.
      </p>

      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        {categories.map((category) => {
          const count = toolCountByCategory[category.id] ?? 0;
          return (
            <Link
              key={category.id}
              href={`/categories/${category.id}/`}
              className="group flex flex-col rounded-xl border border-[var(--border)] bg-[var(--surface)] p-5 transition-all hover:-translate-y-0.5 hover:border-[var(--border-strong)] hover:shadow-[var(--shadow-soft)]"
            >
              <div className="flex items-start gap-3">
                <span className={`flex size-11 shrink-0 items-center justify-center rounded-xl ${categoryTone(category.accent)}`}>
                  <CategoryIcon id={category.id} className="size-5" />
                </span>
                <div className="min-w-0 flex-1">
                  <h2 className="text-[1rem] font-semibold text-[var(--text)]">{category.name}</h2>
                  <p className="mt-1 text-[0.85rem] leading-relaxed text-[var(--text-muted)]">
                    {category.tagline}
                  </p>
                </div>
              </div>
              <div className="mt-3 flex items-center justify-between">
                <span className="chip">
                  {count > 0 ? `${count} live` : "planned"}
                </span>
                <span className="inline-flex items-center gap-1 text-xs font-semibold text-brand-600 dark:text-brand-300">
                  View category
                  <ArrowRight className="size-3 transition-transform group-hover:translate-x-0.5" aria-hidden />
                </span>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
