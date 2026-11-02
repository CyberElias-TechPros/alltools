"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Button, Callout, Field, TextInput, ToolPanel } from "@/components/ui";

const PRESETS = [
  { label: "5 min", seconds: 300 },
  { label: "10 min", seconds: 600 },
  { label: "25 min", seconds: 1500 },
  { label: "1 hour", seconds: 3600 },
];

export default function CountdownTimer() {
  const [hours, setHours] = useState("0");
  const [minutes, setMinutes] = useState("25");
  const [seconds, setSeconds] = useState("0");
  const [remaining, setRemaining] = useState(1500);
  const [running, setRunning] = useState(false);
  const [finished, setFinished] = useState(false);
  const endRef = useRef<number | null>(null);

  const total = Math.max(0, Number(hours) * 3600 + Number(minutes) * 60 + Number(seconds));

  const reset = useCallback(
    (value = total) => {
      setRunning(false);
      setFinished(false);
      endRef.current = null;
      setRemaining(Math.max(0, Math.round(value)));
    },
    [total],
  );

  useEffect(() => {
    if (!running) return;
    const end = Date.now() + remaining * 1000;
    endRef.current = end;
    const interval = window.setInterval(() => {
      const left = Math.max(0, Math.round((end - Date.now()) / 1000));
      setRemaining(left);
      if (left === 0) {
        window.clearInterval(interval);
        setRunning(false);
        setFinished(true);
      }
    }, 200);
    return () => window.clearInterval(interval);
    // `remaining` is deliberately captured when the timer starts.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [running]);

  const endTime = new Date(Date.now() + remaining * 1000);
  const clock = `${String(Math.floor(remaining / 3600)).padStart(2, "0")}:${String(Math.floor((remaining % 3600) / 60)).padStart(2, "0")}:${String(remaining % 60).padStart(2, "0")}`;
  const progress = total > 0 ? Math.min(100, Math.max(0, ((total - remaining) / total) * 100)) : 0;

  return (
    <ToolPanel>
      <div className="grid gap-3 sm:grid-cols-3">
        <Field label="Hours" htmlFor="cd-hours">
          <TextInput id="cd-hours" type="number" min={0} max={23} value={hours} onChange={(event) => setHours(event.target.value)} className="font-mono" />
        </Field>
        <Field label="Minutes" htmlFor="cd-minutes">
          <TextInput id="cd-minutes" type="number" min={0} max={59} value={minutes} onChange={(event) => setMinutes(event.target.value)} className="font-mono" />
        </Field>
        <Field label="Seconds" htmlFor="cd-seconds">
          <TextInput id="cd-seconds" type="number" min={0} max={59} value={seconds} onChange={(event) => setSeconds(event.target.value)} className="font-mono" />
        </Field>
      </div>

      <div className="mt-3 flex flex-wrap gap-1.5">
        {PRESETS.map((preset) => (
          <button
            key={preset.label}
            type="button"
            onClick={() => {
              setHours(String(Math.floor(preset.seconds / 3600)));
              setMinutes(String(Math.floor((preset.seconds % 3600) / 60)));
              setSeconds(String(preset.seconds % 60));
              reset(preset.seconds);
            }}
            className="border border-[var(--border)] px-2.5 py-1.5 font-mono text-[0.62rem] text-[var(--text-subtle)] transition-colors hover:border-[var(--border-strong)] hover:text-[var(--text)]"
          >
            {preset.label}
          </button>
        ))}
      </div>

      <div className="mt-6 border border-[var(--border)] bg-[var(--surface-muted)] p-6 text-center">
        <p className="font-mono text-[0.6rem] uppercase tracking-[0.2em] text-[var(--text-subtle)]">{finished ? "Time" : running ? "Counting down" : "Ready"}</p>
        <p className="mt-2 font-mono text-5xl tabular-nums text-[var(--text)] sm:text-6xl" aria-live="polite">
          {clock}
        </p>
        <div className="mx-auto mt-4 h-1 w-full max-w-sm bg-[var(--border)]">
          <div className="h-full bg-[var(--ring)] transition-[width] duration-200" style={{ width: `${progress}%` }} />
        </div>
        <p className="mt-3 text-xs text-[var(--text-subtle)]">
          {remaining > 0 ? `Finishes at ${endTime.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })}` : "Done — start again when you are ready."}
        </p>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <Button variant="primary" onClick={() => { if (remaining === 0) reset(total); setFinished(false); setRunning((value) => !value); }}>
          {running ? "Pause" : remaining === 0 ? "Restart" : "Start"}
        </Button>
        <Button onClick={() => reset(total)}>Reset</Button>
        <Button onClick={() => reset(total)}>Apply new duration</Button>
      </div>

      {finished && <Callout tone="success">The countdown reached zero. This tab has to stay open — a browser tab cannot ring after it is closed.</Callout>}

      <p className="mt-4 text-xs leading-relaxed text-[var(--text-subtle)]">
        The timer runs on the system clock rather than counting intervals, so it stays accurate when the tab is
        throttled in the background. Closing the tab ends it: there is no notification, no sound permission request and
        nothing scheduled on a server.
      </p>
    </ToolPanel>
  );
}
