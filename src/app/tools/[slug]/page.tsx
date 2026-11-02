import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowRight,
  BookOpen,
  CheckCircle2,
  Info,
  Layers,
  ShieldCheck,
  Zap,
} from "lucide-react";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { JsonLd } from "@/components/json-ld";
import { ToolCard } from "@/components/tool-card";
import { AdSlot } from "@/components/ad-slot";
import { ToolRunner } from "@/tools/registry";
import { getCategory } from "@/lib/tools/categories";
import { liveTools, relatedTools, requireTool, tools } from "@/lib/tools/registry";
import { CategoryIcon, categoryTone } from "@/components/category-icon";
import { siteConfig } from "@/lib/site";

export function generateStaticParams() {
  return liveTools.map((tool) => ({ slug: tool.slug }));
}

export const dynamicParams = false;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const tool = tools.find((candidate) => candidate.slug === slug);
  if (!tool) return {};

  return {
    title: tool.seoTitle,
    description: tool.seoDescription,
    keywords: tool.keywords,
    alternates: { canonical: `/tools/${tool.slug}/` },
    openGraph: {
      type: "website",
      title: tool.seoTitle,
      description: tool.seoDescription,
      url: `${siteConfig.url}/tools/${tool.slug}/`,
    },
    twitter: {
      card: "summary_large_image",
      title: tool.seoTitle,
      description: tool.seoDescription,
    },
  };
}

