import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";
import Link from "next/link";
import { ArrowRight, ArrowUpRight, Lock, MousePointerClick, Zap } from "lucide-react";
import { HeroSearch } from "@/components/hero-search";
import { ToolCard } from "@/components/tool-card";
import { CategoryTile, categoryTone } from "@/components/category-icon";
import { CategoryArt } from "@/components/category-art";
import { JsonLd } from "@/components/json-ld";
import { categories } from "@/lib/tools/categories";
import { liveTools, popularTools, recentlyAdded, toolCountByCategory } from "@/lib/tools/registry";
import { siteConfig } from "@/lib/site";

export const metadata: Metadata = pageMetadata({
  title: `${siteConfig.name} — ${liveTools.length} Free Online Tools That Run in Your Browser`,
  description: `${liveTools.length} free online tools for text, numbers, images, PDFs and code — word counter, percentage calculator, JSON formatter, unit converter, password generator and more. Everything runs in your browser: no sign-up, no uploads.`,
  path: "/",
});

const SITE_FAQS = [
  {
    q: "Are the tools really free?",
    a: "Yes. Every tool here is free to use, with no account, no trial and no usage limit. The site is designed to be funded by advertising once it qualifies, which is why there is no paywall on the tools themselves.",
  },
  {
    q: "Is my data uploaded to a server?",
    a: "No. Text, numbers and files are processed by JavaScript running in your own browser. There is no upload endpoint for tool input, so the content you paste never leaves your device.",
  },
  {
    q: "Do I need to install anything?",
    a: "No. The site works in any modern browser on desktop or mobile. There is nothing to install and no extension to grant permissions to.",
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

const QUICK_LINKS = [
  { slug: "word-counter", label: "Word counter" },
  { slug: "percentage-calculator", label: "Percentage" },
  { slug: "json-formatter", label: "JSON" },
  { slug: "unit-converter", label: "Units" },
  { slug: "qr-code-generator", label: "QR codes" },
  { slug: "password-generator", label: "Passwords" },
];

export default function HomePage() {
  const liveCategories = categories.filter((category) => category.status === "live");
  const collectionSchema = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Tool categories",
    numberOfItems: categories.length,
    itemListElement: categories.map((category, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: category.name,
      url: `${siteConfig.url}/categories/${category.id}/`,
      description: category.tagline,
    })),
  };

  const popularSchema = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Most used tools",
    numberOfItems: popularTools.slice(0, 9).length,
    itemListElement: popularTools.slice(0, 9).map((tool, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: tool.name,
      url: `${siteConfig.url}/tools/${tool.slug}/`,
    })),
  };

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
      <JsonLd data={[collectionSchema, popularSchema, faqSchema]} />

      {/* ── Hero ─────────────────────────────────────────────── */}
      <section className="relative overflow-hidden">
        <div
          className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[26rem] bg-[radial-gradient(60%_100%_at_50%_0%,var(--ring-soft),transparent_72%)]"
          aria-hidden
        />
        <div className="mx-auto max-w-6xl px-4 pb-16 pt-14 sm:px-6 sm:pb-20 sm:pt-20">
          <div className="mx-auto max-w-3xl text-center">
            <div className="flex flex-wrap items-center justify-center gap-2">
              <span className="chip chip-accent">{liveTools.length} tools live</span>
              <span className="chip">{liveCategories.length} categories</span>
              <span className="chip">0 uploads</span>
            </div>

            <h1 className="display mt-6 text-[clamp(2.5rem,6vw,4.4rem)] text-[var(--text)]">
              Every tool you need,
              <br />
              none of the uploads<span className="text-[var(--accent-text)]">.</span>
            </h1>

            <p className="mx-auto mt-5 max-w-xl text-[1.05rem] leading-relaxed text-[var(--text-muted)]">
              Count words, check percentages, format JSON, convert units or generate a
              password. {liveTools.length} focused tools that run in your browser — instant
              results, no sign-up, and nothing you paste ever leaves your device.
            </p>

            <div className="mx-auto mt-8 max-w-2xl">
              <HeroSearch count={liveTools.length} />
            </div>

            <ul className="mt-5 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-[0.8rem] text-[var(--text-subtle)]">
              {QUICK_LINKS.map((link) => (
                <li key={link.slug}>
                  <Link
                    href={`/tools/${link.slug}/`}
                    className="transition-colors hover:text-[var(--accent-text)]"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* ── Categories ───────────────────────────────────────── */}
      <section>
        <div className="mx-auto max-w-6xl px-4 pb-16 sm:px-6 sm:pb-20">
          <SectionHead
            label="Browse"
            title="Pick a shelf"
            description="Twelve categories, every tool tested before it goes live."
            href="/categories/"
            linkLabel="All categories"
          />

          <div className="mt-7 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {categories.map((category) => {
              const count = toolCountByCategory[category.id] ?? 0;
              const planned = count === 0;
              return (
                <Link
                  key={category.id}
                  href={`/categories/${category.id}/`}
                  className={`card card-lift group relative flex items-start gap-3.5 overflow-hidden p-4 ${categoryTone(category.id)}`}
                >
                  <CategoryArt
                    id={category.id}
                    className="pointer-events-none absolute -bottom-2 right-1 h-14 w-20 opacity-45 transition-opacity duration-200 group-hover:opacity-70"
                  />
                  <CategoryTile id={category.id} size="md" />
                  <span className="relative min-w-0 flex-1 pr-14">
                    <span className="flex items-baseline justify-between gap-2">
                      <span className="font-display text-[1rem] font-semibold leading-tight tracking-[-0.02em] text-[var(--text)]">
                        {category.shortName}
                      </span>
                      <span className="shrink-0 font-mono text-[0.6rem] uppercase tracking-[0.1em] text-[var(--text-subtle)]">
                        {planned ? "Planned" : `${count}`}
                      </span>
                    </span>
                    <span className="mt-1 block truncate text-[0.82rem] text-[var(--text-muted)]">
                      {category.tagline}
                    </span>
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── Popular tools ────────────────────────────────────── */}
      <section className="border-y border-[var(--border)] bg-[var(--page-elevated)]">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
          <SectionHead
            label="Most used"
            title="Start here"
            description="The tools visitors reach for most often."
            href="/tools/"
            linkLabel={`All ${liveTools.length} tools`}
          />
          <ol className="mt-7 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {popularTools.slice(0, 9).map((tool) => (
              <li key={tool.slug} className="min-w-0">
                <ToolCard tool={tool} className="h-full" />
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* ── Principles ───────────────────────────────────────── */}
      <section>
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
          <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-center lg:gap-14">
            <div>
              <p className="eyebrow">Why it works</p>
              <h2 className="section-title mt-3 max-w-sm text-[var(--text)]">
                Built like an instrument, not a content farm.
              </h2>
              <p className="mt-4 max-w-md text-[0.98rem] leading-relaxed text-[var(--text-muted)]">
                Most utility sites ask you to upload a file, create an account or accept three
                cookie banners before you can count a word. This site does none of that. Each tool
                is a small, focused page with an explanation of how the result is produced.
              </p>
              <div className="mt-6 inline-flex items-center gap-2 rounded-full border border-[var(--border)] bg-[var(--surface)] px-3.5 py-2">
                <span className="size-[6px] rounded-full bg-[var(--ring)]" aria-hidden />
                <span className="font-mono text-[0.62rem] uppercase tracking-[0.12em] text-[var(--text-muted)]">
                  Every tool covered by automated tests
                </span>
              </div>
            </div>

            <div className="grid gap-3">
              {PRINCIPLES.map((item) => (
                <div key={item.title} className="card flex items-start gap-4 p-5">
                  <span className="cat-tile cat-neutral size-10 text-[var(--accent-text)]">
                    <item.icon className="size-[1.15rem]" aria-hidden />
                  </span>
                  <div>
                    <h3 className="font-display text-[1.05rem] font-semibold tracking-[-0.02em] text-[var(--text)]">
                      {item.title}
                    </h3>
                    <p className="mt-1.5 text-sm leading-relaxed text-[var(--text-muted)]">
                      {item.body}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Recently added + guides ──────────────────────────── */}
      <section className="border-y border-[var(--border)] bg-[var(--page-elevated)]">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
          <SectionHead
            label="Latest"
            title="Recently added"
            description="New tools are published once they are tested — never as placeholders."
            href="/roadmap/"
            linkLabel="See the roadmap"
          />
          <ol className="mt-7 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {recentlyAdded.slice(0, 6).map((tool) => (
              <li key={tool.slug} className="min-w-0">
                <ToolCard tool={tool} className="h-full" />
              </li>
            ))}
          </ol>

          <div className="mt-14">
            <SectionHead
              label="Guides"
              title="The reasoning, written down"
              description="Short explanations of the maths and conventions behind the tools."
              href="/guides/"
              linkLabel="All guides"
            />
            <div className="mt-7 grid gap-3 sm:grid-cols-3">
              {GUIDES.map((guide) => (
                <Link key={guide.href} href={guide.href} className="card card-lift group p-5">
                  <h3 className="font-display text-[1.08rem] font-semibold leading-snug tracking-[-0.025em] text-[var(--text)]">
                    {guide.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-[var(--text-muted)]">
                    {guide.body}
                  </p>
                  <span className="mt-4 inline-flex items-center gap-1 text-[0.8rem] font-medium text-[var(--accent-text)]">
                    Read
                    <ArrowUpRight
                      className="size-3.5 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                      aria-hidden
                    />
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── FAQ ──────────────────────────────────────────────── */}
      <section>
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
          <div className="grid gap-8 lg:grid-cols-[0.8fr_1.2fr] lg:gap-14">
            <div>
              <p className="eyebrow">Questions</p>
              <h2 className="section-title mt-3 text-[var(--text)]">Answers before you ask</h2>
              <p className="mt-4 max-w-xs text-sm leading-relaxed text-[var(--text-muted)]">
                Something still unclear? Write to us — a real person reads every message.
              </p>
              <Link
                href="/contact/"
                className="mt-4 inline-flex items-center gap-1.5 text-[0.85rem] font-medium text-[var(--accent-text)] hover:underline"
              >
                Contact us
                <ArrowUpRight className="size-3.5" aria-hidden />
              </Link>
            </div>

            <div className="grid gap-2">
              {SITE_FAQS.map((faq) => (
                <details
                  key={faq.q}
                  className="group rounded-2xl border border-[var(--border)] bg-[var(--surface)] px-5 transition-colors open:border-[var(--border-strong)]"
                >
                  <summary className="flex cursor-pointer list-none items-center gap-3 py-4 [&::-webkit-details-marker]:hidden">
                    <span className="flex-1 font-display text-[1.02rem] font-semibold tracking-[-0.02em] text-[var(--text)]">
                      {faq.q}
                    </span>
                    <span
                      className="font-mono text-lg leading-none text-[var(--text-subtle)] transition-transform group-open:rotate-45"
                      aria-hidden
                    >
                      +
                    </span>
                  </summary>
                  <p className="pb-4 text-sm leading-relaxed text-[var(--text-muted)]">{faq.a}</p>
                </details>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────────────────── */}
      <section className="mx-auto max-w-6xl px-4 pb-20 sm:px-6">
        <div className="relative overflow-hidden rounded-3xl bg-[var(--text)] px-6 py-12 text-[var(--page)] sm:px-12 sm:py-14">
          <div
            className="pointer-events-none absolute -right-24 -top-24 size-72 rounded-full bg-[var(--ring)] opacity-20 blur-3xl"
            aria-hidden
          />
          <div className="relative grid items-end gap-8 md:grid-cols-[1.4fr_auto]">
            <div>
              <p className="font-mono text-[0.62rem] uppercase tracking-[0.16em] text-[var(--page)]/60">
                No account · no newsletter · no nonsense
              </p>
              <h2 className="display mt-3 text-[clamp(1.8rem,4vw,2.9rem)]">
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
                className="inline-flex items-center gap-2 rounded-xl bg-[var(--page)] px-5 py-3 text-[0.85rem] font-semibold text-[var(--text)] transition-colors hover:bg-[var(--ring)]"
              >
                Browse all tools
                <ArrowRight className="size-4" aria-hidden />
              </Link>
              <Link
                href="/roadmap/"
                className="inline-flex items-center gap-2 rounded-xl border border-[var(--page)]/30 px-5 py-3 text-[0.85rem] font-semibold text-[var(--page)] transition-colors hover:border-[var(--page)]"
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

function SectionHead({
  label,
  title,
  description,
  href,
  linkLabel,
}: {
  label: string;
  title: string;
  description?: string;
  href: string;
  linkLabel: string;
}) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-4">
      <div>
        <p className="eyebrow">{label}</p>
        <h2 className="mt-2 font-display text-[clamp(1.6rem,3vw,2.2rem)] font-bold tracking-[-0.035em] text-[var(--text)]">
          {title}
        </h2>
        {description ? (
          <p className="mt-2 max-w-md text-sm leading-relaxed text-[var(--text-muted)]">
            {description}
          </p>
        ) : null}
      </div>
      <Link
        href={href}
        className="inline-flex items-center gap-1.5 rounded-full border border-[var(--border)] bg-[var(--surface)] px-4 py-2 text-[0.8rem] font-medium text-[var(--text)] transition-colors hover:border-[var(--border-strong)]"
      >
        {linkLabel}
        <ArrowRight className="size-3.5" aria-hidden />
      </Link>
    </div>
  );
}
