"use client";

import { useMemo, useState } from "react";
import {
  Callout,
  CopyButton,
  DownloadButton,
  Field,
  ResultCard,
  Segmented,
  Select,
  SimpleTable,
  StatGrid,
  TextInput,
  ToolPanel,
} from "@/components/ui";
import { compoundInterest } from "@/lib/finance";
import { formatCurrency, formatNumber, parseNumber } from "@/lib/utils";

export default function CompoundInterestCalculator() {
  const [principal, setPrincipal] = useState("5000");
  const [rate, setRate] = useState("7");
  const [years, setYears] = useState("10");
  const [frequency, setFrequency] = useState("12");
  const [contribution, setContribution] = useState("0");
  const [contributionFrequency, setContributionFrequency] = useState<"monthly" | "annually" | "none">("monthly");
  const [fee, setFee] = useState("0");

  const result = useMemo(() => {
    const p = parseNumber(principal) || 0;
    const r = parseNumber(rate);
    const y = parseNumber(years);
    const n = Number(frequency);
    const c = parseNumber(contribution) || 0;
    const f = parseNumber(fee) || 0;
    if (!Number.isFinite(r) || !Number.isFinite(y) || y <= 0) {
      return { error: "Enter an interest rate and a term greater than zero." };
    }
    if (p <= 0 && c <= 0) return { error: "Enter a starting amount or a regular contribution." };
    return compoundInterest({
      principal: p,
      annualRate: r,
      years: y,
      compoundsPerYear: n,
      contribution: c,
      contributionFrequency,
      annualFeePercent: f,
    });
  }, [principal, rate, years, frequency, contribution, contributionFrequency, fee]);

  const csv = useMemo(() => {
    if (!("rows" in result)) return "";
    return [
      "Year,Balance,Contributed,Growth",
      ...result.rows.map((row) => `${row.year},${row.balance},${row.contributed},${row.growth}`),
    ].join("\n");
  }, [result]);

  return (
    <ToolPanel>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <Field label="Starting amount" htmlFor="ci-principal">
          <TextInput id="ci-principal" inputMode="decimal" value={principal} onChange={(event) => setPrincipal(event.target.value)} />
        </Field>
        <Field label="Annual interest rate (%)" htmlFor="ci-rate">
          <TextInput id="ci-rate" inputMode="decimal" value={rate} onChange={(event) => setRate(event.target.value)} />
        </Field>
        <Field label="Term (years)" htmlFor="ci-years">
          <TextInput id="ci-years" inputMode="decimal" value={years} onChange={(event) => setYears(event.target.value)} />
        </Field>
        <Field label="Compounding" htmlFor="ci-frequency">
          <Select id="ci-frequency" value={frequency} onChange={(event) => setFrequency(event.target.value)}>
            <option value="1">Annually</option>
            <option value="2">Semi-annually</option>
            <option value="4">Quarterly</option>
            <option value="12">Monthly</option>
            <option value="365">Daily</option>
          </Select>
        </Field>
        <Field label="Regular contribution" htmlFor="ci-contribution">
          <TextInput
            id="ci-contribution"
            inputMode="decimal"
            value={contribution}
            onChange={(event) => setContribution(event.target.value)}
          />
        </Field>
        <Field label="Contribution frequency" htmlFor="ci-contribution-frequency">
          <Select
            id="ci-contribution-frequency"
            value={contributionFrequency}
            onChange={(event) => setContributionFrequency(event.target.value as "monthly" | "annually" | "none")}
          >
            <option value="monthly">Every month</option>
            <option value="annually">Once a year</option>
            <option value="none">No contributions</option>
          </Select>
        </Field>
      </div>

      <div className="mt-3 max-w-xs">
        <Field label="Annual fee (expense ratio %)" htmlFor="ci-fee" optional hint="Deducted from the rate before compounding">
          <TextInput id="ci-fee" inputMode="decimal" value={fee} onChange={(event) => setFee(event.target.value)} />
        </Field>
      </div>

      <div className="mt-4">
        {"error" in result ? (
          <ResultCard label="Future value" value="—" tone="neutral" sub={result.error} />
        ) : (
          <ResultCard
            label="Future value"
            value={formatCurrency(result.finalBalance)}
            sub={`${formatCurrency(result.totalContributed)} contributed · ${formatCurrency(result.totalGrowth)} growth`}
            actions={
              <>
                <CopyButton
                  text={`Future value ${formatCurrency(result.finalBalance)} from ${formatCurrency(result.totalContributed)} contributed (${formatCurrency(result.totalGrowth)} growth)`}
                />
                <DownloadButton filename="compound-interest.csv" content={csv} mime="text/csv" label="CSV" />
              </>
            }
          >
            <StatGrid
              columns={3}
              items={[
                { label: "Total contributed", value: formatCurrency(result.totalContributed) },
                { label: "Total growth", value: formatCurrency(result.totalGrowth) },
                {
                  label: "Growth share",
                  value: `${((result.totalGrowth / (result.finalBalance || 1)) * 100).toFixed(1)}%`,
                },
              ]}
            />
          </ResultCard>
        )}
      </div>

      {"rows" in result && result.rows.length ? (
        <div className="mt-5 grid gap-4 lg:grid-cols-[1.1fr_1fr]">
          <div>
            <h3 className="mb-2 text-[0.72rem] font-bold uppercase tracking-[0.09em] text-[var(--text-subtle)]">
              Growth by year
            </h3>
            <div className="space-y-1.5">
              {result.rows.slice(0, 30).map((row) => {
                const max = result.rows[result.rows.length - 1].balance || 1;
                const contributedWidth = (row.contributed / max) * 100;
                const growthWidth = Math.max((row.growth / max) * 100, 0);
                return (
                  <div key={row.year} className="flex items-center gap-2 text-xs">
                    <span className="w-8 shrink-0 font-mono text-[var(--text-subtle)]">{row.year}</span>
                    <div className="flex h-4 flex-1 overflow-hidden rounded bg-[var(--surface-muted)]">
                      <div className="bg-brand-500/80" style={{ width: `${Math.min(contributedWidth, 100)}%` }} title={`Contributed ${formatCurrency(row.contributed)}`} />
                      <div className="bg-emerald-500/70" style={{ width: `${Math.min(growthWidth, 100 - Math.min(contributedWidth, 100))}%` }} title={`Growth ${formatCurrency(row.growth)}`} />
                    </div>
                    <span className="w-20 shrink-0 text-right font-mono text-[var(--text-muted)]">
                      {formatNumber(row.balance, 0)}
                    </span>
                  </div>
                );
              })}
            </div>
            <p className="mt-2 flex gap-3 text-[0.7rem] text-[var(--text-subtle)]">
              <span className="flex items-center gap-1"><span className="size-2 rounded-full bg-brand-500/80" /> Contributed</span>
              <span className="flex items-center gap-1"><span className="size-2 rounded-full bg-emerald-500/70" /> Growth</span>
            </p>
          </div>
          <div>
            <h3 className="mb-2 text-[0.72rem] font-bold uppercase tracking-[0.09em] text-[var(--text-subtle)]">
              Year-by-year table
            </h3>
            <div className="max-h-64 overflow-auto">
              <SimpleTable
                caption="Balance by year"
                head={["Year", "Balance", "Growth"]}
                rows={result.rows.map((row) => [
                  row.year,
                  formatCurrency(row.balance, "USD", 0),
                  formatCurrency(row.growth, "USD", 0),
                ])}
              />
            </div>
          </div>
        </div>
      ) : null}

      <div className="mt-4">
        <Callout tone="info" title="Projection, not a promise">
          Returns are assumed to be constant. Real investments fluctuate and can lose value. Tax is
          not modelled, and contributions are assumed to arrive at the end of each period.
        </Callout>
      </div>
    </ToolPanel>
  );
}
