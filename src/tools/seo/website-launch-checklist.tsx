"use client";

import { ChecklistTool, type ChecklistSection } from "@/components/tools/checklist-tool";

const SECTIONS: ChecklistSection[] = [
  {
    title: "Before the switch",
    items: [
      "Staging site reviewed on a real phone, not just a resized window",
      "Every internal link and button clicked once",
      "Forms tested with success and failure cases",
      "404 page in place, with links back into the site",
      "Backups taken and a rollback plan written down",
      "DNS TTL lowered 24 hours before the move",
    ],
  },
  {
    title: "Legal and trust",
    items: [
      "Privacy policy names what is collected and why",
      "Cookie banner only sets cookies after consent",
      "Terms, contact page and editorial policy published",
      "Real business details, not a placeholder address",
      "Every claim on the site is one you can support",
    ],
  },
  {
    title: "Technical",
    items: [
      "HTTPS valid on apex and www",
      "Redirects mapped from every old URL",
      "robots.txt and sitemap.xml live and correct",
      "Custom error pages return the right status codes",
      "Analytics and consent verified in a fresh browser profile",
    ],
  },
  {
    title: "Content",
    items: [
      "No lorem ipsum, no “coming soon” on a linked page",
      "Titles and descriptions written for every indexable page",
      "Images compressed and given descriptive alt text",
      "Spelling and dates checked",
    ],
  },
  {
    title: "After launch",
    items: [
      "DNS propagated and checked from two networks",
      "Search Console re-verified, sitemap resubmitted",
      "Broken-link check run on the live site",
      "Uptime monitoring pointed at the real domain",
      "A first-week analytics baseline recorded",
    ],
  },
];

export default function WebsiteLaunchChecklist() {
  return (
    <ChecklistTool
      id="launch-checklist"
      storageKey="tools.launch-checklist"
      intro="The things that actually break on launch day, ordered by when you need them. Everything here is checkable in an afternoon if the site is genuinely ready — and the items you cannot tick are the ones worth delaying for."
      sections={SECTIONS}
    />
  );
}
