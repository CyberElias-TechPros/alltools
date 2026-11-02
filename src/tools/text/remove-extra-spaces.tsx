"use client";

import { useMemo, useState } from "react";
import { ArrowRight, RotateCcw } from "lucide-react";
import {
  Button,
  CopyButton,
  DownloadButton,
  Switch,
  TextArea,
  ToolPanel,
} from "@/components/ui";
import { cleanWhitespace } from "@/lib/text";

export default function WhitespaceCleaner() {
  const [input, setInput] = useState("");
  const [collapseSpaces, setCollapseSpaces] = useState(true);
  const [trimLines, setTrimLines] = useState(true);
  const [removeBlankLines, setRemoveBlankLines] = useState(false);
  const [removeLineBreaks, setRemoveLineBreaks] = useState(false);
  const [normaliseUnicodeSpaces, setNormaliseUnicodeSpaces] = useState(true);

  const output = useMemo(
    () =>
      cleanWhitespace(input, {
        collapseSpaces,
        trimLines,
        removeBlankLines,
        removeLineBreaks,
        normaliseUnicodeSpaces,
      }),
    [input, collapseSpaces, trimLines, removeBlankLines, removeLineBreaks, normaliseUnicodeSpaces],
  );

  const saved = Math.max(input.length - output.length, 0);

  return (
    <ToolPanel>
      <div className="grid gap-4 lg:grid-cols-2">
        <div>
          <div className="mb-2 flex items-center justify-between">
            <label htmlFor="ws-input" className="label !mb-0">
              Messy text
            </label>
            <Button size="sm" variant="ghost" onClick={() => setInput("")}>
              <RotateCcw className="size-3.5" aria-hidden /> Clear
            </Button>
          </div>
          <TextArea
            id="ws-input"
            value={input}
            onChange={(event) => setInput(event.target.value)}
            placeholder="Paste text with   double spaces, tabs and stray line breaks…"
            className="min-h-64 font-mono text-[0.85rem]"
            spellCheck={false}
          />
          <p className="mt-1.5 text-xs text-[var(--text-subtle)]">
            {input.length.toLocaleString()} characters in
          </p>
        </div>
        <div>
          <div className="mb-2 flex items-center justify-between">
            <span className="label !mb-0 flex items-center gap-1.5">
              <ArrowRight className="size-3.5" aria-hidden /> Cleaned
            </span>
            <div className="flex gap-1.5">
              <CopyButton text={output} />
              <DownloadButton filename="cleaned-text.txt" content={output} />
            </div>
          </div>
          <div className="min-h-64 overflow-auto whitespace-pre-wrap break-words rounded-xl border border-[var(--border)] bg-[var(--surface-muted)] p-3 font-mono text-[0.85rem] text-[var(--text)]">
            {output || (
              <span className="font-sans text-[var(--text-subtle)]">
                Clean text appears here.
              </span>
            )}
          </div>
          <p aria-live="polite" className="mt-1.5 text-xs text-[var(--text-subtle)]">
            {output.length.toLocaleString()} characters out · {saved.toLocaleString()} removed
          </p>
        </div>
      </div>

      <div className="mt-4 grid gap-x-6 gap-y-1 rounded-xl border border-[var(--border)] bg-[var(--surface-muted)] p-3 sm:grid-cols-2">
        <Switch checked={collapseSpaces} onChange={setCollapseSpaces} label="Collapse runs of spaces" />
        <Switch checked={trimLines} onChange={setTrimLines} label="Trim each line" />
        <Switch checked={removeBlankLines} onChange={setRemoveBlankLines} label="Remove blank lines" />
        <Switch checked={removeLineBreaks} onChange={setRemoveLineBreaks} label="Join all lines" description="Turns hard-wrapped text into one paragraph" />
        <Switch checked={normaliseUnicodeSpaces} onChange={setNormaliseUnicodeSpaces} label="Fix non-breaking spaces" description="Converts invisible Unicode spaces to regular spaces" />
      </div>
    </ToolPanel>
  );
}
