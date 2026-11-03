"use client";

import { useEffect, useMemo, useState } from "react";
import { Button, Select, SimpleTable, ToolPanel } from "@/components/ui";
import { WORLD_CITIES, zoneTime } from "@/lib/everyday";

const DEFAULT_CITIES = ["lagos", "london", "new-york", "tokyo"];

export default function WorldClock() {
  const [now, setNow] = useState<Date | null>(null);
  const [selected, setSelected] = useState<string[]>(DEFAULT_CITIES);
  const [candidate, setCandidate] = useState("berlin");

  useEffect(() => {
    setNow(new Date());
    const interval = window.setInterval(() => setNow(new Date()), 1000);
    return () => window.clearInterval(interval);
  }, []);

  const localZone = useMemo(() => {
    try {
      return Intl.DateTimeFormat().resolvedOptions().timeZone;
    } catch {
      return "UTC";
    }
  }, []);

  const rows = selected
    .map((id) => WORLD_CITIES.find((city) => city.id === id))
    .filter((city): city is (typeof WORLD_CITIES)[number] => Boolean(city))
    .map((city) => ({ city, time: now ? zoneTime(now, city.zone) : null }));

  return (
    <ToolPanel>
      <div className="flex flex-wrap items-end gap-3">
        <div className="min-w-56 flex-1">
          <label className="label" htmlFor="clock-city">
            Add a city
          </label>
          <div className="flex gap-2">
            <Select id="clock-city" value={candidate} onChange={(event) => setCandidate(event.target.value)}>
              {WORLD_CITIES.filter((city) => !selected.includes(city.id)).map((city) => (
                <option key={city.id} value={city.id}>
                  {city.city}, {city.country}
                </option>
              ))}
            </Select>
            <Button
              onClick={() => {
                setSelected((current) => (current.includes(candidate) ? current : [...current, candidate]));
              }}
            >
              Add
            </Button>
          </div>
        </div>
        <div>
          <p className="label">Your device</p>
          <p className="font-mono text-sm text-[var(--text-muted)]">{now ? now.toLocaleTimeString("en-GB") : "—:—"} · {localZone}</p>
        </div>
      </div>

      <ul className="mt-6 divide-y divide-[var(--border)] border-y border-[var(--border)]">
        {rows.map(({ city, time }) => (
          <li key={city.id} className="flex flex-wrap items-baseline justify-between gap-3 py-3">
            <div>
              <p className="text-sm text-[var(--text)]">{city.city}</p>
              <p className="text-xs text-[var(--text-subtle)]">
                {city.country} · {city.zone} · {time?.offset ?? "—"}
              </p>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="font-mono text-2xl tabular-nums text-[var(--text)]">{time?.time.split(" ")[0] ?? "—:—"}</p>
                <p className="text-xs text-[var(--text-subtle)]">{time?.day ?? ""}</p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                aria-label={`Remove ${city.city}`}
                onClick={() => setSelected((current) => current.filter((id) => id !== city.id))}
              >
                ✕
              </Button>
            </div>
          </li>
        ))}
      </ul>

      <div className="mt-6">
        <SimpleTable
          head={["City", "Zone", "Offset"]}
          caption="Offsets are read live from your browser's time zone database"
          rows={rows.map(({ city, time }) => [`${city.city}, ${city.country}`, city.zone, time?.offset ?? "—"])}
        />
      </div>

      <p className="mt-4 text-xs leading-relaxed text-[var(--text-subtle)]">
        Times come from the browser&apos;s IANA time-zone database, so daylight-saving transitions are handled — an offset
        shown here already includes them. Nothing is synced or stored: the list resets when you reload, and the clock ticks
        from your device&apos;s own time rather than a server.
      </p>
    </ToolPanel>
  );
}
