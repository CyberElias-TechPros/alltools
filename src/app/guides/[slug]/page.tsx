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
  return {
    title: guide.title,
    description: guide.description,
    alternates: { canonical: `/guides/${guide.slug}/` },
    openGraph: {
      type: "article",
      title: guide.title,
      description: guide.description,
      url: `${siteConfig.url}/guides/${guide.slug}/`,
    },
  };
}

export default async function GuidePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const guide = guideMap.get(slug);
  if (!guide) notFound();

  const tools = guide.toolSlugs.map((toolSlug) => getTool(toolSlug)).filter(Boolean);
  const more = guides.filter((item) => item.slug !== guide.slug).slice(0, 2);

  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: guide.title,
    description: guide.description,
    dateModified: "2025-11-02",
    author: { "@type": "Organization", name: siteConfig.name, url: siteConfig.url },
    publisher: { "@id": `${siteConfig.url}/#organization` },
    mainEntityOfPage: `${siteConfig.url}/guides/${guide.slug}/`,
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <JsonLd data={articleSchema} />
      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_18rem]">
        <article>
          <Breadcrumbs
            items={[
              { href: "/guides/", label: "Guides" },
              { href: `/guides/${guide.slug}/`, label: "Article" },
            ]}
          />
          <p className="text-[0.72rem] font-semibold uppercase tracking-[0.08em] text-[var(--text-subtle)]">
            {guide.readingMinutes} min read · updated {guide.updated}
          </p>
          <h1 className="mt-2 text-3xl font-bold tracking-[-0.03em] text-[var(--text)] sm:text-[2.3rem] sm:leading-[1.15]">
            {guide.title}
          </h1>
          <p className="mt-3 text-[1.02rem] leading-relaxed text-[var(--text-muted)]">
            {guide.intro}
          </p>

          <div className="prose-tool mt-7">
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

          <div className="mt-10 rounded-xl border border-[var(--border)] bg-[var(--surface-muted)] p-4">
            <h2 className="text-sm font-semibold text-[var(--text)]">Try the related tools</h2>
            <ul className="mt-2 flex flex-wrap gap-2">
              {tools.map((tool) =>
                tool ? (
                  <li key={tool.slug}>
                    <Link
                      href={`/tools/${tool.slug}/`}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-1.5 text-sm text-[var(--text-muted)] hover:border-[var(--border-strong)] hover:text-[var(--text)]"
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

        <aside className="lg:sticky lg:top-24 lg:self-start">
          <h2 className="text-[0.72rem] font-bold uppercase tracking-[0.09em] text-[var(--text-subtle)]">
            More guides
          </h2>
          <ul className="mt-3 space-y-3">
            {more.map((item) => (
              <li key={item.slug}>
                <Link
                  href={`/guides/${item.slug}/`}
                  className="block rounded-lg border border-[var(--border)] bg-[var(--surface)] p-3 text-sm hover:border-[var(--border-strong)]"
                >
                  <span className="font-medium text-[var(--text)]">{item.title}</span>
                  <span className="mt-1 block text-xs text-[var(--text-subtle)]">
                    {item.readingMinutes} min read
                  </span>
                </Link>
              </li>
            ))}
          </ul>

          <h2 className="mt-6 text-[0.72rem] font-bold uppercase tracking-[0.09em] text-[var(--text-subtle)]">
            Tools used here
          </h2>
          <div className="mt-3 grid gap-2">
            {tools.map((tool) => (tool ? <ToolCard key={tool.slug} tool={tool} compact /> : null))}
          </div>
        </aside>
      </div>
    </div>
  );
}
