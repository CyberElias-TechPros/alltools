import type { Metadata } from "next";
import type { CategoryId, ToolDefinition } from "./tools/types";
import { siteConfig, siteKeywords } from "./site";

/**
 * SEO primitives.
 *
 * Everything a crawler needs is derived from one place so the site cannot drift:
 * canonical URLs, keyword sets, Open Graph and Twitter cards, robots directives,
 * structured-data nodes and the OG image path for each page.
 */

export function absoluteUrl(path = "/"): string {
  if (/^https?:\/\//.test(path)) return path;
  const clean = path.startsWith("/") ? path : `/${path}`;
  return `${siteConfig.url}${clean}`;
}

/** De-duplicate while preserving order, and cap the list at a sensible size. */
export function mergeKeywords(...lists: Array<readonly string[] | undefined>): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const list of lists) {
    for (const raw of list ?? []) {
      const keyword = raw.trim().toLowerCase();
      if (!keyword || seen.has(keyword)) continue;
      seen.add(keyword);
      out.push(keyword);
      if (out.length >= 40) return out;
    }
  }
  return out;
}

/**
 * Evergreen keyword clusters per category. These are the phrases the pages are
 * actually written to answer, so they double as a coverage checklist.
 */
export const categoryKeywords: Record<CategoryId, string[]> = {
  text: [
    "word counter",
    "character counter",
    "sentence counter",
    "case converter",
    "uppercase converter",
    "lowercase converter",
    "title case converter",
    "text diff checker",
    "remove duplicate lines",
    "remove line breaks",
    "word frequency counter",
    "reading time calculator",
    "speaking time calculator",
    "text to slug",
    "lorem ipsum generator",
    "find and replace text",
    "sort text alphabetically",
    "unicode character lookup",
  ],
  calculators: [
    "percentage calculator",
    "percent change calculator",
    "age calculator",
    "date difference calculator",
    "days between dates",
    "scientific calculator",
    "fraction calculator",
    "average calculator",
    "mean median mode calculator",
    "standard deviation calculator",
    "gcd lcm calculator",
    "prime number checker",
    "factorial calculator",
    "probability calculator",
    "matrix calculator",
    "ratio calculator",
    "square root calculator",
    "random number generator",
  ],
  finance: [
    "loan calculator",
    "mortgage calculator",
    "compound interest calculator",
    "savings calculator",
    "investment growth calculator",
    "roi calculator",
    "break even calculator",
    "discount calculator",
    "vat calculator",
    "sales tax calculator",
    "salary calculator",
    "budget calculator",
    "inflation calculator",
    "currency converter",
    "debt payoff calculator",
    "commission calculator",
    "profit margin calculator",
  ],
  developer: [
    "json formatter",
    "json validator",
    "base64 encoder",
    "base64 decoder",
    "url encoder",
    "regex tester",
    "regex explainer",
    "hash generator",
    "sha256 generator",
    "uuid generator",
    "jwt decoder",
    "timestamp converter",
    "unix timestamp",
    "html formatter",
    "css minifier",
    "javascript formatter",
    "markdown to html",
    "csv to json",
    "xml formatter",
    "lorem ipsum for developers",
  ],
  everyday: [
    "time zone converter",
    "world clock",
    "cooking measurement converter",
    "recipe scaling calculator",
    "fuel consumption converter",
    "pace calculator",
    "sleep calculator",
    "water intake calculator",
    "calorie estimator",
    "body fat estimator",
    "pregnancy due date calculator",
    "ovulation calculator",
    "countdown timer",
    "pomodoro timer",
    "electricity cost calculator",
  ],
  seo: [
    "meta tag generator",
    "serp preview tool",
    "meta title preview",
    "meta description preview",
    "keyword density analyzer",
    "robots.txt generator",
    "sitemap generator",
    "schema markup generator",
    "json-ld validator",
    "faq schema generator",
    "canonical tag generator",
    "hreflang generator",
    "open graph preview",
    "readability checker",
    "heading structure checker",
    "image alt text checker",
    "internal link checker",
    "keyword clustering",
  ],
  security: [
    "password generator",
    "strong password generator",
    "password strength checker",
    "passphrase generator",
    "sha256 hash generator",
    "md5 hash generator",
    "text encryption demo",
    "privacy policy generator",
    "cookie policy generator",
    "terms and conditions generator",
    "secure random token",
    "file checksum calculator",
  ],
  images: [
    "image compressor",
    "image resizer",
    "image converter",
    "png to jpg",
    "jpg to png",
    "webp converter",
    "image cropper",
    "image color picker",
    "favicon generator",
    "exif data viewer",
    "image to base64",
    "image background color changer",
    "image blur tool",
    "image pixelator",
  ],
  pdf: [
    "pdf merger",
    "pdf splitter",
    "pdf compressor",
    "pdf to jpg",
    "jpg to pdf",
    "pdf to png",
    "pdf to text",
    "rotate pdf",
    "pdf watermark",
    "pdf page remover",
    "pdf metadata viewer",
    "pdf page counter",
    "docx to pdf",
    "text to pdf",
  ],
  education: [
    "citation generator",
    "apa citation generator",
    "mla citation generator",
    "bibliography formatter",
    "gpa calculator",
    "cgpa calculator",
    "grade calculator",
    "exam score calculator",
    "flashcard generator",
    "quiz generator",
    "study timetable generator",
    "study time calculator",
    "essay word counter",
    "random quiz generator",
  ],
  internet: [
    "url parser",
    "url validator",
    "url encoder decoder",
    "domain name analyzer",
    "ipv4 subnet calculator",
    "user agent parser",
    "http status codes",
    "dns lookup",
    "http header checker",
    "ssl certificate expiry checker",
    "website status checker",
    "sitemap xml generator",
    "utm link builder",
    "redirect checker",
  ],
  business: [
    "invoice generator",
    "free invoice template",
    "receipt generator",
    "business name generator",
    "slogan generator",
    "email signature generator",
    "proposal template",
    "business letter template",
    "hourly rate calculator",
    "project cost calculator",
    "employee cost calculator",
    "product pricing calculator",
    "marketing budget calculator",
    "campaign roi calculator",
    "hashtag generator",
    "social media caption formatter",
    "content calendar generator",
    "email subject line analyzer",
  ],
};

