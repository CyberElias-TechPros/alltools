"use client";

import { useMemo, useState } from "react";
import { Callout, CopyButton, Field, ResultCard, Segmented, SimpleTable, StatGrid, TextInput, ToolPanel } from "@/components/ui";
import { formatMoney, productPricing } from "@/lib/business";

type Mode = "margin" | "markup" | "price";

export default function ProductPricingCalculator() {
  const [cost, setCost] = useState("24");
  const [mode, setMode] = useState<Mode>("margin");
  const [value, setValue] = useState("60");

  const result = useMemo(() => productPricing({ cost: Number(cost), mode, value: Number(value) }), [cost, mode, value]);
  const text = `Price ${formatMoney(result.price)} · margin ${Number.isFinite(result.margin) ? result.margin.toFixed(1) : "—"}% · markup ${Number.isFinite(result.markup) ? result.markup.toFixed(0) : "—"}%`;

  const valueLabels: Record<Mode, string> = {
    margin: "Target margin %",
    markup: "Markup %",
    price: "Selling price",
  };

  return (
    <ToolPanel>
      <div className="grid gap-3 sm:grid-cols-3">
        <Field label="Unit cost" htmlFor="price-cost" hint="Including packaging, fees and shipping to you.">
          <TextInput id="price-cost" type="number" min={0} step="0.01" value={cost} onChange={(event) => setCost(event.target.value)} className="font-mono" />
        </Field>
        <div className="sm:col-span-2">
          <Segmented
            label="Calculate from"
            value={mode}
            onChange={setMode}
            options={[
              { value: "margin", label: "Margin" },
              { value: "markup", label: "Markup" },
              { value: "price", label: "Set price" },
            ]}
          />
        </div>
        <Field label={valueLabels[mode]} htmlFor="price-value">
          <TextInput id="price-value" type="number" min={0} step="0.01" value={value} onChange={(event) => setValue(event.target.value)} className="font-mono" />
        </Field>
      </div>

      <div className="mt-6">
        <ResultCard
          label="Selling price"
          value={formatMoney(result.price)}
          sub={`${formatMoney(result.profit)} profit per unit · margin ${Number.isFinite(result.margin) ? `${result.margin.toFixed(1)}%` : "—"}`}
          tone="brand"
          actions={<CopyButton text={text} label="Copy" />}
        >
          <StatGrid
            columns={3}
            items={[
              { label: "Gross margin", value: Number.isFinite(result.margin) ? `${result.margin.toFixed(1)}%` : "—" },
              { label: "Markup", value: Number.isFinite(result.markup) ? `${result.markup.toFixed(0)}%` : "—" },
              { label: "Profit per unit", value: formatMoney(result.profit) },
            ]}
          />
          <div className="mt-4">
            <SimpleTable
              head={["Cost", "Price", "Margin"]}
              caption="What the same margin looks like across price points"
              rows={[0.8, 1, 1.25, 1.5].map((multiple) => {
                const scaled = productPricing({ cost: Number(cost) * multiple, mode, value: Number(value) });
                return [formatMoney(Number(cost) * multiple), formatMoney(scaled.price), Number.isFinite(scaled.margin) ? `${scaled.margin.toFixed(1)}%` : "—"];
              })}
            />
          </div>
        </ResultCard>
      </div>

      {result.issues.map((issue) => (
        <Callout key={issue} tone="warning">
          {issue}
        </Callout>
      ))}

      <Callout tone="info" title="Margin and markup are not interchangeable">
        A 50% markup on a 40 cost gives 60 — a 33% margin. Confusing the two is how businesses end up profitable on
        paper and short of cash, because payment fees and returns are charged on the price, not the cost.
      </Callout>

      <p className="mt-4 text-xs leading-relaxed text-[var(--text-subtle)]">
        Add payment processing (typically 1.5–4%), marketplace commission, fulfilment and a returns allowance to the unit
        cost before setting a price — otherwise the margin you calculate is not the margin you keep.
      </p>
    </ToolPanel>
  );
}
