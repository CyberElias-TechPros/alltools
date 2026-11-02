"use client";

import { FormTool, num } from "@/components/tools/form-tool";
import { formatCurrency, round } from "@/lib/utils";

export default function BusinessRevenueCalculator() {
  return (
    <FormTool
      spec={{
        columns: 4,
        fields: [
          { kind: "number", id: "price", label: "Average price", value: "45", unit: "$", min: 0, step: 0.01 },
          { kind: "number", id: "units", label: "Units sold", value: "820", min: 0, step: 1 },
          { kind: "number", id: "discount", label: "Discounts given", value: "8", unit: "%", min: 0, max: 100, step: 0.1, optional: true },
          { kind: "number", id: "returns", label: "Returns / refunds", value: "3", unit: "%", min: 0, max: 100, step: 0.1, optional: true },
          { kind: "number", id: "fees", label: "Payment fees", value: "2.9", unit: "%", min: 0, max: 20, step: 0.1, optional: true, hint: "Plus nothing per transaction in this model" },
        ],
        compute: (values) => {
          const price = num(values, "price");
          const units = num(values, "units");
          const discount = num(values, "discount", 0) || 0;
          const returns = num(values, "returns", 0) || 0;
          const fees = num(values, "fees", 0) || 0;
          if (!Number.isFinite(price) || !Number.isFinite(units)) return { error: "Enter a price and a unit count." };
          if (price < 0 || units < 0) return { error: "Price and units cannot be negative." };

          const gross = price * units;
          const afterDiscount = gross * (1 - discount / 100);
          const afterReturns = afterDiscount * (1 - returns / 100);
          const feeAmount = afterReturns * (fees / 100);
          const net = afterReturns - feeAmount;

          return {
            label: "Net revenue",
            value: formatCurrency(net, "USD", 0),
            sub: `${units.toLocaleString()} units at ${formatCurrency(price)} each, after discounts, returns and payment fees.`,
            stats: [
              { label: "Gross revenue", value: formatCurrency(gross, "USD", 0) },
              { label: "Discounts", value: formatCurrency(-(gross - afterDiscount), "USD", 0) },
              { label: "Returns", value: formatCurrency(-(afterDiscount - afterReturns), "USD", 0) },
              { label: "Payment fees", value: formatCurrency(-feeAmount, "USD", 0) },
            ],
            table: {
              head: ["Stage", "Amount", "Realisation"],
              rows: [
                ["Gross", formatCurrency(gross, "USD", 0), "100%"],
                ["After discounts", formatCurrency(afterDiscount, "USD", 0), `${round((afterDiscount / Math.max(gross, 1)) * 100, 1)}%`],
                ["After returns", formatCurrency(afterReturns, "USD", 0), `${round((afterReturns / Math.max(gross, 1)) * 100, 1)}%`],
                ["Net of fees", formatCurrency(net, "USD", 0), `${round((net / Math.max(gross, 1)) * 100, 1)}%`],
              ],
              caption: "Revenue waterfall",
            },
            note:
              "Revenue is reported gross and net in accounting too. This tool compounds the deductions in the order a sale usually experiences them, so each percentage applies to the smaller amount that is left.",
          };
        },
      }}
    />
  );
}
