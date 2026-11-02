import { describe, expect, it } from "vitest";
import {
  liveTools,
  relatedTools,
  searchIndex,
  toolCountByCategory,
  tools,
  validateToolCatalogue,
} from "@/lib/tools/registry";
import { categories } from "@/lib/tools/categories";
import { toolComponents } from "@/tools/registry";
import { guides } from "@/lib/guides";

describe("tool catalogue", () => {
  it("passes structural validation", () => {
    expect(validateToolCatalogue()).toEqual([]);
  });

  it("contains at least 40 live tools", () => {
    expect(liveTools.length).toBeGreaterThanOrEqual(40);
  });

  it("has a unique, URL-safe slug for every tool", () => {
    const slugs = tools.map((tool) => tool.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
    for (const slug of slugs) {
      expect(slug).toMatch(/^[a-z0-9]+(?:-[a-z0-9]+)*$/);
    }
  });

  it("gives every live tool a registered component", () => {
    const missing = liveTools.filter((tool) => !toolComponents[tool.slug]);
    expect(missing.map((tool) => tool.slug)).toEqual([]);
  });

  it("does not register components for tools that are not live", () => {
    const orphaned = Object.keys(toolComponents).filter(
      (slug) => !liveTools.some((tool) => tool.slug === slug),
    );
    expect(orphaned).toEqual([]);
  });

  it("assigns every tool to a known category", () => {
    const ids = new Set(categories.map((category) => category.id));
    for (const tool of tools) {
      expect(ids.has(tool.category)).toBe(true);
    }
  });

  it("keeps SEO titles within a search-friendly length", () => {
    for (const tool of tools) {
      expect(tool.seoTitle.length).toBeLessThanOrEqual(65);
      expect(tool.seoDescription.length).toBeGreaterThanOrEqual(70);
      expect(tool.seoDescription.length).toBeLessThanOrEqual(175);
    }
  });

  it("provides substantive editorial content on every tool page", () => {
    for (const tool of tools) {
      const live = tool.status === "live";
      expect(tool.content.intro.length).toBeGreaterThanOrEqual(1);
      expect(tool.content.howTo.length).toBeGreaterThanOrEqual(3);
      expect(tool.content.examples.length).toBeGreaterThanOrEqual(live ? 2 : 1);
      expect(tool.content.limitations.length).toBeGreaterThanOrEqual(2);
      expect(tool.content.faqs.length).toBeGreaterThanOrEqual(live ? 3 : 2);
    }
  });

  it("does not duplicate FAQ questions within a tool", () => {
    for (const tool of tools) {
      const questions = tool.content.faqs.map((faq) => faq.q);
      expect(new Set(questions).size).toBe(questions.length);
    }
  });

  it("returns related tools that exclude the current tool", () => {
    const related = relatedTools("word-counter", 4);
    expect(related.length).toBeLessThanOrEqual(4);
    expect(related.some((tool) => tool.slug === "word-counter")).toBe(false);
  });

  it("counts live tools per category consistently", () => {
    const total = Object.values(toolCountByCategory).reduce((sum, count) => sum + count, 0);
    expect(total).toBe(liveTools.length);
  });

  it("builds a search index covering every live tool", () => {
    expect(searchIndex).toHaveLength(liveTools.length);
    for (const entry of searchIndex) {
      expect(entry.keywords.length).toBeGreaterThanOrEqual(3);
    }
  });
});

describe("guides", () => {
  it("link only to tools that exist and are live", () => {
    for (const guide of guides) {
      for (const slug of guide.toolSlugs) {
        const tool = liveTools.find((candidate) => candidate.slug === slug);
        expect(tool, `${guide.slug} references missing tool ${slug}`).toBeDefined();
      }
    }
  });

  it("have unique slugs", () => {
    const slugs = guides.map((guide) => guide.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
  });
});
