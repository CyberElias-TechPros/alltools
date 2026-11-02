"use client";

import { useMemo, useState } from "react";
import { CopyButton, Field, ResultCard, SimpleTable, TextArea, TextInput, ToolPanel } from "@/components/ui";
import { describeUrlPath, estimateSerpWidth, snippetChecks } from "@/lib/seo-tools";

/**
 * Shared preview for the title and description tools: the same SERP card, the
 * same pixel estimates, a different field in focus.
 */
export function SnippetTool({
  id,
  mode,
  sample,
}: {
  id: string;
  mode: "title" | "description";
  sample: { title: string; description: string; url: string; siteName: string };
}) {
  const [title, setTitle] = useState(mode === "title" ? sample.title : "");
  const [description, setDescription] = useState(mode === "description" ? sample.description : "");
  const [url, setUrl] = useState(sample.url);
  const [siteName, setSiteName] = useState(sample.siteName);

  const checks = useMemo(
    () => snippetChecks({ title: title || sample.title, description: description || sample.description, url, siteName }),
    [title, description, url, siteName, sample],
  );

  const titleWidth = estimateSerpWidth(title || sample.title);
  const descriptionWidth = estimateSerpWidth(description || sample.description);

  return (
    <ToolPanel>
      <div className="grid gap-5 lg:grid-cols-2">
        <div className="space-y-3">
          {mode === "title" ? (
            <Field
              label={`Title — ${title.length} chars · ~${titleWidth.pixels}px`}
              htmlFor={`${id}-title`}
              hint="Google measures pixels, not characters: wide letters are cut sooner."
            >
              <TextArea
                id={`${id}-title`}
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                rows={3}
                placeholder={sample.title}
                invalid={titleWidth.width === "wide"}
              />
            </Field>
          ) : (
            <Field
              label={`Description — ${description.length} chars · ~${descriptionWidth.pixels}px`}
              htmlFor={`${id}-description`}
              hint="Aim for 120–155 characters. Google rewrites snippets that are vague."
            >
              <TextArea
                id={`${id}-description`}
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                rows={5}
                placeholder={sample.description}
                invalid={description.length > 160}
              />
            </Field>
          )}

          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Page URL" htmlFor={`${id}-url`}>
              <TextInput
                id={`${id}-url`}
                value={url}
                onChange={(event) => setUrl(event.target.value)}
                className="font-mono text-[0.78rem]"
                spellCheck={false}
              />
            </Field>
            <Field label="Site name" htmlFor={`${id}-site`}>
              <TextInput id={`${id}-site`} value={siteName} onChange={(event) => setSiteName(event.target.value)} />
            </Field>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => {
                setTitle(sample.title);
                setDescription(sample.description);
              }}
            >
              Load sample
            </button>
            <CopyButton text={mode === "title" ? title : description} label="Copy" />
          </div>
        </div>

        <div>
          <p className="label">Desktop result</p>
          <div className="border border-[var(--border)] bg-[var(--surface)] p-4">
            <div className="flex items-center gap-2">
              <span className="size-6 border border-[var(--border)] bg-[var(--surface-muted)]" aria-hidden />
              <div className="min-w-0">
                <p className="truncate text-[0.8rem] font-medium text-[var(--text)]">{siteName || "Your site"}</p>
                <p className="truncate font-mono text-[0.68rem] text-[var(--text-subtle)]">
                  {url ? describeUrlPath(url) : "example.com"}
                </p>
              </div>
            </div>
            <p className="mt-2 line-clamp-2 text-[1.05rem] leading-snug text-[#1a0dab] dark:text-[#8ab4f8]">
              {title || sample.title}
            </p>
            <p className="mt-1 line-clamp-2 text-[0.82rem] leading-relaxed text-[var(--text-subtle)]">
              {description || sample.description}
            </p>
          </div>

          <p className="label mt-4">Mobile result</p>
          <div className="border border-[var(--border)] bg-[var(--surface)] p-4">
            <p className="truncate font-mono text-[0.66rem] text-[var(--text-subtle)]">
              {url ? describeUrlPath(url) : "example.com"}
            </p>
            <p className="mt-1 line-clamp-3 text-[0.95rem] leading-snug text-[#1a0dab] dark:text-[#8ab4f8]">
              {title || sample.title}
            </p>
            <p className="mt-1 line-clamp-3 text-[0.78rem] leading-relaxed text-[var(--text-subtle)]">
              {description || sample.description}
            </p>
          </div>

          <div className="mt-4">
            <ResultCard
              label="Checks"
              value={`${checks.filter((check) => check.level === "ok").length} of ${checks.length} pass`}
              tone="brand"
              sub="Pixel estimates use an average glyph width; real rendering varies."
            >
              <SimpleTable
                head={["Status", "Finding"]}
                rows={checks.map((check) => [
                  <span
                    key={check.message}
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
