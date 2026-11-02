"use client";

import { FormTool, num } from "@/components/tools/form-tool";
import { monthlyPayment } from "@/lib/finance";
import { formatCurrency, round } from "@/lib/utils";

interface Payoff {
  months: number;
  interest: number;
  total: number;
}

function simulate(balance: number, rate: number, payment: number): Payoff {
  let remaining = balance;
  let interest = 0;
  let months = 0;
  const monthlyRate = rate / 100 / 12;
  while (remaining > 0.005 && months < 1200) {
    const charged = remaining * monthlyRate;
    const principal = payment - charged;
    if (principal <= 0) return { months: Number.POSITIVE_INFINITY, interest: Number.NaN, total: Number.NaN };
    remaining -= principal;
    interest += charged;
    months += 1;
  }
  return { months, interest: round(interest, 2), total: round(balance + interest, 2) };
}

export default function DebtPayoffCalculator() {
  return (
    <FormTool
      spec={{
        columns: 4,
        fields: [
          { kind: "number", id: "balance", label: "Balance owed", value: "9000", unit: "$", min: 0, step: 100 },
          { kind: "number", id: "rate", label: "Interest rate", value: "19.9", unit: "%", min: 0, max: 60, step: 0.01, hint: "Card APR" },
          { kind: "number", id: "payment", label: "Monthly payment", value: "300", unit: "$", min: 0, step: 10 },
          { kind: "number", id: "extra", label: "Extra each month", value: "", unit: "$", min: 0, step: 10, optional: true },
        ],
        compute: (values) => {
          const balance = num(values, "balance");
          const rate = num(values, "rate");
          const payment = num(values, "payment");
          const extra = num(values, "extra", 0) || 0;
          if (![balance, rate, payment].every(Number.isFinite)) return { error: "Enter the balance, rate and payment." };
          if (balance <= 0) return { error: "Enter a balance greater than zero." };
          if (payment <= 0) return { error: "Enter a monthly payment greater than zero." };

          const base = simulate(balance, rate, payment);
          if (!Number.isFinite(base.months)) {
            return { error: `A payment of ${formatCurrency(payment)} does not cover the ${formatCurrency((balance * rate) / 1200)} of monthly interest, so the balance never falls. Increase the payment.` };
          }
          const faster = simulate(balance, rate, payment + extra);
          const minimum = monthlyPayment(balance, rate, 5);

          return {
            label: "Debt-free in",
            value: `${base.months} month${base.months === 1 ? "" : "s"}`,
            sub: `That is ${Math.floor(base.months / 12)} years and ${base.months % 12} months, with ${formatCurrency(base.interest)} of interest.`,
            stats: [
              { label: "Months to clear", value: base.months.toString() },
              { label: "Interest paid", value: formatCurrency(base.interest) },
              { label: "Total paid", value: formatCurrency(base.total, "USD", 0) },
              { label: "With extra", value: `${faster.months} months` },
              { label: "Interest saved", value: formatCurrency(base.interest - faster.interest) },
              { label: "5-year payment", value: formatCurrency(minimum) },
            ],
            table: {
              head: ["Monthly payment", "Months", "Interest"],
              rows: [payment, payment + 50, payment + 100, payment + 250, payment + 500].map((amount) => {
                const scenario = simulate(balance, rate, amount);
                return [
                  formatCurrency(amount),
                  Number.isFinite(scenario.months) ? scenario.months.toString() : "never",
                  Number.isFinite(scenario.interest) ? formatCurrency(scenario.interest) : "—",
                ];
              }),
              caption: "How payment size changes the term",
            },
            note:
              "Small extra payments do disproportionate work at high interest rates: everything above the interest charge goes straight to principal, which then charges less interest next month. Always check whether your lender charges early-payment fees.",
          };
        },
      }}
    />
  );
}
