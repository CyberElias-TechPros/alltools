import { textTools } from "./data/text";
import { textMoreTools } from "./data/text-more";
import { calculatorTools } from "./data/calculators";
import { calculatorMoreTools } from "./data/calculators-more";
import { financeTools } from "./data/finance";
import { financeMoreTools } from "./data/finance-more";
import { developerTools } from "./data/developer";
import { developerMoreTools } from "./data/developer-more";
import { everydayTools } from "./data/everyday";
import { seoTools } from "./data/seo";
import { securityTools } from "./data/security";
import { securityMoreTools } from "./data/security-more";
import { imageTools } from "./data/images";
import { pdfTools } from "./data/pdf";
import { internetTools } from "./data/internet";
import { seoMoreTools } from "./data/seo-more";
import { educationTools } from "./data/education";
import { everydayMoreTools } from "./data/everyday-more";
import type { CategoryId, ToolDefinition } from "./types";
import type { SearchableTool } from "@/lib/search";

export const tools: ToolDefinition[] = [
  ...textTools,
  ...textMoreTools,
  ...calculatorTools,
  ...calculatorMoreTools,
  ...financeTools,
  ...financeMoreTools,
  ...developerTools,
  ...developerMoreTools,
  ...everydayTools,
  ...seoTools,
  ...securityTools,
  ...securityMoreTools,
  ...imageTools,
  ...pdfTools,
  ...internetTools,
  ...seoMoreTools,
  ...educationTools,
  ...everydayMoreTools,
].sort((a, b) => a.name.localeCompare(b.name));

export const toolMap = new Map<string, ToolDefinition>(tools.map((tool) => [tool.slug, tool]));

export function getTool(slug: string): ToolDefinition | undefined {
  return toolMap.get(slug);
}

export function requireTool(slug: string): ToolDefinition {
  const tool = toolMap.get(slug);
  if (!tool) throw new Error(`Unknown tool: ${slug}`);
  return tool;
}

export const liveTools = tools.filter((tool) => tool.status === "live");

export function toolsByCategory(category: CategoryId): ToolDefinition[] {
  return tools.filter((tool) => tool.category === category && tool.status === "live");
}

export const popularTools = [...liveTools]
  .sort((a, b) => b.popularity - a.popularity)
  .slice(0, 8);

export const recentlyAdded = [...liveTools]
  .sort((a, b) => b.addedAt.localeCompare(a.addedAt))
  .slice(0, 6);

/** Compact, serialisable index passed to client search components. */
export const searchIndex: SearchableTool[] = liveTools.map((tool) => ({
  slug: tool.slug,
  name: tool.name,
  tagline: tool.tagline,
  category: tool.category,
  keywords: tool.keywords,
  popularity: tool.popularity,
}));

/** Slug → related tools, used in the template's "Related tools" block. */
export function relatedTools(slug: string, limit = 4): ToolDefinition[] {
  const tool = toolMap.get(slug);
  if (!tool) return [];
  const sameCategory = liveTools.filter(
    (candidate) => candidate.category === tool.category && candidate.slug !== slug,
  );
  const others = liveTools.filter(
    (candidate) => candidate.category !== tool.category && candidate.slug !== slug,
  );
  return [...sameCategory, ...others].slice(0, limit);
}

export const toolCountByCategory = tools.reduce<Record<string, number>>((acc, tool) => {
  if (tool.status === "live") {
    acc[tool.category] = (acc[tool.category] ?? 0) + 1;
  }
  return acc;
}, {});

/**
 * Structural validation used by the test suite and the build.
 * It catches the mistakes that quietly turn a good tool page into a thin one.
 */
export function validateToolCatalogue(): string[] {
  const problems: string[] = [];
  const seen = new Set<string>();

  for (const tool of tools) {
    if (seen.has(tool.slug)) problems.push(`Duplicate slug: ${tool.slug}`);
    seen.add(tool.slug);

    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(tool.slug)) {
      problems.push(`Slug is not URL-safe: ${tool.slug}`);
    }
    if (tool.tagline.length < 20) problems.push(`Tagline too short: ${tool.slug}`);
    if (tool.seoTitle.length > 65) problems.push(`SEO title too long (${tool.seoTitle.length}): ${tool.slug}`);
    if (tool.seoDescription.length < 70 || tool.seoDescription.length > 175) {
      problems.push(`SEO description length ${tool.seoDescription.length}: ${tool.slug}`);
    }
    if (tool.keywords.length < 3) problems.push(`Too few keywords: ${tool.slug}`);
    if (tool.content.intro.length < 1) problems.push(`Missing intro: ${tool.slug}`);
    if (tool.content.howTo.length < 3) problems.push(`Too few instructions: ${tool.slug}`);
    // Planned tools have no interface to exercise, so one worked example and two
    // FAQs are enough to explain the gap honestly. Live tools need the full set.
    const minimumExamples = tool.status === "live" ? 2 : 1;
    const minimumFaqs = tool.status === "live" ? 3 : 2;
    if (tool.content.examples.length < minimumExamples) problems.push(`Too few examples: ${tool.slug}`);
    if (tool.content.limitations.length < 2) problems.push(`Too few limitations: ${tool.slug}`);
    if (tool.content.faqs.length < minimumFaqs) problems.push(`Too few FAQs: ${tool.slug}`);
  }

  return problems;
}
