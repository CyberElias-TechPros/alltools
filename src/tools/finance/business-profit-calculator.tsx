"use client";

import { FormTool, num } from "@/components/tools/form-tool";
import { formatCurrency, round } from "@/lib/utils";

export default function BusinessProfitCalculator() {
  return (
    <FormTool
      spec={{
        columns: 3,
        fields: [
          { kind: "number", id: "revenue", label: "Revenue", value: "48000", unit: "$", min: 0, step: 100 },
          { kind: "number", id: "cogs", label: "Cost of goods sold", value: "27000", unit: "$", min: 0, step: 100 },
          { kind: "number", id: "opex", label: "Operating expenses", value: "11500", unit: "$", min: 0, step: 100 },
          { kind: "number", id: "other", label: "Other income / (costs)", value: "", unit: "$", step: 100, optional: true, hint: "Interest, one-off sales" },
          { kind: "number", id: "tax", label: "Tax rate", value: "", unit: "%", min: 0, max: 60, step: 0.1, optional: true },
        ],
        compute: (values) => {
          const revenue = num(values, "revenue");
          const cogs = num(values, "cogs");
          const opex = num(values, "opex");
          const other = num(values, "other", 0) || 0;
          const taxRate = num(values, "tax", 0) || 0;
          if (![revenue, cogs, opex].every(Number.isFinite)) return { error: "Fill in revenue, cost of goods sold and operating expenses." };
          if (revenue < 0 || cogs < 0 || opex < 0) return { error: "Revenue and costs cannot be negative." };
          if (cogs > revenue) return { error: "Cost of goods sold is higher than revenue — every sale loses money before overheads." };

          const gross = revenue - cogs;
          const operating = gross - opex;
          const pretax = operating + other;
          const tax = pretax > 0 ? pretax * (taxRate / 100) : 0;
          const net = pretax - tax;

          return {
            label: "Net profit",
            value: formatCurrency(net),
            sub: `${formatCurrency(revenue, "USD", 0)} revenue, ${round((net / Math.max(revenue, 1)) * 100, 2)}% net margin.`,
            stats: [
              { label: "Gross profit", value: formatCurrency(gross) },
              { label: "Gross margin", value: `${round((gross / Math.max(revenue, 1)) * 100, 2)}%` },
              { label: "Operating profit", value: formatCurrency(operating) },
              { label: "Net margin", value: `${round((net / Math.max(revenue, 1)) * 100, 2)}%` },
            ],
            table: {
              head: ["Line", "Amount", "Share of revenue"],
              rows: [
                ["Revenue", formatCurrency(revenue, "USD", 0), "100%"],
                ["Cost of goods sold", formatCurrency(-cogs, "USD", 0), `${round((cogs / Math.max(revenue, 1)) * 100, 1)}%`],
                ["Gross profit", formatCurrency(gross, "USD", 0), `${round((gross / Math.max(revenue, 1)) * 100, 1)}%`],
                ["Operating expenses", formatCurrency(-opex, "USD", 0), `${round((opex / Math.max(revenue, 1)) * 100, 1)}%`],
                ["Tax", formatCurrency(-tax, "USD", 0), `${round((tax / Math.max(revenue, 1)) * 100, 1)}%`],
                ["Net profit", formatCurrency(net, "USD", 0), `${round((net / Math.max(revenue, 1)) * 100, 1)}%`],
              ],
              caption: "Profit and loss summary",
            },
            note:
              "Gross profit covers direct costs only. Operating profit also pays for running the business, and net profit is what remains after interest and tax. Each one answers a different question.",
          };
        },
      }}
    />
  );
}
