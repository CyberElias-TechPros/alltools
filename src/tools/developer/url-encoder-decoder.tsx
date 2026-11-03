"use client";

import { useMemo, useState } from "react";
import { CopyButton, TextArea, ToolPanel } from "@/components/ui";
import { ModeCard, ModeHub } from "@/components/tools/mode-hub";

const SAMPLE = "red shoes & socks? café=true";

function ResultPane({ text, error }: { text: string; error?: string }) {
  return (
    <div
      aria-live="polite"
      className="min-h-16 overflow-auto whitespace-pre-wrap break-all rounded-xl border border-[var(--border)] bg-[var(--code-bg)] p-2.5 font-mono text-[0.78rem] text-[var(--text)]"
    >
      {error ? (
        <span className="text-rose-700 dark:text-rose-300">{error}</span>
      ) : text ? (
        text
      ) : (
        <span className="text-[var(--text-subtle)]">Result appears here.</span>
      )}
    </div>
  );
}

/**
 * One string, four readings: the escaped value, the escaped full URL, the
 * form-encoded variant and the decoded string. Nobody has to pick a mode before
 * they can see the answer they came for.
 */
export default function UrlEncoderDecoder() {
  const [input, setInput] = useState("");

  const results = useMemo(() => {
    const safe = (fn: () => string) => {
      try {
        return { value: fn(), error: "" };
      } catch {
        return {
          value: "",
          error: "Invalid percent-escape — check for a lone % or an incomplete hex pair.",
        };
      }
    };
    if (!input) return { value: "", url: "", form: "", decoded: "", error: "" };
    return {
      value: safe(() => encodeURIComponent(input)).value,
      url: safe(() => encodeURI(input)).value,
      form: safe(() => encodeURIComponent(input).replace(/%20/g, "+")).value,
      decoded: safe(() => decodeURIComponent(input.replace(/\+/g, " "))).value,
      error: safe(() => encodeURIComponent(input)).error,
    };
  }, [input]);

  return (
    <ToolPanel>
      <label htmlFor="url-input" className="label">
        Text or URL
      </label>
      <TextArea
        id="url-input"
        value={input}
        onChange={(event) => setInput(event.target.value)}
        placeholder={SAMPLE}
        className="min-h-28 font-mono text-[0.85rem]"
        spellCheck={false}
      />
      <div className="mt-2 flex flex-wrap items-center gap-3">
        <button
          type="button"
          className="text-xs font-medium text-brand-600 hover:underline dark:text-brand-300"
          onClick={() => setInput(SAMPLE)}
        >
          Load sample
        </button>
        <span className="text-xs text-[var(--text-subtle)]">
          All four outputs update as you type — no mode switch.
        </span>
      </div>

      <div className="mt-4">
        <ModeHub columns={2}>
          <ModeCard title="Value" hint="Everything reserved is escaped: / ? & = # space." badge="Component">
            <div className="mb-2 flex justify-end">
              <CopyButton text={results.value} />
            </div>
            <ResultPane text={results.value} error={results.error || undefined} />
          </ModeCard>

          <ModeCard title="Full URL" hint="Keeps ://, /, ? and & intact — only the unsafe parts change.">
            <div className="mb-2 flex justify-end">
              <CopyButton text={results.url} />
            </div>
            <ResultPane text={results.url} error={results.error || undefined} />
          </ModeCard>

          <ModeCard title="Form data" hint="Spaces become +, as an HTML form submits them.">
            <div className="mb-2 flex justify-end">
              <CopyButton text={results.form} />
            </div>
            <ResultPane text={results.form} error={results.error || undefined} />
          </ModeCard>

          <ModeCard title="Decoded" hint="Turn %20, %26 and + back into readable text.">
            <div className="mb-2 flex justify-end">
              <CopyButton text={results.decoded} />
            </div>
            <ResultPane text={results.decoded} error={results.error || undefined} />
          </ModeCard>
        </ModeHub>
      </div>

      <p className="mt-3 text-xs text-[var(--text-subtle)]">
        Encoding a URL is not sanitising it. Validate the scheme and host before you use a
        visitor-supplied URL in an <code>href</code>.
      </p>
    </ToolPanel>
  );
}
