"use client";

import { useMemo, useState } from "react";
import { EmptyState, Field, ResultCard, SimpleTable, StatGrid, TextArea, TextInput, ToolPanel } from "@/components/ui";
import { analyseLinks } from "@/lib/seo-tools";

const SAMPLE = `<a href="/tools">Tools</a>
<a href="/tools">Tools again</a>
<a href="https://example.com/about">About</a>
<a href="https://other-site.com/review" rel="nofollow">Review</a>
<a href="#">Back to top</a>
<a href="/blog">Click here</a>`;

export default function InternalLinkChecker() {
  const [html, setHtml] = useState("");
  const [host, setHost] = useState("example.com");
  const report = useMemo(() => analyseLinks(html, host), [html, host]);

  return (
    <ToolPanel>
      <div className="grid gap-4 sm:grid-cols-[1fr_16rem]">
        <div>
          <label htmlFor="links-input" className="label">
            Page HTML
          </label>
          <TextArea
            id="links-input"
            value={html}
            onChange={(event) => setHtml(event.target.value)}
            rows={10}
            spellCheck={false}
            className="font-mono text-[0.78rem]"
            placeholder='<a href="/pricing">Pricing</a>'
          />
        </div>
        <div>
          <Field label="Your hostname" htmlFor="links-host" hint="Absolute links to this host count as internal.">
            <TextInput
              id="links-host"
              value={host}
              onChange={(event) => setHost(event.target.value)}
              className="font-mono text-[0.8rem]"
              spellCheck={false}
            />
          </Field>
          <button
            type="button"
            className="btn btn-ghost mt-2 !min-h-8 !px-2.5 !py-1.5 !text-[0.6rem] !tracking-[0.1em]"
            onClick={() => setHtml(SAMPLE)}
          >
            Load sample
          </button>
        </div>
      </div>

      <div className="mt-5">
        {!html.trim() ? (
          <EmptyState title="No HTML yet">Paste markup to count internal and external links.</EmptyState>
        ) : (
          <ResultCard
            label="Links"
            value={`${report.internal} internal · ${report.external} external`}
            tone="brand"
            sub={`${report.total} anchor(s) with an href · ${report.nofollow} nofollow`}
          >
            <StatGrid
              columns={4}
              items={[
                { label: "Internal", value: String(report.internal) },
                { label: "External", value: String(report.external) },
                { label: "Empty anchors", value: String(report.emptyAnchor) },
                { label: "Generic text", value: String(report.genericAnchor), hint: "“click here”, “read more”" },
              ]}
            />

            {report.duplicateHrefs.length ? (
              <div className="mt-4">
                <SimpleTable
                  head={["Repeated href", "Times"]}
                  caption="Links repeated on the page"
                  rows={report.duplicateHrefs.map((entry) => [entry.href, String(entry.count)])}
                />
              </div>
            ) : null}

            <ul className="mt-4 space-y-1.5 border-t border-[var(--border)] pt-3 text-sm leading-relaxed text-[var(--text-subtle)]">
              {report.internal === 0 ? <li>No internal links — nothing for a crawler to follow deeper into the site.</li> : null}
              {report.genericAnchor > 0 ? (
                <li>{report.genericAnchor} link(s) use generic anchor text; descriptive text helps both users and search engines.</li>
              ) : null}
              {report.emptyAnchor > 0 ? <li>{report.emptyAnchor} anchor(s) have no href.</li> : null}
              <li>This reads the pasted markup only — it cannot tell you whether any of these paths still return 200.</li>
            </ul>
          </ResultCard>
        )}
      </div>
    </ToolPanel>
  );
}