export interface PageMetaInput {
  title: string;
  description: string;
  path: string;
  keywords?: readonly string[];
  /** Absolute or root-relative OG image. Defaults to the site card. */
  image?: string;
  imageAlt?: string;
  type?: "website" | "article";
  publishedTime?: string;
  modifiedTime?: string;
  noindex?: boolean;
}

/**
 * Builds a complete, consistent Metadata object: canonical, keywords, robots,
 * Open Graph and Twitter cards. Every page uses this so no page can ship with
 * a missing canonical or an untagged social card.
 */
export function pageMetadata({
  title,
  description,
  path,
  keywords,
  image = "/og/tools.png",
  imageAlt = "Tools — free online tools that run in your browser",
  type = "website",
  publishedTime,
  modifiedTime,
  noindex = false,
}: PageMetaInput): Metadata {
  const url = absoluteUrl(path);
  const images = [{ url: image, width: 1200, height: 630, alt: imageAlt }];

  return {
    title,
    description,
    keywords: mergeKeywords(keywords, siteKeywords),
    alternates: {
      canonical: url,
      languages: { "x-default": url, en: url },
      types: {
        "application/rss+xml": [{ url: "/feed.xml", title: `${siteConfig.name} — guides` }],
        "text/markdown": [{ url: "/llms.txt", title: `${siteConfig.name} — machine-readable index` }],
      },
    },
    robots: {
      index: !noindex,
      follow: !noindex,
      googleBot: {
        index: !noindex,
        follow: !noindex,
        "max-image-preview": "large",
        "max-snippet": -1,
        "max-video-preview": -1,
      },
    },
    openGraph: {
      type,
      siteName: siteConfig.name,
      locale: siteConfig.locale,
      url,
      title,
      description,
      images,
      ...(publishedTime ? { publishedTime } : {}),
      ...(modifiedTime ? { modifiedTime } : {}),
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [image],
    },
  };
}

export function toolMetadata(tool: ToolDefinition): Metadata {
  return pageMetadata({
    title: tool.seoTitle,
    description: tool.seoDescription,
    path: `/tools/${tool.slug}/`,
    keywords: mergeKeywords([tool.name, ...tool.keywords], categoryKeywords[tool.category]),
    image: `/og/${tool.category}.png`,
    imageAlt: `${tool.name} — ${tool.tagline}`,
    modifiedTime: new Date(tool.addedAt).toISOString(),
  });
}

export function breadcrumbSchema(trail: Array<{ name: string; path: string }>) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: trail.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  };
}

export function collectionSchema({
  name,
  description,
  path,
  items,
}: {
  name: string;
  description: string;
  path: string;
  items: Array<{ name: string; url: string }>;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "@id": `${absoluteUrl(path)}#collection`,
    name,
    description,
    url: absoluteUrl(path),
    inLanguage: siteConfig.language,
    isPartOf: { "@id": `${siteConfig.url}/#website` },
    mainEntity: {
      "@type": "ItemList",
      numberOfItems: items.length,
      itemListElement: items.map((item, index) => ({
        "@type": "ListItem",
        position: index + 1,
        name: item.name,
        url: item.url,
      })),
    },
  };
}

export function articleSchema({
  headline,
  description,
  path,
  datePublished,
  dateModified,
}: {
  headline: string;
  description: string;
  path: string;
  datePublished: string;
  dateModified: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline,
    description,
    url: absoluteUrl(path),
    mainEntityOfPage: { "@type": "WebPage", "@id": absoluteUrl(path) },
    datePublished,
    dateModified,
    inLanguage: siteConfig.language,
    author: { "@type": "Organization", name: siteConfig.name, url: siteConfig.url },
    publisher: { "@id": `${siteConfig.url}/#organization` },
    isAccessibleForFree: true,
  };
}
