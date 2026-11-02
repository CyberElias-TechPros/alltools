"use client";

import { useMemo, useState } from "react";
import { CopyButton, Field, TextInput, ToolPanel } from "@/components/ui";
import { ModeCard, ModeHub, ModeResult } from "@/components/tools/mode-hub";
import { priceForMargin, profitMetrics } from "@/lib/finance";
import { formatCurrency, parseNumber } from "@/lib/utils";

export default function ProfitMarginCalculator() {
  const [cost, setCost] = useState("60");
  const [price, setPrice] = useState("90");
  const [target, setTarget] = useState("40");

  const fromPrice = useMemo(() => {
    const c = parseNumber(cost);
    const p = parseNumber(price);
    if (!Number.isFinite(c) || c <= 0) return { error: "Enter a unit cost greater than zero." };
    if (!Number.isFinite(p) || p <= 0) return { error: "Enter a selling price greater than zero." };
    return { ...profitMetrics(c, p), sellingPrice: p };
  }, [cost, price]);

  const fromTarget = useMemo(() => {
    const c = parseNumber(cost);
    const t = parseNumber(target);
    if (!Number.isFinite(c) || c <= 0) return { error: "Enter a unit cost greater than zero." };
    if (!Number.isFinite(t) || t < 0 || t >= 100) return { error: "Enter a target margin between 0% and 99%." };
    const suggested = priceForMargin(c, t);
    return { ...profitMetrics(c, suggested), sellingPrice: suggested, target: t };
  }, [cost, target]);

  return (
    <ToolPanel>
      <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface-muted)]/45 p-4 sm:p-5">
        <div className="grid gap-3 sm:grid-cols-[14rem_1fr] sm:items-end">
          <Field label="Unit cost" htmlFor="pm-cost" hint="What one unit costs you, all in.">
            <TextInput
              id="pm-cost"
              inputMode="decimal"
              value={cost}
              onChange={(event) => setCost(event.target.value)}
              className="font-mono"
            />
          </Field>
          <p className="pb-1 text-xs leading-relaxed text-[var(--text-subtle)]">
            One cost, both directions: what margin a price gives you, and what price a target margin
            needs. The two cards are live at the same time.
          </p>
        </div>
      </div>

      <div className="mt-4">
        <ModeHub columns={2}>
          <ModeCard title="Margin from cost & price" hint="The percentage you actually keep." badge="Margin">
            <Field label="Selling price" htmlFor="pm-price">
              <TextInput
                id="pm-price"
                inputMode="decimal"
                value={price}
                onChange={(event) => setPrice(event.target.value)}
                className="font-mono"
              />
            </Field>
            <ModeResult
              label="Profit margin"
              value={"margin" in fromPrice ? `${fromPrice.margin.toFixed(2)}%` : "—"}
              detail={
                "margin" in fromPrice
                  ? `${formatCurrency(fromPrice.profit)} profit per unit · markup ${fromPrice.markup.toFixed(2)}%`
                  : undefined
              }
              error={"error" in fromPrice ? fromPrice.error : undefined}
            />
            {"margin" in fromPrice ? (
              <div className="mt-2">
                <CopyButton
                  text={`Price ${formatCurrency(fromPrice.sellingPrice)} · profit ${formatCurrency(fromPrice.profit)} · margin ${fromPrice.margin.toFixed(2)}% · markup ${fromPrice.markup.toFixed(2)}%`}
                  label="Copy result"
                />
              </div>
            ) : null}
          </ModeCard>

          <ModeCard title="Price for a target margin" hint="Work backwards to the price you need." badge="Target">
            <Field label="Target margin (%)" htmlFor="pm-target">
              <TextInput
                id="pm-target"
                inputMode="decimal"
                value={target}
                onChange={(event) => setTarget(event.target.value)}
                className="font-mono"
              />
            </Field>
            <ModeResult
              label="Recommended selling price"
              value={"sellingPrice" in fromTarget ? formatCurrency(fromTarget.sellingPrice) : "—"}
              detail={
                "sellingPrice" in fromTarget
                  ? `${formatCurrency(fromTarget.profit)} profit per unit · markup ${fromTarget.markup.toFixed(2)}%`
                  : undefined
              }
              error={"error" in fromTarget ? fromTarget.error : undefined}
            />
            {"sellingPrice" in fromTarget ? (
              <div className="mt-2">
                <CopyButton
                  text={`Price ${formatCurrency(fromTarget.sellingPrice)} · profit ${formatCurrency(fromTarget.profit)} · margin ${fromTarget.margin.toFixed(2)}% · markup ${fromTarget.markup.toFixed(2)}%`}
                  label="Copy result"
                />
              </div>
            ) : null}
          </ModeCard>
        </ModeHub>
      </div>

      <p className="mt-3 text-xs text-[var(--text-subtle)]">
        Margin is profit as a share of price; markup is profit as a share of cost. Markup is always
        the larger number, which is why &ldquo;a 50% markup&rdquo; is only a 33.3% margin.
      </p>
    </ToolPanel>
  );
}
