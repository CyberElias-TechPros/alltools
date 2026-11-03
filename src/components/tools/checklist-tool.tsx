"use client";

import { useEffect, useMemo, useState } from "react";
import { CopyButton, DownloadButton, ToolPanel } from "@/components/ui";

export interface ChecklistSection {
  title: string;
  items: string[];
}

/**
 * Shared checklist UI. Progress is stored in component state only — nothing is
 * persisted, so the list resets with the page, which is the honest behaviour
 * for a tool that promises not to store visitor data.
 */
export function ChecklistTool({
  id,
  sections,
  intro,
  storageKey,
}: {
  id: string;
  sections: ChecklistSection[];
  intro: string;
  storageKey: string;
}) {
  const total = useMemo(() => sections.reduce((sum, section) => sum + section.items.length, 0), [sections]);
  const [done, setDone] = useState<Record<string, boolean>>({});

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(storageKey);
      if (saved) setDone(JSON.parse(saved) as Record<string, boolean>);
    } catch {
      /* ignore unavailable storage */
    }
  }, [storageKey]);

  useEffect(() => {
    try {
      window.localStorage.setItem(storageKey, JSON.stringify(done));
    } catch {
      /* ignore */
    }
  }, [done, storageKey]);

  const completed = Object.values(done).filter(Boolean).length;
  const percent = total ? Math.round((completed / total) * 100) : 0;

  const markdown = sections
    .map((section) => {
      const lines = section.items.map((item) => `- [${done[`${section.title}:${item}`] ? "x" : " "}] ${item}`);
      return `## ${section.title}\n${lines.join("\n")}`;
    })
    .join("\n\n");

  return (
    <ToolPanel>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="font-mono text-[0.6rem] uppercase tracking-[0.14em] text-[var(--text-subtle)]">Progress</p>
          <p className="font-mono text-2xl font-semibold text-[var(--text)]">
            {completed}/{total}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            className="btn btn-ghost"
            onClick={() => setDone({})}
            disabled={completed === 0}
          >
            Reset
          </button>
          <CopyButton text={markdown} label="Copy as Markdown" />
          <DownloadButton filename={`${id}.md`} content={markdown} mime="text/markdown" label="Download" />
        </div>
      </div>

      <div className="mt-3 h-1.5 w-full bg-[var(--surface-muted)]" role="progressbar" aria-valuenow={percent} aria-valuemin={0} aria-valuemax={100} aria-label="Checklist progress">
        <div className="h-full bg-[var(--ring)] transition-[width]" style={{ width: `${percent}%` }} />
      </div>

      <p className="mt-4 max-w-2xl text-sm leading-relaxed text-[var(--text-subtle)]">{intro}</p>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        {sections.map((section) => (
          <section key={section.title}>
            <h3 className="font-mono text-[0.62rem] uppercase tracking-[0.14em] text-[var(--text-subtle)]">
              {section.title}
            </h3>
            <ul className="mt-2 divide-y divide-[var(--border)] border-y border-[var(--border)]">
              {section.items.map((item) => {
                const key = `${section.title}:${item}`;
                return (
                  <li key={key}>
                    <label className="flex cursor-pointer items-start gap-3 py-2.5">
                      <input
                        type="checkbox"
                        checked={Boolean(done[key])}
                        onChange={(event) => setDone((current) => ({ ...current, [key]: event.target.checked }))}
                        className="mt-0.5 size-4 shrink-0 accent-[var(--ring)]"
                      />
                      <span
                        className={
                          done[key]
                            ? "text-sm leading-relaxed text-[var(--text-subtle)] line-through"
                            : "text-sm leading-relaxed text-[var(--text)]"
                        }
                      >
                        {item}
                      </span>
                    </label>
                  </li>
                );
              })}
            </ul>
          </section>
        ))}
      </div>

      <p className="mt-6 text-xs leading-relaxed text-[var(--text-subtle)]">
        Ticks are saved in this browser only, so you can close the tab and come back. Nothing is uploaded.
      </p>
    </ToolPanel>
  );
}
