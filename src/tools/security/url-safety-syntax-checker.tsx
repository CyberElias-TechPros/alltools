"use client";

import { useMemo, useState } from "react";
import { CopyButton, Field, ResultCard, SimpleTable, StatGrid, TextInput, ToolPanel } from "@/components/ui";
import { checkUrlSyntax } from "@/lib/security";

const SAMPLES = [
  "https://example.com/docs/page",
  "http://user:pass@192.168.0.10/login",
  "https://bit.ly/3xYzAbc",
  "https://xn--pypal-4ve.com/verify",
];

export default function UrlSafetySyntaxChecker() {
  const [input, setInput] = useState(SAMPLES[0]);
  const result = useMemo(() => checkUrlSyntax(input), [input]);
  const risk = "risk" in result ? result.risk : null;
  const error = "error" in result ? result.error : "";

  return (
    <ToolPanel>
      <Field
        label="URL to inspect"
        htmlFor="url-safety-input"
        hint="Structure only — no blocklist, no reputation data and no request is made."
      >
        <TextInput
          id="url-safety-input"
          value={input}
          onChange={(event) => setInput(event.target.value)}
          className="font-mono text-[0.82rem]"
          spellCheck={false}
          invalid={Boolean(error) || risk?.level === "high"}
        />
      </Field>

      <div className="mt-3 flex flex-wrap gap-1.5">
        {SAMPLES.map((sample) => (
          <button
            key={sample}
            type="button"
            className="max-w-full truncate border border-[var(--border)] px-2.5 py-1.5 font-mono text-[0.62rem] text-[var(--text-subtle)] transition-colors hover:border-[var(--border-strong)] hover:text-[var(--text)]"
            onClick={() => setInput(sample)}
          >
            {sample}
          </button>
        ))}
      </div>

      <div className="mt-5">
        {error ? (
          <div role="alert" className="border border-[#c0392b] bg-[var(--surface-muted)] p-3 font-mono text-[0.8rem] text-[#8d2f22] dark:text-[#ff9a8a]">
            {error}
          </div>
        ) : risk ? (
          <ResultCard
            label="Structural risk"
            value={risk.level === "high" ? "High" : risk.level === "medium" ? "Medium" : "Low"}
            tone={risk.level === "high" ? "neutral" : "brand"}
            sub={`${risk.scheme}://${risk.host}`}
          >
            <StatGrid
              columns={3}
              items={[
                { label: "Host", value: risk.host },
                { label: "Scheme", value: risk.scheme },
                { label: "Findings", value: String(risk.findings.length) },
              ]}
            />

            <div className="mt-4">
              <SimpleTable
                head={["Severity", "Finding"]}
                caption="Structural findings"
                rows={risk.findings.map((finding) => [
                  <span
                    key={finding.message}
                    className={
                      finding.severity === "danger"
                        ? "text-[#a12b1c] dark:text-[#ff9a8a]"
                        : finding.severity === "warning"
                          ? "text-[#8a5a00] dark:text-[#ffc46b]"
                          : "text-[var(--accent-text)]"
                    }
                  >
                    {finding.severity === "danger" ? "Risky" : finding.severity === "warning" ? "Check" : "Info"}
                  </span>,
                  finding.message,
                ])}
              />
            </div>

            <div className="mt-3">
              <CopyButton text={input} label="Copy URL" />
            </div>
          </ResultCard>
        ) : null}
      </div>

      <p className="mt-5 text-xs leading-relaxed text-[var(--text-subtle)]">
        These are string heuristics, not a safety verdict. A “low” result means the URL is structurally ordinary — it
        says nothing about who owns the domain or what it serves. Reputation checks need a blocklist or a lookup service,
        which this site does not run.
      </p>
    </ToolPanel>
  );
}
