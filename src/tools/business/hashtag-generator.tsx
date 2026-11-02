"use client";

import { useMemo, useState } from "react";
import { Callout, CopyButton, Field, ResultCard, SimpleTable, StatGrid, TextInput, ToolPanel } from "@/components/ui";
import { generateHashtags } from "@/lib/business";

export default function HashtagGenerator() {
  const [topic, setTopic] = useState("specialty coffee");
  const [extra, setExtra] = useState("acmecoffee");
  const [count, setCount] = useState("14");

  const tags = useMemo(() => generateHashtags({ topic, extra, count: Number(count) || 14 }), [topic, extra, count]);

  return (
    <ToolPanel>
      <div className="grid gap-3 sm:grid-cols-3">
        <Field label="Topic" htmlFor="tag-topic" hint="One or two words: the subject, not the post.">
          <TextInput id="tag-topic" value={topic} onChange={(event) => setTopic(event.target.value)} />
        </Field>
        <Field label="Branded tag" htmlFor="tag-extra" optional>
          <TextInput id="tag-extra" value={extra} onChange={(event) => setExtra(event.target.value)} className="font-mono text-[0.8rem]" />
        </Field>
        <Field label="How many" htmlFor="tag-count">
          <TextInput id="tag-count" type="number" min={3} max={30} value={count} onChange={(event) => setCount(event.target.value)} className="font-mono" />
        </Field>
      </div>

      <div className="mt-6">
        <ResultCard
          label="Hashtag set"
          value={`${tags.all.length} tags`}
          sub="Broad reach first, niche intent second, branded last"
          tone="brand"
          actions={<CopyButton text={tags.all.join(" ")} label="Copy all" />}
        >
          <StatGrid
            columns={3}
            items={[
              { label: "Broad", value: String(tags.broad.length) },
              { label: "Niche", value: String(tags.niche.length) },
              { label: "Branded", value: String(tags.branded.length) },
            ]}
          />
          <div className="mt-4 flex flex-wrap gap-1.5">
            {tags.all.map((tag) => (
              <span key={tag} className="border border-[var(--border)] px-2 py-1 font-mono text-[0.7rem] text-[var(--text-muted)]">
                {tag}
              </span>
            ))}
          </div>
        </ResultCard>
      </div>

      <div className="mt-6">
        <SimpleTable
          head={["Tier", "Examples", "Use"]}
          caption="Why a mix beats one long list"
          rows={[
            ["Broad", tags.broad.slice(0, 4).join(" ") || "—", "Discoverability, though competition is fierce"],
            ["Niche", tags.niche.slice(0, 4).join(" ") || "—", "People actively searching for the topic"],
            ["Branded", tags.branded.join(" ") || "—", "Collects user posts and builds an archive"],
          ]}
        />
      </div>

      <Callout tone="info">
        Generic tags such as #love or #instagood buy reach from accounts that will never buy anything. If a tag would not
        appear on a post by your ideal customer, it is not helping.
      </Callout>

      <p className="mt-4 text-xs leading-relaxed text-[var(--text-subtle)]">
        Tags are built from your topic words with common modifiers attached, which keeps them relevant instead of
        randomly popular. Check volume in the platform&apos;s own search before committing — reach changes monthly, and a
        tag with millions of posts can bury a small account entirely.
      </p>
    </ToolPanel>
  );
}
