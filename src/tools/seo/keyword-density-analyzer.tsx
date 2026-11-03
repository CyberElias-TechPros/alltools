"use client";

import { useMemo, useState } from "react";
import {
  CopyButton,
  DownloadButton,
  Segmented,
  SimpleTable,
  Switch,
  TextArea,
  ToolPanel,
} from "@/components/ui";
import { countText, keywordFrequency } from "@/lib/text";
import { formatNumber } from "@/lib/utils";

export default function KeywordDensityAnalyzer() {
  const [text, setText] = useState("");
  const [ngram, setNgram] = useState<"1" | "2" | "3">("1");
  const [includeStopWords, setIncludeStopWords] = useState(false);

  const stats = useMemo(() => countText(text), [text]);
  const rows = useMemo(
    () =>
      keywordFrequency(text, 25, {
        includeStopWords,
        ngram: Number(ngram) as 1 | 2 | 3,
      }),
    [text, includeStopWords, ngram],
  );

  const csv = useMemo(
    () => ["Term,Count,Density %", ...rows.map((row) => `"${row.term}",${row.count},${row.density.toFixed(2)}`)].join("\n"),
    [rows],
  );

  return (
    <ToolPanel>
      <div className="grid gap-4 lg:grid-cols-[1fr_1.15fr]">
        <div>
          <label htmlFor="kd-input" className="label">
            Your content
          </label>
          <TextArea
            id="kd-input"
            value={text}
            onChange={(event) => setText(event.target.value)}
            placeholder="Paste the article or page copy you want to analyse…"
            className="min-h-64 text-[0.92rem]"
            spellCheck={false}
          />
          <div className="mt-2 flex flex-wrap gap-3 text-xs text-[var(--text-subtle)]">
            <span>{formatNumber(stats.words)} words</span>
            <span>{formatNumber(stats.sentences)} sentences</span>
            <span>{formatNumber(stats.characters)} characters</span>
          </div>
        </div>

        <div>
          <div className="mb-2 flex flex-wrap items-center gap-2">
            <Segmented
              label="Phrase length"
              value={ngram}
              onChange={setNgram}
              options={[
                { value: "1", label: "Words" },
                { value: "2", label: "2-word" },
                { value: "3", label: "3-word" },
              ]}
              className="min-w-48 flex-1"
            />
            <Switch checked={includeStopWords} onChange={setIncludeStopWords} label="Include stop words" />
          </div>

          <div className="flex items-center justify-between gap-2">
            <span className="text-[0.7rem] font-bold uppercase tracking-[0.08em] text-[var(--text-subtle)]">
              Top {ngram === "1" ? "words" : "phrases"}
            </span>
            <div className="flex gap-1.5">
              <CopyButton text={csv} label="Copy CSV" />
              <DownloadButton filename="keyword-density.csv" content={csv} mime="text/csv" />
            </div>
          </div>

          <div className="mt-2 max-h-80 overflow-auto">
            {rows.length ? (
              <SimpleTable
                caption="Keyword frequency"
                head={["Term", "Count", "Density"]}
                rows={rows.map((row) => [
                  row.term,
                  formatNumber(row.count),
                  `${row.density.toFixed(2)}%`,
                ])}
              />
            ) : (
              <p className="rounded-lg border border-dashed border-[var(--border-strong)] px-3 py-8 text-center text-sm text-[var(--text-muted)]">
                Paste some text to see its keyword profile.
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="mt-4 rounded-xl border border-[var(--border)] bg-[var(--surface-muted)] p-3 text-xs leading-relaxed text-[var(--text-muted)]">
        <strong className="text-[var(--text)]">Read this before optimising:</strong> Google has said
        it does not use a keyword density metric. Density is useful for spotting accidental
        repetition or topic drift — not for hitting a target percentage. Natural writing usually
        lands between 0.5% and 2% for a primary term.
      </div>
    </ToolPanel>
  );
}
