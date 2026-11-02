"use client";

import { useMemo, useState } from "react";
import { Callout, Field, ResultCard, SimpleTable, StatGrid, TextInput, ToolPanel } from "@/components/ui";
import { sleepDuration } from "@/lib/everyday";

export default function SleepDurationCalculator() {
  const [bedtime, setBedtime] = useState("23:30");
  const [wake, setWake] = useState("07:00");
  const [latency, setLatency] = useState("15");
  const [target, setTarget] = useState("8");

  const result = useMemo(
    () => sleepDuration({ bedtime, wake, latencyMinutes: Number(latency) || 0, targetHours: Number(target) || 0 }),
    [bedtime, wake, latency, target],
  );

  const hours = Math.floor(result.asleepMinutes / 60);
  const minutes = result.asleepMinutes % 60;

  return (
    <ToolPanel>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Field label="Bedtime" htmlFor="sleep-bed" hint="24-hour clock, e.g. 23:30.">
          <TextInput id="sleep-bed" type="time" value={bedtime} onChange={(event) => setBedtime(event.target.value)} className="font-mono" />
        </Field>
        <Field label="Wake time" htmlFor="sleep-wake">
          <TextInput id="sleep-wake" type="time" value={wake} onChange={(event) => setWake(event.target.value)} className="font-mono" />
        </Field>
        <Field label="Minutes to fall asleep" htmlFor="sleep-latency">
          <TextInput id="sleep-latency" type="number" min={0} max={120} value={latency} onChange={(event) => setLatency(event.target.value)} className="font-mono" />
        </Field>
        <Field label="Target sleep (hours)" htmlFor="sleep-target">
          <TextInput id="sleep-target" type="number" min={4} max={12} step="0.5" value={target} onChange={(event) => setTarget(event.target.value)} className="font-mono" />
        </Field>
      </div>

      <div className="mt-6">
        <ResultCard
          label="Time asleep"
          value={`${hours}h ${String(minutes).padStart(2, "0")}m`}
          sub={`${result.cycles} complete 90-minute cycles · ${result.debtMinutes >= 0 ? `${result.debtMinutes} min short of target` : `${Math.abs(result.debtMinutes)} min above target`}`}
          tone="brand"
        >
          <StatGrid
            columns={3}
            items={[
              { label: "In bed", value: `${Math.floor(result.inBedMinutes / 60)}h ${String(result.inBedMinutes % 60).padStart(2, "0")}m` },
              { label: "Asleep", value: `${Math.floor(result.asleepMinutes / 60)}h ${String(result.asleepMinutes % 60).padStart(2, "0")}m` },
              { label: "Sleep efficiency", value: `${Math.round((result.asleepMinutes / Math.max(1, result.inBedMinutes)) * 100)}%` },
            ]}
          />
          <div className="mt-4">
            <SimpleTable
              head={["Cycles", "Bedtime for your wake time", "Sleep"]}
              caption="Waking between cycles feels easier than mid-cycle"
              rows={result.bedtimeSuggestions.map((time, index) => [
                `${6 - index}`,
                time,
                `${(6 - index) * 1.5} hours`,
              ])}
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
        The 90-minute cycle is an average; individual cycles run from 70 to 120 minutes and lengthen towards morning.
        Counting cycles is a heuristic for choosing a wake time, not a measurement of your sleep. Persistent insomnia,
        snoring with pauses or daytime sleepiness needs a clinician, not a calculator.
      </p>
    </ToolPanel>
  );
}
