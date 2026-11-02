import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, Clock } from "lucide-react";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { JsonLd } from "@/components/json-ld";
import { ToolCard, PlannedToolPill } from "@/components/tool-card";
import { CategoryIcon, categoryTone } from "@/components/category-icon";
import { categories, getCategory } from "@/lib/tools/categories";
import { toolsByCategory } from "@/lib/tools/registry";
import { siteConfig } from "@/lib/site";
import type { CategoryId } from "@/lib/tools/types";

export function generateStaticParams() {
  return categories.map((category) => ({ id: category.id }));
}

export const dynamicParams = false;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const category = categories.find((item) => item.id === id);
  if (!category) return {};
  return {
    title: `${category.name} — Free Online Tools`,
    description: category.description,
    alternates: { canonical: `/categories/${category.id}/` },
  };
}

export default async function CategoryPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const found = categories.find((item) => item.id === id);
  if (!found) notFound();
  const category = getCategory(id as CategoryId);
  const live = toolsByCategory(category.id);
  const related = categories.filter((item) => item.id !== category.id && item.status === "live").slice(0, 3);

  const itemList =
    live.length > 0
      ? {
          "@context": "https://schema.org",
          "@type": "ItemList",
          name: category.name,
          numberOfItems: live.length,
          itemListElement: live.map((tool, index) => ({
            "@type": "ListItem",
            position: index + 1,
            name: tool.name,
            url: `${siteConfig.url}/tools/${tool.slug}/`,
          })),
        }
      : null;

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      {itemList ? <JsonLd data={itemList} /> : null}
      <Breadcrumbs
        items={[
          { href: "/categories/", label: "Categories" },
          { href: `/categories/${category.id}/`, label: category.shortName },
        ]}
      />

      <div className="flex items-start gap-4">
        <span className={`flex size-12 shrink-0 items-center justify-center rounded-xl ${categoryTone(category.accent)}`}>
          <CategoryIcon id={category.id} className="size-6" />
        </span>
        <div>
          <h1 className="text-3xl font-bold tracking-[-0.03em] text-[var(--text)] sm:text-[2.2rem]">
            {category.name}
          </h1>
          <p className="mt-1.5 max-w-2xl text-[0.98rem] leading-relaxed text-[var(--text-muted)]">
            {category.tagline}. {live.length > 0 ? `${live.length} tools live now.` : "Planned — not yet published."}
          </p>
        </div>
      </div>

      <div className="prose-tool mt-5 max-w-3xl">
        {category.intro.map((paragraph) => (
          <p key={paragraph.slice(0, 30)}>{paragraph}</p>
        ))}
      </div>

      {live.length > 0 ? (
        <section className="mt-8">
          <h2 className="mb-3 text-lg font-bold text-[var(--text)]">Live tools</h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {live.map((tool) => (
              <ToolCard key={tool.slug} tool={tool} />
            ))}
          </div>
        </section>
      ) : (
        <div className="mt-8 rounded-xl border border-dashed border-[var(--border-strong)] p-6">
          <p className="text-sm font-semibold text-[var(--text)]">
            This category is on the roadmap
          </p>
          <p className="mt-1 max-w-xl text-sm leading-relaxed text-[var(--text-muted)]">
            Nothing in this category is published yet — we do not list placeholder pages as working
            products. The tools below are the planned scope, and each will appear here once it is
            built and tested.
          </p>
        </div>
      )}

      <section className="mt-8">
        <div className="mb-3 flex items-center gap-2">
          <Clock className="size-4 text-[var(--text-subtle)]" aria-hidden />
          <h2 className="text-lg font-bold text-[var(--text)]">Planned for this category</h2>
        </div>
        <ul className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {category.plannedTools.map((name) => (
            <PlannedToolPill key={name} name={name} />
          ))}
        </ul>
        <p className="mt-3 text-xs text-[var(--text-subtle)]">
          Planned tools have no pages yet. Follow the{" "}
          <Link href="/roadmap/" className="link">
            public roadmap
          </Link>{" "}
          to see what is being built next.
        </p>
      </section>

      {related.length ? (
        <section className="mt-10 border-t border-[var(--border)] pt-6">
          <h2 className="mb-3 text-sm font-bold uppercase tracking-[0.08em] text-[var(--text-subtle)]">
            Other live categories
          </h2>
          <div className="flex flex-wrap gap-2">
            {related.map((item) => (
              <Link
                key={item.id}
                href={`/categories/${item.id}/`}
                className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm text-[var(--text-muted)] transition-colors hover:border-[var(--border-strong)] hover:text-[var(--text)]"
              >
                <CategoryIcon id={item.id} className="size-3.5" />
                {item.shortName}
                <ArrowRight className="size-3" aria-hidden />
              </Link>
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}
