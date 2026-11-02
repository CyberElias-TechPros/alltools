"use client";

import { useMemo, useState } from "react";
import { Callout, Field, ResultCard, Segmented, SimpleTable, StatGrid, TextInput, ToolPanel } from "@/components/ui";
import { formatDuration, parseDuration } from "@/lib/everyday";

const RACE_DISTANCES = [
  { id: "5k", label: "5K", km: 5 },
  { id: "10k", label: "10K", km: 10 },
  { id: "half", label: "Half marathon", km: 21.0975 },
  { id: "marathon", label: "Marathon", km: 42.195 },
];

export default function RunningSpeedCalculator() {
  const [distance, setDistance] = useState("10");
  const [unit, setUnit] = useState<"km" | "mi">("km");
  const [time, setTime] = useState("52:30");

  const seconds = parseDuration(time);
  const km = Number(distance) * (unit === "mi" ? 1.609344 : 1);
  const valid = Number.isFinite(km) && km > 0 && seconds !== null && seconds > 0;

  const speedKph = valid ? (km / (seconds as number)) * 3600 : Number.NaN;
  const paceSecondsPerKm = valid ? (seconds as number) / km : Number.NaN;
  const paceSecondsPerMile = valid ? paceSecondsPerKm * 1.609344 : Number.NaN;

  const equivalents = useMemo(() => {
    if (!valid) return [];
    const v = 1.06; // Riegel exponent: shorter races convert faster
    return RACE_DISTANCES.map((race) => {
      const projected = (seconds as number) * Math.pow(race.km / km, v);
      return { ...race, time: formatDuration(projected) };
    });
  }, [valid, km, seconds]);

  return (
    <ToolPanel>
      <div className="grid gap-3 sm:grid-cols-[1fr_8rem_9rem]">
        <Field label="Distance run" htmlFor="run-distance">
          <TextInput id="run-distance" type="number" min={0} step="0.01" value={distance} onChange={(event) => setDistance(event.target.value)} className="font-mono" />
        </Field>
        <div>
          <Segmented
            label="Distance unit"
            value={unit}
            onChange={setUnit}
            options={[
              { value: "km", label: "km" },
              { value: "mi", label: "miles" },
            ]}
          />
        </div>
        <Field label="Time (h:mm:ss)" htmlFor="run-time" error={seconds === null ? "Use h:mm:ss or mm:ss." : undefined}>
          <TextInput id="run-time" value={time} onChange={(event) => setTime(event.target.value)} className="font-mono" invalid={seconds === null} />
        </Field>
      </div>

      <div className="mt-6">
        {valid ? (
          <ResultCard
            label="Average speed"
            value={`${speedKph.toFixed(2)} km/h`}
            sub={`${(speedKph / 1.609344).toFixed(2)} mph · ${formatDuration(paceSecondsPerKm)} per km · ${formatDuration(paceSecondsPerMile)} per mile`}
            tone="brand"
          >
            <StatGrid
              columns={3}
              items={[
                { label: "Metres per second", value: (speedKph / 3.6).toFixed(2) },
                { label: "Pace per km", value: formatDuration(paceSecondsPerKm) },
                { label: "Pace per mile", value: formatDuration(paceSecondsPerMile) },
              ]}
            />
            <div className="mt-4">
              <SimpleTable
                head={["Race", "Equivalent time"]}
                caption="Riegel projection from this run — a training guide, not a prediction"
                rows={equivalents.map((race) => [race.label, race.time])}
              />
            </div>
          </ResultCard>
        ) : (
          <Callout tone="info">Enter a distance and a time to see speed, pace and race equivalents.</Callout>
        )}
      </div>

      <p className="mt-4 text-xs leading-relaxed text-[var(--text-subtle)]">
        Race equivalents use Riegel&apos;s formula, T₂ = T₁ × (D₂ ÷ D₁)^1.06, which assumes endurance scales predictably.
        It flatters short-distance runners moving up and over-estimates long-distance potential for anyone undertrained —
        the exponent is a population average, not your physiology.
      </p>
    </ToolPanel>
  );
}
