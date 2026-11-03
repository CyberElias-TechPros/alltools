"use client";

import { useMemo, useState } from "react";
import { CopyButton, StatGrid, TextArea, ToolPanel } from "@/components/ui";
import { paragraphStats } from "@/lib/text";

export default function ParagraphCounter() {
  const [text, setText] = useState("");
  const stats = useMemo(() => paragraphStats(text), [text]);
  const summary = stats.paragraphs
    .map((paragraph, index) => `${index + 1}. ${paragraph.words} words · ${paragraph.sentences} sentences`)
    .join("\n");

  return (
    <ToolPanel>
      <div className="grid gap-4 lg:grid-cols-[1.2fr_1fr]">
        <div>
          <label htmlFor="pc-input" className="label">
            Your text
          </label>
          <TextArea
            id="pc-input"
            value={text}
            onChange={(event) => setText(event.target.value)}
            placeholder="Paste a document — separate paragraphs with a blank line…"
            className="min-h-[16rem]"
            spellCheck={false}
          />
        </div>

        <div className="flex flex-col gap-3">
          <StatGrid
            items={[
              { label: "Paragraphs", value: stats.paragraphs.length.toLocaleString() },
              { label: "Average", value: `${stats.averageWords.toFixed(0)} words` },
              {
                label: "Longest",
                value: stats.paragraphs.length
                  ? `${Math.max(...stats.paragraphs.map((item) => item.words))} words`
                  : "—",
              },
              {
                label: "Shortest",
                value: stats.paragraphs.length
                  ? `${Math.min(...stats.paragraphs.map((item) => item.words))} words`
                  : "—",
              },
            ]}
          />
          <div className="flex justify-end">
            <CopyButton text={summary} size="sm" label="Copy breakdown" />
          </div>
          <ol className="max-h-[18rem] divide-y divide-[var(--border)] overflow-y-auto border-y border-[var(--border)]">
            {stats.paragraphs.length === 0 ? (
              <li className="py-4 text-sm text-[var(--text-muted)]">Paragraphs appear here.</li>
            ) : (
              stats.paragraphs.map((paragraph, index) => (
                <li key={index} className="flex items-start gap-3 py-2.5">
                  <span className="font-mono text-[0.6rem] text-[var(--text-subtle)]">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <span className="min-w-0 flex-1 truncate text-sm text-[var(--text-muted)]">
                    {paragraph.text}
                  </span>
                  <span className="shrink-0 font-mono text-[0.6rem] text-[var(--text-subtle)]">
                    {paragraph.words}w
                  </span>
                </li>
              ))
            )}
          </ol>
        </div>
      </div>
    </ToolPanel>
  );
}
