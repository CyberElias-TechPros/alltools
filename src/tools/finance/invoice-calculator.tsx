"use client";

import { FormTool, num } from "@/components/tools/form-tool";
import { formatCurrency, round } from "@/lib/utils";

export default function InvoiceCalculator() {
  return (
    <FormTool
      spec={{
        columns: 3,
        fields: [
          { kind: "number", id: "items", label: "Line items", value: "3", min: 1, max: 200, step: 1 },
          { kind: "number", id: "unit", label: "Average unit price", value: "420", unit: "$", min: 0, step: 0.01 },
          { kind: "number", id: "qty", label: "Units per line", value: "2", min: 0, step: 1 },
          { kind: "number", id: "discount", label: "Discount", value: "10", unit: "%", min: 0, max: 100, step: 0.1, optional: true },
          { kind: "number", id: "tax", label: "Tax rate", value: "8.25", unit: "%", min: 0, step: 0.01, optional: true },
          { kind: "number", id: "shipping", label: "Shipping / fees", value: "35", unit: "$", min: 0, step: 0.01, optional: true },
          { kind: "number", id: "paid", label: "Already paid", value: "", unit: "$", min: 0, step: 0.01, optional: true, hint: "Deposit or part payment" },
        ],
        compute: (values) => {
          const items = Math.max(Math.trunc(num(values, "items", 1)), 1);
          const unit = num(values, "unit");
          const qty = num(values, "qty", 1) || 0;
          const discountRate = num(values, "discount", 0) || 0;
          const taxRate = num(values, "tax", 0) || 0;
          const shipping = num(values, "shipping", 0) || 0;
          const paid = num(values, "paid", 0) || 0;
          if (!Number.isFinite(unit) || unit < 0) return { error: "Enter an average unit price of zero or more." };

          const subtotal = items * unit * qty;
          const discount = subtotal * (discountRate / 100);
          const taxable = subtotal - discount + shipping;
          const tax = taxable * (taxRate / 100);
          const total = taxable + tax;
          const due = total - paid;

          return {
            label: "Invoice total",
            value: formatCurrency(total),
            sub:
              due > 0
                ? `${formatCurrency(due)} still due after ${formatCurrency(paid)} paid.`
                : `Paid in full${due < 0 ? ` — ${formatCurrency(-due)} overpaid` : ""}.`,
            stats: [
              { label: "Subtotal", value: formatCurrency(subtotal) },
              { label: "Discount", value: formatCurrency(-discount) },
              { label: "Tax", value: formatCurrency(tax) },
              { label: "Balance due", value: formatCurrency(due) },
            ],
            table: {
              head: ["Line", "Calculation", "Amount"],
              rows: [
                [`${items} items × ${qty} @ ${formatCurrency(unit)}`, `${(items * qty).toLocaleString()} units`, formatCurrency(subtotal)],
                [`Discount ${discountRate}%`, "on subtotal", formatCurrency(-discount)],
                ["Shipping and fees", "not discounted", formatCurrency(shipping)],
                [`Tax ${taxRate}%`, "on subtotal − discount + fees", formatCurrency(tax)],
                ["Total", "", formatCurrency(total)],
                ["Paid", "", formatCurrency(-paid)],
                ["Balance due", "", formatCurrency(due)],
              ],
              caption: "Invoice calculation",
            },
            output: {
              label: "Invoice summary text",
              text: `Invoice summary\n\n${items} item(s) × ${qty} @ ${formatCurrency(unit)}: ${formatCurrency(subtotal)}\nDiscount (${discountRate}%): -${formatCurrency(discount)}\nShipping and fees: ${formatCurrency(shipping)}\nTax (${taxRate}%): ${formatCurrency(tax)}\nTotal: ${formatCurrency(total)}\nPaid: ${formatCurrency(paid)}\nBalance due: ${formatCurrency(due)}`,
            },
            note:
              "Tax is applied after the discount and includes shipping here, which is how most invoices for goods work. Services often tax the whole invoice instead.",
          };
        },
      }}
    />
  );
}
