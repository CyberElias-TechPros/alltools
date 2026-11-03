/**
 * SEO analysis helpers that work on pasted sources: HTML, robots.txt,
 * sitemap XML, keyword lists and plain prose.
 *
 * None of these fetch anything. Where a check truly needs the live web
 * (broken-link crawling, page weight of assets) the catalogue says so instead
 * of guessing.
 */

import { extractHead } from "./tags";

/* ------------------------------------------------------------------ */
/* Readability                                                         */
/* ------------------------------------------------------------------ */

const VOWELS = /[aeiouy]+/g;

export function countSyllables(word: string): number {
  const clean = word.toLowerCase().replace(/[^a-z]/g, "");
  if (!clean) return 0;
  if (clean.length <= 3) return 1;
  const trimmed = clean
    .replace(/(?:[^laeiouy]es|ed|[^laeiouy]e)$/, "")
    .replace(/^y/, "");
  const groups = trimmed.match(VOWELS);
  return Math.max(1, groups ? groups.length : 1);
}

export interface SentenceSplit {
  sentences: string[];
  words: number;
  syllables: number;
  longWords: number;
  complexWords: number;
}

export function splitSentences(text: string): SentenceSplit {
  const clean = text.replace(/\s+/g, " ").trim();
  if (!clean) return { sentences: [], words: 0, syllables: 0, longWords: 0, complexWords: 0 };

  const sentences = clean
    .split(/(?<=[.!?])\s+(?=[A-Z0-9"'(])/)
    .map((sentence) => sentence.trim())
    .filter(Boolean);

  const words = clean.split(/\s+/).filter((word) => /[a-zA-Z0-9]/.test(word));
  let syllables = 0;
  let longWords = 0;
  let complexWords = 0;

  for (const word of words) {
    const count = countSyllables(word);
    syllables += count;
    if (word.replace(/[^a-zA-Z]/g, "").length >= 7) longWords += 1;
    if (count >= 3) complexWords += 1;
  }

  return { sentences, words: words.length, syllables, longWords, complexWords };
}

export interface ReadabilityScores {
  words: number;
  sentences: number;
  syllables: number;
  avgWordsPerSentence: number;
  avgSyllablesPerWord: number;
  fleschReadingEase: number;
  fleschKincaidGrade: number;
  gunningFog: number;
  smog: number;
  automatedReadability: number;
  verdict: string;
}

export function readability(text: string): ReadabilityScores {
  const { sentences, words, syllables, complexWords } = splitSentences(text);
  const sentenceCount = Math.max(1, sentences.length);
  const wordCount = Math.max(1, words);
  const avgWordsPerSentence = words / sentenceCount;
  const avgSyllablesPerWord = syllables / wordCount;

  const fleschReadingEase = 206.835 - 1.015 * avgWordsPerSentence - 84.6 * avgSyllablesPerWord;
  const fleschKincaidGrade = 0.39 * avgWordsPerSentence + 11.8 * avgSyllablesPerWord - 15.59;
  const gunningFog = 0.4 * (avgWordsPerSentence + 100 * (complexWords / wordCount));
  const smog = 1.043 * Math.sqrt(complexWords * (30 / sentenceCount)) + 3.1291;
  const letters = text.replace(/[^a-zA-Z]/g, "").length;
  const automatedReadability = 4.71 * (letters / wordCount) + 0.5 * avgWordsPerSentence - 21.43;

  const clamped = Math.max(0, Math.min(100, fleschReadingEase));
  const verdict =
    clamped >= 80
      ? "Very easy — around 6th grade"
      : clamped >= 70
        ? "Easy — around 7th grade"
        : clamped >= 60
          ? "Plain English — 8th to 9th grade"
          : clamped >= 50
            ? "Fairly difficult — 10th to 12th grade"
            : clamped >= 30
              ? "Difficult — university level"
              : "Very difficult — specialist reading";

  return {
    words,
    sentences: sentences.length,
    syllables,
    avgWordsPerSentence: round(avgWordsPerSentence),
    avgSyllablesPerWord: round(avgSyllablesPerWord),
    fleschReadingEase: round(clamped),
    fleschKincaidGrade: round(Math.max(0, fleschKincaidGrade)),
    gunningFog: round(Math.max(0, gunningFog)),
    smog: round(Math.max(0, smog)),
    automatedReadability: round(Math.max(0, automatedReadability)),
    verdict,
  };
}

function round(value: number): number {
  return Math.round(value * 10) / 10;
}

/* ------------------------------------------------------------------ */
/* Keyword density and clustering                                      */
/* ------------------------------------------------------------------ */

const STOP_WORDS = new Set(
  "a an and are as at be but by for from has have he her his i if in into is it its of on or our she that the their them then there these they this to was we were what when where which who will with you your".split(
    " ",
  ),
);

export interface FrequencyRow {
  term: string;
  count: number;
  density: number;
}

export function wordFrequency(text: string, limit = 25, minLength = 3): FrequencyRow[] {
  const words = text.toLowerCase().match(/[a-z0-9'’-]+/g) ?? [];
  const counts = new Map<string, number>();
  let total = 0;
  for (const word of words) {
    const clean = word.replace(/^['’-]+|['’-]+$/g, "");
    if (clean.length < minLength || STOP_WORDS.has(clean)) continue;
    counts.set(clean, (counts.get(clean) ?? 0) + 1);
    total += 1;
  }
  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .slice(0, limit)
    .map(([term, count]) => ({ term, count, density: total ? (count / total) * 100 : 0 }));
}

export function keywordDensity(text: string, keyword: string): { count: number; density: number; words: number } {
  const words = text.toLowerCase().match(/[a-z0-9'’-]+/g) ?? [];
  const target = keyword.trim().toLowerCase();
  if (!target) return { count: 0, density: 0, words: words.length };
  const parts = target.split(/\s+/);
  let count = 0;
  if (parts.length === 1) {
    count = words.filter((word) => word === target).length;
  } else {
    const joined = ` ${words.join(" ")} `;
    let index = joined.indexOf(` ${target} `);
    while (index !== -1) {
      count += 1;
      index = joined.indexOf(` ${target} `, index + 1);
    }
  }
  return { count, density: words.length ? (count * parts.length / words.length) * 100 : 0, words: words.length };
}

export interface KeywordCluster {
  label: string;
  keywords: string[];
}

/** Groups keywords that share a significant word, largest clusters first. */
export function clusterKeywords(input: string, minCluster = 2): { clusters: KeywordCluster[]; ungrouped: string[] } {
  const keywords = [...new Set(
    input
      .split(/\n|,/)
      .map((line) => line.trim().toLowerCase())
      .filter(Boolean),
  )];

  const groups = new Map<string, string[]>();
  for (const keyword of keywords) {
    const tokens = keyword.split(/\s+/).filter((token) => token.length > 2 && !STOP_WORDS.has(token));
    for (const token of tokens) {
      const list = groups.get(token) ?? [];
      list.push(keyword);
      groups.set(token, list);
    }
  }

  const used = new Set<string>();
  const clusters: KeywordCluster[] = [];
  const ranked = [...groups.entries()].sort((a, b) => b[1].length - a[1].length);

  for (const [token, members] of ranked) {
    const fresh = members.filter((member) => !used.has(member));
    if (fresh.length < minCluster) continue;
    fresh.forEach((member) => used.add(member));
    clusters.push({ label: token, keywords: fresh.sort() });
  }

  return {
    clusters,
    ungrouped: keywords.filter((keyword) => !used.has(keyword)).sort(),
  };
}

/* ------------------------------------------------------------------ */
/* HTML structure: headings, images, links, size                       */
/* ------------------------------------------------------------------ */

export interface HeadingNode {
  level: number;
  text: string;
  index: number;
}

export interface HeadingReport {
  headings: HeadingNode[];
  counts: Record<number, number>;
  issues: string[];
}

export function analyseHeadings(html: string): HeadingReport {
  const headings: HeadingNode[] = [];
  const counts: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0 };
  const pattern = /<h([1-6])\b[^>]*>([\s\S]*?)<\/h\1>/gi;
  let match: RegExpExecArray | null;
  while ((match = pattern.exec(html)) !== null) {
    const level = Number(match[1]);
    const text = match[2]
      .replace(/<[^>]+>/g, " ")
      .replace(/\s+/g, " ")
      .trim();
    counts[level] += 1;
    headings.push({ level, text, index: headings.length });
  }

  const issues: string[] = [];
  if (counts[1] === 0) issues.push("There is no H1. Every page needs one clear top-level heading.");
  if (counts[1] > 1) issues.push(`There are ${counts[1]} H1 elements. Use one; the rest should be H2.`);
  for (let index = 1; index < headings.length; index += 1) {
    const previous = headings[index - 1];
    const current = headings[index];
    if (current.level - previous.level > 1) {
      issues.push(`“${current.text.slice(0, 40)}” jumps from H${previous.level} to H${current.level}.`);
    }
  }
  const empty = headings.filter((heading) => heading.text.length === 0).length;
  if (empty) issues.push(`${empty} heading(s) are empty.`);

  return { headings, counts, issues };
}

export interface ImageAltReport {
  total: number;
  missing: Array<{ src: string }>;
  decorative: number;
  long: Array<{ src: string; length: number }>;
  lazy: number;
}

export function analyseImageAlts(html: string): ImageAltReport {
  const images = [...html.matchAll(/<img\b[^>]*>/gi)].map((match) => match[0]);
  const missing: Array<{ src: string }> = [];
  const long: Array<{ src: string; length: number }> = [];
  let decorative = 0;
  let lazy = 0;

  for (const tag of images) {
    const alt = /\balt\s*=\s*("([^"]*)"|'([^']*)')/i.exec(tag);
    const src = /\bsrc\s*=\s*("([^"]*)"|'([^']*)')/i.exec(tag)?.[2] ?? "";
    if (/\bloading\s*=\s*["']lazy["']/i.test(tag)) lazy += 1;
    if (!alt) {
      missing.push({ src });
      continue;
    }
    const value = alt[2] ?? alt[3] ?? "";
    if (value.trim() === "") decorative += 1;
    else if (value.length > 125) long.push({ src, length: value.length });
  }

  return { total: images.length, missing, decorative, long, lazy };
}

export interface LinkReport {
  total: number;
  internal: number;
  external: number;
  nofollow: number;
  duplicateHrefs: Array<{ href: string; count: number }>;
  emptyAnchor: number;
  genericAnchor: number;
}

const GENERIC_ANCHORS = new Set(["click here", "here", "read more", "more", "this", "link", "learn more"]);

export function analyseLinks(html: string, siteHost = ""): LinkReport {
  let internal = 0;
  let external = 0;
  let nofollow = 0;
  let emptyAnchor = 0;
  let genericAnchor = 0;
  const hrefCounts = new Map<string, number>();

  const anchorPattern = /<a\b([^>]*)>([\s\S]*?)<\/a>/gi;
  let match: RegExpExecArray | null;
  while ((match = anchorPattern.exec(html)) !== null) {
    const attributes = match[1];
    const text = match[2].replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
    const href = /\bhref\s*=\s*("([^"]*)"|'([^']*)')/i.exec(attributes)?.[2] ?? "";
    if (!href) {
      emptyAnchor += 1;
      continue;
    }
    hrefCounts.set(href, (hrefCounts.get(href) ?? 0) + 1);
    if (/\brel\s*=\s*["'][^"']*nofollow/i.test(attributes)) nofollow += 1;
    const isAbsolute = /^https?:\/\//i.test(href);
    if (isAbsolute) {
      try {
        const host = new URL(href).hostname;
        if (siteHost && host === siteHost.replace(/^www\./, "")) internal += 1;
        else external += 1;
      } catch {
        external += 1;
      }
    } else if (!href.startsWith("#") && !href.startsWith("mailto:") && !href.startsWith("tel:")) {
      internal += 1;
    }
    if (GENERIC_ANCHORS.has(text.toLowerCase())) genericAnchor += 1;
  }

  const duplicateHrefs = [...hrefCounts.entries()]
    .filter(([href, count]) => count > 1 && href !== "#" && !href.startsWith("#"))
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([href, count]) => ({ href, count }));

  return {
    total: [...hrefCounts.values()].reduce((sum, count) => sum + count, 0),
    internal,
    external,
    nofollow,
    duplicateHrefs,
    emptyAnchor,
    genericAnchor,
  };
}

export interface PageSizeReport {
  bytes: number;
  inlineScripts: number;
  inlineStyles: number;
  externalScripts: number;
  externalStyles: number;
  images: number;
  largestInline: number;
}

export function analysePageSource(html: string): PageSizeReport {
  const bytes = new TextEncoder().encode(html).length;
  const scripts = [...html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi)];
  const styles = [...html.matchAll(/<style\b[^>]*>([\s\S]*?)<\/style>/gi)];
  const externalScripts = scripts.filter((match) => /\bsrc\s*=/i.test(match[1])).length;
  const inlineScriptSizes = scripts
    .filter((match) => !/\bsrc\s*=/i.test(match[1]))
    .map((match) => new TextEncoder().encode(match[2]).length);
  const inlineStyleSizes = styles.map((match) => new TextEncoder().encode(match[1]).length);

  return {
    bytes,
    inlineScripts: inlineScriptSizes.length,
    inlineStyles: styles.length,
    externalScripts,
    externalStyles: [...html.matchAll(/<link\b[^>]*rel\s*=\s*["']stylesheet["'][^>]*>/gi)].length,
    images: [...html.matchAll(/<img\b/gi)].length,
    largestInline: Math.max(0, ...inlineScriptSizes, ...inlineStyleSizes),
  };
}

/* ------------------------------------------------------------------ */
/* robots.txt                                                          */
/* ------------------------------------------------------------------ */

interface RobotsGroup {
  agents: string[];
  rules: Array<{ type: "allow" | "disallow"; path: string }>;
  crawlDelay?: string;
  sitemaps: string[];
}

export interface RobotsParse {
  groups: RobotsGroup[];
  sitemaps: string[];
  issues: string[];
  lineCount: number;
}

export function parseRobots(text: string): RobotsParse {
  const groups: RobotsGroup[] = [];
  const sitemaps: string[] = [];
  const issues: string[] = [];
  let current: RobotsGroup | null = null;
  let lastWasUserAgent = false;

  const lines = text.split(/\r?\n/);
  lines.forEach((raw, index) => {
    const line = raw.replace(/#.*$/, "").trim();
    if (!line) return;
    const separator = line.indexOf(":");
    if (separator === -1) {
      issues.push(`Line ${index + 1} has no colon: “${line}”.`);
      return;
    }
    const key = line.slice(0, separator).trim().toLowerCase();
    const value = line.slice(separator + 1).trim();

    if (key === "user-agent") {
      if (!value) issues.push(`Line ${index + 1} has an empty User-agent value.`);
      if (!current || !lastWasUserAgent) {
        current = { agents: [], rules: [], sitemaps: [] };
        groups.push(current);
      }
      current.agents.push(value || "*");
      lastWasUserAgent = true;
      return;
    }

    lastWasUserAgent = false;
    if (key === "sitemap") {
      sitemaps.push(value);
      if (!/^https?:\/\//i.test(value)) issues.push(`Sitemap URL on line ${index + 1} should be absolute.`);
      return;
    }

    if (!current) {
      issues.push(`Line ${index + 1} (${key}) appears before any User-agent group.`);
      return;
    }

    if (key === "allow" || key === "disallow") {
      if (value === "" && key === "disallow") {
        // An empty Disallow means "allow everything" — valid but worth noting.
        current.rules.push({ type: key, path: "" });
        return;
      }
      if (!value.startsWith("/")) issues.push(`Line ${index + 1}: paths should start with “/”.`);
      current.rules.push({ type: key, path: value });
      return;
    }

    if (key === "crawl-delay") {
      current.crawlDelay = value;
      if (!/^\d+(\.\d+)?$/.test(value)) issues.push(`Line ${index + 1}: crawl-delay should be a number.`);
      return;
    }

    if (key === "user-agent-") return;
    issues.push(`Line ${index + 1}: unknown directive “${key}”.`);
  });

  if (!groups.length) issues.push("No User-agent group was found — crawlers will treat the file as empty.");

  return { groups, sitemaps, issues, lineCount: lines.length };
}

function robotsMatch(pattern: string, path: string): boolean {
  if (pattern === "") return false;
  // robots.txt supports * as a wildcard and $ as an end anchor.
  const anchored = pattern.endsWith("$");
  const body = anchored ? pattern.slice(0, -1) : pattern;
  const escaped = body
    .replace(/[.+^${}()|[\]\\]/g, "\\$&")
    .replace(/\*/g, ".*");
  return new RegExp(`^${escaped}${anchored ? "$" : ""}`).test(path);
}

export interface RobotsTest {
  allowed: boolean;
  matchedRule?: { type: "allow" | "disallow"; path: string };
  group?: string;
  notes: string[];
  issue?: string;
}

export function testRobots(text: string, path: string, userAgent = "*"): RobotsTest {
  const parsed = parseRobots(text);
  const notes: string[] = [];
  let cleanPath = path.trim();
  try {
    if (/^https?:\/\//i.test(cleanPath)) cleanPath = new URL(cleanPath).pathname + new URL(cleanPath).search;
  } catch {
    return { allowed: true, notes, issue: "That is not a valid URL or path." };
  }
  if (!cleanPath.startsWith("/")) cleanPath = `/${cleanPath}`;

  const agentToken = userAgent.toLowerCase().split(/[/\s]/)[0];
  const applicable =
    parsed.groups.find((group) =>
      group.agents.some((agent) => agent !== "*" && agent.toLowerCase().includes(agentToken)),
    ) ?? parsed.groups.find((group) => group.agents.includes("*"));

  if (!applicable) {
    return { allowed: true, notes: ["No matching group and no wildcard group, so everything is allowed."] };
  }

  let best: { type: "allow" | "disallow"; path: string } | undefined;
  for (const rule of applicable.rules) {
    if (robotsMatch(rule.path, cleanPath)) {
      // Longest match wins; Allow wins ties.
      if (
        !best ||
        rule.path.length > best.path.length ||
        (rule.path.length === best.path.length && rule.type === "allow")
      ) {
        best = rule;
      }
    }
  }

  if (!best) notes.push("No Disallow rule matched, so the path is allowed.");
  if (best?.type === "disallow" && best.path === "") {
    return { allowed: true, notes: ["An empty Disallow means everything is allowed."], group: applicable.agents.join(", ") };
  }

  return {
    allowed: best ? best.type === "allow" : true,
    matchedRule: best,
    group: applicable.agents.join(", "),
    notes,
  };
}

/* ------------------------------------------------------------------ */
/* Sitemap validation                                                  */
/* ------------------------------------------------------------------ */

export interface SitemapIssue {
  level: "error" | "warning";
  message: string;
}

export function validateSitemap(xml: string): { valid: boolean; urlCount: number; issues: SitemapIssue[]; urls: string[] } {
  const issues: SitemapIssue[] = [];
  const urls = [...xml.matchAll(/<loc>\s*([\s\S]*?)\s*<\/loc>/gi)].map((match) =>
    match[1].replace(/&amp;/g, "&").trim(),
  );

  if (!/<urlset\b/i.test(xml)) issues.push({ level: "error", message: "No <urlset> root element was found." });
  if (!/xmlns\s*=\s*["']http:\/\/www\.sitemaps\.org\/schemas\/sitemap\/0\.9["']/i.test(xml)) {
    issues.push({ level: "error", message: "The sitemap namespace is missing or wrong." });
  }
  if (!xml.trimStart().startsWith("<?xml")) {
    issues.push({ level: "warning", message: "The file does not start with an XML declaration." });
  }
  if (urls.length === 0) issues.push({ level: "error", message: "No <loc> entries were found." });
  if (urls.length > 50_000) issues.push({ level: "error", message: "More than 50,000 URLs — split the file." });

  const seen = new Set<string>();
  for (const url of urls) {
    if (!/^https?:\/\//i.test(url)) {
      issues.push({ level: "error", message: `Not absolute: ${url}` });
      continue;
    }
    if (seen.has(url)) issues.push({ level: "warning", message: `Duplicate URL: ${url}` });
    seen.add(url);
    if (/#/.test(url)) issues.push({ level: "warning", message: `Fragments should not appear in a sitemap: ${url}` });
  }

  for (const match of xml.matchAll(/<lastmod>\s*([^<]*?)\s*<\/lastmod>/gi)) {
    if (!/^\d{4}-\d{2}-\d{2}(T[\d:+\-Z.]+)?$/.test(match[1])) {
      issues.push({ level: "warning", message: `Invalid lastmod “${match[1]}” — use YYYY-MM-DD.` });
    }
  }
  for (const match of xml.matchAll(/<priority>\s*([^<]*?)\s*<\/priority>/gi)) {
    const value = Number(match[1]);
    if (!(value >= 0 && value <= 1)) {
      issues.push({ level: "warning", message: `Priority “${match[1]}” must be between 0.0 and 1.0.` });
    }
  }

  return { valid: !issues.some((issue) => issue.level === "error"), urlCount: urls.length, issues, urls };
}

/* ------------------------------------------------------------------ */
/* Schema.org builders                                                 */
/* ------------------------------------------------------------------ */

export type SchemaKind = "Article" | "Product" | "LocalBusiness" | "FAQPage" | "BreadcrumbList" | "Organization" | "WebSite";

export interface SchemaInput {
  kind: SchemaKind;
  name: string;
  url: string;
  description: string;
  image: string;
  author: string;
  publisher: string;
  datePublished: string;
  price: string;
  currency: string;
  telephone: string;
  address: string;
  faqs: Array<{ question: string; answer: string }>;
  breadcrumbs: Array<{ name: string; url: string }>;
}

export function buildSchema(input: SchemaInput): { json: string; script: string; issues: string[] } {
  const issues: string[] = [];
  const data: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": input.kind,
  };

  const requireField = (value: string, label: string) => {
    if (!value.trim()) issues.push(`${label} is required for ${input.kind}.`);
    return value.trim();
  };

  if (input.kind === "FAQPage") {
    const faqs = input.faqs.filter((faq) => faq.question.trim() && faq.answer.trim());
    if (!faqs.length) issues.push("Add at least one question and answer.");
    data.mainEntity = faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question.trim(),
      acceptedAnswer: { "@type": "Answer", text: faq.answer.trim() },
    }));
  } else if (input.kind === "BreadcrumbList") {
    const crumbs = input.breadcrumbs.filter((crumb) => crumb.name.trim() && crumb.url.trim());
    if (crumbs.length < 2) issues.push("A breadcrumb list needs at least two entries.");
    data.itemListElement = crumbs.map((crumb, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: crumb.name.trim(),
      item: crumb.url.trim(),
    }));
  } else {
    data.name = requireField(input.name, "A name");
    const url = requireField(input.url, "A URL");
    if (url) data.url = url;
    if (input.description.trim()) data.description = input.description.trim();
    if (input.image.trim()) data.image = input.image.trim();

    if (input.kind === "Article") {
      if (input.author.trim()) data.author = { "@type": "Person", name: input.author.trim() };
      if (input.publisher.trim()) data.publisher = { "@type": "Organization", name: input.publisher.trim() };
      if (input.datePublished.trim()) data.datePublished = input.datePublished.trim();
      if (!input.datePublished.trim()) issues.push("Articles should include datePublished.");
    }
    if (input.kind === "Product") {
      if (input.price.trim()) {
        data.offers = {
          "@type": "Offer",
          price: input.price.trim(),
          priceCurrency: input.currency.trim() || "USD",
          availability: "https://schema.org/InStock",
          url: input.url.trim(),
        };
      } else {
        issues.push("Product offers need a price to be eligible for rich results.");
      }
    }
    if (input.kind === "LocalBusiness") {
      if (input.telephone.trim()) data.telephone = input.telephone.trim();
      if (input.address.trim()) data.address = { "@type": "PostalAddress", streetAddress: input.address.trim() };
      if (!input.address.trim()) issues.push("LocalBusiness markup needs a postal address.");
    }
  }

  const json = JSON.stringify(data, null, 2);
  return {
    json,
    script: `<script type="application/ld+json">\n${json}\n</script>`,
    issues,
  };
}

export function validateJsonLd(source: string): { valid: boolean; issues: Array<{ level: "error" | "warning"; message: string }>; types: string[] } {
  const issues: Array<{ level: "error" | "warning"; message: string }> = [];
  const types: string[] = [];

  // Accept either a bare JSON-LD block or a whole script tag.
  const scriptMatch = /<script[^>]*application\/ld\+json[^>]*>([\s\S]*?)<\/script>/i.exec(source);
  const payload = (scriptMatch ? scriptMatch[1] : source).trim();

  let parsed: unknown;
  try {
    parsed = JSON.parse(payload);
  } catch (error) {
    return {
      valid: false,
      types,
      issues: [{ level: "error", message: error instanceof Error ? error.message : "Invalid JSON" }],
    };
  }

  const visit = (node: unknown) => {
    if (Array.isArray(node)) {
      node.forEach(visit);
      return;
    }
    if (!node || typeof node !== "object") return;
    const record = node as Record<string, unknown>;
    if (typeof record["@type"] === "string") types.push(record["@type"]);
    if ("@context" in record && !String(record["@context"]).includes("schema.org")) {
      issues.push({ level: "warning", message: `Unusual @context: ${String(record["@context"])}` });
    }
    for (const value of Object.values(record)) visit(value);
  };
  visit(parsed);

  if (!types.length) issues.push({ level: "error", message: "No @type was found, so search engines cannot classify the markup." });

  const root = Array.isArray(parsed) ? parsed[0] : parsed;
  if (root && typeof root === "object" && !("@context" in (root as Record<string, unknown>))) {
    issues.push({ level: "error", message: "The top-level object has no @context. Add https://schema.org." });
  }

  if (types.includes("FAQPage")) {
    const text = JSON.stringify(parsed);
    if (!/"acceptedAnswer"/.test(text)) issues.push({ level: "error", message: "FAQPage entries need an acceptedAnswer." });
  }
  if (types.includes("Article") && !/"datePublished"/.test(JSON.stringify(parsed))) {
    issues.push({ level: "warning", message: "Articles should include datePublished." });
  }

  return { valid: !issues.some((issue) => issue.level === "error"), issues, types: [...new Set(types)] };
}

/* ------------------------------------------------------------------ */
/* hreflang                                                            */
/* ------------------------------------------------------------------ */

export interface HreflangEntry {
  language: string;
  url: string;
}

export function buildHreflang(entries: HreflangEntry[], includeDefault: boolean): { html: string; issues: string[] } {
  const issues: string[] = [];
  const lines: string[] = [];
  const seen = new Set<string>();

  for (const entry of entries) {
    const language = entry.language.trim();
    const url = entry.url.trim();
    if (!language || !url) continue;
    if (!/^[a-z]{2,3}(-[A-Za-z0-9]{2,8})*$/.test(language)) {
      issues.push(`“${language}” is not a valid hreflang value — use ISO 639-1, optionally with a region such as es-MX.`);
      continue;
    }
    if (!/^https?:\/\//i.test(url)) {
      issues.push(`“${url}” must be an absolute URL.`);
      continue;
    }
    if (seen.has(language)) {
      issues.push(`Duplicate language “${language}”.`);
      continue;
    }
    seen.add(language);
    lines.push(`<link rel="alternate" hreflang="${language}" href="${url}" />`);
  }

  if (!includeDefault && lines.length === 0) issues.push("Add at least one language entry.");
  if (includeDefault) lines.push(`<link rel="alternate" hreflang="x-default" href="${entries[0]?.url.trim() || ""}" />`);

  return { html: lines.join("\n"), issues };
}

/* ------------------------------------------------------------------ */
/* Title and description previews                                      */
/* ------------------------------------------------------------------ */

export interface PixelEstimate {
  pixels: number;
  width: "narrow" | "ok" | "wide";
}

/** Rough Google SERP width: ~7.5px per character at 20px Arial, refined by letter. */
export function estimateSerpWidth(text: string): PixelEstimate {
  const pixels = Math.round(
    [...text].reduce((total, char) => {
      if (/[iljI|!.,'`]/.test(char)) return total + 4;
      if (/[mwMW]/.test(char)) return total + 13;
      if (/[A-Z0-9]/.test(char)) return total + 9;
      if (char === " ") return total + 4.5;
      return total + 7.5;
    }, 0),
  );
  return { pixels, width: pixels <= 600 ? "ok" : pixels <= 700 ? "narrow" : "wide" };
}

export interface SnippetData {
  title: string;
  description: string;
  url: string;
  siteName: string;
}

export function snippetChecks(data: SnippetData): Array<{ level: "error" | "warning" | "ok"; message: string }> {
  const checks: Array<{ level: "error" | "warning" | "ok"; message: string }> = [];
  const title = data.title.trim();
  const description = data.description.trim();

  if (!title) checks.push({ level: "error", message: "A title is required." });
  else {
    const width = estimateSerpWidth(title);
    checks.push(
      width.pixels > 580
        ? { level: "warning", message: `Title is ~${width.pixels}px; Google truncates around 580–600px (roughly 60 characters).` }
        : { level: "ok", message: `Title fits at ~${width.pixels}px (${title.length} characters).` },
    );
    if (!/\b(20\d\d)\b/.test(title) && title.split(" ").length < 3) {
      checks.push({ level: "warning", message: "Very short titles struggle to communicate intent." });
    }
  }

  if (!description) checks.push({ level: "warning", message: "No description: Google will generate a snippet from page text." });
  else if (description.length > 160) {
    checks.push({ level: "warning", message: `Description is ${description.length} characters; snippets cut around 155–160.` });
  } else if (description.length < 70) {
    checks.push({ level: "warning", message: `Description is only ${description.length} characters — 70–155 reads better.` });
  } else {
    checks.push({ level: "ok", message: `Description length is ${description.length} characters.` });
  }

  if (data.url && !/^https?:\/\//i.test(data.url)) {
    checks.push({ level: "error", message: "The URL must start with http:// or https://." });
  }

  return checks;
}

export function describeUrlPath(url: string): string {
  try {
    const parsed = new URL(url);
    const host = parsed.hostname.replace(/^www\./, "");
    const parts = parsed.pathname.split("/").filter(Boolean);
    return parts.length ? `${host} › ${parts.map((part) => part.replace(/-/g, " ")).join(" › ")}` : host;
  } catch {
    return url.replace(/^https?:\/\//, "").replace(/\//g, " › ");
  }
}

export function outlineFromHtml(html: string): string {
  const report = analyseHeadings(html);
  return report.headings
    .map((heading) => `${"  ".repeat(Math.max(0, heading.level - 1))}${"#".repeat(heading.level)} ${heading.text}`)
    .join("\n");
}

export function analyseSeoText(html: string, keyword: string) {
  const head = extractHead(html);
  const text = html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  const words = text.split(/\s+/).filter(Boolean).length;
  const headings = analyseHeadings(html);
  const images = analyseImageAlts(html);
  const links = analyseLinks(html);
  const density = keyword ? keywordDensity(text, keyword) : { count: 0, density: 0, words };
  const read = readability(text);

  const checks: Array<{ level: "error" | "warning" | "ok"; message: string }> = [];
  if (!head.title) checks.push({ level: "error", message: "No <title> element." });
  else if (head.title.length > 60) checks.push({ level: "warning", message: `Title is ${head.title.length} characters — over the usual 60.` });
  else checks.push({ level: "ok", message: `Title length is ${head.title.length} characters.` });

  if (!head.description) checks.push({ level: "warning", message: "No meta description." });
  else if (head.description.length > 160) checks.push({ level: "warning", message: `Description is ${head.description.length} characters.` });
  else checks.push({ level: "ok", message: `Description length is ${head.description.length} characters.` });

  if (words < 300) checks.push({ level: "warning", message: `Only ${words} words of body text — thin pages rarely rank.` });
  else checks.push({ level: "ok", message: `${words} words of body text.` });

  if (keyword) {
    if (density.count === 0) checks.push({ level: "error", message: `“${keyword}” does not appear in the page text.` });
    else if (density.density > 4) checks.push({ level: "warning", message: `“${keyword}” is ${density.density.toFixed(1)}% of the text — that can read as stuffing.` });
    else checks.push({ level: "ok", message: `“${keyword}” appears ${density.count} time(s), ${density.density.toFixed(1)}% density.` });
    if (!head.title.toLowerCase().includes(keyword.toLowerCase())) {
      checks.push({ level: "warning", message: "The keyword is missing from the title." });
    }
  }

  if (images.missing.length) checks.push({ level: "warning", message: `${images.missing.length} image(s) have no alt attribute.` });
  if (headings.counts[1] !== 1) checks.push({ level: "warning", message: `Expected exactly one H1, found ${headings.counts[1]}.` });
  if (links.internal === 0) checks.push({ level: "warning", message: "No internal links — neither readers nor crawlers can go deeper." });

  return { head, words, headings, images, links, density, readability: read, checks };
}
