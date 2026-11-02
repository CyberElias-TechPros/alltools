import type { Metadata } from "next";
import Link from "next/link";
import { Check, Circle, Clock, Loader } from "lucide-react";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { categories } from "@/lib/tools/categories";
import { liveTools, toolCountByCategory } from "@/lib/tools/registry";
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
    title: "First 40 tools",
    status: "done" as const,
    detail: "Text, calculators, finance, developer, everyday converters, SEO and security utilities.",
  },
  {
    title: "Content and trust pages",
    status: "done" as const,
    detail: "About, contact, privacy, terms, disclaimer, cookies, accessibility and editorial policy.",
  },
  {
    title: "Test coverage and verification",
    status: "in-progress" as const,
    detail: "Unit tests for every calculation module, plus a build-time catalogue validator.",
  },
  {
    title: "Launch and indexing",
    status: "next" as const,
    detail: "Custom domain, Search Console, sitemap submission, Core Web Vitals check.",
  },
  {
    title: "Image and PDF tools",
    status: "planned" as const,
    detail: "On-device image compression and PDF merge/split, with explicit file-handling disclosures.",
  },
  {
    title: "Monetisation review",
    status: "planned" as const,
    detail: "Consent management platform, ad placement review, AdSense readiness audit.",
  },
  {
    title: "Expansion",
    status: "planned" as const,
    detail: "Education, internet and business utilities — added only when each one is finished.",
  },
];

export default function RoadmapPage() {
  const nextUp = categories.filter((category) => category.status === "planned");

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
      <Breadcrumbs items={[{ href: "/roadmap/", label: "Roadmap" }]} />
      <h1 className="text-3xl font-bold tracking-[-0.03em] text-[var(--text)] sm:text-[2.2rem]">
        Roadmap
      </h1>
      <p className="mt-2 max-w-2xl text-[0.98rem] leading-relaxed text-[var(--text-muted)]">
        {liveTools.length} tools are live today. This page shows what has shipped and what is next,
        so nothing has to pretend to be finished. Planned tools have no pages and no fake
        functionality.
      </p>

      <ol className="mt-8 space-y-2">
        {STAGES.map((stage) => {
          const Icon =
            stage.status === "done"
              ? Check
              : stage.status === "in-progress"
                ? Loader
                : stage.status === "next"
                  ? Clock
                  : Circle;
          return (
            <li
              key={stage.title}
              className={cn(
                "flex items-start gap-3 rounded-xl border p-4",
                stage.status === "done"
                  ? "border-emerald-300/60 bg-emerald-50/60 dark:border-emerald-500/25 dark:bg-emerald-500/5"
                  : stage.status === "in-progress"
                    ? "border-brand-300 bg-brand-50/60 dark:border-brand-500/30 dark:bg-brand-500/10"
                    : "border-[var(--border)] bg-[var(--surface)]",
              )}
            >
              <span
                className={cn(
                  "mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full",
                  stage.status === "done"
                    ? "bg-emerald-600 text-white"
                    : stage.status === "in-progress"
                      ? "bg-brand-600 text-white"
                      : "bg-[var(--surface-muted)] text-[var(--text-subtle)]",
                )}
              >
                <Icon className="size-3.5" aria-hidden />
              </span>
              <div>
                <p className="flex flex-wrap items-center gap-2 text-[0.95rem] font-semibold text-[var(--text)]">
                  {stage.title}
                  <span className="chip !text-[0.62rem]">
                    {stage.status === "done"
                      ? "done"
                      : stage.status === "in-progress"
                        ? "in progress"
                        : stage.status === "next"
                          ? "next"
                          : "planned"}
                  </span>
                </p>
                <p className="mt-0.5 text-sm leading-relaxed text-[var(--text-muted)]">
                  {stage.detail}
                </p>
              </div>
            </li>
          );
        })}
      </ol>

      <h2 className="mt-10 text-lg font-bold text-[var(--text)]">Live tools by category</h2>
      <div className="mt-3 grid gap-2 sm:grid-cols-2">
        {categories
          .filter((category) => (toolCountByCategory[category.id] ?? 0) > 0)
          .map((category) => (
            <div
              key={category.id}
              className="flex items-center justify-between rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm"
            >
              <span className="text-[var(--text)]">{category.shortName}</span>
              <span className="font-mono text-xs text-[var(--text-subtle)]">
                {toolCountByCategory[category.id]} live
              </span>
            </div>
          ))}
      </div>

      <h2 className="mt-10 text-lg font-bold text-[var(--text)]">Next categories</h2>
      <p className="mt-1 text-sm text-[var(--text-muted)]">
        These open only when their first tools are complete and tested.
      </p>
      <div className="mt-3 space-y-3">
        {nextUp.map((category) => (
          <div key={category.id} className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h3 className="text-sm font-semibold text-[var(--text)]">{category.name}</h3>
              <span className="chip !text-[0.62rem]">planned</span>
            </div>
            <p className="mt-1 text-sm text-[var(--text-muted)]">{category.tagline}</p>
            <p className="mt-2 text-xs text-[var(--text-subtle)]">
              {category.plannedTools.slice(0, 4).join(" · ")}
            </p>
          </div>
        ))}
      </div>

      <div className="mt-10 rounded-xl border border-[var(--border)] bg-[var(--surface-muted)] p-4 text-sm leading-relaxed text-[var(--text-muted)]">
        Have a tool you need?{" "}
        <Link href="/contact/" className="link">
          Request it
        </Link>{" "}
        — requests that solve a recurring, specific problem move to the top of the list. See also the{" "}
        <Link href="/tools/" className="link">
          full tool directory
        </Link>
        .
      </div>
    </div>
  );
}
