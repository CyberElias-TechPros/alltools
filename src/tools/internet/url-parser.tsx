"use client";

import { useMemo, useState } from "react";
import { CopyButton, EmptyState, Field, SimpleTable, StatGrid, TextInput, ToolPanel } from "@/components/ui";
import { parseUrl } from "@/lib/web";

export default function UrlParser() {
  const [input, setInput] = useState("https://user@example.com:8443/products/list?page=2&sort=price#reviews");
  const result = useMemo(() => parseUrl(input), [input]);
  const parsed = result.parsed;

  const rows = parsed
    ? [
        { label: "Protocol", value: parsed.protocol || "—", hint: "scheme" },
        { label: "Host", value: parsed.host || "—", hint: "hostname and port" },
        { label: "Hostname", value: parsed.hostname || "—" },
        { label: "Port", value: parsed.port || "(default)" },
        { label: "Path", value: parsed.pathname || "/" },
        { label: "Fragment", value: parsed.hash || "(none)" },
        { label: "Origin", value: parsed.origin || "—" },
        { label: "Normalised", value: parsed.href },
      ]
    : [];

  return (
    <ToolPanel>
      <Field label="URL" htmlFor="url-parser-input" hint="Paste any URL — a missing scheme is treated as https.">
        <TextInput
          id="url-parser-input"
          value={input}
          onChange={(event) => setInput(event.target.value)}
          placeholder="https://example.com/path?query=1"
          spellCheck={false}
          className="font-mono text-[0.85rem]"
          invalid={Boolean(result.error)}
        />
      </Field>

      <div className="mt-5">
        {result.error ? (
          <div role="alert" className="border border-[#c0392b] bg-[var(--surface-muted)] p-3 font-mono text-[0.8rem] text-[#8d2f22] dark:text-[#ff9a8a]">
            {result.error}
          </div>
        ) : parsed ? (
          <>
            <StatGrid
              columns={3}
              items={[
                { label: "Query parameters", value: String(parsed.query.length) },
                { label: "Path segments", value: String(parsed.pathname.split("/").filter(Boolean).length) },
                { label: "Total length", value: `${parsed.raw.length} chars` },
              ]}
            />

            <div className="mt-4 divide-y divide-[var(--border)] border border-[var(--border)]">
              {rows.map((row) => (
                <div key={row.label} className="flex flex-wrap items-center gap-2 px-3 py-2">
                  <span className="w-28 font-mono text-[0.6rem] uppercase tracking-[0.12em] text-[var(--text-subtle)]">
                    {row.label}
                  </span>
                  <code className="min-w-0 flex-1 break-all font-mono text-[0.82rem] text-[var(--text)]">
                    {row.value}
                  </code>
                  {row.hint ? (
                    <span className="font-mono text-[0.6rem] text-[var(--text-subtle)]">{row.hint}</span>
                  ) : null}
                  <CopyButton text={row.value === "—" ? "" : row.value} label="Copy" />
                </div>
              ))}
            </div>

            {parsed.relative ? (
              <p className="mt-3 text-xs leading-relaxed text-[var(--text-subtle)]">
                This is a relative reference: it only makes sense inside a document, against a base URL.
              </p>
            ) : null}

            <div className="mt-5">
              <p className="label">Query parameters</p>
              {parsed.query.length === 0 ? (
                <EmptyState title="No parameters">
                  Everything after a “?” would appear here, decoded and listed one per row.
                </EmptyState>
              ) : (
                <SimpleTable
                  head={["Key", "Value"]}
                  caption="Decoded query parameters"
                  rows={parsed.query.map((param) => [param.key, param.value || "(empty)"])}
                />
              )}
            </div>
          </>
        ) : null}
      </div>

      <p className="mt-5 text-xs leading-relaxed text-[var(--text-subtle)]">
        Parsing uses the browser&apos;s own URL implementation, the same one that will resolve the link, so the
        breakdown matches what a request actually does. Nothing is fetched.
      </p>
    </ToolPanel>
  );
}
