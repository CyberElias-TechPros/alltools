"use client";

import { useMemo, useState } from "react";
import { RotateCcw } from "lucide-react";
import { Button, CopyButton, TextArea, ToolPanel } from "@/components/ui";
import { ModeCard, ModeHub } from "@/components/tools/mode-hub";
import { reverseText } from "@/lib/text";

const MODES = [
  { id: "characters" as const, title: "Characters", hint: "Every grapheme in reverse order — emoji and accents stay whole.", badge: "Text" },
  { id: "words" as const, title: "Words", hint: "Word order flips, each word keeps its spelling.", badge: "Text" },
  { id: "lines" as const, title: "Lines", hint: "Line order flips — handy for undoing a sort.", badge: "Text" },
];

export default function TextReverser() {
  const [input, setInput] = useState("");
  const outputs = useMemo(
    () => MODES.map((mode) => ({ ...mode, output: input ? reverseText(input, mode.id) : "" })),
    [input],
  );

  return (
    <ToolPanel>
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
        className="min-h-32"
        spellCheck={false}
      />

      <div className="mt-4">
        <ModeHub columns={3}>
          {outputs.map((mode) => (
            <ModeCard key={mode.id} title={mode.title} hint={mode.hint}>
              <div
                aria-live="polite"
                className="min-h-24 flex-1 whitespace-pre-wrap break-words rounded-xl border border-[var(--border)] bg-[var(--code-bg)] p-3 font-mono text-[0.82rem] text-[var(--text)]"
              >
                {mode.output || <span className="text-[var(--text-subtle)]">Reversed text appears here.</span>}
              </div>
              <div className="mt-2 flex items-center justify-between gap-2">
                <span className="font-mono text-[0.62rem] uppercase tracking-[0.1em] text-[var(--text-subtle)]">
                  {mode.output.length} chars
                </span>
                <CopyButton text={mode.output} />
              </div>
            </ModeCard>
          ))}
        </ModeHub>
      </div>

      <p className="mt-3 text-xs text-[var(--text-subtle)]">
        Reversal is cosmetic, not encryption. Grapheme-aware segmenting keeps emoji and accented
        characters whole, and all three readings update at once.
      </p>
    </ToolPanel>
  );
}
