"use client";

import { FormTool, num } from "@/components/tools/form-tool";
import { formatCurrency, round } from "@/lib/utils";

export default function BudgetCalculator() {
  return (
    <FormTool
      spec={{
        columns: 3,
        fields: [
          { kind: "number", id: "income", label: "Monthly take-home", value: "4200", unit: "$", min: 0, step: 50 },
          { kind: "number", id: "housing", label: "Housing", value: "1400", unit: "$", min: 0, step: 10, hint: "Rent or mortgage, insurance, utilities" },
          { kind: "number", id: "food", label: "Food and groceries", value: "520", unit: "$", min: 0, step: 10 },
          { kind: "number", id: "transport", label: "Transport", value: "280", unit: "$", min: 0, step: 10 },
          { kind: "number", id: "debt", label: "Debt payments", value: "220", unit: "$", min: 0, step: 10 },
          { kind: "number", id: "other", label: "Other essentials", value: "310", unit: "$", min: 0, step: 10, hint: "Childcare, phone, health" },
          { kind: "number", id: "savingsGoal", label: "Savings goal", value: "20", unit: "%", min: 0, max: 100, step: 1 },
        ],
        compute: (values) => {
          const income = num(values, "income");
          const expenses = ["housing", "food", "transport", "debt", "other"].map((id) => num(values, id, 0) || 0);
          const goal = num(values, "savingsGoal", 20) || 0;
          if (!Number.isFinite(income) || income <= 0) return { error: "Enter your monthly take-home pay." };
          const total = expenses.reduce((sum, value) => sum + value, 0);
          const left = income - total;
          const savingsTarget = income * (goal / 100);
          const gap = left - savingsTarget;

          return {
            label: gap >= 0 ? "Left after essentials" : "Monthly shortfall",
            value: formatCurrency(Math.abs(gap)),
            sub:
              gap >= 0
                ? `You cover ${formatCurrency(total)} of essentials and still hit a ${goal}% savings goal of ${formatCurrency(savingsTarget)}.`
                : `Essentials and the ${goal}% savings goal need ${formatCurrency(-gap)} more each month.`,
            stats: [
              { label: "Take-home", value: formatCurrency(income) },
              { label: "Essentials", value: formatCurrency(total) },
              { label: "Unallocated", value: formatCurrency(left) },
              { label: "Savings target", value: formatCurrency(savingsTarget) },
            ],
            table: {
              head: ["Category", "Amount", "Share of income"],
              rows: [
                ...["Housing", "Food", "Transport", "Debt", "Other"].map((label, index) => [
                  label,
                  formatCurrency(expenses[index]),
                  `${round((expenses[index] / income) * 100, 1)}%`,
                ]),
                ["Saved", formatCurrency(Math.max(left, 0)), `${round((Math.max(left, 0) / income) * 100, 1)}%`],
              ],
              caption: "Budget breakdown",
            },
            note:
              "The 50/30/20 guideline suggests 50% needs, 30% wants and 20% savings. It is a starting point, not a rule — high housing costs make 50% unrealistic in many cities.",
          };
        },
      }}
    />
  );
}
