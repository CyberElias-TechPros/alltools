"use client";

import { useMemo, useState } from "react";
import { CheckCircle2, TriangleAlert } from "lucide-react";
import {
  Button,
  CopyButton,
  DownloadButton,
  Segmented,
  Select,
  Switch,
  TextArea,
  ToolPanel,
} from "@/components/ui";
import { formatJson } from "@/lib/dev";

const SAMPLE = `{"team":"Toolz","tool":"json-formatter","live":true,"tags":["fast","private"],"owner":{"name":"You","email":"you@example.com"}}`;

export default function JsonFormatter() {
  const [input, setInput] = useState("");
  const [indent, setIndent] = useState<"2" | "4" | "tab">("2");
  const [sortKeys, setSortKeys] = useState(false);
  const [mode, setMode] = useState<"format" | "minify">("format");

  const result = useMemo(() => {
    if (!input.trim()) return { output: "", minified: "" };
    return formatJson(input, indent === "tab" ? "tab" : Number(indent), sortKeys);
  }, [input, indent, sortKeys]);

  const output = mode === "minify" ? (result.minified ?? "") : result.output;
  const bytes = new TextEncoder().encode(output).length;

  return (
    <ToolPanel>
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <Segmented
          label="Output"
          value={mode}
          onChange={setMode}
          options={[
            { value: "format", label: "Pretty print" },
            { value: "minify", label: "Minify" },
          ]}
          className="min-w-56"
        />
        {mode === "format" ? (
          <Select
            aria-label="Indentation"
            value={indent}
            onChange={(event) => setIndent(event.target.value as "2" | "4" | "tab")}
            className="!w-36"
          >
            <option value="2">2 spaces</option>
            <option value="4">4 spaces</option>
            <option value="tab">Tabs</option>
          </Select>
        ) : null}
        <Switch checked={sortKeys} onChange={setSortKeys} label="Sort keys" />
        <Button size="sm" variant="ghost" onClick={() => setInput(SAMPLE)} className="ml-auto">
          Load sample
        </Button>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div>
          <label htmlFor="json-input" className="label">
            Input JSON
          </label>
          <TextArea
            id="json-input"
            value={input}
            onChange={(event) => setInput(event.target.value)}
            placeholder='{"hello":"world"}'
            className="min-h-72 font-mono text-[0.82rem]"
            spellCheck={false}
            aria-invalid={Boolean(result.error) || undefined}
          />
        </div>
        <div>
          <div className="mb-2 flex items-center justify-between">
            <span className="label !mb-0">Output</span>
            <div className="flex gap-1.5">
              <CopyButton text={output} />
              <DownloadButton filename="formatted.json" content={output} mime="application/json" />
            </div>
          </div>
          <div
            aria-live="polite"
            className="min-h-72 overflow-auto whitespace-pre rounded-xl border border-[var(--border)] bg-[var(--code-bg)] p-3 font-mono text-[0.82rem] leading-relaxed text-[var(--text)]"
          >
            {output || (
              <span className="text-[var(--text-subtle)]">
                Formatted JSON appears here.
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="mt-3 min-h-6" aria-live="polite">
        {!input.trim() ? null : result.error ? (
          <p className="flex items-start gap-2 rounded-lg border border-rose-300/70 bg-rose-50 px-3 py-2 text-sm text-rose-900 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-200">
            <TriangleAlert className="mt-0.5 size-4 shrink-0" aria-hidden />
            <span>
              <strong>Invalid JSON</strong>
              {result.error.line ? ` at line ${result.error.line}, column ${result.error.column}` : ""}:{" "}
              {result.error.message}
            </span>
          </p>
        ) : (
          <p className="flex items-center gap-2 text-sm text-emerald-700 dark:text-emerald-400">
            <CheckCircle2 className="size-4" aria-hidden />
            Valid JSON · {bytes.toLocaleString()} bytes in {mode === "minify" ? "minified" : "formatted"} output
          </p>
        )}
      </div>
    </ToolPanel>
  );
}
