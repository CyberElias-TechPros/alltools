"use client";

import { FormTool, num } from "@/components/tools/form-tool";
import { simpleInterest } from "@/lib/finance";
import { formatCurrency } from "@/lib/utils";

export default function SimpleInterestCalculator() {
  return (
    <FormTool
      spec={{
        columns: 3,
        fields: [
          { kind: "number", id: "principal", label: "Principal", value: "5000", unit: "$", min: 0, step: 0.01 },
          { kind: "number", id: "rate", label: "Annual rate", value: "6", unit: "%", min: 0, step: 0.01 },
          { kind: "number", id: "years", label: "Time", value: "3", unit: "yrs", min: 0, step: 0.1 },
        ],
        compute: (values) => {
          const principal = num(values, "principal");
          const rate = num(values, "rate");
          const years = num(values, "years");
          if (![principal, rate, years].every(Number.isFinite)) return { error: "Fill in the principal, rate and time." };
          if (principal < 0 || rate < 0 || years < 0) return { error: "None of the inputs can be negative." };

          const result = simpleInterest(principal, rate, years);
          const yearly = result.perPeriod.filter((_, index) => index < 10);

          return {
            label: "Total interest",
            value: formatCurrency(result.interest),
            sub: `${formatCurrency(principal)} at ${rate}% for ${years} years grows to ${formatCurrency(result.total)}.`,
            stats: [
              { label: "Principal", value: formatCurrency(principal) },
              { label: "Interest", value: formatCurrency(result.interest) },
              { label: "Total", value: formatCurrency(result.total) },
              { label: "Interest per year", value: formatCurrency(principal * (rate / 100)) },
            ],
            table: {
              head: ["Year", "Interest earned", "Balance"],
              rows: yearly.map((row) => [row.period.toString(), formatCurrency(row.interest), formatCurrency(row.balance)]),
              caption: "Simple interest by year",
            },
            note:
              "Simple interest is charged only on the original principal, so the yearly interest never changes. Compound interest charges interest on the interest, which is why it grows faster.",
          };
        },
        footnote: "Used for short-term loans, some car finance and simple savings products. Check whether your product compounds.",
      }}
    />
  );
}
