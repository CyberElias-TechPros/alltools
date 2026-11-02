"use client";

import { useMemo, useState } from "react";
import { CopyButton, Field, ResultCard, SimpleTable, TextInput, ToolPanel } from "@/components/ui";
import { validateUrl } from "@/lib/web";

const SAMPLES = [
  "https://example.com/page",
  "example.com/page",
  "http://example.com/",
  "https://user:pass@example.com/",
  "https://example.com/a b",
];

export default function UrlValidator() {
  const [input, setInput] = useState(SAMPLES[0]);
  const report = useMemo(() => validateUrl(input), [input]);

  const checks = [
    ...report.errors.map((message) => ({ level: "error" as const, message })),
    ...report.warnings.map((message) => ({ level: "warning" as const, message })),
  ];

  return (
    <ToolPanel>
      <Field label="URL to validate" htmlFor="url-validator-input">
        <TextInput
          id="url-validator-input"
          value={input}
          onChange={(event) => setInput(event.target.value)}
          placeholder="https://example.com/page?utm_source=test"
          spellCheck={false}
          className="font-mono text-[0.85rem]"
          invalid={!report.valid}
        />
      </Field>

      <div className="mt-3 flex flex-wrap gap-1.5">
        {SAMPLES.map((sample) => (
          <button
            key={sample}
            type="button"
            onClick={() => setInput(sample)}
            className="border border-[var(--border)] px-2.5 py-1.5 font-mono text-[0.6rem] tracking-[0.06em] text-[var(--text-subtle)] transition-colors hover:border-[var(--border-strong)] hover:text-[var(--text)]"
          >
            {sample}
          </button>
        ))}
      </div>

      <div className="mt-5">
        <ResultCard
          label="Verdict"
          value={report.valid ? "Valid URL" : "Invalid URL"}
          tone={report.valid ? "brand" : "neutral"}
          sub={
            report.valid
              ? "The browser can parse this and no blocking problems were found."
              : "The browser cannot use this URL as written."
          }
        >
          {report.parsed ? (
            <div className="mb-4 border border-[var(--border)] bg-[var(--surface)] p-3">
              <p className="font-mono text-[0.6rem] uppercase tracking-[0.12em] text-[var(--text-subtle)]">
                Normalised form
              </p>
              <code className="mt-1 block break-all font-mono text-[0.82rem] text-[var(--text)]">
                {report.parsed.href}
              </code>
              <div className="mt-2">
                <CopyButton text={report.parsed.href} label="Copy URL" />
              </div>
            </div>
          ) : null}

          {checks.length === 0 ? (
            <p className="text-sm text-[var(--text-subtle)]">No errors and no warnings.</p>
          ) : (
            <SimpleTable
              head={["Level", "Finding"]}
              caption="Validation findings"
              rows={checks.map((check) => [
                <span
                  key={check.level}
                  className={
                    check.level === "error"
                      ? "text-[#a12b1c] dark:text-[#ff9a8a]"
                      : "text-[#8a5a00] dark:text-[#ffc46b]"
                  }
                >
                  {check.level === "error" ? "Error" : "Warning"}
                </span>,
                check.message,
              ])}
            />
          )}
        </ResultCard>
      </div>

      <p className="mt-5 text-xs leading-relaxed text-[var(--text-subtle)]">
        These checks are structural: scheme, hostname, credentials, encoding and length. They cannot tell you whether the
        server exists or will accept the request — that needs a network round trip, which is why the status and header
        checkers on this site are marked as planned.
      </p>
    </ToolPanel>
  );
}
