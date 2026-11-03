"use client";

import { useMemo, useState } from "react";
import { Callout, Field, ResultCard, Select, SimpleTable, StatGrid, TextInput, ToolPanel } from "@/components/ui";
import { COOKING_EQUIVALENTS, INGREDIENT_DENSITIES, parseQuantity } from "@/lib/everyday";
import { formatResult } from "@/components/tools/unit-family-tool";

const UNITS = [
  { id: "tsp", label: "Teaspoons (US)", ml: 4.92892159375 },
  { id: "tbsp", label: "Tablespoons (US)", ml: 14.78676478125 },
  { id: "cup", label: "Cups (US)", ml: 236.5882365 },
  { id: "metric-cup", label: "Cups (metric, 250 ml)", ml: 250 },
  { id: "floz", label: "Fluid ounces (US)", ml: 29.5735295625 },
  { id: "ml", label: "Millilitres", ml: 1 },
  { id: "l", label: "Litres", ml: 1000 },
  { id: "pint", label: "Pints (US)", ml: 473.176473 },
  { id: "quart", label: "Quarts (US)", ml: 946.352946 },
];

export default function CookingMeasurementConverter() {
  const [amount, setAmount] = useState("1");
  const [fromId, setFromId] = useState("cup");
  const [ingredient, setIngredient] = useState("flour");

  const quantity = parseQuantity(amount);
  const from = UNITS.find((unit) => unit.id === fromId) ?? UNITS[0];
  const ml = quantity === null ? Number.NaN : quantity * from.ml;
  const density = INGREDIENT_DENSITIES.find((item) => item.id === ingredient) ?? INGREDIENT_DENSITIES[0];
  const grams = density.gramsPerCup ? (ml / 236.5882365) * density.gramsPerCup : Number.NaN;

  const rows = useMemo(
    () => UNITS.map((unit) => [unit.label, Number.isFinite(ml) ? formatResult(ml / unit.ml) : "—"]),
    [ml],
  );

  return (
    <ToolPanel>
      <div className="grid gap-3 sm:grid-cols-[1fr_1fr_1fr]">
        <Field label="Amount" htmlFor="cook-amount" hint="Fractions such as 1 1/2 work." error={quantity === null && amount.trim() ? "Use a number, decimal or fraction." : undefined}>
          <TextInput id="cook-amount" value={amount} onChange={(event) => setAmount(event.target.value)} className="font-mono" invalid={quantity === null && amount.trim().length > 0} />
        </Field>
        <Field label="Unit" htmlFor="cook-unit">
          <Select id="cook-unit" value={fromId} onChange={(event) => setFromId(event.target.value)}>
            {UNITS.map((unit) => (
              <option key={unit.id} value={unit.id}>
                {unit.label}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Ingredient (for weight)" htmlFor="cook-ingredient" hint="A cup of flour is not a cup of honey.">
          <Select id="cook-ingredient" value={ingredient} onChange={(event) => setIngredient(event.target.value)}>
            {INGREDIENT_DENSITIES.map((item) => (
              <option key={item.id} value={item.id}>
                {item.label}
              </option>
            ))}
          </Select>
        </Field>
      </div>

      <div className="mt-6">
        {Number.isFinite(ml) ? (
          <ResultCard
            label={`${amount} × ${from.label}`}
            value={`${formatResult(ml)} ml`}
            sub={`${formatResult(grams)} g of ${density.label.toLowerCase()} at ${density.gramsPerCup} g per cup`}
            tone="brand"
          >
            <StatGrid
              columns={3}
              items={[
                { label: "Millilitres", value: `${formatResult(ml)} ml` },
                { label: "US tablespoons", value: formatResult(ml / 14.78676478125) },
                { label: "Weight", value: `${formatResult(grams)} g` },
              ]}
            />
            <div className="mt-4">
              <SimpleTable head={["Unit", "Same amount"]} rows={rows} caption="Every kitchen volume for the quantity you entered" />
            </div>
          </ResultCard>
        ) : (
          <Callout tone="info">Enter an amount to convert it.</Callout>
        )}
      </div>

      <div className="mt-6">
        <SimpleTable
          head={["Measure", "Equals", "Note"]}
          caption="Kitchen equivalences worth memorising"
          rows={COOKING_EQUIVALENTS.map((item) => [item.from, item.to, item.note])}
        />
      </div>

      <p className="mt-4 text-xs leading-relaxed text-[var(--text-subtle)]">
        Volume-to-weight is where recipes actually break: a US cup holds 236.6 ml, but 236.6 ml of flour weighs about
        125 g while the same volume of honey is 340 g. Spooning flour into a cup can add 20% more than the scoop-and-level
        method, which is why serious recipes give weights. US and imperial fluid ounces also differ by 4%.
      </p>
    </ToolPanel>
  );
}
