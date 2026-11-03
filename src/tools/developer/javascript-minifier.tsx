"use client";

import { useEffect, useMemo, useState } from "react";
import { CopyButton, DownloadButton, Field, Select, Switch, TextArea, ToolPanel } from "@/components/ui";
import { formatBytes, minifyJs, type MinifyJsResult } from "@/lib/format";

const SAMPLE = `// Calculate an order total with tax
function orderTotal(items, taxRate = 0.2) {
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  return { subtotal, tax: subtotal * taxRate, total: subtotal * (1 + taxRate) };
}

console.log(orderTotal([{ price: 12.5, quantity: 2 }]));`;

export default function JavascriptMinifier() {
  const [input, setInput] = useState("");
  const [compress, setCompress] = useState(true);
  const [mangle, setMangle] = useState(false);
  const [result, setResult] = useState<MinifyJsResult | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!input.trim()) {
      setResult(null);
      setBusy(false);
      return;
    }
    let cancelled = false;
    setBusy(true);
    const timer = setTimeout(() => {
      minifyJs(input, { compress, mangle })
        .then((next) => {
          if (!cancelled) setResult(next);
        })
        .finally(() => {
          if (!cancelled) setBusy(false);
        });
    }, 250);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [input, compress, mangle]);

  const savings = useMemo(() => {
    if (!result || result.error || result.before === 0) return 0;
    return Math.round((1 - result.after / result.before) * 100);
  }, [result]);

  return (
    <ToolPanel>
      <div className="grid gap-5 lg:grid-cols-2">
        <div>
          <div className="mb-2 flex items-center justify-between">
            <label htmlFor="js-min-input" className="label !mb-0">
              JavaScript
            </label>
            <button
              type="button"
              className="btn btn-ghost !min-h-8 !px-2.5 !py-1.5 !text-[0.6rem] !tracking-[0.1em]"
              onClick={() => setInput(SAMPLE)}
            >
              Sample
            </button>
          </div>
          <TextArea
            id="js-min-input"
            value={input}
            onChange={(event) => setInput(event.target.value)}
            placeholder="Paste JavaScript or a module body…"
            rows={14}
            spellCheck={false}
            className="min-h-[16rem] font-mono text-[0.84rem]"
          />
        </div>

        <div>
          <div className="mb-2 flex items-center justify-between gap-2">
            <span className="label !mb-0">Minified output</span>
            <div className="flex gap-1">
              <CopyButton text={result?.code ?? ""} size="sm" />
              <DownloadButton filename="app.min.js" content={result?.code ?? ""} mime="text/javascript" />
            </div>
          </div>
          {result?.error ? (
            <div
              role="alert"
              className="min-h-[16rem] border border-[#c0392b] bg-[var(--surface-muted)] p-3 font-mono text-[0.8rem] leading-relaxed text-[#8d2f22] dark:text-[#ff9a8a]"
            >
              {result.error}
            </div>
          ) : (
            <TextArea
              readOnly
              value={result?.code ?? ""}
              rows={14}
              aria-label="Minified JavaScript"
              placeholder={busy ? "Minifying…" : "Minified code appears here as you type."}
              className="min-h-[16rem] font-mono text-[0.8rem]"
            />
          )}
          {result && !result.error ? (
            <p className="mt-2 font-mono text-[0.6rem] uppercase tracking-[0.12em] text-[var(--text-subtle)]">
              {formatBytes(result.before)} → {formatBytes(result.after)} · {savings}% smaller
            </p>
          ) : null}
        </div>
      </div>

      <div className="mt-5 grid gap-4 border-t border-[var(--border)] pt-4 sm:grid-cols-2">
        <Field label="Comment handling" htmlFor="js-min-comments" hint="Comments are always removed by Terser.">
          <Select id="js-min-comments" value="strip" disabled onChange={() => {}}>
            <option value="strip">Remove all comments</option>
          </Select>
        </Field>
        <div className="space-y-1">
          <Switch
            checked={compress}
            onChange={setCompress}
            label="Compress expressions"
            description="Folds constants and removes unreachable code."
          />
          <Switch
            checked={mangle}
            onChange={setMangle}
            label="Mangle local names"
            description="Shorter output, but stack traces become harder to read."
          />
        </div>
      </div>

      <p className="mt-4 text-xs leading-relaxed text-[var(--text-subtle)]">
        Parsing and minification run in this tab with Terser. Invalid syntax is reported instead of
        producing code that only looks minified.
      </p>
    </ToolPanel>
  );
}
