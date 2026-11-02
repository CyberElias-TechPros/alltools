"use client";

import { FormTool, num } from "@/components/tools/form-tool";
import { compoundInterest } from "@/lib/finance";
import { formatCurrency } from "@/lib/utils";

export default function SavingsCalculator() {
  return (
    <FormTool
      spec={{
        columns: 4,
        fields: [
          { kind: "number", id: "initial", label: "Starting balance", value: "2000", unit: "$", min: 0, step: 0.01 },
          { kind: "number", id: "monthly", label: "Monthly deposit", value: "250", unit: "$", min: 0, step: 0.01 },
          { kind: "number", id: "rate", label: "Interest rate", value: "4.25", unit: "%", min: 0, step: 0.01 },
          { kind: "number", id: "years", label: "Years", value: "10", unit: "yrs", min: 0, max: 60, step: 1 },
        ],
        compute: (values) => {
          const initial = num(values, "initial");
          const monthly = num(values, "monthly");
          const rate = num(values, "rate");
          const years = num(values, "years");
          if (![initial, monthly, rate, years].every(Number.isFinite)) return { error: "Fill in all four fields." };
          if (initial < 0 || monthly < 0 || rate < 0 || years <= 0) return { error: "Use positive values and at least one year." };

          const result = compoundInterest({
            principal: initial,
            annualRate: rate,
            years,
            compoundsPerYear: 12,
            contribution: monthly,
            contributionFrequency: "monthly",
          });

          return {
            label: "Balance after saving",
            value: formatCurrency(result.finalBalance),
            sub: `You put in ${formatCurrency(result.totalContributed)} and interest adds ${formatCurrency(result.totalGrowth)}.`,
            stats: [
              { label: "Final balance", value: formatCurrency(result.finalBalance) },
              { label: "You contributed", value: formatCurrency(result.totalContributed) },
              { label: "Interest earned", value: formatCurrency(result.totalGrowth) },
              { label: "Growth share", value: `${result.finalBalance > 0 ? ((result.totalGrowth / result.finalBalance) * 100).toFixed(1) : "0"}%` },
            ],
            table: {
              head: ["Year", "Balance", "Contributed", "Interest"],
              rows: result.rows
                .filter((row) => row.year % Math.max(1, Math.round(result.rows.length / 10)) === 0 || row.year === result.rows.length)
                .map((row) => [row.year.toString(), formatCurrency(row.balance, "USD", 0), formatCurrency(row.contributed, "USD", 0), formatCurrency(row.growth, "USD", 0)]),
              caption: "Balance by year",
            },
            note:
              "Interest compounds monthly here. Deposits are added at the end of each month, which is slightly conservative compared with depositing at the start.",
          };
        },
      }}
    />
  );
}
