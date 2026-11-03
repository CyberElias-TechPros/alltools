"use client";

import { useMemo, useState } from "react";
import { Callout, CopyButton, Field, ResultCard, StatGrid, TextArea, ToolPanel } from "@/components/ui";
import { wordsToNumber } from "@/lib/education";

const EXAMPLES = [
  "twenty-one",
  "one hundred and one",
  "four million two hundred thousand",
  "minus four point five",
];

export default function WordsToNumberConverter() {
  const [input, setInput] = useState("four million two hundred thousand");
  const result = useMemo(() => wordsToNumber(input), [input]);

  return (
    <ToolPanel>
      <Field
        label="Number in words"
        htmlFor="w2n-input"
        hint="Hyphens, commas and “and” are ignored. Use “point” for decimals and “minus” for negatives."
        error={result === null && input.trim() ? "A word in that phrase is not a number word." : undefined}
      >
        <TextArea
          id="w2n-input"
          value={input}
          onChange={(event) => setInput(event.target.value)}
          rows={3}
          className="font-mono"
          invalid={result === null && input.trim().length > 0}
        />
      </Field>

      <div className="mt-3 flex flex-wrap gap-1.5">
        {EXAMPLES.map((example) => (
          <button
            key={example}
            type="button"
            onClick={() => setInput(example)}
            className="border border-[var(--border)] px-2.5 py-1.5 text-[0.62rem] text-[var(--text-subtle)] transition-colors hover:border-[var(--border-strong)] hover:text-[var(--text)]"
          >
            {example}
          </button>
        ))}
      </div>

      <div className="mt-6">
        {result !== null ? (
          <ResultCard label="As a number" value={String(result)} sub={`${result.toLocaleString("en-GB")} with thousands separators`} tone="brand" actions={<CopyButton text={String(result)} label="Copy" />}>
            <StatGrid
              columns={3}
              items={[
                { label: "Words read", value: String(input.trim().split(/\s+/).filter(Boolean).length) },
                { label: "Sign", value: result < 0 ? "Negative" : "Positive" },
                { label: "Has decimals", value: Number.isInteger(result) ? "No" : "Yes" },
              ]}
            />
          </ResultCard>
        ) : (
          <Callout tone="info">Type a number phrase such as “three thousand and six”.</Callout>
        )}
      </div>

      <p className="mt-4 text-xs leading-relaxed text-[var(--text-subtle)]">
        English number words are read greedily left to right: “hundred” multiplies the current group and scale words
        (thousand, million …) move it up. That makes “one hundred thousand” work, and it also means a malformed phrase
        such as “one hundred hundred” is reported as unreadable rather than guessed at.
      </p>
    </ToolPanel>
  );
}
