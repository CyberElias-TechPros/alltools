"use client";

import { useMemo, useState } from "react";
import { CopyButton, EmptyState, Field, ResultCard, SimpleTable, TextArea, TextInput, ToolPanel } from "@/components/ui";
import { checkCanonical, extractHead } from "@/lib/tags";

const SAMPLE = `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <title>Free unit converter — Example Tools</title>
  <meta name="description" content="Convert length, mass, volume and temperature with exact factors and worked examples." />
  <link rel="canonical" href="https://example.com/unit-converter" />
  <meta name="robots" content="index, follow" />
</head>
<body><h1>Unit converter</h1></body>
</html>`;

export default function CanonicalUrlChecker() {
  const [url, setUrl] = useState("https://example.com/unit-converter");
  const [html, setHtml] = useState(SAMPLE);

  const report = useMemo(() => checkCanonical(html, url), [html, url]);
  const head = useMemo(() => extractHead(html), [html]);
  const problems = report.issues.filter((issue) => issue.level !== "ok");

  return (
    <ToolPanel>
      <div className="grid gap-4 lg:grid-cols-[1fr_1fr]">
        <Field label="URL this page is served from" htmlFor="canonical-url">
          <TextInput
            id="canonical-url"
            value={url}
            onChange={(event) => setUrl(event.target.value)}
            placeholder="https://example.com/page"
            className="font-mono text-[0.82rem]"
            spellCheck={false}
          />
        </Field>
        <Field label="Declared canonical" htmlFor="canonical-found" hint="Read from the pasted HTML.">
          <TextInput id="canonical-found" value={report.canonical} readOnly className="font-mono text-[0.82rem]" />
        </Field>
      </div>

      <div className="mt-4">
        <label htmlFor="canonical-html" className="label">
          Paste the page&apos;s HTML head
        </label>
        <TextArea
          id="canonical-html"
          value={html}
          onChange={(event) => setHtml(event.target.value)}
          rows={10}
          spellCheck={false}
          className="font-mono text-[0.76rem]"
        />
        <p className="mt-1 text-xs text-[var(--text-subtle)]">
          Use “View source” in the browser, or paste just the &lt;head&gt; block. Nothing is fetched.
        </p>
      </div>

      <div className="mt-5">
        {!html.trim() ? (
          <EmptyState title="No HTML yet">Paste a page head to inspect its canonical tag.</EmptyState>
        ) : (
          <ResultCard
            label="Canonical status"
            value={problems.length === 0 ? "Looks correct" : `${problems.length} issue(s)`}
            tone={problems.length === 0 ? "brand" : "neutral"}
            sub={
              report.canonical
                ? `Canonical: ${report.canonical}`
                : "No canonical tag was found in the pasted HTML."
            }
          >
            <SimpleTable
              head={["Status", "Finding"]}
              caption="Canonical and head tag findings"
              rows={report.issues.map((issue) => [
                <span
                  key={issue.message}
                  className={
                    issue.level === "error"
                      ? "text-[#a12b1c] dark:text-[#ff9a8a]"
                      : issue.level === "warning"
                        ? "text-[#8a5a00] dark:text-[#ffc46b]"
                        : "text-[var(--accent-text)]"
                  }
                >
                  {issue.level === "ok" ? "OK" : issue.level === "warning" ? "Warn" : "Fix"}
                </span>,
                issue.message,
              ])}
            />

            <div className="mt-4 grid gap-2 sm:grid-cols-2">
              {[
                { label: "Title", value: head.title },
                { label: "Description", value: head.description },
                { label: "Robots", value: head.robots || "(not set)" },
                { label: "H1", value: head.h1 || "(not in pasted HTML)" },
              ].map((row) => (
                <div key={row.label} className="border border-[var(--border)] bg-[var(--surface)] px-3 py-2">
                  <p className="font-mono text-[0.58rem] uppercase tracking-[0.12em] text-[var(--text-subtle)]">
                    {row.label}
                  </p>
                  <p className="mt-0.5 line-clamp-2 text-sm text-[var(--text)]">{row.value || "—"}</p>
                </div>
              ))}
            </div>

            <div className="mt-3">
              <CopyButton text={report.canonical} label="Copy canonical" />
            </div>
          </ResultCard>
        )}
      </div>

      <p className="mt-5 text-xs leading-relaxed text-[var(--text-subtle)]">
        A canonical tag must be absolute, appear once, and — for a page that is not a duplicate — point at itself.
        Conflicting canonicals are ignored by search engines, which is why duplicates are reported as an error rather
        than a warning.
      </p>
    </ToolPanel>
  );
}
