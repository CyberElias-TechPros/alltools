import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, BookOpen } from "lucide-react";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { guides } from "@/lib/guides";

export const metadata: Metadata = {
  title: "Guides",
  description:
    "Short, practical explanations of the maths and technology behind the tools: reading time, percentage change, encoding vs encryption and password strength.",
  alternates: { canonical: "/guides/" },
};

export default function GuidesPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
      <Breadcrumbs items={[{ href: "/guides/", label: "Guides" }]} />
      <h1 className="text-3xl font-bold tracking-[-0.03em] text-[var(--text)] sm:text-[2.2rem]">
        Guides
      </h1>
      <p className="mt-2 max-w-2xl text-[0.98rem] leading-relaxed text-[var(--text-muted)]">
        Each guide explains a concept that sits behind one or more tools. They are written to be
        useful on their own — no tool required to benefit from reading them.
      </p>

      <div className="mt-8 space-y-3">
        {guides.map((guide) => (
          <Link
            key={guide.slug}
            href={`/guides/${guide.slug}/`}
            className="group block rounded-xl border border-[var(--border)] bg-[var(--surface)] p-5 transition-all hover:-translate-y-0.5 hover:border-[var(--border-strong)] hover:shadow-[var(--shadow-soft)]"
          >
            <div className="flex items-center gap-2 text-[0.7rem] font-semibold uppercase tracking-[0.08em] text-[var(--text-subtle)]">
              <BookOpen className="size-3.5" aria-hidden />
              {guide.readingMinutes} min read · updated {guide.updated}
            </div>
            <h2 className="mt-2 text-lg font-semibold tracking-tight text-[var(--text)] group-hover:text-brand-600 dark:group-hover:text-brand-300">
              {guide.title}
            </h2>
            <p className="mt-1.5 text-sm leading-relaxed text-[var(--text-muted)]">
              {guide.description}
            </p>
            <span className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-brand-600 dark:text-brand-300">
              Read the guide
              <ArrowRight className="size-3" aria-hidden />
            </span>
          </Link>
        ))}
      </div>

      <p className="mt-8 rounded-xl border border-[var(--border)] bg-[var(--surface-muted)] p-4 text-sm leading-relaxed text-[var(--text-muted)]">
        Want a guide for a topic we have not covered?{" "}
        <Link href="/contact/" className="link">
          Tell us
        </Link>{" "}
        — most of these were written because someone asked the same question twice.
      </p>
    </div>
  );
}
