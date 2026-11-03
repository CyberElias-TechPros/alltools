import { describe, expect, it } from "vitest";
import {
  analyseHeadings,
  analyseImageAlts,
  analyseLinks,
  analysePageSource,
  buildHreflang,
  buildSchema,
  clusterKeywords,
  countSyllables,
  describeUrlPath,
  estimateSerpWidth,
  keywordDensity,
  outlineFromHtml,
  parseRobots,
  readability,
  snippetChecks,
  testRobots,
  validateJsonLd,
  validateSitemap,
  wordFrequency,
} from "@/lib/seo-tools";

const EMPTY_SCHEMA = {
  name: "",
  url: "",
  description: "",
  image: "",
  author: "",
  publisher: "",
  datePublished: "",
  price: "",
  currency: "",
  telephone: "",
  address: "",
  faqs: [],
  breadcrumbs: [],
};

describe("readability", () => {
  it("counts syllables sensibly", () => {
    expect(countSyllables("cat")).toBe(1);
    expect(countSyllables("banana")).toBe(3);
    expect(countSyllables("readability")).toBeGreaterThanOrEqual(4);
    expect(countSyllables("")).toBe(0);
  });

  it("scores simple prose higher than dense prose", () => {
    const simple = readability("The cat sat on the mat. It was warm. The dog ran.");
    const dense = readability(
      "Notwithstanding the aforementioned considerations, the implementation necessitates comprehensive reconfiguration of interconnected administrative infrastructures.",
    );
    expect(simple.fleschReadingEase).toBeGreaterThan(dense.fleschReadingEase);
    expect(dense.fleschKincaidGrade).toBeGreaterThan(simple.fleschKincaidGrade);
    expect(simple.verdict).toMatch(/easy/i);
  });

  it("handles empty input without NaN", () => {
    const scores = readability("");
    expect(Number.isFinite(scores.fleschReadingEase)).toBe(true);
    expect(scores.words).toBe(0);
  });
});

describe("keyword tools", () => {
  it("counts density and ignores stop words in frequency", () => {
    const text = "unit converter does unit conversion. The unit converter is quick.";
    expect(keywordDensity(text, "unit converter").count).toBe(2);
    const rows = wordFrequency(text, 5);
    expect(rows[0].term).toBe("unit");
    expect(rows.some((row) => row.term === "the")).toBe(false);
  });

  it("clusters keywords by shared tokens", () => {
    const { clusters, ungrouped } = clusterKeywords("json formatter\njson minifier\ncsv to json\nunrelated phrase");
    expect(clusters.map((cluster) => cluster.label)).toContain("json");
    expect(clusters.find((cluster) => cluster.label === "json")?.keywords).toHaveLength(3);
    expect(ungrouped).toContain("unrelated phrase");
  });
});

describe("html structure", () => {
  const html = `<h1>Title</h1><h2>One</h2><h4>Deep</h4><h2>Two</h2>`;

  it("builds an outline and flags skipped levels", () => {
    const report = analyseHeadings(html);
    expect(report.counts[1]).toBe(1);
    expect(report.counts[4]).toBe(1);
    expect(report.issues.join(" ")).toMatch(/H2 to H4/);
    expect(outlineFromHtml(html)).toContain("## One");
  });

  it("reports missing and empty alt attributes", () => {
    const report = analyseImageAlts(
      '<img src="a.jpg" alt="A cat"><img src="b.jpg" alt=""><img src="c.jpg">',
    );
    expect(report.total).toBe(3);
    expect(report.decorative).toBe(1);
    expect(report.missing).toEqual([{ src: "c.jpg" }]);
  });

  it("classifies internal and external links", () => {
    const report = analyseLinks(
      '<a href="/a">A</a><a href="https://example.com/b">B</a><a href="https://other.com/c" rel="nofollow">C</a><a href="/a">A again</a><a href="/d">Click here</a>',
      "example.com",
    );
    expect(report.internal).toBe(4);
    expect(report.external).toBe(1);
    expect(report.nofollow).toBe(1);
    expect(report.genericAnchor).toBe(1);
    expect(report.duplicateHrefs[0]).toEqual({ href: "/a", count: 2 });
  });

  it("measures page source composition", () => {
    const report = analysePageSource(
      '<script src="/a.js"></script><script>let x = 1;</script><style>.a{color:red}</style><img src="a.png">',
    );
    expect(report.externalScripts).toBe(1);
    expect(report.inlineScripts).toBe(1);
    expect(report.inlineStyles).toBe(1);
    expect(report.images).toBe(1);
    expect(report.bytes).toBeGreaterThan(20);
  });
});

describe("robots.txt", () => {
  const file = `User-agent: *
Disallow: /admin/
Disallow: /*.pdf$
Allow: /admin/public/

Sitemap: https://example.com/sitemap.xml`;

  it("parses groups and sitemaps", () => {
    const parsed = parseRobots(file);
    expect(parsed.groups).toHaveLength(1);
    expect(parsed.groups[0].rules).toHaveLength(3);
    expect(parsed.sitemaps).toEqual(["https://example.com/sitemap.xml"]);
    expect(parsed.issues).toHaveLength(0);
  });

  it("applies longest-match rules", () => {
    expect(testRobots(file, "/admin/dashboard").allowed).toBe(false);
    expect(testRobots(file, "/admin/public/help").allowed).toBe(true);
    expect(testRobots(file, "/blog/post").allowed).toBe(true);
    expect(testRobots(file, "/pricing.pdf").allowed).toBe(false);
    expect(testRobots(file, "/pricing.pdf?x=1").allowed).toBe(true);
  });

  it("names unknown directives", () => {
    const parsed = parseRobots("User-agent: *\nDisallow: /\nNonsense: yes");
    expect(parsed.issues.join(" ")).toMatch(/unknown directive/);
  });
});

