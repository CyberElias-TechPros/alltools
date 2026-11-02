import type { Metadata } from "next";
import Link from "next/link";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { HeaderStat, PageHeader } from "@/components/page-header";
import { categories } from "@/lib/tools/categories";
import { liveTools, toolCountByCategory, tools } from "@/lib/tools/registry";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Roadmap",
  description:
    "What is live on Toolora, what is being built, and what is planned. An honest, public status page instead of placeholder tools.",
  alternates: { canonical: "/roadmap/" },
};

const STAGES = [
  {
    title: "Foundation",
    status: "done" as const,
    detail: "Design system, navigation, search, tool template, SEO, accessibility baseline.",
  },
  {
    title: "The full blueprint catalogue",
    status: "done" as const,
    detail: "All twelve categories, 254 live tool pages, each with method, worked examples and FAQs.",
  },
  {
    title: "Client-side only",
    status: "done" as const,
    detail: "Every live tool computes in the browser: no uploads, no backend, no third-party APIs, no keys.",
  },
  {
    title: "Content and trust pages",
    status: "done" as const,
    detail: "About, contact, privacy, terms, disclaimer, cookies, accessibility and editorial policy.",
  },
  {
    title: "Test coverage and verification",
    status: "in-progress" as const,
    detail: "Unit tests for every calculation module, a render pass over every component, and a build-time catalogue validator. Manual device QA still outstanding.",
  },
  {
    title: "Launch and indexing",
    status: "next" as const,
    detail: "Custom domain, Search Console, sitemap submission, Core Web Vitals check.",
  },
  {
    title: "Monetisation review",
    status: "planned" as const,
    detail: "Consent management platform, ad placement review, AdSense readiness audit.",
  },
  {
    title: "Tools that need a server",
    status: "planned" as const,
    detail: "DNS, TLS, HTTP header, status and redirect checks, URL shortening and PDF encryption — they need networking or audited crypto this static build does not have.",
  },
];

const STATUS_LABEL: Record<string, string> = {
  done: "Shipped",
  "in-progress": "In progress",
  next: "Next",
  planned: "Planned",
};

export default function RoadmapPage() {
  const liveCategories = categories.filter((category) => category.status === "live");
  const plannedTools = tools.filter((tool) => tool.status === "planned");

  return (
    <div className="mx-auto max-w-6xl px-4 pb-16 pt-8 sm:px-6">
      <Breadcrumbs items={[{ href: "/roadmap/", label: "Roadmap" }]} />

      <PageHeader
        label="Status"
        title={
          <>
            Built in public,
            <br />
            published when true<span className="text-[var(--accent-text)]">.</span>
          </>
        }
        lede={`${liveTools.length} tools are live today. This page shows what has shipped and what is next, so nothing has to pretend to be finished. Planned tools have no pages and no fake functionality.`}
        meta={
          <div>
            <HeaderStat label="Live tools" value={String(liveTools.length)} />
            <HeaderStat label="Live categories" value={String(liveCategories.length)} />
            <HeaderStat label="Planned tools" value={String(plannedTools.length)} />
          </div>
        }
      />

      <ol className="mt-2 border-t border-[var(--border)]">
        {STAGES.map((stage, index) => {
          const done = stage.status === "done";
          const active = stage.status === "in-progress";
          return (
            <li
              key={stage.title}
              className={cn(
                "grid grid-cols-[2rem_1fr] items-start gap-4 border-b border-[var(--border)] py-5 sm:grid-cols-[2rem_2.5rem_1fr_8rem] sm:items-baseline sm:px-2",
                active && "bg-[var(--surface-muted)]",
              )}
            >
              <span className="font-mono text-[0.62rem] tracking-[0.1em] text-[var(--text-subtle)]">
                {String(index + 1).padStart(2, "0")}
              </span>
              <span
                className={cn(
                  "mt-1 hidden size-2.5 sm:block",
                  done ? "bg-[var(--text)]" : active ? "bg-[var(--ring)]" : "border border-[var(--border-strong)]",
                )}
                aria-hidden
              />
              <div className="col-start-2 sm:col-start-3">
                <p className="font-display text-[1.15rem] font-semibold leading-tight tracking-[-0.03em] text-[var(--text)]">
                  {stage.title}
                </p>
                <p className="mt-1 max-w-2xl text-[0.86rem] leading-relaxed text-[var(--text-muted)]">
                  {stage.detail}
                </p>
              </div>
              <span
                className={cn(
                  "col-start-2 mt-1 font-mono text-[0.6rem] uppercase tracking-[0.14em] sm:col-start-4 sm:mt-0",
                  done
                    ? "text-[var(--text)]"
                    : active
                      ? "text-[var(--accent-text)]"
                      : "text-[var(--text-subtle)]",
                )}
              >
                {STATUS_LABEL[stage.status]}
              </span>
            </li>
          );
        })}
      </ol>

      <div className="mt-14 grid gap-12 lg:grid-cols-2">
        <section>
          <div className="flex items-baseline justify-between border-b border-[var(--text)] pb-3">
            <h2 className="section-title text-[var(--text)]">Live by category</h2>
            <span className="font-mono text-[0.6rem] uppercase tracking-[0.14em] text-[var(--text-subtle)]">
              {liveTools.length} tools
            </span>
          </div>
          <ul className="mt-1">
            {liveCategories.map((category) => (
              <li key={category.id}>
                <Link
                  href={`/categories/${category.id}/`}
                  className="group flex items-center justify-between border-b border-[var(--border)] py-2.5"
                >
                  <span className="text-sm text-[var(--text)] transition-colors group-hover:text-[var(--accent-text)]">
                    {category.shortName}
                  </span>
                  <span className="font-mono text-[0.62rem] uppercase tracking-[0.12em] text-[var(--text-subtle)]">
                    {toolCountByCategory[category.id] ?? 0} live
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </section>

        <section>
          <div className="flex items-baseline justify-between border-b border-[var(--text)] pb-3">
            <h2 className="section-title text-[var(--text)]">Not built yet</h2>
            <span className="font-mono text-[0.6rem] uppercase tracking-[0.14em] text-[var(--text-subtle)]">
              {plannedTools.length} planned
            </span>
          </div>
          <p className="mt-3 max-w-md text-sm leading-relaxed text-[var(--text-muted)]">
            These are catalogued with their full editorial content but have no page and no route. Nine of them need to
            make an outbound request and read a cross-origin response — which a static site cannot do for an arbitrary
            host without a proxy server. The tenth needs audited PDF encryption. None of them is faked or simulated.
          </p>
          <ul className="mt-3">
            {plannedTools.map((tool) => (
              <li key={tool.slug} className="flex items-baseline justify-between gap-4 border-b border-[var(--border)] py-2.5">
                <span className="text-sm text-[var(--text)]">{tool.name}</span>
                <span className="shrink-0 font-mono text-[0.6rem] uppercase tracking-[0.12em] text-[var(--text-subtle)]">
                  {categories.find((category) => category.id === tool.category)?.shortName ?? tool.category}
                </span>
              </li>
            ))}
          </ul>
        </section>
      </div>

      <p className="mt-12 max-w-2xl border-l-2 border-[var(--ring)] pl-4 text-sm leading-relaxed text-[var(--text-muted)]">
        Have a tool you need?{" "}
        <Link href="/contact/" className="link">
          Request it
        </Link>{" "}
        — requests that solve a recurring, specific problem move to the top of the list. See also
        the{" "}
        <Link href="/tools/" className="link">
          full tool directory
        </Link>
        .
      </p>
    </div>
  );
}
