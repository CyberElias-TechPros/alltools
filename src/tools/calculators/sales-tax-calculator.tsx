"use client";

import { FormTool, bool, num } from "@/components/tools/form-tool";
import { formatCurrency, round } from "@/lib/utils";

export default function SalesTaxCalculator() {
  return (
    <FormTool
      spec={{
        columns: 4,
        fields: [
          { kind: "number", id: "price", label: "Price", value: "249.99", unit: "$", min: 0, step: 0.01, placeholder: "0.00" },
          { kind: "number", id: "rate", label: "Sales tax rate", value: "8.25", unit: "%", min: 0, step: 0.001 },
          { kind: "number", id: "quantity", label: "Quantity", value: "1", min: 1, step: 1 },
          { kind: "toggle", id: "inclusive", label: "Price already includes tax", value: false, hint: "Reverse the calculation to find the tax inside the price" },
        ],
        compute: (values) => {
          const price = num(values, "price");
          const rate = num(values, "rate");
          const quantity = Math.max(Math.trunc(num(values, "quantity", 1)), 1);
          if (!Number.isFinite(price) || price < 0) return { error: "Enter a price of zero or more." };
          if (!Number.isFinite(rate) || rate < 0) return { error: "Enter a tax rate of zero or more." };

          const gross = price * quantity;
          const net = bool(values, "inclusive") ? gross / (1 + rate / 100) : gross;
          const tax = gross - net;
          const total = net + tax;
          const effective = net > 0 ? (tax / net) * 100 : 0;

          return {
            label: "Total with sales tax",
            value: formatCurrency(total),
            sub: `${formatCurrency(net)} before tax + ${formatCurrency(tax)} tax on ${quantity} item${quantity === 1 ? "" : "s"}.`,
            stats: [
              { label: "Subtotal", value: formatCurrency(net) },
              { label: "Sales tax", value: formatCurrency(tax) },
              { label: "Total", value: formatCurrency(total) },
              { label: "Effective rate", value: `${round(effective, 4)}%` },
            ],
            table: {
              head: ["Quantity", "Unit price", "Tax per unit", "Total per line"],
              rows: [
                [
                  quantity.toString(),
                  formatCurrency(price),
                  formatCurrency(tax / quantity),
                  formatCurrency(total),
                ],
              ],
              caption: "Line summary",
            },
            note:
              "Sales tax is normally added at the till on top of the shelf price. If you are quoting a tax-inclusive price, the \"includes tax\" switch splits it back into subtotal and tax.",
          };
        },
        footnote:
          "Rates vary by state, county and city, and some items are exempt. Use the published rate for the delivery address, not a national average.",
      }}
    />
  );
}
