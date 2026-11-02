"use client";

import { useMemo, useState } from "react";
import { Callout, Field, SimpleTable, TextInput, ToolPanel } from "@/components/ui";
import { ModeCard, ModeHub, ModeResult } from "@/components/tools/mode-hub";
import { formatMoney, productPricing } from "@/lib/business";

const pct = (value: number, digits = 1) => (Number.isFinite(value) ? `${value.toFixed(digits)}%` : "—");

/**
 * Three questions, one cost base: what should I charge for a target margin, what
 * should I charge for a markup, and what margin am I making at a fixed price.
 */
export default function ProductPricingCalculator() {
  const [cost, setCost] = useState("24");
  const [marginInput, setMarginInput] = useState("60");
  const [markupInput, setMarkupInput] = useState("60");
  const [priceInput, setPriceInput] = useState("60");

  const costValue = Number(cost);
  const marginValue = Number(marginInput);
  const markupValue = Number(markupInput);
  const priceValue = Number(priceInput);

  const fromMargin = useMemo(
    () => productPricing({ cost: costValue, mode: "margin", value: marginValue }),
    [costValue, marginValue],
  );
  const fromMarkup = useMemo(
    () => productPricing({ cost: costValue, mode: "markup", value: markupValue }),
    [costValue, markupValue],
  );
  const fromPrice = useMemo(
    () => productPricing({ cost: costValue, mode: "price", value: priceValue }),
    [costValue, priceValue],
  );

  const issues = fromMargin.issues.length ? fromMargin.issues : fromPrice.issues;

  return (
    <ToolPanel>
      <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface-muted)]/45 p-4 sm:p-5">
        <div className="grid gap-3 sm:grid-cols-[14rem_1fr] sm:items-end">
          <Field
            label="Unit cost"
            htmlFor="price-cost"
            hint="Everything it costs you to put one unit in a customer's hands."
          >
            <TextInput
              id="price-cost"
              inputMode="decimal"
              value={cost}
              onChange={(event) => setCost(event.target.value)}
              className="font-mono"
            />
          </Field>
          <p className="pb-1 text-xs leading-relaxed text-[var(--text-subtle)]">
            One cost, three answers below — each card keeps its own numbers, so you can compare a
            60% margin against a 60% markup without switching modes.
          </p>
        </div>
      </div>

      <div className="mt-4">
        <ModeHub columns={3}>
          <ModeCard title="Price from margin" hint="The share of the sale price you keep." badge="Margin">
            <Field label="Target margin (%)" htmlFor="price-margin">
              <TextInput
                id="price-margin"
                inputMode="decimal"
                value={marginInput}
                onChange={(event) => setMarginInput(event.target.value)}
                className="font-mono"
              />
            </Field>
            <ModeResult
              label="Selling price"
              value={formatMoney(fromMargin.price)}
              detail={`Profit ${formatMoney(fromMargin.profit)} · markup ${pct(fromMargin.markup, 0)}`}
            />
          </ModeCard>

          <ModeCard title="Price from markup" hint="The percentage added on top of cost." badge="Markup">
            <Field label="Markup on cost (%)" htmlFor="price-markup">
              <TextInput
                id="price-markup"
                inputMode="decimal"
                value={markupInput}
                onChange={(event) => setMarkupInput(event.target.value)}
                className="font-mono"
              />
            </Field>
            <ModeResult
              label="Selling price"
              value={formatMoney(fromMarkup.price)}
              detail={`Profit ${formatMoney(fromMarkup.profit)} · margin ${pct(fromMarkup.margin)}`}
            />
          </ModeCard>

          <ModeCard title="Margin at a price" hint="Work backwards from what you charge." badge="Fixed price">
            <Field label="Selling price" htmlFor="price-fixed">
              <TextInput
                id="price-fixed"
                inputMode="decimal"
                value={priceInput}
                onChange={(event) => setPriceInput(event.target.value)}
                className="font-mono"
              />
            </Field>
            <ModeResult
              label="Gross margin"
              value={pct(fromPrice.margin)}
              detail={`Markup ${pct(fromPrice.markup, 0)} · profit ${formatMoney(fromPrice.profit)}`}
            />
          </ModeCard>
        </ModeHub>
      </div>

      <div className="mt-5">
        <SimpleTable
          head={["Cost", "Price at 60% margin", "Margin at 60% price"]}
          caption={`How the same numbers move when unit cost changes`}
          rows={[0.8, 1, 1.25, 1.5].map((multiple) => {
            const scaledCost = costValue * multiple;
            const scaled = productPricing({ cost: scaledCost, mode: "margin", value: marginValue });
            const fixed = productPricing({ cost: scaledCost, mode: "price", value: priceValue });
            return [formatMoney(scaledCost), formatMoney(scaled.price), pct(fixed.margin)];
          })}
        />
      </div>

      {issues.map((issue) => (
        <div key={issue} className="mt-3">
          <Callout tone="warning">{issue}</Callout>
        </div>
      ))}

      <p className="mt-4 text-xs leading-relaxed text-[var(--text-subtle)]">
        Margin is profit divided by price; markup is profit divided by cost. A 60% markup is only a
        37.5% margin, which is why the two numbers never match. Use margin for pricing decisions and
        markup for quoting, and keep card fees and shipping inside the unit cost.
      </p>
    </ToolPanel>
  );
}
