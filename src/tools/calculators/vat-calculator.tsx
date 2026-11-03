"use client";

import { useMemo, useState } from "react";
import { Field, TextInput, ToolPanel } from "@/components/ui";
import { ModeCard, ModeHub, ModeResult } from "@/components/tools/mode-hub";
import { formatCurrency, parseNumber, round } from "@/lib/utils";

const RATES = [20, 15, 12.5, 10, 7.5, 5, 0];

/**
 * Two calculators on one page: adding VAT to a net price, and stripping VAT out
 * of a gross price. Both share one rate control, because the rate belongs to the
 * jurisdiction rather than to the individual sum.
 */
export default function VatCalculator() {
  const [rate, setRate] = useState("20");
  const [netInput, setNetInput] = useState("120");
  const [grossInput, setGrossInput] = useState("144");

  const rateValue = parseNumber(rate);
  const validRate = Number.isFinite(rateValue) && rateValue >= 0;

  const addVat = useMemo(() => {
    const amount = parseNumber(netInput);
    if (!validRate || !Number.isFinite(amount)) return null;
    const r = rateValue / 100;
    const vat = amount * r;
    return {
      gross: round(amount + vat, 2),
      vat: round(vat, 2),
      net: round(amount, 2),
      detail: `${formatCurrency(amount)} × (1 + ${rateValue}%) = ${formatCurrency(round(amount + vat, 2))}`,
    };
  }, [netInput, rateValue, validRate]);

  const removeVat = useMemo(() => {
    const gross = parseNumber(grossInput);
    if (!validRate || !Number.isFinite(gross)) return null;
    const r = rateValue / 100;
    const net = gross / (1 + r);
    return {
      net: round(net, 2),
      vat: round(gross - net, 2),
      gross: round(gross, 2),
      detail: `${formatCurrency(gross)} ÷ (1 + ${rateValue}%) = ${formatCurrency(round(net, 2))}`,
    };
  }, [grossInput, rateValue, validRate]);

  return (
    <ToolPanel>
      <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface-muted)]/45 p-4 sm:p-5">
        <div className="grid gap-3 sm:grid-cols-[12rem_1fr] sm:items-end">
          <Field label="VAT rate (%)" htmlFor="vat-rate" hint="Set your local rate — presets are a shortcut.">
            <TextInput
              id="vat-rate"
              inputMode="decimal"
              value={rate}
              onChange={(event) => setRate(event.target.value)}
            />
          </Field>
          <div className="flex flex-wrap gap-1.5 pb-0.5">
            {RATES.map((preset) => (
              <button
                key={preset}
                type="button"
                onClick={() => setRate(String(preset))}
                aria-pressed={rateValue === preset}
                className={`rounded-full border px-2.5 py-1 font-mono text-[0.62rem] tracking-[0.02em] transition-colors ${
                  rateValue === preset
                    ? "border-[var(--text)] bg-[var(--text)] text-[var(--page)]"
                    : "border-[var(--border)] bg-[var(--surface)] text-[var(--text-muted)] hover:border-[var(--border-strong)] hover:text-[var(--text)]"
                }`}
              >
                {preset}%
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-4">
        <ModeHub columns={2}>
          <ModeCard title="Add VAT" hint="Net price → gross price." badge="Net → gross">
            <Field label="Amount excluding VAT" htmlFor="vat-net">
              <TextInput
                id="vat-net"
                inputMode="decimal"
                value={netInput}
                onChange={(event) => setNetInput(event.target.value)}
                placeholder="120"
              />
            </Field>
            <ModeResult
              label="Gross price"
              value={addVat ? formatCurrency(addVat.gross) : "—"}
              detail={addVat ? `Net ${formatCurrency(addVat.net)} + VAT ${formatCurrency(addVat.vat)} · ${addVat.detail}` : undefined}
              error={addVat ? undefined : "Enter an amount and a non-negative rate."}
            />
          </ModeCard>

          <ModeCard title="Remove VAT" hint="Gross price → net price." badge="Gross → net">
            <Field label="Amount including VAT" htmlFor="vat-gross">
              <TextInput
                id="vat-gross"
                inputMode="decimal"
                value={grossInput}
                onChange={(event) => setGrossInput(event.target.value)}
                placeholder="144"
              />
            </Field>
            <ModeResult
              label="Net price"
              value={removeVat ? formatCurrency(removeVat.net) : "—"}
              detail={removeVat ? `VAT ${formatCurrency(removeVat.vat)} · Gross ${formatCurrency(removeVat.gross)} · ${removeVat.detail}` : undefined}
              error={removeVat ? undefined : "Enter an amount and a non-negative rate."}
            />
          </ModeCard>
        </ModeHub>
      </div>

      <p className="mt-4 text-xs leading-relaxed text-[var(--text-subtle)]">
        Removing VAT is a division, not a subtraction: 20% off a gross figure is not the same as
        dividing by 1.2. Rates and rounding rules vary by country — check the rate that applies to
        you, and keep the invoice breakdown (net, VAT, gross) on record.
      </p>
    </ToolPanel>
  );
}
