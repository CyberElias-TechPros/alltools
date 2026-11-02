"use client";

import { useMemo, useState } from "react";
import { CopyButton, SimpleTable, TextInput, Field, ToolPanel } from "@/components/ui";
import { ModeCard, ModeHub, ModeResult } from "@/components/tools/mode-hub";
import { fromRoman, toRoman } from "@/lib/education";

const CHART = [
  [1, "I"], [4, "IV"], [5, "V"], [9, "IX"], [10, "X"], [40, "XL"], [50, "L"], [90, "XC"], [100, "C"], [400, "CD"], [500, "D"], [900, "CM"], [1000, "M"],
] as const;

export default function RomanNumeralConverter() {
  const [numberInput, setNumberInput] = useState("1994");
  const [romanInput, setRomanInput] = useState("MCMXCIV");

  const toRomanResult = useMemo(() => {
    const value = Number(numberInput);
    if (!Number.isInteger(value)) return null;
    const roman = toRoman(value);
    return roman ? { roman, value } : null;
  }, [numberInput]);

  const fromRomanResult = useMemo(() => {
    const value = fromRoman(romanInput);
    return value === null ? null : { value, roman: romanInput.trim().toUpperCase() };
  }, [romanInput]);

  return (
    <ToolPanel>
      <ModeHub columns={2}>
        <ModeCard title="Number → Roman" hint="Whole numbers from 1 to 3999." badge="Both directions">
          <Field label="Number (1–3999)" htmlFor="roman-number">
            <TextInput
              id="roman-number"
              inputMode="numeric"
              value={numberInput}
              onChange={(event) => setNumberInput(event.target.value)}
              className="font-mono text-lg"
            />
          </Field>
          <ModeResult
            label="Roman numeral"
            value={toRomanResult ? toRomanResult.roman : "—"}
            detail={toRomanResult ? `${toRomanResult.value} reads as ${toRomanResult.roman}` : undefined}
            error={toRomanResult ? undefined : "Roman numerals run from 1 to 3999 — enter a whole number in that range."}
          />
          {toRomanResult ? (
            <div className="mt-2">
              <CopyButton text={toRomanResult.roman} label="Copy numeral" />
            </div>
          ) : null}
        </ModeCard>

        <ModeCard title="Roman → Number" hint="Standard subtractive form only.">
          <Field label="Roman numeral" htmlFor="roman-letters">
            <TextInput
              id="roman-letters"
              value={romanInput}
              onChange={(event) => setRomanInput(event.target.value)}
              className="font-mono text-lg uppercase"
              spellCheck={false}
            />
          </Field>
          <ModeResult
            label="Number"
            value={fromRomanResult ? String(fromRomanResult.value) : "—"}
            detail={fromRomanResult ? `${fromRomanResult.roman} is ${fromRomanResult.value}` : undefined}
            error={fromRomanResult ? undefined : "Use I, V, X, L, C, D and M in standard subtractive form, for example MCMXCIV."}
          />
          {fromRomanResult ? (
            <div className="mt-2">
              <CopyButton text={String(fromRomanResult.value)} label="Copy number" />
            </div>
          ) : null}
        </ModeCard>
      </ModeHub>

      <div className="mt-6">
        <SimpleTable
          head={["Value", "Numeral", "Rule"]}
          caption="The seven symbols and the six subtractive pairs"
          rows={CHART.map(([value, numeral]) => [
            String(value),
            <span key={numeral} className="font-mono">{numeral}</span>,
            value === 1 || (String(value).match(/^[145]0*$/) && value < 10)
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
        Standard Roman numerals are subtractive and written largest first. A numeral is only accepted
        here if it round-trips, so non-canonical forms such as IIII or VX are rejected rather than
        silently converted. Clock faces and some inscriptions use IIII legitimately — this tool
        follows the classical rules.
      </p>
    </ToolPanel>
  );
}
