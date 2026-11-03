"use client";

import { useMemo, useState } from "react";
import { ArrowUpDown } from "lucide-react";
import {
  Button,
  CopyButton,
  Field,
  Select,
  SimpleTable,
  TextInput,
  ToolPanel,
} from "@/components/ui";
import { convertUnit, unitFamilies, type UnitFamily } from "@/lib/units";
import { formatNumber, parseNumber } from "@/lib/utils";

export default function UnitConverter() {
  const [familyId, setFamilyId] = useState<UnitFamily>("length");
  const family = unitFamilies.find((item) => item.id === familyId)!;
  const [from, setFrom] = useState(family.units[2]?.id ?? family.units[0].id);
  const [to, setTo] = useState(family.units[4]?.id ?? family.units[1].id);
  const [value, setValue] = useState("1");

  const fromUnit = family.units.find((unit) => unit.id === from) ?? family.units[0];
  const toUnit = family.units.find((unit) => unit.id === to) ?? family.units[1];

  const numeric = parseNumber(value);
  const converted = useMemo(
    () => (Number.isFinite(numeric) ? convertUnit(numeric, fromUnit, toUnit) : null),
    [numeric, fromUnit, toUnit],
  );

  function changeFamily(next: UnitFamily) {
    const nextFamily = unitFamilies.find((item) => item.id === next)!;
    setFamilyId(next);
    setFrom(nextFamily.units[2]?.id ?? nextFamily.units[0].id);
    setTo(nextFamily.units[3]?.id ?? nextFamily.units[1].id);
    setValue("1");
  }

  function swap() {
    setFrom(toUnit.id);
    setTo(fromUnit.id);
  }

  const quickValues = [0.5, 1, 2, 5, 10, 25, 50, 100];

  return (
    <ToolPanel>
      <div className="grid gap-2 sm:grid-cols-4 lg:grid-cols-7">
        {unitFamilies.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => changeFamily(item.id)}
            aria-pressed={item.id === familyId}
            className={`rounded-lg border px-2 py-2 text-xs font-semibold transition-colors ${
              item.id === familyId
                ? "border-brand-500 bg-brand-50 text-brand-800 dark:border-brand-400 dark:bg-brand-500/15 dark:text-brand-200"
                : "border-[var(--border)] bg-[var(--surface)] text-[var(--text-muted)] hover:border-[var(--border-strong)]"
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-[1fr_auto_1fr_1fr] sm:items-end">
        <Field label="Amount" htmlFor="uc-value">
          <TextInput
            id="uc-value"
            inputMode="decimal"
            value={value}
            onChange={(event) => setValue(event.target.value)}
          />
        </Field>
        <div className="hidden pb-1 sm:block">
          <Button size="sm" variant="secondary" onClick={swap} aria-label="Swap units">
            <ArrowUpDown className="size-4" aria-hidden />
          </Button>
        </div>
        <Field label="From" htmlFor="uc-from">
          <Select id="uc-from" value={from} onChange={(event) => setFrom(event.target.value)}>
            {family.units.map((unit) => (
              <option key={unit.id} value={unit.id}>
                {unit.label} ({unit.symbol})
              </option>
            ))}
          </Select>
        </Field>
        <Field label="To" htmlFor="uc-to">
          <Select id="uc-to" value={to} onChange={(event) => setTo(event.target.value)}>
            {family.units.map((unit) => (
              <option key={unit.id} value={unit.id}>
                {unit.label} ({unit.symbol})
              </option>
            ))}
          </Select>
        </Field>
      </div>

      <div aria-live="polite" className="mt-4 rounded-xl border border-brand-200 bg-brand-50/60 p-4 dark:border-brand-800/60 dark:bg-brand-900/15">
        {converted ? (
          <>
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="font-mono text-2xl font-bold text-[var(--text)]">
                {formatNumber(converted.result, 8)}{" "}
                <span className="text-base font-semibold text-[var(--text-muted)]">{toUnit.symbol}</span>
              </p>
              <CopyButton text={`${formatNumber(converted.result, 8)} ${toUnit.symbol}`} />
            </div>
            <p className="mt-1.5 text-sm text-[var(--text-muted)]">
              {formatNumber(numeric, 8)} {fromUnit.symbol} = {formatNumber(converted.result, 8)} {toUnit.symbol}
            </p>
            <p className="mt-2 break-all font-mono text-[0.72rem] text-[var(--text-subtle)]">
              {converted.expression}
            </p>
          </>
        ) : (
          <p className="text-sm text-[var(--text-muted)]">Enter a number to convert.</p>
        )}
      </div>

      {family.note ? (
        <p className="mt-2 text-xs text-[var(--text-subtle)]">{family.note}</p>
      ) : null}

      <div className="mt-5">
        <h3 className="mb-2 text-[0.72rem] font-bold uppercase tracking-[0.09em] text-[var(--text-subtle)]">
          Common conversions
        </h3>
        <SimpleTable
          caption={`Common ${family.label.toLowerCase()} conversions`}
          head={[`${fromUnit.symbol}`, `${toUnit.symbol}`]}
          rows={quickValues.map((quick) => [
            formatNumber(quick, 4),
            formatNumber(convertUnit(quick, fromUnit, toUnit).result, 6),
          ])}
        />
      </div>
    </ToolPanel>
  );
}
