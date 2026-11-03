import { describe, expect, it } from "vitest";
import {
  clamp,
  cn,
  formatBytes,
  formatCompact,
  formatCurrency,
  formatDuration,
  formatNumber,
  parseIsoDate,
  parseNumber,
  pluralize,
  round,
  toIsoDate,
} from "../src/lib/utils";
import {
  COMMON_ZONES,
  formatInZone,
  formatOffset,
  localHourInZone,
  zoneOffsetMs,
  zonedTimeToInstant,
} from "../src/lib/timezone";
import { absoluteUrl, categoryKeywords, mergeKeywords, pageMetadata, toolMetadata } from "../src/lib/seo";
import { footerLinkGroups, navLinks, siteConfig } from "../src/lib/site";
import { categories } from "../src/lib/tools/categories";

/**
 * The helpers every tool leans on. These had no direct tests: a rounding or
 * parsing slip in `utils` would quietly change the answer of half the site, and
 * a wrong offset in `timezone` would shift every clock tool by an hour.
 */

describe("number formatting and parsing", () => {
  it("rounds halves away from zero, symmetrically", () => {
    expect(round(2.345, 2)).toBe(2.35);
    expect(round(-2.345, 2)).toBe(-2.35);
    expect(round(1.005, 2)).toBe(1.01);
    expect(round(9.999, 0)).toBe(10);
    expect(round(-0.125, 2)).toBe(-0.13);
    expect(round(0.1 + 0.2, 2)).toBe(0.3);
  });

  it("parses the messy input visitors actually paste", () => {
    expect(parseNumber("1,234.5")).toBe(1234.5);
    expect(parseNumber("  42 ")).toBe(42);
    expect(parseNumber("-3.5")).toBe(-3.5);
    expect(parseNumber("1e3")).toBe(1000);
    expect(Number.isNaN(parseNumber("not a number"))).toBe(true);
    expect(Number.isNaN(parseNumber(""))).toBe(true);
  });

  it("formats numbers, currency and compact figures", () => {
    expect(formatNumber(1234.5678, 2)).toBe("1,234.57");
    expect(formatNumber(0.1 + 0.2, 4)).toBe("0.3");
    expect(formatCurrency(1234.5)).toContain("1,234.50");
    expect(formatCompact(1_500_000)).toBe("1.5M");
    expect(formatCompact(2_400)).toBe("2.4K");
  });

  it("formats byte sizes", () => {
    expect(formatBytes(0)).toBe("0 B");
    expect(formatBytes(512)).toBe("512 B");
    expect(formatBytes(1536)).toBe("1.5 KB");
    expect(formatBytes(1024 * 1024)).toBe("1 MB");
  });

  it("formats durations in words", () => {
    expect(formatDuration(0)).toBe("0 sec");
    expect(formatDuration(65)).toBe("1 min 5 sec");
    expect(formatDuration(3725)).toBe("1 hr 2 min");
    expect(formatDuration(90_000)).toBe("1 d 1 hr");
    expect(formatDuration(-5)).toBe("0 sec");
    expect(formatDuration(Number.NaN)).toBe("0 sec");
  });

  it("clamps and pluralises", () => {
    expect(clamp(5, 0, 10)).toBe(5);
    expect(clamp(-1, 0, 10)).toBe(0);
    expect(clamp(11, 0, 10)).toBe(10);
    expect(pluralize(1, "tool")).toBe("tool");
    expect(pluralize(2, "tool")).toBe("tools");
    expect(pluralize(2, "category", "categories")).toBe("categories");
  });

  it("joins class names without empties", () => {
    expect(cn("a", false, null, undefined, "b")).toBe("a b");
  });

  it("round-trips ISO dates", () => {
    const date = new Date("2026-03-04T00:00:00.000Z");
    expect(toIsoDate(date)).toBe("2026-03-04");
    expect(parseIsoDate("2026-03-04")?.toISOString().slice(0, 10)).toBe("2026-03-04");
    expect(parseIsoDate("")).toBeNull();
    expect(parseIsoDate("not-a-date")).toBeNull();
  });
});

