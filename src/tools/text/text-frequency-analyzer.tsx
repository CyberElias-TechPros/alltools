"use client";

import { useMemo, useState } from "react";
import { CopyButton, Field, SimpleTable, StatGrid, TextArea, TextInput, ToolPanel, Switch } from "@/components/ui";
import { keywordFrequency, countText } from "@/lib/text";

const STOP_WORDS = new Set(
  "the a an and or but if then than that this these those of to in on at by for with from as is are was were be been being it its i you he she we they them his her their our my me us do does did not no so up out about into over after also can will just have has had would could should may might must there here when where which who whom what why how".split(
    " ",
  ),
);

export default function TextFrequencyAnalyzer() {
  const [text, setText] = useState("");
  const [ignoreStopWords, setIgnoreStopWords] = useState(true);
  const [phrases, setPhrases] = useState(false);

  const rows = useMemo(() => {
    if (!text.trim()) return [];
    const tokens = text.toLowerCase().match(/[\p{L}\p{N}][\p{L}\p{N}'’-]*/gu) ?? [];
    const total = Math.max(tokens.length, 1);
    const counts = new Map<string, number>();

    if (phrases) {
      const filtered = tokens.filter((token) => !ignoreStopWords || !STOP_WORDS.has(token));
      for (let index = 0; index < filtered.length - 1; index += 1) {
        const phrase = `${filtered[index]} ${filtered[index + 1]}`;
        counts.set(phrase, (counts.get(phrase) ?? 0) + 1);
      }
    } else {
      for (const token of tokens) {
        if (ignoreStopWords && STOP_WORDS.has(token)) continue;
        counts.set(token, (counts.get(token) ?? 0) + 1);
      }
    }

    return [...counts.entries()]
      .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
      .slice(0, 25)
      .map(([term, count]) => [term, count.toLocaleString(), `${((count / total) * 100).toFixed(2)}%`]);
  }, [text, ignoreStopWords, phrases]);

  const stats = countText(text);
  const copyText = rows.map((row) => `${row[0]}\t${row[1]}\t${row[2]}`).join("\n");

  return (
    <ToolPanel>
      <div className="grid gap-4 lg:grid-cols-[1.1fr_1fr]">
        <div>
          <label htmlFor="tf-input" className="label">
            Your text
          </label>
          <TextArea
            id="tf-input"
            value={text}
            onChange={(event) => setText(event.target.value)}
            placeholder="Paste the article, script or draft…"
            className="min-h-[22rem]"
            spellCheck={false}
          />
          <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-2">
            <Switch
              id="tf-stop"
              checked={ignoreStopWords}
              onChange={setIgnoreStopWords}
              label="Ignore stop words"
            />
            <Switch id="tf-phrases" checked={phrases} onChange={setPhrases} label="Two-word phrases" />
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <StatGrid
            items={[
              { label: "Words", value: stats.words.toLocaleString() },
              { label: "Unique", value: rows.length.toLocaleString(), hint: "shown" },
              { label: "Sentences", value: stats.sentences.toLocaleString() },
              { label: "Characters", value: stats.characters.toLocaleString() },
            ]}
          />
          <div className="flex items-center justify-between">
            <span className="eyebrow">Top terms</span>
            <CopyButton text={copyText} size="sm" label="Copy table" />
          </div>
          {rows.length ? (
            <div className="max-h-[26rem] overflow-y-auto">
              <SimpleTable head={["Term", "Count", "Density"]} rows={rows} caption="Most frequent terms" />
            </div>
          ) : (
            <p className="border border-dashed border-[var(--border-strong)] p-6 text-sm text-[var(--text-muted)]">
              Paste text to see which words repeat.
            </p>
          )}
        </div>
      </div>
    </ToolPanel>
  );
}
