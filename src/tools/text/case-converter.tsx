"use client";

import { useMemo, useState } from "react";
import { ArrowRight, RotateCcw } from "lucide-react";
import { Button, CopyButton, TextArea, ToolPanel } from "@/components/ui";
import { toCase, type CaseStyle } from "@/lib/text";
import { cn } from "@/lib/utils";

const STYLES: Array<{ id: CaseStyle; label: string; example: string }> = [
  { id: "upper", label: "UPPERCASE", example: "TEXT" },
  { id: "lower", label: "lowercase", example: "text" },
  { id: "title", label: "Title Case", example: "Text Tool" },
  { id: "sentence", label: "Sentence case", example: "Text tool" },
  { id: "capitalized", label: "Capitalized", example: "Text Tool" },
  { id: "alternating", label: "aLtErNaTiNg", example: "tExT" },
  { id: "inverse", label: "InVeRsE", example: "TEXT" },
  { id: "camel", label: "camelCase", example: "textTool" },
  { id: "pascal", label: "PascalCase", example: "TextTool" },
  { id: "snake", label: "snake_case", example: "text_tool" },
  { id: "kebab", label: "kebab-case", example: "text-tool" },
  { id: "constant", label: "CONSTANT_CASE", example: "TEXT_TOOL" },
];

export default function CaseConverter() {
  const [text, setText] = useState("");
  const [style, setStyle] = useState<CaseStyle>("upper");
  const output = useMemo(() => (text ? toCase(text, style) : ""), [text, style]);

  return (
    <ToolPanel>
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <label htmlFor="cc-input" className="label !mb-0">
          Your text
        </label>
        <Button size="sm" variant="ghost" onClick={() => setText("")}>
          <RotateCcw className="size-3.5" aria-hidden /> Clear
        </Button>
      </div>
      <TextArea
        id="cc-input"
        value={text}
        onChange={(event) => setText(event.target.value)}
        placeholder="Paste the text you want to convert…"
        className="min-h-32"
        spellCheck={false}
      />

      <fieldset className="mt-4">
        <legend className="label">Choose a case style</legend>
        <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-3 lg:grid-cols-4">
          {STYLES.map((option) => (
            <button
              key={option.id}
              type="button"
              onClick={() => setStyle(option.id)}
              aria-pressed={style === option.id}
              className={cn(
                "rounded-lg border px-2.5 py-2 text-left transition-colors",
                style === option.id
                  ? "border-brand-500 bg-brand-50 dark:border-brand-400 dark:bg-brand-500/15"
                  : "border-[var(--border)] bg-[var(--surface)] hover:border-[var(--border-strong)]",
              )}
            >
              <span className="block text-[0.78rem] font-semibold text-[var(--text)]">
                {option.label}
              </span>
              <span className="mt-0.5 block font-mono text-[0.65rem] text-[var(--text-subtle)]">
                {option.example}
              </span>
            </button>
          ))}
        </div>
      </fieldset>

      <div className="mt-4">
        <div className="mb-1.5 flex items-center justify-between gap-2">
          <span className="label !mb-0 flex items-center gap-1.5">
            <ArrowRight className="size-3.5" aria-hidden /> Result
          </span>
          <CopyButton text={output} />
        </div>
        <div
          aria-live="polite"
          className="min-h-24 whitespace-pre-wrap break-words rounded-xl border border-[var(--border)] bg-[var(--surface-muted)] p-3.5 font-[inherit] text-[0.95rem] text-[var(--text)]"
        >
          {output || (
            <span className="text-[var(--text-subtle)]">
              Converted text appears here as you type.
            </span>
          )}
        </div>
        {output ? (
          <p className="mt-1.5 text-xs text-[var(--text-subtle)]">
            {output.length.toLocaleString()} characters · {output.trim().split(/\s+/).filter(Boolean).length.toLocaleString()} words
          </p>
        ) : null}
      </div>
    </ToolPanel>
  );
}
