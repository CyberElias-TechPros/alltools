"use client";

import { useMemo, useState } from "react";
import { CopyButton, Field, ResultCard, StatGrid, TextInput, ToolPanel } from "@/components/ui";
import { formatCurrency, parseNumber, round } from "@/lib/utils";

export default function DiscountCalculator() {
  const [price, setPrice] = useState("120");
  const [discount, setDiscount] = useState("35");
  const [second, setSecond] = useState("");
  const [tax, setTax] = useState("");

  const data = useMemo(() => {
    const p = parseNumber(price);
    const d = parseNumber(discount);
    if (!Number.isFinite(p) || p < 0) return null;
    if (!Number.isFinite(d) || d < 0) return null;

    const d2 = parseNumber(second);
    const taxRate = parseNumber(tax);
    const afterFirst = p * (1 - Math.min(d, 100) / 100);
    const afterSecond = Number.isFinite(d2) ? afterFirst * (1 - Math.min(Math.max(d2, 0), 100) / 100) : afterFirst;
    const final = Number.isFinite(taxRate) ? afterSecond * (1 + taxRate / 100) : afterSecond;
    const saved = p - afterSecond;
    const effective = p > 0 ? (saved / p) * 100 : 0;

    return {
      final: round(final, 2),
      saved: round(saved, 2),
      effective: round(effective, 4),
      taxAmount: Number.isFinite(taxRate) ? round(afterSecond * (taxRate / 100), 2) : 0,
    };
  }, [price, discount, second, tax]);

  const summary = data
    ? `Final price ${formatCurrency(data.final)} · saved ${formatCurrency(data.saved)} (${data.effective}% off)`
    : "";

  return (
    <ToolPanel>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Field label="Original price" htmlFor="dc-price">
          <TextInput
            id="dc-price"
            inputMode="decimal"
            value={price}
            onChange={(event) => setPrice(event.target.value)}
          />
        </Field>
        <Field label="Discount (%)" htmlFor="dc-discount">
          <TextInput
            id="dc-discount"
            inputMode="decimal"
            value={discount}
            onChange={(event) => setDiscount(event.target.value)}
          />
        </Field>
        <Field label="Second discount" htmlFor="dc-second" optional hint="Applied after the first">
          <TextInput
            id="dc-second"
            inputMode="decimal"
            value={second}
            onChange={(event) => setSecond(event.target.value)}
            placeholder="e.g. 10"
          />
        </Field>
        <Field label="Tax after discount" htmlFor="dc-tax" optional hint="Leave blank for none">
          <TextInput
            id="dc-tax"
            inputMode="decimal"
            value={tax}
            onChange={(event) => setTax(event.target.value)}
            placeholder="e.g. 20"
          />
        </Field>
      </div>

      <div className="mt-4">
        {data ? (
          <ResultCard
            label="You pay"
            value={formatCurrency(data.final)}
            sub={`You save ${formatCurrency(data.saved)} — an effective ${data.effective}% off`}
            actions={<CopyButton text={summary} />}
          >
            <StatGrid
              columns={3}
              items={[
                { label: "Saved", value: formatCurrency(data.saved) },
                { label: "Effective discount", value: `${data.effective}%` },
                { label: "Tax added", value: formatCurrency(data.taxAmount) },
              ]}
            />
          </ResultCard>
        ) : (
          <ResultCard label="You pay" value="—" tone="neutral" sub="Enter a price and a discount." />
        )}
      </div>

      <p className="mt-3 text-xs text-[var(--text-subtle)]">
        Two 20% discounts equal 36% off, not 40% — the second discount applies to the reduced
        price.
      </p>
    </ToolPanel>
  );
}
