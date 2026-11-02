import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, ArrowUpRight, CheckCircle2, Info } from "lucide-react";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { JsonLd } from "@/components/json-ld";
import { AdSlot } from "@/components/ad-slot";
import { ToolRunner } from "@/tools/registry";
import { getCategory } from "@/lib/tools/categories";
import { liveTools, relatedTools, tools } from "@/lib/tools/registry";
import { CategoryIcon } from "@/components/category-icon";
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

      <div className="mx-auto max-w-6xl px-4 pb-16 pt-8 sm:px-6">
        <Breadcrumbs
          items={[
            { href: "/tools/", label: "All tools" },
            { href: `/categories/${category.id}/`, label: category.shortName },
            { href: `/tools/${tool.slug}/`, label: tool.name },
          ]}
        />

        <div className="grid gap-12 lg:grid-cols-[minmax(0,1fr)_17rem]">
          <div className="min-w-0">
            <header>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
                <Link
                  href={`/categories/${category.id}/`}
                  className="inline-flex items-center gap-1.5 font-mono text-[0.62rem] uppercase tracking-[0.14em] text-[var(--accent-text)] transition-opacity hover:opacity-70"
                >
                  <CategoryIcon id={category.id} className="size-3.5" />
                  {category.name}
                </Link>
                <span className="tag">
                  <span className="size-[5px] bg-[var(--text-subtle)]" aria-hidden /> Instant result
                </span>
                <span className="tag">
                  <span className="size-[5px] bg-[var(--text-subtle)]" aria-hidden /> Runs in your
                  browser
                </span>
              </div>

              <h1 className="display mt-4 text-[clamp(2.2rem,5vw,3.6rem)] text-[var(--text)]">
                {tool.name}
              </h1>
              <p className="mt-3 max-w-2xl text-[1.06rem] leading-relaxed text-[var(--text-muted)]">
                {tool.tagline}
              </p>
            </header>

            {/* Tool console */}
            <div className="mt-8 border border-[var(--border-strong)] bg-[var(--surface)]">
              <div className="panel-head">
                <span className="flex items-center gap-2">
                  <span className="size-[6px] bg-[var(--ring)]" aria-hidden />
                  Live tool
                </span>
                <span className="hidden sm:inline">Local only · no upload</span>
              </div>
              <div className="p-4 sm:p-5">
                <ToolRunner slug={tool.slug} />
              </div>
            </div>

            <p className="mt-3 flex flex-wrap items-center gap-x-2 gap-y-1 font-mono text-[0.6rem] uppercase tracking-[0.12em] text-[var(--text-subtle)]">
              <Info className="size-3.5 shrink-0" aria-hidden />
              Nothing you type is uploaded or stored ·{" "}
              <Link
                href={`/contact/?tool=${tool.slug}`}
                className="text-[var(--accent-text)] transition-opacity hover:opacity-70"
              >
                Spotted a wrong result? Tell us
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
                    <pre className="my-4 overflow-x-auto border border-[var(--border)] bg-[var(--code-bg)] p-4 font-mono text-[0.82rem] leading-relaxed text-[var(--text)]">
                      <code>{tool.content.method.formula}</code>
                    </pre>
                  ) : null}
                </>
              ) : null}

              <h2 id="examples">Worked examples</h2>
              <div className="not-prose mt-4 space-y-px bg-[var(--border)]">
                {tool.content.examples.map((example) => (
                  <div key={example.title} className="bg-[var(--surface)] p-4 sm:p-5">
                    <h3 className="font-display text-[1.02rem] font-semibold tracking-[-0.02em] text-[var(--text)]">
                      {example.title}
                    </h3>
                    <ol className="mt-2 ml-4 list-decimal space-y-1 text-sm text-[var(--text-muted)]">
                      {example.steps.map((step) => (
                        <li key={step.slice(0, 24)}>{step}</li>
                      ))}
                    </ol>
                    <p className="mt-3 flex items-start gap-2 border-l-2 border-[var(--ring)] bg-[var(--surface-muted)] px-3 py-2 font-mono text-[0.78rem] text-[var(--text)]">
                      <CheckCircle2
                        className="mt-0.5 size-3.5 shrink-0 text-[var(--accent-text)]"
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
              <div className="not-prose mt-4 border-t border-[var(--border)]">
                {tool.content.faqs.map((faq) => (
                  <details key={faq.q} className="group border-b border-[var(--border)]">
                    <summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-3.5 [&::-webkit-details-marker]:hidden">
                      <span className="font-display text-[1rem] font-semibold tracking-[-0.02em] text-[var(--text)]">
                        {faq.q}
                      </span>
                      <span
                        className="font-mono text-base leading-none text-[var(--text-subtle)] transition-transform group-open:rotate-45"
                        aria-hidden
                      >
                        +
                      </span>
                    </summary>
                    <p className="max-w-2xl pb-4 text-sm leading-relaxed text-[var(--text-muted)]">
                      {faq.a}
                    </p>
                  </details>
                ))}
              </div>
            </div>
          </div>

          <aside className="lg:sticky lg:top-28 lg:self-start">
            <div className="border-t border-[var(--text)]">
              <h2 className="eyebrow py-3">On this page</h2>
              <nav aria-label="On this page" className="flex flex-col">
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
                    className="border-b border-[var(--border)] py-2 text-sm text-[var(--text-muted)] transition-colors hover:text-[var(--accent-text)]"
                  >
                    {item.label}
                  </a>
                ))}
              </nav>
            </div>

            <div className="mt-8">
              <h2 className="eyebrow border-b border-[var(--text)] py-3">Related tools</h2>
              <ul>
                {related.map((item) => (
                  <li key={item.slug}>
                    <Link
                      href={`/tools/${item.slug}/`}
                      className="group flex items-baseline justify-between gap-3 border-b border-[var(--border)] py-2.5"
                    >
                      <span className="min-w-0">
                        <span className="block font-display text-[0.95rem] font-semibold leading-tight tracking-[-0.02em] text-[var(--text)] transition-colors group-hover:text-[var(--accent-text)]">
                          {item.name}
                        </span>
                      </span>
                      <ArrowUpRight
                        className="size-3.5 shrink-0 text-[var(--text-subtle)] transition-all group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-[var(--accent-text)]"
                        aria-hidden
                      />
                    </Link>
                  </li>
                ))}
              </ul>
              <Link
                href={`/categories/${category.id}/`}
                className="mt-4 inline-flex items-center gap-1.5 font-mono text-[0.6rem] uppercase tracking-[0.14em] text-[var(--text)] transition-colors hover:text-[var(--accent-text)]"
              >
                All {category.shortName.toLowerCase()} tools
                <ArrowRight className="size-3" aria-hidden />
              </Link>
            </div>
          </aside>
        </div>

        <section className="mt-16 border-t border-[var(--text)] pt-6">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <h2 className="section-title text-[var(--text)]">
              More {category.shortName.toLowerCase()} tools
            </h2>
            <Link
              href="/tools/"
              className="inline-flex items-center gap-1.5 font-mono text-[0.62rem] uppercase tracking-[0.14em] text-[var(--text)] transition-colors hover:text-[var(--accent-text)]"
            >
              Browse all
              <ArrowRight className="size-3.5" aria-hidden />
            </Link>
          </div>
          <ol className="mt-4">
            {related.slice(0, 4).map((item, index) => (
              <li key={item.slug}>
                <Link
                  href={`/tools/${item.slug}/`}
                  className="index-row grid-cols-[1.75rem_1fr_auto] sm:grid-cols-[2.25rem_1fr_9rem_auto]"
                >
                  <span className="index-row-num">{String(index + 1).padStart(2, "0")}</span>
                  <span className="min-w-0">
                    <span className="index-row-title block">{item.name}</span>
                    <span className="index-row-desc mt-1 block truncate text-[0.84rem]">
                      {item.tagline}
                    </span>
                  </span>
                  <span className="index-row-meta hidden sm:block">
                    {getCategory(item.category).shortName}
                  </span>
                  <ArrowUpRight className="index-row-arrow size-4" aria-hidden />
                </Link>
              </li>
            ))}
          </ol>
        </section>
      </div>
    </>
  );
}
