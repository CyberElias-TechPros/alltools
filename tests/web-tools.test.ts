import { describe, expect, it } from "vitest";
import {
  analyseDomain,
  calculateSubnet,
  ipv4ToBinary,
  ipv4ToString,
  parseIpv4,
  parseUrl,
  parseUserAgent,
  validateUrl,
} from "@/lib/web";
import { buildMetaTags, buildSitemap, checkCanonical, extractHead } from "@/lib/tags";
import { findStatus, STATUS_CODES } from "@/lib/http";

describe("url parsing", () => {
  it("splits a full URL into parts", () => {
    const { parsed } = parseUrl("https://user@example.com:8443/a/b?x=1&y=two#top");
    expect(parsed?.protocol).toBe("https");
    expect(parsed?.hostname).toBe("example.com");
    expect(parsed?.port).toBe("8443");
    expect(parsed?.pathname).toBe("/a/b");
    expect(parsed?.query).toEqual([
      { key: "x", value: "1" },
      { key: "y", value: "two" },
    ]);
    expect(parsed?.hash).toBe("#top");
  });

  it("assumes https when no scheme is present", () => {
    const { parsed } = parseUrl("example.com/path");
    expect(parsed?.protocol).toBe("https");
    expect(parsed?.assumedScheme).toBe(true);
    expect(parsed?.href).toBe("https://example.com/path");
  });

  it("detects relative paths and rejects spaces", () => {
    expect(parseUrl("/docs/intro").parsed?.relative).toBe(true);
    expect(parseUrl("https://example.com/a b").error).toMatch(/spaces/);
  });

  it("validates urls with actionable warnings", () => {
    expect(validateUrl("https://example.com/page").valid).toBe(true);
    const http = validateUrl("http://example.com/");
    expect(http.warnings.join(" ")).toMatch(/clear text/);
    expect(validateUrl("https://user:pass@example.com").valid).toBe(false);
    // Browsers normalise dot segments before the request is made.
    expect(parseUrl("https://example.com/a/../b").parsed?.pathname).toBe("/b");
  });
});

describe("domain analysis", () => {
  it("decomposes a hostname", () => {
    const result = analyseDomain("https://blog.example.co.uk/post");
    expect("error" in result).toBe(false);
    if ("error" in result) return;
    expect(result.registeredName).toBe("co");
    expect(result.tld).toBe("uk");
    expect(result.subdomainCount).toBe(2);
    expect(result.hostname).toBe("blog.example.co.uk");
  });

  it("flags punycode, hyphens and digits", () => {
    const puny = analyseDomain("xn--mnchen-3ya.de");
    if ("error" in puny) throw new Error("expected a result");
    expect(puny.isPunycode).toBe(true);
    expect(puny.brandScore).toBeLessThan(100);

    const spammy = analyseDomain("cheap-viagra-4-you.tk");
    if ("error" in spammy) throw new Error("expected a result");
    expect(spammy.hyphenCount).toBe(3);
    expect(spammy.tldLooksCommon).toBe(false);
  });

  it("rejects empty input", () => {
    expect("error" in analyseDomain("   ")).toBe(true);
  });
});

describe("ipv4 and subnets", () => {
  it("parses and formats addresses", () => {
    expect(parseIpv4("192.168.1.10")).toBe(3232235786);
    expect(parseIpv4("256.1.1.1")).toBeNull();
    expect(ipv4ToString(3232235786)).toBe("192.168.1.10");
    expect(ipv4ToBinary(3232235786)).toBe("11000000.10101000.00000001.00001010");
  });

  it("calculates a /26 subnet", () => {
    const result = calculateSubnet("192.168.1.70", 26);
    if ("error" in result) throw new Error(result.error);
    expect(result.mask).toBe("255.255.255.192");
    expect(result.network).toBe("192.168.1.64");
    expect(result.broadcast).toBe("192.168.1.127");
    expect(result.firstHost).toBe("192.168.1.65");
    expect(result.lastHost).toBe("192.168.1.126");
    expect(result.usableHosts).toBe(62);
    expect(result.isPrivate).toBe(true);
    expect(result.kind).toMatch(/Private/);
  });

  it("handles /31, /32 and invalid input", () => {
    const p2p = calculateSubnet("10.0.0.1", 31);
    if ("error" in p2p) throw new Error(p2p.error);
    expect(p2p.usableHosts).toBe(2);
    expect(p2p.firstHost).toBe("10.0.0.0");

    const host = calculateSubnet("8.8.8.8", 32);
    if ("error" in host) throw new Error(host.error);
    expect(host.totalAddresses).toBe(1);
    expect(host.kind).toBe("Public unicast");

    expect("error" in calculateSubnet("8.8.8.8", 33)).toBe(true);
  });
});

describe("user agent parsing", () => {
  it("identifies chrome on windows", () => {
    const result = parseUserAgent(
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36",
    );
    if ("error" in result) throw new Error(result.error);
    expect(result.browser).toEqual({ name: "Chrome", version: "126.0.0.0" });
    expect(result.engine).toBe("Blink");
    expect(result.os.name).toBe("Windows");
    expect(result.device.type).toBe("desktop");
  });

  it("identifies edge, safari and ios", () => {
    const edge = parseUserAgent(
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36 Edg/126.0.2592.87",
    );
    if ("error" in edge) throw new Error(edge.error);
    expect(edge.browser.name).toBe("Microsoft Edge");

    const safari = parseUserAgent(
      "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4 Safari/605.1.15",
    );
    if ("error" in safari) throw new Error(safari.error);
    expect(safari.browser.name).toBe("Safari");
    expect(safari.os.name).toBe("macOS");

    const ios = parseUserAgent(
      "Mozilla/5.0 (iPhone; CPU iPhone OS 17_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4 Mobile/15E148 Safari/604.1",
    );
    if ("error" in ios) throw new Error(ios.error);
    expect(ios.os.name).toBe("iOS");
    expect(ios.device.type).toBe("mobile");
    expect(ios.device.vendor).toBe("Apple");
  });

  it("flags bots", () => {
    const bot = parseUserAgent("Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)");
    if ("error" in bot) throw new Error(bot.error);
    expect(bot.isBot).toBe(true);
    expect(bot.device.type).toBe("bot");
  });
});

