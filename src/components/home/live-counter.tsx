"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowUpRight, Eraser } from "lucide-react";
import { summarizeText } from "@/lib/text-stats";

const SAMPLE =
  "Paste your text here. Everything is counted on your device — no uploads, no accounts, no waiting.";

export function LiveCounter() {
  const [text, setText] = useState(SAMPLE);
  const value = useMemo(() => summarizeText(text), [text]);

  return (
    <div className="card relative overflow-hidden p-1.5">
      <div className="flex items-center justify-between px-3.5 pb-2.5 pt-2.5">
        <p className="flex items-center gap-2 font-mono text-[0.6rem] uppercase tracking-[0.2em] text-[var(--text-subtle)]">
          <span className="size-1.5 animate-pulse rounded-full bg-[var(--ring)]" aria-hidden />
          Live · word counter
        </p>
        <button
          type="button"
          onClick={() => setText("")}
          className="inline-flex items-center gap-1.5 rounded-full border border-[var(--border)] px-2.5 py-1 font-mono text-[0.6rem] uppercase tracking-[0.14em] text-[var(--text-subtle)] transition-colors hover:border-[var(--ring)]/50 hover:text-[var(--text)]"
        >
          <Eraser className="size-3" aria-hidden />
          Clear
        </button>
      </div>

      <label className="sr-only" htmlFor="home-live-counter">
        Try the word counter
      </label>
      <textarea
        id="home-live-counter"
        value={text}
        onChange={(event) => setText(event.target.value)}
        spellCheck={false}
        rows={5}
        placeholder="Paste or type anything…"
        className="w-full resize-none rounded-xl border border-[var(--border)] bg-[var(--surface-muted)]/60 px-4 py-3.5 text-[0.95rem] leading-relaxed text-[var(--text)] outline-none transition-colors placeholder:text-[var(--text-subtle)] focus:border-[var(--ring)]/45 focus:bg-[var(--surface)]"
      />

      <dl className="mt-2 grid grid-cols-2 gap-px overflow-hidden rounded-xl bg-[var(--border)] sm:grid-cols-4">
        {[
          { label: "Words", value: value.words.toLocaleString("en-US") },
          { label: "Characters", value: value.characters.toLocaleString("en-US") },
          { label: "Sentences", value: value.sentences.toLocaleString("en-US") },
          { label: "Read time", value: value.readingTime },
        ].map((item) => (
          <div
            key={item.label}
            className="flex flex-col-reverse bg-[var(--surface)] px-3.5 py-3"
          >
            <dt className="mt-1.5 font-mono text-[0.6rem] uppercase tracking-[0.16em] text-[var(--text-subtle)]">
              {item.label}
            </dt>
            <dd className="font-display text-[1.3rem] font-bold leading-none tracking-[-0.04em] tabular-nums text-[var(--text)]">
              {item.value}
            </dd>
          </div>
        ))}
      </dl>

      <div className="flex items-center justify-between gap-3 px-3.5 py-3">
        <p className="font-mono text-[0.6rem] uppercase tracking-[0.16em] text-[var(--text-subtle)]">
          {value.charactersNoSpaces.toLocaleString("en-US")} characters without spaces
        </p>
        <Link
          href="/tools/word-counter/"
          className="group inline-flex items-center gap-1 text-[0.78rem] font-medium text-[var(--accent-text)]"
        >
          Full tool
          <ArrowUpRight
            className="size-3.5 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
            aria-hidden
          />
        </Link>
      </div>
    </div>
  );
}
