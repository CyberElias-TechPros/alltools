"use client";

import { FormTool, num } from "@/components/tools/form-tool";
import { formatCurrency, round } from "@/lib/utils";

export default function PercentageOfOwnershipCalculator() {
  return (
    <FormTool
      spec={{
        columns: 3,
        fields: [
          { kind: "number", id: "investment", label: "Your investment", value: "50000", unit: "$", min: 0, step: 1000 },
          { kind: "number", id: "valuation", label: "Company value", value: "2000000", unit: "$", min: 0, step: 1000, hint: "Pre-money valuation, before this investment" },
          {
            kind: "select",
            id: "basis",
            label: "Valuation is",
            value: "pre",
            options: [
              { value: "pre", label: "Pre-money (before the investment)" },
              { value: "post", label: "Post-money (after the investment)" },
            ],
          },
          { kind: "number", id: "existing", label: "Existing shares", value: "1000000", min: 0, step: 1000, optional: true, hint: "To convert the percentage into a share count" },
        ],
        compute: (values) => {
          const investment = num(values, "investment");
          const valuation = num(values, "valuation");
          const basis = values["basis"] ?? "pre";
          const existing = num(values, "existing", 0) || 0;
          if (!Number.isFinite(investment) || investment <= 0) return { error: "Enter an investment greater than zero." };
          if (!Number.isFinite(valuation) || valuation <= 0) return { error: "Enter a company value greater than zero." };

          const postMoney = basis === "pre" ? valuation + investment : valuation;
          const percentage = (investment / postMoney) * 100;
          const newShares = existing > 0 && percentage < 100 ? (existing * percentage) / (100 - percentage) : 0;
          const pricePerShare = existing > 0 ? investment / Math.max(newShares, 1) : Number.NaN;

          return {
            label: "Your ownership",
            value: `${round(percentage, 4)}%`,
            sub: `Post-money value ${formatCurrency(postMoney, "USD", 0)}; the investment buys ${round(percentage, 4)}% of the company.`,
            stats: [
              { label: "Ownership", value: `${round(percentage, 4)}%` },
              { label: "Post-money", value: formatCurrency(postMoney, "USD", 0) },
              { label: "Pre-money", value: formatCurrency(postMoney - investment, "USD", 0) },
              { label: "Dilution of founders", value: `${round(percentage, 4)}%` },
              { label: newShares ? "New shares issued" : "Value per point", value: newShares ? Math.round(newShares).toLocaleString() : formatCurrency(postMoney / 100, "USD", 0) },
              { label: "Price per share", value: Number.isFinite(pricePerShare) ? formatCurrency(pricePerShare) : "—" },
            ],
            table: {
              head: ["Investment", "Ownership", "Post-money"],
              rows: [0.5, 1, 2, 3].map((factor) => {
                const amount = investment * factor;
                const post = basis === "pre" ? valuation + amount : valuation;
                return [formatCurrency(amount, "USD", 0), `${round((amount / post) * 100, 3)}%`, formatCurrency(post, "USD", 0)];
              }),
              caption: "Ownership at other cheque sizes",
            },
            note:
              "Investors almost always quote pre-money valuations, but ownership is always a share of the post-money value. Mixing the two is the classic cap-table error: investing 50,000 at a 2,000,000 pre-money buys 2.44%, not 2.5%.",
          };
        },
      }}
    />
  );
}
