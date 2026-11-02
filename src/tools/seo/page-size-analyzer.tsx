"use client";

import { useMemo, useState } from "react";
import { EmptyState, ResultCard, StatGrid, TextArea, ToolPanel } from "@/components/ui";
import { formatBytes } from "@/lib/format";
import { analysePageSource } from "@/lib/seo-tools";

export default function PageSizeAnalyzer() {
  const [html, setHtml] = useState("");
  const report = useMemo(() => analysePageSource(html), [html]);

  const verdict =
    report.bytes > 100_000
      ? "Large HTML document — most of this should be external or cached."
      : report.bytes > 30_000
        ? "Reasonable for a content page."
        : "Small and cheap to transfer.";

  return (
    <ToolPanel>
      <label htmlFor="page-size-input" className="label">
        Page source (HTML)
      </label>
      <TextArea
        id="page-size-input"
        value={html}
        onChange={(event) => setHtml(event.target.value)}
        rows={12}
        spellCheck={false}
        className="font-mono text-[0.76rem]"
        placeholder="Paste the page source, or the <head> and body markup…"
      />

      <div className="mt-5">
        {!html.trim() ? (
          <EmptyState title="No source yet">
            Paste the HTML to measure its transfer size and see how many requests the markup alone implies.
          </EmptyState>
        ) : (
          <ResultCard label="HTML size" value={formatBytes(report.bytes)} tone="brand" sub={verdict}>
            <StatGrid
              columns={4}
              items={[
                { label: "Bytes", value: report.bytes.toLocaleString() },
                { label: "Inline scripts", value: String(report.inlineScripts) },
                { label: "External scripts", value: String(report.externalScripts) },
                { label: "Stylesheets", value: String(report.externalStyles) },
                { label: "Inline styles", value: String(report.inlineStyles) },
                { label: "Images", value: String(report.images) },
                { label: "Largest inline block", value: formatBytes(report.largestInline) },
                { label: "Gzipped estimate", value: formatBytes(Math.round(report.bytes * 0.25)), hint: "Roughly 3–5× on HTML" },
              ]}
            />
            <ul className="mt-4 space-y-1.5 border-t border-[var(--border)] pt-3 text-sm leading-relaxed text-[var(--text-subtle)]">
              <li>This measures the markup you pasted. Images, fonts and scripts are separate downloads.</li>
              <li>HTML compresses well: expect a third to a quarter of this over the wire with gzip or Brotli.</li>
              <li>Inline script and style blocks are counted above so you can spot pages that ship their CSS twice.</li>
            </ul>
          </ResultCard>
        )}
      </div>
    </ToolPanel>
  );
}
