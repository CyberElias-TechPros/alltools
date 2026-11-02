"use client";

import { useMemo, useState } from "react";
import {
  Callout,
  CopyButton,
  DownloadButton,
  Field,
  ResultCard,
  StatGrid,
  TextInput,
  ToolPanel,
} from "@/components/ui";
import { buildLoanSchedule } from "@/lib/finance";
import { formatCurrency, formatNumber, parseNumber } from "@/lib/utils";

export default function LoanCalculator() {
  const [principal, setPrincipal] = useState("20000");
  const [rate, setRate] = useState("6");
  const [years, setYears] = useState("5");
  const [extra, setExtra] = useState("");

  const result = useMemo(() => {
    const p = parseNumber(principal);
    const r = parseNumber(rate);
    const y = parseNumber(years);
    if (!Number.isFinite(p) || p <= 0) return { error: "Enter a loan amount greater than zero." };
    if (!Number.isFinite(r) || r < 0) return { error: "Enter an interest rate of 0% or more." };
    if (!Number.isFinite(y) || y <= 0) return { error: "Enter a term in years greater than zero." };
    const extraValue = parseNumber(extra);
    const schedule = buildLoanSchedule({
      principal: p,
      annualRate: r,
      years: y,
      extraMonthly: Number.isFinite(extraValue) ? extraValue : 0,
    });
    if (!Number.isFinite(schedule.monthlyPayment)) return { error: "Those inputs do not produce a valid schedule." };
    return { ...schedule, principal: p };
  }, [principal, rate, years, extra]);

  const csv = useMemo(() => {
    if (!("schedule" in result) || !result.schedule) return "";
    const rows = [
      "Month,Payment,Interest,Principal,Balance",
      ...result.schedule.map(
        (row) => `${row.month},${row.payment},${row.interest},${row.principal},${row.balance}`,
      ),
    ];
    return rows.join("\n");
  }, [result]);

  return (
    <ToolPanel>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Field label="Loan amount" htmlFor="loan-principal">
          <TextInput
            id="loan-principal"
            inputMode="decimal"
            value={principal}
            onChange={(event) => setPrincipal(event.target.value)}
          />
        </Field>
        <Field label="Annual interest rate (%)" htmlFor="loan-rate">
          <TextInput
            id="loan-rate"
            inputMode="decimal"
            value={rate}
            onChange={(event) => setRate(event.target.value)}
          />
        </Field>
        <Field label="Term (years)" htmlFor="loan-years">
          <TextInput
            id="loan-years"
            inputMode="decimal"
            value={years}
            onChange={(event) => setYears(event.target.value)}
          />
        </Field>
        <Field label="Extra monthly payment" htmlFor="loan-extra" optional>
          <TextInput
            id="loan-extra"
            inputMode="decimal"
            value={extra}
            placeholder="0"
            onChange={(event) => setExtra(event.target.value)}
          />
        </Field>
      </div>

      <div className="mt-4">
        {"error" in result ? (
          <ResultCard label="Monthly payment" value="—" tone="neutral" sub={result.error} />
        ) : (
          <ResultCard
            label="Monthly payment"
            value={formatCurrency(result.monthlyPayment)}
            sub={`${result.months} payments · ${formatCurrency(result.totalInterest)} total interest`}
            actions={
              <>
                <CopyButton
                  text={`Payment ${formatCurrency(result.monthlyPayment)}/month · total interest ${formatCurrency(result.totalInterest)} · total paid ${formatCurrency(result.totalPaid)}`}
                />
                <DownloadButton filename="amortisation-schedule.csv" content={csv} mime="text/csv" label="CSV" />
              </>
            }
          >
            <StatGrid
              columns={4}
              items={[
                { label: "Total interest", value: formatCurrency(result.totalInterest) },
                { label: "Total paid", value: formatCurrency(result.totalPaid) },
                { label: "Payments", value: formatNumber(result.months) },
                { label: "Interest / principal", value: `${((result.totalInterest / result.principal) * 100).toFixed(1)}%` },
              ]}
            />
          </ResultCard>
        )}
      </div>

      {"schedule" in result && result.schedule.length ? (
        <div className="mt-5">
          <div className="mb-2 flex items-center justify-between">
            <h3 className="text-[0.72rem] font-bold uppercase tracking-[0.09em] text-[var(--text-subtle)]">
              Amortisation schedule
            </h3>
            <span className="text-xs text-[var(--text-subtle)]">
              showing first {Math.min(result.schedule.length, 12)} of {result.schedule.length}
            </span>
          </div>
          <div className="max-h-72 overflow-auto rounded-xl border border-[var(--border)]">
            <table className="w-full border-collapse text-sm">
              <thead className="sticky top-0 bg-[var(--surface-muted)]">
                <tr>
                  {["Month", "Payment", "Interest", "Principal", "Balance"].map((head) => (
                    <th
                      key={head}
                      scope="col"
                      className="border-b border-[var(--border)] px-3 py-2 text-left text-[0.7rem] font-semibold uppercase tracking-[0.06em] text-[var(--text-subtle)]"
                    >
                      {head}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {result.schedule.slice(0, 12).map((row) => (
                  <tr key={row.month} className="odd:bg-[var(--surface)] even:bg-[var(--surface-muted)]/40">
                    <td className="border-b border-[var(--border)] px-3 py-1.5 font-mono text-xs">{row.month}</td>
                    <td className="border-b border-[var(--border)] px-3 py-1.5 font-mono text-xs">{formatCurrency(row.payment)}</td>
                    <td className="border-b border-[var(--border)] px-3 py-1.5 font-mono text-xs text-rose-600 dark:text-rose-400">
                      {formatCurrency(row.interest)}
                    </td>
                    <td className="border-b border-[var(--border)] px-3 py-1.5 font-mono text-xs text-emerald-700 dark:text-emerald-400">
                      {formatCurrency(row.principal)}
                    </td>
                    <td className="border-b border-[var(--border)] px-3 py-1.5 font-mono text-xs">{formatCurrency(row.balance)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : null}

      <div className="mt-4">
        <Callout tone="info" title="What this does not include">
          Lender fees, insurance, taxes, origination charges and early-repayment penalties are not
          modelled. Figures assume a fixed rate for the whole term and monthly compounding. This is
          a planning estimate, not a loan offer.
        </Callout>
      </div>
    </ToolPanel>
  );
}
