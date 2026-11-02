"use client";

import { useMemo, useState } from "react";
import { Link2 } from "lucide-react";
import {
  CopyButton,
  Field,
  Segmented,
  Switch,
  TextInput,
  ToolPanel,
} from "@/components/ui";
import { slugify } from "@/lib/text";

export default function SlugGenerator() {
  const [title, setTitle] = useState("");
  const [separator, setSeparator] = useState<"-" | "_">("-");
  const [stopWords, setStopWords] = useState(false);
  const [maxLength, setMaxLength] = useState("80");

  const limit = Math.min(Math.max(Number(maxLength) || 80, 10), 200);
  const slug = useMemo(
    () => slugify(title, { separator, stopWords, maxLength: limit }),
    [title, separator, stopWords, limit],
  );

  return (
    <ToolPanel>
      <div className="grid gap-4 sm:grid-cols-[1.6fr_1fr]">
        <Field label="Page title" htmlFor="sg-title" hint="Include the words someone would search for.">
          <TextInput
            id="sg-title"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="10 Ways to Improve Your Writing (2025 Guide)"
            autoComplete="off"
          />
        </Field>
        <Field label="Maximum length" htmlFor="sg-len" hint="10–200 characters">
          <TextInput
            id="sg-len"
            type="number"
            min={10}
            max={200}
            value={maxLength}
            onChange={(event) => setMaxLength(event.target.value)}
          />
        </Field>
      </div>

      <div className="mt-3 grid gap-3 sm:grid-cols-[1fr_1fr]">
        <div>
          <span className="label">Separator</span>
          <Segmented
            label="Slug separator"
            value={separator}
            onChange={setSeparator}
            options={[
              { value: "-", label: "hyphen" },
              { value: "_", label: "underscore" },
            ]}
          />
          <p className="mt-1.5 text-xs text-[var(--text-subtle)]">
            Hyphens are the search-friendly default.
          </p>
        </div>
        <div className="pt-1">
          <Switch
            checked={stopWords}
            onChange={setStopWords}
            label="Remove stop words"
            description="Drop a, an, the, of, to… for shorter URLs"
          />
        </div>
      </div>

      <div className="mt-5 rounded-xl border border-[var(--border)] bg-[var(--surface-muted)] p-4">
        <div className="flex items-center justify-between gap-3">
          <span className="flex items-center gap-1.5 text-[0.72rem] font-bold uppercase tracking-[0.08em] text-[var(--text-subtle)]">
            <Link2 className="size-3.5" aria-hidden /> Your slug
          </span>
          <CopyButton text={slug} />
        </div>
        <p
          aria-live="polite"
          className="mt-2 break-all rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2.5 font-mono text-sm text-[var(--text)]"
        >
          {slug || <span className="text-[var(--text-subtle)]">your-page-slug</span>}
        </p>
        <p className="mt-2 break-all text-xs text-[var(--text-subtle)]">
          Preview: <span className="text-[var(--text-muted)]">https://example.com/blog/{slug || "your-page-slug"}</span>
        </p>
        {title && !slug ? (
          <p className="mt-2 text-xs font-medium text-amber-600 dark:text-amber-400">
            That title has no Latin letters or digits, so the slug is empty. Add a few Latin
            characters or write the slug manually.
          </p>
        ) : null}
        <p className="mt-2 text-xs text-[var(--text-subtle)]">
          {slug.length} / {limit} characters
        </p>
      </div>
    </ToolPanel>
  );
}
