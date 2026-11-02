import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  Check,
  Clock,
  Github,
  Lock,
  MousePointerClick,
  Sparkles,
  Zap,
} from "lucide-react";
import { HeroSearch } from "@/components/hero-search";
import { ToolCard } from "@/components/tool-card";
import { CategoryIcon, categoryTone } from "@/components/category-icon";
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

export default function HomePage() {
  const featured = categories.filter((category) => category.status === "live");
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

      {/* Hero */}
      <section className="relative overflow-hidden border-b border-[var(--border)]">
        <div className="grid-glow absolute inset-0" aria-hidden />
        <div className="dot-grid absolute inset-0 opacity-40" aria-hidden />
        <div className="relative mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-24">
          <div className="max-w-2xl">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-brand-200 bg-brand-50 px-3 py-1 text-[0.72rem] font-semibold text-brand-800 dark:border-brand-500/30 dark:bg-brand-500/10 dark:text-brand-200">
              <Sparkles className="size-3" aria-hidden />
              {liveTools.length} tools live · nothing to install
            </span>
            <h1 className="mt-4 text-[2.1rem] font-bold leading-[1.08] tracking-[-0.035em] text-[var(--text)] sm:text-[3.25rem]">
              Free online tools that
              <span className="bg-gradient-to-r from-brand-600 to-accent-500 bg-clip-text text-transparent">
                {" "}
                work in your browser
              </span>
            </h1>
            <p className="mt-4 max-w-xl text-base leading-relaxed text-[var(--text-muted)] sm:text-lg">
              Count words, check percentages, format JSON, convert units or generate a password.
              Instant results, no sign-up, and nothing you paste ever leaves your device.
            </p>

            <div className="mt-7">
              <HeroSearch count={liveTools.length} />
            </div>

            <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2 text-[0.8rem] text-[var(--text-muted)]">
              <span className="flex items-center gap-1.5">
                <Check className="size-3.5 text-emerald-600 dark:text-emerald-400" aria-hidden />
                100% free
              </span>
              <span className="flex items-center gap-1.5">
                <Lock className="size-3.5 text-emerald-600 dark:text-emerald-400" aria-hidden />
                Processed locally
              </span>
              <span className="flex items-center gap-1.5">
                <Zap className="size-3.5 text-emerald-600 dark:text-emerald-400" aria-hidden />
                No page reloads
              </span>
              <span className="flex items-center gap-1.5">
                <Clock className="size-3.5 text-emerald-600 dark:text-emerald-400" aria-hidden />
                Works offline once loaded
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Popular tools */}
      <section className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
        <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="text-xl font-bold tracking-tight text-[var(--text)] sm:text-2xl">
              Most used tools
            </h2>
            <p className="mt-1 text-sm text-[var(--text-muted)]">
              The ones people reach for most often — all instant, all free.
            </p>
          </div>
          <Link
            href="/tools/"
            className="inline-flex items-center gap-1 text-sm font-semibold text-brand-600 hover:underline dark:text-brand-300"
          >
            Browse all {liveTools.length} tools
            <ArrowRight className="size-3.5" aria-hidden />
          </Link>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {popularTools.map((tool) => (
            <ToolCard key={tool.slug} tool={tool} showCategory />
          ))}
        </div>
      </section>

      {/* Categories */}
      <section className="border-y border-[var(--border)] bg-[var(--page-elevated)]">
        <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
          <div className="mb-6">
            <h2 className="text-xl font-bold tracking-tight text-[var(--text)] sm:text-2xl">
              Browse by category
            </h2>
            <p className="mt-1 text-sm text-[var(--text-muted)]">
              Twelve categories, built one finished tool at a time. Categories marked “planned” are
              on the roadmap and clearly labelled.
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {categories.map((category) => {
              const count = toolCountByCategory[category.id] ?? 0;
              return (
                <Link
                  key={category.id}
                  href={`/categories/${category.id}/`}
                  className="group flex items-start gap-3 rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4 transition-all hover:-translate-y-0.5 hover:border-[var(--border-strong)] hover:shadow-[var(--shadow-soft)]"
                >
                  <span
                    className={`flex size-10 shrink-0 items-center justify-center rounded-lg ${categoryTone(category.accent)}`}
                  >
                    <CategoryIcon id={category.id} className="size-5" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="flex items-center gap-2">
                      <span className="text-[0.95rem] font-semibold text-[var(--text)]">
                        {category.shortName}
                      </span>
                      {count > 0 ? (
                        <span className="chip !py-0 !text-[0.65rem]">{count} live</span>
                      ) : (
                        <span className="chip !py-0 !text-[0.65rem]">planned</span>
                      )}
                    </span>
                    <span className="mt-1 block text-[0.82rem] leading-relaxed text-[var(--text-muted)]">
                      {category.tagline}
                    </span>
                  </span>
                  <ArrowRight
                    className="mt-1 size-4 shrink-0 text-[var(--text-subtle)] transition-transform group-hover:translate-x-0.5"
                    aria-hidden
                  />
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* Why */}
      <section className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
        <div className="grid gap-8 lg:grid-cols-2 lg:items-center">
          <div>
            <h2 className="text-xl font-bold tracking-tight text-[var(--text)] sm:text-2xl">
              Built to be fast, private and genuinely useful
            </h2>
            <p className="mt-2 text-[0.95rem] leading-relaxed text-[var(--text-muted)]">
              Most utility sites ask you to upload files, create an account or accept three cookie
              banners before you can count a word. Toolora does none of that. Each tool is a small,
              focused page with an explanation of how the result is produced.
            </p>
            <dl className="mt-6 space-y-4">
              {[
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
              ].map((item) => (
                <div key={item.title} className="flex gap-3">
                  <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-brand-700 dark:bg-brand-500/15 dark:text-brand-300">
                    <item.icon className="size-[1.05rem]" aria-hidden />
                  </span>
                  <div>
                    <dt className="text-[0.92rem] font-semibold text-[var(--text)]">{item.title}</dt>
                    <dd className="mt-0.5 text-sm leading-relaxed text-[var(--text-muted)]">
                      {item.body}
                    </dd>
                  </div>
                </div>
              ))}
            </dl>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            {[
              { label: "Live tools", value: String(liveTools.length), hint: "tested and published" },
              { label: "Categories", value: String(categories.length), hint: "12 planned areas" },
              { label: "Uploads required", value: "0", hint: "client-side processing" },
              { label: "Sign-up required", value: "No", hint: "no accounts, ever" },
            ].map((stat) => (
              <div key={stat.label} className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-5">
                <p className="text-[0.7rem] font-bold uppercase tracking-[0.09em] text-[var(--text-subtle)]">
                  {stat.label}
                </p>
                <p className="mt-1 font-mono text-3xl font-bold text-[var(--text)]">{stat.value}</p>
                <p className="mt-1 text-xs text-[var(--text-subtle)]">{stat.hint}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Recently added */}
      <section className="border-y border-[var(--border)] bg-[var(--page-elevated)]">
        <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
          <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
            <div>
              <h2 className="text-xl font-bold tracking-tight text-[var(--text)] sm:text-2xl">
                Recently added
              </h2>
              <p className="mt-1 text-sm text-[var(--text-muted)]">
                New tools are added once they are tested — never as placeholders.
              </p>
            </div>
            <Link
              href="/roadmap/"
              className="inline-flex items-center gap-1 text-sm font-semibold text-brand-600 hover:underline dark:text-brand-300"
            >
              See the roadmap
              <ArrowRight className="size-3.5" aria-hidden />
            </Link>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {recentlyAdded.map((tool) => (
              <ToolCard key={tool.slug} tool={tool} showCategory />
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
        <h2 className="text-xl font-bold tracking-tight text-[var(--text)] sm:text-2xl">
          How this site works
        </h2>
        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          {[
            {
              step: "01",
              title: "Find the right tool",
              body: "Search with ⌘K, browse a category, or land straight on a tool page from a search engine.",
            },
            {
              step: "02",
              title: "Do the job in seconds",
              body: "Type, paste or drop a value. Results appear immediately because nothing is sent anywhere.",
            },
            {
              step: "03",
              title: "Take the result with you",
              body: "Copy to your clipboard, download a file, or read the explanation to check the method for yourself.",
            },
          ].map((item) => (
            <div key={item.step} className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-5">
              <span className="font-mono text-xs font-semibold text-brand-600 dark:text-brand-300">
                {item.step}
              </span>
              <h3 className="mt-2 text-[0.95rem] font-semibold text-[var(--text)]">{item.title}</h3>
              <p className="mt-1 text-sm leading-relaxed text-[var(--text-muted)]">{item.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Guides */}
      <section className="border-y border-[var(--border)] bg-[var(--page-elevated)]">
        <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
          <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
            <div>
              <h2 className="text-xl font-bold tracking-tight text-[var(--text)] sm:text-2xl">
                Guides that explain the maths
              </h2>
              <p className="mt-1 text-sm text-[var(--text-muted)]">
                Short, practical explanations that go with the tools.
              </p>
            </div>
            <Link
              href="/guides/"
              className="inline-flex items-center gap-1 text-sm font-semibold text-brand-600 hover:underline dark:text-brand-300"
            >
              All guides
              <ArrowRight className="size-3.5" aria-hidden />
            </Link>
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            {[
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
            ].map((guide) => (
              <Link
                key={guide.href}
                href={guide.href}
                className="group rounded-xl border border-[var(--border)] bg-[var(--surface)] p-5 transition-colors hover:border-[var(--border-strong)]"
              >
                <h3 className="text-[0.95rem] font-semibold text-[var(--text)] group-hover:text-brand-600 dark:group-hover:text-brand-300">
                  {guide.title}
                </h3>
                <p className="mt-1.5 text-sm leading-relaxed text-[var(--text-muted)]">{guide.body}</p>
                <span className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-brand-600 dark:text-brand-300">
                  Read guide
                  <ArrowRight className="size-3" aria-hidden />
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="mx-auto max-w-3xl px-4 py-14 sm:px-6">
        <h2 className="text-xl font-bold tracking-tight text-[var(--text)] sm:text-2xl">
          Frequently asked questions
        </h2>
        <div className="mt-5 divide-y divide-[var(--border)] overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--surface)]">
          {SITE_FAQS.map((faq) => (
            <details key={faq.q} className="group px-4 py-3">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-3 text-[0.92rem] font-semibold text-[var(--text)] [&::-webkit-details-marker]:hidden">
                {faq.q}
                <span className="text-[var(--text-subtle)] transition-transform group-open:rotate-45">+</span>
              </summary>
              <p className="mt-2 text-sm leading-relaxed text-[var(--text-muted)]">{faq.a}</p>
            </details>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-6xl px-4 pb-6 sm:px-6">
        <div className="relative overflow-hidden rounded-2xl border border-brand-200 bg-gradient-to-br from-brand-50 via-[var(--surface)] to-emerald-50 p-8 text-center dark:border-brand-500/25 dark:from-brand-500/10 dark:via-[var(--surface)] dark:to-emerald-500/10 sm:p-12">
          <h2 className="text-xl font-bold tracking-tight text-[var(--text)] sm:text-2xl">
            Start with the tool you need right now
          </h2>
          <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-[var(--text-muted)]">
            {siteConfig.name} will keep growing — one tested tool at a time. No account, no
            newsletter wall, no nonsense.
          </p>
          <div className="mt-5 flex flex-wrap justify-center gap-2">
            <Link href="/tools/" className="btn btn-primary">
              Browse all tools
              <ArrowRight className="size-4" aria-hidden />
            </Link>
            <Link href="/roadmap/" className="btn btn-secondary">
              <Github className="size-4" aria-hidden />
              View the roadmap
            </Link>
          </div>
          <p className="mt-4 text-xs text-[var(--text-subtle)]">
            Missing a tool you need?{" "}
            <Link href="/contact/" className="link">
              Tell us
            </Link>{" "}
            — it may already be on the list.
          </p>
        </div>
      </section>
    </>
  );
}
