"use client";

import { FormTool, num } from "@/components/tools/form-tool";
import { freelanceRate } from "@/lib/finance";
import { formatCurrency } from "@/lib/utils";

export default function FreelanceRateCalculator() {
  return (
    <FormTool
      spec={{
        columns: 3,
        fields: [
          { kind: "number", id: "income", label: "Target take-home", value: "70000", unit: "$/yr", min: 0, step: 1000 },
          { kind: "number", id: "costs", label: "Business costs", value: "9000", unit: "$/yr", min: 0, step: 500, hint: "Software, insurance, equipment, accounting" },
          { kind: "number", id: "billable", label: "Billable hours per week", value: "22", min: 1, max: 60, step: 1, hint: "Not total work hours — only time you can invoice" },
          { kind: "number", id: "weeks", label: "Working weeks per year", value: "46", min: 1, max: 52, step: 1 },
          { kind: "number", id: "tax", label: "Tax reserve", value: "25", unit: "%", min: 0, max: 60, step: 1 },
        ],
        compute: (values) => {
          const income = num(values, "income");
          const costs = num(values, "costs", 0) || 0;
          const billable = num(values, "billable");
          const weeks = num(values, "weeks", 46);
          const tax = num(values, "tax", 25);
          if (![income, billable, weeks].every(Number.isFinite)) return { error: "Fill in the target income, billable hours and weeks." };
          if (income <= 0 || billable <= 0 || weeks <= 0) return { error: "Target income, hours and weeks must all be positive." };

          const result = freelanceRate({
            targetAnnualIncome: income,
            billableHoursPerWeek: billable,
            weeksPerYear: weeks,
            annualCosts: costs,
            taxReservePercent: tax,
          });

          return {
            label: "Minimum hourly rate",
            value: formatCurrency(result.hourlyRate),
            sub: `You need ${formatCurrency(result.requiredRevenue, "USD", 0)} of revenue across ${result.billableHours.toLocaleString()} billable hours to take home ${formatCurrency(income, "USD", 0)}.`,
            stats: [
              { label: "Hourly rate", value: formatCurrency(result.hourlyRate) },
              { label: "Day rate (8h)", value: formatCurrency(result.hourlyRate * 8) },
              { label: "Weekly revenue", value: formatCurrency(result.hourlyRate * billable) },
              { label: "Annual revenue", value: formatCurrency(result.requiredRevenue, "USD", 0) },
            ],
            table: {
              head: ["Billable hours/week", "Required hourly rate"],
              rows: [10, 15, 20, 25, 30, 35].map((hours) => {
                const scenario = freelanceRate({
                  targetAnnualIncome: income,
                  billableHoursPerWeek: hours,
                  weeksPerYear: weeks,
                  annualCosts: costs,
                  taxReservePercent: tax,
                });
                return [`${hours} h`, formatCurrency(scenario.hourlyRate)];
              }),
              caption: "Rate at different levels of billable time",
            },
            note:
              "Billable hours are the crux: admin, sales and learning are unpaid, so most freelancers can bill 50–70% of their working time. A rate built on 40 billable hours a week will underpay you.",
          };
        },
        footnote: "This is the break-even-plus-target rate before savings, pension and sick days — add a buffer for those.",
      }}
    />
  );
}
