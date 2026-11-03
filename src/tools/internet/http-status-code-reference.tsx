"use client";

import { useMemo, useState } from "react";
import { EmptyState, SimpleTable, TextInput, ToolPanel } from "@/components/ui";
import { searchStatuses, STATUS_CLASSES, type StatusClass } from "@/lib/http";

export default function HttpStatusCodeReference() {
  const [query, setQuery] = useState("");
  const [klass, setKlass] = useState<StatusClass | "all">("all");

  const rows = useMemo(() => {
    const matches = searchStatuses(query);
    return klass === "all" ? matches : matches.filter((status) => status.klass === klass);
  }, [query, klass]);

  return (
    <ToolPanel>
      <div className="grid gap-4 sm:grid-cols-[1fr_auto]">
        <TextInput
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search a code, name or meaning — 404, redirect, auth…"
          aria-label="Search status codes"
          className="font-mono text-[0.85rem]"
        />
        <div className="flex flex-wrap gap-1.5">
          {(["all", "2xx", "3xx", "4xx", "5xx"] as const).map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => setKlass(option)}
              className={`border px-2.5 py-1.5 font-mono text-[0.65rem] transition-colors ${
                klass === option
                  ? "border-[var(--ring)] bg-[var(--surface-muted)] text-[var(--text)]"
                  : "border-[var(--border)] text-[var(--text-subtle)] hover:border-[var(--border-strong)]"
              }`}
            >
              {option === "all" ? "All" : option}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-4 grid gap-px overflow-hidden border border-[var(--border)] bg-[var(--border)] sm:grid-cols-5">
        {STATUS_CLASSES.filter((entry) => entry.klass !== "1xx").map((entry) => (
          <div key={entry.klass} className="bg-[var(--surface)] px-3 py-2">
            <p className="font-mono text-[0.7rem] font-semibold text-[var(--accent-text)]">{entry.klass}</p>
            <p className="text-[0.7rem] leading-snug text-[var(--text-subtle)]">{entry.label}</p>
          </div>
        ))}
      </div>

      <div className="mt-5">
        {rows.length === 0 ? (
          <EmptyState title="No matching codes">Try a number such as 418, or a word like “timeout”.</EmptyState>
        ) : (
          <SimpleTable
            head={["Code", "Name", "Means", "Send it when"]}
            caption="HTTP status codes and when to use them"
            rows={rows.map((status) => [
              <span key="code" className="font-semibold">
                {status.code}
              </span>,
              status.name,
              status.summary,
              status.when,
            ])}
          />
        )}
      </div>

      <p className="mt-4 text-xs leading-relaxed text-[var(--text-subtle)]">
        Names follow the IANA registry. 418 is included for completeness — it is real, if rarely appropriate.
      </p>
    </ToolPanel>
  );
}
