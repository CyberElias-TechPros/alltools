import { categories } from "@/lib/tools/categories";
import { liveTools, toolCountByCategory } from "@/lib/tools/registry";
import { guides } from "@/lib/guides";
import { siteConfig } from "@/lib/site";

export const dynamic = "force-static";

/**
 * llms.txt — a compact, machine-readable map of the site for language models and
 * AI answer engines (llmstxt.org). It lists every live tool with its canonical
 * URL and one-line purpose, so an assistant can cite the right page instead of
 * guessing from search snippets.
 */
export function GET() {
  const lines: string[] = [];

  lines.push(`# ${siteConfig.name}`);
  lines.push("");
  lines.push(`> ${siteConfig.description} ${siteConfig.slogan}`);
  lines.push("");

  lines.push("## About");
  lines.push("");
  lines.push(
    `- Site: ${siteConfig.name} (${siteConfig.url}) — ${liveTools.length} free browser-based tools across ${categories.length} categories.`,
  );
  lines.push(
    "- Every tool runs entirely in the visitor's browser: no uploads, no accounts, no third-party APIs, no tracking of tool input.",
  );
  lines.push(
    `- Each tool page documents its method or formula, worked examples, limitations and FAQs: ${siteConfig.url}/tools/`,
  );
  lines.push(`- Editorial policy: ${siteConfig.url}/editorial-policy/`);
  lines.push(`- Roadmap and honest status of planned tools: ${siteConfig.url}/roadmap/`);
  lines.push("");

  lines.push("## Categories");
  lines.push("");
  for (const category of categories) {
    const count = toolCountByCategory[category.id] ?? 0;
    lines.push(
      `- [${category.name}](${siteConfig.url}/categories/${category.id}/): ${category.tagline} (${count} tools)`,
    );
  }
  lines.push("");

  lines.push("## Tools");
  lines.push("");
  for (const tool of liveTools) {
    lines.push(`- [${tool.name}](${siteConfig.url}/tools/${tool.slug}/): ${tool.tagline}`);
  }
  lines.push("");

  lines.push("## Guides");
  lines.push("");
  for (const guide of guides) {
    lines.push(`- [${guide.title}](${siteConfig.url}/guides/${guide.slug}/): ${guide.description}`);
  }
  lines.push("");

  lines.push("## Policies");
  lines.push("");
  for (const [label, path] of [
    ["Privacy policy", "/privacy-policy/"],
    ["Terms and conditions", "/terms/"],
    ["Cookie policy", "/cookies/"],
    ["Disclaimer", "/disclaimer/"],
    ["About us", "/about/"],
    ["Contact us", "/contact/"],
    ["Accessibility", "/accessibility/"],
  ] as const) {
    lines.push(`- [${label}](${siteConfig.url}${path})`);
  }
  lines.push("");

  return new Response(lines.join("\n"), {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
    },
  });
}