describe("http status reference", () => {
  it("contains the expected codes and unique numbers", () => {
    expect(findStatus(404)?.name).toBe("Not Found");
    expect(findStatus(500)?.klass).toBe("5xx");
    expect(findStatus(999)).toBeUndefined();
    expect(new Set(STATUS_CODES.map((status) => status.code)).size).toBe(STATUS_CODES.length);
  });
});

describe("head extraction", () => {
  const html = `<!doctype html><html lang="en"><head>
    <meta charset="utf-8" />
    <title>Example — Tools</title>
    <meta name="description" content="A description &amp; more" />
    <link rel="canonical" href="https://example.com/page" />
    <meta property="og:title" content="OG title" />
    <meta name="twitter:card" content="summary_large_image" />
    <link rel="icon" href="/favicon.ico" />
  </head><body><h1>Hello</h1></body></html>`;

  it("reads the important tags", () => {
    const head = extractHead(html);
    expect(head.title).toBe("Example — Tools");
    expect(head.description).toBe("A description & more");
    expect(head.canonical).toBe("https://example.com/page");
    expect(head.openGraph.title).toBe("OG title");
    expect(head.twitter.card).toBe("summary_large_image");
    expect(head.lang).toBe("en");
    expect(head.h1).toBe("Hello");
    expect(head.icons).toEqual(["/favicon.ico"]);
    expect(head.canonicalCount).toBe(1);
  });

  it("reports duplicate meta names", () => {
    const head = extractHead('<meta name="robots" content="index"><meta name="robots" content="noindex">');
    expect(head.duplicateNames).toContain("robots");
  });
});

describe("meta tag builder", () => {
  it("produces the expected tags and checks", () => {
    const { html, checks } = buildMetaTags({
      title: "A reasonable page title for testing",
      description:
        "This description is long enough to sit inside the recommended range for search snippets without being cut off.",
      url: "https://example.com/page",
      siteName: "Example",
      image: "https://example.com/og.png",
      type: "website",
      twitterCard: "summary_large_image",
      twitterSite: "@example",
      locale: "en_GB",
      noindex: false,
    });
    expect(html).toContain('<link rel="canonical" href="https://example.com/page" />');
    expect(html).toContain('<meta property="og:image" content="https://example.com/og.png" />');
    expect(html).toContain('<meta name="twitter:card" content="summary_large_image" />');
    expect(checks.filter((check) => check.level === "error")).toHaveLength(0);
  });

  it("flags a missing url and short description", () => {
    const { checks } = buildMetaTags({
      title: "Hi",
      description: "Too short",
      url: "",
      siteName: "",
      image: "",
      type: "website",
      twitterCard: "summary",
      twitterSite: "",
      locale: "",
      noindex: true,
    });
    expect(checks.some((check) => check.level === "error" && check.message.includes("canonical URL"))).toBe(true);
    expect(checks.some((check) => check.message.includes("noindex"))).toBe(true);
  });
});

describe("sitemap builder", () => {
  it("writes valid XML and de-duplicates", () => {
    const { xml, urlCount, issues } = buildSitemap([
      { url: "https://example.com/", lastmod: "2025-01-01", changefreq: "weekly", priority: "1.0" },
      { url: "https://example.com/about" },
      { url: "https://example.com/" },
      { url: "/relative-path" },
      { url: "https://example.com/q?a=1&b=2" },
    ]);
    expect(urlCount).toBe(3);
    expect(xml).toContain("<loc>https://example.com/q?a=1&amp;b=2</loc>");
    expect(xml).toContain("<changefreq>weekly</changefreq>");
    expect(issues).toHaveLength(2);
  });

  it("drops invalid lastmod and priority values", () => {
    const { xml, issues } = buildSitemap([
      { url: "https://example.com/a", lastmod: "01/01/2025", priority: "2" },
    ]);
    expect(xml).not.toContain("<lastmod>");
    expect(issues).toHaveLength(2);
  });
});

describe("canonical checks", () => {
  it("accepts a self-referencing canonical", () => {
    const report = checkCanonical(
      `<html><head><title>Page</title><link rel="canonical" href="https://example.com/page"><meta name="description" content="${"x".repeat(80)}"></head></html>`,
      "https://example.com/page",
    );
    expect(report.canonical).toBe("https://example.com/page");
    expect(report.issues.filter((issue) => issue.level === "error")).toHaveLength(0);
  });

  it("catches missing, relative and duplicated canonicals", () => {
    expect(checkCanonical("<title>x</title>", "https://example.com/").issues[0].message).toMatch(/No canonical/);
    const relative = checkCanonical('<title>x</title><link rel="canonical" href="/page">', "https://example.com/page");
    expect(relative.issues.some((issue) => issue.level === "error")).toBe(true);
    const duplicate = checkCanonical(
      '<link rel="canonical" href="https://a.com"><link rel="canonical" href="https://b.com">',
      "https://a.com",
    );
    expect(duplicate.issues.some((issue) => issue.message.includes("2 canonical"))).toBe(true);
  });
});
