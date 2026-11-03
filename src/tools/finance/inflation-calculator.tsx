"use client";

import { FormTool, num } from "@/components/tools/form-tool";
import { inflationAdjust } from "@/lib/finance";
import { formatCurrency } from "@/lib/utils";

export default function InflationCalculator() {
  return (
    <FormTool
      spec={{
        columns: 3,
        fields: [
          { kind: "number", id: "amount", label: "Amount", value: "100", unit: "$", min: 0, step: 1 },
          { kind: "number", id: "rate", label: "Average inflation", value: "3", unit: "%/yr", min: -20, max: 100, step: 0.1 },
          { kind: "number", id: "years", label: "Years", value: "10", unit: "yrs", min: 0, max: 100, step: 1 },
        ],
        compute: (values) => {
          const amount = num(values, "amount");
          const rate = num(values, "rate");
          const years = num(values, "years");
          if (![amount, rate, years].every(Number.isFinite)) return { error: "Fill in all three fields." };
          if (amount < 0 || years < 0) return { error: "Amount and years cannot be negative." };

          const result = inflationAdjust(amount, rate, years);
          const purchasingPower = 1 / Math.pow(1 + rate / 100, years);

          return {
            label: `${years} years from now`,
            value: formatCurrency(result.future),
            sub: `${formatCurrency(amount)} today has the buying power of ${formatCurrency(result.future)} in ${years} years at ${rate}% inflation — prices rise ${Math.abs(result.cumulative).toFixed(1)}%.`,
            stats: [
              { label: "Today", value: formatCurrency(amount) },
              { label: `In ${years} years`, value: formatCurrency(result.future) },
              { label: "Cumulative inflation", value: `${result.cumulative.toFixed(1)}%` },
              { label: "Buying power of today's money", value: formatCurrency(amount * purchasingPower) },
            ],
            table: {
              head: ["Year", "Same basket costs", "Today's money buys"],
              rows: Array.from({ length: Math.min(Math.round(years), 10) }, (_, index) => {
                const year = index + 1;
                return [
                  year.toString(),
                  formatCurrency(amount * Math.pow(1 + rate / 100, year)),
                  formatCurrency(amount / Math.pow(1 + rate / 100, year)),
                ];
              }),
              caption: "Purchasing power over time",
            },
            note:
              "Inflation compounds, so a steady 3% rate raises prices by 34% over ten years, not 30%. Central banks usually target about 2% a year, but actual rates vary widely by country and year.",
          };
        },
        footnote: "Enter a negative rate to model deflation.",
      }}
    />
  );
}
