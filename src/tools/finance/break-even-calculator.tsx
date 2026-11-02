"use client";

import { FormTool, num } from "@/components/tools/form-tool";
import { breakEven } from "@/lib/finance";
import { formatCurrency } from "@/lib/utils";

export default function BreakEvenCalculator() {
  return (
    <FormTool
      spec={{
        columns: 3,
        fields: [
          { kind: "number", id: "fixed", label: "Fixed costs", value: "12000", unit: "$", min: 0, step: 100, hint: "Rent, salaries, software — costs that do not change with volume" },
          { kind: "number", id: "price", label: "Price per unit", value: "40", unit: "$", min: 0, step: 0.01 },
          { kind: "number", id: "variable", label: "Variable cost per unit", value: "16", unit: "$", min: 0, step: 0.01 },
        ],
        compute: (values) => {
          const fixed = num(values, "fixed");
          const price = num(values, "price");
          const variable = num(values, "variable");
          if (![fixed, price, variable].every(Number.isFinite)) return { error: "Fill in all three fields." };
          if (fixed < 0 || price < 0 || variable < 0) return { error: "Costs and prices cannot be negative." };

          const result = breakEven(fixed, price, variable);
          if (!result) {
            return { error: "Each unit sells for less than its variable cost, so selling more only deepens the loss. Raise the price or cut the variable cost." };
          }
          const scenarios = [0.5, 0.75, 1, 1.5, 2].map((factor) => {
            const units = Math.round(result.units * factor);
            const profit = units * result.contributionPerUnit - fixed;
            return [units.toLocaleString(), formatCurrency(units * price, "USD", 0), formatCurrency(profit, "USD", 0)];
          });

          return {
            label: "Break-even volume",
            value: `${result.units.toLocaleString()} units`,
            sub: `Each sale contributes ${formatCurrency(result.contributionPerUnit)} after variable costs (${result.marginPercent}% of price). Selling that many brings in ${formatCurrency(result.revenue, "USD", 0)}.`,
            stats: [
              { label: "Units to break even", value: result.units.toLocaleString() },
              { label: "Revenue at break-even", value: formatCurrency(result.revenue, "USD", 0) },
              { label: "Contribution per unit", value: formatCurrency(result.contributionPerUnit) },
              { label: "Units per month", value: `${Math.ceil(result.units / 12).toLocaleString()} over a year` },
            ],
            table: { head: ["Units sold", "Revenue", "Profit"], rows: scenarios, caption: "Profit at several volumes" },
            note:
              "Break-even units are always rounded up, because selling 499.6 of something is not possible. Below that volume the business runs at a loss equal to fixed costs minus the contribution earned.",
          };
        },
      }}
    />
  );
}
