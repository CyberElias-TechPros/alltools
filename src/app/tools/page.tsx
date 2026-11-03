import type { Metadata } from "next";
import Link from "next/link";
import { pageMetadata } from "@/lib/seo";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { HeaderStat, PageHeader } from "@/components/page-header";
import { ToolsDirectory } from "@/components/tools-directory";
import { JsonLd } from "@/components/json-ld";
import { categories } from "@/lib/tools/categories";
import { liveTools } from "@/lib/tools/registry";
import { siteConfig } from "@/lib/site";

export const metadata: Metadata = pageMetadata({
  title: "All Tools — A to Z Directory",
  description: `Browse all ${liveTools.length} free online tools:  text tools, calculators, developer utilities, converters and SEO helpers. No sign-up required.`,
  path: "/tools/",
  keywords: ['all tools', 'tool directory', 'free online tools', 'a to z tools'],
});

const POPULAR_SEARCHES = [
  { label: "word counter", href: "/tools/word-counter/" },
  { label: "character counter", href: "/tools/character-counter/" },
  { label: "percentage calculator", href: "/tools/percentage-calculator/" },
  { label: "age calculator", href: "/tools/age-calculator/" },
  { label: "unit converter", href: "/tools/unit-converter/" },
  { label: "JSON formatter", href: "/tools/json-formatter/" },
  { label: "password generator", href: "/tools/password-generator/" },
  { label: "QR code generator", href: "/tools/qr-code-generator/" },
  { label: "image compressor", href: "/tools/image-compressor/" },
  { label: "image resizer", href: "/tools/image-resizer/" },
  { label: "PDF merger", href: "/tools/pdf-merger/" },
  { label: "PDF to JPG", href: "/tools/pdf-to-jpg-converter/" },
  { label: "base64 encoder", href: "/tools/base64-encoder-decoder/" },
  { label: "color picker", href: "/tools/image-color-picker/" },
  { label: "time zone converter", href: "/tools/time-zone-converter/" },
  { label: "meta tag generator", href: "/tools/meta-tag-generator/" },
  { label: "age difference", href: "/tools/date-difference-calculator/" },
  { label: "loan calculator", href: "/tools/loan-calculator/" },
];

export default function ToolsPage() {
  const itemList = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "All tools",
    numberOfItems: liveTools.length,
    itemListElement: liveTools.map((tool, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: tool.name,
      url: `${siteConfig.url}/tools/${tool.slug}/`,
    })),
  };

  return (
    <div className="mx-auto max-w-6xl px-4 pb-16 pt-8 sm:px-6">
      <JsonLd data={itemList} />
      <Breadcrumbs items={[{ href: "/tools/", label: "All tools" }]} />

      <PageHeader
        label="The index"
        title={
          <>
            Every tool,
            <br />
            one page away<span className="text-[var(--accent-text)]">.</span>
          </>
        }
        lede={`${liveTools.length} working tools, every one free and processed in your browser. Filter by category or search for the task you need — nothing here is a placeholder.`}
        meta={
          <div>
            <HeaderStat label="Tools live" value={String(liveTools.length)} />
            <HeaderStat
              label="Categories"
              value={String(categories.filter((item) => item.status === "live").length)}
            />
            <HeaderStat label="Uploads" value="0" />
          </div>
        }
      />

      <div className="mt-8">
        <ToolsDirectory tools={liveTools} categories={categories} />
      </div>

      <section className="mt-14 border-t border-[var(--border)] pt-8">
        <h2 className="font-display text-[1.4rem] font-bold tracking-[-0.03em] text-[var(--text)]">
          Popular searches
        </h2>
        <p className="mt-1.5 max-w-xl text-sm text-[var(--text-muted)]">
          The tasks visitors look for most often, linked straight to the tool that answers them.
        </p>
        <ul className="mt-4 flex flex-wrap gap-2">
          {POPULAR_SEARCHES.map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                className="inline-flex items-center rounded-full border border-[var(--border)] bg-[var(--surface)] px-3.5 py-2 text-[0.82rem] text-[var(--text-muted)] transition-colors hover:border-[var(--border-strong)] hover:text-[var(--text)]"
              >
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
