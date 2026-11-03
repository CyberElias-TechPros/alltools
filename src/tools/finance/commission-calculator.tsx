"use client";

import { FormTool, num, str } from "@/components/tools/form-tool";
import { formatCurrency, round } from "@/lib/utils";

export default function CommissionCalculator() {
  return (
    <FormTool
      spec={{
        columns: 3,
        fields: [
          { kind: "number", id: "sales", label: "Sale amount", value: "18500", unit: "$", min: 0, step: 100 },
          { kind: "number", id: "rate", label: "Commission rate", value: "6", unit: "%", min: 0, step: 0.1 },
          { kind: "number", id: "base", label: "Base salary", value: "2500", unit: "$", min: 0, step: 50, optional: true, hint: "Monthly base, if any" },
          { kind: "number", id: "threshold", label: "Commission starts after", value: "", unit: "$", min: 0, step: 100, optional: true, hint: "Only pay commission above this sales figure" },
          {
            kind: "select",
            id: "split",
            label: "Split",
            value: "100",
            options: [
              { value: "100", label: "Full commission" },
              { value: "50", label: "Half (co-broke)" },
              { value: "30", label: "30% referral share" },
            ],
            hint: "How much of the commission you keep",
          },
        ],
        compute: (values) => {
          const sales = num(values, "sales");
          const rate = num(values, "rate");
          const base = num(values, "base", 0) || 0;
          const threshold = num(values, "threshold", 0) || 0;
          const split = Number(str(values, "split")) || 100;
          if (!Number.isFinite(sales) || !Number.isFinite(rate)) return { error: "Enter the sale amount and commission rate." };
          if (sales < 0 || rate < 0) return { error: "Sales and rate cannot be negative." };

          const commissionable = Math.max(sales - threshold, 0);
          const grossCommission = commissionable * (rate / 100);
          const commission = grossCommission * (split / 100);
          const total = commission + base;

          return {
            label: "Your commission",
            value: formatCurrency(commission),
            sub: `${round(rate, 2)}% of ${formatCurrency(commissionable, "USD", 0)} commissionable sales${split < 100 ? `, with a ${100 - split}% split` : ""}${base ? `, plus ${formatCurrency(base)} base` : ""}.`,
            stats: [
              { label: "Commissionable sales", value: formatCurrency(commissionable, "USD", 0) },
              { label: "Gross commission", value: formatCurrency(grossCommission) },
              { label: "Your share", value: `${split}%` },
              { label: "Total pay", value: formatCurrency(total) },
            ],
            table: {
              head: ["Sale amount", "Commission", "Your take"],
              rows: [0.5, 1, 2, 5].map((factor) => {
                const amount = sales * factor;
                const value = Math.max(amount - threshold, 0) * (rate / 100) * (split / 100);
                return [formatCurrency(amount, "USD", 0), formatCurrency(Math.max(amount - threshold, 0) * (rate / 100)), formatCurrency(value)];
              }),
              caption: "Commission at several sale sizes",
            },
            note:
              "Thresholds are common in real estate and recruitment: commission is only paid on the portion above the threshold, not on the whole sale.",
          };
        },
      }}
    />
  );
}
