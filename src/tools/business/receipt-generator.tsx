"use client";

import { useMemo, useState } from "react";
import { Button, Callout, CopyButton, DownloadButton, Field, ResultCard, Select, TextInput, ToolPanel } from "@/components/ui";
import { invoiceTotals, receiptText } from "@/lib/business";

interface Row {
  id: number;
  description: string;
  quantity: string;
  unitPrice: string;
}

const SEED: Row[] = [
  { id: 1, description: "Espresso", quantity: "2", unitPrice: "3.5" },
  { id: 2, description: "Croissant", quantity: "1", unitPrice: "2.8" },
];

const METHODS = ["Card", "Cash", "Bank transfer", "Mobile money", "Voucher"];

export default function ReceiptGenerator() {
  const [store, setStore] = useState("Corner Coffee");
  const [reference, setReference] = useState("R-0042");
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [items, setItems] = useState<Row[]>(SEED);
  const [taxRate, setTaxRate] = useState("0");
  const [method, setMethod] = useState("Card");
  const [note, setNote] = useState("");
  const [nextId, setNextId] = useState(3);

  const totals = useMemo(
    () => invoiceTotals({ items: items.map((item) => ({ description: item.description, quantity: Number(item.quantity), unitPrice: Number(item.unitPrice) })), taxRate: Number(taxRate) }),
    [items, taxRate],
  );

  const text = receiptText({
    storeName: store,
    reference,
    date,
    items: items.map((item) => ({ description: item.description, quantity: Number(item.quantity), unitPrice: Number(item.unitPrice) })),
    taxRate: Number(taxRate),
    paymentMethod: method,
    note,
  });

  const update = (id: number, patch: Partial<Row>) => setItems((current) => current.map((item) => (item.id === id ? { ...item, ...patch } : item)));

  return (
    <ToolPanel>
      <div className="grid gap-3 sm:grid-cols-4">
        <Field label="Business name" htmlFor="rec-store">
          <TextInput id="rec-store" value={store} onChange={(event) => setStore(event.target.value)} />
        </Field>
        <Field label="Receipt number" htmlFor="rec-ref">
          <TextInput id="rec-ref" value={reference} onChange={(event) => setReference(event.target.value)} className="font-mono" />
        </Field>
        <Field label="Date" htmlFor="rec-date">
          <TextInput id="rec-date" type="date" value={date} onChange={(event) => setDate(event.target.value)} className="font-mono" />
        </Field>
        <Field label="Paid by" htmlFor="rec-method">
          <Select id="rec-method" value={method} onChange={(event) => setMethod(event.target.value)}>
            {METHODS.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </Select>
        </Field>
      </div>

      <div className="mt-4 space-y-2">
        {items.map((item) => (
          <div key={item.id} className="grid grid-cols-[1fr_4rem_6rem_2rem] gap-2">
            <TextInput aria-label="Item" value={item.description} onChange={(event) => update(item.id, { description: event.target.value })} placeholder="Item" />
            <TextInput aria-label="Quantity" type="number" min={0} step="any" value={item.quantity} onChange={(event) => update(item.id, { quantity: event.target.value })} className="font-mono" />
            <TextInput aria-label="Price" type="number" min={0} step="0.01" value={item.unitPrice} onChange={(event) => update(item.id, { unitPrice: event.target.value })} className="font-mono" />
            <Button variant="ghost" size="sm" aria-label="Remove item" onClick={() => setItems((current) => current.filter((row) => row.id !== item.id))}>
              ✕
            </Button>
          </div>
        ))}
      </div>

      <div className="mt-3 flex flex-wrap items-end gap-3">
        <Button
          onClick={() => {
            setItems((current) => [...current, { id: nextId, description: "", quantity: "1", unitPrice: "" }]);
            setNextId((value) => value + 1);
          }}
        >
          Add item
        </Button>
        <Field label="Tax %" htmlFor="rec-tax" className="w-24">
          <TextInput id="rec-tax" type="number" min={0} max={100} step="0.5" value={taxRate} onChange={(event) => setTaxRate(event.target.value)} className="font-mono" />
        </Field>
        <Field label="Footer note" htmlFor="rec-note" className="min-w-48 flex-1" optional>
          <TextInput id="rec-note" value={note} onChange={(event) => setNote(event.target.value)} placeholder="Returns within 14 days with this receipt" />
        </Field>
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-[22rem_1fr]">
        <pre className="border border-[var(--border)] bg-[var(--surface-muted)] p-4 font-mono text-[0.75rem] leading-relaxed whitespace-pre">{text}</pre>
        <ResultCard
          label="Total"
          value={`${totals.total.toFixed(2)}`}
          sub={`${items.length} item${items.length === 1 ? "" : "s"} · paid by ${method.toLowerCase()}`}
          tone="brand"
          actions={
            <>
              <CopyButton text={text} label="Copy" />
              <DownloadButton filename={`${reference || "receipt"}.txt`} content={text} label="Download" />
            </>
          }
        >
          <p className="text-xs leading-relaxed text-[var(--text-subtle)]">
            The layout is fixed-width so it survives a paste into email, a messaging app or a thermal-printer utility
            that expects plain text. Change the font to a monospace in your editor if the columns shift.
          </p>
        </ResultCard>
      </div>

      {totals.issues.map((issue) => (
        <Callout key={issue} tone="warning">
          {issue}
        </Callout>
      ))}

      <p className="mt-4 text-xs leading-relaxed text-[var(--text-subtle)]">
        A receipt is evidence of payment, not an invoice: it records what was paid and how. In many jurisdictions a
        business must keep copies for several years, so save the downloaded file before clearing the page.
      </p>
    </ToolPanel>
  );
}
