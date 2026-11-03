"use client";

import { useMemo, useState } from "react";
import { CopyButton, EmptyState, ResultCard, SimpleTable, StatGrid, TextArea, ToolPanel } from "@/components/ui";
import { readability } from "@/lib/seo-tools";

const SAMPLE = `A good tool page answers the question first and explains afterwards. The opening sentence should tell you what the tool does and who it is for.

Long paragraphs are hard to scan. Two or three sentences per paragraph keeps the page readable on a phone, where most people will read it.`;

export default function ReadabilityChecker() {
  const [text, setText] = useState("");
  const scores = useMemo(() => readability(text), [text]);
  const hasText = text.trim().length > 0;

  return (
    <ToolPanel>
      <div className="mb-2 flex items-center justify-between">
        <label htmlFor="readability-input" className="label !mb-0">
          Text to score
        </label>
        <button
          type="button"
          className="btn btn-ghost !min-h-8 !px-2.5 !py-1.5 !text-[0.6rem] !tracking-[0.1em]"
          onClick={() => setText(SAMPLE)}
        >
          Sample
        </button>
      </div>
      <TextArea
        id="readability-input"
        value={text}
        onChange={(event) => setText(event.target.value)}
        rows={12}
        placeholder="Paste a page, an article or a paragraph…"
        className="min-h-[14rem]"
      />

      <div className="mt-5">
        {!hasText ? (
          <EmptyState title="Waiting for text">Paste prose to get readability scores and a plain-English verdict.</EmptyState>
        ) : (
          <ResultCard
            label="Flesch Reading Ease"
            value={String(scores.fleschReadingEase)}
            tone="brand"
            sub={scores.verdict}
          >
            <StatGrid
              columns={4}
              items={[
                { label: "Words", value: scores.words.toLocaleString() },
                { label: "Sentences", value: scores.sentences.toLocaleString() },
                { label: "Words / sentence", value: String(scores.avgWordsPerSentence) },
                { label: "Syllables / word", value: String(scores.avgSyllablesPerWord) },
              ]}
            />

            <div className="mt-4">
              <SimpleTable
                head={["Formula", "Score", "Reads as"]}
                caption="Readability formulas"
                rows={[
                  ["Flesch Reading Ease", String(scores.fleschReadingEase), "0 hardest – 100 easiest; 60+ is plain English"],
                  ["Flesch–Kincaid Grade", String(scores.fleschKincaidGrade), `US school grade ${Math.round(scores.fleschKincaidGrade)}`],
                  ["Gunning Fog", String(scores.gunningFog), `Grade ${Math.round(scores.gunningFog)} for a general audience`],
                  ["SMOG", String(scores.smog), "Grade level from polysyllable density"],
                  ["Automated Readability", String(scores.automatedReadability), "Grade level from letters and sentence length"],
                ]}
              />
            </div>

            <div className="mt-3">
              <CopyButton
                text={`Flesch ${scores.fleschReadingEase} · Flesch–Kincaid ${scores.fleschKincaidGrade} · Fog ${scores.gunningFog} · SMOG ${scores.smog}`}
                label="Copy scores"
              />
            </div>
          </ResultCard>
        )}
      </div>

      <p className="mt-5 text-xs leading-relaxed text-[var(--text-subtle)]">
        All five formulas are computed from the same two ratios — words per sentence and syllables per word — so they
        usually agree. None of them understand meaning: a precise technical sentence can score “difficult” and still be
        the clearest way to say it.
      </p>
    </ToolPanel>
  );
}
