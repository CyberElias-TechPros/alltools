"use client";

import { useMemo, useState } from "react";
import { ArrowLeftRight } from "lucide-react";
import { Callout, CopyButton, Segmented, TextArea, ToolPanel } from "@/components/ui";
import { cn } from "@/lib/utils";

type Context = "component" | "url" | "form";

export default function UrlEncoderDecoder() {
  const [input, setInput] = useState("");
  const [context, setContext] = useState<Context>("component");
  const [direction, setDirection] = useState<"encode" | "decode">("encode");

  const { output, error } = useMemo(() => {
    if (!input) return { output: "", error: "" };
    try {
      if (direction === "decode") {
        const decoded =
          context === "form"
            ? decodeURIComponent(input.replace(/\+/g, " "))
            : decodeURIComponent(input);
        return { output: decoded, error: "" };
      }
      const encoded =
        context === "url"
          ? encodeURI(input)
          : context === "form"
            ? encodeURIComponent(input).replace(/%20/g, "+")
            : encodeURIComponent(input);
      return { output: encoded, error: "" };
    } catch {
      return {
        output: "",
        error: "That string contains an invalid percent-escape (for example a lone % or incomplete hex pair).",
      };
    }
  }, [input, context, direction]);

  return (
    <ToolPanel>
      <div className="mb-3 flex flex-wrap items-center gap-3">
        <Segmented
          label="Direction"
          value={direction}
          onChange={setDirection}
          options={[
            { value: "encode", label: "Encode" },
            { value: "decode", label: "Decode" },
          ]}
          className="min-w-52"
        />
        <Segmented
          label="Context"
          value={context}
          onChange={setContext}
          options={[
            { value: "component", label: "Value" },
            { value: "url", label: "Full URL" },
            { value: "form", label: "Form data" },
          ]}
          className="min-w-64"
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div>
          <label htmlFor="url-input" className="label">
            Input
          </label>
          <TextArea
            id="url-input"
            value={input}
            onChange={(event) => setInput(event.target.value)}
            placeholder={direction === "encode" ? "red shoes & socks" : "red%20shoes%20%26%20socks"}
            className="min-h-40 font-mono text-[0.85rem]"
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
            className="min-h-40 overflow-auto whitespace-pre-wrap break-all rounded-xl border border-[var(--border)] bg-[var(--code-bg)] p-3 font-mono text-[0.85rem] text-[var(--text)]"
          >
            {output || <span className="text-[var(--text-subtle)]">Result appears here.</span>}
          </div>
        </div>
      </div>

      {error ? (
        <div className="mt-3">
          <Callout tone="warning">{error}</Callout>
        </div>
      ) : null}

      <div className="mt-3 grid gap-2 text-xs text-[var(--text-subtle)] sm:grid-cols-3">
        <p className={cn("rounded-lg border border-[var(--border)] p-2.5", context === "url" && "border-brand-400")}>
          <strong className="text-[var(--text-muted)]">Full URL</strong> — keeps ://, /, ?, &amp; intact.
        </p>
        <p className={cn("rounded-lg border border-[var(--border)] p-2.5", context === "component" && "border-brand-400")}>
          <strong className="text-[var(--text-muted)]">Value</strong> — escapes everything reserved. Use for query values and path segments.
        </p>
        <p className={cn("rounded-lg border border-[var(--border)] p-2.5", context === "form" && "border-brand-400")}>
          <strong className="text-[var(--text-muted)]">Form data</strong> — spaces become +.
        </p>
      </div>
    </ToolPanel>
  );
}
