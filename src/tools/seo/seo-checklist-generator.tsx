"use client";

import { ChecklistTool, type ChecklistSection } from "@/components/tools/checklist-tool";

const SECTIONS: ChecklistSection[] = [
  {
    title: "Foundations",
    items: [
      "Every page has one unique <title> under ~60 characters",
      "Every page has a meta description written for people",
      "One H1 per page, with a sensible H2/H3 outline",
      "Canonical tags are absolute and self-referencing",
      "HTTPS everywhere, with http redirecting to https",
      "www or non-www chosen once and redirected",
    ],
  },
  {
    title: "Crawlability",
    items: [
      "robots.txt allows Googlebot and points at the sitemap",
      "sitemap.xml lists canonical, indexable URLs only",
      "No accidental noindex on pages that should rank",
      "Navigation is real links, not JavaScript-only handlers",
      "No orphan pages — everything is reachable in two or three clicks",
    ],
  },
  {
    title: "Content quality",
    items: [
      "Each page answers one clear question, better than competitors",
      "No thin pages repeating the same template with a swapped keyword",
      "Internal links use descriptive anchor text",
      "Images have alt text describing their purpose",
      "Content is original, with worked examples and honest limits",
    ],
  },
  {
    title: "Structured data",
    items: [
      "Article, Product or LocalBusiness markup where it applies",
      "FAQ markup only for visible question/answer content",
      "Structured data validates in the Rich Results Test",
      "Breadcrumbs both visible and marked up",
    ],
  },
  {
    title: "Performance and mobile",
    items: [
      "Largest Contentful Paint under 2.5s on a mid-range phone",
      "No layout shift from late-loading images or fonts",
      "Tap targets at least 44px and readable type without zooming",
      "Images served at the size they are displayed",
    ],
  },
  {
    title: "Measurement",
    items: [
      "Search Console verified and sitemap submitted",
      "Analytics respects consent and stores nothing unnecessary",
      "A baseline report saved before launch",
    ],
  },
];

export default function SeoChecklistGenerator() {
  return (
    <ChecklistTool
      id="seo-checklist"
      storageKey="tools.seo-checklist"
      intro="A working checklist for a content site or tool site: technical foundations first, then content quality, then measurement. Tick what is already true — the unticked items are the actual task list."
      sections={SECTIONS}
    />
  );
}
