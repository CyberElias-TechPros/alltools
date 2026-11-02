"use client";

import { FormTool, num } from "@/components/tools/form-tool";
import { rentalYield } from "@/lib/finance";
import { formatCurrency, round } from "@/lib/utils";

export default function RentalYieldCalculator() {
  return (
    <FormTool
      spec={{
        columns: 3,
        fields: [
          { kind: "number", id: "value", label: "Property value", value: "320000", unit: "$", min: 0, step: 1000 },
          { kind: "number", id: "rent", label: "Monthly rent", value: "1950", unit: "$", min: 0, step: 25 },
          { kind: "number", id: "costs", label: "Annual running costs", value: "7200", unit: "$/yr", min: 0, step: 100, hint: "Tax, insurance, maintenance, management, voids" },
          { kind: "number", id: "mortgage", label: "Annual mortgage payment", value: "", unit: "$/yr", min: 0, step: 100, optional: true, hint: "For cash flow, not for yield" },
        ],
        compute: (values) => {
          const value = num(values, "value");
          const rent = num(values, "rent");
          const costs = num(values, "costs", 0) || 0;
          const mortgage = num(values, "mortgage", 0) || 0;
          if (!Number.isFinite(value) || value <= 0) return { error: "Enter the property value." };
          if (!Number.isFinite(rent) || rent < 0) return { error: "Enter the monthly rent." };

          const result = rentalYield(value, rent, costs);
          const cashFlow = result.annualRent - costs - mortgage;

          return {
            label: "Gross yield",
            value: `${result.gross}%`,
            sub: `Net yield after running costs is ${result.net}%. ${formatCurrency(result.annualRent, "USD", 0)} rent against ${formatCurrency(costs, "USD", 0)} of costs.`,
            stats: [
              { label: "Gross yield", value: `${result.gross}%` },
              { label: "Net yield", value: `${result.net}%` },
              { label: "Annual rent", value: formatCurrency(result.annualRent, "USD", 0) },
              { label: "Net income", value: formatCurrency(result.annualRent - costs, "USD", 0) },
              { label: "Monthly cash flow", value: formatCurrency(cashFlow / 12) },
              { label: "Price-to-rent", value: `${round(value / (rent * 12), 1)}×` },
            ],
            table: {
              head: ["Monthly rent", "Gross yield", "Net yield"],
              rows: [-200, -100, 0, 100, 200].map((delta) => {
                const scenario = rentalYield(value, rent + delta, costs);
                return [
                  formatCurrency(Math.max(rent + delta, 0)),
                  `${scenario.gross}%`,
                  `${scenario.net}%`,
                ];
              }),
              caption: "Yield sensitivity to rent",
            },
            note:
              "A price-to-rent ratio above about 20 means buying is expensive relative to renting on pure income terms. Gross yield ignores voids and repairs, which is why serious investors judge on net yield.",
          };
        },
      }}
    />
  );
}