describe("sitemap validation", () => {
  const good = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url><loc>https://example.com/</loc><lastmod>2025-01-01</lastmod><priority>0.8</priority></url>
</urlset>`;

  it("accepts a valid sitemap", () => {
    const report = validateSitemap(good);
    expect(report.valid).toBe(true);
    expect(report.urlCount).toBe(1);
  });

  it("flags namespace, relative URLs and invalid values", () => {
    const report = validateSitemap(
      "<urlset><url><loc>/relative</loc><lastmod>01/01/2025</lastmod><priority>2</priority></url></urlset>",
    );
    expect(report.valid).toBe(false);
    const messages = report.issues.map((issue) => issue.message).join(" | ");
    expect(messages).toMatch(/namespace/);
    expect(messages).toMatch(/Not absolute/);
    expect(messages).toMatch(/lastmod/);
    expect(messages).toMatch(/Priority/);
  });
});

describe("schema builders", () => {
  it("builds an FAQPage", () => {
    const { json, issues } = buildSchema({
      ...EMPTY_SCHEMA,
      kind: "FAQPage",
      faqs: [{ question: "Q?", answer: "A." }],
    });
    const parsed = JSON.parse(json);
    expect(parsed["@type"]).toBe("FAQPage");
    expect(parsed.mainEntity[0].acceptedAnswer.text).toBe("A.");
    expect(issues).toHaveLength(0);
  });

  it("builds a Product with an offer and complains about a missing price", () => {
    const withPrice = buildSchema({ ...EMPTY_SCHEMA, kind: "Product", name: "Widget", url: "https://example.com/w", price: "19.00", currency: "gbp" });
    const parsed = JSON.parse(withPrice.json);
    expect(parsed.offers.priceCurrency).toBe("gbp");
    const withoutPrice = buildSchema({ ...EMPTY_SCHEMA, kind: "Product", name: "Widget", url: "https://example.com/w" });
    expect(withoutPrice.issues.join(" ")).toMatch(/price/);
  });

  it("requires names and addresses where the type needs them", () => {
    const article = buildSchema({ ...EMPTY_SCHEMA, kind: "Article" });
    expect(article.issues.join(" ")).toMatch(/name/i);
    const business = buildSchema({ ...EMPTY_SCHEMA, kind: "LocalBusiness", name: "Shop", url: "https://example.com" });
    expect(business.issues.join(" ")).toMatch(/address/);
  });

  it("builds breadcrumbs with positions", () => {
    const { json } = buildSchema({
      ...EMPTY_SCHEMA,
      kind: "BreadcrumbList",
      breadcrumbs: [
        { name: "Home", url: "https://example.com/" },
        { name: "Tools", url: "https://example.com/tools" },
      ],
    });
    const parsed = JSON.parse(json);
    expect(parsed.itemListElement[1].position).toBe(2);
  });
});

describe("json-ld validation", () => {
  it("accepts a valid article block", () => {
    const report = validateJsonLd(
      '{"@context":"https://schema.org","@type":"Article","headline":"Hi","datePublished":"2025-01-01"}',
    );
    expect(report.valid).toBe(true);
    expect(report.types).toContain("Article");
  });

  it("reads a full script tag", () => {
    const report = validateJsonLd('<script type="application/ld+json">{"@context":"https://schema.org","@type":"WebSite"}</script>');
    expect(report.valid).toBe(true);
  });

  it("rejects invalid JSON and missing types", () => {
    expect(validateJsonLd("{oops").valid).toBe(false);
    const noType = validateJsonLd('{"@context":"https://schema.org","name":"x"}');
    expect(noType.issues.some((issue) => issue.level === "error")).toBe(true);
  });
});

describe("hreflang and snippets", () => {
  it("validates language codes and absolute URLs", () => {
    const { html, issues } = buildHreflang(
      [
        { language: "en-GB", url: "https://example.com/en/" },
        { language: "english", url: "https://example.com/en/" },
        { language: "de-DE", url: "/de/" },
      ],
      true,
    );
    expect(html).toContain('hreflang="en-GB"');
    expect(html).toContain('hreflang="x-default"');
    expect(issues.join(" ")).toMatch(/english/);
    expect(issues.join(" ")).toMatch(/absolute/);
  });

  it("estimates pixel widths and flags long titles", () => {
    expect(estimateSerpWidth("iiii").pixels).toBeLessThan(estimateSerpWidth("MMMM").pixels);
    const checks = snippetChecks({
      title: "x".repeat(100),
      description: "short",
      url: "https://example.com",
      siteName: "Example",
    });
    expect(checks.some((check) => check.level === "warning")).toBe(true);
  });

  it("formats a breadcrumb path", () => {
    expect(describeUrlPath("https://www.example.com/blog/first-post")).toBe("example.com › blog › first post");
  });
});
