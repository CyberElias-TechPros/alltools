import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";
import Link from "next/link";
import {
  ArrowRight,
  ArrowUpRight,
  Gauge,
  Lock,
  MousePointerClick,
  ShieldCheck,
  Zap,
} from "lucide-react";
import { Hero } from "@/components/home/hero";
import { LiveCounter } from "@/components/home/live-counter";
import { ToolCard } from "@/components/tool-card";
import { CategoryTile, categoryTone } from "@/components/category-icon";
import { CategoryArt } from "@/components/category-art";
import { JsonLd } from "@/components/json-ld";
import { Reveal, RevealGroup } from "@/components/motion/reveal";
import { SplitText } from "@/components/motion/split-text";
import { CountUp } from "@/components/motion/count-up";
import { Magnet } from "@/components/motion/magnetic";
import { DecryptedText } from "@/components/bits/decrypted-text";
import { TextType } from "@/components/bits/text-type";
import { Marquee } from "@/components/bits/marquee";
import { CircularText } from "@/components/bits/circular-text";
import { Aurora } from "@/components/bits/aurora";
import { SpotlightCard } from "@/components/bits/spotlight-card";
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
    meta: "0 bytes uploaded",
  },
  {
    icon: Zap,
    title: "No waiting, no loading spinners",
    body: "Because there is no server round trip, results are effectively instant — and the tools keep working if your connection drops.",
    meta: "0 round trips",
  },
  {
    icon: MousePointerClick,
    title: "One job per page, clearly explained",
    body: "Each page states its formula or method, gives worked examples and admits its limitations. No fake features, no placeholder pages.",
    meta: "1 tool · 1 job",
  },
];

const GUIDES = [
  {
    href: "/guides/how-reading-time-is-calculated/",
    title: "How reading time is calculated",
    body: "Why 200–250 words per minute is the standard, and when to adjust it.",
    kicker: "Method",
  },
  {
    href: "/guides/percentage-change-vs-percentage-points/",
    title: "Percentage change vs percentage points",
    body: "The distinction that makes headlines misleading, explained with examples.",
    kicker: "Maths",
  },
  {
    href: "/guides/encoding-vs-encryption/",
    title: "Base64 is not encryption",
    body: "What encoding actually does, and why hashing is different again.",
    kicker: "Security",
  },
];

const TICKER = [
  "Text",
  "Calculators",
  "Finance",
  "Developer",
  "Everyday",
  "SEO",
  "Security",
  "Images",
  "PDF",
  "Education",
  "Internet",
  "Business",
];

