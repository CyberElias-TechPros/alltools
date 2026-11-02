/**
 * Toolora site configuration.
 *
 * IMPORTANT: set NEXT_PUBLIC_SITE_URL in your hosting provider's environment
 * before launch. Every canonical URL, sitemap entry, robots.txt host and
 * structured-data @id is derived from this single value.
 */
const rawUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim();
const fallback = "https://toolora.example.com";

export const siteUrl = (rawUrl || fallback).replace(/\/+$/, "");

/** True when the canonical URL has not been configured yet. */
export const siteUrlIsPlaceholder = siteUrl.includes("example.com");

export const siteConfig = {
  name: "Toolora",
  legalName: "Toolora",
  tagline: "Free online tools that work in your browser",
  description:
    "Toolora is a free collection of fast, privacy-first online tools: text utilities, calculators, developer tools, converters and SEO helpers. No signup, no uploads, no waiting.",
  url: siteUrl,
  locale: "en_US",
  language: "en",
  email: "hello@toolora.example.com",
  /** Set NEXT_PUBLIC_GA_ID to enable consented, aggregate analytics. */
  gaId: process.env.NEXT_PUBLIC_GA_ID?.trim() || "",
  /** Set after AdSense approval to render ad slots. */
  adsenseClient: process.env.NEXT_PUBLIC_ADSENSE_CLIENT?.trim() || "",
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
      { href: "/about/", label: "About Toolora" },
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
