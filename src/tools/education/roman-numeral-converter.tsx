"use client";

import { useMemo, useState } from "react";
import { CopyButton, Field, Segmented, SimpleTable, TextInput, ToolPanel } from "@/components/ui";
import { fromRoman, toRoman } from "@/lib/education";

type Direction = "to-roman" | "from-roman";

const CHART = [
  [1, "I"], [4, "IV"], [5, "V"], [9, "IX"], [10, "X"], [40, "XL"], [50, "L"], [90, "XC"], [100, "C"], [400, "CD"], [500, "D"], [900, "CM"], [1000, "M"],
] as const;

export default function RomanNumeralConverter() {
  const [direction, setDirection] = useState<Direction>("to-roman");
  const [input, setInput] = useState("1994");

  const result = useMemo(() => {
    if (direction === "to-roman") {
      const value = Number(input);
      const roman = Number.isInteger(value) ? toRoman(value) : null;
      return roman
        ? { output: roman, note: `${value} in Roman numerals`, error: "" }
        : { output: "", note: "", error: "Roman numerals run from 1 to 3999 — enter a whole number in that range." };
    }
    const value = fromRoman(input);
    return value !== null
      ? { output: String(value), note: `${input.trim().toUpperCase()} is ${value}`, error: "" }
      : { output: "", note: "", error: "Use I, V, X, L, C, D and M in standard subtractive form, for example MCMXCIV." };
  }, [direction, input]);

  return (
    <ToolPanel>
      <Segmented
        label="Direction"
        value={direction}
        onChange={setDirection}
        options={[
          { value: "to-roman", label: "Number → Roman" },
          { value: "from-roman", label: "Roman → Number" },
        ]}
      />

      <div className="mt-4 grid gap-4 sm:grid-cols-[1fr_auto] sm:items-end">
        <Field label={direction === "to-roman" ? "Number (1–3999)" : "Roman numeral"} htmlFor="roman-input" error={result.error || undefined}>
          <TextInput
            id="roman-input"
            value={input}
            onChange={(event) => setInput(event.target.value)}
            className="input font-mono text-lg uppercase"
            spellCheck={false}
            inputMode={direction === "to-roman" ? "numeric" : "text"}
          />
        </Field>
        {result.output ? <CopyButton text={result.output} label="Copy result" size="md" /> : null}
      </div>

      {result.output ? (
        <p className="mt-4 border border-[var(--border)] bg-[var(--surface-muted)] p-4 text-2xl tracking-wide">
          <span className="font-mono text-[var(--accent-text)]">{result.output}</span>
        </p>
      ) : null}

      <div className="mt-6">
        <SimpleTable
          head={["Value", "Numeral", "Rule"]}
          caption="The seven symbols and the six subtractive pairs"
          rows={CHART.map(([value, numeral]) => [
            String(value),
            <span key={numeral} className="font-mono">{numeral}</span>,
            value === 1 || String(value).match(/^[145]0*$/) && value < 10
              ? "Base symbol"
              : value < 10
                ? "Subtractive pair"
                : String(value).startsWith("9") || String(value).startsWith("4")
                  ? "Subtractive pair"
                  : "Base symbol",
          ])}
        />
      </div>

      <p className="mt-4 text-xs leading-relaxed text-[var(--text-subtle)]">
        Standard Roman numerals are subtractive and written largest first. A numeral is only accepted here if it
        round-trips, so non-canonical forms such as IIII or VX are rejected rather than silently converted. Clock faces
        and some inscriptions use IIII legitimately — this tool follows the classical rules.
      </p>
    </ToolPanel>
  );
}
