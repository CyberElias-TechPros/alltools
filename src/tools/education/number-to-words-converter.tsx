"use client";

import { useMemo, useState } from "react";
import { Callout, CopyButton, Field, ResultCard, StatGrid, Switch, TextInput, ToolPanel } from "@/components/ui";
import { numberToWords, parseNumberInput } from "@/lib/education";

const PRESETS = ["0", "21", "101", "1234567", "1000000000", "-4.5"];

export default function NumberToWordsConverter() {
  const [input, setInput] = useState("1234567");
  const [useAnd, setUseAnd] = useState(true);
  const [decimals, setDecimals] = useState(true);

  const value = useMemo(() => parseNumberInput(input), [input]);
  const words = value === null ? "" : numberToWords(value, { and: useAnd, decimals });
  const currency = value === null ? "" : numberToWords(Math.floor(Math.abs(value)), { and: useAnd });

  return (
    <ToolPanel>
      <Field
        label="Number"
        htmlFor="n2w-input"
        hint="Integers, negatives and decimals up to six places."
        error={value === null ? "That is not a number this converter can read." : undefined}
      >
        <TextInput id="n2w-input" value={input} onChange={(event) => setInput(event.target.value)} className="font-mono text-base" invalid={value === null} />
      </Field>

      <div className="mt-3 flex flex-wrap gap-1.5">
        {PRESETS.map((preset) => (
          <button
            key={preset}
            type="button"
            onClick={() => setInput(preset)}
            className="border border-[var(--border)] px-2.5 py-1.5 font-mono text-[0.62rem] text-[var(--text-subtle)] transition-colors hover:border-[var(--border-strong)] hover:text-[var(--text)]"
          >
            {preset}
          </button>
        ))}
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <Switch checked={useAnd} onChange={setUseAnd} label="British “and”" description="One hundred and one rather than one hundred one." />
        <Switch checked={decimals} onChange={setDecimals} label="Read decimals" description="1.5 becomes one point five." />
      </div>

      <div className="mt-6">
        {words ? (
          <ResultCard label="In words" value={<span className="text-2xl leading-snug">{words}</span>} tone="brand" actions={<CopyButton text={words} label="Copy" />}>
            <StatGrid
              columns={3}
              items={[
                { label: "Digits", value: String(input.replace(/[^0-9]/g, "").length) },
                { label: "Whole part", value: value === null ? "—" : String(Math.trunc(value)) },
                { label: "Currency reading", value: `${currency}${Math.abs(value ?? 0) % 1 !== 0 && decimals ? "" : ""}` },
              ]}
            />
            <p className="mt-3 text-xs leading-relaxed text-[var(--text-subtle)]">
              For a cheque or invoice, write the whole amount in words and the cents in figures: “{currency}
              {Math.abs((value ?? 0) % 1) > 0 ? ` and ${Math.round((Math.abs(value ?? 0) % 1) * 100)}/100` : ""}”.
            </p>
          </ResultCard>
        ) : (
          <Callout tone="info">Enter a number to read it in words.</Callout>
        )}
      </div>

      <p className="mt-4 text-xs leading-relaxed text-[var(--text-subtle)]">
        Numbers are read on the short scale, where a billion is 10⁹. Hyphenation follows the British convention
        (twenty-one). Beyond 10¹⁸ the converter refuses rather than printing a guess, because JavaScript numbers lose
        integer precision past 2⁵³.
      </p>
    </ToolPanel>
  );
}
