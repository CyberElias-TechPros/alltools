"use client";

import { useMemo, useState } from "react";
import { Button, Callout, CopyButton, Field, ResultCard, Select, SimpleTable, StatGrid, TextArea, TextInput, ToolPanel } from "@/components/ui";
import { CURRENCIES, SEED_RATES, convertCurrency, convertToAll, formatAmount, impliedRate, parseRates, type Rates } from "@/lib/currency";

const DEFAULT_FROM = "USD";
const DEFAULT_TO = "EUR";

export default function CurrencyConverter() {
  const [amount, setAmount] = useState("100");
  const [from, setFrom] = useState(DEFAULT_FROM);
  const [to, setTo] = useState(DEFAULT_TO);
  const [rates, setRates] = useState<Rates>({ ...SEED_RATES });
  const [paste, setPaste] = useState("");
  const [rateDate, setRateDate] = useState("");

  const value = Number(amount);
  const converted = convertCurrency(value, from, to, rates);
  const rate = impliedRate(from, to, rates);
  const rows = useMemo(() => convertToAll(value, from, rates), [value, from, rates]);
  const text = `${formatAmount(value, from)} = ${formatAmount(converted, to)} (1 ${from} = ${Number.isFinite(rate) ? rate.toFixed(4) : "—"} ${to})`;

  const setRate = (code: string, next: string) => {
    const parsed = Number(next);
    setRates((current) => ({ ...current, [code]: Number.isFinite(parsed) ? parsed : 0 }));
  };

  return (
    <ToolPanel>
      <div className="grid gap-3 sm:grid-cols-3">
        <Field label="Amount" htmlFor="cc-amount">
          <TextInput id="cc-amount" type="number" min={0} step="0.01" value={amount} onChange={(event) => setAmount(event.target.value)} className="font-mono" />
        </Field>
        <Field label="From" htmlFor="cc-from">
          <Select id="cc-from" value={from} onChange={(event) => setFrom(event.target.value)}>
            {CURRENCIES.map((currency) => (
              <option key={currency.code} value={currency.code}>
                {currency.code} — {currency.name}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="To" htmlFor="cc-to">
          <Select id="cc-to" value={to} onChange={(event) => setTo(event.target.value)}>
            {CURRENCIES.map((currency) => (
              <option key={currency.code} value={currency.code}>
                {currency.code} — {currency.name}
              </option>
            ))}
          </Select>
        </Field>
      </div>

      <div className="mt-3">
        <Button
          variant="secondary"
          size="sm"
          onClick={() => {
            const next = from;
            setFrom(to);
            setTo(next);
          }}
        >
          Swap currencies
        </Button>
      </div>

      <div className="mt-6">
        <ResultCard
          label={`${formatAmount(value, from)} in ${to}`}
          value={formatAmount(converted, to)}
          sub={Number.isFinite(rate) ? `1 ${from} = ${rate.toFixed(4)} ${to} · 1 ${to} = ${(1 / rate).toFixed(4)} ${from}` : "Enter a positive rate for both currencies"}
          tone="brand"
          actions={<CopyButton text={text} label="Copy result" />}
        >
          <StatGrid
            columns={3}
            items={[
              { label: "Rate applied", value: Number.isFinite(rate) ? rate.toFixed(4) : "—" },
              { label: "Inverse rate", value: Number.isFinite(rate) && rate !== 0 ? (1 / rate).toFixed(4) : "—" },
              { label: "Rate date", value: rateDate || "not set" },
            ]}
          />
          <div className="mt-4">
            <SimpleTable
              head={[`Currency`, `1 ${from}`, formatAmount(value, from)]}
              caption={`All currencies you have rates for, from ${formatAmount(value, from)}`}
              rows={rows.map((row) => [row.code, Number.isFinite(row.rate) ? row.rate.toFixed(4) : "—", formatAmount(row.amount, row.code)])}
            />
          </div>
        </ResultCard>
      </div>

      <div className="mt-6">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <h3 className="text-sm font-medium">Your rate table</h3>
          <div className="flex flex-wrap gap-2">
            <Field label="Rates dated" htmlFor="cc-date" optional>
              <TextInput id="cc-date" type="date" value={rateDate} onChange={(event) => setRateDate(event.target.value)} className="font-mono" />
            </Field>
            <Button variant="ghost" size="sm" onClick={() => setRates({ ...SEED_RATES })}>
              Reset to defaults
            </Button>
          </div>
        </div>
        <p className="mt-2 max-w-prose text-xs leading-relaxed text-[var(--text-subtle)]">
          Rates are units of each currency per 1 US dollar. The values below are approximate starting points, not a live
          feed — replace them with the rate your bank, card or exchange desk quoted, and record the date it applied.
        </p>
        <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {CURRENCIES.map((currency) => (
            <label key={currency.code} className="flex items-center gap-2">
              <span className="w-10 shrink-0 font-mono text-[0.7rem] text-[var(--text-subtle)]">{currency.code}</span>
              <TextInput
                aria-label={`${currency.code} per USD`}
                type="number"
                min={0}
                step="0.0001"
                value={Number.isFinite(rates[currency.code]) ? String(rates[currency.code]) : ""}
                onChange={(event) => setRate(currency.code, event.target.value)}
                className="font-mono"
              />
            </label>
          ))}
        </div>
      </div>

      <div className="mt-6 grid gap-3 lg:grid-cols-2">
        <Field label="Paste a rate list" htmlFor="cc-paste" hint="One per line, e.g. “EUR 0.92” or “0.79 GBP”.">
          <TextArea id="cc-paste" rows={4} value={paste} onChange={(event) => setPaste(event.target.value)} placeholder={"EUR 0.92\nGBP 0.79\nNGN 1500"} className="font-mono text-xs" />
        </Field>
        <div className="flex items-end">
          <Button
            onClick={() => {
              const parsed = parseRates(paste);
              if (Object.keys(parsed).length > 0) setRates((current) => ({ ...current, ...parsed }));
            }}
          >
            Apply pasted rates
          </Button>
        </div>
      </div>

      {Number(value) === 0 && (
        <Callout tone="info" title="Zero is a valid amount">
          The conversion is exact — useful for checking a rate before you exchange anything.
        </Callout>
      )}

      <p className="mt-4 text-xs leading-relaxed text-[var(--text-subtle)]">
        Conversions use the mid-market rate you enter. Banks and card networks add a margin — typically 0.5–3% — and the
        rate they apply may differ from the one quoted publicly, so a real transaction will often land slightly worse than
        this figure.
      </p>
    </ToolPanel>
  );
}
