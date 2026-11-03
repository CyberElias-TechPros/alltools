"use client";

import { FormTool, str } from "@/components/tools/form-tool";
import { businessDaysBetween, calendarAge, daysBetween } from "@/lib/calc";
import { parseIsoDate, todayIso } from "@/lib/utils";

function parseDate(value: string): Date | null {
  const parsed = parseIsoDate(value);
  return parsed instanceof Date && !Number.isNaN(parsed.getTime()) ? parsed : null;
}

export default function DateDifferenceCalculator() {
  return (
    <FormTool
      spec={{
        columns: 3,
        fields: [
          { kind: "date", id: "start", label: "Start date", value: todayIso() },
          { kind: "date", id: "end", label: "End date", value: todayIso() },
          { kind: "toggle", id: "inclusive", label: "Count both end dates", value: false, hint: "Include the first and last day" },
        ],
        compute: (values) => {
          const start = parseDate(str(values, "start"));
          const end = parseDate(str(values, "end"));
          if (!start || !end) return { error: "Pick both dates." };

          const earlier = start.getTime() <= end.getTime() ? start : end;
          const later = start.getTime() <= end.getTime() ? end : start;
          const inclusive = str(values, "inclusive") === "true";
          const totalDays = Math.abs(daysBetween(earlier, later, inclusive));
          const calendar = calendarAge(earlier, later);
          const business = businessDaysBetween(earlier, later);

          const weeks = Math.floor(totalDays / 7);
          const leftoverDays = totalDays % 7;
          const diffText = [
            calendar ? `${calendar.years} year${calendar.years === 1 ? "" : "s"}` : null,
            calendar ? `${calendar.months} month${calendar.months === 1 ? "" : "s"}` : null,
            calendar ? `${calendar.days} day${calendar.days === 1 ? "" : "s"}` : null,
          ]
            .filter(Boolean)
            .join(", ");

          return {
            label: "Days between the dates",
            value: totalDays.toLocaleString(),
            sub: `${diffText || "0 days"} in calendar terms${inclusive ? " (both dates counted)" : ""}.`,
            stats: [
              { label: "Total days", value: totalDays.toLocaleString() },
              { label: "Weeks", value: `${weeks}${leftoverDays ? ` + ${leftoverDays} d` : ""}` },
              { label: "Weekdays (Mon–Fri)", value: business.toLocaleString() },
              { label: "Weekend days", value: Math.max(totalDays - business, 0).toLocaleString() },
              { label: "Hours", value: (totalDays * 24).toLocaleString() },
              { label: "Minutes", value: (totalDays * 1440).toLocaleString() },
            ],
            table: {
              head: ["Measure", "Value"],
              rows: [
                ["Earlier date", earlier.toISOString().slice(0, 10)],
                ["Later date", later.toISOString().slice(0, 10)],
                ["Calendar gap", diffText || "0 days"],
                ["Business days", business.toLocaleString()],
              ],
              caption: "Date detail",
            },
            note:
              "Calendar months are not fixed lengths, so the years/months/days figure and the total days differ: 31 January to 1 March is one month and one day, but 29 days.",
          };
        },
        footnote: "Weekdays count Monday to Friday and ignore public holidays — add them in by hand if you are planning a project.",
      }}
    />
  );
}
