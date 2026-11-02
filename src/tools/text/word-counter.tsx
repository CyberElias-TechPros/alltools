"use client";

import { useMemo, useState } from "react";
import { RotateCcw } from "lucide-react";
import {
  Button,
  CopyButton,
  StatGrid,
  TextArea,
  ToolPanel,
} from "@/components/ui";
import { countText, keywordFrequency } from "@/lib/text";
import { formatDuration, formatNumber } from "@/lib/utils";

const SAMPLE =
  "Good writing is clear, specific and shorter than it needs to be. Paste your draft here to check its length before you publish.";

export default function WordCounter() {
  const [text, setText] = useState("");
  const stats = useMemo(() => countText(text), [text]);
  const keywords = useMemo(() => keywordFrequency(text, 8), [text]);

  const summary = [
    `${formatNumber(stats.words)} words`,
    `${formatNumber(stats.characters)} characters (${formatNumber(stats.charactersNoSpaces)} without spaces)`,
    `${formatNumber(stats.sentences)} sentences`,
    `${formatNumber(stats.paragraphs)} paragraphs`,
    `Reading time ${formatDuration(stats.readingSeconds)}`,
    `Speaking time ${formatDuration(stats.speakingSeconds)}`,
  ].join(" · ");

  return (
    <ToolPanel>
      <div className="grid gap-4 lg:grid-cols-[1.35fr_1fr]">
        <div>
          <div className="mb-2 flex items-center justify-between gap-2">
            <label htmlFor="wc-input" className="label !mb-0">
              Your text
            </label>
            <div className="flex gap-1.5">
              <Button size="sm" variant="ghost" onClick={() => setText(SAMPLE)}>
                Sample
              </Button>
              <Button size="sm" variant="ghost" onClick={() => setText("")}>
                <RotateCcw className="size-3.5" aria-hidden /> Clear
              </Button>
            </div>
          </div>
          <TextArea
            id="wc-input"
            value={text}
            onChange={(event) => setText(event.target.value)}
            placeholder="Start typing or paste your text…"
            className="min-h-[15rem] font-[inherit] text-[0.95rem]"
            spellCheck={false}
          />
        </div>

        <div className="flex flex-col gap-3">
          <div className="rounded-xl border border-brand-200 bg-brand-50/60 p-4 dark:border-brand-800/60 dark:bg-brand-900/15">
            <p className="text-[0.7rem] font-semibold uppercase tracking-[0.08em] text-[var(--text-subtle)]">
              Words
            </p>
            <p className="font-mono text-4xl font-bold tracking-tight text-[var(--text)]">
              {formatNumber(stats.words)}
            </p>
            <p className="mt-1 text-xs text-[var(--text-muted)]">
              {formatDuration(stats.readingSeconds)} read · {formatDuration(stats.speakingSeconds)}{" "}
              spoken
            </p>
          </div>
          <StatGrid
            columns={2}
            items={[
              { label: "Characters", value: formatNumber(stats.characters) },
              { label: "No spaces", value: formatNumber(stats.charactersNoSpaces) },
              { label: "Sentences", value: formatNumber(stats.sentences) },
              { label: "Paragraphs", value: formatNumber(stats.paragraphs) },
            ]}
          />
          <div className="flex flex-wrap gap-2">
            <CopyButton text={summary} label="Copy summary" />
            <CopyButton text={text} label="Copy text" />
          </div>
        </div>
      </div>

      {text.trim() ? (
        <div className="mt-5">
          <h3 className="mb-2 text-[0.72rem] font-bold uppercase tracking-[0.09em] text-[var(--text-subtle)]">
            Most frequent words
          </h3>
          {keywords.length ? (
            <ul className="flex flex-wrap gap-1.5">
              {keywords.map((entry) => (
                <li
                  key={entry.term}
                  className="inline-flex items-center gap-1.5 rounded-full border border-[var(--border)] bg-[var(--surface-muted)] px-2.5 py-1 text-xs text-[var(--text-muted)]"
                >
                  <span className="font-medium text-[var(--text)]">{entry.term}</span>
                  <span className="font-mono text-[0.7rem]">{entry.count}</span>
                  <span className="text-[0.65rem] text-[var(--text-subtle)]">
                    {entry.density.toFixed(1)}%
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-xs text-[var(--text-subtle)]">
              No repeated words yet — keep typing to see frequency data.
            </p>
          )}
        </div>
      ) : null}
    </ToolPanel>
  );
}
