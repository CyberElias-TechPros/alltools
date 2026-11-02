"use client";

import { useMemo, useState } from "react";
import { ArrowLeftRight, RotateCcw } from "lucide-react";
import { Button, CopyButton, Segmented, TextArea, ToolPanel } from "@/components/ui";
import { reverseText } from "@/lib/text";

export default function TextReverser() {
  const [input, setInput] = useState("");
  const [mode, setMode] = useState<"characters" | "words" | "lines">("characters");
  const output = useMemo(() => (input ? reverseText(input, mode) : ""), [input, mode]);

  return (
    <ToolPanel>
      <div className="mb-3">
        <Segmented
          label="Reverse by"
          value={mode}
          onChange={setMode}
          options={[
            { value: "characters", label: "Characters" },
            { value: "words", label: "Words" },
            { value: "lines", label: "Lines" },
          ]}
        />
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        <div>
          <div className="mb-2 flex items-center justify-between">
            <label htmlFor="tr-input" className="label !mb-0">
              Original text
            </label>
            <Button size="sm" variant="ghost" onClick={() => setInput("")}>
              <RotateCcw className="size-3.5" aria-hidden /> Clear
            </Button>
          </div>
          <TextArea
            id="tr-input"
            value={input}
            onChange={(event) => setInput(event.target.value)}
            placeholder="Hello world 🙂"
            className="min-h-40"
            spellCheck={false}
          />
        </div>
        <div>
          <div className="mb-2 flex items-center justify-between">
            <span className="label !mb-0 flex items-center gap-1.5">
              <ArrowLeftRight className="size-3.5" aria-hidden /> Reversed
            </span>
            <CopyButton text={output} />
          </div>
          <div
            aria-live="polite"
            className="min-h-40 whitespace-pre-wrap break-words rounded-xl border border-[var(--border)] bg-[var(--surface-muted)] p-3.5 text-[0.95rem] text-[var(--text)]"
          >
            {output || (
              <span className="text-[var(--text-subtle)]">
                Reversed text appears here — emoji stay intact.
              </span>
            )}
          </div>
        </div>
      </div>
      <p className="mt-3 text-xs text-[var(--text-subtle)]">
        Reversal is cosmetic, not encryption. Grapheme-aware segmenting keeps emoji and accented
        characters whole.
      </p>
    </ToolPanel>
  );
}
