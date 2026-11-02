import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { HeaderStat, PageHeader } from "@/components/page-header";
import { guides } from "@/lib/guides";
import { siteConfig } from "@/lib/site";
import { JsonLd } from "@/components/json-ld";
import { collectionSchema } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Guides",
  description: "Short, practical explanations of the maths and technology behind the tools: reading time, percentage change, encoding vs encryption and password strength.",
  path: "/guides/",
  keywords: ['guides', 'explanations', 'how it works', 'reference'],
});

export default function GuidesPage() {
  const schema = collectionSchema({
    name: "Guides — how the tools work",
    description: "Short, practical explanations of the maths and technology behind the tools.",
    path: "/guides/",
    items: guides.map((guide) => ({
      name: guide.title,
      url: `${siteConfig.url}/guides/${guide.slug}/`,
    })),
  });

  return (
    <div className="mx-auto max-w-6xl px-4 pb-16 pt-8 sm:px-6">
      <JsonLd data={schema} />
      <Breadcrumbs items={[{ href: "/guides/", label: "Guides" }]} />

      <PageHeader
        label="Reading room"
        title={
          <>
            The reasoning,
            <br />
            written down<span className="text-[var(--accent-text)]">.</span>
          </>
        }
        lede="Each guide explains a concept that sits behind one or more tools. They are written to be useful on their own — no tool required to benefit from reading them."
        meta={
          <div>
            <HeaderStat label="Guides" value={String(guides.length)} />
            <HeaderStat
              label="Reading time"
              value={`${guides.reduce((total, guide) => total + guide.readingMinutes, 0)} min total`}
            />
            <HeaderStat label="Paywall" value="None" />
          </div>
        }
      />

      <div className="mt-2 border-t border-[var(--border)]">
        {guides.map((guide, index) => (
          <Link
            key={guide.slug}
            href={`/guides/${guide.slug}/`}
            className="group grid gap-x-6 gap-y-2 border-b border-[var(--border)] py-7 transition-colors hover:bg-[var(--surface-muted)] sm:grid-cols-[3rem_1fr] sm:px-2 lg:grid-cols-[3rem_1fr_9rem]"
          >
            <span className="font-mono text-[0.62rem] tracking-[0.1em] text-[var(--text-subtle)]">
              {String(index + 1).padStart(2, "0")}
            </span>
            <span className="min-w-0">
              <h2 className="font-display text-[1.35rem] font-semibold leading-tight tracking-[-0.03em] text-[var(--text)] transition-colors group-hover:text-[var(--accent-text)]">
                {guide.title}
              </h2>
              <p className="mt-2 max-w-2xl text-[0.9rem] leading-relaxed text-[var(--text-muted)]">
                {guide.description}
              </p>
            </span>
            <span className="flex items-center justify-between gap-3 sm:col-start-2 lg:col-start-3 lg:flex-col lg:items-end lg:justify-start">
              <span className="font-mono text-[0.6rem] uppercase tracking-[0.14em] text-[var(--text-subtle)]">
                {guide.readingMinutes} min · {guide.updated}
              </span>
              <ArrowUpRight
                className="size-4 text-[var(--text-subtle)] transition-all group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-[var(--accent-text)] lg:mt-3"
                aria-hidden
              />
            </span>
          </Link>
        ))}
      </div>

      <p className="mt-8 max-w-2xl border-l-2 border-[var(--ring)] pl-4 text-sm leading-relaxed text-[var(--text-muted)]">
        Want a guide for a topic we have not covered?{" "}
        <Link href="/contact/" className="link">
          Tell us
        </Link>{" "}
        — most of these were written because someone asked the same question twice.
      </p>
    </div>
  );
}
