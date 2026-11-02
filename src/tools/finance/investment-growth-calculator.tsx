"use client";

import { FormTool, num } from "@/components/tools/form-tool";
import { compoundInterest } from "@/lib/finance";
import { formatCurrency, round } from "@/lib/utils";

export default function InvestmentGrowthCalculator() {
  return (
    <FormTool
      spec={{
        columns: 4,
        fields: [
          { kind: "number", id: "initial", label: "Initial investment", value: "10000", unit: "$", min: 0, step: 100 },
          { kind: "number", id: "monthly", label: "Monthly top-up", value: "300", unit: "$", min: 0, step: 10 },
          { kind: "number", id: "rate", label: "Expected return", value: "7", unit: "%/yr", min: -50, step: 0.1 },
          { kind: "number", id: "years", label: "Years invested", value: "20", unit: "yrs", min: 1, max: 60, step: 1 },
          { kind: "number", id: "inflation", label: "Inflation", value: "2.5", unit: "%/yr", min: 0, step: 0.1, optional: true, hint: "To show the real, inflation-adjusted value" },
        ],
        compute: (values) => {
          const initial = num(values, "initial");
          const monthly = num(values, "monthly");
          const rate = num(values, "rate");
          const years = num(values, "years");
          const inflation = num(values, "inflation", 0) || 0;
          if (![initial, monthly, rate, years].every(Number.isFinite)) return { error: "Fill in the investment, top-up, return and years." };
          if (initial < 0 || monthly < 0 || years <= 0) return { error: "Use a non-negative investment and at least one year." };

          const result = compoundInterest({
            principal: initial,
            annualRate: rate,
            years,
            compoundsPerYear: 12,
            contribution: monthly,
            contributionFrequency: "monthly",
          });
          const realRate = ((1 + rate / 100) / (1 + inflation / 100) - 1) * 100;
          const real = compoundInterest({
            principal: initial,
            annualRate: realRate,
            years,
            compoundsPerYear: 12,
            contribution: monthly,
            contributionFrequency: "monthly",
          });

          return {
            label: "Projected value",
            value: formatCurrency(result.finalBalance),
            sub: `${formatCurrency(result.totalContributed)} invested, ${formatCurrency(result.totalGrowth)} of growth over ${years} years. In today's money that is about ${formatCurrency(real.finalBalance)}.`,
            stats: [
              { label: "Nominal value", value: formatCurrency(result.finalBalance) },
              { label: "Real value", value: formatCurrency(real.finalBalance) },
              { label: "Total invested", value: formatCurrency(result.totalContributed) },
              { label: "Growth multiple", value: `${round(result.finalBalance / Math.max(result.totalContributed, 1), 2)}×` },
            ],
            table: {
              head: ["Year", "Balance", "Invested", "Growth"],
              rows: result.rows
                .filter((row) => row.year % Math.max(1, Math.round(years / 10)) === 0 || row.year === years)
                .map((row) => [row.year.toString(), formatCurrency(row.balance, "USD", 0), formatCurrency(row.contributed, "USD", 0), formatCurrency(row.growth, "USD", 0)]),
              caption: "Projection by year",
            },
            note:
              "A constant return is a planning assumption, not a prediction: real markets fall as well as rise, and the order of returns changes the outcome. The real value discounts the nominal figure by inflation.",
          };
        },
        footnote: "For education and planning only — this is not investment advice.",
      }}
    />
  );
}
