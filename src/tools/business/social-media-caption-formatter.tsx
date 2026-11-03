"use client";

import { useMemo, useState } from "react";
import { Callout, CopyButton, Field, ResultCard, Segmented, SimpleTable, StatGrid, Switch, TextArea, TextInput, ToolPanel } from "@/components/ui";
import { PLATFORM_LIMITS, formatCaption } from "@/lib/business";

export default function SocialMediaCaptionFormatter() {
  const [text, setText] = useState("We rebuilt our checkout last month. Fewer steps, clearer errors, one decision per screen.\n\nResult: 18% fewer abandoned carts on mobile.");
  const [hashtags, setHashtags] = useState("#ecommerce #ux #buildinpublic");
  const [platform, setPlatform] = useState("linkedin");
  const [lineBreaks, setLineBreaks] = useState(false);
  const [cta, setCta] = useState("Full breakdown in the comments.");

  const result = useMemo(() => formatCaption({ text, hashtags, platform, lineBreaks, cta }), [text, hashtags, platform, lineBreaks, cta]);

  return (
    <ToolPanel>
      <Segmented
        label="Platform"
        value={platform}
        onChange={setPlatform}
        options={PLATFORM_LIMITS.map((item) => ({ value: item.id, label: item.label }))}
      />

      <div className="mt-4 grid gap-3 lg:grid-cols-2">
        <Field label="Caption" htmlFor="cap-text" hint="Short lines read better on mobile than long paragraphs.">
          <TextArea id="cap-text" value={text} onChange={(event) => setText(event.target.value)} rows={7} />
        </Field>
        <div className="space-y-3">
          <Field label="Hashtags" htmlFor="cap-tags" hint="Paste with or without #; duplicates are removed.">
            <TextArea id="cap-tags" value={hashtags} onChange={(event) => setHashtags(event.target.value)} rows={2} className="min-h-16 font-mono text-[0.8rem]" spellCheck={false} />
          </Field>
          <Field label="Call to action" htmlFor="cap-cta" optional>
            <TextInput id="cap-cta" value={cta} onChange={(event) => setCta(event.target.value)} />
          </Field>
          <Switch checked={lineBreaks} onChange={setLineBreaks} label="Break at sentence ends" description="Adds a blank line after each full stop for a more scannable caption." />
        </div>
      </div>

      <div className="mt-6">
        <ResultCard
          label={`Caption for ${PLATFORM_LIMITS.find((item) => item.id === platform)?.label ?? platform}`}
          value={`${result.length} / ${result.limit}`}
          sub={result.over ? "Over the limit — trim before posting" : "Within the platform limit"}
          tone="brand"
          actions={<CopyButton text={result.caption} label="Copy caption" />}
        >
          <StatGrid
            columns={3}
            items={[
              { label: "Characters", value: String(result.length) },
              { label: "Hashtags", value: String(result.hashtags.length) },
              { label: "Remaining", value: String(Math.max(0, result.limit - result.length)) },
            ]}
          />
          <pre className="mt-4 max-h-64 overflow-auto border border-[var(--border)] bg-[var(--surface-muted)] p-4 font-[inherit] text-sm leading-relaxed whitespace-pre-wrap">{result.caption}</pre>
        </ResultCard>
      </div>

      {result.notes.length > 0 && (
        <Callout tone="warning" title="Before posting">
          <ul className="space-y-1">
            {result.notes.map((note) => (
              <li key={note}>{note}</li>
            ))}
          </ul>
        </Callout>
      )}

      <div className="mt-6">
        <SimpleTable
          head={["Platform", "Character limit", "Hashtag guidance"]}
          caption="Limits as published, before any API-specific rules"
          rows={PLATFORM_LIMITS.map((item) => [item.label, String(item.limit), item.hashtagLimit ? `max ${item.hashtagLimit}` : "no hard limit"])}
        />
      </div>

      <p className="mt-4 text-xs leading-relaxed text-[var(--text-subtle)]">
        The first line is the only one most people see before tapping &ldquo;more&rdquo;, so it has to work alone. Three
        to five hashtags is plenty outside Instagram, where 8–12 niche tags still help; keyword-rich tags beat generic
        ones now that platforms read captions.
      </p>
    </ToolPanel>
  );
}
