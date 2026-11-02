"use client";

import dynamic from "next/dynamic";
import { useEffect } from "react";
import type { ComponentType } from "react";
import Link from "next/link";
import { rememberTool } from "@/components/search-dialog";

/**
 * Each tool is code-split: a visitor downloads only the component for the page
 * they are on, not the other 39 tools. This keeps first-load JS flat as the
 * catalogue grows.
 */
const loading = () => (
  <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6">
    <div className="shimmer h-6 w-40 rounded" />
    <div className="shimmer mt-3 h-24 w-full rounded-xl" />
  </div>
);

export const toolComponents: Record<string, ComponentType> = {
  "word-counter": dynamic(() => import("./text/word-counter"), { loading }),
  "character-counter": dynamic(() => import("./text/character-counter"), { loading }),
  "sentence-counter": dynamic(() => import("./text/sentence-counter"), { loading }),
  "paragraph-counter": dynamic(() => import("./text/paragraph-counter"), { loading }),
  "reading-time-calculator": dynamic(() => import("./text/reading-time-calculator"), { loading }),
  "speaking-time-calculator": dynamic(() => import("./text/speaking-time-calculator"), { loading }),
  "line-break-remover": dynamic(() => import("./text/line-break-remover"), { loading }),
  "slug-to-text-converter": dynamic(() => import("./text/slug-to-text-converter"), { loading }),
  "random-text-generator": dynamic(() => import("./text/random-text-generator"), { loading }),
  "markdown-previewer": dynamic(() => import("./text/markdown-previewer"), { loading }),
  "markdown-to-html-converter": dynamic(() => import("./text/markdown-to-html-converter"), { loading }),
  "html-to-markdown-converter": dynamic(() => import("./text/html-to-markdown-converter"), { loading }),
  "text-frequency-analyzer": dynamic(() => import("./text/text-frequency-analyzer"), { loading }),
  "unicode-character-inspector": dynamic(() => import("./text/unicode-character-inspector"), { loading }),
  "case-converter": dynamic(() => import("./text/case-converter"), { loading }),
  "duplicate-line-remover": dynamic(() => import("./text/duplicate-line-remover"), { loading }),
  "text-reverser": dynamic(() => import("./text/text-reverser"), { loading }),
  "alphabetical-text-sorter": dynamic(() => import("./text/alphabetical-text-sorter"), { loading }),
  "remove-extra-spaces": dynamic(() => import("./text/remove-extra-spaces"), { loading }),
  "text-to-slug-converter": dynamic(() => import("./text/text-to-slug-converter"), { loading }),
  "find-and-replace": dynamic(() => import("./text/find-and-replace"), { loading }),
  "lorem-ipsum-generator": dynamic(() => import("./text/lorem-ipsum-generator"), { loading }),
  "text-diff": dynamic(() => import("./text/text-diff"), { loading }),

  "percentage-calculator": dynamic(() => import("./calculators/percentage-calculator"), { loading }),
  "percentage-increase-decrease-calculator": dynamic(() => import("./calculators/percentage-increase-decrease-calculator"), { loading }),
  "discount-calculator": dynamic(() => import("./calculators/discount-calculator"), { loading }),
  "vat-calculator": dynamic(() => import("./calculators/vat-calculator"), { loading }),
  "age-calculator": dynamic(() => import("./calculators/age-calculator"), { loading }),
  "days-between-dates-calculator": dynamic(() => import("./calculators/days-between-dates-calculator"), { loading }),
  "average-calculator": dynamic(() => import("./calculators/average-calculator"), { loading }),
  "basic-calculator": dynamic(() => import("./calculators/basic-calculator"), { loading }),
  "scientific-calculator": dynamic(() => import("./calculators/scientific-calculator"), { loading }),
  "sales-tax-calculator": dynamic(() => import("./calculators/sales-tax-calculator"), { loading }),
  "markup-calculator": dynamic(() => import("./calculators/markup-calculator"), { loading }),
  "ratio-calculator": dynamic(() => import("./calculators/ratio-calculator"), { loading }),
  "mean-median-mode-calculator": dynamic(() => import("./calculators/mean-median-mode-calculator"), { loading }),
  "fraction-calculator": dynamic(() => import("./calculators/fraction-calculator"), { loading }),
  "exponent-calculator": dynamic(() => import("./calculators/exponent-calculator"), { loading }),
  "square-root-calculator": dynamic(() => import("./calculators/square-root-calculator"), { loading }),
  "lcm-calculator": dynamic(() => import("./calculators/lcm-calculator"), { loading }),
  "gcd-calculator": dynamic(() => import("./calculators/gcd-calculator"), { loading }),
  "prime-number-checker": dynamic(() => import("./calculators/prime-number-checker"), { loading }),
  "factorial-calculator": dynamic(() => import("./calculators/factorial-calculator"), { loading }),
  "random-number-generator": dynamic(() => import("./calculators/random-number-generator"), { loading }),
  "date-difference-calculator": dynamic(() => import("./calculators/date-difference-calculator"), { loading }),
  "time-duration-calculator": dynamic(() => import("./calculators/time-duration-calculator"), { loading }),
  "percentage-grade-calculator": dynamic(() => import("./calculators/percentage-grade-calculator"), { loading }),
  "probability-calculator": dynamic(() => import("./calculators/probability-calculator"), { loading }),
  "matrix-calculator": dynamic(() => import("./calculators/matrix-calculator"), { loading }),
  "standard-deviation-calculator": dynamic(() => import("./calculators/standard-deviation-calculator"), { loading }),
  "gpa-calculator": dynamic(() => import("./calculators/gpa-calculator"), { loading }),

  "loan-calculator": dynamic(() => import("./finance/loan-calculator"), { loading }),
  "simple-interest-calculator": dynamic(() => import("./finance/simple-interest-calculator"), { loading }),
  "savings-calculator": dynamic(() => import("./finance/savings-calculator"), { loading }),
  "investment-growth-calculator": dynamic(() => import("./finance/investment-growth-calculator"), { loading }),
  "break-even-calculator": dynamic(() => import("./finance/break-even-calculator"), { loading }),
  "business-profit-calculator": dynamic(() => import("./finance/business-profit-calculator"), { loading }),
  "business-revenue-calculator": dynamic(() => import("./finance/business-revenue-calculator"), { loading }),
  "commission-calculator": dynamic(() => import("./finance/commission-calculator"), { loading }),
  "salary-calculator": dynamic(() => import("./finance/salary-calculator"), { loading }),
  "hourly-to-monthly-salary-converter": dynamic(() => import("./finance/hourly-to-monthly-salary-converter"), { loading }),
  "overtime-calculator": dynamic(() => import("./finance/overtime-calculator"), { loading }),
  "freelance-rate-calculator": dynamic(() => import("./finance/freelance-rate-calculator"), { loading }),
  "invoice-calculator": dynamic(() => import("./finance/invoice-calculator"), { loading }),
  "budget-calculator": dynamic(() => import("./finance/budget-calculator"), { loading }),
  "expense-split-calculator": dynamic(() => import("./finance/expense-split-calculator"), { loading }),
  "inflation-calculator": dynamic(() => import("./finance/inflation-calculator"), { loading }),
  "mortgage-calculator": dynamic(() => import("./finance/mortgage-calculator"), { loading }),
  "debt-payoff-calculator": dynamic(() => import("./finance/debt-payoff-calculator"), { loading }),
  "rental-yield-calculator": dynamic(() => import("./finance/rental-yield-calculator"), { loading }),
  "stock-average-price-calculator": dynamic(() => import("./finance/stock-average-price-calculator"), { loading }),
  "percentage-of-ownership-calculator": dynamic(() => import("./finance/percentage-of-ownership-calculator"), { loading }),
  "loan-repayment-calculator": dynamic(() => import("./finance/loan-repayment-calculator"), { loading }),
  "compound-interest-calculator": dynamic(() => import("./finance/compound-interest-calculator"), { loading }),
  "profit-margin-calculator": dynamic(() => import("./finance/profit-margin-calculator"), { loading }),
  "roi-calculator": dynamic(() => import("./finance/roi-calculator"), { loading }),

  "json-formatter": dynamic(() => import("./developer/json-formatter"), { loading }),
  "base64-encoder-decoder": dynamic(() => import("./developer/base64-encoder-decoder"), { loading }),
  "url-encoder-decoder": dynamic(() => import("./developer/url-encoder-decoder"), { loading }),
  "html-entity-encoder": dynamic(() => import("./developer/html-entity-encoder"), { loading }),
  "hash-generator": dynamic(() => import("./developer/hash-generator"), { loading }),
  "uuid-generator": dynamic(() => import("./developer/uuid-generator"), { loading }),
  "jwt-decoder": dynamic(() => import("./developer/jwt-decoder"), { loading }),
  "timestamp-converter": dynamic(() => import("./developer/timestamp-converter"), { loading }),
  "color-code-converter": dynamic(() => import("./developer/color-code-converter"), { loading }),

  "unit-converter": dynamic(() => import("./everyday/unit-converter"), { loading }),
  "temperature-converter": dynamic(() => import("./everyday/temperature-converter"), { loading }),
  "time-zone-converter": dynamic(() => import("./everyday/time-zone-converter"), { loading }),
  "bmi-calculator": dynamic(() => import("./everyday/bmi-calculator"), { loading }),

  "serp-snippet-previewer": dynamic(() => import("./seo/serp-snippet-previewer"), { loading }),
  "utm-link-builder": dynamic(() => import("./seo/utm-link-builder"), { loading }),
  "keyword-density-analyzer": dynamic(() => import("./seo/keyword-density-analyzer"), { loading }),
  "robots-txt-generator": dynamic(() => import("./seo/robots-txt-generator"), { loading }),

  "password-generator": dynamic(() => import("./security/password-generator"), { loading }),
};

export function ToolRunner({ slug }: { slug: string }) {
  const Tool = toolComponents[slug];

  useEffect(() => {
    rememberTool(slug);
  }, [slug]);

  if (!Tool) {
    return (
      <div className="rounded-2xl border border-dashed border-[var(--border-strong)] p-6 text-sm text-[var(--text-muted)]">
        This tool is still being built.{" "}
        <Link href="/tools/" className="link">
          Browse the tools that are ready
        </Link>
        .
      </div>
    );
  }

  return <Tool />;
}
