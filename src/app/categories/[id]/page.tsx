import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, Clock } from "lucide-react";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { HeaderStat } from "@/components/page-header";
import { JsonLd } from "@/components/json-ld";
import { ToolCard, PlannedToolPill } from "@/components/tool-card";
import { CategoryIcon, CategoryTile, categoryTone } from "@/components/category-icon";
import { CategoryArt } from "@/components/category-art";
import { categories, getCategory } from "@/lib/tools/categories";
import { toolsByCategory } from "@/lib/tools/registry";
import { siteConfig } from "@/lib/site";
import { categoryKeywords, collectionSchema, mergeKeywords, pageMetadata } from "@/lib/seo";
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
  return pageMetadata({
    title: `${category.name} — Free Online Tools`,
    description: category.description,
    path: `/categories/${category.id}/`,
    keywords: mergeKeywords(
      [category.shortName, category.name, `${category.shortName} tools`],
      categoryKeywords[category.id],
    ),
    image: `/og/${category.id}.png`,
    imageAlt: `${category.name} — free online tools`,
  });
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
      ? collectionSchema({
          name: `${category.name} — free online tools`,
          description: category.description,
          path: `/categories/${category.id}/`,
          items: live.map((tool) => ({
            name: tool.name,
            url: `${siteConfig.url}/tools/${tool.slug}/`,
          })),
        })
      : null;

  return (
    <div className="mx-auto max-w-6xl px-4 pb-16 pt-8 sm:px-6">
      {itemList ? <JsonLd data={itemList} /> : null}
      <Breadcrumbs
        items={[
          { href: "/categories/", label: "Categories" },
          { href: `/categories/${category.id}/`, label: category.shortName },
        ]}
      />

      <header className={`pb-2 ${categoryTone(category.id)}`}>
        <div className="flex items-start justify-between gap-6">
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <CategoryTile id={category.id} size="lg" />
              <span className="chip">
                {live.length > 0 ? `${live.length} tools live` : "Planned — not yet published"}
              </span>
            </div>
            <h1 className="display mt-4 text-[clamp(2.1rem,4.8vw,3.5rem)] text-[var(--text)]">
              {category.name}
            </h1>
            <p className="lede mt-3">{category.tagline}.</p>
          </div>
          <CategoryArt
            id={category.id}
            className="hidden h-28 w-36 shrink-0 opacity-70 sm:block"
          />
        </div>
      </header>

      <div className="prose-tool mt-8 max-w-3xl">
        {category.intro.map((paragraph) => (
          <p key={paragraph.slice(0, 30)}>{paragraph}</p>
        ))}
      </div>

      {live.length > 0 ? (
        <section className="mt-10">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <h2 className="font-display text-[clamp(1.5rem,3vw,2.1rem)] font-bold tracking-[-0.035em] text-[var(--text)]">
              Every tool in this shelf
            </h2>
            <span className="chip">{live.length} tools</span>
          </div>
          <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {live.map((tool) => (
              <ToolCard key={tool.slug} tool={tool} />
            ))}
          </div>
        </section>
      ) : (
        <div className="mt-10 rounded-2xl border border-dashed border-[var(--border-strong)] bg-[var(--surface)] p-6">
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

      {category.plannedTools.length > 0 && (
      <section className="mt-12">
        <div className="flex items-baseline gap-3 border-b border-[var(--border)] pb-3">
          <Clock className="size-3.5 self-center text-[var(--text-subtle)]" aria-hidden />
          <h2 className="section-title text-[var(--text)]">Planned for this category</h2>
        </div>
        <ul className="mt-2 grid sm:grid-cols-2 lg:grid-cols-3 lg:gap-x-8">
          {category.plannedTools.map((name) => (
            <PlannedToolPill key={name} name={name} />
          ))}
        </ul>
        <p className="mt-3 text-xs text-[var(--text-subtle)]">
          Planned tools have no pages yet: most need a server-side check this static build cannot
          make, and none of them is simulated. The{" "}
          <Link href="/roadmap/" className="link">
            public roadmap
          </Link>{" "}
          explains each one.
        </p>
      </section>
      )}

      {related.length ? (
        <section className="mt-12 border-t border-[var(--border)] pt-6">
          <h2 className="eyebrow">Other shelves</h2>
          <div className="mt-3 flex flex-wrap gap-2">
            {related.map((item) => (
              <Link
                key={item.id}
                href={`/categories/${item.id}/`}
                className="inline-flex items-center gap-2 rounded-full border border-[var(--border)] bg-[var(--surface)] px-3.5 py-2 text-[0.8rem] text-[var(--text-muted)] transition-colors hover:border-[var(--border-strong)] hover:text-[var(--text)]"
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
