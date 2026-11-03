"use client";

import { FormTool, num, str } from "@/components/tools/form-tool";
import { formatCurrency, round } from "@/lib/utils";

export default function MarkupCalculator() {
  return (
    <FormTool
      spec={{
        columns: 3,
        fields: [
          { kind: "number", id: "cost", label: "Unit cost", value: "18.40", unit: "$", min: 0, step: 0.01 },
          {
            kind: "select",
            id: "basis",
            label: "I know the",
            value: "markup",
            options: [
              { value: "markup", label: "Markup on cost (%)" },
              { value: "margin", label: "Gross margin on price (%)" },
            ],
          },
          { kind: "number", id: "rate", label: "Rate", value: "60", unit: "%", min: 0, step: 0.1 },
        ],
        compute: (values) => {
          const cost = num(values, "cost");
          const rate = num(values, "rate");
          const basis = str(values, "basis");
          if (!Number.isFinite(cost) || cost <= 0) return { error: "Enter a unit cost greater than zero." };
          if (!Number.isFinite(rate) || rate < 0) return { error: "Enter a rate of zero or more." };

          const margin = basis === "margin" ? Math.min(rate, 99.999) / 100 : null;
          const price =
            margin !== null ? cost / (1 - margin) : cost * (1 + rate / 100);
          const profit = price - cost;
          const grossMargin = price > 0 ? (profit / price) * 100 : 0;
          const markup = cost > 0 ? (profit / cost) * 100 : 0;

          return {
            label: "Selling price",
            value: formatCurrency(price),
            sub: `${formatCurrency(profit)} profit per unit — a ${round(markup, 2)}% markup and a ${round(grossMargin, 2)}% gross margin.`,
            stats: [
              { label: "Unit cost", value: formatCurrency(cost) },
              { label: "Profit per unit", value: formatCurrency(profit) },
              { label: "Markup on cost", value: `${round(markup, 2)}%` },
              { label: "Margin on price", value: `${round(grossMargin, 2)}%` },
            ],
            table: {
              head: ["Quantity", "Revenue", "Cost", "Profit"],
              rows: ["1", "10", "100", "1000"].map((quantity) => {
                const units = Number(quantity);
                return [
                  units.toLocaleString(),
                  formatCurrency(price * units, "USD", 0),
                  formatCurrency(cost * units, "USD", 0),
                  formatCurrency(profit * units, "USD", 0),
                ];
              }),
              caption: "Profit at several volumes",
            },
            note:
              "A 100% markup doubles the cost but earns a 50% margin. Markup is measured against cost; margin is measured against the selling price.",
          };
        },
        footnote: "Prices are shown in US dollars; change the currency in your own copy of the figures if you quote elsewhere.",
      }}
    />
  );
}
