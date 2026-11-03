"use client";

import { FormTool, str } from "@/components/tools/form-tool";
import { modes, parseNumberList } from "@/lib/math";
import { mean, median, standardDeviation } from "@/lib/calc";
import { formatNumber } from "@/lib/utils";

export default function MeanMedianModeCalculator() {
  return (
    <FormTool
      spec={{
        columns: 2,
        fields: [
          {
            kind: "textarea",
            id: "numbers",
            label: "Numbers",
            value: "12, 15, 11, 12, 19, 24, 12, 17, 15",
            placeholder: "Separate with commas, spaces or new lines",
            rows: 6,
            hint: "Any mix of separators works; minus signs and decimals are fine.",
          },
        ],
        compute: (values) => {
          const numbers = parseNumberList(str(values, "numbers"));
          if (numbers.length === 0) return { error: "Add at least one number." };
          const sorted = [...numbers].sort((a, b) => a - b);
          const modeValues = modes(numbers);
          const counts = new Map<number, number>();
          for (const value of numbers) counts.set(value, (counts.get(value) ?? 0) + 1);

          return {
            label: "Mean (average)",
            value: formatNumber(mean(numbers)),
            sub: `${numbers.length} values · median ${formatNumber(median(numbers))} · ${
              modeValues.length === 0 ? "no mode (all values differ)" : `mode ${modeValues.map(formatNumber).join(", ")}`
            }`,
            stats: [
              { label: "Mean", value: formatNumber(mean(numbers)) },
              { label: "Median", value: formatNumber(median(numbers)) },
              { label: "Mode", value: modeValues.length ? modeValues.map(formatNumber).join(", ") : "none" },
              { label: "Range", value: formatNumber(sorted[sorted.length - 1] - sorted[0]) },
              { label: "Population SD", value: formatNumber(standardDeviation(numbers, false)) },
              { label: "Sample SD", value: formatNumber(standardDeviation(numbers, true)) },
              { label: "Smallest", value: formatNumber(sorted[0]) },
              { label: "Largest", value: formatNumber(sorted[sorted.length - 1]) },
            ],
            table: {
              head: ["Value", "Times it appears"],
              rows: [...counts.entries()]
                .sort((a, b) => a[0] - b[0])
                .map(([value, count]) => [formatNumber(value), count.toString()]),
              caption: "Frequency of each value",
            },
            note:
              "Median resists outliers: one very large value pulls the mean up but leaves the median alone. A data set can have several modes, or none.",
          };
        },
        footnote:
          "The population figure divides by n and describes the whole set; the sample figure divides by n − 1 and estimates a wider population.",
      }}
    />
  );
}
