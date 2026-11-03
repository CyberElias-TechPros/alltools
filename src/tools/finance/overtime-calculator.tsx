"use client";

import { FormTool, num } from "@/components/tools/form-tool";
import { overtimePay } from "@/lib/finance";
import { formatCurrency, round } from "@/lib/utils";

export default function OvertimeCalculator() {
  return (
    <FormTool
      spec={{
        columns: 4,
        fields: [
          { kind: "number", id: "hourly", label: "Hourly rate", value: "22", unit: "$", min: 0, step: 0.01 },
          { kind: "number", id: "regular", label: "Regular hours", value: "40", unit: "h", min: 0, max: 200, step: 0.25 },
          { kind: "number", id: "overtime", label: "Overtime hours", value: "6", unit: "h", min: 0, max: 100, step: 0.25 },
          { kind: "number", id: "multiplier", label: "Overtime multiplier", value: "1.5", step: 0.25, min: 1, max: 3, hint: "1.5 is time-and-a-half, 2 is double time" },
        ],
        compute: (values) => {
          const hourly = num(values, "hourly");
          const regular = num(values, "regular");
          const overtime = num(values, "overtime");
          const multiplier = num(values, "multiplier", 1.5);
          if (![hourly, regular, overtime, multiplier].every(Number.isFinite)) return { error: "Fill in the rate and hours." };
          if (hourly < 0 || regular < 0 || overtime < 0) return { error: "Rates and hours cannot be negative." };
          if (multiplier < 1) return { error: "Overtime is normally paid at 1× or more." };

          const result = overtimePay(hourly, regular, overtime, multiplier);

          return {
            label: "Total pay",
            value: formatCurrency(result.total),
            sub: `${formatCurrency(result.regularPay)} for ${regular} regular hours plus ${formatCurrency(result.overtimePay)} for ${overtime} hours at ${multiplier}×.`,
            stats: [
              { label: "Regular pay", value: formatCurrency(result.regularPay) },
              { label: "Overtime pay", value: formatCurrency(result.overtimePay) },
              { label: "Total hours", value: (regular + overtime).toLocaleString() },
              { label: "Blended hourly", value: formatCurrency(result.blendedRate) },
            ],
            table: {
              head: ["Overtime multiplier", "Overtime pay", "Total"],
              rows: [1.25, 1.5, 1.75, 2].map((factor) => {
                const pay = overtimePay(hourly, regular, overtime, factor);
                return [`${factor}×`, formatCurrency(pay.overtimePay), formatCurrency(pay.total)];
              }),
              caption: "Pay at common multipliers",
            },
            note:
              "In many jurisdictions overtime starts after 40 hours in a week, but rules vary by country and contract. Check which hours actually qualify before relying on the figure.",
          };
        },
      }}
    />
  );
}
