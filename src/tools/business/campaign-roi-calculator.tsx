"use client";

import { useMemo, useState } from "react";
import { Callout, CopyButton, Field, ResultCard, SimpleTable, StatGrid, TextInput, ToolPanel } from "@/components/ui";
import { campaignRoi, formatMoney } from "@/lib/business";

export default function CampaignRoiCalculator() {
  const [spend, setSpend] = useState("1000");
  const [revenue, setRevenue] = useState("3200");
  const [leads, setLeads] = useState("120");
  const [conversions, setConversions] = useState("32");

  const result = useMemo(
    () => campaignRoi({ spend: Number(spend), revenue: Number(revenue), leads: Number(leads), conversions: Number(conversions) }),
    [spend, revenue, leads, conversions],
  );

  const text = `Spend ${formatMoney(Number(spend))} → revenue ${formatMoney(Number(revenue))}: ROI ${Number.isFinite(result.roi) ? result.roi.toFixed(1) : "—"}%, ROAS ${Number.isFinite(result.roas) ? result.roas.toFixed(2) : "—"}×`;

  return (
    <ToolPanel>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Field label="Campaign spend" htmlFor="roi-spend">
          <TextInput id="roi-spend" type="number" min={0} step="10" value={spend} onChange={(event) => setSpend(event.target.value)} className="font-mono" />
        </Field>
        <Field label="Revenue attributed" htmlFor="roi-revenue" hint="Only revenue you can trace to the campaign.">
          <TextInput id="roi-revenue" type="number" min={0} step="10" value={revenue} onChange={(event) => setRevenue(event.target.value)} className="font-mono" />
        </Field>
        <Field label="Leads" htmlFor="roi-leads" optional>
          <TextInput id="roi-leads" type="number" min={0} value={leads} onChange={(event) => setLeads(event.target.value)} className="font-mono" />
        </Field>
        <Field label="Sales" htmlFor="roi-sales" optional>
          <TextInput id="roi-sales" type="number" min={0} value={conversions} onChange={(event) => setConversions(event.target.value)} className="font-mono" />
        </Field>
      </div>

      <div className="mt-6">
        <ResultCard
          label="Return on investment"
          value={Number.isFinite(result.roi) ? `${result.roi.toFixed(1)}%` : "—"}
          sub={Number.isFinite(result.roas) ? `${result.roas.toFixed(2)}× return on ad spend · ${formatMoney(result.profit)} profit` : "Enter a spend to calculate"}
          tone="brand"
          actions={<CopyButton text={text} label="Copy" />}
        >
          <StatGrid
            columns={4}
            items={[
              { label: "Profit", value: formatMoney(result.profit) },
              { label: "ROAS", value: Number.isFinite(result.roas) ? `${result.roas.toFixed(2)}×` : "—" },
              { label: "Cost per lead", value: result.cpl === null ? "—" : formatMoney(result.cpl) },
              { label: "Cost per sale", value: result.cpa === null ? "—" : formatMoney(result.cpa) },
            ]}
          />
          <div className="mt-4">
            <SimpleTable
              head={["Measure", "Value", "Reads as"]}
              caption="ROI and ROAS are not the same thing"
              rows={[
                ["ROI", Number.isFinite(result.roi) ? `${result.roi.toFixed(1)}%` : "—", "Profit as a share of spend"],
                ["ROAS", Number.isFinite(result.roas) ? `${result.roas.toFixed(2)}×` : "—", "Revenue for every unit spent"],
                ["Net profit", formatMoney(result.profit), "Revenue minus spend"],
                ["Margin", Number(revenue) > 0 ? `${((result.profit / Number(revenue)) * 100).toFixed(1)}%` : "—", "Profit as a share of revenue"],
              ]}
            />
          </div>
        </ResultCard>
      </div>

      {result.issues.map((issue) => (
        <Callout key={issue} tone="warning">
          {issue}
        </Callout>
      ))}

      <p className="mt-4 text-xs leading-relaxed text-[var(--text-subtle)]">
        Attribution is the weak point, not the arithmetic: last-click models over-credit the final channel, while
        view-through windows over-credit display. Use the same attribution window for every campaign you compare, and
        remember that revenue is not profit — a 300% ROI on a product with a 20% margin is not a good campaign once cost
        of goods is included.
      </p>
    </ToolPanel>
  );
}
