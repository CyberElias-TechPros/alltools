"use client";

import { FormTool, num, str } from "@/components/tools/form-tool";
import { durationBetween } from "@/lib/math";
import { round } from "@/lib/utils";

export default function TimeDurationCalculator() {
  return (
    <FormTool
      spec={{
        columns: 4,
        fields: [
          { kind: "text", id: "start", label: "Start time", value: "09:15", mono: true, hint: "24-hour HH:MM" },
          { kind: "text", id: "end", label: "End time", value: "17:45", mono: true, hint: "Overnight end times work" },
          { kind: "number", id: "breakMinutes", label: "Break", value: "45", unit: "min", min: 0, step: 1, optional: true },
          { kind: "number", id: "rate", label: "Hourly rate", value: "", unit: "$", min: 0, step: 0.01, optional: true, hint: "Optional — for timesheets" },
        ],
        compute: (values) => {
          const pattern = /^(\d{1,2}):(\d{2})$/;
          const startMatch = str(values, "start").trim().match(pattern);
          const endMatch = str(values, "end").trim().match(pattern);
          if (!startMatch) return { error: "Write the start time as HH:MM, for example 09:15." };
          if (!endMatch) return { error: "Write the end time as HH:MM, for example 17:45." };
          const start = { hours: Number(startMatch[1]), minutes: Number(startMatch[2]) };
          const end = { hours: Number(endMatch[1]), minutes: Number(endMatch[2]) };
          if (start.hours > 23 || end.hours > 23 || start.minutes > 59 || end.minutes > 59) {
            return { error: "Hours run 0–23 and minutes 0–59." };
          }
          const duration = durationBetween(start, end);
          const breakMinutes = Math.max(num(values, "breakMinutes", 0) || 0, 0);
          if (breakMinutes >= duration.totalMinutes) {
            return { error: "The break is longer than the shift itself." };
          }
          const netMinutes = duration.totalMinutes - breakMinutes;
          const rate = num(values, "rate");
          const pay = Number.isFinite(rate) ? (netMinutes / 60) * rate : null;

          return {
            label: "Duration",
            value: `${Math.floor(netMinutes / 60)}h ${Math.round(netMinutes % 60)}m`,
            sub: `${duration.hours}h ${duration.minutes}m elapsed${breakMinutes ? `, less a ${breakMinutes}-minute break` : ""}.`,
            stats: [
              { label: "Clock time", value: `${duration.hours}h ${duration.minutes}m ${duration.seconds}s` },
              { label: "Total minutes", value: round(netMinutes, 2).toLocaleString() },
              { label: "Decimal hours", value: round(netMinutes / 60, 3).toFixed(3) },
              { label: pay !== null ? "Gross pay" : "Break deducted", value: pay !== null ? `$${round(pay, 2).toFixed(2)}` : `${breakMinutes} min` },
            ],
            table: {
              head: ["Period", "Hours", "Minutes"],
              rows: [
                ["Gross", (duration.totalMinutes / 60).toFixed(2), duration.totalMinutes.toFixed(0)],
                ["Break", (breakMinutes / 60).toFixed(2), breakMinutes.toFixed(0)],
                ["Net", (netMinutes / 60).toFixed(3), netMinutes.toFixed(0)],
              ],
              caption: "Time breakdown",
            },
            note:
              "Timesheets usually want decimal hours: 7h 30m is 7.5 hours, and 8h 45m is 8.75 hours — multiply by the hourly rate for gross pay.",
          };
        },
        footnote:
          "If the end time is earlier than the start time the calculator assumes the shift crossed midnight, which is what night workers expect.",
      }}
    />
  );
}
