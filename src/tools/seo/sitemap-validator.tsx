"use client";

import { useMemo, useState } from "react";
import { EmptyState, ResultCard, SimpleTable, StatGrid, TextArea, ToolPanel } from "@/components/ui";
import { validateSitemap } from "@/lib/seo-tools";

export default function SitemapValidator() {
  const [xml, setXml] = useState("");
  const report = useMemo(() => (xml.trim() ? validateSitemap(xml) : null), [xml]);

  return (
    <ToolPanel>
      <label htmlFor="sitemap-input" className="label">
        sitemap.xml
      </label>
      <TextArea
        id="sitemap-input"
        value={xml}
        onChange={(event) => setXml(event.target.value)}
        rows={12}
        spellCheck={false}
        className="font-mono text-[0.74rem]"
        placeholder={'<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">…</urlset>'}
      />

      <div className="mt-5">
        {!report ? (
          <EmptyState title="Paste a sitemap">
            The validator checks the namespace, the URL count, absolute locations, duplicates, lastmod and priority
            values.
          </EmptyState>
        ) : (
          <ResultCard
            label="Result"
            value={report.valid ? "Structurally valid" : "Errors found"}
            tone={report.valid ? "brand" : "neutral"}
            sub={`${report.urlCount.toLocaleString()} URL(s) · ${report.issues.length} finding(s)`}
          >
            <StatGrid
              columns={3}
              items={[
                { label: "URLs", value: report.urlCount.toLocaleString() },
                { label: "Errors", value: String(report.issues.filter((issue) => issue.level === "error").length) },
                { label: "Warnings", value: String(report.issues.filter((issue) => issue.level === "warning").length) },
              ]}
            />
            <div className="mt-4">
              <SimpleTable
                head={["Status", "Finding"]}
                caption="Sitemap findings"
                rows={
                  report.issues.length
                    ? report.issues.slice(0, 50).map((issue) => [issue.level === "error" ? "Error" : "Warn", issue.message])
                    : [["OK", "Namespace, URLs, dates and priorities all look correct."]]
                }
              />
            </div>
            {report.issues.length > 50 ? (
              <p className="mt-2 text-xs text-[var(--text-subtle)]">Showing the first 50 findings.</p>
            ) : null}
          </ResultCard>
        )}
      </div>
    </ToolPanel>
  );
}
