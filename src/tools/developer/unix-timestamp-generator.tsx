"use client";

import { useEffect, useMemo, useState } from "react";
import { CopyButton, Field, ResultCard, SimpleTable, StatGrid, TextInput, ToolPanel } from "@/components/ui";

function toLocalInput(date: Date): string {
  const pad = (value: number) => String(value).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(
    date.getMinutes(),
  )}`;
}

const OFFSETS = [
  { label: "Now", ms: 0 },
  { label: "+1 hour", ms: 3_600_000 },
  { label: "+1 day", ms: 86_400_000 },
  { label: "+7 days", ms: 604_800_000 },
  { label: "+30 days", ms: 2_592_000_000 },
  { label: "+1 year", ms: 31_536_000_000 },
];

export default function UnixTimestampGenerator() {
  const [now, setNow] = useState<number | null>(null);
  const [start, setStart] = useState("");
  const [stepSeconds, setStepSeconds] = useState("3600");
  const [count, setCount] = useState("8");

  useEffect(() => {
    const tick = () => setNow(Date.now());
    tick();
    const timer = setInterval(tick, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (!start) setStart(toLocalInput(new Date()));
  }, [start]);

  const batch = useMemo(() => {
    const base = start ? new Date(start).getTime() : Date.now();
    if (!Number.isFinite(base)) return [];
    const step = Number(stepSeconds);
    const total = Math.max(1, Math.min(200, Number(count) || 1));
    if (!Number.isFinite(step) || step === 0) return [];
    return Array.from({ length: total }, (_, index) => {
      const date = new Date(base + index * step * 1000);
      return {
        index: index + 1,
        seconds: Math.floor(date.getTime() / 1000),
        iso: date.toISOString(),
        local: date.toLocaleString(),
      };
    });
  }, [start, stepSeconds, count]);

  const seconds = now === null ? null : Math.floor(now / 1000);

  return (
    <ToolPanel>
      <ResultCard
        label="Current Unix time"
        value={seconds === null ? "—" : String(seconds)}
        tone="brand"
        sub={now === null ? "Reading the clock…" : new Date(now).toISOString()}
      >
        <StatGrid
          columns={3}
          items={[
            { label: "Seconds", value: seconds ?? "—" },
            { label: "Milliseconds", value: now ?? "—" },
            {
              label: "Local time",
              value: now === null ? "—" : new Date(now).toLocaleTimeString(),
              hint: now === null ? undefined : new Date(now).toLocaleDateString(),
            },
          ]}
        />
        <div className="mt-3 flex flex-wrap gap-2">
          <CopyButton text={seconds === null ? "" : String(seconds)} label="Copy seconds" />
          <CopyButton text={now === null ? "" : String(now)} label="Copy milliseconds" />
          <CopyButton text={now === null ? "" : new Date(now).toISOString()} label="Copy ISO 8601" />
        </div>
      </ResultCard>

      <div className="mt-6">
        <p className="label">Quick offsets</p>
        <div className="flex flex-wrap gap-1.5">
          {OFFSETS.map((offset) => {
            const value = now === null ? null : Math.floor((now + offset.ms) / 1000);
            return (
              <div
                key={offset.label}
                className="border border-[var(--border)] bg-[var(--surface)] px-2.5 py-1.5"
              >
                <p className="font-mono text-[0.55rem] uppercase tracking-[0.12em] text-[var(--text-subtle)]">
                  {offset.label}
                </p>
                <p className="font-mono text-[0.8rem] text-[var(--text)]">{value ?? "—"}</p>
              </div>
            );
          })}
        </div>
      </div>

      <div className="mt-6 border-t border-[var(--border)] pt-5">
        <p className="label">Generate a sequence</p>
        <div className="grid gap-4 sm:grid-cols-3">
          <Field label="Starting point (local time)" htmlFor="ts-start">
            <TextInput
              id="ts-start"
              type="datetime-local"
              value={start}
              onChange={(event) => setStart(event.target.value)}
            />
          </Field>
          <Field label="Interval (seconds)" htmlFor="ts-step" hint="3600 = hourly, 86400 = daily">
            <TextInput
              id="ts-step"
              type="number"
              min={1}
              value={stepSeconds}
              onChange={(event) => setStepSeconds(event.target.value)}
              className="font-mono"
            />
          </Field>
          <Field label="How many" htmlFor="ts-count" hint="Up to 200 rows">
            <TextInput
              id="ts-count"
              type="number"
              min={1}
              max={200}
              value={count}
              onChange={(event) => setCount(event.target.value)}
              className="font-mono"
            />
          </Field>
        </div>

        <div className="mt-4">
          {batch.length === 0 ? (
            <p className="text-sm text-[var(--text-subtle)]">Choose a valid start time, interval and count.</p>
          ) : (
            <SimpleTable
              head={["#", "Unix seconds", "ISO 8601", "Local time"]}
              caption="Generated timestamp sequence"
              rows={batch.map((row) => [String(row.index), <span key="s">{row.seconds}</span>, row.iso, row.local])}
            />
          )}
        </div>
        <div className="mt-3">
          <CopyButton
            text={batch.map((row) => row.seconds).join("\n")}
            label="Copy all timestamps"
          />
        </div>
      </div>

      <p className="mt-5 text-xs leading-relaxed text-[var(--text-subtle)]">
        Unix time counts seconds since 1 January 1970 at 00:00 UTC and ignores leap seconds, which is why the browser
        clock — not a server — is the source here. Times are generated from your device&apos;s clock and time zone.
      </p>
    </ToolPanel>
  );
}
