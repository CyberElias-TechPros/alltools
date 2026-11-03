"use client";

import { useMemo, useState } from "react";
import { CopyButton, Field, ResultCard, StatGrid, TextInput, ToolPanel } from "@/components/ui";
import { roi } from "@/lib/finance";
import { formatCurrency, parseNumber } from "@/lib/utils";

export default function RoiCalculator() {
  const [invested, setInvested] = useState("1000");
  const [returned, setReturned] = useState("1250");
  const [months, setMonths] = useState("48");

  const data = useMemo(() => {
    const i = parseNumber(invested);
    const r = parseNumber(returned);
    const m = parseNumber(months);
    if (!Number.isFinite(i) || i <= 0) return { error: "Enter an amount invested greater than zero." };
    if (!Number.isFinite(r) || r < 0) return { error: "Enter the value returned." };
    return { ...roi(i, r, Number.isFinite(m) && m > 0 ? m : undefined), months: Number.isFinite(m) ? m : undefined, invested: i, returned: r };
  }, [invested, returned, months]);

  const summary =
    "simple" in data
      ? `ROI ${data.simple!.toFixed(2)}% · gain ${formatCurrency(data.gain!)}${Number.isFinite(data.annualised!) ? ` · annualised ${data.annualised!.toFixed(2)}%` : ""}`
      : "";

  return (
    <ToolPanel>
      <div className="grid gap-3 sm:grid-cols-3">
        <Field label="Amount invested" htmlFor="roi-invested">
          <TextInput id="roi-invested" inputMode="decimal" value={invested} onChange={(event) => setInvested(event.target.value)} />
        </Field>
        <Field label="Value returned" htmlFor="roi-returned">
          <TextInput id="roi-returned" inputMode="decimal" value={returned} onChange={(event) => setReturned(event.target.value)} />
        </Field>
        <Field label="Holding period (months)" htmlFor="roi-months" optional hint="Needed for annualised ROI">
          <TextInput id="roi-months" inputMode="decimal" value={months} onChange={(event) => setMonths(event.target.value)} />
        </Field>
      </div>

      <div className="mt-4">
        {data && "error" in data ? (
          <ResultCard label="Return on investment" value="—" tone="neutral" sub={data.error} />
        ) : data ? (
          <ResultCard
            label="Return on investment"
            value={`${data.simple! > 0 ? "+" : ""}${data.simple!.toFixed(2)}%`}
            sub={`Net gain ${formatCurrency(data.gain!)}${
              Number.isFinite(data.annualised!) && data.months
                ? ` · ${data.annualised!.toFixed(2)}% per year over ${data.months} months`
                : ""
            }`}
            actions={<CopyButton text={summary} />}
          >
            <StatGrid
              columns={3}
              items={[
                { label: "Net gain", value: formatCurrency(data.gain!) },
                { label: "Simple ROI", value: `${data.simple!.toFixed(2)}%` },
                {
                  label: "Annualised",
                  value: Number.isFinite(data.annualised!) ? `${data.annualised!.toFixed(2)}%` : "—",
                },
              ]}
            />
          </ResultCard>
        ) : null}
      </div>

      <p className="mt-3 text-xs text-[var(--text-subtle)]">
        Annualised ROI compounds the total return over the holding period, which is the only fair
        way to compare investments of different lengths.
      </p>
    </ToolPanel>
  );
}
