"use client";

import { FormTool, num } from "@/components/tools/form-tool";
import { buildLoanSchedule } from "@/lib/finance";
import { formatCurrency } from "@/lib/utils";

export default function MortgageCalculator() {
  return (
    <FormTool
      spec={{
        columns: 4,
        fields: [
          { kind: "number", id: "price", label: "Home price", value: "420000", unit: "$", min: 0, step: 1000 },
          { kind: "number", id: "down", label: "Down payment", value: "84000", unit: "$", min: 0, step: 1000, hint: "20% of the price avoids mortgage insurance in the US" },
          { kind: "number", id: "rate", label: "Interest rate", value: "6.4", unit: "%", min: 0, max: 30, step: 0.01 },
          { kind: "number", id: "years", label: "Term", value: "30", unit: "yrs", min: 1, max: 40, step: 1 },
          { kind: "number", id: "tax", label: "Property tax", value: "4800", unit: "$/yr", min: 0, step: 100, optional: true },
          { kind: "number", id: "insurance", label: "Home insurance", value: "1500", unit: "$/yr", min: 0, step: 50, optional: true },
          { kind: "number", id: "hoa", label: "HOA / service charge", value: "", unit: "$/mo", min: 0, step: 10, optional: true },
        ],
        compute: (values) => {
          const price = num(values, "price");
          const down = num(values, "down", 0) || 0;
          const rate = num(values, "rate");
          const years = num(values, "years");
          const tax = num(values, "tax", 0) || 0;
          const insurance = num(values, "insurance", 0) || 0;
          const hoa = num(values, "hoa", 0) || 0;
          if (!Number.isFinite(price) || price <= 0) return { error: "Enter the home price." };
          if (down >= price) return { error: "The down payment covers the whole price — there is no mortgage to calculate." };
          if (!Number.isFinite(rate) || !Number.isFinite(years)) return { error: "Enter the interest rate and term." };

          const principal = price - down;
          const loan = buildLoanSchedule({ principal, annualRate: rate, years });
          if (!Number.isFinite(loan.monthlyPayment)) return { error: "Those terms could not be calculated." };

          const monthlyExtras = tax / 12 + insurance / 12 + hoa;
          const allIn = loan.monthlyPayment + monthlyExtras;

          return {
            label: "Monthly payment",
            value: formatCurrency(allIn),
            sub: `${formatCurrency(loan.monthlyPayment)} principal and interest${monthlyExtras ? `, plus ${formatCurrency(monthlyExtras)} for tax, insurance and fees` : ""}. Borrowing ${formatCurrency(principal, "USD", 0)} at ${rate}% for ${years} years.`,
            stats: [
              { label: "Loan amount", value: formatCurrency(principal, "USD", 0) },
              { label: "Principal + interest", value: formatCurrency(loan.monthlyPayment) },
              { label: "Total interest", value: formatCurrency(loan.totalInterest, "USD", 0) },
              { label: "Total paid", value: formatCurrency(loan.totalPaid + down, "USD", 0) },
              { label: "Loan-to-value", value: `${((principal / price) * 100).toFixed(1)}%` },
              { label: "Paid off in", value: `${Math.ceil(loan.months / 12)} years` },
            ],
            table: {
              head: ["Period", "Principal and interest", "Balance after"],
              rows: [12, 60, 120, 180, 240, 300, loan.months]
                .filter((month) => month <= loan.months)
                .filter((month, index, list) => list.indexOf(month) === index)
                .map((month) => {
                  const row = loan.schedule[Math.min(month - 1, loan.schedule.length - 1)];
                  return [`Year ${Math.ceil(month / 12)}`, formatCurrency(row.payment), formatCurrency(row.balance, "USD", 0)];
                }),
              caption: "Balance at milestones",
            },
            note:
              "Early payments are mostly interest: in the first year of a 30-year loan at 6.4%, less than a fifth of the payment reduces the balance. Additional monthly payments shorten the term sharply — try the Loan Repayment Calculator.",
          };
        },
        footnote: "Excludes mortgage insurance, closing costs and any introductory rate period. Not a lending offer.",
      }}
    />
  );
}
