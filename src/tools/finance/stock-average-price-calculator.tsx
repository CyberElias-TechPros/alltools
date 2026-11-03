"use client";

import { FormTool, num } from "@/components/tools/form-tool";
import { averageSharePrice } from "@/lib/finance";
import { formatCurrency, round } from "@/lib/utils";

export default function StockAveragePriceCalculator() {
  return (
    <FormTool
      spec={{
        columns: 4,
        fields: [
          { kind: "number", id: "s1", label: "First purchase: shares", value: "20", min: 0, step: 1 },
          { kind: "number", id: "p1", label: "First price", value: "140", unit: "$", min: 0, step: 0.01 },
          { kind: "number", id: "s2", label: "Second purchase: shares", value: "15", min: 0, step: 1 },
          { kind: "number", id: "p2", label: "Second price", value: "112", unit: "$", min: 0, step: 0.01 },
          { kind: "number", id: "s3", label: "Third purchase: shares", value: "", min: 0, step: 1, optional: true },
          { kind: "number", id: "p3", label: "Third price", value: "", unit: "$", min: 0, step: 0.01, optional: true },
          { kind: "number", id: "current", label: "Current price", value: "128", unit: "$", min: 0, step: 0.01, optional: true },
        ],
        compute: (values) => {
          const purchases = [
            { shares: num(values, "s1", 0) || 0, price: num(values, "p1", 0) || 0 },
            { shares: num(values, "s2", 0) || 0, price: num(values, "p2", 0) || 0 },
            { shares: num(values, "s3", 0) || 0, price: num(values, "p3", 0) || 0 },
          ].filter((item) => item.shares > 0 && item.price > 0);
          if (purchases.length === 0) return { error: "Enter at least one purchase with shares and a price." };
          for (const item of purchases) {
            if (item.shares < 0 || item.price < 0) return { error: "Shares and prices cannot be negative." };
          }

          const result = averageSharePrice(purchases);
          const current = num(values, "current");
          const marketValue = Number.isFinite(current) ? current * result.shares : null;
          const gain = marketValue !== null ? marketValue - result.cost : null;

          return {
            label: "Average cost per share",
            value: formatCurrency(result.average),
            sub: `${result.shares.toLocaleString()} shares for ${formatCurrency(result.cost, "USD", 0)}${gain !== null ? `, now worth ${formatCurrency(marketValue as number, "USD", 0)} (${gain >= 0 ? "+" : ""}${formatCurrency(gain)})` : ""}.`,
            stats: [
              { label: "Shares", value: result.shares.toLocaleString() },
              { label: "Total cost", value: formatCurrency(result.cost, "USD", 0) },
              { label: "Average price", value: formatCurrency(result.average) },
              { label: gain !== null ? "Unrealised P/L" : "Purchases", value: gain !== null ? `${gain >= 0 ? "+" : ""}${formatCurrency(gain)}` : purchases.length.toString() },
              { label: gain !== null ? "Return" : "Cost per share", value: gain !== null ? `${round((gain / result.cost) * 100, 2)}%` : formatCurrency(result.average) },
              { label: "Break-even", value: formatCurrency(result.average) },
            ],
            table: {
              head: ["Purchase", "Shares", "Price", "Cost", "Weight"],
              rows: purchases.map((item, index) => [
                `#${index + 1}`,
                item.shares.toLocaleString(),
                formatCurrency(item.price),
                formatCurrency(item.shares * item.price),
                `${round(((item.shares * item.price) / result.cost) * 100, 1)}%`,
              ]),
              caption: "Purchases",
            },
            note:
              "The average is cost-weighted, not a plain average of the prices: buying more shares at a low price pulls the average down more than buying a few. Fees and taxes are excluded.",
          };
        },
      }}
    />
  );
}
