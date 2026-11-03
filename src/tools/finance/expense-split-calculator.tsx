"use client";

import { FormTool, num } from "@/components/tools/form-tool";
import { formatCurrency } from "@/lib/utils";

export default function ExpenseSplitCalculator() {
  return (
    <FormTool
      spec={{
        columns: 3,
        fields: [
          { kind: "number", id: "total", label: "Bill total", value: "248.60", unit: "$", min: 0, step: 0.01 },
          { kind: "number", id: "people", label: "People", value: "4", min: 1, max: 100, step: 1 },
          { kind: "number", id: "tip", label: "Tip", value: "18", unit: "%", min: 0, max: 100, step: 0.5 },
          { kind: "number", id: "tax", label: "Tax included", value: "", unit: "%", min: 0, max: 40, step: 0.1, optional: true, hint: "Add tax if the bill excludes it" },
          { kind: "number", id: "paid", label: "Already paid by one person", value: "", unit: "$", min: 0, step: 0.01, optional: true },
        ],
        compute: (values) => {
          const total = num(values, "total");
          const people = Math.max(Math.trunc(num(values, "people", 1)), 1);
          const tip = num(values, "tip", 0) || 0;
          const tax = num(values, "tax", 0) || 0;
          const paid = num(values, "paid", 0) || 0;
          if (!Number.isFinite(total) || total < 0) return { error: "Enter the bill total." };

          const taxAmount = total * (tax / 100);
          const tipAmount = (total + taxAmount) * (tip / 100);
          const grand = total + taxAmount + tipAmount;
          const each = grand / people;
          const reimbursements = Math.min(paid, grand);

          return {
            label: "Each person pays",
            value: formatCurrency(each),
            sub: `${formatCurrency(grand)} total for ${people} people, including ${formatCurrency(tipAmount)} tip${taxAmount ? ` and ${formatCurrency(taxAmount)} tax` : ""}.`,
            stats: [
              { label: "Bill", value: formatCurrency(total) },
              { label: "Tax", value: formatCurrency(taxAmount) },
              { label: "Tip", value: formatCurrency(tipAmount) },
              { label: "Each", value: formatCurrency(each) },
            ],
            table: {
              head: ["Person", "Pays", "Note"],
              rows: Array.from({ length: Math.min(people, 12) }, (_, index) => [
                `Person ${index + 1}`,
                formatCurrency(each),
                index === 0 && reimbursements > 0 ? `already paid ${formatCurrency(reimbursements)} — collects ${formatCurrency(reimbursements - each > 0 ? reimbursements - each : 0)}` : "—",
              ]),
              caption: "Split between people",
            },
            note:
              "Splitting evenly ignores what each person ordered. When the amounts differ wildly, agree to split the shared items and pay for your own separately rather than arguing over pennies.",
            output: {
              label: "Shareable summary",
              text: `Bill ${formatCurrency(total)}\nTax ${formatCurrency(taxAmount)}\nTip ${formatCurrency(tipAmount)}\nTotal ${formatCurrency(grand)}\nBetween ${people} people: ${formatCurrency(each)} each`,
            },
          };
        },
      }}
    />
  );
}
