"use client";

import { useMemo, useState } from "react";
import { Callout, CopyButton, Field, ResultCard, SimpleTable, StatGrid, TextInput, ToolPanel } from "@/components/ui";
import { parseNumberInput, scientificForms } from "@/lib/education";

const EXAMPLES = ["0.00042", "6.02 × 10^23", "1.5e-7", "1234567", "-9.81"];

export default function ScientificNotationConverter() {
  const [input, setInput] = useState("0.00042");
  const value = useMemo(() => parseNumberInput(input), [input]);
  const forms = value === null ? null : scientificForms(value);

  return (
    <ToolPanel>
      <Field
        label="Number"
        htmlFor="sci-input"
        hint="Accepts plain decimals, e-notation and “6.02 × 10^23”."
        error={value === null ? "That is not a number this converter can read." : undefined}
      >
        <TextInput
          id="sci-input"
          value={input}
          onChange={(event) => setInput(event.target.value)}
          className="font-mono text-base"
          spellCheck={false}
          invalid={value === null}
        />
      </Field>

      <div className="mt-3 flex flex-wrap gap-1.5">
        {EXAMPLES.map((example) => (
          <button
            key={example}
            type="button"
            onClick={() => setInput(example)}
            className="border border-[var(--border)] px-2.5 py-1.5 font-mono text-[0.62rem] text-[var(--text-subtle)] transition-colors hover:border-[var(--border-strong)] hover:text-[var(--text)]"
          >
            {example}
          </button>
        ))}
      </div>

      <div className="mt-6">
        {forms ? (
          <ResultCard
            label="Scientific notation"
            value={forms.scientific}
            sub={`${forms.significantFigures} significant figures · exponent ${forms.exponent}`}
            tone="brand"
            actions={<CopyButton text={forms.scientific} label="Copy" />}
          >
            <StatGrid
              columns={3}
              items={[
                { label: "Engineering", value: forms.engineering },
                { label: "E-notation", value: forms.eNotation },
                { label: "Plain decimal", value: forms.decimal.length > 24 ? `${forms.decimal.slice(0, 24)}…` : forms.decimal },
              ]}
            />
            <div className="mt-4">
              <SimpleTable
                head={["Form", "Written as", "Use it for"]}
                caption="Same value, three conventions"
                rows={[
                  ["Scientific", forms.scientific, "Physics and chemistry answers"],
                  ["Engineering", forms.engineering, "Electronics, SI prefixes (every 3 powers of ten)"],
                  ["E-notation", forms.eNotation, "Code, spreadsheets, calculators"],
                ]}
              />
            </div>
          </ResultCard>
        ) : (
          <Callout tone="info">Enter a number to see it in scientific, engineering and e-notation.</Callout>
        )}
      </div>

      <p className="mt-4 text-xs leading-relaxed text-[var(--text-subtle)]">
        Scientific notation keeps one non-zero digit before the decimal point; engineering notation keeps the exponent a
        multiple of three so it lines up with prefixes such as kilo (10³) and micro (10⁻⁶). Values are held as 64-bit
        floats, so integers beyond 2⁵³ lose precision — that is a limit of the number type, not the formatter.
      </p>
    </ToolPanel>
  );
}
