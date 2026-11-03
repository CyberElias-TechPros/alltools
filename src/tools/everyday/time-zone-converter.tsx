"use client";

import { useMemo, useState } from "react";
import { Plus, X } from "lucide-react";
import { Button, CopyButton, Field, Select, TextInput, ToolPanel } from "@/components/ui";
import {
  COMMON_ZONES,
  formatInZone,
  formatOffset,
  localHourInZone,
  zonedTimeToInstant,
} from "@/lib/timezone";
import { cn } from "@/lib/utils";

const DEFAULT_CITIES = ["Africa/Lagos", "Europe/London", "America/New_York", "Asia/Tokyo"];

function toLocalInput(date: Date): string {
  const pad = (value: number) => String(value).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

export default function TimeZoneConverter() {
  const browserZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const initialZone = COMMON_ZONES.some((zone) => zone.id === browserZone) ? browserZone : "UTC";

  const [sourceZone, setSourceZone] = useState(initialZone);
  const [when, setWhen] = useState(() => toLocalInput(new Date()));
  const [cities, setCities] = useState<string[]>(DEFAULT_CITIES);
  const [addZone, setAddZone] = useState("");

  const instant = useMemo(() => {
    const match = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})/.exec(when);
    if (!match) return null;
    const [, y, m, d, h, min] = match.map(Number);
    return zonedTimeToInstant(sourceZone, y, m, d, h, min);
  }, [when, sourceZone]);

  const rows = useMemo(() => {
    if (!instant) return [];
    const list = [sourceZone, ...cities.filter((zone) => zone !== sourceZone)];
    return list.map((zone) => {
      const option = COMMON_ZONES.find((item) => item.id === zone);
      const hour = localHourInZone(instant, zone);
      return {
        zone,
        label: option ? `${option.city}, ${option.country}` : zone,
        time: formatInZone(instant, zone),
        offset: formatOffset(instant, zone),
        working: hour >= 9 && hour < 17,
        night: hour >= 22 || hour < 6,
      };
    });
  }, [instant, cities, sourceZone]);

  const summary = rows.map((row) => `${row.label}: ${row.time}`).join(" · ");

  return (
    <ToolPanel>
      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="Date and time" htmlFor="tz-when">
          <TextInput
            id="tz-when"
            type="datetime-local"
            value={when}
            onChange={(event) => setWhen(event.target.value)}
          />
        </Field>
        <Field label="This time is in" htmlFor="tz-source">
          <Select id="tz-source" value={sourceZone} onChange={(event) => setSourceZone(event.target.value)}>
            {COMMON_ZONES.map((zone) => (
              <option key={zone.id} value={zone.id}>
                {zone.city} — {zone.country}
              </option>
            ))}
          </Select>
        </Field>
      </div>

      <div className="mt-4 overflow-hidden rounded-xl border border-[var(--border)]">
        <ul className="divide-y divide-[var(--border)]">
          {rows.map((row) => (
            <li
              key={row.zone}
              className={cn(
                "flex flex-wrap items-center justify-between gap-2 px-3 py-2.5",
                row.zone === sourceZone ? "bg-brand-50/60 dark:bg-brand-500/10" : "bg-[var(--surface)]",
              )}
            >
              <div className="min-w-0">
                <p className="text-sm font-semibold text-[var(--text)]">{row.label}</p>
                <p className="text-[0.7rem] text-[var(--text-subtle)]">
                  {row.offset} · {row.working ? "working hours" : row.night ? "night" : "outside office hours"}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span aria-live="polite" className="font-mono text-sm text-[var(--text)]">
                  {row.time}
                </span>
                {row.zone === sourceZone ? (
                  <span className="chip">Source</span>
                ) : (
                  <button
                    type="button"
                    aria-label={`Remove ${row.label}`}
                    onClick={() => setCities((current) => current.filter((zone) => zone !== row.zone))}
                    className="rounded p-1 text-[var(--text-subtle)] hover:text-[var(--text)]"
                  >
                    <X className="size-3.5" aria-hidden />
                  </button>
                )}
                <span
                  aria-hidden
                  className={cn(
                    "size-2 rounded-full",
                    row.working ? "bg-emerald-500" : row.night ? "bg-slate-400" : "bg-amber-500",
                  )}
                />
              </div>
            </li>
          ))}
        </ul>
      </div>

      <div className="mt-3 flex flex-wrap items-end gap-2">
        <div className="min-w-56 flex-1">
          <label htmlFor="tz-add" className="label">
            Add a city
          </label>
          <Select
            id="tz-add"
            value={addZone}
            onChange={(event) => {
              const value = event.target.value;
              if (value && !cities.includes(value)) setCities((current) => [...current, value]);
              setAddZone("");
            }}
          >
            <option value="">Choose a city…</option>
            {COMMON_ZONES.filter((zone) => zone.id !== sourceZone && !cities.includes(zone.id)).map((zone) => (
              <option key={zone.id} value={zone.id}>
                {zone.city} — {zone.country}
              </option>
            ))}
          </Select>
        </div>
        <Button size="sm" variant="secondary" onClick={() => setWhen(toLocalInput(new Date()))}>
          <Plus className="size-3.5" aria-hidden /> Use now
        </Button>
        <CopyButton text={summary} label="Copy times" />
      </div>

      <p className="mt-3 text-xs text-[var(--text-subtle)]">
        Offsets are resolved from the IANA time-zone database through your browser for the specific
        date, so daylight saving is applied automatically. Green marks 09:00–17:00 local time.
      </p>
    </ToolPanel>
  );
}
