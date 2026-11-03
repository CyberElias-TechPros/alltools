import { describe, expect, it } from "vitest";
import { scoreTool, searchTools, type SearchableTool } from "@/lib/search";

const tools: SearchableTool[] = [
  { slug: "word-counter", name: "Word Counter", tagline: "Count words as you type.", category: "text", keywords: ["word count", "character counter"], popularity: 100 },
  { slug: "json-formatter", name: "JSON Formatter", tagline: "Pretty-print JSON.", category: "developer", keywords: ["json validator", "pretty print"], popularity: 90 },
  { slug: "percentage-calculator", name: "Percentage Calculator", tagline: "Percentages and change.", category: "calculators", keywords: ["percent", "discount"], popularity: 80 },
  { slug: "password-generator", name: "Password Generator", tagline: "Strong random passwords.", category: "security", keywords: ["secure password"], popularity: 70 },
];

describe("scoreTool", () => {
  it("ranks an exact name highest", () => {
    expect(scoreTool(tools[0], "word counter")).toBeGreaterThan(scoreTool(tools[0], "word"));
  });

  it("matches keyword synonyms", () => {
    expect(scoreTool(tools[2], "discount")).toBeGreaterThan(0);
  });

  it("matches category names", () => {
    expect(scoreTool(tools[1], "developer")).toBeGreaterThan(0);
  });

  it("returns zero for an unrelated query", () => {
    expect(scoreTool(tools[3], "zzzzz")).toBe(0);
  });

  it("tolerates multi-word queries", () => {
    expect(scoreTool(tools[1], "format json")).toBeGreaterThan(0);
  });
});

describe("searchTools", () => {
  it("returns popularity-ordered results for an empty query", () => {
    expect(searchTools(tools, "").map((tool) => tool.slug)).toEqual([
      "word-counter",
      "json-formatter",
      "percentage-calculator",
      "password-generator",
    ]);
  });

  it("finds the right tool for a task phrase", () => {
    expect(searchTools(tools, "password")[0].slug).toBe("password-generator");
    expect(searchTools(tools, "json")[0].slug).toBe("json-formatter");
  });

  it("respects the result limit", () => {
    expect(searchTools(tools, "e", 2)).toHaveLength(2);
  });

  it("returns nothing for a nonsense query", () => {
    expect(searchTools(tools, "qqqqq")).toEqual([]);
  });
});
