"use client";

import { useEffect, useRef, useState } from "react";
import { Button, SimpleTable, StatGrid, ToolPanel } from "@/components/ui";
import { formatDuration } from "@/lib/everyday";

function formatPrecise(ms: number): string {
  const total = Math.max(0, ms);
  const minutes = Math.floor(total / 60000);
  const seconds = Math.floor((total % 60000) / 1000);
  const hundredths = Math.floor((total % 1000) / 10);
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}.${String(hundredths).padStart(2, "0")}`;
}

export default function Stopwatch() {
  const [elapsed, setElapsed] = useState(0);
  const [running, setRunning] = useState(false);
  const [laps, setLaps] = useState<number[]>([]);
  const startedAt = useRef<number | null>(null);
  const base = useRef(0);

  useEffect(() => {
    if (!running) return;
    startedAt.current = Date.now();
    const interval = window.setInterval(() => {
      setElapsed(base.current + (Date.now() - (startedAt.current ?? Date.now())));
    }, 40);
    return () => window.clearInterval(interval);
  }, [running]);

  const toggle = () => {
    if (running) {
      base.current = elapsed;
      setRunning(false);
    } else {
      setRunning(true);
    }
  };

  const reset = () => {
    setRunning(false);
    base.current = 0;
    setElapsed(0);
    setLaps([]);
  };

  const lapTimes = laps.map((lap, index) => (index === 0 ? lap : lap - laps[index - 1]));
  const fastest = lapTimes.length > 1 ? Math.min(...lapTimes) : null;
  const slowest = lapTimes.length > 1 ? Math.max(...lapTimes) : null;

  return (
    <ToolPanel>
      <div className="border border-[var(--border)] bg-[var(--surface-muted)] p-8 text-center">
        <p className="font-mono text-[0.6rem] uppercase tracking-[0.2em] text-[var(--text-subtle)]">{running ? "Running" : elapsed > 0 ? "Paused" : "Ready"}</p>
        <p className="mt-2 font-mono text-6xl tabular-nums text-[var(--text)]" aria-live="off">
          {formatPrecise(elapsed)}
        </p>
        <p className="mt-2 text-xs text-[var(--text-subtle)]">Centiseconds, measured with the system clock</p>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <Button variant="primary" onClick={toggle}>
          {running ? "Pause" : elapsed > 0 ? "Resume" : "Start"}
        </Button>
        <Button onClick={() => setLaps((current) => [...current, elapsed])} disabled={!running}>
          Lap
        </Button>
        <Button onClick={reset}>Reset</Button>
      </div>

      {laps.length > 0 && (
        <div className="mt-6">
          <StatGrid
            columns={3}
            items={[
              { label: "Laps", value: String(laps.length) },
              { label: "Fastest lap", value: fastest === null ? "—" : formatPrecise(fastest) },
              { label: "Slowest lap", value: slowest === null ? "—" : formatPrecise(slowest) },
            ]}
          />
          <div className="mt-4">
            <SimpleTable
              head={["Lap", "Lap time", "Total", "Note"]}
              caption="Lap times with the running total"
              rows={laps
                .map((total, index) => [
                  `Lap ${index + 1}`,
                  formatPrecise(lapTimes[index]),
                  formatPrecise(total),
                  lapTimes.length < 2 ? "—" : lapTimes[index] === fastest ? "Fastest" : lapTimes[index] === slowest ? "Slowest" : "",
                ])
                .reverse()}
            />
          </div>
        </div>
      )}

      <p className="mt-4 text-xs leading-relaxed text-[var(--text-subtle)]">
        Elapsed time is computed from the system clock, not by adding up interval ticks, so a backgrounded tab does not
        lose time. Hundredths are shown for readability; browser timers are only accurate to a few milliseconds and cannot
        be used for officiating. Closing the tab clears everything — nothing is stored.
      </p>
    </ToolPanel>
  );
}
