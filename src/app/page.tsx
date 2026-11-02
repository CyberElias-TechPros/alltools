import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, ArrowUpRight, Lock, Zap, MousePointerClick } from "lucide-react";
import { HeroSearch } from "@/components/hero-search";
import { ToolCard } from "@/components/tool-card";
import { CategoryIcon } from "@/components/category-icon";
import { JsonLd } from "@/components/json-ld";
import { categories } from "@/lib/tools/categories";
import { liveTools, popularTools, recentlyAdded, toolCountByCategory } from "@/lib/tools/registry";
import { siteConfig } from "@/lib/site";

export const metadata: Metadata = {
  title: `${siteConfig.name} — Free Online Tools for Everyday Work`,
  description:
    `${liveTools.length} free online tools that run in your browser: word counter, percentage calculator, JSON formatter, unit converter, password generator and more. No sign-up, no uploads.`,
  alternates: { canonical: "/" },
};

const SITE_FAQS = [
  {
    q: "Are the tools really free?",
    a: "Yes. Every tool on Toolora is free to use, with no account, no trial and no usage limit. The site is designed to be funded by advertising once it qualifies, which is why there is no paywall on the tools themselves.",
  },
  {
    q: "Is my data uploaded to a server?",
    a: "No. Text, numbers and files are processed by JavaScript running in your own browser. There is no upload endpoint for tool input, so the content you paste never leaves your device.",
  },
  {
    q: "Do I need to install anything?",
    a: "No. Toolora works in any modern browser on desktop or mobile. There is nothing to install and no extension to grant permissions to.",
  },
  {
    q: "Can I use the results in my own work?",
    a: "Yes — results are yours to use. Check our terms for the small print, and verify anything important: these tools are helpers, not professional advice.",
  },
  {
    q: "How do you decide which tools to build next?",
    a: "We prioritise tools that are genuinely useful, can run entirely in the browser and have a real audience. The public roadmap shows what is live, what is in progress and what is planned.",
  },
];

const PRINCIPLES = [
  {
    icon: Lock,
    title: "Your input stays on your device",
    body: "Calculations, formatting and conversions run in JavaScript in your browser. There is no upload endpoint and no storage of your text.",
  },
  {
    icon: Zap,
    title: "No waiting, no loading spinners",
    body: "Because there is no server round trip, results are effectively instant — and the tools keep working if your connection drops.",
  },
  {
    icon: MousePointerClick,
    title: "One job per page, clearly explained",
    body: "Each page states its formula or method, gives worked examples and admits its limitations. No fake features, no placeholder pages.",
  },
];

const GUIDES = [
  {
    href: "/guides/how-reading-time-is-calculated/",
    title: "How reading time is calculated",
    body: "Why 200–250 words per minute is the standard, and when to adjust it.",
  },
  {
    href: "/guides/percentage-change-vs-percentage-points/",
    title: "Percentage change vs percentage points",
    body: "The distinction that makes headlines misleading, explained with examples.",
  },
  {
    href: "/guides/encoding-vs-encryption/",
    title: "Base64 is not encryption",
    body: "What encoding actually does, and why hashing is different again.",
  },
];

