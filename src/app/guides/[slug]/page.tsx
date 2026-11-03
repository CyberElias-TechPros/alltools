import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { JsonLd } from "@/components/json-ld";
import { ToolCard } from "@/components/tool-card";
import { guideMap, guides } from "@/lib/guides";
import { getTool } from "@/lib/tools/registry";
import { siteConfig } from "@/lib/site";
import { articleSchema as articleSchemaHelper, pageMetadata } from "@/lib/seo";

export function generateStaticParams() {
  return guides.map((guide) => ({ slug: guide.slug }));
}

export const dynamicParams = false;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const guide = guideMap.get(slug);
  if (!guide) return {};
  return pageMetadata({
    title: guide.title,
    description: guide.description,
    path: `/guides/${guide.slug}/`,
    keywords: [guide.title, ...guide.toolSlugs, "guide", "explained"],
    type: "article",
    modifiedTime: guide.updated,
  });
}

export default async function GuidePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const guide = guideMap.get(slug);
  if (!guide) notFound();

  const tools = guide.toolSlugs.map((toolSlug) => getTool(toolSlug)).filter(Boolean);
  const more = guides.filter((item) => item.slug !== guide.slug).slice(0, 2);

  const published = new Date(guide.updated);
  const articleSchema = {
    ...articleSchemaHelper({
      headline: guide.title,
      description: guide.description,
      path: `/guides/${guide.slug}/`,
      datePublished: (Number.isNaN(published.getTime()) ? new Date("2025-11-02") : published).toISOString(),
      dateModified: (Number.isNaN(published.getTime()) ? new Date("2025-11-02") : published).toISOString(),
    }),
    breadcrumb: {
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: `${siteConfig.url}/` },
        { "@type": "ListItem", position: 2, name: "Guides", item: `${siteConfig.url}/guides/` },
        {
          "@type": "ListItem",
          position: 3,
          name: guide.title,
          item: `${siteConfig.url}/guides/${guide.slug}/`,
        },
      ],
    },
  };

  return (
    <div className="mx-auto max-w-6xl px-4 pb-16 pt-8 sm:px-6">
      <JsonLd data={articleSchema} />
      <div className="grid gap-12 lg:grid-cols-[minmax(0,1fr)_17rem]">
        <article>
          <Breadcrumbs
            items={[
              { href: "/guides/", label: "Guides" },
              { href: `/guides/${guide.slug}/`, label: "Article" },
            ]}
          />
          <div className="border-b border-[var(--border)] pb-6">
            <p className="eyebrow">
              Guide · {guide.readingMinutes} min read · updated {guide.updated}
            </p>
            <h1 className="display mt-3 text-[clamp(2rem,4.6vw,3.4rem)] text-[var(--text)]">
              {guide.title}
            </h1>
            <p className="mt-4 max-w-2xl text-[1.05rem] leading-relaxed text-[var(--text-muted)]">
              {guide.intro}
            </p>
          </div>

          <div className="prose-tool mt-8">
            {guide.sections.map((section) => (
              <section key={section.heading}>
                <h2>{section.heading}</h2>
                {section.paragraphs.map((paragraph) => (
                  <p key={paragraph.slice(0, 30)}>{paragraph}</p>
                ))}
                {section.list ? (
                  <ul>
                    {section.list.map((item) => (
                      <li key={item.slice(0, 30)}>{item}</li>
                    ))}
                  </ul>
                ) : null}
              </section>
            ))}
          </div>

          <div className="mt-12 border border-[var(--border)] bg-[var(--surface)]">
            <div className="panel-head">
              <span>Try the related tools</span>
              <span>Free · local</span>
            </div>
            <ul className="flex flex-wrap gap-2 p-4">
              {tools.map((tool) =>
                tool ? (
                  <li key={tool.slug}>
                    <Link
                      href={`/tools/${tool.slug}/`}
                      className="inline-flex items-center gap-1.5 rounded-full border border-[var(--border)] bg-[var(--surface)] px-3.5 py-2 text-[0.8rem] text-[var(--text-muted)] transition-colors hover:border-[var(--border-strong)] hover:text-[var(--text)]"
                    >
                      {tool.name}
                      <ArrowRight className="size-3" aria-hidden />
                    </Link>
                  </li>
                ) : null,
              )}
            </ul>
          </div>
        </article>

        <aside className="lg:sticky lg:top-28 lg:self-start">
          <h2 className="eyebrow border-b border-[var(--border)] py-3">More guides</h2>
          <ul>
            {more.map((item) => (
              <li key={item.slug}>
                <Link
                  href={`/guides/${item.slug}/`}
                  className="group block border-b border-[var(--border)] py-3"
                >
                  <span className="font-display text-[0.98rem] font-semibold leading-tight tracking-[-0.02em] text-[var(--text)] transition-colors group-hover:text-[var(--accent-text)]">
                    {item.title}
                  </span>
                  <span className="mt-1 block font-mono text-[0.58rem] uppercase tracking-[0.14em] text-[var(--text-subtle)]">
                    {item.readingMinutes} min read
                  </span>
                </Link>
              </li>
            ))}
          </ul>

          <h2 className="eyebrow mt-8 border-b border-[var(--border)] py-3">Tools used here</h2>
          <div className="mt-3 grid gap-2">
            {tools.map((tool) => (tool ? <ToolCard key={tool.slug} tool={tool} compact /> : null))}
          </div>
        </aside>
      </div>
    </div>
  );
}
