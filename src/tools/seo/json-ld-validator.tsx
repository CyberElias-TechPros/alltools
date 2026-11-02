"use client";

import { useMemo, useState } from "react";
import { EmptyState, ResultCard, SimpleTable, StatGrid, TextArea, ToolPanel } from "@/components/ui";
import { validateJsonLd } from "@/lib/seo-tools";

export default function JsonLdValidator() {
  const [input, setInput] = useState("");
  const report = useMemo(() => (input.trim() ? validateJsonLd(input) : null), [input]);

  return (
    <ToolPanel>
      <label htmlFor="jsonld-input" className="label">
        JSON-LD block or full &lt;script&gt; tag
      </label>
      <TextArea
        id="jsonld-input"
        value={input}
        onChange={(event) => setInput(event.target.value)}
        rows={12}
        spellCheck={false}
        className="font-mono text-[0.78rem]"
        placeholder={'{\n  "@context": "https://schema.org",\n  "@type": "Article",\n  "headline": "…"\n}'}
      />

      <div className="mt-5">
        {!report ? (
          <EmptyState title="Nothing to validate">Paste structured data to check its syntax and required properties.</EmptyState>
        ) : (
          <ResultCard
            label="Result"
            value={report.valid ? "Valid JSON-LD" : "Problems found"}
            tone={report.valid ? "brand" : "neutral"}
            sub={report.types.length ? `Types: ${report.types.join(", ")}` : "No @type detected"}
          >
            <StatGrid
              columns={3}
              items={[
                { label: "Types found", value: String(report.types.length) },
                { label: "Errors", value: String(report.issues.filter((issue) => issue.level === "error").length) },
                { label: "Warnings", value: String(report.issues.filter((issue) => issue.level === "warning").length) },
              ]}
            />
            <div className="mt-4">
              <SimpleTable
                head={["Status", "Finding"]}
                caption="JSON-LD findings"
                rows={
                  report.issues.length
                    ? report.issues.map((issue) => [
                        issue.level === "error" ? "Fix" : "Warn",
                        issue.message,
                      ])
                    : [["OK", "No structural problems found in the pasted markup."]]
                }
              />
            </div>
          </ResultCard>
        )}
      </div>

      <p className="mt-5 text-xs leading-relaxed text-[var(--text-subtle)]">
        This checks JSON syntax, the @context/@type pair and a handful of type-specific expectations. It does not run
        Google&apos;s Rich Results Test, which validates against current eligibility rules — use both before shipping.
      </p>
    </ToolPanel>
  );
}
