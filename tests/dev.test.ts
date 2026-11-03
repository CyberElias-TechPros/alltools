import { describe, expect, it } from "vitest";
import {
  contrastRatio,
  decodeBase64,
  decodeJwt,
  encodeBase64,
  encodeHtmlEntities,
  formatJson,
  hslToRgb,
  parseColor,
  rgbToHex,
  rgbToHsl,
} from "@/lib/dev";
import { diffLines, diffWords } from "@/lib/diff";
import { collectMatches, escapeRegExp } from "@/lib/regex";

describe("Base64", () => {
  it("round-trips ASCII text", () => {
    expect(encodeBase64("hello")).toBe("aGVsbG8=");
    expect(decodeBase64("aGVsbG8=")).toBe("hello");
  });

  it("round-trips UTF-8 text and emoji", () => {
    const text = "Café ☕ 日本";
    expect(decodeBase64(encodeBase64(text))).toBe(text);
  });

  it("produces URL-safe output without padding", () => {
    const encoded = encodeBase64("<<???>>>", true);
    expect(encoded).not.toMatch(/[+/=]/);
    expect(decodeBase64(encoded)).toBe("<<???>>>");
  });
});

describe("HTML entities", () => {
  it("escapes the five reserved characters", () => {
    expect(encodeHtmlEntities(`<a href="x">Tom & Jerry's</a>`)).toBe(
      "&lt;a href=&quot;x&quot;&gt;Tom &amp; Jerry&#39;s&lt;/a&gt;",
    );
  });

  it("optionally escapes non-ASCII characters numerically", () => {
    expect(encodeHtmlEntities("café", true)).toBe("caf&#233;");
  });
});

describe("JSON formatting", () => {
  it("pretty-prints valid JSON", () => {
    const result = formatJson('{"a":1}');
    expect(result.error).toBeUndefined();
    expect(result.output).toBe('{\n  "a": 1\n}');
    expect(result.minified).toBe('{"a":1}');
  });

  it("sorts keys recursively when asked", () => {
    const result = formatJson('{"b":1,"a":{"d":2,"c":3}}', 2, true);
    expect(result.output.indexOf('"a"')).toBeLessThan(result.output.indexOf('"b"'));
    expect(result.output.indexOf('"c"')).toBeLessThan(result.output.indexOf('"d"'));
  });

  it("reports an error for invalid JSON", () => {
    const result = formatJson('{"a":1,}');
    expect(result.error).toBeDefined();
    expect(result.output).toBe("");
  });
});

describe("JWT decoding", () => {
  const token =
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9." +
    "eyJzdWIiOiIxMjMiLCJleHAiOjE5MDAwMDAwMDB9." +
    "signature";

  it("decodes the header and payload", () => {
    const decoded = decodeJwt(token);
    expect(decoded.header?.alg).toBe("HS256");
    expect(decoded.payload?.sub).toBe("123");
    expect(decoded.expired).toBe(false);
  });

  it("rejects a malformed token", () => {
    expect(decodeJwt("not-a-jwt").error).toContain("three");
  });

  it("flags an expired token", () => {
    const expired =
      "eyJhbGciOiJIUzI1NiJ9." + encodeBase64(JSON.stringify({ exp: 1000 }), true) + ".sig";
    expect(decodeJwt(expired).expired).toBe(true);
  });
});

describe("colour conversion", () => {
  it("parses hex, rgb and hsl", () => {
    expect(parseColor("#4f46e5")).toEqual({ r: 79, g: 70, b: 229, a: 1 });
    expect(parseColor("rgb(79, 70, 229)")).toEqual({ r: 79, g: 70, b: 229, a: 1 });
    const fromHsl = parseColor("hsl(243, 75%, 59%)");
    // HSL is a rounded representation, so allow a small rounding drift.
    expect(fromHsl?.r).toBeCloseTo(79, -1);
  });

  it("shorthand hex expands correctly", () => {
    expect(parseColor("#fff")).toEqual({ r: 255, g: 255, b: 255, a: 1 });
  });

  it("converts rgb to hex and back", () => {
    const rgb = { r: 79, g: 70, b: 229, a: 1 };
    expect(rgbToHex(rgb)).toBe("#4f46e5");
    expect(parseColor(rgbToHex(rgb))).toEqual(rgb);
  });

  it("converts rgb to hsl", () => {
    const hsl = rgbToHsl({ r: 79, g: 70, b: 229, a: 1 });
    expect(hsl.h).toBe(243);
    expect(hsl.s).toBe(75);
    expect(hsl.l).toBe(59);
  });

  it("round-trips hsl through rgb", () => {
    const rgb = hslToRgb({ h: 210, s: 50, l: 40 });
    const back = rgbToHsl(rgb);
    expect(back.h).toBeCloseTo(210, 0);
  });

  it("computes WCAG contrast ratios", () => {
    const black = { r: 0, g: 0, b: 0, a: 1 };
    const white = { r: 255, g: 255, b: 255, a: 1 };
    expect(contrastRatio(black, white)).toBeCloseTo(21, 5);
    expect(contrastRatio(white, white)).toBeCloseTo(1, 5);
  });

  it("returns null for an unrecognised colour", () => {
    expect(parseColor("not-a-colour")).toBeNull();
  });
});

describe("diff", () => {
  it("detects additions and removals", () => {
    const result = diffLines("a\nb\nc", "a\nc\nd");
    expect(result.removed).toBe(1);
    expect(result.added).toBe(1);
    expect(result.lines.map((line) => line.kind)).toEqual(["same", "removed", "same", "added"]);
  });

  it("reports no changes for identical text", () => {
    const result = diffLines("same\ntext", "same\ntext");
    expect(result.added).toBe(0);
    expect(result.removed).toBe(0);
  });

  it("can ignore whitespace differences", () => {
    const result = diffLines("a  b", "a b", { ignoreWhitespace: true });
    expect(result.added).toBe(0);
    expect(result.removed).toBe(0);
  });

  it("produces word-level parts", () => {
    const parts = diffWords("the quick fox", "the slow fox");
    expect(parts.some((part) => part.kind === "removed" && part.value.includes("quick"))).toBe(true);
    expect(parts.some((part) => part.kind === "added" && part.value.includes("slow"))).toBe(true);
  });
});

describe("regex helpers", () => {
  it("escapes regex metacharacters", () => {
    expect(escapeRegExp("a.b*c")).toBe("a\\.b\\*c");
  });

  it("collects matches with capture groups", () => {
    const result = collectMatches("(\\w+)@(\\w+)", "g", "a@b c@d");
    expect(result.matches).toHaveLength(2);
    expect(result.matches[0].groups).toEqual(["a", "b"]);
  });

  it("reports an invalid pattern instead of throwing", () => {
    const result = collectMatches("([a-z", "g", "abc");
    expect(result.error).toBeDefined();
    expect(result.matches).toEqual([]);
  });
});
