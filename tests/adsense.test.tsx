import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { renderToStaticMarkup } from "react-dom/server";
import { AdsenseLoader } from "../src/components/adsense-loader";
import { metadata } from "../src/app/layout";

/**
 * AdSense site-verification surface.
 *
 * Google's dashboard reports "not found" when the loader is not in the page
 * source it fetches. That rules out anything client-side, so these tests pin
 * the tag down at the two places that matter: the rendered head and the layout
 * source itself.
 */

const PUB = "ca-pub-5010473500037610";

describe("AdSense loader", () => {
  it("renders the snippet Google supplies, verbatim", () => {
    const markup = renderToStaticMarkup(<AdsenseLoader />);
    expect(markup).toContain(
      `src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${PUB}"`,
    );
    expect(markup).toContain("crossorigin=\"anonymous\"");
    expect(markup).toContain("async");
    expect(markup.startsWith("<script")).toBe(true);
  });

  it("is a plain <script>, not something next/script injects later", () => {
    const layout = readFileSync("src/app/layout.tsx", "utf8");
    // No next/script component may wrap the loader again.
    expect(layout).not.toMatch(/<Script[\s>]/);
    expect(layout).not.toMatch(/import Script from "next\/script"/);
    // The head must exist so the tag is in the exported HTML.
    expect(layout).toMatch(/<head>/);
    expect(layout).toMatch(/<AdsenseLoader \/>/);
  });

  it("carries the account meta tag as a second proof of ownership", () => {
    expect(metadata.other?.["google-adsense-account"]).toBe(PUB);
  });

  it("declares the publisher in ads.txt", () => {
    const adsTxt = readFileSync("public/ads.txt", "utf8");
    expect(adsTxt).toContain("google.com, pub-5010473500037610, DIRECT,");
  });

  it("does not block the crawler in robots.txt", () => {
    const robots = readFileSync("src/app/robots.ts", "utf8");
    expect(robots).not.toMatch(/Disallow:\s*"\/"/);
  });
});
