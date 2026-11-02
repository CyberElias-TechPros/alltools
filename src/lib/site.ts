/**
 * Site configuration for "Tools".
 *
 * IMPORTANT: set NEXT_PUBLIC_SITE_URL in your hosting provider's environment
 * before launch. Every canonical URL, sitemap entry, robots.txt host and
 * structured-data @id is derived from this single value.
 */
const rawUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim();
const fallback = "https://tools.example.com";

export const siteUrl = (rawUrl || fallback).replace(/\/+$/, "");

/** True when the canonical URL has not been configured yet. */
export const siteUrlIsPlaceholder = siteUrl.includes("example.com");

export const siteConfig = {
  name: "Tools",
  legalName: "Tools",
  tagline: "Free online tools that run in your browser",
  /** Used verbatim as the site-wide meta description. Kept to ~155 characters. */
  description:
    "254 free online tools for text, numbers, images, PDFs and code. Every tool runs in your browser — no sign-up, no uploads, no waiting.",
  /** One-line positioning statement, used in structured data and the footer. */
  slogan: "Free online tools. Nothing uploaded. Nothing to install.",
  url: siteUrl,
  locale: "en_US",
  language: "en",
  email: "hello@tools.example.com",
  /** Set NEXT_PUBLIC_GA_ID to enable consented, aggregate analytics. */
  gaId: process.env.NEXT_PUBLIC_GA_ID?.trim() || "",
  /** Set after AdSense approval to render ad slots. */
  adsenseClient: process.env.NEXT_PUBLIC_ADSENSE_CLIENT?.trim() || "",
  /**
   * Search-engine verification tokens. Leave unset rather than inventing one —
   * an invalid token does not verify anything.
   */
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION?.trim() || "",
    bing: process.env.NEXT_PUBLIC_BING_SITE_VERIFICATION?.trim() || "",
  },
  /**
   * Ad unit ids supplied by AdSense for each placement. An empty value means
   * "no unit here yet", and the slot renders nothing at all — we never invent
   * a unit id or show an empty ad frame.
   */
  adsenseSlots: {
    toolPage: process.env.NEXT_PUBLIC_ADSENSE_SLOT_TOOL?.trim() || "",
  },
  /** Shown in the footer; keep empty until ads are actually live. */
  adsEnabled:
    Boolean(process.env.NEXT_PUBLIC_ADSENSE_CLIENT?.trim()) &&
    process.env.NEXT_PUBLIC_ADS_ENABLED === "true",
} as const;

/**
 * Evergreen search terms the site is built to answer. These feed the `keywords`
 * metadata on the homepage and are merged (never repeated) into per-page
 * keyword lists, so every page declares its own topic plus the site's themes.
 */
export const siteKeywords = [
  "free online tools",
  "online tools",
  "web tools",
  "free tools online",
  "browser tools",
  "tools that run in your browser",
  "no signup tools",
  "privacy first tools",
  "offline capable tools",
  "productivity tools",
  "text tools",
  "word counter",
  "character counter",
  "case converter",
  "percentage calculator",
  "unit converter",
  "date calculator",
  "calculator online",
  "json formatter",
  "base64 encoder",
  "password generator",
  "hash generator",
  "qr code generator",
  "image compressor",
  "image resizer",
  "image converter",
  "pdf tools",
  "pdf merger",
  "pdf compressor",
  "seo tools",
  "meta tag generator",
  "color picker",
  "time zone converter",
  "random number generator",
  "lorem ipsum generator",
  "text diff checker",
  "markdown editor",
  "url encoder",
  "developer utilities",
  "student tools",
  "business tools",
] as const;

export const navLinks = [
  { href: "/tools/", label: "All tools" },
  { href: "/categories/", label: "Categories" },
  { href: "/guides/", label: "Guides" },
  { href: "/about/", label: "About" },
] as const;

export const footerLinkGroups = [
  {
    title: "Explore",
    links: [
      { href: "/tools/", label: "All tools" },
      { href: "/categories/", label: "Categories" },
      { href: "/guides/", label: "Guides" },
      { href: "/roadmap/", label: "Roadmap" },
    ],
  },
  {
    title: "Company",
    links: [
      { href: "/about/", label: "About Tools" },
      { href: "/contact/", label: "Contact" },
      { href: "/editorial-policy/", label: "Editorial policy" },
      { href: "/accessibility/", label: "Accessibility" },
    ],
  },
  {
    title: "Legal",
    links: [
      { href: "/privacy-policy/", label: "Privacy policy" },
      { href: "/terms/", label: "Terms of service" },
      { href: "/disclaimer/", label: "Disclaimer" },
      { href: "/cookies/", label: "Cookie policy" },
    ],
  },
] as const;
