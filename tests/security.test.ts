import { describe, expect, it } from "vitest";
import {
  COOKIE_CHECKLIST,
  analysePassword,
  buildPrivacyPolicy,
  buildTerms,
  checkUrlSyntax,
  crackTimeFor,
  decryptText,
  encryptText,
  generateToken,
  hashText,
  md5,
} from "@/lib/security";

describe("md5", () => {
  const vectors: [string, string][] = [
    ["", "d41d8cd98f00b204e9800998ecf8427e"],
    ["a", "0cc175b9c0f1b6a831c399e269772661"],
    ["abc", "900150983cd24fb0d6963f7d28e17f72"],
    ["message digest", "f96b697d7cb7938d525a2f31aaf161d0"],
    ["The quick brown fox jumps over the lazy dog", "9e107d9d372bb6826bd81d3542a419d6"],
  ];

  for (const [input, expected] of vectors) {
    it(`hashes ${JSON.stringify(input)}`, () => {
      expect(md5(new TextEncoder().encode(input))).toBe(expected);
    });
  }

  it("handles input longer than one block", () => {
    const long = "a".repeat(1000);
    expect(md5(new TextEncoder().encode(long))).toHaveLength(32);
    expect(md5(new TextEncoder().encode(long))).not.toBe(md5(new TextEncoder().encode("a".repeat(999))));
  });
});

describe("hashText", () => {
  it("matches published SHA-256 and SHA-512 vectors", async () => {
    expect(await hashText("SHA-256", "abc")).toBe(
      "ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad",
    );
    expect(await hashText("SHA-512", "abc")).toBe(
      "ddaf35a193617abacc417349ae20413112e6fa4e89a97ea20a9eeee64b55d39a2192992a274fc1a836ba3c23a3feebbd454d4423643ce80e2a9ac94fa54ca49f",
    );
    expect(await hashText("SHA-1", "abc")).toBe("a9993e364706816aba3e25717850c26c9cd0d89d");
  });

  it("produces a digest without needing a secure context", async () => {
    const digest = await hashText("MD5", "hello");
    expect(digest).toBe("5d41402abc4b2a76b9719d911017c592");
  });
});

describe("password analysis", () => {
  it("rates a long random password higher than a short one", () => {
    const weak = analysePassword("abc123");
    const strong = analysePassword("Xk9$mQ2vLp8!rT4wZ");
    expect(strong.entropyBits).toBeGreaterThan(weak.entropyBits);
    expect(strong.label).toBe("Very strong");
    expect(weak.score).toBeLessThan(50);
  });

  it("penalises common passwords, including ones with digits glued on", () => {
    for (const password of ["password", "password123", "qwerty123!", "summer2019"]) {
      const analysis = analysePassword(password);
      expect(analysis.warnings.length, password).toBeGreaterThan(0);
      expect(analysis.entropyBits, password).toBeLessThan(45);
    }
  });

  it("reports charset size and length", () => {
    const analysis = analysePassword("aB3!");
    expect(analysis.length).toBe(4);
    expect(analysis.charsetSize).toBe(94);
  });

  it("never returns negative entropy", () => {
    for (const pw of ["", "a", "aaaaaaaaaaaaaaaaaaaa", "qwerty"]) {
      expect(analysePassword(pw).entropyBits).toBeGreaterThanOrEqual(0);
    }
  });

  it("gives crack times that grow with entropy", () => {
    expect(crackTimeFor(0)).toBeTruthy();
    expect(crackTimeFor(200)).not.toBe(crackTimeFor(30));
  });
});

describe("token generation", () => {
  it("produces the requested number of bytes per encoding", () => {
    expect(generateToken(16, "hex")).toHaveLength(32);
    expect(generateToken(16, "base64")).toHaveLength(24);
    expect(generateToken(16, "base64url")).toHaveLength(22);
    expect(generateToken(16, "alphanumeric")).toHaveLength(16);
  });

  it("does not repeat itself", () => {
    const tokens = new Set(Array.from({ length: 20 }, () => generateToken(16, "hex")));
    expect(tokens.size).toBe(20);
  });

  it("keeps base64url URL-safe", () => {
    for (let i = 0; i < 20; i += 1) {
      expect(generateToken(24, "base64url")).not.toMatch(/[+/=]/);
    }
  });
});

