"use client";

import { useMemo, useState } from "react";
import { Cake } from "lucide-react";
import { CopyButton, Field, ResultCard, StatGrid, TextInput, ToolPanel } from "@/components/ui";
import { calendarAge } from "@/lib/calc";
import { formatNumber, parseIsoDate, todayIso } from "@/lib/utils";

export default function AgeCalculator() {
  const [birth, setBirth] = useState("1995-06-15");
  const [at, setAt] = useState(todayIso());

  const age = useMemo(() => {
    const birthDate = parseIsoDate(birth);
    const atDate = parseIsoDate(at);
    if (!birthDate || !atDate) return { error: "Enter both dates as valid calendar dates." };
    if (birthDate > atDate) return { error: "The date of birth must be before the comparison date." };
    return calendarAge(birthDate, atDate) ?? { error: "Could not calculate an age for those dates." };
  }, [birth, at]);

  const summary =
    "years" in age
      ? `${age.years} years, ${age.months} months, ${age.days} days (${formatNumber(age.totalDays)} total days)`
      : "";

  return (
    <ToolPanel>
      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="Date of birth" htmlFor="age-birth">
          <TextInput
            id="age-birth"
            type="date"
            value={birth}
            max={at}
            onChange={(event) => setBirth(event.target.value)}
          />
        </Field>
        <Field label="Age at date" htmlFor="age-at" hint="Defaults to today — change it for a future date.">
          <TextInput
            id="age-at"
            type="date"
            value={at}
            onChange={(event) => setAt(event.target.value)}
          />
        </Field>
      </div>

      <div className="mt-4">
        {"error" in age ? (
          <ResultCard label="Age" value="—" tone="neutral" sub={age.error} />
        ) : "years" in age ? (
          <ResultCard
            label="Exact age"
            value={`${age.years}y ${age.months}m ${age.days}d`}
            sub={
              <span className="flex flex-wrap items-center gap-x-2 gap-y-1">
                <Cake className="size-4 text-[var(--text-subtle)]" aria-hidden />
                {age.bornOn ? `Born on a ${age.bornOn}` : null}
                {age.daysToNextBirthday !== null
                  ? ` · next birthday in ${formatNumber(age.daysToNextBirthday)} day${age.daysToNextBirthday === 1 ? "" : "s"} (${age.nextBirthday})`
                  : null}
              </span>
            }
            actions={<CopyButton text={summary} />}
          >
            <StatGrid
              columns={4}
              items={[
                { label: "Total days", value: formatNumber(age.totalDays) },
                { label: "Total months", value: formatNumber(age.totalMonths) },
                { label: "Total hours", value: formatNumber(age.totalHours) },
                { label: "Next birthday", value: age.nextBirthday ?? "—" },
              ]}
            />
          </ResultCard>
        ) : null}
      </div>

      <p className="mt-3 text-xs text-[var(--text-subtle)]">
        Calendar age is counted in completed years, months and days using UTC date arithmetic, so
        daylight-saving changes never shift the result by a day.
      </p>
    </ToolPanel>
  );
}
