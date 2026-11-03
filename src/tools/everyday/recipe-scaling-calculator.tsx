"use client";

import { useMemo, useState } from "react";
import { Button, Callout, CopyButton, DownloadButton, Field, ResultCard, SimpleTable, StatGrid, TextInput, ToolPanel } from "@/components/ui";
import { parseQuantity, scaleRecipe, type RecipeLine } from "@/lib/everyday";

interface Row extends RecipeLine {
  id: number;
}

const SEED: Row[] = [
  { id: 1, quantity: "1 1/2", unit: "cups", name: "plain flour" },
  { id: 2, quantity: "2", unit: "", name: "eggs" },
  { id: 3, quantity: "3/4", unit: "cup", name: "milk" },
  { id: 4, quantity: "1", unit: "tsp", name: "baking powder" },
  { id: 5, quantity: "1/2", unit: "tsp", name: "salt" },
];

export default function RecipeScalingCalculator() {
  const [rows, setRows] = useState<Row[]>(SEED);
  const [fromServings, setFromServings] = useState("4");
  const [toServings, setToServings] = useState("6");
  const [nextId, setNextId] = useState(6);

  const result = useMemo(
    () =>
      scaleRecipe({
        lines: rows.map((row) => ({ quantity: row.quantity, unit: row.unit, name: row.name })),
        fromServings: Number(fromServings),
        toServings: Number(toServings),
      }),
    [rows, fromServings, toServings],
  );

  const text = result.lines.map((line) => [line.quantity, line.unit, line.name].filter(Boolean).join(" ")).join("\n");
  const update = (id: number, patch: Partial<Row>) => setRows((current) => current.map((row) => (row.id === id ? { ...row, ...patch } : row)));

  return (
    <ToolPanel>
      <div className="grid gap-3 sm:grid-cols-3">
        <Field label="Recipe serves" htmlFor="scale-from">
          <TextInput id="scale-from" type="number" min={1} value={fromServings} onChange={(event) => setFromServings(event.target.value)} className="font-mono" />
        </Field>
        <Field label="I want to serve" htmlFor="scale-to">
          <TextInput id="scale-to" type="number" min={1} value={toServings} onChange={(event) => setToServings(event.target.value)} className="font-mono" />
        </Field>
        <Field label="Factor" htmlFor="scale-factor" hint="Calculated from the two serving counts.">
          <TextInput id="scale-factor" readOnly value={Number.isFinite(result.factor) ? `${result.factor.toFixed(2)}×` : "—"} className="font-mono" />
        </Field>
      </div>

      <div className="mt-4 space-y-2">
        <div className="hidden grid-cols-[5rem_6rem_1fr_2rem] gap-2 sm:grid">
          <span className="label !mb-0">Quantity</span>
          <span className="label !mb-0">Unit</span>
          <span className="label !mb-0">Ingredient</span>
          <span className="sr-only">Remove</span>
        </div>
        {rows.map((row) => (
          <div key={row.id} className="grid grid-cols-[4.5rem_5rem_1fr_2rem] gap-2">
            <TextInput
              aria-label={`${row.name || "Ingredient"} quantity`}
              value={row.quantity}
              onChange={(event) => update(row.id, { quantity: event.target.value })}
              className="font-mono"
              invalid={row.quantity.trim() !== "" && parseQuantity(row.quantity) === null}
            />
            <TextInput aria-label={`${row.name || "Ingredient"} unit`} value={row.unit} onChange={(event) => update(row.id, { unit: event.target.value })} placeholder="cup" />
            <TextInput aria-label="Ingredient name" value={row.name} onChange={(event) => update(row.id, { name: event.target.value })} placeholder="Ingredient" />
            <Button variant="ghost" size="sm" aria-label={`Remove ${row.name || "row"}`} onClick={() => setRows((current) => current.filter((item) => item.id !== row.id))}>
              ✕
            </Button>
          </div>
        ))}
      </div>

      <div className="mt-3">
        <Button
          onClick={() => {
            setRows((current) => [...current, { id: nextId, quantity: "", unit: "", name: "" }]);
            setNextId((value) => value + 1);
          }}
        >
          Add ingredient
        </Button>
      </div>

      <div className="mt-6">
        {result.lines.length ? (
          <ResultCard
            label="Scaled recipe"
            value={`${toServings} servings`}
            sub={`Every quantity multiplied by ${Number.isFinite(result.factor) ? result.factor.toFixed(2) : "—"}×`}
            tone="brand"
            actions={
              <>
                <CopyButton text={text} label="Copy list" />
                <DownloadButton filename="scaled-recipe.txt" content={text} label="Download" />
              </>
            }
          >
            <StatGrid
              columns={3}
              items={[
                { label: "Ingredients", value: String(result.lines.length) },
                { label: "Factor", value: Number.isFinite(result.factor) ? `${result.factor.toFixed(2)}×` : "—" },
                { label: "Unparsed quantities", value: String(rows.filter((row) => row.quantity.trim() && parseQuantity(row.quantity) === null).length) },
              ]}
            />
            <div className="mt-4">
              <SimpleTable
                head={["Ingredient", "Original", "Scaled"]}
                caption="Old and new amounts side by side"
                rows={result.lines.map((line) => [
                  line.name || "—",
                  [line.original, line.unit].filter(Boolean).join(" ") || "—",
                  [line.quantity, line.unit].filter(Boolean).join(" "),
                ])}
              />
            </div>
          </ResultCard>
        ) : (
          <Callout tone="info">Add at least one ingredient to scale the recipe.</Callout>
        )}
      </div>

      {result.issues.map((issue) => (
        <Callout key={issue} tone="warning">
          {issue}
        </Callout>
      ))}

      <p className="mt-4 text-xs leading-relaxed text-[var(--text-subtle)]">
        Quantities are scaled linearly, and the display prefers the nearest eighth of a teaspoon because that is what a
        measuring set can actually do. Everything else does not scale linearly: salt and leavening are taste- and
        chemistry-dependent, pan volume scales with the cube of its dimensions, and larger batches evaporate relatively
        less, so reduce liquid slightly and check seasoning near the end.
      </p>
    </ToolPanel>
  );
}
