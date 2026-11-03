/**
 * Head-tag tooling: extract what a page declares, build meta tags and sitemaps,
 * and check canonical tags without fetching anything.
 *
 * Pages can be pasted as HTML (view-source) or supplied as a URL for syntax
 * checks. Neither path makes a network request.
 */

/* ------------------------------------------------------------------ */
/* Extraction                                                          */
/* ------------------------------------------------------------------ */

export interface HeadData {
  title: string;
  description: string;
  canonical: string;
  robots: string;
  charset: string;
  viewport: string;
  lang: string;
  h1: string;
  icons: string[];
  openGraph: Record<string, string>;
  twitter: Record<string, string>;
  all: Array<{ name: string; content: string }>;
  duplicateNames: string[];
  canonicalCount: number;
  titleCount: number;
}

function decodeEntities(value: string): string {
  return value
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&");
}

/** Reads a `<meta>`/`<link>` tag's attributes. */
function attributesOf(tag: string): Record<string, string> {
  const attributes: Record<string, string> = {};
  const pattern = /([\w:-]+)\s*=\s*("([^"]*)"|'([^']*)'|([^\s"'>]+))/g;
  let match: RegExpExecArray | null;
  while ((match = pattern.exec(tag)) !== null) {
    attributes[match[1].toLowerCase()] = decodeEntities(match[3] ?? match[4] ?? match[5] ?? "");
  }
  return attributes;
}

export function extractHead(html: string): HeadData {
  const titleMatches = [...html.matchAll(/<title[^>]*>([\s\S]*?)<\/title>/gi)];
  const title = decodeEntities(titleMatches[0]?.[1]?.trim() ?? "");
  const h1Match = /<h1[^>]*>([\s\S]*?)<\/h1>/i.exec(html);
  const langMatch = /<html[^>]*\slang\s*=\s*["']([^"']+)["']/i.exec(html);

  const metaTags = [...html.matchAll(/<meta\b[^>]*>/gi)].map((match) => match[0]);
  const linkTags = [...html.matchAll(/<link\b[^>]*>/gi)].map((match) => match[0]);

  const all: Array<{ name: string; content: string }> = [];
  const openGraph: Record<string, string> = {};
  const twitter: Record<string, string> = {};
  const counts = new Map<string, number>();

  for (const tag of metaTags) {
    const attributes = attributesOf(tag);
    const key = (attributes.property ?? attributes.name ?? attributes["http-equiv"] ?? "").toLowerCase();
    const content = attributes.content ?? "";
    if (!key) continue;
    counts.set(key, (counts.get(key) ?? 0) + 1);
    all.push({ name: key, content });
    if (key.startsWith("og:")) openGraph[key.slice(3)] = content;
    if (key.startsWith("twitter:")) twitter[key.slice(8)] = content;
  }

  const icons = linkTags
    .map(attributesOf)
    .filter((attributes) => (attributes.rel ?? "").toLowerCase().includes("icon"))
    .map((attributes) => attributes.href ?? "")
    .filter(Boolean);

  const canonicalLinks = linkTags
    .map(attributesOf)
    .filter((attributes) => (attributes.rel ?? "").toLowerCase() === "canonical");

  const find = (key: string) => all.find((entry) => entry.name === key)?.content ?? "";

  return {
    title,
    description: find("description"),
    canonical: canonicalLinks[0]?.href ?? "",
    robots: find("robots"),
    charset: find("charset") || attributesOf(metaTags.find((tag) => /charset=/i.test(tag)) ?? "").charset || "",
    viewport: find("viewport"),
    lang: langMatch?.[1] ?? "",
    h1: decodeEntities(h1Match?.[1]?.replace(/<[^>]+>/g, "").trim() ?? ""),
    icons,
    openGraph,
    twitter,
    all,
    duplicateNames: [...counts.entries()].filter(([, count]) => count > 1).map(([name]) => name),
    canonicalCount: canonicalLinks.length,
    titleCount: titleMatches.length,
  };
}

/* ------------------------------------------------------------------ */
/* Meta tag generation                                                 */
/* ------------------------------------------------------------------ */

export interface MetaInput {
  title: string;
  description: string;
  url: string;
  siteName: string;
  image: string;
  type: "website" | "article" | "product" | "profile";
  twitterCard: "summary" | "summary_large_image";
  twitterSite: string;
  locale: string;
  noindex: boolean;
}

export interface MetaCheck {
  level: "error" | "warning" | "ok";
  message: string;
}

export interface MetaResult {
  html: string;
  checks: MetaCheck[];
}

