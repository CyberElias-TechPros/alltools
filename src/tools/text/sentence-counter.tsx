"use client";

import { useMemo, useState } from "react";
import { CopyButton, StatGrid, TextArea, ToolPanel } from "@/components/ui";
import { sentenceStats } from "@/lib/text";

export default function SentenceCounter() {
  const [text, setText] = useState("");
  const stats = useMemo(() => sentenceStats(text), [text]);
  const summary = stats.sentences
    .map((sentence, index) => `${index + 1}. (${sentence.words} words) ${sentence.text}`)
    .join("\n");

  return (
    <ToolPanel>
      <div className="grid gap-4 lg:grid-cols-[1.2fr_1fr]">
        <div>
          <label htmlFor="sc-input" className="label">
            Your text
          </label>
          <TextArea
            id="sc-input"
            value={text}
            onChange={(event) => setText(event.target.value)}
            placeholder="Paste the paragraph or document…"
            className="min-h-[16rem]"
            spellCheck={false}
          />
        </div>

        <div className="flex flex-col gap-3">
          <StatGrid
            items={[
              { label: "Sentences", value: stats.sentences.length.toLocaleString() },
              { label: "Average", value: `${stats.averageWords.toFixed(1)} words` },
              {
                label: "Longest",
                value: stats.longest ? `${stats.longest.words} words` : "—",
              },
              {
                label: "Shortest",
                value: stats.shortest ? `${stats.shortest.words} words` : "—",
              },
            ]}
          />
          <div className="flex justify-end">
            <CopyButton text={summary} size="sm" label="Copy list" />
          </div>
          <ol className="max-h-[18rem] divide-y divide-[var(--border)] overflow-y-auto border-y border-[var(--border)]">
            {stats.sentences.length === 0 ? (
              <li className="py-4 text-sm text-[var(--text-muted)]">Sentences appear here.</li>
            ) : (
              stats.sentences.map((sentence, index) => {
                const long = sentence.words > 30;
                return (
                  <li key={`${index}-${sentence.text.slice(0, 12)}`} className="flex gap-3 py-2.5">
                    <span className="font-mono text-[0.6rem] text-[var(--text-subtle)]">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <span className="min-w-0 flex-1 text-sm text-[var(--text-muted)]">
                      {sentence.text}
                    </span>
                    <span
                      className={`shrink-0 font-mono text-[0.6rem] ${
                        long ? "text-[var(--accent-text)]" : "text-[var(--text-subtle)]"
                      }`}
                    >
                      {sentence.words}w
                    </span>
                  </li>
                );
              })
            )}
          </ol>
        </div>
      </div>
    </ToolPanel>
  );
}
