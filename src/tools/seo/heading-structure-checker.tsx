"use client";

import { useMemo, useState } from "react";
import { CopyButton, EmptyState, ResultCard, SimpleTable, StatGrid, TextArea, ToolPanel } from "@/components/ui";
import { analyseHeadings, outlineFromHtml } from "@/lib/seo-tools";

const SAMPLE = `<h1>Unit converter</h1>
<h2>How the conversion works</h2>
<h3>Length</h3>
<h3>Mass</h3>
<h2>Common conversions</h2>
<h4>Skipped a level</h4>`;

export default function HeadingStructureChecker() {
  const [html, setHtml] = useState("");
  const report = useMemo(() => analyseHeadings(html), [html]);
  const outline = useMemo(() => outlineFromHtml(html), [html]);

  return (
    <ToolPanel>
      <div className="mb-2 flex items-center justify-between">
        <label htmlFor="headings-input" className="label !mb-0">
          Page HTML
        </label>
        <button
          type="button"
          className="btn btn-ghost !min-h-8 !px-2.5 !py-1.5 !text-[0.6rem] !tracking-[0.1em]"
          onClick={() => setHtml(SAMPLE)}
        >
          Sample
        </button>
      </div>
      <TextArea
        id="headings-input"
        value={html}
        onChange={(event) => setHtml(event.target.value)}
        rows={10}
        spellCheck={false}
        className="font-mono text-[0.8rem]"
        placeholder="<h1>Page title</h1> <h2>Section</h2> …"
      />

      <div className="mt-5 grid gap-5 lg:grid-cols-2">
        <div>
          {!html.trim() ? (
            <EmptyState title="No HTML yet">Paste the page source to build a heading outline.</EmptyState>
          ) : (
            <ResultCard
              label="Outline"
              value={`${report.headings.length} heading(s)`}
              tone="brand"
              sub={
                report.counts[1] === 1
                  ? "Exactly one H1 — the shape search engines expect."
                  : `${report.counts[1]} H1 element(s).`
              }
            >
              {report.headings.length === 0 ? (
                <p className="text-sm text-[var(--text-subtle)]">No h1–h6 elements were found.</p>
              ) : (
                <ol className="space-y-1 font-mono text-[0.8rem]">
                  {report.headings.map((heading) => (
                    <li
                      key={`${heading.index}-${heading.text}`}
                      className="flex gap-2"
                      style={{ paddingLeft: `${(heading.level - 1) * 1.1}rem` }}
                    >
                      <span className="text-[var(--accent-text)]">H{heading.level}</span>
                      <span className="min-w-0 break-words text-[var(--text)]">
                        {heading.text || <em className="text-[var(--text-subtle)]">(empty)</em>}
                      </span>
                    </li>
                  ))}
                </ol>
              )}
              <div className="mt-3 flex flex-wrap gap-2">
                <CopyButton text={outline} label="Copy outline" />
              </div>
            </ResultCard>
          )}
        </div>

        <div className="space-y-4">
          <StatGrid
            columns={3}
            items={[1, 2, 3, 4, 5, 6].map((level) => ({
              label: `H${level}`,
              value: String(report.counts[level]),
            }))}
          />

          <SimpleTable
            head={["Check", "Result"]}
            caption="Heading structure checks"
            rows={
              report.issues.length
                ? report.issues.map((issue) => ["Issue", issue])
                : [["OK", "One H1, no skipped levels and no empty headings."]]
            }
          />
        </div>
      </div>

      <p className="mt-5 text-xs leading-relaxed text-[var(--text-subtle)]">
        Headings describe the document&apos;s structure: H1 for the page subject, H2 for sections, H3 for subsections.
        Skipping a level is not an accessibility failure on its own, but it usually means the outline was not planned.
      </p>
    </ToolPanel>
  );
}