function escapeAttribute(value: string): string {
  return value.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

export function buildMetaTags(input: MetaInput): MetaResult {
  const checks: MetaCheck[] = [];
  const title = input.title.trim();
  const description = input.description.trim();
  const lines: string[] = ['<meta charset="utf-8" />', '<meta name="viewport" content="width=device-width, initial-scale=1" />'];

  if (!title) {
    checks.push({ level: "error", message: "A title is required — it is the headline in search results." });
  } else if (title.length > 60) {
    checks.push({ level: "warning", message: `The title is ${title.length} characters; Google truncates around 60.` });
  } else if (title.length < 15) {
    checks.push({ level: "warning", message: "The title is short — it may not explain the page well." });
  } else {
    checks.push({ level: "ok", message: `Title length is ${title.length} characters.` });
  }

  if (!description) {
    checks.push({ level: "warning", message: "No description: search engines will invent a snippet from page text." });
  } else if (description.length > 160) {
    checks.push({ level: "warning", message: `The description is ${description.length} characters; snippets usually cut around 155–160.` });
  } else if (description.length < 70) {
    checks.push({ level: "warning", message: "The description is short; 70–155 characters fits a snippet well." });
  } else {
    checks.push({ level: "ok", message: `Description length is ${description.length} characters.` });
  }

  if (!input.url.trim()) {
    checks.push({ level: "error", message: "A canonical URL is required so the page can identify itself." });
  } else if (!/^https?:\/\//i.test(input.url.trim())) {
    checks.push({ level: "error", message: "The canonical URL must be absolute and start with http:// or https://." });
  } else if (input.url.trim().startsWith("http://")) {
    checks.push({ level: "warning", message: "The canonical URL uses http://; use https:// to avoid a duplicate version." });
  } else {
    checks.push({ level: "ok", message: "Canonical URL looks absolute and uses https." });
  }

  if (!input.image.trim()) {
    checks.push({ level: "warning", message: "Without an og:image, shared links show no picture." });
  } else if (!/^https?:\/\//i.test(input.image.trim())) {
    checks.push({ level: "error", message: "Social platforms require an absolute image URL." });
  } else {
    checks.push({ level: "ok", message: "Open Graph image is absolute." });
  }

  if (input.noindex) {
    checks.push({ level: "warning", message: "noindex is on — this page will stay out of search results." });
  }

  lines.push(`<title>${escapeAttribute(title || "Page title")}</title>`);
  if (description) lines.push(`<meta name="description" content="${escapeAttribute(description)}" />`);
  if (input.url.trim()) lines.push(`<link rel="canonical" href="${escapeAttribute(input.url.trim())}" />`);
  lines.push(
    `<meta name="robots" content="${input.noindex ? "noindex, nofollow" : "index, follow, max-image-preview:large"}" />`,
  );

  lines.push(
    `<meta property="og:type" content="${input.type}" />`,
    `<meta property="og:title" content="${escapeAttribute(title)}" />`,
  );
  if (description) lines.push(`<meta property="og:description" content="${escapeAttribute(description)}" />`);
  if (input.url.trim()) lines.push(`<meta property="og:url" content="${escapeAttribute(input.url.trim())}" />`);
  if (input.siteName.trim()) lines.push(`<meta property="og:site_name" content="${escapeAttribute(input.siteName.trim())}" />`);
  if (input.image.trim()) {
    lines.push(`<meta property="og:image" content="${escapeAttribute(input.image.trim())}" />`);
    lines.push('<meta property="og:image:alt" content="Preview image" />');
  }
  if (input.locale.trim()) lines.push(`<meta property="og:locale" content="${escapeAttribute(input.locale.trim())}" />`);

  lines.push(`<meta name="twitter:card" content="${input.twitterCard}" />`);
  if (input.twitterSite.trim()) {
    lines.push(`<meta name="twitter:site" content="${escapeAttribute(input.twitterSite.trim())}" />`);
  }
  if (title) lines.push(`<meta name="twitter:title" content="${escapeAttribute(title)}" />`);
  if (description) lines.push(`<meta name="twitter:description" content="${escapeAttribute(description)}" />`);
  if (input.image.trim()) lines.push(`<meta name="twitter:image" content="${escapeAttribute(input.image.trim())}" />`);

  return { html: lines.join("\n"), checks };
}

/* ------------------------------------------------------------------ */
/* Sitemap generation                                                  */
/* ------------------------------------------------------------------ */

export interface SitemapEntry {
  url: string;
  lastmod?: string;
  changefreq?: "always" | "hourly" | "daily" | "weekly" | "monthly" | "yearly" | "never" | "";
  priority?: string;
}

export interface SitemapResult {
  xml: string;
  urlCount: number;
  issues: string[];
}

const XML_ESCAPES: Record<string, string> = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&apos;",
};

