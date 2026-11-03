"use client";

import { FormTool, num } from "@/components/tools/form-tool";
import { formatCurrency, round } from "@/lib/utils";

export default function HourlyToMonthlySalaryConverter() {
  return (
    <FormTool
      spec={{
        columns: 3,
        fields: [
          { kind: "number", id: "hourly", label: "Hourly rate", value: "28.50", unit: "$", min: 0, step: 0.01 },
          { kind: "number", id: "hours", label: "Hours per week", value: "40", unit: "h", min: 1, max: 84, step: 0.5 },
          { kind: "number", id: "weeks", label: "Paid weeks per year", value: "52", min: 1, max: 52, step: 1, hint: "Drop to 48 for unpaid leave" },
          { kind: "number", id: "unpaid", label: "Unpaid weeks off", value: "", min: 0, max: 40, step: 1, optional: true },
        ],
        compute: (values) => {
          const hourly = num(values, "hourly");
          const hours = num(values, "hours");
          const weeks = num(values, "weeks", 52);
          const unpaid = num(values, "unpaid", 0) || 0;
          if (!Number.isFinite(hourly) || !Number.isFinite(hours)) return { error: "Enter the hourly rate and weekly hours." };
          if (hourly < 0 || hours <= 0) return { error: "Use a non-negative rate and more than zero hours." };

          const paidWeeks = Math.max(Math.min(weeks, 52) - unpaid, 1);
          const annual = hourly * hours * paidWeeks;
          const monthly = annual / 12;
          const weekly = hourly * hours;
          const daily = weekly / 5;

          return {
            label: "Monthly salary equivalent",
            value: formatCurrency(monthly),
            sub: `${formatCurrency(hourly)}/hour × ${hours} hours × ${paidWeeks} paid weeks = ${formatCurrency(annual, "USD", 0)} a year.`,
            stats: [
              { label: "Annual", value: formatCurrency(annual, "USD", 0) },
              { label: "Monthly", value: formatCurrency(monthly) },
              { label: "Weekly", value: formatCurrency(weekly) },
              { label: "Daily (5-day week)", value: formatCurrency(daily) },
              { label: "Total hours", value: (hours * paidWeeks).toLocaleString() },
              { label: "Per hour", value: formatCurrency(hourly) },
            ],
            table: {
              head: ["Basis", "Hours", "Pay"],
              rows: [
                ["Hour", "1", formatCurrency(hourly)],
                ["Day", "8", formatCurrency(hourly * 8)],
                ["Week", hours.toFixed(1), formatCurrency(weekly)],
                ["Month", (hours * paidWeeks / 12).toFixed(1), formatCurrency(monthly)],
                ["Year", (hours * paidWeeks).toFixed(0), formatCurrency(annual, "USD", 0)],
              ],
              caption: "Pay at each time scale",
            },
            note:
              "A monthly salary is usually annual ÷ 12, even though months differ in length. Contracting the same hourly rate to 46 paid weeks a year cuts the annual figure by about 12%.",
          };
        },
      }}
    />
  );
}
