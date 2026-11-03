"use client";

import { useMemo, useState } from "react";
import { Callout, CopyButton, DownloadButton, Field, ResultCard, Select, SimpleTable, StatGrid, TextInput, ToolPanel } from "@/components/ui";
import { contentCalendar } from "@/lib/business";

export default function ContentCalendarGenerator() {
  const [startDate, setStartDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [weeks, setWeeks] = useState("4");
  const [postsPerWeek, setPostsPerWeek] = useState("3");
  const [channels, setChannels] = useState("Blog, LinkedIn, Instagram");

  const channelList = channels.split(",").map((channel) => channel.trim()).filter(Boolean);
  const entries = useMemo(
    () => contentCalendar({ startDate, weeks: Number(weeks), postsPerWeek: Number(postsPerWeek), channels: channelList }),
    [startDate, weeks, postsPerWeek, channels],
  );

  const rows = entries.map((entry) => [entry.day, entry.date, entry.channel, entry.idea]);
  const tsv = ["Day\tDate\tChannel\tIdea", ...rows.map((row) => row.join("\t"))].join("\n");

  return (
    <ToolPanel>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Field label="Start date" htmlFor="cal-start">
          <TextInput id="cal-start" type="date" value={startDate} onChange={(event) => setStartDate(event.target.value)} className="font-mono" />
        </Field>
        <Field label="Weeks" htmlFor="cal-weeks">
          <Select id="cal-weeks" value={weeks} onChange={(event) => setWeeks(event.target.value)}>
            {[2, 4, 6, 8, 12].map((value) => (
              <option key={value} value={value}>
                {value} weeks
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Posts per week" htmlFor="cal-posts">
          <Select id="cal-posts" value={postsPerWeek} onChange={(event) => setPostsPerWeek(event.target.value)}>
            {[1, 2, 3, 4, 5, 7].map((value) => (
              <option key={value} value={value}>
                {value}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Channels" htmlFor="cal-channels" hint="Comma separated; posts rotate through them.">
          <TextInput id="cal-channels" value={channels} onChange={(event) => setChannels(event.target.value)} />
        </Field>
      </div>

      <div className="mt-6">
        {entries.length ? (
          <ResultCard
            label="Content calendar"
            value={`${entries.length} posts`}
            sub={`${weeks} weeks across ${channelList.length || 1} channel${channelList.length === 1 ? "" : "s"}`}
            tone="brand"
            actions={
              <>
                <CopyButton text={tsv} label="Copy TSV" />
                <DownloadButton filename="content-calendar.tsv" content={tsv} label="Download" />
              </>
            }
          >
            <StatGrid
              columns={3}
              items={[
                { label: "Posts", value: String(entries.length) },
                { label: "Per week", value: postsPerWeek },
                { label: "Channels", value: String(channelList.length) },
              ]}
            />
            <div className="mt-4">
              <SimpleTable head={["Day", "Date", "Channel", "Idea"]} rows={rows} caption="Paste into a spreadsheet or Notion table" />
            </div>
          </ResultCard>
        ) : (
          <Callout tone="info">Pick a valid start date to generate the schedule.</Callout>
        )}
      </div>

      <Callout tone="info">
        Ideas rotate through a bank of twelve formats — how-to, myth-busting, case study, checklist and so on — so the
        calendar has variety without inventing topics you cannot actually write. Swap in your own angles once the cadence
        holds for a month.
      </Callout>

      <p className="mt-4 text-xs leading-relaxed text-[var(--text-subtle)]">
        Consistency beats volume: three posts a week for a year outperforms a fortnight of daily posting followed by
        silence. The schedule spaces posts evenly within each week rather than stacking them on one day, and it does not
        account for your publishing capacity — that check is yours.
      </p>
    </ToolPanel>
  );
}
