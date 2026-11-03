"use client";

import { useMemo, useState } from "react";
import { Callout, Field, ResultCard, Segmented, Select, SimpleTable, StatGrid, TextInput, ToolPanel } from "@/components/ui";
import { formatDuration, paceFromDistance, parseDuration } from "@/lib/everyday";

export default function PaceCalculator() {
  const [distance, setDistance] = useState("10");
  const [distanceUnit, setDistanceUnit] = useState<"km" | "mi">("km");
  const [time, setTime] = useState("50:00");

  const seconds = parseDuration(time);
  const distanceKm = Number(distance) * (distanceUnit === "mi" ? 1.609344 : 1);
  const result = useMemo(
    () => paceFromDistance(distanceKm, seconds ?? 0, distanceUnit),
    [distanceKm, seconds, distanceUnit],
  );

  return (
    <ToolPanel>
      <div className="grid gap-3 sm:grid-cols-[1fr_8rem_8rem]">
        <Field label="Distance" htmlFor="pace-distance">
          <TextInput id="pace-distance" type="number" min={0} step="0.01" value={distance} onChange={(event) => setDistance(event.target.value)} className="font-mono" />
        </Field>
        <Field label="Unit" htmlFor="pace-unit">
          <Select id="pace-unit" value={distanceUnit} onChange={(event) => setDistanceUnit(event.target.value as "km" | "mi")}>
            <option value="km">Kilometres</option>
            <option value="mi">Miles</option>
          </Select>
        </Field>
        <Field label="Time (h:mm:ss)" htmlFor="pace-time" error={seconds === null ? "Use h:mm:ss or mm:ss." : undefined}>
          <TextInput id="pace-time" value={time} onChange={(event) => setTime(event.target.value)} className="font-mono" invalid={seconds === null} />
        </Field>
      </div>

      <div className="mt-6">
        {Number.isFinite(result.secondsPerUnit) ? (
          <ResultCard
            label={`Pace per ${distanceUnit === "km" ? "kilometre" : "mile"}`}
            value={formatDuration(result.secondsPerUnit)}
            sub={`${result.speedKph.toFixed(2)} km/h · ${result.speedMph.toFixed(2)} mph`}
            tone="brand"
          >
            <StatGrid
              columns={3}
              items={[
                { label: "Distance", value: `${Number(distance).toFixed(2)} ${distanceUnit}` },
                { label: "Time", value: formatDuration(seconds ?? 0) },
                { label: "Average speed", value: `${result.speedKph.toFixed(2)} km/h` },
              ]}
            />
            {result.splits.length > 0 && (
              <div className="mt-4">
                <SimpleTable head={[distanceUnit === "km" ? "Kilometre" : "Mile", "Elapsed"]} caption="Even splits at this pace" rows={result.splits.map((split) => [split.label, split.time])} />
              </div>
            )}
          </ResultCard>
        ) : (
          <Callout tone="info">Enter a distance and a time to calculate pace.</Callout>
        )}
      </div>

      <p className="mt-4 text-xs leading-relaxed text-[var(--text-subtle)]">
        Pace is time divided by distance; speed is distance divided by time. A 50-minute 10K is 5:00 per kilometre, which
        is 12 km/h — the same information read differently. Even splits are almost always faster overall than starting
        too quickly, which is why the split table is shown rather than just the average.
      </p>
    </ToolPanel>
  );
}
