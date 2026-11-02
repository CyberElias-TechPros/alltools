"use client";

import { useMemo, useState } from "react";
import { CopyButton, Field, ResultCard, Segmented, SimpleTable, TextInput, ToolPanel } from "@/components/ui";
import { formatCurrency, parseNumber, round } from "@/lib/utils";

const RATES = [20, 15, 12.5, 10, 7.5, 5, 0];

export default function VatCalculator() {
  const [amount, setAmount] = useState("120");
  const [rate, setRate] = useState("20");
  const [mode, setMode] = useState<"gross-to-net" | "net-to-gross">("gross-to-net");

  const data = useMemo(() => {
    const value = parseNumber(amount);
    const rateValue = parseNumber(rate);
    if (!Number.isFinite(value) || !Number.isFinite(rateValue) || rateValue < 0) return null;
    const r = rateValue / 100;
    const net = mode === "gross-to-net" ? value / (1 + r) : value;
    const gross = mode === "gross-to-net" ? value : value * (1 + r);
    return {
      net: round(net, 2),
      vat: round(gross - net, 2),
      gross: round(gross, 2),
      rate: rateValue,
      formula:
        mode === "gross-to-net"
          ? `${formatCurrency(value)} ÷ (1 + ${rateValue}%) = ${formatCurrency(round(net, 2))}`
          : `${formatCurrency(value)} × (1 + ${rateValue}%) = ${formatCurrency(round(gross, 2))}`,
    };
  }, [amount, rate, mode]);

  return (
    <ToolPanel>
      <Segmented
        label="Direction"
        value={mode}
        onChange={setMode}
        options={[
          { value: "gross-to-net", label: "Remove VAT (gross → net)" },
          { value: "net-to-gross", label: "Add VAT (net → gross)" },
        ]}
      />

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <Field
          label={mode === "gross-to-net" ? "Amount including VAT" : "Amount excluding VAT"}
          htmlFor="vat-amount"
        >
          <TextInput
            id="vat-amount"
            inputMode="decimal"
            value={amount}
            onChange={(event) => setAmount(event.target.value)}
          />
        </Field>
        <Field label="VAT rate (%)" htmlFor="vat-rate" hint="Set your local rate — the presets are a shortcut.">
          <div className="flex gap-2">
            <TextInput
              id="vat-rate"
              inputMode="decimal"
              value={rate}
              onChange={(event) => setRate(event.target.value)}
            />
            <select
              aria-label="Common VAT rates"
              className="input w-24 shrink-0"
              value=""
              onChange={(event) => {
                if (event.target.value) setRate(event.target.value);
              }}
            >
              <option value="">Presets</option>
              {RATES.map((preset) => (
                <option key={preset} value={preset}>
                  {preset}%
                </option>
              ))}
            </select>
          </div>
        </Field>
      </div>

      <div className="mt-4">
        {data ? (
          <ResultCard
            label={mode === "gross-to-net" ? "Net amount" : "Gross amount"}
            value={formatCurrency(mode === "gross-to-net" ? data.net : data.gross)}
            sub={data.formula}
            actions={
              <CopyButton
                text={`Net ${formatCurrency(data.net)} · VAT ${formatCurrency(data.vat)} · Gross ${formatCurrency(data.gross)}`}
              />
            }
          >
            <SimpleTable
              caption="VAT breakdown"
              head={["", "Amount"]}
              rows={[
                ["Net (excl. VAT)", formatCurrency(data.net)],
                [`VAT at ${data.rate}%`, formatCurrency(data.vat)],
                ["Gross (incl. VAT)", formatCurrency(data.gross)],
              ]}
            />
          </ResultCard>
        ) : (
          <ResultCard label="VAT breakdown" value="—" tone="neutral" sub="Enter an amount and a rate." />
        )}
      </div>
    </ToolPanel>
  );
}
