"use client";

import { useMemo, useState } from "react";
import { Callout, Field, ResultCard, SimpleTable, StatGrid, TextArea, TextInput, ToolPanel } from "@/components/ui";
import { countText, paragraphStats, sentenceStats, timeToRead } from "@/lib/text";
import { readability } from "@/lib/seo-tools";

const SAMPLE = `Learning to write clearly is mostly a matter of cutting. A first draft explains an idea to yourself; a second draft explains it to a reader who has none of your context.

Most students over-write the introduction and under-write the evidence. The introduction can be three sentences. The evidence needs the space, because that is the part a marker can check.`;

export default function EssayWordCounter() {
  const [text, setText] = useState(SAMPLE);
  const [target, setTarget] = useState("1500");

  const stats = useMemo(() => countText(text), [text]);
  const sentences = useMemo(() => sentenceStats(text), [text]);
  const paragraphs = useMemo(() => paragraphStats(text), [text]);
  const scores = useMemo(() => readability(text), [text]);
  const readingTime = useMemo(() => timeToRead(text), [text]);

  const targetWords = Number(target);
  const difference = Number.isFinite(targetWords) ? stats.words - targetWords : Number.NaN;
  const percentOfTarget = Number.isFinite(targetWords) && targetWords > 0 ? (stats.words / targetWords) * 100 : Number.NaN;

  const longest = sentences.longest?.words ?? 0;
  const paragraphRows = paragraphs.paragraphs.map((paragraph, index) => [
    `¶ ${index + 1}`,
    String(paragraph.words),
    String(paragraph.sentences),
    paragraph.words > 180 ? "Long — consider splitting" : paragraph.words < 30 ? "Short — may read as a fragment" : "Typical",
  ]);

  return (
    <ToolPanel>
      <div className="grid gap-4 sm:grid-cols-[1fr_10rem]">
        <Field label="Essay" htmlFor="essay-text" hint="Pasted text never leaves the page.">
          <TextArea id="essay-text" value={text} onChange={(event) => setText(event.target.value)} rows={12} spellCheck={false} />
        </Field>
        <div className="space-y-3">
          <Field label="Word target" htmlFor="essay-target" hint="The limit or minimum you were given.">
            <TextInput id="essay-target" type="number" min={0} value={target} onChange={(event) => setTarget(event.target.value)} className="font-mono" />
          </Field>
          <div className="border border-[var(--border)] p-3">
            <p className="label">Against the target</p>
            <p className="font-mono text-2xl text-[var(--text)]">
              {Number.isFinite(difference) ? `${difference > 0 ? "+" : ""}${difference}` : "—"}
            </p>
            <p className="mt-1 text-xs text-[var(--text-subtle)]">
              {Number.isFinite(percentOfTarget) ? `${percentOfTarget.toFixed(0)}% of ${targetWords} words` : "Set a target to compare"}
            </p>
          </div>
        </div>
      </div>

      <div className="mt-6">
        <ResultCard
          label="Word count"
          value={stats.words.toLocaleString("en-GB")}
          sub={`${stats.characters.toLocaleString("en-GB")} characters · ${stats.sentences} sentences · ${stats.paragraphs} paragraphs`}
          tone="brand"
        >
          <StatGrid
            columns={4}
            items={[
              { label: "Words", value: stats.words.toLocaleString("en-GB") },
              { label: "Characters", value: stats.characters.toLocaleString("en-GB") },
              { label: "Avg sentence", value: `${sentences.averageWords.toFixed(1)} words` },
              { label: "Reading time", value: `~${readingTime} min` },
            ]}
          />

          <div className="mt-4">
            <SimpleTable
              head={["Measure", "Value", "Reading"]}
              caption="How the essay reads, not just how long it is"
              rows={[
                ["Flesch reading ease", scores.fleschReadingEase.toFixed(0), scores.verdict],
                ["Flesch–Kincaid grade", scores.fleschKincaidGrade.toFixed(1), "US school grade the prose matches"],
                ["Words per sentence", scores.avgWordsPerSentence.toFixed(1), "Academic prose usually sits between 15 and 25"],
                ["Longest sentence", `${longest} words`, longest > 35 ? "Split it — a 35-word sentence loses most readers" : "Within range"],
              ]}
            />
          </div>

          {paragraphRows.length > 1 && (
            <div className="mt-4">
              <SimpleTable head={["Paragraph", "Words", "Sentences", "Shape"]} rows={paragraphRows} caption="Paragraph balance" />
            </div>
          )}
        </ResultCard>
      </div>

      {Number.isFinite(difference) && Math.abs(difference) > 0 && (
        <Callout tone={Math.abs(difference) / Math.max(1, targetWords) > 0.1 ? "warning" : "info"}>
          {difference > 0
            ? `You are ${difference} words over the target. Cutting qualifying phrases and repeated examples usually removes 10% without losing an argument.`
            : `You are ${Math.abs(difference)} words short. Add evidence rather than padding: a quotation, a statistic or a worked example earns its words.`}
        </Callout>
      )}

      <p className="mt-4 text-xs leading-relaxed text-[var(--text-subtle)]">
        Word counts differ by definition: this counter treats a hyphenated compound as one word and numbers as words,
        which is close to Microsoft Word. Google Docs and most marking systems agree within a percent or two — always
        check the tool your institution uses before submitting at a hard limit.
      </p>
    </ToolPanel>
  );
}