export default function HomePage() {
  const liveCategories = categories.filter((category) => category.status === "live");
  /**
   * The biggest shelf gets the editorial emphasis. Derived from the registry so
   * the claim ("largest shelf") can never drift out of date.
   */
  const featuredCategory = categories.reduce(
    (best, category) =>
      (toolCountByCategory[category.id] ?? 0) > (toolCountByCategory[best.id] ?? 0) ? category : best,
    categories[0],
  ).id;
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

      <Hero count={liveTools.length} categories={liveCategories.length} />

      {/* ── Category ticker ─────────────────────────────────────── */}
      <div className="border-b border-[var(--border)] bg-[var(--surface)]/60 py-3">
        <Marquee speed="slow">
          {TICKER.map((item) => (
            <span key={item} className="flex items-center gap-4 pr-4">
              <span className="font-display text-[0.95rem] font-medium tracking-[-0.02em] text-[var(--text-muted)]">
                {item}
              </span>
              <span className="font-mono text-[0.55rem] text-[var(--ring)]" aria-hidden>
                ✳
              </span>
            </span>
          ))}
        </Marquee>
      </div>

      {/* ── Try-it band: the premise, demonstrated ──────────────── */}
      <section className="border-b border-[var(--border)] bg-[var(--page-elevated)]">
        <div className="mx-auto grid max-w-[1180px] gap-10 px-4 py-16 sm:px-6 sm:py-20 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:gap-16">
          <Reveal>
            <p className="eyebrow">Try it before you click</p>
            <h2 className="mt-4 font-display text-[clamp(1.8rem,3.6vw,2.7rem)] font-bold leading-[1.02] tracking-[-0.045em] text-[var(--text)]">
              Type anything.
              <br />
              Watch it compute{" "}
              <span className="serif-accent font-normal text-[var(--accent-text)]">instantly</span>
              <span className="text-[var(--ring)]">.</span>
            </h2>
            <p className="mt-5 max-w-md text-[0.95rem] leading-relaxed text-[var(--text-muted)]">
              This is the real component behind the{" "}
              <Link href="/tools/word-counter/" className="link">
                word counter
              </Link>
              , not a screenshot. It counts as you type because the work happens in your
              browser&nbsp;— which is also why it keeps working when your connection does not.
            </p>
            <ul className="mt-6 grid gap-2.5">
              {[
                "No submit button, no spinner, no round trip",
                "Nothing you paste is transmitted or stored",
                "The same engine powers all 254 tools",
              ].map((item) => (
                <li key={item} className="flex items-start gap-2.5 text-[0.86rem] text-[var(--text-muted)]">
                  <span className="mt-[0.45rem] size-1 shrink-0 rounded-full bg-[var(--ring)]" aria-hidden />
                  {item}
                </li>
              ))}
            </ul>
          </Reveal>
          <Reveal delay={0.1}>
            <LiveCounter />
          </Reveal>
        </div>
      </section>

      {/* ── Manifesto band ──────────────────────────────────────── */}
      <section className="mx-auto max-w-[1180px] px-4 pt-20 sm:px-6 sm:pt-28">
        <div className="grid gap-8 border-b border-[var(--border)] pb-16 md:grid-cols-[0.34fr_1fr] md:gap-14">
          <Reveal>
            <p className="eyebrow">The premise</p>
            <div className="mt-4 flex items-center gap-3">
              <span className="h-px w-10 bg-[var(--ring)]" aria-hidden />
              <span className="font-mono text-[0.6rem] uppercase tracking-[0.18em] text-[var(--text-subtle)]">
                Est. 2025 · Lagos
              </span>
            </div>
          </Reveal>
          <div>
            <h2 className="max-w-3xl font-display text-[clamp(1.6rem,3.6vw,2.7rem)] font-semibold leading-[1.08] tracking-[-0.045em] text-[var(--text)]">
              <SplitText splitBy="words" stagger={0.018} scrollTrigger className="!inline">
                A utility site should feel like a well-made instrument:
              </SplitText>{" "}
              <span className="serif-accent font-normal text-[var(--accent-text)]">
                precise, quiet, and instantly responsive
              </span>
              <span className="text-[var(--ring)]">.</span>
            </h2>
            <p className="mt-6 max-w-xl text-[0.98rem] leading-relaxed text-[var(--text-muted)]">
              No account walls. No upload queue. No three-step wizard to count a word. Each tool
              is a single page that does one thing, shows its working, and gets out of the way.
            </p>
          </div>
        </div>
      </section>

      {/* ── Categories ──────────────────────────────────────────── */}
      <section id="categories" className="scroll-mt-24">
        <div className="mx-auto max-w-[1180px] px-4 py-16 sm:px-6 sm:py-24">
          <SectionHead
            index="01"
            label="Browse the catalogue"
            title="Twelve shelves, one standard"
            description="Every category is a curated set — not a keyword dump. Tools ship only once they pass automated tests."
            href="/categories/"
            linkLabel="All categories"
          />

          <RevealGroup className="mt-10 grid gap-px overflow-hidden rounded-3xl border border-[var(--border)] bg-[var(--border)] sm:grid-cols-2 lg:grid-cols-3">
            {categories.map((category, i) => {
              const count = toolCountByCategory[category.id] ?? 0;
              const planned = count === 0;
              const featured = category.id === featuredCategory;
              return (
                <Link
                  key={category.id}
                  href={`/categories/${category.id}/`}
                  data-reveal-item
                  className={`group relative flex flex-col justify-between gap-6 overflow-hidden bg-[var(--page)] p-5 transition-colors duration-500 hover:bg-[var(--surface)] ${featured ? "lg:p-7" : ""} ${categoryTone(category.id)}`}
                >
                  <CategoryArt
                    id={category.id}
                    className={`pointer-events-none absolute opacity-[0.18] transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:-right-4 group-hover:opacity-40 ${featured ? "-right-6 -top-8 h-40 w-56" : "-right-6 -top-4 h-24 w-32"}`}
                  />
                  <span className="relative flex items-start justify-between">
                    <span className="flex items-center gap-2.5">
                      <CategoryTile id={category.id} size="md" />
                      <span className="font-mono text-[0.56rem] uppercase tracking-[0.16em] text-[var(--text-subtle)]">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                    </span>
                    <span className="font-mono text-[0.58rem] uppercase tracking-[0.1em] text-[var(--text-subtle)]">
                      {planned ? "Planned" : `${count} tools`}
                    </span>
                  </span>

                  <span className="relative">
                    <span
                      className={
                        featured
                          ? "block font-display text-[clamp(1.9rem,3.4vw,2.7rem)] font-bold leading-[0.95] tracking-[-0.05em] text-[var(--text)]"
                          : "block font-display text-[1.32rem] font-semibold leading-tight tracking-[-0.035em] text-[var(--text)]"
                      }
                    >
                      {category.shortName}
                    </span>
                    <span
                      className={
                        featured
                          ? "mt-2 block max-w-sm text-[0.9rem] leading-relaxed text-[var(--text-muted)]"
                          : "mt-1.5 block text-[0.83rem] leading-relaxed text-[var(--text-muted)]"
                      }
                    >
                      {category.tagline}
                    </span>
                    {featured ? (
                      <span className="mt-4 inline-flex items-center gap-2 rounded-full border border-[var(--border-strong)] px-3 py-1 font-mono text-[0.55rem] uppercase tracking-[0.16em] text-[var(--tint)]">
                        Largest shelf · {count} tools
                      </span>
                    ) : null}
                  </span>

                  <span className="relative flex items-center justify-between">
                    <span className="font-mono text-[0.58rem] uppercase tracking-[0.14em] text-[var(--tint)]">
                      Open shelf
                    </span>
                    <span className="inline-flex size-8 items-center justify-center rounded-full border border-[var(--border)] text-[var(--text-subtle)] transition-all duration-300 group-hover:border-[var(--tint)] group-hover:text-[var(--tint)]">
                      <ArrowUpRight className="size-3.5 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" aria-hidden />
                    </span>
                  </span>
                </Link>
              );
            })}
          </RevealGroup>
        </div>
      </section>

      {/* ── Popular tools ───────────────────────────────────────── */}
      <section className="relative border-y border-[var(--border)] bg-[var(--page-elevated)]">
        <div className="mx-auto max-w-[1180px] px-4 py-16 sm:px-6 sm:py-24">
          <SectionHead
            index="02"
            label="Most used this month"
            title="Start where everyone starts"
            description="The nine tools visitors reach for most often — all instant, all local."
            href="/tools/"
            linkLabel={`All ${liveTools.length} tools`}
          />

          <RevealGroup className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {popularTools.slice(0, 9).map((tool, i) => (
              <div key={tool.slug} data-reveal-item className="min-w-0">
                <ToolCard tool={tool} className="h-full" index={i + 1} />
              </div>
            ))}
          </RevealGroup>

          <Reveal className="mt-8 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-dashed border-[var(--border-strong)] px-5 py-4">
            <p className="text-[0.88rem] text-[var(--text-muted)]">
              Can&rsquo;t find it? The search index covers every tool, alias and tag.
            </p>
            <p className="font-mono text-[0.6rem] uppercase tracking-[0.16em] text-[var(--text-subtle)]">
              Press <kbd className="kbd">⌘</kbd> <kbd className="kbd">K</kbd> anywhere
            </p>
          </Reveal>
        </div>
      </section>

      {/* ── Stats + principles ──────────────────────────────────── */}
      <section className="relative isolate overflow-hidden">
        <Aurora className="-z-10 opacity-60" />
        <div className="mx-auto max-w-[1180px] px-4 py-16 sm:px-6 sm:py-24">
          <div className="grid gap-12 lg:grid-cols-[0.85fr_1.15fr] lg:gap-16">
            <div className="lg:sticky lg:top-24 lg:self-start">
              <Reveal>
                <p className="eyebrow">03 — Why it works</p>
                <h2 className="mt-4 font-display text-[clamp(2rem,4.2vw,3.2rem)] font-bold leading-[0.98] tracking-[-0.05em] text-[var(--text)]">
                  Built like an
                  <br />
                  <span className="serif-accent font-normal text-[var(--accent-text)]">instrument</span>,
                  <br />
                  not a content farm.
                </h2>
                <div className="mt-6 max-w-sm text-[0.98rem] leading-relaxed text-[var(--text-muted)]">
                  <p>
                    Most utility sites ask you to upload a file, create an account or accept three
                    cookie banners before you can count a word.
                  </p>
                  <p className="mt-3">
                    This one keeps{" "}
                    <span className="sr-only">everything local</span>
                    <TextType
                      texts={["everything local", "zero uploads", "instant results", "no accounts"]}
                      className="font-medium text-[var(--text)]"
                    />{" "}
                    — and tells you exactly how each answer is produced.
                  </p>
                </div>
              </Reveal>

              <Reveal delay={0.1} className="mt-9 grid grid-cols-3 gap-px overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--border)]">
                {[
                  { value: liveTools.length, label: "Tools live", suffix: "" },
                  { value: liveCategories.length, label: "Categories", suffix: "" },
                  { value: 0, label: "Uploads", suffix: "" },
                ].map((stat) => (
                  <div key={stat.label} className="bg-[var(--surface)] px-4 py-5">
                    <p className="font-display text-[1.9rem] font-bold leading-none tracking-[-0.05em] text-[var(--text)]">
                      <CountUp end={stat.value} suffix={stat.suffix} />
                    </p>
                    <p className="mt-2 font-mono text-[0.55rem] uppercase tracking-[0.16em] text-[var(--text-subtle)]">
                      {stat.label}
                    </p>
                  </div>
                ))}
              </Reveal>
            </div>

            <div className="grid gap-3">
              {PRINCIPLES.map((item, i) => (
                <Reveal key={item.title} delay={i * 0.08}>
                  <SpotlightCard className="card overflow-hidden p-6">
                    <div className="relative flex items-start gap-4">
                      <span className="cat-tile cat-neutral size-11 shrink-0 text-[var(--accent-text)]">
                        <item.icon className="size-[1.15rem]" aria-hidden />
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-baseline justify-between gap-2">
                          <h3 className="font-display text-[1.12rem] font-semibold tracking-[-0.025em] text-[var(--text)]">
                            {item.title}
                          </h3>
                          <span className="font-mono text-[0.56rem] uppercase tracking-[0.14em] text-[var(--ring)]">
                            {item.meta}
                          </span>
                        </div>
                        <p className="mt-2 text-[0.9rem] leading-relaxed text-[var(--text-muted)]">
                          {item.body}
                        </p>
                      </div>
                      <span className="hidden font-mono text-[0.6rem] tabular-nums text-[var(--text-subtle)]/60 sm:block">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                    </div>
                  </SpotlightCard>
                </Reveal>
              ))}
              <Reveal delay={0.24}>
                <div className="flex items-center gap-2.5 rounded-2xl border border-[var(--border)] bg-[var(--surface)]/60 px-5 py-4">
                  <ShieldCheck className="size-4 shrink-0 text-[var(--ring)]" aria-hidden />
                  <p className="font-mono text-[0.6rem] uppercase tracking-[0.16em] text-[var(--text-muted)]">
                    Every tool covered by automated tests ·{" "}
                    <DecryptedText text="1000+" className="text-[var(--text)]" /> assertions
                  </p>
                </div>
              </Reveal>
            </div>
          </div>
        </div>
      </section>

      {/* ── Recently added + guides ─────────────────────────────── */}
      <section className="border-y border-[var(--border)] bg-[var(--page-elevated)]">
        <div className="mx-auto max-w-[1180px] px-4 py-16 sm:px-6 sm:py-24">
          <SectionHead
            index="04"
            label="Latest releases"
            title="Recently added"
            description="New tools are published once they are tested — never as placeholders."
            href="/roadmap/"
            linkLabel="See the roadmap"
          />
          <RevealGroup className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {recentlyAdded.slice(0, 6).map((tool) => (
              <div key={tool.slug} data-reveal-item className="min-w-0">
                <ToolCard tool={tool} className="h-full" />
              </div>
            ))}
          </RevealGroup>

          <div className="mt-20 grid gap-10 lg:grid-cols-[0.72fr_1.28fr] lg:gap-14">
            <Reveal>
              <p className="eyebrow">05 — Field notes</p>
              <h2 className="mt-3 font-display text-[clamp(1.7rem,3vw,2.3rem)] font-bold leading-[1.02] tracking-[-0.045em] text-[var(--text)]">
                The reasoning,
                <br />
                written down.
              </h2>
              <p className="mt-4 max-w-xs text-[0.92rem] leading-relaxed text-[var(--text-muted)]">
                Short explanations of the maths, standards and conventions behind the tools — so
                you can check the working, not just trust the answer.
              </p>
              <Link href="/guides/" className="link mt-5 inline-flex items-center gap-1.5 text-[0.85rem] font-medium">
                All guides
                <ArrowRight className="size-3.5" aria-hidden />
              </Link>
            </Reveal>

            <div>
              {GUIDES.map((guide, i) => (
                <Reveal key={guide.href} delay={i * 0.06}>
                  <Link
                    href={guide.href}
                    className="group flex items-start gap-5 border-b border-[var(--border)] py-6"
                  >
                    <span className="mt-1 font-mono text-[0.58rem] tabular-nums uppercase tracking-[0.14em] text-[var(--text-subtle)]">
                      {String(i + 1).padStart(2, "0")} / {guide.kicker}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block font-display text-[1.14rem] font-semibold leading-snug tracking-[-0.03em] text-[var(--text)] transition-colors group-hover:text-[var(--accent-text)]">
                        {guide.title}
                      </span>
                      <span className="mt-1.5 block text-[0.87rem] leading-relaxed text-[var(--text-muted)]">
                        {guide.body}
                      </span>
                    </span>
                    <ArrowUpRight
                      className="mt-1 size-4 shrink-0 text-[var(--text-subtle)] transition-all duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-[var(--accent-text)]"
                      aria-hidden
                    />
                  </Link>
                </Reveal>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── FAQ ─────────────────────────────────────────────────── */}
      <section>
        <div className="mx-auto max-w-[1180px] px-4 py-16 sm:px-6 sm:py-24">
          <div className="grid gap-10 lg:grid-cols-[0.78fr_1.22fr] lg:gap-16">
            <div className="lg:sticky lg:top-24 lg:self-start">
              <Reveal>
                <p className="eyebrow">06 — Questions</p>
                <h2 className="mt-3 font-display text-[clamp(1.9rem,4vw,2.8rem)] font-bold leading-[0.98] tracking-[-0.05em] text-[var(--text)]">
                  Answers
                  <br />
                  before you ask
                  <span className="text-[var(--ring)]">.</span>
                </h2>
                <p className="mt-4 max-w-xs text-sm leading-relaxed text-[var(--text-muted)]">
                  Something still unclear? Write to us — a real person reads every message.
                </p>
                <Magnet strength={0.2} padding={0} className="mt-5">
                  <Link
                    href="/contact/"
                    className="inline-flex items-center gap-1.5 rounded-full border border-[var(--border-strong)] px-4 py-2 text-[0.82rem] font-medium text-[var(--text)] transition-colors hover:border-[var(--ring)] hover:text-[var(--accent-text)]"
                  >
                    Contact us
                    <ArrowUpRight className="size-3.5" aria-hidden />
                  </Link>
                </Magnet>
                <div className="mt-10 hidden lg:block">
                  <CircularText
                    text="NO UPLOADS · NO ACCOUNTS · NO WAITING · "
                    size={116}
                    className="text-[var(--text-subtle)]/70"
                  />
                </div>
              </Reveal>
            </div>

            <div className="grid gap-2">
              {SITE_FAQS.map((faq, i) => (
                <Reveal key={faq.q} delay={i * 0.04}>
                  <details className="group rounded-2xl border border-[var(--border)] bg-[var(--surface)] px-5 transition-colors duration-300 hover:border-[var(--border-strong)] open:border-[var(--border-strong)] open:bg-[var(--surface)]">
                    <summary className="flex cursor-pointer list-none items-center gap-3 py-4 [&::-webkit-details-marker]:hidden">
                      <span className="font-mono text-[0.58rem] tabular-nums text-[var(--text-subtle)]">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      <span className="flex-1 font-display text-[1.02rem] font-semibold tracking-[-0.02em] text-[var(--text)]">
                        {faq.q}
                      </span>
                      <span
                        className="flex size-7 shrink-0 items-center justify-center rounded-full border border-[var(--border)] font-mono text-sm leading-none text-[var(--text-subtle)] transition-transform duration-300 group-open:rotate-45 group-open:border-[var(--ring)] group-open:text-[var(--ring)]"
                        aria-hidden
                      >
                        +
                      </span>
                    </summary>
                    <p className="pb-5 pl-8 text-[0.9rem] leading-relaxed text-[var(--text-muted)]">
                      {faq.a}
                    </p>
                  </details>
                </Reveal>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA ─────────────────────────────────────────────────── */}
      <section className="mx-auto max-w-[1180px] px-4 pb-24 sm:px-6">
        <Reveal>
          <div className="relative isolate overflow-hidden rounded-[28px] bg-[var(--text)] px-6 py-14 text-[var(--page)] sm:px-12 sm:py-20">
            <div
              className="pointer-events-none absolute -right-32 -top-32 size-[26rem] rounded-full bg-[var(--ring)] opacity-30 blur-[90px]"
              aria-hidden
            />
            <div
              className="pointer-events-none absolute -bottom-40 left-1/4 size-[22rem] rounded-full bg-[var(--accent-2)] opacity-20 blur-[100px]"
              aria-hidden
            />
            <div className="relative grid items-end gap-10 md:grid-cols-[1.35fr_auto]">
              <div>
                <p className="flex items-center gap-2 font-mono text-[0.6rem] uppercase tracking-[0.22em] text-[var(--page)]/55">
                  <Gauge className="size-3.5" aria-hidden />
                  No account · no newsletter · no nonsense
                </p>
                <h2 className="display mt-5 text-[clamp(2rem,5.4vw,3.6rem)] font-extrabold">
                  Start with the tool
                  <br />
                  <span className="serif-accent font-normal text-[var(--ring)]">you need</span> right now.
                </h2>
                <p className="mt-5 max-w-md text-[0.9rem] leading-relaxed text-[var(--page)]/65">
                  {siteConfig.name} keeps growing — one tested tool at a time. If something is
                  missing, tell us; it may already be on the list.
                </p>
              </div>
              <div className="flex flex-col items-start gap-3 md:items-end">
                <Magnet strength={0.22} padding={0}>
                  <Link
                    href="/tools/"
                    className="group inline-flex items-center gap-2 rounded-full bg-[var(--page)] px-6 py-3.5 text-[0.88rem] font-semibold text-[var(--text)] transition-colors duration-300 hover:bg-[var(--ring)] hover:text-white"
                  >
                    Browse all tools
                    <ArrowRight className="size-4 transition-transform duration-300 group-hover:translate-x-1" aria-hidden />
                  </Link>
                </Magnet>
                <Link
                  href="/roadmap/"
                  className="inline-flex items-center gap-2 rounded-full border border-[var(--page)]/25 px-6 py-3.5 text-[0.88rem] font-semibold text-[var(--page)] transition-colors duration-300 hover:border-[var(--page)]/70"
                >
                  View the roadmap
                </Link>
                <p className="mt-2 font-mono text-[0.56rem] uppercase tracking-[0.18em] text-[var(--page)]/40">
                  {liveTools.length} tools · updated weekly
                </p>
              </div>
            </div>
          </div>
        </Reveal>
      </section>
    </>
  );
}

function SectionHead({
  index,
  label,
  title,
  description,
  href,
  linkLabel,
}: {
  index?: string;
  label: string;
  title: string;
  description?: string;
  href: string;
  linkLabel: string;
}) {
  return (
    <Reveal className="flex flex-wrap items-end justify-between gap-6">
      <div>
        <p className="flex items-center gap-2.5 font-mono text-[0.58rem] uppercase tracking-[0.2em] text-[var(--text-subtle)]">
          {index ? (
            <>
              <span className="text-[var(--ring)]">{index}</span>
              <span className="h-px w-6 bg-[var(--border-strong)]" aria-hidden />
            </>
          ) : null}
          {label}
        </p>
        <h2 className="mt-3 max-w-xl font-display text-[clamp(1.7rem,3.4vw,2.5rem)] font-bold leading-[1.02] tracking-[-0.045em] text-[var(--text)]">
          {title}
        </h2>
        {description ? (
          <p className="mt-3 max-w-md text-[0.92rem] leading-relaxed text-[var(--text-muted)]">
            {description}
          </p>
        ) : null}
      </div>
      <Link
        href={href}
        className="group inline-flex items-center gap-2 rounded-full border border-[var(--border)] bg-[var(--surface)]/70 px-4 py-2 text-[0.8rem] font-medium text-[var(--text)] backdrop-blur transition-colors duration-300 hover:border-[var(--ring)]/50"
      >
        {linkLabel}
        <ArrowRight className="size-3.5 transition-transform duration-300 group-hover:translate-x-1" aria-hidden />
      </Link>
    </Reveal>
  );
}