describe("time zones", () => {
  const instant = new Date("2026-01-15T12:00:00.000Z");

  it("knows the offset of a winter and a summer instant", () => {
    expect(zoneOffsetMs(new Date("2026-01-15T12:00:00Z"), "Europe/London")).toBe(0);
    expect(zoneOffsetMs(new Date("2026-07-15T12:00:00Z"), "Europe/London")).toBe(60 * 60 * 1000);
    expect(zoneOffsetMs(new Date("2026-01-15T12:00:00Z"), "America/New_York")).toBe(-5 * 60 * 60 * 1000);
  });

  it("converts a wall-clock time in a zone back to an instant", () => {
    const berlinWinter = zonedTimeToInstant("Europe/Berlin", 2026, 1, 15, 13, 0);
    expect(berlinWinter.toISOString()).toBe("2026-01-15T12:00:00.000Z");
    const berlinSummer = zonedTimeToInstant("Europe/Berlin", 2026, 7, 15, 13, 0);
    expect(berlinSummer.toISOString()).toBe("2026-07-15T11:00:00.000Z");
    const newYork = zonedTimeToInstant("America/New_York", 2026, 1, 15, 7, 0);
    expect(newYork.toISOString()).toBe("2026-01-15T12:00:00.000Z");
  });

  it("formats the same instant differently per zone", () => {
    expect(formatInZone(instant, "UTC")).toContain("12:00");
    expect(formatInZone(instant, "Asia/Tokyo")).toContain("21:00");
    expect(formatOffset(instant, "Asia/Kolkata")).toBe("UTC+05:30");
    expect(formatOffset(instant, "America/New_York")).toBe("UTC−05:00");
    expect(localHourInZone(instant, "Asia/Tokyo")).toBe(21);
  });

  it("lists zones with unique identifiers", () => {
    expect(COMMON_ZONES.length).toBeGreaterThan(10);
    expect(new Set(COMMON_ZONES.map((zone) => zone.id)).size).toBe(COMMON_ZONES.length);
  });
});

describe("SEO helpers", () => {
  it("builds absolute URLs", () => {
    expect(absoluteUrl("/tools/")).toBe(`${siteConfig.url}/tools/`);
    expect(absoluteUrl("tools/")).toBe(`${siteConfig.url}/tools/`);
    expect(absoluteUrl("https://example.org/x")).toBe("https://example.org/x");
  });

  it("merges keywords case-insensitively, de-duplicates and caps the list", () => {
    expect(mergeKeywords(["Word Counter"], ["word counter", "Text Tool"])).toEqual([
      "word counter",
      "text tool",
    ]);
    expect(mergeKeywords(Array.from({ length: 60 }, (_, index) => `k${index}`))).toHaveLength(40);
  });

  it("covers every category with a keyword cluster", () => {
    for (const category of categories) {
      expect(categoryKeywords[category.id].length, category.id).toBeGreaterThanOrEqual(12);
    }
  });

  it("emits a canonical, description and Open Graph image for a page", () => {
    const metadata = pageMetadata({
      title: "Example",
      description: "A description",
      path: "/example/",
    });
    expect(metadata.alternates?.canonical).toBe(`${siteConfig.url}/example/`);
    expect(metadata.openGraph?.images).toBeTruthy();
    expect(metadata.description).toBe("A description");
  });

  it("points each tool at its category Open Graph card", () => {
    const metadata = toolMetadata({
      slug: "word-counter",
      name: "Word Counter",
      tagline: "Count words",
      seoTitle: "Word Counter",
      seoDescription: "Count words as you type",
      keywords: ["word counter"],
      category: "text",
      addedAt: "2026-01-01",
    } as never);
    expect(JSON.stringify(metadata.openGraph?.images)).toContain("/og/text.png");
  });
});

describe("site configuration", () => {
  it("uses the plain name and a canonical origin without a trailing slash", () => {
    expect(siteConfig.name).toBe("Toolz");
    expect(siteConfig.url).toBe("https://toolz.name.ng");
    expect(siteConfig.url.endsWith("/")).toBe(false);
    expect(siteConfig.url.startsWith("https://")).toBe(true);
  });

  it("keeps navigation and footer links on real routes", () => {
    const hrefs = [
      ...navLinks.map((item) => item.href),
      ...footerLinkGroups.flatMap((group) => group.links.map((link) => link.href)),
    ];
    for (const href of hrefs) {
      expect(href.startsWith("/"), href).toBe(true);
      expect(href.endsWith("/"), href).toBe(true);
    }
  });
});