function escapeXml(value: string): string {
  return value.replace(/[&<>"']/g, (char) => XML_ESCAPES[char] ?? char);
}

export function buildSitemap(entries: SitemapEntry[]): SitemapResult {
  const issues: string[] = [];
  const seen = new Set<string>();
  const valid: SitemapEntry[] = [];

  for (const entry of entries) {
    const url = entry.url.trim();
    if (!url) continue;
    if (!/^https?:\/\//i.test(url)) {
      issues.push(`Skipped “${url}” — a sitemap can only contain absolute URLs.`);
      continue;
    }
    if (url.length > 2048) {
      issues.push(`Skipped “${url.slice(0, 40)}…” — longer than 2,048 characters.`);
      continue;
    }
    if (seen.has(url)) {
      issues.push(`Removed a duplicate: ${url}`);
      continue;
    }
    seen.add(url);
    let lastmod = entry.lastmod ?? "";
    let priority = entry.priority ?? "";
    if (lastmod && !/^\d{4}-\d{2}-\d{2}$/.test(lastmod)) {
      issues.push(`Ignored an invalid lastmod “${lastmod}” for ${url} — use YYYY-MM-DD.`);
      lastmod = "";
    }
    if (priority && !(Number(priority) >= 0 && Number(priority) <= 1)) {
      issues.push(`Ignored priority “${priority}” for ${url} — use 0.0 to 1.0.`);
      priority = "";
    }
    valid.push({ ...entry, lastmod, priority });
  }

  if (valid.length > 50_000) issues.push("A sitemap may contain at most 50,000 URLs; split this one.");

  const body = valid
    .map((entry) => {
      const parts = [`    <loc>${escapeXml(entry.url.trim())}</loc>`];
      if (entry.lastmod) parts.push(`    <lastmod>${entry.lastmod}</lastmod>`);
      if (entry.changefreq) parts.push(`    <changefreq>${entry.changefreq}</changefreq>`);
      if (entry.priority) parts.push(`    <priority>${entry.priority}</priority>`);
      return `  <url>\n${parts.join("\n")}\n  </url>`;
    })
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${body}\n</urlset>`;

  return { xml, urlCount: valid.length, issues };
}

/* ------------------------------------------------------------------ */
/* Canonical checks                                                    */
/* ------------------------------------------------------------------ */

export interface CanonicalReport {
  canonical: string;
  issues: MetaCheck[];
  expected: string;
}

function trimSlash(value: string): string {
  return value.replace(/\/+$/, "");
}

export function checkCanonical(html: string, expectedUrl: string): CanonicalReport {
  const head = extractHead(html);
  const expected = expectedUrl.trim();
  const issues: MetaCheck[] = [];

  if (head.canonicalCount === 0) {
    issues.push({ level: "warning", message: "No canonical tag found. Add one to state the preferred URL explicitly." });
  }
  if (head.canonicalCount > 1) {
    issues.push({
      level: "error",
      message: `${head.canonicalCount} canonical tags found. Search engines ignore conflicting canonicals — keep exactly one.`,
    });
  }
  if (head.canonical) {
    if (!/^https?:\/\//i.test(head.canonical)) {
      issues.push({ level: "error", message: "The canonical URL is relative. It must be absolute." });
    } else {
      if (head.canonical.startsWith("http://")) {
        issues.push({ level: "warning", message: "The canonical URL uses http://; prefer https://." });
      }
      if (expected && trimSlash(head.canonical) !== trimSlash(expected)) {
        issues.push({
          level: "warning",
          message: `The canonical points at ${head.canonical}, not the URL you are checking (${expected}). That is correct for duplicates, wrong for a self-reference.`,
        });
      }
      if (/[?#]/.test(head.canonical)) {
        issues.push({ level: "warning", message: "The canonical URL contains a query string or fragment; canonicals are usually clean paths." });
      }
    }
  }
  if (head.titleCount === 0) issues.push({ level: "error", message: "No <title> element found in the pasted HTML." });
  if (head.titleCount > 1) issues.push({ level: "warning", message: "More than one <title> element found." });
  if (head.duplicateNames.length) {
    issues.push({
      level: "warning",
      message: `Duplicate meta names: ${head.duplicateNames.join(", ")}. The first usually wins, which makes the rest dead weight.`,
    });
  }
  if (head.title && head.title.length > 60) {
    issues.push({ level: "warning", message: `The title is ${head.title.length} characters; search results truncate around 60.` });
  }
  if (head.description && head.description.length > 160) {
    issues.push({ level: "warning", message: `The description is ${head.description.length} characters; snippets cut around 155–160.` });
  }
  if (!head.description) issues.push({ level: "warning", message: "No meta description found." });
  if (/noindex/i.test(head.robots)) {
    issues.push({ level: "error", message: "This page is set to noindex, so a canonical tag has no effect on indexing." });
  }
  if (!issues.length) issues.push({ level: "ok", message: "No problems found in the canonical tag or core head tags." });

  return { canonical: head.canonical, issues, expected };
}
