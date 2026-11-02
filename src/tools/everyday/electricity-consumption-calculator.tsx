"use client";

import { useMemo, useState } from "react";
import { Callout, Field, ResultCard, SimpleTable, StatGrid, TextInput, ToolPanel } from "@/components/ui";
import { electricityCost } from "@/lib/everyday";

const APPLIANCES = [
  { label: "LED bulb", watts: 9 },
  { label: "Laptop", watts: 65 },
  { label: "Fridge (average)", watts: 150 },
  { label: "TV (55-inch)", watts: 120 },
  { label: "Microwave", watts: 1000 },
  { label: "Kettle", watts: 2200 },
  { label: "Air conditioner (1.5 hp)", watts: 1120 },
  { label: "Electric heater", watts: 2000 },
];

export default function ElectricityConsumptionCalculator() {
  const [watts, setWatts] = useState("1000");
  const [hours, setHours] = useState("3");
  const [days, setDays] = useState("30");
  const [rate, setRate] = useState("0.20");
  const [carbon, setCarbon] = useState("400");

  const result = useMemo(
    () =>
      electricityCost({
        watts: Number(watts),
        hoursPerDay: Number(hours),
        days: Number(days),
        ratePerKwh: Number(rate),
        carbonGramsPerKwh: Number(carbon),
      }),
    [watts, hours, days, rate, carbon],
  );

  return (
    <ToolPanel>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <Field label="Power (watts)" htmlFor="elec-watts" hint="On the label or in the manual.">
          <TextInput id="elec-watts" type="number" min={0} value={watts} onChange={(event) => setWatts(event.target.value)} className="font-mono" />
        </Field>
        <Field label="Hours per day" htmlFor="elec-hours">
          <TextInput id="elec-hours" type="number" min={0} max={24} step="0.5" value={hours} onChange={(event) => setHours(event.target.value)} className="font-mono" />
        </Field>
        <Field label="Days in the period" htmlFor="elec-days">
          <TextInput id="elec-days" type="number" min={0} max={366} value={days} onChange={(event) => setDays(event.target.value)} className="font-mono" />
        </Field>
        <Field label="Tariff per kWh" htmlFor="elec-rate" hint="From your bill, in your own currency.">
          <TextInput id="elec-rate" type="number" min={0} step="0.01" value={rate} onChange={(event) => setRate(event.target.value)} className="font-mono" />
        </Field>
        <Field label="Grid carbon (g CO₂/kWh)" htmlFor="elec-carbon" hint="Around 400 globally; lower in nuclear or hydro grids.">
          <TextInput id="elec-carbon" type="number" min={0} value={carbon} onChange={(event) => setCarbon(event.target.value)} className="font-mono" />
        </Field>
      </div>

      <div className="mt-6">
        <ResultCard label="Energy used" value={`${result.kwhTotal.toFixed(2)} kWh`} sub={`${result.kwhPerDay.toFixed(2)} kWh a day — about ${(result.costTotal).toFixed(2)} at your tariff`} tone="brand">
          <StatGrid
            columns={3}
            items={[
              { label: "Per day", value: `${result.kwhPerDay.toFixed(2)} kWh` },
              { label: "Cost per day", value: result.costPerDay.toFixed(2) },
              { label: "CO₂ for the period", value: `${result.co2Kg.toFixed(1)} kg` },
            ]}
          />
          <div className="mt-4">
            <SimpleTable
              head={["Appliance", "Typical wattage"]}
              caption="Nameplate watts for common household loads"
              rows={APPLIANCES.map((appliance) => [appliance.label, `${appliance.watts} W`])}
            />
          </div>
        </ResultCard>
      </div>

      {result.issues.map((issue) => (
        <Callout key={issue} tone="warning">
          {issue}
        </Callout>
      ))}

      <p className="mt-4 text-xs leading-relaxed text-[var(--text-subtle)]">
        Watts × hours ÷ 1000 gives kilowatt-hours, which is what the meter charges for. Fridges and air conditioners
        cycle on and off, so their running hours are lower than hours plugged in — a fridge labelled 150 W might average
        40 W over a day. Kettles and heaters draw their full rating while on, which is why a 2 kW heater for eight hours
        costs more than a week of lighting.
      </p>
    </ToolPanel>
  );
}
