"use client";

import { useMemo, useState } from "react";
import { Download, RotateCcw } from "lucide-react";
import {
  Button,
  CopyButton,
  EmptyState,
  Field,
  Select,
  Switch,
  TextArea,
  ToolPanel,
} from "@/components/ui";

export type TransformOption =
  | {
      kind: "select";
      id: string;
      label: string;
      hint?: string;
      options: { value: string; label: string }[];
      defaultValue: string;
    }
  | {
      kind: "toggle";
      id: string;
      label: string;
      hint?: string;
      defaultValue: boolean;
    };

export type TransformResult = { output: string; note?: string } | { error: string };

/**
 * Shared shell for the large family of "one text in, one text out" tools.
 *
 * Keeping these on one component means every transform tool gets the same
 * keyboard behaviour, error handling, copy/download affordances and empty
 * state — the differences between them are the transform itself and the copy.
 * All processing happens in the browser; nothing is sent anywhere.
 */
export function TransformTool({
  id,
  inputLabel = "Input",
  outputLabel = "Result",
  placeholder = "Type or paste here…",
  sample,
  run,
  options = [],
  mono = false,
  rows = 12,
  outputRows,
  downloadName,
  extraActions,
}: {
  id: string;
  inputLabel?: string;
  outputLabel?: string;
  placeholder?: string;
  sample?: string;
  run: (input: string, values: Record<string, string | boolean>) => TransformResult;
  options?: TransformOption[];
  mono?: boolean;
  rows?: number;
  outputRows?: number;
  downloadName?: string;
  extraActions?: React.ReactNode;
}) {
  const defaults = useMemo(
    () =>
      Object.fromEntries(
        options.map((option) => [option.id, option.defaultValue]),
      ) as Record<string, string | boolean>,
    [options],
  );

  const [input, setInput] = useState("");
  const [values, setValues] = useState<Record<string, string | boolean>>(defaults);

  const result = useMemo(() => run(input, values), [run, input, values]);

  function reset() {
    setInput("");
    setValues(defaults);
  }

  function download() {
    if ("output" in result === false || !result.output) return;
    const blob = new Blob([result.output], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = downloadName ?? `${id}.txt`;
    anchor.click();
    URL.revokeObjectURL(url);
  }

  const hasInput = input.trim().length > 0;

  return (
    <ToolPanel>
      <div className="grid gap-5 lg:grid-cols-2">
        <div>
          <div className="mb-2 flex items-center justify-between gap-2">
            <label htmlFor={`${id}-input`} className="label !mb-0">
              {inputLabel}
            </label>
            <div className="flex gap-1">
              {sample ? (
                <Button size="sm" variant="ghost" onClick={() => setInput(sample)}>
                  Sample
                </Button>
              ) : null}
              <Button size="sm" variant="ghost" onClick={reset} disabled={!hasInput}>
                <RotateCcw className="size-3" aria-hidden /> Reset
              </Button>
            </div>
          </div>
          <TextArea
            id={`${id}-input`}
            value={input}
            onChange={(event) => setInput(event.target.value)}
            placeholder={placeholder}
            rows={rows}
            spellCheck={false}
            className={`min-h-[13rem] ${mono ? "font-mono text-[0.84rem]" : ""}`}
          />
        </div>

        <div>
          <div className="mb-2 flex items-center justify-between gap-2">
            <span className="label !mb-0">{outputLabel}</span>
            <div className="flex gap-1">
              {"output" in result && result.output ? (
                <>
                  <CopyButton text={result.output} size="sm" />
                  {downloadName ? (
                    <Button size="sm" variant="ghost" onClick={download}>
                      <Download className="size-3" aria-hidden />
                    </Button>
                  ) : null}
                </>
              ) : null}
              {extraActions}
            </div>
          </div>

          {"error" in result ? (
            <div
              role="alert"
              className="min-h-[13rem] border border-[#c0392b] bg-[var(--surface-muted)] p-3 font-mono text-[0.8rem] leading-relaxed text-[#8d2f22] dark:text-[#ff9a8a]"
            >
              {result.error}
            </div>
          ) : hasInput ? (
            <div className="border border-[var(--border)] bg-[var(--page-elevated)]">
              <TextArea
                readOnly
                value={result.output}
                rows={outputRows ?? rows}
                aria-label={outputLabel}
                className={`min-h-[13rem] border-0 bg-transparent ${
                  mono ? "font-mono text-[0.84rem]" : ""
                }`}
              />
              {result.note ? (
                <p className="border-t border-[var(--border)] px-3 py-2 font-mono text-[0.6rem] uppercase tracking-[0.12em] text-[var(--text-subtle)]">
                  {result.note}
                </p>
              ) : null}
            </div>
          ) : (
            <EmptyState title="Nothing to show yet">
              {placeholder}
            </EmptyState>
          )}
        </div>
      </div>

      {options.length ? (
        <div className="mt-5 grid gap-4 border-t border-[var(--border)] pt-4 sm:grid-cols-2 lg:grid-cols-3">
          {options.map((option) =>
            option.kind === "select" ? (
              <Field key={option.id} label={option.label} htmlFor={`${id}-${option.id}`} hint={option.hint}>
                <Select
                  id={`${id}-${option.id}`}
                  value={String(values[option.id] ?? option.defaultValue)}
                  onChange={(event) =>
                    setValues((current) => ({ ...current, [option.id]: event.target.value }))
                  }
                >
                  {option.options.map((choice) => (
                    <option key={choice.value} value={choice.value}>
                      {choice.label}
                    </option>
                  ))}
                </Select>
              </Field>
            ) : (
              <div key={option.id} className="pt-1">
                <Switch
                  id={`${id}-${option.id}`}
                  checked={Boolean(values[option.id])}
                  onChange={(next) =>
                    setValues((current) => ({ ...current, [option.id]: next }))
                  }
                  label={option.label}
                  description={option.hint}
                />
              </div>
            ),
          )}
        </div>
      ) : null}
    </ToolPanel>
  );
}
