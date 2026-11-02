"use client";

import { useEffect, useMemo, useState } from "react";
import { Clock } from "lucide-react";
import { CopyButton, Field, Segmented, TextInput, ToolPanel } from "@/components/ui";

function localInputValue(date: Date): string {
  const pad = (value: number) => String(value).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

export default function TimestampConverter() {
  const [now, setNow] = useState(() => Date.now());
  const [timestamp, setTimestamp] = useState("");
  const [unit, setUnit] = useState<"auto" | "s" | "ms">("auto");
  const [dateInput, setDateInput] = useState(() => localInputValue(new Date()));
  const [zone, setZone] = useState<"local" | "utc">("local");

  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  const parsed = useMemo(() => {
    const raw = timestamp.trim();
    if (!raw) return null;
    const value = Number(raw);
    if (!Number.isFinite(value)) return null;
    const effectiveUnit =
      unit === "auto" ? (Math.abs(value) > 100_000_000_000 ? "ms" : "s") : unit;
    const ms = effectiveUnit === "ms" ? value : value * 1000;
    const date = new Date(ms);
    if (Number.isNaN(date.getTime())) return null;
    return { date, effectiveUnit };
  }, [timestamp, unit]);

  const fromDate = useMemo(() => {
    if (!dateInput) return null;
    const value = zone === "utc" ? new Date(`${dateInput}:00Z`) : new Date(dateInput);
    return Number.isNaN(value.getTime()) ? null : value;
  }, [dateInput, zone]);

  const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;

  return (
    <ToolPanel>
      <div className="mb-4 flex flex-wrap items-center gap-3 rounded-xl border border-[var(--border)] bg-[var(--surface-muted)] px-4 py-3">
        <Clock className="size-4 text-[var(--text-subtle)]" aria-hidden />
        <div>
          <p className="text-[0.68rem] font-semibold uppercase tracking-[0.08em] text-[var(--text-subtle)]">
            Current Unix time
          </p>
          <p className="font-mono text-lg font-semibold text-[var(--text)]" aria-live="off">
            {Math.floor(now / 1000)}
          </p>
        </div>
        <div className="ml-auto flex flex-wrap items-center gap-2 text-xs text-[var(--text-subtle)]">
          <span>Your time zone: {timeZone}</span>
          <CopyButton text={String(Math.floor(now / 1000))} label="Copy" />
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <div>
          <h3 className="mb-2 text-[0.72rem] font-bold uppercase tracking-[0.08em] text-[var(--text-subtle)]">
            Timestamp → date
          </h3>
          <Field label="Unix timestamp" htmlFor="ts-input" hint="10 digits = seconds, 13 digits = milliseconds">
            <TextInput
              id="ts-input"
              inputMode="numeric"
              value={timestamp}
              onChange={(event) => setTimestamp(event.target.value)}
              placeholder="1735689600"
              className="font-mono"
            />
          </Field>
          <div className="mt-2">
            <Segmented
              label="Unit"
              value={unit}
              onChange={setUnit}
              options={[
                { value: "auto", label: "Auto" },
                { value: "s", label: "Seconds" },
                { value: "ms", label: "Milliseconds" },
              ]}
            />
          </div>
          <div aria-live="polite" className="mt-3 space-y-1.5 rounded-lg border border-[var(--border)] bg-[var(--code-bg)] p-3 font-mono text-[0.8rem]">
            {parsed ? (
              <>
                <p><span className="text-[var(--text-subtle)]">UTC </span>{parsed.date.toISOString()}</p>
                <p><span className="text-[var(--text-subtle)]">Local </span>{parsed.date.toLocaleString()}</p>
                <p><span className="text-[var(--text-subtle)]">Detected </span>{parsed.effectiveUnit === "ms" ? "milliseconds" : "seconds"}</p>
              </>
            ) : (
              <p className="text-[var(--text-subtle)]">Paste a timestamp to see both interpretations.</p>
            )}
          </div>
        </div>

        <div>
          <h3 className="mb-2 text-[0.72rem] font-bold uppercase tracking-[0.08em] text-[var(--text-subtle)]">
            Date → timestamp
          </h3>
          <Field label="Date and time" htmlFor="ts-date">
            <TextInput
              id="ts-date"
              type="datetime-local"
              value={dateInput}
              onChange={(event) => setDateInput(event.target.value)}
            />
          </Field>
          <div className="mt-2">
            <Segmented
              label="Interpret as"
              value={zone}
              onChange={setZone}
              options={[
                { value: "local", label: "Local time" },
                { value: "utc", label: "UTC" },
              ]}
            />
          </div>
          <div aria-live="polite" className="mt-3 space-y-1.5 rounded-lg border border-[var(--border)] bg-[var(--code-bg)] p-3 font-mono text-[0.8rem]">
            {fromDate ? (
              <>
                <p className="flex items-center justify-between gap-2">
                  <span><span className="text-[var(--text-subtle)]">Seconds </span>{Math.floor(fromDate.getTime() / 1000)}</span>
                  <CopyButton text={String(Math.floor(fromDate.getTime() / 1000))} label="Copy" />
                </p>
                <p className="flex items-center justify-between gap-2">
                  <span><span className="text-[var(--text-subtle)]">Millis </span>{fromDate.getTime()}</span>
                  <CopyButton text={String(fromDate.getTime())} label="Copy" />
                </p>
                <p><span className="text-[var(--text-subtle)]">ISO </span>{fromDate.toISOString()}</p>
              </>
            ) : (
              <p className="text-[var(--text-subtle)]">Pick a valid date.</p>
            )}
          </div>
        </div>
      </div>
    </ToolPanel>
  );
}
