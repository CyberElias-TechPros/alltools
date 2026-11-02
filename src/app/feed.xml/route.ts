import { guides } from "@/lib/guides";
import { siteConfig } from "@/lib/site";

export const dynamic = "force-static";

const escape = (value: string) =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

function toRfc822(date: string): string {
  const parsed = new Date(date);
  return Number.isNaN(parsed.getTime())
    ? new Date().toUTCString()
    : parsed.toUTCString();
}

/** RSS 2.0 feed of the guides, so readers and crawlers can subscribe. */
export function GET() {
  const items = guides
    .map(
      (guide) => `    <item>
      <title>${escape(guide.title)}</title>
      <link>${siteConfig.url}/guides/${guide.slug}/</link>
      <guid isPermaLink="true">${siteConfig.url}/guides/${guide.slug}/</guid>
      <pubDate>${toRfc822(guide.updated)}</pubDate>
      <description>${escape(guide.description)}</description>
    </item>`,
    )
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escape(siteConfig.name)} — guides</title>
    <link>${siteConfig.url}/guides/</link>
    <description>${escape(siteConfig.description)}</description>
    <language>en</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="${siteConfig.url}/feed.xml" rel="self" type="application/rss+xml" />
${items}
  </channel>
</rss>`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
    },
  });
}
