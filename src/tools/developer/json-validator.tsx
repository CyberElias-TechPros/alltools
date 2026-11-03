"use client";

import { useMemo, useState } from "react";
import { CopyButton, EmptyState, ResultCard, StatGrid, TextArea, ToolPanel } from "@/components/ui";
import { formatBytes } from "@/lib/format";
import { inspectJson } from "@/lib/tabular";

const SAMPLE = `{
  "order": 1042,
  "customer": { "name": "Ada Lovelace", "vip": true },
  "items": [
    { "sku": "M-1", "qty": 2, "price": 21.0 }
  ],
  "notes": null
}`;

const BROKEN = `{
  "order": 1042,
  "items": [
    { "sku": "M-1", "qty": 2, }
  ]
}`;

export default function JsonValidator() {
  const [input, setInput] = useState("");
  const stats = useMemo(() => (input.trim() ? inspectJson(input) : null), [input]);

  const errorLine = useMemo(() => {
    if (!stats?.error) return "";
    return input.split("\n")[stats.error.line - 1] ?? "";
  }, [input, stats]);

  return (
    <ToolPanel>
      <div className="mb-2 flex items-center justify-between">
        <label htmlFor="json-validate-input" className="label !mb-0">
          JSON to validate
        </label>
        <div className="flex gap-1">
          <button
            type="button"
            className="btn btn-ghost !min-h-8 !px-2.5 !py-1.5 !text-[0.6rem] !tracking-[0.1em]"
            onClick={() => setInput(SAMPLE)}
          >
            Valid sample
          </button>
          <button
            type="button"
            className="btn btn-ghost !min-h-8 !px-2.5 !py-1.5 !text-[0.6rem] !tracking-[0.1em]"
            onClick={() => setInput(BROKEN)}
          >
            Broken sample
          </button>
        </div>
      </div>
      <TextArea
        id="json-validate-input"
        value={input}
        onChange={(event) => setInput(event.target.value)}
        placeholder='{ "paste": "your JSON here" }'
        rows={14}
        spellCheck={false}
        className="min-h-[16rem] font-mono text-[0.84rem]"
      />

      <div className="mt-5">
        {!stats ? (
          <EmptyState title="Waiting for JSON">Paste a payload to check it, or load one of the samples.</EmptyState>
        ) : stats.valid ? (
          <ResultCard
            label="Result"
            value="Valid JSON"
            tone="brand"
            sub="The browser's own JSON parser accepted this document."
          >
            <StatGrid
              items={[
                { label: "Top-level type", value: stats.type },
                { label: "Keys", value: stats.keys.toLocaleString() },
                { label: "Values", value: stats.nodes.toLocaleString(), hint: "Objects, arrays and primitives" },
                { label: "Max depth", value: String(stats.depth) },
                { label: "Size", value: formatBytes(stats.bytes) },
              ]}
            />
          </ResultCard>
        ) : (
          <ResultCard label="Result" value="Invalid JSON" tone="neutral" sub={stats.error?.message}>
            <div className="border border-[#c0392b] bg-[var(--surface-muted)] p-3">
              <p className="font-mono text-[0.6rem] uppercase tracking-[0.12em] text-[var(--text-subtle)]">
                Line {stats.error?.line}, column {stats.error?.column}
              </p>
              <pre className="mt-2 overflow-x-auto font-mono text-[0.8rem] leading-relaxed text-[var(--text)]">
                {errorLine.trim() ? errorLine : "(empty line)"}
              </pre>
              {errorLine ? (
                <pre className="overflow-x-auto font-mono text-[0.8rem] leading-relaxed text-[var(--accent-text)]">
                  {" ".repeat(Math.max(0, Math.min((stats.error?.column ?? 1) - 1, errorLine.length)))}^
                </pre>
              ) : null}
              <div className="mt-3">
                <CopyButton text={`${stats.error?.message} (line ${stats.error?.line}, column ${stats.error?.column})`} label="Copy error" />
              </div>
            </div>
            <ul className="mt-4 space-y-1.5 text-sm leading-relaxed text-[var(--text-subtle)]">
              <li>Trailing commas are not allowed in JSON — remove the comma before a closing brace or bracket.</li>
              <li>Keys and strings must use double quotes; single quotes and unquoted keys are invalid.</li>
              <li>Comments, NaN and Infinity are not part of the format.</li>
            </ul>
          </ResultCard>
        )}
      </div>
    </ToolPanel>
  );
}
