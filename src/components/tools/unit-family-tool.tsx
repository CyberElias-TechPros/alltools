"use client";

import { useMemo, useState } from "react";
import { CopyButton, Field, ResultCard, Select, SimpleTable, TextInput, ToolPanel } from "@/components/ui";
import { convertUnit, getUnitFamily, type UnitFamily } from "@/lib/units";

/** Shared converter shell for the single-family conversion tools. */
export function UnitFamilyTool({
  family,
  defaultFrom,
  defaultTo,
  defaultValue,
  hint,
  presets = [],
  commonTable,
}: {
  family: UnitFamily;
  defaultFrom: string;
  defaultTo: string;
  defaultValue: string;
  hint?: string;
  presets?: { label: string; value: string }[];
  commonTable?: { caption: string; rows: string[][] };
}) {
  const definition = getUnitFamily(family);
  const [value, setValue] = useState(defaultValue);
  const [fromId, setFromId] = useState(defaultFrom);
  const [toId, setToId] = useState(defaultTo);

  const from = definition.units.find((unit) => unit.id === fromId) ?? definition.units[0];
  const to = definition.units.find((unit) => unit.id === toId) ?? definition.units[1];
  const numeric = Number(value.replace(/,/g, ""));
  const valid = Number.isFinite(numeric);

  const conversion = useMemo(
    () => (valid ? convertUnit(numeric, from, to) : null),
    [valid, numeric, from, to],
  );

  const allUnits = definition.units.map((unit) => ({
    unit,
    result: valid ? convertUnit(numeric, from, unit).result : Number.NaN,
  }));

  return (
    <ToolPanel>
      <div className="grid gap-3 sm:grid-cols-[1fr_9rem_9rem]">
        <Field label="Value" htmlFor={`${family}-value`} hint={hint} error={!valid && value.trim() ? "Enter a number." : undefined}>
          <TextInput
            id={`${family}-value`}
            value={value}
            onChange={(event) => setValue(event.target.value)}
            inputMode="decimal"
            className="font-mono text-lg"
            invalid={!valid && value.trim().length > 0}
          />
        </Field>
        <Field label="From" htmlFor={`${family}-from`}>
          <Select id={`${family}-from`} value={fromId} onChange={(event) => setFromId(event.target.value)}>
            {definition.units.map((unit) => (
              <option key={unit.id} value={unit.id}>
                {unit.label}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="To" htmlFor={`${family}-to`}>
          <Select id={`${family}-to`} value={toId} onChange={(event) => setToId(event.target.value)}>
            {definition.units.map((unit) => (
              <option key={unit.id} value={unit.id}>
                {unit.label}
              </option>
            ))}
          </Select>
        </Field>
      </div>

      {presets.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {presets.map((preset) => (
            <button
              key={preset.label}
              type="button"
              onClick={() => setValue(preset.value)}
              className="border border-[var(--border)] px-2.5 py-1.5 font-mono text-[0.62rem] text-[var(--text-subtle)] transition-colors hover:border-[var(--border-strong)] hover:text-[var(--text)]"
            >
              {preset.label}
            </button>
          ))}
        </div>
      )}

      <div className="mt-6">
        {conversion ? (
          <ResultCard
            label={`${from.label} → ${to.label}`}
            value={`${formatResult(conversion.result)} ${to.symbol}`}
            sub={`${formatResult(numeric)} ${from.symbol} = ${formatResult(conversion.result)} ${to.symbol}`}
            tone="brand"
            actions={<CopyButton text={`${formatResult(conversion.result)} ${to.symbol}`} label="Copy result" />}
          >
            <SimpleTable
              head={["Unit", "Value", "Symbol"]}
              caption="The same quantity in every supported unit"
              rows={allUnits.map(({ unit, result }) => [unit.label, formatResult(result), unit.symbol])}
            />
            <p className="mt-3 font-mono text-[0.68rem] leading-relaxed text-[var(--text-subtle)]">{conversion.expression}</p>
          </ResultCard>
        ) : (
          <p className="text-sm text-[var(--text-subtle)]">Enter a value to convert it.</p>
        )}
      </div>

      {definition.note && <p className="mt-4 text-xs leading-relaxed text-[var(--text-subtle)]">{definition.note}</p>}

      {commonTable && (
        <div className="mt-6">
          <SimpleTable head={commonTable.rows[0]} rows={commonTable.rows.slice(1)} caption={commonTable.caption} />
        </div>
      )}
    </ToolPanel>
  );
}

/** Enough precision to be useful, few enough digits to read. */
export function formatResult(value: number): string {
  if (!Number.isFinite(value)) return "—";
  const absolute = Math.abs(value);
  if (absolute !== 0 && (absolute < 0.0001 || absolute >= 1e9)) return value.toExponential(6).replace("e", " × 10^");
  return String(Number(value.toPrecision(10)));
}
