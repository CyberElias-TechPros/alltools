"use client";

import { useMemo, useState } from "react";
import { CopyButton, Field, ResultCard, Segmented, StatGrid, TextInput, ToolPanel } from "@/components/ui";
import { priceForMargin, profitMetrics } from "@/lib/finance";
import { formatCurrency, parseNumber } from "@/lib/utils";

export default function ProfitMarginCalculator() {
  const [mode, setMode] = useState<"cost-price" | "target">("cost-price");
  const [cost, setCost] = useState("60");
  const [price, setPrice] = useState("90");
  const [target, setTarget] = useState("40");

  type MarginData =
    | { error: string }
    | {
        error?: undefined;
        sellingPrice: number;
        profit: number;
        margin: number;
        markup: number;
        target?: number;
      };

  const data: MarginData = useMemo(() => {
    const c = parseNumber(cost);
    if (!Number.isFinite(c) || c <= 0) return { error: "Enter a unit cost greater than zero." };

    if (mode === "target") {
      const t = parseNumber(target);
      if (!Number.isFinite(t) || t < 0 || t >= 100) {
        return { error: "Enter a target margin between 0% and 99%." };
      }
      const suggested = priceForMargin(c, t);
      const metrics = profitMetrics(c, suggested);
      return { sellingPrice: suggested, ...metrics, target: t };
    }

    const p = parseNumber(price);
    if (!Number.isFinite(p) || p <= 0) return { error: "Enter a selling price greater than zero." };
    return { sellingPrice: p, ...profitMetrics(c, p) };
  }, [mode, cost, price, target]);

  const summary =
    data.error === undefined
      ? `Price ${formatCurrency(data.sellingPrice)} · profit ${formatCurrency(data.profit)} · margin ${data.margin.toFixed(2)}% · markup ${data.markup.toFixed(2)}%`
      : "";

  return (
    <ToolPanel>
      <Segmented
        label="What do you want to work out?"
        value={mode}
        onChange={setMode}
        options={[
          { value: "cost-price", label: "Margin from cost & price" },
          { value: "target", label: "Price for a target margin" },
        ]}
      />

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <Field label="Unit cost" htmlFor="pm-cost">
          <TextInput id="pm-cost" inputMode="decimal" value={cost} onChange={(event) => setCost(event.target.value)} />
        </Field>
        {mode === "cost-price" ? (
          <Field label="Selling price" htmlFor="pm-price">
            <TextInput id="pm-price" inputMode="decimal" value={price} onChange={(event) => setPrice(event.target.value)} />
          </Field>
        ) : (
          <Field label="Target margin (%)" htmlFor="pm-target">
            <TextInput id="pm-target" inputMode="decimal" value={target} onChange={(event) => setTarget(event.target.value)} />
          </Field>
        )}
      </div>

      <div className="mt-4">
        {data.error !== undefined ? (
          <ResultCard label="Result" value="—" tone="neutral" sub={data.error} />
        ) : (
          <ResultCard
            label={mode === "target" ? "Recommended selling price" : "Profit margin"}
            value={
              mode === "target"
                ? formatCurrency(data.sellingPrice)
                : `${data.margin.toFixed(2)}%`
            }
            sub={
              mode === "target"
                ? `At a ${data.target}% margin your price must be ${formatCurrency(data.sellingPrice)} to make ${formatCurrency(data.profit)} per unit.`
                : `A ${data.margin.toFixed(2)}% margin is a ${data.markup.toFixed(2)}% markup.`
            }
            actions={<CopyButton text={summary} />}
          >
            <StatGrid
              columns={3}
              items={[
                { label: "Profit per unit", value: formatCurrency(data.profit) },
                { label: "Margin", value: `${data.margin.toFixed(2)}%` },
                { label: "Markup", value: `${data.markup.toFixed(2)}%` },
              ]}
            />
          </ResultCard>
        )}
      </div>

      <p className="mt-3 text-xs text-[var(--text-subtle)]">
        Margin is profit as a share of price; markup is profit as a share of cost. Markup is always
        the larger number, which is why &ldquo;a 50% markup&rdquo; is only a 33.3% margin.
      </p>
    </ToolPanel>
  );
}
