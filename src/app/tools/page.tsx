import type { Metadata } from "next";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { HeaderStat, PageHeader } from "@/components/page-header";
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
    </div>
  );
}
