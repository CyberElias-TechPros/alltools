"use client";

import { useMemo, useState } from "react";
import { EmptyState, Field, ResultCard, SimpleTable, StatGrid, TextArea, TextInput, ToolPanel } from "@/components/ui";
import { analyseSeoText } from "@/lib/seo-tools";

export default function SeoTextAnalyzer() {
  const [html, setHtml] = useState("");
  const [keyword, setKeyword] = useState("");

  const report = useMemo(
    () => (html.trim() ? analyseSeoText(html, keyword.trim()) : null),
    [html, keyword],
  );

  return (
    <ToolPanel>
      <div className="grid gap-4 sm:grid-cols-[1fr_16rem]">
        <div>
          <label htmlFor="seo-text-input" className="label">
            Page HTML
          </label>
          <TextArea
            id="seo-text-input"
            value={html}
            onChange={(event) => setHtml(event.target.value)}
            rows={12}
            spellCheck={false}
            className="font-mono text-[0.76rem]"
            placeholder="<title>…</title><h1>…</h1><p>…</p>"
          />
        </div>
        <Field label="Target keyword (optional)" htmlFor="seo-keyword" hint="Used for density and title checks.">
          <TextInput
            id="seo-keyword"
            value={keyword}
            onChange={(event) => setKeyword(event.target.value)}
            placeholder="unit converter"
            className="font-mono text-[0.8rem]"
          />
        </Field>
      </div>

      <div className="mt-5">
        {!report ? (
          <EmptyState title="Paste a page">
            The analyser reads the head, headings, body text, images and links, then reports what is missing.
          </EmptyState>
        ) : (
          <div className="space-y-4">
            <ResultCard
              label="Assessment"
              value={`${report.checks.filter((check) => check.level === "ok").length} of ${report.checks.length} checks pass`}
              tone="brand"
              sub={`${report.words.toLocaleString()} words · body reading ease ${report.readability.fleschReadingEase}`}
            >
              <StatGrid
                columns={4}
                items={[
                  { label: "Words", value: report.words.toLocaleString() },
                  { label: "Title length", value: `${report.head.title.length} chars` },
                  { label: "Description", value: `${report.head.description.length} chars` },
                  { label: "H1 count", value: String(report.headings.counts[1]) },
                  { label: "Internal links", value: String(report.links.internal) },
                  { label: "External links", value: String(report.links.external) },
                  { label: "Images", value: String(report.images.total) },
                  { label: "Missing alt", value: String(report.images.missing.length) },
                ]}
              />
            </ResultCard>

            <SimpleTable
              head={["Status", "Finding"]}
              caption="SEO findings"
              rows={report.checks.map((check) => [
                <span
                  key={check.message}
                  className={
                    check.level === "error"
                      ? "text-[#a12b1c] dark:text-[#ff9a8a]"
                      : check.level === "warning"
                        ? "text-[#8a5a00] dark:text-[#ffc46b]"
                        : "text-[var(--accent-text)]"
                  }
                >
                  {check.level === "ok" ? "OK" : check.level === "warning" ? "Warn" : "Fix"}
                </span>,
                check.message,
              ])}
            />
          </div>
        )}
      </div>
    </ToolPanel>
  );
}
