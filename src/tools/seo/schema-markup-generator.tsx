"use client";

import { useMemo, useState } from "react";
import { CopyButton, DownloadButton, Field, ResultCard, Select, SimpleTable, TextInput, ToolPanel } from "@/components/ui";
import { buildSchema, type SchemaKind } from "@/lib/seo-tools";

const KINDS: Array<{ value: SchemaKind; label: string }> = [
  { value: "Article", label: "Article / blog post" },
  { value: "Product", label: "Product with offer" },
  { value: "LocalBusiness", label: "Local business" },
  { value: "Organization", label: "Organization" },
  { value: "WebSite", label: "WebSite" },
  { value: "FAQPage", label: "FAQ page (use the FAQ generator for pairs)" },
];

export default function SchemaMarkupGenerator() {
  const [kind, setKind] = useState<SchemaKind>("Article");
  const [name, setName] = useState("How to choose a strong password");
  const [url, setUrl] = useState("https://example.com/guides/strong-passwords");
  const [description, setDescription] = useState("A practical guide to password length, entropy and password managers.");
  const [image, setImage] = useState("https://example.com/images/passwords.png");
  const [author, setAuthor] = useState("Example Tools");
  const [publisher, setPublisher] = useState("Example Tools");
  const [datePublished, setDatePublished] = useState("2025-11-02");
  const [price, setPrice] = useState("19.00");
  const [currency, setCurrency] = useState("USD");
  const [telephone, setTelephone] = useState("+44 20 7946 0958");
  const [address, setAddress] = useState("1 Example Street, London");

  const result = useMemo(
    () =>
      buildSchema({
        kind,
        name,
        url,
        description,
        image,
        author,
        publisher,
        datePublished,
        price,
        currency,
        telephone,
        address,
        faqs: [],
        breadcrumbs: [],
      }),
    [kind, name, url, description, image, author, publisher, datePublished, price, currency, telephone, address],
  );

  return (
    <ToolPanel>
      <div className="grid gap-5 lg:grid-cols-2">
        <div className="space-y-3">
          <Field label="Schema type" htmlFor="schema-kind">
            <Select id="schema-kind" value={kind} onChange={(event) => setKind(event.target.value as SchemaKind)}>
              {KINDS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </Select>
          </Field>

          {kind === "FAQPage" ? (
            <p className="border border-[var(--border)] bg-[var(--surface-muted)] p-3 text-sm leading-relaxed text-[var(--text-subtle)]">
              FAQ markup needs question/answer pairs. Use the FAQ Schema Generator, which accepts a list of pairs and
              writes the correct <span className="font-mono">mainEntity</span> array.
            </p>
          ) : (
            <>
              <Field label="Name / headline" htmlFor="schema-name">
                <TextInput id="schema-name" value={name} onChange={(event) => setName(event.target.value)} />
              </Field>
              <Field label="URL" htmlFor="schema-url">
                <TextInput
                  id="schema-url"
                  value={url}
                  onChange={(event) => setUrl(event.target.value)}
                  className="font-mono text-[0.8rem]"
                  spellCheck={false}
                />
              </Field>
              <Field label="Description" htmlFor="schema-description">
                <TextInput
                  id="schema-description"
                  value={description}
                  onChange={(event) => setDescription(event.target.value)}
                />
              </Field>
              <Field label="Image URL" htmlFor="schema-image">
                <TextInput
                  id="schema-image"
                  value={image}
                  onChange={(event) => setImage(event.target.value)}
                  className="font-mono text-[0.8rem]"
                  spellCheck={false}
                />
              </Field>

              {kind === "Article" ? (
                <div className="grid gap-3 sm:grid-cols-2">
                  <Field label="Author" htmlFor="schema-author">
                    <TextInput id="schema-author" value={author} onChange={(event) => setAuthor(event.target.value)} />
                  </Field>
                  <Field label="Publisher" htmlFor="schema-publisher">
                    <TextInput
                      id="schema-publisher"
                      value={publisher}
                      onChange={(event) => setPublisher(event.target.value)}
                    />
                  </Field>
                  <Field label="Date published" htmlFor="schema-date">
                    <TextInput
                      id="schema-date"
                      type="date"
                      value={datePublished}
                      onChange={(event) => setDatePublished(event.target.value)}
                      className="font-mono"
                    />
                  </Field>
                </div>
              ) : null}

              {kind === "Product" ? (
                <div className="grid gap-3 sm:grid-cols-2">
                  <Field label="Price" htmlFor="schema-price">
                    <TextInput
                      id="schema-price"
                      value={price}
                      onChange={(event) => setPrice(event.target.value)}
                      className="font-mono"
                    />
                  </Field>
                  <Field label="Currency" htmlFor="schema-currency">
                    <TextInput
                      id="schema-currency"
                      value={currency}
                      onChange={(event) => setCurrency(event.target.value.toUpperCase())}
                      className="font-mono"
                    />
                  </Field>
                </div>
              ) : null}

              {kind === "LocalBusiness" ? (
                <div className="grid gap-3 sm:grid-cols-2">
                  <Field label="Telephone" htmlFor="schema-phone">
                    <TextInput
                      id="schema-phone"
                      value={telephone}
                      onChange={(event) => setTelephone(event.target.value)}
                      className="font-mono"
                    />
                  </Field>
                  <Field label="Street address" htmlFor="schema-address">
                    <TextInput id="schema-address" value={address} onChange={(event) => setAddress(event.target.value)} />
                  </Field>
                </div>
              ) : null}
            </>
          )}
        </div>

        <div>
          <div className="mb-2 flex items-center justify-between gap-2">
            <span className="label !mb-0">JSON-LD</span>
            <div className="flex gap-1">
              <CopyButton text={result.script} label="Copy" />
              <DownloadButton filename="schema.json" content={result.json} mime="application/ld+json" label="Download" />
            </div>
          </div>
          <pre className="max-h-[26rem] overflow-auto border border-[var(--border)] bg-[var(--page-elevated)] p-3 font-mono text-[0.74rem] leading-relaxed text-[var(--text)]">
            {result.script}
          </pre>

          <div className="mt-4">
            <ResultCard
              label="Checks"
              value={result.issues.length ? `${result.issues.length} issue(s)` : "Complete"}
              tone="brand"
              sub="Required properties for the selected type."
            >
              <SimpleTable
                head={["Status", "Finding"]}
                rows={
                  result.issues.length
                    ? result.issues.map((issue) => ["Fix", issue])
                    : [["OK", "All required properties are present."]]
                }
              />
            </ResultCard>
          </div>
        </div>
      </div>

      <p className="mt-5 text-xs leading-relaxed text-[var(--text-subtle)]">
        Only mark up what is visibly on the page. Schema that describes hidden content, fake reviews or invented prices
        breaks search guidelines and can cost you rich results entirely.
      </p>
    </ToolPanel>
  );
}
