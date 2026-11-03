"use client";

import { useMemo, useState } from "react";
import { Callout, CopyButton, DownloadButton, Field, ResultCard, StatGrid, TextArea, ToolPanel } from "@/components/ui";
import { flashcardsToCsv, flashcardsToTsv, parseFlashcards } from "@/lib/education";

const SAMPLE = `Photosynthesis | Plants converting light into chemical energy
Mitochondria - The organelle that produces ATP
Q: Osmosis
A: Movement of water across a semi-permeable membrane
Cell wall\tRigid outer layer in plant cells`;

export default function FlashcardGenerator() {
  const [input, setInput] = useState(SAMPLE);
  const { cards, skipped } = useMemo(() => parseFlashcards(input), [input]);
  const [flipped, setFlipped] = useState<number | null>(null);

  return (
    <ToolPanel>
      <Field
        label="Your notes"
        htmlFor="flash-input"
        hint="One card per line. Separate the front and back with a tab, a pipe, a colon, “ - ” or a Q:/A: pair."
      >
        <TextArea
          id="flash-input"
          value={input}
          onChange={(event) => {
            setInput(event.target.value);
            setFlipped(null);
          }}
          rows={10}
          className="font-mono text-[0.8rem]"
          spellCheck={false}
        />
      </Field>

      <div className="mt-6">
        {cards.length ? (
          <ResultCard
            label="Cards"
            value={`${cards.length} ready`}
            sub={`${skipped.length} line${skipped.length === 1 ? "" : "s"} could not be split`}
            tone="brand"
            actions={
              <>
                <CopyButton text={flashcardsToTsv(cards)} label="Copy TSV" />
                <DownloadButton filename="flashcards.tsv" content={flashcardsToTsv(cards)} label="Anki TSV" />
                <DownloadButton filename="flashcards.csv" content={flashcardsToCsv(cards)} mime="text/csv" label="CSV" />
              </>
            }
          >
            <StatGrid
              columns={3}
              items={[
                { label: "Cards", value: String(cards.length) },
                { label: "Longest front", value: `${Math.max(...cards.map((card) => card.front.length))} chars` },
                { label: "Longest back", value: `${Math.max(...cards.map((card) => card.back.length))} chars` },
              ]}
            />

            <ul className="mt-4 space-y-2">
              {cards.map((card, index) => (
                <li key={`${card.front}-${index}`}>
                  <button
                    type="button"
                    onClick={() => setFlipped(flipped === index ? null : index)}
                    className="w-full border border-[var(--border)] bg-[var(--surface)] p-3 text-left transition-colors hover:border-[var(--border-strong)]"
                    aria-expanded={flipped === index}
                  >
                    <span className="flex items-baseline justify-between gap-3">
                      <span className="text-sm text-[var(--text)]">{card.front}</span>
                      <span className="font-mono text-[0.58rem] uppercase tracking-[0.12em] text-[var(--text-subtle)]">
                        {flipped === index ? "answer" : "flip"}
                      </span>
                    </span>
                    {flipped === index ? (
                      <span className="mt-2 block border-t border-[var(--border)] pt-2 text-sm text-[var(--text-muted)]">{card.back}</span>
                    ) : null}
                  </button>
                </li>
              ))}
            </ul>
          </ResultCard>
        ) : (
          <Callout tone="info">Paste notes with two parts per line to generate cards.</Callout>
        )}
      </div>

      {skipped.length > 0 && (
        <Callout tone="warning" title="Lines without a separator">
          <ul className="space-y-1">
            {skipped.slice(0, 6).map((line) => (
              <li key={line} className="font-mono text-xs">
                {line.length > 80 ? `${line.slice(0, 80)}…` : line}
              </li>
            ))}
          </ul>
        </Callout>
      )}

      <p className="mt-4 text-xs leading-relaxed text-[var(--text-subtle)]">
        One idea per card beats a card with a paragraph on the back. The TSV export matches Anki&apos;s import format —
        open the file, confirm the front/back field mapping, and it imports without editing. Nothing is uploaded; the
        cards are built in this page.
      </p>
    </ToolPanel>
  );
}
