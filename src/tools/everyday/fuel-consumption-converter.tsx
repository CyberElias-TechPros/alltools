"use client";

import { useMemo, useState } from "react";
import { Callout, Field, ResultCard, StatGrid, TextInput, ToolPanel } from "@/components/ui";
import { fuelConsumption } from "@/lib/everyday";

export default function FuelConsumptionConverter() {
  const [distance, setDistance] = useState("500");
  const [litres, setLitres] = useState("40");
  const [price, setPrice] = useState("1.75");

  const result = useMemo(
    () => fuelConsumption({ distanceKm: Number(distance), litres: Number(litres), pricePerLitre: Number(price) }),
    [distance, litres, price],
  );

  return (
    <ToolPanel>
      <div className="grid gap-3 sm:grid-cols-3">
        <Field label="Distance (km)" htmlFor="fuel-distance">
          <TextInput id="fuel-distance" type="number" min={0} value={distance} onChange={(event) => setDistance(event.target.value)} className="font-mono" />
        </Field>
        <Field label="Fuel used (litres)" htmlFor="fuel-litres">
          <TextInput id="fuel-litres" type="number" min={0} step="0.1" value={litres} onChange={(event) => setLitres(event.target.value)} className="font-mono" />
        </Field>
        <Field label="Price per litre" htmlFor="fuel-price" hint="Optional, in your own currency.">
          <TextInput id="fuel-price" type="number" min={0} step="0.01" value={price} onChange={(event) => setPrice(event.target.value)} className="font-mono" />
        </Field>
      </div>

      <div className="mt-6">
        {Number.isFinite(result.litresPer100km) ? (
          <ResultCard
            label="Fuel economy"
            value={`${result.litresPer100km.toFixed(2)} L/100 km`}
            sub={`${result.mpgUs.toFixed(1)} mpg (US) · ${result.mpgUk.toFixed(1)} mpg (UK) · ${result.kmPerLitre.toFixed(1)} km/L`}
            tone="brand"
          >
            <StatGrid
              columns={3}
              items={[
                { label: "MPG (US)", value: result.mpgUs.toFixed(1) },
                { label: "MPG (UK)", value: result.mpgUk.toFixed(1) },
                { label: "Cost per 100 km", value: result.costPer100km === null ? "Set a price" : result.costPer100km.toFixed(2) },
              ]}
            />
            <p className="mt-3 text-xs leading-relaxed text-[var(--text-subtle)]">
              A UK gallon is 4.546 L and a US gallon 3.785 L, which is why the same car shows about 20% better mpg in
              Britain than in America. L/100 km is the only figure where lower is better.
            </p>
          </ResultCard>
        ) : (
          <Callout tone="info">Enter a distance and the fuel used.</Callout>
        )}
      </div>

      {result.issues.map((issue) => (
        <Callout key={issue} tone="warning">
          {issue}
        </Callout>
      ))}

      <p className="mt-4 text-xs leading-relaxed text-[var(--text-subtle)]">
        Tank-to-tank is the reliable way to measure: fill up, reset the trip, drive normally, then fill up again at the
        same pump and divide litres by the distance. The car&apos;s trip computer typically reads 5–10% optimistic. Cold
        weather, roof racks, tyre pressure and short urban trips move consumption more than driving style for many
        drivers.
      </p>
    </ToolPanel>
  );
}
