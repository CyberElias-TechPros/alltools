"use client";

import { useMemo, useState } from "react";
import { Callout, CopyButton, DownloadButton, Field, Switch, TextArea, TextInput, ToolPanel } from "@/components/ui";
import { buildPrivacyPolicy, buildTerms, type PolicyInput } from "@/lib/security";

const COLLECT_OPTIONS = [
  "Contact details you send us by email",
  "Server logs containing IP addresses",
  "Tool inputs, processed only in your browser and never transmitted",
  "Cookies for preferences and consent state",
  "Analytics events in aggregate",
];

/** Shared generator for the privacy policy and terms drafts. */
export function PolicyTool({ mode }: { mode: "privacy" | "terms" }) {
  const [input, setInput] = useState<PolicyInput>({
    siteName: "Example Tools",
    siteUrl: "https://example.com",
    contactEmail: "privacy@example.com",
    country: "England and Wales",
    collects: [COLLECT_OPTIONS[0], COLLECT_OPTIONS[2]],
    usesCookies: true,
    usesAnalytics: false,
    usesAds: false,
    sellsData: false,
    children: false,
    updated: new Date().toISOString().slice(0, 10),
  });

  const document = useMemo(
    () => (mode === "privacy" ? buildPrivacyPolicy(input) : buildTerms(input)),
    [mode, input],
  );

  const update = (patch: Partial<PolicyInput>) => setInput((current) => ({ ...current, ...patch }));

  return (
    <ToolPanel>
      <Callout tone="warning">
        This is a structured starting draft, not legal advice. It cannot know which laws apply to you, what your
        processors actually do, or how your jurisdiction treats liability. Have a lawyer review it before publishing.
      </Callout>

      <div className="mt-5 grid gap-5 lg:grid-cols-[22rem_1fr]">
        <div className="space-y-3">
          <Field label="Site name" htmlFor="policy-name">
            <TextInput id="policy-name" value={input.siteName} onChange={(event) => update({ siteName: event.target.value })} />
          </Field>
          <Field label="Site URL" htmlFor="policy-url">
            <TextInput
              id="policy-url"
              value={input.siteUrl}
              onChange={(event) => update({ siteUrl: event.target.value })}
              className="font-mono text-[0.8rem]"
              spellCheck={false}
            />
          </Field>
          <Field label="Contact email" htmlFor="policy-email">
            <TextInput
              id="policy-email"
              value={input.contactEmail}
              onChange={(event) => update({ contactEmail: event.target.value })}
              className="font-mono text-[0.8rem]"
              spellCheck={false}
            />
          </Field>
          {mode === "privacy" ? (
            <>
              <Field label="Jurisdiction / operating location" htmlFor="policy-country">
                <TextInput
                  id="policy-country"
                  value={input.country}
                  onChange={(event) => update({ country: event.target.value })}
                />
              </Field>
              <div>
                <span className="label">What the site collects</span>
                <div className="space-y-1">
                  {COLLECT_OPTIONS.map((option) => {
                    const checked = input.collects.includes(option);
                    return (
                      <label key={option} className="flex cursor-pointer items-start gap-2 text-sm leading-snug">
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() =>
                            update({
                              collects: checked
                                ? input.collects.filter((item) => item !== option)
                                : [...input.collects, option],
                            })
                          }
                          className="mt-0.5 size-4 shrink-0 accent-[var(--ring)]"
                        />
                        <span className="text-[var(--text)]">{option}</span>
                      </label>
                    );
                  })}
                </div>
              </div>
              <Switch
                checked={input.usesCookies}
                onChange={(next) => update({ usesCookies: next })}
                label="The site sets cookies"
                description="Necessary cookies do not need consent; the rest do."
              />
              <Switch
                checked={input.usesAnalytics}
                onChange={(next) => update({ usesAnalytics: next })}
                label="Uses analytics"
                description="Only after consent, and preferably cookieless."
              />
              <Switch
                checked={input.usesAds}
                onChange={(next) => update({ usesAds: next })}
                label="Displays advertising"
              />
              <Switch
                checked={input.sellsData}
                onChange={(next) => update({ sellsData: next })}
                label="Shares data with processors"
                description="Hosting, email and analytics providers count."
              />
            </>
          ) : null}
          <Field label="Last updated" htmlFor="policy-date">
            <TextInput
              id="policy-date"
              type="date"
              value={input.updated}
              onChange={(event) => update({ updated: event.target.value })}
              className="font-mono"
            />
          </Field>
        </div>

        <div>
          <div className="mb-2 flex items-center justify-between gap-2">
            <span className="label !mb-0">{mode === "privacy" ? "privacy-policy.md" : "terms.md"}</span>
            <div className="flex gap-1">
              <CopyButton text={document} label="Copy" />
              <DownloadButton
                filename={mode === "privacy" ? "privacy-policy.md" : "terms.md"}
                content={document}
                mime="text/markdown"
                label="Download"
              />
            </div>
          </div>
          <TextArea
            readOnly
            value={document}
            rows={26}
            aria-label="Generated document"
            className="min-h-[30rem] font-mono text-[0.74rem]"
          />
        </div>
      </div>
    </ToolPanel>
  );
}
