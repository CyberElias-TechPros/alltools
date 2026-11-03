"use client";

import { useMemo, useState } from "react";
import { CopyButton, Field, TextInput, ToolPanel, Callout } from "@/components/ui";

export default function UtmLinkBuilder() {
  const [destination, setDestination] = useState("https://example.com/pricing");
  const [source, setSource] = useState("newsletter");
  const [medium, setMedium] = useState("email");
  const [campaign, setCampaign] = useState("spring-launch");
  const [term, setTerm] = useState("");
  const [content, setContent] = useState("");

  const { url, error } = useMemo(() => {
    if (!destination.trim()) return { url: "", error: "" };
    try {
      const parsed = new URL(destination.trim());
      if (!/^https?:$/.test(parsed.protocol)) {
        return { url: "", error: "Use an http:// or https:// URL." };
      }
      const params: Array<[string, string]> = [
        ["utm_source", source],
        ["utm_medium", medium],
        ["utm_campaign", campaign],
        ["utm_term", term],
        ["utm_content", content],
      ];
      for (const [key, value] of params) {
        if (value.trim()) parsed.searchParams.set(key, value.trim().toLowerCase().replace(/\s+/g, "-"));
      }
      return { url: parsed.toString(), error: "" };
    } catch {
      return { url: "", error: "That does not look like a valid URL. Include https:// at the start." };
    }
  }, [destination, source, medium, campaign, term, content]);

  return (
    <ToolPanel>
      <div className="grid gap-3">
        <Field label="Destination URL" htmlFor="utm-url" hint="Include https:// — existing query parameters are preserved.">
          <TextInput
            id="utm-url"
            value={destination}
            onChange={(event) => setDestination(event.target.value)}
            className="font-mono text-[0.85rem]"
            spellCheck={false}
          />
        </Field>
        <div className="grid gap-3 sm:grid-cols-3">
          <Field label="Source" htmlFor="utm-source" hint="google, newsletter">
            <TextInput id="utm-source" value={source} onChange={(event) => setSource(event.target.value)} />
          </Field>
          <Field label="Medium" htmlFor="utm-medium" hint="cpc, email, social">
            <TextInput id="utm-medium" value={medium} onChange={(event) => setMedium(event.target.value)} />
          </Field>
          <Field label="Campaign" htmlFor="utm-campaign" hint="spring-launch">
            <TextInput id="utm-campaign" value={campaign} onChange={(event) => setCampaign(event.target.value)} />
          </Field>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="Term" htmlFor="utm-term" optional hint="Paid keyword">
            <TextInput id="utm-term" value={term} onChange={(event) => setTerm(event.target.value)} />
          </Field>
          <Field label="Content" htmlFor="utm-content" optional hint="Ad or link variant">
            <TextInput id="utm-content" value={content} onChange={(event) => setContent(event.target.value)} />
          </Field>
        </div>
      </div>

      <div className="mt-4 rounded-xl border border-[var(--border)] bg-[var(--code-bg)] p-3">
        <div className="flex items-center justify-between gap-2">
          <span className="text-[0.7rem] font-bold uppercase tracking-[0.08em] text-[var(--text-subtle)]">
            Tracking URL
          </span>
          <CopyButton text={url} />
        </div>
        <p aria-live="polite" className="mt-2 break-all font-mono text-[0.8rem] text-[var(--text)]">
          {url || <span className="text-[var(--text-subtle)]">Your tagged URL appears here.</span>}
        </p>
      </div>

      {error ? (
        <div className="mt-3">
          <Callout tone="warning">{error}</Callout>
        </div>
      ) : null}

      <div className="mt-4 grid gap-2 sm:grid-cols-3 text-xs">
        {[
          ["utm_source", "Where the traffic came from — google, newsletter, partner."],
          ["utm_medium", "The channel or method — cpc, email, social, referral."],
          ["utm_campaign", "The specific campaign — spring-launch, black-friday."],
        ].map(([key, description]) => (
          <div key={key} className="rounded-lg border border-[var(--border)] bg-[var(--surface-muted)] p-2.5">
            <code className="font-mono text-[0.7rem] font-semibold text-[var(--text)]">{key}</code>
            <p className="mt-1 leading-relaxed text-[var(--text-muted)]">{description}</p>
          </div>
        ))}
      </div>

      <p className="mt-3 text-xs text-[var(--text-subtle)]">
        Keep one naming convention across the team: lowercase, hyphen-separated, and never tagged
        on internal links — UTMs on your own pages restart the session and break attribution.
      </p>
    </ToolPanel>
  );
}
