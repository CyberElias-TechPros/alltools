"use client";

import { useMemo, useState } from "react";
import { CopyButton, Field, ResultCard, StatGrid, TextInput, ToolPanel } from "@/components/ui";
import { analyseDomain, type DomainAnalysis } from "@/lib/web";

export default function DomainNameAnalyzer() {
  const [input, setInput] = useState("blog.example.co.uk");
  const result = useMemo(() => analyseDomain(input), [input]);
  const error = "error" in result ? result.error : "";
  const analysis: DomainAnalysis | null = error ? null : (result as DomainAnalysis);

  return (
    <ToolPanel>
      <Field
        label="Domain or URL"
        htmlFor="domain-input"
        hint="Paste a hostname or a full URL; the path is ignored."
      >
        <TextInput
          id="domain-input"
          value={input}
          onChange={(event) => setInput(event.target.value)}
          placeholder="example.com"
          spellCheck={false}
          className="font-mono text-[0.85rem]"
          invalid={Boolean(error)}
        />
      </Field>

      <div className="mt-5">
        {error ? (
          <div role="alert" className="border border-[#c0392b] bg-[var(--surface-muted)] p-3 font-mono text-[0.8rem] text-[#8d2f22] dark:text-[#ff9a8a]">
            {error}
          </div>
        ) : analysis ? (
          <ResultCard
            label="Hostname"
            value={analysis.hostname}
            tone="brand"
            sub={
              analysis.subdomainCount > 0
                ? `${analysis.subdomainCount} subdomain level(s) above the registered name`
                : "Apex domain — no subdomain"
            }
          >
            <StatGrid
              columns={4}
              items={[
                { label: "Registered name", value: analysis.registeredName || "—" },
                { label: "TLD", value: analysis.tld ? `.${analysis.tld}` : "—" },
                { label: "Length", value: `${analysis.length} chars` },
                { label: "Labels", value: String(analysis.labels.length) },
                { label: "Hyphens", value: String(analysis.hyphenCount) },
                { label: "Digits", value: String(analysis.digitCount) },
                { label: "Type", value: analysis.isIpv4 ? "IPv4" : analysis.isLocalhost ? "Localhost" : "Domain" },
                {
                  label: "Brandability",
                  value: `${analysis.brandScore}/100`,
                  hint: "Heuristic, not a valuation",
                },
              ]}
            />

            <div className="mt-4 space-y-2">
              <div className="flex flex-wrap items-center gap-2 border border-[var(--border)] px-3 py-2">
                <span className="w-24 font-mono text-[0.6rem] uppercase tracking-[0.12em] text-[var(--text-subtle)]">
                  Labels
                </span>
                <div className="flex min-w-0 flex-1 flex-wrap gap-1">
                  {analysis.labels.map((label, index) => (
                    <span
                      key={`${label}-${index}`}
                      className="border border-[var(--border)] bg-[var(--surface-muted)] px-1.5 py-0.5 font-mono text-[0.72rem] text-[var(--text)]"
                    >
                      {label}
                    </span>
                  ))}
                </div>
                <CopyButton text={analysis.hostname} label="Copy" />
              </div>
              {analysis.unicode !== analysis.hostname ? (
                <div className="border border-[var(--border)] px-3 py-2">
                  <p className="font-mono text-[0.6rem] uppercase tracking-[0.12em] text-[var(--text-subtle)]">
                    Unicode spelling you entered
                  </p>
                  <code className="font-mono text-[0.85rem]">{analysis.unicode}</code>
                </div>
              ) : null}
            </div>

            {analysis.notes.length ? (
              <ul className="mt-4 space-y-1.5 border-t border-[var(--border)] pt-3 text-sm leading-relaxed text-[var(--text-subtle)]">
                {analysis.notes.map((note) => (
                  <li key={note}>{note}</li>
                ))}
              </ul>
            ) : (
              <p className="mt-4 border-t border-[var(--border)] pt-3 text-sm text-[var(--text-subtle)]">
                No structural oddities found.
              </p>
            )}
          </ResultCard>
        ) : null}
      </div>

      <p className="mt-5 text-xs leading-relaxed text-[var(--text-subtle)]">
        This analyses the name itself: its labels, TLD, hyphens, digits and punycode. It cannot look up registration,
        hosting or traffic — WHOIS and DNS both require a server, so those tools are listed as planned rather than
        faked with a cached table.
      </p>
    </ToolPanel>
  );
}
