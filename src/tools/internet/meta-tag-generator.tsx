"use client";

import { useMemo, useState } from "react";
import { CopyButton, Field, ResultCard, Select, SimpleTable, Switch, TextArea, TextInput, ToolPanel } from "@/components/ui";
import { buildMetaTags, type MetaInput } from "@/lib/tags";

export default function MetaTagGenerator() {
  const [input, setInput] = useState<MetaInput>({
    title: "Free online tools that run in your browser",
    description:
      "Convert, calculate and check things without uploading a file. Everything runs locally, so nothing you paste leaves your device.",
    url: "https://example.com/tools",
    siteName: "Example Tools",
    image: "https://example.com/og.png",
    type: "website",
    twitterCard: "summary_large_image",
    twitterSite: "@example",
    locale: "en_GB",
    noindex: false,
  });

  const result = useMemo(() => buildMetaTags(input), [input]);
  const update = (patch: Partial<MetaInput>) => setInput((current) => ({ ...current, ...patch }));

  return (
    <ToolPanel>
      <div className="grid gap-5 lg:grid-cols-2">
        <div className="space-y-3">
          <Field label={`Page title — ${input.title.length}/60`} htmlFor="meta-title">
            <TextInput
              id="meta-title"
              value={input.title}
              onChange={(event) => update({ title: event.target.value })}
              invalid={input.title.length > 60}
            />
          </Field>
          <Field
            label={`Meta description — ${input.description.length}/160`}
            htmlFor="meta-description"
            hint="Written for people, not keywords. One clear sentence about what the page does."
          >
            <TextArea
              id="meta-description"
              value={input.description}
              onChange={(event) => update({ description: event.target.value })}
              rows={3}
              invalid={input.description.length > 160}
            />
          </Field>
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Canonical URL" htmlFor="meta-url">
              <TextInput
                id="meta-url"
                value={input.url}
                onChange={(event) => update({ url: event.target.value })}
                className="font-mono text-[0.8rem]"
                spellCheck={false}
              />
            </Field>
            <Field label="Site name" htmlFor="meta-site">
              <TextInput
                id="meta-site"
                value={input.siteName}
                onChange={(event) => update({ siteName: event.target.value })}
              />
            </Field>
            <Field label="Social image URL" htmlFor="meta-image" hint="1200 × 630 px works everywhere.">
              <TextInput
                id="meta-image"
                value={input.image}
                onChange={(event) => update({ image: event.target.value })}
                className="font-mono text-[0.8rem]"
                spellCheck={false}
              />
            </Field>
            <Field label="Locale" htmlFor="meta-locale" hint="og:locale, e.g. en_GB">
              <TextInput
                id="meta-locale"
                value={input.locale}
                onChange={(event) => update({ locale: event.target.value })}
                className="font-mono"
              />
            </Field>
            <Field label="Page type" htmlFor="meta-type">
              <Select
                id="meta-type"
                value={input.type}
                onChange={(event) => update({ type: event.target.value as MetaInput["type"] })}
              >
                <option value="website">website</option>
                <option value="article">article</option>
                <option value="product">product</option>
                <option value="profile">profile</option>
              </Select>
            </Field>
            <Field label="Twitter card" htmlFor="meta-twitter">
              <Select
                id="meta-twitter"
                value={input.twitterCard}
                onChange={(event) => update({ twitterCard: event.target.value as MetaInput["twitterCard"] })}
              >
                <option value="summary_large_image">summary_large_image</option>
                <option value="summary">summary</option>
              </Select>
            </Field>
          </div>
          <Field label="Twitter / X handle" htmlFor="meta-handle">
            <TextInput
              id="meta-handle"
              value={input.twitterSite}
              onChange={(event) => update({ twitterSite: event.target.value })}
              placeholder="@yoursite"
              className="font-mono"
            />
          </Field>
          <Switch
            checked={input.noindex}
            onChange={(next) => update({ noindex: next })}
            label="Add noindex, nofollow"
            description="Only for private or duplicate pages."
          />
        </div>

        <div>
          <div className="mb-2 flex items-center justify-between gap-2">
            <span className="label !mb-0">Generated tags</span>
            <CopyButton text={result.html} label="Copy" />
          </div>
          <pre className="max-h-[22rem] overflow-auto border border-[var(--border)] bg-[var(--page-elevated)] p-3 font-mono text-[0.72rem] leading-relaxed text-[var(--text)]">
            {result.html}
          </pre>

          <div className="mt-5">
            <ResultCard
              label="Review"
              value={`${result.checks.filter((check) => check.level === "ok").length} of ${result.checks.length} checks pass`}
              tone="brand"
              sub="Length and completeness checks against common search and social limits."
            >
              <SimpleTable
                head={["Status", "Check"]}
                caption="Metadata checks"
                rows={result.checks.map((check) => [
                  <span
                    key={check.level}
                    className={
                      check.level === "error"
                        ? "text-[#a12b1c] dark:text-[#ff9a8a]"
                        : check.level === "warning"
                          ? "text-[#8a5a00] dark:text-[#ffc46b]"
                          : "text-[var(--accent-text)]"
                    }
                  >
                    {check.level === "ok" ? "OK" : check.level === "warning" ? "Warn" : "Fix"}
                  </span>,
                  check.message,
                ])}
              />
            </ResultCard>
          </div>
        </div>
      </div>
    </ToolPanel>
  );
}
