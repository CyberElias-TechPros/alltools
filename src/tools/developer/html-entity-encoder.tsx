"use client";

import { useMemo, useState } from "react";
import { ArrowLeftRight } from "lucide-react";
import { CopyButton, Segmented, Switch, TextArea, ToolPanel } from "@/components/ui";
import { decodeHtmlEntities, encodeHtmlEntities } from "@/lib/dev";

const SAMPLE = '<div class="card">Tom & Jerry\'s "café"</div>';

export default function HtmlEntityEncoder() {
  const [input, setInput] = useState("");
  const [direction, setDirection] = useState<"encode" | "decode">("encode");
  const [nonAscii, setNonAscii] = useState(false);

  const output = useMemo(() => {
    if (!input) return "";
    return direction === "encode" ? encodeHtmlEntities(input, nonAscii) : decodeHtmlEntities(input);
  }, [input, direction, nonAscii]);

  return (
    <ToolPanel>
      <div className="mb-3 flex flex-wrap items-center gap-3">
        <Segmented
          label="Direction"
          value={direction}
          onChange={setDirection}
          options={[
            { value: "encode", label: "Text → entities" },
            { value: "decode", label: "Entities → text" },
          ]}
          className="min-w-64"
        />
        {direction === "encode" ? (
          <Switch
            checked={nonAscii}
            onChange={setNonAscii}
            label="Numeric entities for non-ASCII"
            description="é becomes &#233;"
          />
        ) : null}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div>
          <div className="mb-2 flex items-center justify-between">
            <label htmlFor="he-input" className="label !mb-0">
              Input
            </label>
            <button
              type="button"
              className="text-xs font-medium text-brand-600 hover:underline dark:text-brand-300"
              onClick={() => setInput(SAMPLE)}
            >
              Load sample
            </button>
          </div>
          <TextArea
            id="he-input"
            value={input}
            onChange={(event) => setInput(event.target.value)}
            placeholder={direction === "encode" ? SAMPLE : "Tom &amp; Jerry&#39;s"}
            className="min-h-48 font-mono text-[0.85rem]"
            spellCheck={false}
          />
        </div>
        <div>
          <div className="mb-2 flex items-center justify-between">
            <span className="label !mb-0 flex items-center gap-1.5">
              <ArrowLeftRight className="size-3.5" aria-hidden /> Result
            </span>
            <CopyButton text={output} />
          </div>
          <div
            aria-live="polite"
            className="min-h-48 overflow-auto whitespace-pre-wrap break-all rounded-xl border border-[var(--border)] bg-[var(--code-bg)] p-3 font-mono text-[0.85rem] text-[var(--text)]"
          >
            {output || <span className="text-[var(--text-subtle)]">Result appears here.</span>}
          </div>
        </div>
      </div>

      <p className="mt-3 text-xs text-[var(--text-subtle)]">
        Escaping is not sanitisation. Keep using a proper HTML sanitiser or an auto-escaping
        template engine for untrusted content.
      </p>
    </ToolPanel>
  );
}
