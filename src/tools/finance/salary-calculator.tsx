"use client";

import { FormTool, num, str } from "@/components/tools/form-tool";
import { formatCurrency, round } from "@/lib/utils";

export default function SalaryCalculator() {
  return (
    <FormTool
      spec={{
        columns: 3,
        fields: [
          { kind: "number", id: "gross", label: "Annual gross salary", value: "85000", unit: "$", min: 0, step: 500 },
          { kind: "number", id: "tax", label: "Income tax withheld", value: "22", unit: "%", min: 0, max: 70, step: 0.1, hint: "Effective rate, not your top bracket" },
          { kind: "number", id: "pension", label: "Pension / retirement", value: "5", unit: "%", min: 0, max: 30, step: 0.1, optional: true },
          { kind: "number", id: "other", label: "Other deductions", value: "", unit: "$/yr", min: 0, step: 100, optional: true, hint: "Health cover, union dues, parking" },
          {
            kind: "select",
            id: "frequency",
            label: "Paid",
            value: "monthly",
            options: [
              { value: "weekly", label: "Weekly (52)" },
              { value: "biweekly", label: "Every two weeks (26)" },
              { value: "semimonthly", label: "Twice a month (24)" },
              { value: "monthly", label: "Monthly (12)" },
              { value: "annual", label: "Annually" },
            ],
          },
        ],
        compute: (values) => {
          const gross = num(values, "gross");
          const taxRate = num(values, "tax");
          const pensionRate = num(values, "pension", 0) || 0;
          const other = num(values, "other", 0) || 0;
          if (!Number.isFinite(gross) || !Number.isFinite(taxRate)) return { error: "Enter the gross salary and an effective tax rate." };
          if (gross <= 0) return { error: "Enter a salary greater than zero." };

          const tax = gross * (taxRate / 100);
          const pension = gross * (pensionRate / 100);
          const net = gross - tax - pension - other;
          if (net <= 0) return { error: "Deductions exceed the salary — check the percentages." };
          const periods = { weekly: 52, biweekly: 26, semimonthly: 24, monthly: 12, annual: 1 }[str(values, "frequency")] ?? 12;

          return {
            label: "Take-home pay",
            value: formatCurrency(net / periods),
            sub: `${formatCurrency(net, "USD", 0)} a year after tax, pension and other deductions.`,
            stats: [
              { label: "Gross annual", value: formatCurrency(gross, "USD", 0) },
              { label: "Tax", value: formatCurrency(tax, "USD", 0) },
              { label: "Deductions", value: formatCurrency(pension + other, "USD", 0) },
              { label: "Net annual", value: formatCurrency(net, "USD", 0) },
              { label: "Monthly net", value: formatCurrency(net / 12) },
              { label: "Effective deduction", value: `${round(((gross - net) / gross) * 100, 2)}%` },
            ],
            table: {
              head: ["Frequency", "Gross", "Net"],
              rows: [["Weekly", 52], ["Every two weeks", 26], ["Twice a month", 24], ["Monthly", 12], ["Annual", 1]].map(([label, count]) => [
                String(label),
                formatCurrency(gross / Number(count)),
                formatCurrency(net / Number(count)),
              ]),
              caption: "Pay by frequency",
            },
            note:
              "Use your effective tax rate — total tax divided by gross income — rather than your marginal bracket. Bracket-based payroll calculations depend on your country and filing status and are not modelled here.",
          };
        },
        footnote: "An estimate for planning; your payroll department's figures are authoritative.",
      }}
    />
  );
}
