"use client";

import { FormTool, num } from "@/components/tools/form-tool";
import { buildLoanSchedule } from "@/lib/finance";
import { formatCurrency } from "@/lib/utils";

export default function LoanRepaymentCalculator() {
  return (
    <FormTool
      spec={{
        columns: 4,
        fields: [
          { kind: "number", id: "principal", label: "Amount borrowed", value: "25000", unit: "$", min: 0, step: 500 },
          { kind: "number", id: "rate", label: "Annual rate", value: "7.5", unit: "%", min: 0, max: 60, step: 0.01 },
          { kind: "number", id: "years", label: "Term", value: "5", unit: "yrs", min: 0.5, max: 40, step: 0.5 },
          { kind: "number", id: "extra", label: "Extra each month", value: "100", unit: "$", min: 0, step: 10, optional: true },
          { kind: "number", id: "fee", label: "Monthly account fee", value: "", unit: "$", min: 0, step: 1, optional: true },
        ],
        compute: (values) => {
          const principal = num(values, "principal");
          const rate = num(values, "rate");
          const years = num(values, "years");
          const extra = num(values, "extra", 0) || 0;
          const fee = num(values, "fee", 0) || 0;
          if (!Number.isFinite(principal) || principal <= 0) return { error: "Enter the amount borrowed." };
          if (![rate, years].every(Number.isFinite) || years <= 0) return { error: "Enter a rate and a term in years." };

          const base = buildLoanSchedule({ principal, annualRate: rate, years });
          const faster = buildLoanSchedule({ principal, annualRate: rate, years, extraMonthly: extra });
          if (!Number.isFinite(base.monthlyPayment) || base.months === 0) {
            return { error: "That loan never clears — the payment does not cover the interest." };
          }

          const baseFees = fee * base.months;
          const fasterFees = fee * faster.months;
          const interestSaved = base.totalInterest - faster.totalInterest;
          const monthsSaved = base.months - faster.months;

          return {
            label: "Monthly repayment",
            value: formatCurrency(base.monthlyPayment + fee),
            sub: `${formatCurrency(base.monthlyPayment)} repayment${fee ? ` plus a ${formatCurrency(fee)} fee` : ""} for ${base.months} months. Total interest ${formatCurrency(base.totalInterest, "USD", 0)}.`,
            stats: [
              { label: "Monthly payment", value: formatCurrency(base.monthlyPayment) },
              { label: "Total interest", value: formatCurrency(base.totalInterest, "USD", 0) },
              { label: "Total repaid", value: formatCurrency(base.totalPaid + baseFees, "USD", 0) },
              { label: "With extra", value: formatCurrency(faster.monthlyPayment + extra) },
              { label: "Months saved", value: monthsSaved.toString() },
              { label: "Interest saved", value: formatCurrency(interestSaved, "USD", 0) },
            ],
            table: {
              head: ["Year", "Paid", "Balance"],
              rows: base.schedule
                .filter((row) => row.month % 12 === 0 || row.month === base.months)
                .slice(0, 12)
                .map((row) => [
                  `Year ${Math.ceil(row.month / 12)}`,
                  formatCurrency(row.payment),
                  formatCurrency(row.balance, "USD", 0),
                ]),
              caption: "Amortisation milestones",
            },
            note:
              `Adding ${formatCurrency(extra)} a month clears the loan ${monthsSaved} months earlier (${faster.months} months instead of ${base.months}) and saves ${formatCurrency(interestSaved)} in interest.`,
          };
        },
      }}
    />
  );
}