export default async function ToolPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const tool = tools.find((candidate) => candidate.slug === slug);
  if (!tool || tool.status !== "live") notFound();

  const category = getCategory(tool.category);
  const related = relatedTools(tool.slug, 4);

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: `${siteConfig.url}/` },
      {
        "@type": "ListItem",
        position: 2,
        name: category.name,
        item: `${siteConfig.url}/categories/${category.id}/`,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: tool.name,
        item: `${siteConfig.url}/tools/${tool.slug}/`,
      },
    ],
  };

  const appSchema = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: tool.name,
    applicationCategory: "UtilitiesApplication",
    operatingSystem: "Any — runs in a web browser",
    url: `${siteConfig.url}/tools/${tool.slug}/`,
    description: tool.seoDescription,
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
    featureList: tool.content.howTo,
    isAccessibleForFree: true,
    publisher: { "@id": `${siteConfig.url}/#organization` },
  };

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: tool.content.faqs.map((faq) => ({
      "@type": "Question",
      name: faq.q,
      acceptedAnswer: { "@type": "Answer", text: faq.a },
    })),
  };

  return (
    <>
      <JsonLd data={[breadcrumbSchema, appSchema, faqSchema]} />
      <div className="mx-auto max-w-6xl px-4 pb-6 pt-6 sm:px-6">
        <Breadcrumbs
          items={[
            { href: "/tools/", label: "All tools" },
            { href: `/categories/${category.id}/`, label: category.shortName },
            { href: `/tools/${tool.slug}/`, label: tool.name },
          ]}
        />

        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_18rem]">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <Link
                href={`/categories/${category.id}/`}
                className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[0.72rem] font-semibold ${categoryTone(category.accent)}`}
              >
                <CategoryIcon id={category.id} className="size-3" />
                {category.name}
              </Link>
              <span className="chip">
                <Zap className="size-3" aria-hidden /> Instant
              </span>
              <span className="chip">
                <ShieldCheck className="size-3" aria-hidden /> Runs in your browser
              </span>
            </div>

            <h1 className="mt-3 text-3xl font-bold tracking-[-0.03em] text-[var(--text)] sm:text-[2.35rem] sm:leading-[1.1]">
              {tool.name}
            </h1>
            <p className="mt-2 max-w-2xl text-base leading-relaxed text-[var(--text-muted)] sm:text-[1.05rem]">
              {tool.tagline}
            </p>

            <div className="mt-6">
              <ToolRunner slug={tool.slug} />
            </div>

            <p className="mt-2.5 flex flex-wrap items-center gap-x-1.5 gap-y-1 text-[0.75rem] text-[var(--text-subtle)]">
              <Info className="size-3.5 shrink-0" aria-hidden />
              Nothing you type is uploaded or stored. Calculations run locally in this tab.
              <Link
                href={`/contact/?tool=${tool.slug}`}
                className="font-medium text-brand-600 hover:underline dark:text-brand-300"
              >
                Spotted a wrong result? Tell us.
              </Link>
            </p>

            <AdSlot placement="toolPage" />

            <div className="prose-tool mt-10">
              <h2 id="about">About this tool</h2>
              {tool.content.intro.map((paragraph) => (
                <p key={paragraph.slice(0, 24)}>{paragraph}</p>
              ))}

              <h2 id="how-to-use">How to use the {tool.name.toLowerCase()}</h2>
              <ol>
                {tool.content.howTo.map((step) => (
                  <li key={step.slice(0, 24)}>{step}</li>
                ))}
              </ol>

              {tool.content.method ? (
                <>
                  <h2 id="method">{tool.content.method.title ?? "How the result is calculated"}</h2>
                  {tool.content.method.paragraphs.map((paragraph) => (
                    <p key={paragraph.slice(0, 24)}>{paragraph}</p>
                  ))}
                  {tool.content.method.formula ? (
                    <pre className="my-4 overflow-x-auto rounded-xl border border-[var(--border)] bg-[var(--code-bg)] p-4 font-mono text-[0.82rem] leading-relaxed text-[var(--text)]">
                      <code>{tool.content.method.formula}</code>
                    </pre>
                  ) : null}
                </>
              ) : null}

              <h2 id="examples">Worked examples</h2>
              <div className="not-prose space-y-4">
                {tool.content.examples.map((example) => (
                  <div
                    key={example.title}
                    className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4"
                  >
                    <h3 className="text-[0.98rem] font-semibold text-[var(--text)]">
                      {example.title}
                    </h3>
                    <ol className="mt-2 ml-4 list-decimal space-y-1 text-sm text-[var(--text-muted)]">
                      {example.steps.map((step) => (
                        <li key={step.slice(0, 24)}>{step}</li>
                      ))}
                    </ol>
                    <p className="mt-2.5 flex items-start gap-1.5 rounded-lg bg-[var(--surface-muted)] px-3 py-2 font-mono text-[0.82rem] text-[var(--text)]">
                      <CheckCircle2
                        className="mt-0.5 size-3.5 shrink-0 text-emerald-600 dark:text-emerald-400"
                        aria-hidden
                      />
                      <span>{example.result}</span>
                    </p>
                  </div>
                ))}
              </div>

              <h2 id="limitations">Accuracy and limitations</h2>
              <ul>
                {tool.content.limitations.map((item) => (
                  <li key={item.slice(0, 24)}>{item}</li>
                ))}
              </ul>

              <h2 id="faq">Frequently asked questions</h2>
              <div className="not-prose divide-y divide-[var(--border)] overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--surface)]">
                {tool.content.faqs.map((faq) => (
                  <details key={faq.q} className="group px-4 py-3 [&_summary::-webkit-details-marker]:hidden">
                    <summary className="flex cursor-pointer list-none items-center justify-between gap-3 text-[0.92rem] font-semibold text-[var(--text)]">
                      {faq.q}
                      <span className="text-[var(--text-subtle)] transition-transform group-open:rotate-45">
                        +
                      </span>
                    </summary>
                    <p className="mt-2 text-sm leading-relaxed text-[var(--text-muted)]">{faq.a}</p>
                  </details>
                ))}
              </div>
            </div>
          </div>

          <aside className="lg:sticky lg:top-24 lg:self-start">
            <div className="card p-4">
              <h2 className="flex items-center gap-1.5 text-[0.72rem] font-bold uppercase tracking-[0.09em] text-[var(--text-subtle)]">
                <BookOpen className="size-3.5" aria-hidden /> On this page
              </h2>
              <nav aria-label="On this page" className="mt-2.5 flex flex-col gap-1 text-sm">
                {[
                  { id: "about", label: "About this tool" },
                  { id: "how-to-use", label: "How to use it" },
                  ...(tool.content.method ? [{ id: "method", label: "Calculation method" }] : []),
                  { id: "examples", label: "Worked examples" },
                  { id: "limitations", label: "Limitations" },
                  { id: "faq", label: "FAQ" },
                ].map((item) => (
                  <a
                    key={item.id}
                    href={`#${item.id}`}
                    className="rounded-md px-2 py-1.5 text-[var(--text-muted)] transition-colors hover:bg-[var(--surface-muted)] hover:text-[var(--text)]"
                  >
                    {item.label}
                  </a>
                ))}
              </nav>
            </div>

            <div className="card mt-4 p-4">
              <h2 className="flex items-center gap-1.5 text-[0.72rem] font-bold uppercase tracking-[0.09em] text-[var(--text-subtle)]">
                <Layers className="size-3.5" aria-hidden /> Related tools
              </h2>
              <ul className="mt-3 flex flex-col gap-2.5">
                {related.map((item) => (
                  <li key={item.slug}>
                    <Link
                      href={`/tools/${item.slug}/`}
                      className="group flex items-start justify-between gap-2 text-sm"
                    >
                      <span>
                        <span className="block font-medium text-[var(--text)] group-hover:text-brand-600 dark:group-hover:text-brand-300">
                          {item.name}
                        </span>
                        <span className="mt-0.5 block text-xs text-[var(--text-subtle)]">
                          {item.tagline}
                        </span>
                      </span>
                      <ArrowRight className="mt-1 size-3.5 shrink-0 text-[var(--text-subtle)]" aria-hidden />
                    </Link>
                  </li>
                ))}
              </ul>
              <Link
                href={`/categories/${category.id}/`}
                className="mt-4 inline-flex items-center gap-1 text-xs font-semibold text-brand-600 hover:underline dark:text-brand-300"
              >
                All {category.shortName.toLowerCase()} tools
                <ArrowRight className="size-3" aria-hidden />
              </Link>
            </div>
          </aside>
        </div>

        <section className="mt-14">
          <div className="mb-4 flex items-end justify-between gap-3">
            <h2 className="text-lg font-bold text-[var(--text)]">More {category.shortName.toLowerCase()} tools</h2>
            <Link
              href="/tools/"
              className="text-sm font-semibold text-brand-600 hover:underline dark:text-brand-300"
            >
              Browse all
            </Link>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {related.slice(0, 4).map((item) => (
              <ToolCard key={item.slug} tool={item} />
            ))}
          </div>
        </section>
      </div>
    </>
  );
}
