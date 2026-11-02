"use client";

import { useMemo, useState } from "react";
import { Button, Callout, CopyButton, Field, ResultCard, SimpleTable, StatGrid, TextInput, ToolPanel } from "@/components/ui";
import { formatMoney, marketingBudget } from "@/lib/business";

interface Channel {
  id: number;
  name: string;
  percent: string;
}

const SEED: Channel[] = [
  { id: 1, name: "Paid search", percent: "40" },
  { id: 2, name: "Social ads", percent: "30" },
  { id: 3, name: "Content and SEO", percent: "20" },
  { id: 4, name: "Email", percent: "10" },
];

export default function MarketingBudgetCalculator() {
  const [total, setTotal] = useState("10000");
  const [channels, setChannels] = useState<Channel[]>(SEED);
  const [leads, setLeads] = useState("250");
  const [nextId, setNextId] = useState(5);

  const result = useMemo(
    () => marketingBudget({ total: Number(total), channels: channels.map((channel) => ({ name: channel.name, percent: Number(channel.percent) })) }),
    [total, channels],
  );

  const leadCount = Number(leads) || 0;
  const text = result.rows.map((row) => `${row.name}: ${formatMoney(row.amount)} (${row.percent}%)`).join("\n");

  const update = (id: number, patch: Partial<Channel>) => setChannels((current) => current.map((channel) => (channel.id === id ? { ...channel, ...patch } : channel)));

  return (
    <ToolPanel>
      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="Total budget" htmlFor="mb-total">
          <TextInput id="mb-total" type="number" min={0} step="100" value={total} onChange={(event) => setTotal(event.target.value)} className="font-mono" />
        </Field>
        <Field label="Expected leads" htmlFor="mb-leads" hint="Optional — gives a cost per lead.">
          <TextInput id="mb-leads" type="number" min={0} value={leads} onChange={(event) => setLeads(event.target.value)} className="font-mono" />
        </Field>
      </div>

      <div className="mt-4 space-y-2">
        {channels.map((channel) => (
          <div key={channel.id} className="grid grid-cols-[1fr_5rem_2rem] gap-2">
            <TextInput aria-label="Channel" value={channel.name} onChange={(event) => update(channel.id, { name: event.target.value })} placeholder="Channel" />
            <TextInput aria-label={`${channel.name || "Channel"} percent`} type="number" min={0} max={100} value={channel.percent} onChange={(event) => update(channel.id, { percent: event.target.value })} className="font-mono" />
            <Button variant="ghost" size="sm" aria-label="Remove channel" onClick={() => setChannels((current) => current.filter((item) => item.id !== channel.id))}>
              ✕
            </Button>
          </div>
        ))}
      </div>

      <div className="mt-3">
        <Button
          onClick={() => {
            setChannels((current) => [...current, { id: nextId, name: "", percent: "0" }]);
            setNextId((value) => value + 1);
          }}
        >
          Add channel
        </Button>
      </div>

      <div className="mt-6">
        <ResultCard
          label="Budget split"
          value={formatMoney(result.allocated)}
          sub={`${result.remaining >= 0 ? `${formatMoney(result.remaining)} unallocated` : `${formatMoney(Math.abs(result.remaining))} over budget`}${leadCount > 0 ? ` · ${formatMoney(result.allocated / leadCount)} per lead` : ""}`}
          tone="brand"
          actions={<CopyButton text={text} label="Copy split" />}
        >
          <StatGrid
            columns={3}
            items={[
              { label: "Total budget", value: formatMoney(Number(total) || 0) },
              { label: "Allocated", value: formatMoney(result.allocated) },
              { label: "Cost per lead", value: leadCount > 0 ? formatMoney(result.allocated / leadCount) : "—" },
            ]}
          />
          <div className="mt-4">
            <SimpleTable head={["Channel", "Share", "Amount"]} rows={result.rows.map((row) => [row.name, `${row.percent}%`, formatMoney(row.amount)])} caption="Where the money goes" />
          </div>
        </ResultCard>
      </div>

      {result.issues.map((issue) => (
        <Callout key={issue} tone="warning">
          {issue}
        </Callout>
      ))}

      <p className="mt-4 text-xs leading-relaxed text-[var(--text-subtle)]">
        Leave 10–20% unallocated for the channel that proves itself mid-quarter. A split is a hypothesis, not a plan:
        allocate in small increments, measure cost per acquisition by channel, and move budget towards what converts
        rather than what looks busy.
      </p>
    </ToolPanel>
  );
}