export default function HomePage() {
  const liveCategories = categories.filter((category) => category.status === "live");
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: SITE_FAQS.map((faq) => ({
      "@type": "Question",
      name: faq.q,
      acceptedAnswer: { "@type": "Answer", text: faq.a },
    })),
  };

  return (
    <>
      <JsonLd data={faqSchema} />

      {/* ── Hero ─────────────────────────────────────────────── */}
      <section className="border-b border-[var(--border)]">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="grid gap-10 pb-12 pt-12 sm:pt-16 lg:grid-cols-12 lg:gap-0">
            <div className="lg:col-span-8 lg:pr-12">
              <div className="flex flex-wrap items-center gap-3">
                <span className="eyebrow">{liveTools.length} tools live</span>
                <span className="h-3 w-px bg-[var(--border-strong)]" aria-hidden />
                <span className="eyebrow">{liveCategories.length} categories</span>
                <span className="h-3 w-px bg-[var(--border-strong)]" aria-hidden />
                <span className="eyebrow">0 uploads</span>
              </div>

              <h1 className="display mt-6 text-[clamp(2.6rem,6.4vw,5.1rem)] text-[var(--text)]">
                Tools that never
                <br />
                leave your
                <br />
                <span className="relative inline-block">
                  browser
                  <span
                    className="absolute inset-x-0 -bottom-[0.04em] h-[0.08em] bg-[var(--ring)]"
                    aria-hidden
                  />
                </span>
                <span className="text-[var(--accent-text)]">.</span>
              </h1>

              <p className="lede mt-6">
                Count words, check percentages, format JSON, convert units or generate a
                password. Instant results, no sign-up, and nothing you paste ever leaves your
                device.
              </p>

              <div className="mt-8 max-w-xl">
                <HeroSearch count={liveTools.length} />
              </div>

              <ul className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-2 font-mono text-[0.62rem] uppercase tracking-[0.14em] text-[var(--text-subtle)]">
                {["100% free", "Processed locally", "No page reloads", "Works offline"].map(
                  (item) => (
                    <li key={item} className="flex items-center gap-2">
                      <span className="size-[5px] bg-[var(--ring)]" aria-hidden />
                      {item}
                    </li>
                  ),
                )}
              </ul>
            </div>

            {/* Instrument panel */}
            <aside className="hidden border-l border-[var(--border)] pl-8 lg:col-span-4 lg:block">
              <p className="eyebrow">The library</p>
              <p className="outline-numeral mt-2 text-[9rem]">{liveTools.length}</p>
              <p className="mt-3 text-sm leading-relaxed text-[var(--text-muted)]">
                tested utilities across {liveCategories.length} live categories — built one at a
                time, published only when the maths holds.
              </p>

              <dl className="mt-8 border-t border-[var(--border)]">
                {[
                  { label: "Uploads", value: "0" },
                  { label: "Accounts", value: "0" },
                  { label: "Servers involved", value: "0" },
                ].map((row) => (
                  <div
                    key={row.label}
                    className="flex items-baseline justify-between border-b border-[var(--border)] py-2.5"
                  >
                    <dt className="font-mono text-[0.62rem] uppercase tracking-[0.14em] text-[var(--text-subtle)]">
                      {row.label}
                    </dt>
                    <dd className="font-display text-lg font-bold tracking-[-0.03em] text-[var(--text)]">
                      {row.value}
                    </dd>
                  </div>
                ))}
              </dl>

              <Link
                href="/tools/"
                className="mt-6 inline-flex items-center gap-1.5 font-mono text-[0.66rem] uppercase tracking-[0.14em] text-[var(--text)] transition-colors hover:text-[var(--accent-text)]"
              >
                Open the index
                <ArrowUpRight className="size-3.5" aria-hidden />
              </Link>
            </aside>
          </div>
        </div>
      </section>

      {/* ── 01 · Selected tools ──────────────────────────────── */}
      <section className="border-b border-[var(--border)]">
        <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
          <div className="flex flex-wrap items-end justify-between gap-4 border-b border-[var(--text)] pb-4">
            <div>
              <p className="eyebrow">01 — Index</p>
              <h2 className="section-title mt-2 text-[var(--text)]">Most used tools</h2>
            </div>
            <Link
              href="/tools/"
              className="inline-flex items-center gap-1.5 font-mono text-[0.66rem] uppercase tracking-[0.14em] text-[var(--text)] transition-colors hover:text-[var(--accent-text)]"
            >
              All {liveTools.length} tools
              <ArrowRight className="size-3.5" aria-hidden />
            </Link>
          </div>

          <ol className="mt-0">
            {popularTools.map((tool, index) => (
              <ToolCard key={tool.slug} tool={tool} variant="row" index={index + 1} />
            ))}
          </ol>
        </div>
      </section>

      {/* ── 02 · Categories ──────────────────────────────────── */}
      <section className="border-b border-[var(--border)] bg-[var(--page-elevated)]">
        <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
          <div className="flex flex-wrap items-end justify-between gap-4 border-b border-[var(--text)] pb-4">
            <div>
              <p className="eyebrow">02 — Categories</p>
              <h2 className="section-title mt-2 text-[var(--text)]">Browse the shelf</h2>
            </div>
            <Link
              href="/categories/"
              className="inline-flex items-center gap-1.5 font-mono text-[0.66rem] uppercase tracking-[0.14em] text-[var(--text)] transition-colors hover:text-[var(--accent-text)]"
            >
              All categories
              <ArrowRight className="size-3.5" aria-hidden />
            </Link>
          </div>

          <div className="mt-0 grid sm:grid-cols-2 sm:gap-x-10">
            {categories.map((category, index) => {
              const count = toolCountByCategory[category.id] ?? 0;
              const planned = count === 0;
              return (
                <Link
                  key={category.id}
                  href={`/categories/${category.id}/`}
                  className="group flex items-baseline gap-4 border-b border-[var(--border)] py-4 transition-colors hover:border-[var(--text)]"
                >
                  <span className="font-mono text-[0.62rem] tracking-[0.1em] text-[var(--text-subtle)]">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <span
                    className={`shrink-0 ${planned ? "text-[var(--text-subtle)]" : "text-[var(--text)]"}`}
                  >
                    <CategoryIcon id={category.id} className="size-[1.05rem]" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span
                      className={`block font-display text-[1.06rem] font-semibold leading-tight tracking-[-0.025em] ${
                        planned ? "text-[var(--text-subtle)]" : "text-[var(--text)]"
                      }`}
                    >
                      {category.shortName}
                    </span>
                    <span className="mt-0.5 block truncate text-[0.82rem] text-[var(--text-muted)]">
                      {category.tagline}
                    </span>
                  </span>
                  <span
                    className={`shrink-0 font-mono text-[0.62rem] uppercase tracking-[0.12em] ${
                      planned ? "text-[var(--text-subtle)]" : "text-[var(--accent-text)]"
                    }`}
                  >
                    {planned ? "Planned" : `${count} live`}
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── 03 · Standard ────────────────────────────────────── */}
      <section className="border-b border-[var(--border)]">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
          <div className="grid gap-10 lg:grid-cols-12 lg:gap-12">
            <div className="lg:col-span-5">
              <p className="eyebrow">03 — Standard</p>
              <h2 className="section-title mt-3 max-w-sm text-[var(--text)]">
                Built like an instrument, not a content farm.
              </h2>
              <p className="mt-4 max-w-md text-[0.95rem] leading-relaxed text-[var(--text-muted)]">
                Most utility sites ask you to upload a file, create an account or accept three
                cookie banners before you can count a word. Toolora does none of that. Each tool
                is a small, focused page with an explanation of how the result is produced.
              </p>
              <div className="mt-6 inline-flex items-center gap-2 border border-[var(--border-strong)] px-3 py-2">
                <span className="size-[6px] bg-[var(--ring)]" aria-hidden />
                <span className="font-mono text-[0.62rem] uppercase tracking-[0.14em] text-[var(--text-muted)]">
                  Every tool covered by automated tests
                </span>
              </div>
            </div>

            <dl className="lg:col-span-7">
              {PRINCIPLES.map((item, index) => (
                <div
                  key={item.title}
                  className="grid gap-3 border-t border-[var(--border)] py-6 sm:grid-cols-[3rem_1fr] last:border-b last:border-b-[var(--border)]"
                >
                  <div className="flex items-start gap-2">
                    <span className="font-mono text-[0.62rem] tracking-[0.1em] text-[var(--accent-text)]">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                  </div>
                  <div>
                    <dt className="flex items-center gap-2 font-display text-[1.12rem] font-semibold tracking-[-0.025em] text-[var(--text)]">
                      <item.icon className="size-4 text-[var(--text-subtle)]" aria-hidden />
                      {item.title}
                    </dt>
                    <dd className="mt-1.5 max-w-xl text-sm leading-relaxed text-[var(--text-muted)]">
                      {item.body}
                    </dd>
                  </div>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </section>

      {/* ── 04 · Recently added ─────────────────────────────── */}
      <section className="border-b border-[var(--border)]">
        <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
          <div className="flex flex-wrap items-end justify-between gap-4 border-b border-[var(--text)] pb-4">
            <div>
              <p className="eyebrow">04 — Latest</p>
              <h2 className="section-title mt-2 text-[var(--text)]">Recently added</h2>
            </div>
            <Link
              href="/roadmap/"
              className="inline-flex items-center gap-1.5 font-mono text-[0.66rem] uppercase tracking-[0.14em] text-[var(--text)] transition-colors hover:text-[var(--accent-text)]"
            >
              See the roadmap
              <ArrowRight className="size-3.5" aria-hidden />
            </Link>
          </div>
          <p className="mt-3 max-w-md text-sm text-[var(--text-muted)]">
            New tools are published once they are tested — never as placeholders.
          </p>
          <ol className="mt-2">
            {recentlyAdded.slice(0, 5).map((tool, index) => (
              <ToolCard key={tool.slug} tool={tool} variant="row" index={index + 1} />
            ))}
          </ol>
        </div>
      </section>

      {/* ── 05 · Guides ──────────────────────────────────────── */}
      <section className="border-b border-[var(--border)] bg-[var(--page-elevated)]">
        <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
          <div className="flex flex-wrap items-end justify-between gap-4 border-b border-[var(--text)] pb-4">
            <div>
              <p className="eyebrow">05 — Guides</p>
              <h2 className="section-title mt-2 text-[var(--text)]">The reasoning, written down</h2>
            </div>
            <Link
              href="/guides/"
              className="inline-flex items-center gap-1.5 font-mono text-[0.66rem] uppercase tracking-[0.14em] text-[var(--text)] transition-colors hover:text-[var(--accent-text)]"
            >
              All guides
              <ArrowRight className="size-3.5" aria-hidden />
            </Link>
          </div>

          <div className="grid sm:grid-cols-3 sm:divide-x sm:divide-[var(--border)]">
            {GUIDES.map((guide, index) => (
              <Link
                key={guide.href}
                href={guide.href}
                className="group border-b border-[var(--border)] py-6 sm:border-b-0 sm:px-6 sm:first:pl-0 sm:last:pr-0"
              >
                <span className="font-mono text-[0.62rem] tracking-[0.14em] text-[var(--text-subtle)]">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <h3 className="mt-2 font-display text-[1.15rem] font-semibold leading-tight tracking-[-0.03em] text-[var(--text)] transition-colors group-hover:text-[var(--accent-text)]">
                  {guide.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-[var(--text-muted)]">
                  {guide.body}
                </p>
                <span className="mt-3 inline-flex items-center gap-1 font-mono text-[0.6rem] uppercase tracking-[0.14em] text-[var(--text)]">
                  Read
                  <ArrowUpRight className="size-3 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" aria-hidden />
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── 06 · FAQ ─────────────────────────────────────────── */}
      <section>
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
          <div className="grid gap-10 lg:grid-cols-12">
            <div className="lg:col-span-4">
              <p className="eyebrow">06 — Questions</p>
              <h2 className="section-title mt-3 text-[var(--text)]">
                Answers before
                <br />
                you ask
              </h2>
              <p className="mt-4 max-w-xs text-sm leading-relaxed text-[var(--text-muted)]">
                Something still unclear? Write to us — a real person reads every message.
              </p>
              <Link
                href="/contact/"
                className="mt-3 inline-flex items-center gap-1.5 font-mono text-[0.66rem] uppercase tracking-[0.14em] text-[var(--accent-text)] hover:underline"
              >
                Contact us
                <ArrowUpRight className="size-3.5" aria-hidden />
              </Link>
            </div>

            <div className="border-t border-[var(--text)] lg:col-span-8">
              {SITE_FAQS.map((faq, index) => (
                <details key={faq.q} className="group border-b border-[var(--border)]">
                  <summary className="flex cursor-pointer list-none items-baseline gap-4 py-4 [&::-webkit-details-marker]:hidden">
                    <span className="font-mono text-[0.62rem] tracking-[0.1em] text-[var(--text-subtle)]">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <span className="flex-1 font-display text-[1.05rem] font-semibold tracking-[-0.02em] text-[var(--text)]">
                      {faq.q}
                    </span>
                    <span
                      className="font-mono text-lg leading-none text-[var(--text-subtle)] transition-transform group-open:rotate-45"
                      aria-hidden
                    >
                      +
                    </span>
                  </summary>
                  <p className="max-w-2xl pb-4 pl-8 text-sm leading-relaxed text-[var(--text-muted)]">
                    {faq.a}
                  </p>
                </details>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────────────────── */}
      <section className="border-y border-[var(--text)] bg-[var(--text)] text-[var(--page)]">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
          <div className="grid items-end gap-8 md:grid-cols-[1.4fr_auto]">
            <div>
              <p className="font-mono text-[0.64rem] uppercase tracking-[0.18em] text-[var(--page)]/60">
                No account · no newsletter · no nonsense
              </p>
              <h2 className="display mt-3 text-[clamp(1.9rem,4.6vw,3.4rem)]">
                Start with the tool
                <br />
                you need right now.
              </h2>
              <p className="mt-4 max-w-md text-sm leading-relaxed text-[var(--page)]/70">
                {siteConfig.name} keeps growing — one tested tool at a time. If something is
                missing, tell us; it may already be on the list.
              </p>
            </div>
            <div className="flex flex-wrap gap-2 md:justify-end">
              <Link
                href="/tools/"
                className="inline-flex items-center gap-2 border border-[var(--page)] bg-[var(--page)] px-5 py-3 font-mono text-[0.7rem] uppercase tracking-[0.12em] text-[var(--text)] transition-colors hover:border-[var(--ring)] hover:bg-[var(--ring)] hover:text-[#14140f]"
              >
                Browse all tools
                <ArrowRight className="size-3.5" aria-hidden />
              </Link>
              <Link
                href="/roadmap/"
                className="inline-flex items-center gap-2 border border-[var(--page)]/40 px-5 py-3 font-mono text-[0.7rem] uppercase tracking-[0.12em] text-[var(--page)] transition-colors hover:border-[var(--page)]"
              >
                View the roadmap
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
