import type { Metadata } from "next";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { ToolsDirectory } from "@/components/tools-directory";
import { JsonLd } from "@/components/json-ld";
import { categories } from "@/lib/tools/categories";
import { liveTools } from "@/lib/tools/registry";
import { siteConfig } from "@/lib/site";

export const metadata: Metadata = {
  title: "All Tools — Free Online Utilities",
  description: `Browse all ${liveTools.length} free online tools on Toolora: text tools, calculators, developer utilities, converters and SEO helpers. No sign-up required.`,
  alternates: { canonical: "/tools/" },
};

export default function ToolsPage() {
  const itemList = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "All Toolora tools",
    numberOfItems: liveTools.length,
    itemListElement: liveTools.map((tool, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: tool.name,
      url: `${siteConfig.url}/tools/${tool.slug}/`,
    })),
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <JsonLd data={itemList} />
      <Breadcrumbs items={[{ href: "/tools/", label: "All tools" }]} />
      <h1 className="text-3xl font-bold tracking-[-0.03em] text-[var(--text)] sm:text-[2.35rem]">
        All tools
      </h1>
      <p className="mt-2 max-w-2xl text-[0.98rem] leading-relaxed text-[var(--text-muted)]">
        {liveTools.length} working tools, every one free and processed in your browser. Filter by
        category or search for the task you need — nothing here is a placeholder.
      </p>

      <div className="mt-7">
        <ToolsDirectory tools={liveTools} categories={categories} />
      </div>
    </div>
  );
}
