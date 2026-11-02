"use client";

import { useMemo, useState } from "react";
import { Button, Callout, CopyButton, DownloadButton, Field, ResultCard, SimpleTable, StatGrid, TextInput, ToolPanel } from "@/components/ui";
import { formatMoney, invoiceTotals } from "@/lib/business";

interface Row {
  id: number;
  description: string;
  quantity: string;
  unitPrice: string;
}

const SEED: Row[] = [
  { id: 1, description: "Website design", quantity: "1", unitPrice: "1200" },
  { id: 2, description: "Hosting (annual)", quantity: "1", unitPrice: "180" },
  { id: 3, description: "Content writing", quantity: "4", unitPrice: "85" },
];

export default function InvoiceGenerator() {
  const [rows, setRows] = useState<Row[]>(SEED);
  const [nextId, setNextId] = useState(4);
  const [currency, setCurrency] = useState("USD");
  const [taxRate, setTaxRate] = useState("20");
  const [discount, setDiscount] = useState("0");
  const [business, setBusiness] = useState("North Studio\n12 Market Street, Lagos");
  const [client, setClient] = useState("Acme Ltd\n44 Harbour Road, Lagos");
  const [invoiceNumber, setInvoiceNumber] = useState("INV-0001");
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [terms, setTerms] = useState("Payment due within 14 days");

  const totals = useMemo(
    () =>
      invoiceTotals({
        items: rows.map((row) => ({ description: row.description, quantity: Number(row.quantity), unitPrice: Number(row.unitPrice) })),
        taxRate: Number(taxRate),
        discountPercent: Number(discount),
      }),
    [rows, taxRate, discount],
  );

  const text = [
    `INVOICE ${invoiceNumber}`,
    `Date: ${date}`,
    "",
    "FROM",
    business,
    "",
    "BILL TO",
    client,
    "",
    ...totals.lines.map((line) => `${line.quantity} × ${line.description} — ${formatMoney(line.amount, currency)}`),
    "",
    `Subtotal: ${formatMoney(totals.subtotal, currency)}`,
    totals.discount > 0 ? `Discount: -${formatMoney(totals.discount, currency)}` : "",
    `Tax (${taxRate}%): ${formatMoney(totals.tax, currency)}`,
    `TOTAL DUE: ${formatMoney(totals.total, currency)}`,
    "",
    terms,
  ]
    .filter((line) => line !== "")
    .join("\n");

  const update = (id: number, patch: Partial<Row>) => setRows((current) => current.map((row) => (row.id === id ? { ...row, ...patch } : row)));

  return (
    <ToolPanel>
      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="Your business" htmlFor="inv-business" hint="One line per address line.">
          <textarea id="inv-business" className="input min-h-20 font-mono text-[0.8rem]" value={business} onChange={(event) => setBusiness(event.target.value)} />
        </Field>
        <Field label="Bill to" htmlFor="inv-client">
          <textarea id="inv-client" className="input min-h-20 font-mono text-[0.8rem]" value={client} onChange={(event) => setClient(event.target.value)} />
        </Field>
      </div>

      <div className="mt-3 grid gap-3 sm:grid-cols-4">
        <Field label="Invoice number" htmlFor="inv-number">
          <TextInput id="inv-number" value={invoiceNumber} onChange={(event) => setInvoiceNumber(event.target.value)} className="font-mono" />
        </Field>
        <Field label="Date" htmlFor="inv-date">
          <TextInput id="inv-date" type="date" value={date} onChange={(event) => setDate(event.target.value)} className="font-mono" />
        </Field>
        <Field label="Currency" htmlFor="inv-currency" hint="A code or symbol, e.g. USD, GBP, ₦.">
          <TextInput id="inv-currency" value={currency} onChange={(event) => setCurrency(event.target.value)} className="font-mono" />
        </Field>
        <Field label="Tax %" htmlFor="inv-tax">
          <TextInput id="inv-tax" type="number" min={0} max={100} step="0.5" value={taxRate} onChange={(event) => setTaxRate(event.target.value)} className="font-mono" />
        </Field>
      </div>

      <div className="mt-4 space-y-2">
        {rows.map((row) => (
          <div key={row.id} className="grid grid-cols-[1fr_4rem_6rem_2rem] gap-2">
            <TextInput aria-label="Description" value={row.description} onChange={(event) => update(row.id, { description: event.target.value })} placeholder="Description" />
            <TextInput aria-label="Quantity" type="number" min={0} step="any" value={row.quantity} onChange={(event) => update(row.id, { quantity: event.target.value })} className="font-mono" />
            <TextInput aria-label="Unit price" type="number" min={0} step="0.01" value={row.unitPrice} onChange={(event) => update(row.id, { unitPrice: event.target.value })} className="font-mono" />
            <Button variant="ghost" size="sm" aria-label="Remove line" onClick={() => setRows((current) => current.filter((item) => item.id !== row.id))}>
              ✕
            </Button>
          </div>
        ))}
      </div>

      <div className="mt-3 flex flex-wrap items-end gap-3">
        <Button
          onClick={() => {
            setRows((current) => [...current, { id: nextId, description: "", quantity: "1", unitPrice: "" }]);
            setNextId((value) => value + 1);
          }}
        >
          Add line
        </Button>
        <Field label="Discount %" htmlFor="inv-discount" className="w-32">
          <TextInput id="inv-discount" type="number" min={0} max={100} value={discount} onChange={(event) => setDiscount(event.target.value)} className="font-mono" />
        </Field>
        <Field label="Payment terms" htmlFor="inv-terms" className="min-w-48 flex-1">
          <TextInput id="inv-terms" value={terms} onChange={(event) => setTerms(event.target.value)} />
        </Field>
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-[1fr_22rem]">
        <div>
          <div className="mb-2 flex items-center justify-between gap-2">
            <span className="label !mb-0">invoice.txt</span>
            <div className="flex gap-1">
              <CopyButton text={text} label="Copy" />
              <DownloadButton filename={`${invoiceNumber || "invoice"}.txt`} content={text} label="Download" />
            </div>
          </div>
          <pre className="max-h-96 overflow-auto border border-[var(--border)] bg-[var(--surface-muted)] p-4 font-mono text-[0.75rem] leading-relaxed whitespace-pre-wrap">{text}</pre>
        </div>
        <ResultCard label="Total due" value={formatMoney(totals.total, currency)} sub={`${totals.lines.length} lines · tax ${taxRate}%`} tone="brand">
          <StatGrid
            columns={2}
            items={[
              { label: "Subtotal", value: formatMoney(totals.subtotal, currency) },
              { label: "Discount", value: formatMoney(totals.discount, currency) },
              { label: "Tax", value: formatMoney(totals.tax, currency) },
              { label: "Lines", value: String(totals.lines.length) },
            ]}
          />
          <div className="mt-3">
            <SimpleTable
              head={["Item", "Amount"]}
              rows={totals.lines.map((line) => [line.description, formatMoney(line.amount, currency)])}
              caption="Line totals"
            />
          </div>
        </ResultCard>
      </div>

      {totals.issues.map((issue) => (
        <Callout key={issue} tone="warning">
          {issue}
        </Callout>
      ))}

      <p className="mt-4 text-xs leading-relaxed text-[var(--text-subtle)]">
        A text invoice is deliberately plain: it pastes into email, a PDF converter or an accounting tool without losing
        formatting. Tax rules, invoice numbering requirements and what a legally valid invoice must contain vary by
        country — check your local requirements, and keep your own copy of what you sent.
      </p>
    </ToolPanel>
  );
}