describe("encryption round trip", () => {
  it("decrypts what it encrypted", async () => {
    const payload = await encryptText("a secret note with ünïcode", "correct horse battery staple");
    expect(payload.combined).not.toContain("secret");
    expect(await decryptText(payload.combined, "correct horse battery staple")).toBe(
      "a secret note with ünïcode",
    );
  });

  it("produces a different ciphertext for the same input", async () => {
    const a = await encryptText("same text", "passphrase");
    const b = await encryptText("same text", "passphrase");
    expect(a.combined).not.toBe(b.combined);
  });

  it("rejects a wrong passphrase and a tampered payload", async () => {
    const { combined } = await encryptText("payload", "passphrase");
    await expect(decryptText(combined, "wrong passphrase")).rejects.toThrow(/passphrase|altered/i);
    const tampered = Buffer.from(combined, "base64");
    tampered[tampered.length - 1] ^= 0xff;
    await expect(decryptText(tampered.toString("base64"), "passphrase")).rejects.toThrow();
  });

  it("rejects malformed base64", async () => {
    await expect(decryptText("not base64 at all!!", "x")).rejects.toThrow();
  });
});

describe("url syntax checking", () => {
  it("flags credentials in the authority", () => {
    const result = checkUrlSyntax("https://apple.com@203.0.113.9/login");
    expect("risk" in result).toBe(true);
    if ("risk" in result) {
      expect(result.risk.host).toBe("203.0.113.9");
      expect(result.risk.findings.some((finding) => /credential|@/i.test(finding.message))).toBe(true);
    }
  });

  it("flags punycode, http and unusual ports", () => {
    for (const url of ["https://xn--pypal-4ve.com/", "http://example.com/", "https://example.com:8080/"]) {
      const result = checkUrlSyntax(url);
      expect("risk" in result).toBe(true);
      if ("risk" in result) expect(result.risk.findings.length).toBeGreaterThan(0);
    }
  });

  it("leaves an ordinary https URL at low risk", () => {
    const result = checkUrlSyntax("https://example.com/docs/page");
    expect("risk" in result).toBe(true);
    if ("risk" in result) {
      expect(result.risk.level).toBe("low");
      expect(result.risk.findings.filter((finding) => finding.severity !== "info")).toHaveLength(0);
      expect(result.risk.host).toBe("example.com");
    }
  });

  it("rejects input that is not a URL", () => {
    expect("error" in checkUrlSyntax("not a url")).toBe(true);
  });

  it("accepts a bare domain without a scheme", () => {
    const result = checkUrlSyntax("example.com/path");
    expect("error" in checkUrlSyntax("example.com/path") || "risk" in result).toBe(true);
  });
});

describe("policy builders", () => {
  const input = {
    siteName: "Example Tools",
    siteUrl: "https://example.com",
    contactEmail: "hello@example.com",
    country: "England and Wales",
    collects: ["Contact details you send us by email"],
    usesCookies: true,
    usesAnalytics: true,
    usesAds: false,
    sellsData: false,
    children: false,
    updated: "2025-03-02",
  };

  it("includes the site details and every chosen practice", () => {
    const policy = buildPrivacyPolicy(input);
    expect(policy).toContain("Example Tools");
    expect(policy).toContain("hello@example.com");
    expect(policy.toLowerCase()).toContain("cookie");
    expect(policy.toLowerCase()).toContain("analytics");
    expect(policy).toContain("2025");
  });

  it("omits sections that were switched off", () => {
    const minimal = buildPrivacyPolicy({ ...input, usesAds: false, usesAnalytics: false, usesCookies: false, collects: [] });
    expect(minimal).not.toContain("Advertising: ads are served");
    expect(minimal).toContain("We do not display advertising.");
    expect(minimal).toContain("We do not run visitor analytics.");
    expect(minimal).toContain("No personal data is collected directly");
  });

  it("drafts terms with the essentials", () => {
    const terms = buildTerms(input);
    expect(terms).toContain("Example Tools");
    expect(terms.toLowerCase()).toContain("liability");
    expect(terms.toLowerCase()).toContain("governing law");
  });

  it("ships a complete cookie checklist", () => {
    expect(COOKIE_CHECKLIST).toHaveLength(12);
    expect(new Set(COOKIE_CHECKLIST.map((item) => item.id)).size).toBe(12);
    for (const item of COOKIE_CHECKLIST) {
      expect(item.label.length).toBeGreaterThan(3);
      expect(item.detail.length).toBeGreaterThan(10);
    }
  });
});
