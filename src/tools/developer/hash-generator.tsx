"use client";

import { useEffect, useRef, useState } from "react";
import { CopyButton, Field, Segmented, Switch, TextArea, ToolPanel } from "@/components/ui";
import { ModeCard, ModeHub } from "@/components/tools/mode-hub";
import { formatNumber } from "@/lib/utils";

const ALGORITHMS = ["SHA-1", "SHA-256", "SHA-384", "SHA-512"] as const;
type Algorithm = (typeof ALGORITHMS)[number];
type Digests = Partial<Record<Algorithm, string>>;

function toHex(buffer: ArrayBuffer): string {
  return [...new Uint8Array(buffer)].map((byte) => byte.toString(16).padStart(2, "0")).join("");
}

export default function HashGenerator() {
  const [mode, setMode] = useState<"text" | "file">("text");
  const [text, setText] = useState("");
  const [algorithm, setAlgorithm] = useState<Algorithm>("SHA-256");
  const [uppercase, setUppercase] = useState(false);
  const [digests, setDigests] = useState<Digests>({});
  const [fileDigest, setFileDigest] = useState("");
  const [status, setStatus] = useState("");
  const [busy, setBusy] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (mode !== "text") return;
    if (!text) {
      setDigests({});
      setStatus("Enter text to generate a digest.");
      return;
    }
    let cancelled = false;
    setBusy(true);
    const bytes = new TextEncoder().encode(text);
    Promise.all(
      ALGORITHMS.map((name) =>
        crypto.subtle.digest(name, bytes).then((buffer) => [name, toHex(buffer)] as const),
      ),
    )
      .then((entries) => {
        if (cancelled) return;
        setDigests(Object.fromEntries(entries) as Digests);
        setStatus(`${formatNumber(bytes.length)} bytes hashed locally with the Web Crypto API.`);
      })
      .catch(() => setStatus("Hashing is unavailable in this browser context (Web Crypto requires HTTPS)."))
      .finally(() => !cancelled && setBusy(false));
    return () => {
      cancelled = true;
    };
  }, [text, mode]);

  async function hashFile(file: File) {
    if (file.size > 200 * 1024 * 1024) {
      setStatus("That file is larger than 200 MB. Choose a smaller file.");
      return;
    }
    setBusy(true);
    try {
      const buffer = await file.arrayBuffer();
      const result = await crypto.subtle.digest(algorithm, buffer);
      setFileDigest(toHex(result));
      setStatus(`${file.name} · ${(file.size / 1024).toFixed(1)} KB · ${algorithm}`);
      setMode("file");
    } catch {
      setStatus("Could not read that file.");
    } finally {
      setBusy(false);
    }
  }

  const show = (value: string) => (uppercase ? value.toUpperCase() : value);
  const fileShown = show(fileDigest);

  return (
    <ToolPanel>
      <div className="mb-3 flex flex-wrap items-center gap-3">
        <Segmented
          label="Input"
          value={mode}
          onChange={setMode}
          options={[
            { value: "text", label: "Text" },
            { value: "file", label: "File" },
          ]}
          className="min-w-44"
        />
        <Switch checked={uppercase} onChange={setUppercase} label="Uppercase" />
        {mode === "file" ? (
          <>
            <div>
              <label htmlFor="hash-algo" className="sr-only">
                Algorithm
              </label>
              <select
                id="hash-algo"
                className="input !w-40"
                value={algorithm}
                onChange={(event) => setAlgorithm(event.target.value as Algorithm)}
              >
                {ALGORITHMS.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>
            <input
              ref={fileRef}
              type="file"
              className="hidden"
              onChange={(event) => {
                const file = event.target.files?.[0];
                if (file) void hashFile(file);
              }}
            />
            <button type="button" className="btn btn-secondary !min-h-9" onClick={() => fileRef.current?.click()}>
              Choose file
            </button>
          </>
        ) : null}
      </div>

      {mode === "text" ? (
        <>
          <Field label="Text to hash" htmlFor="hash-input">
            <TextArea
              id="hash-input"
              value={text}
              onChange={(event) => setText(event.target.value)}
              placeholder="Paste the text or secret you want to fingerprint…"
              className="min-h-32 font-mono text-[0.85rem]"
              spellCheck={false}
            />
          </Field>

          <div className="mt-4">
            <ModeHub columns={2}>
              {ALGORITHMS.map((name) => {
                const value = show(digests[name] ?? "");
                return (
                  <ModeCard
                    key={name}
                    title={name}
                    hint={`${name.replace("SHA-", "")} bits · ${formatNumber(Number(name.replace("SHA-", "")) / 8)} bytes`}
                    badge={name === "SHA-256" ? "Most used" : undefined}
                  >
                    <div
                      aria-live="polite"
                      className="min-h-16 flex-1 break-all rounded-xl border border-[var(--border)] bg-[var(--code-bg)] p-2.5 font-mono text-[0.74rem] leading-relaxed text-[var(--text)]"
                    >
                      {busy && !value ? (
                        <span className="shimmer inline-block h-3 w-full rounded" />
                      ) : (
                        value || <span className="text-[var(--text-subtle)]">—</span>
                      )}
                    </div>
                    <div className="mt-2 flex justify-end">
                      <CopyButton text={value} label="Copy" />
                    </div>
                  </ModeCard>
                );
              })}
            </ModeHub>
          </div>
          <p className="mt-2 text-xs text-[var(--text-subtle)]">
            {status || "Hashing runs locally with the Web Crypto API."} All four digests are
            generated at once, so you can compare sizes without switching algorithm.
          </p>
        </>
      ) : (
        <>
          <p className="rounded-lg border border-dashed border-[var(--border-strong)] px-3 py-6 text-center text-sm text-[var(--text-muted)]">
            Choose a file above. It is read locally and never uploaded.
          </p>
          <div className="mt-4 rounded-xl border border-[var(--border)] bg-[var(--code-bg)] p-3">
            <div className="flex items-center justify-between gap-2">
              <span className="text-[0.7rem] font-bold uppercase tracking-[0.08em] text-[var(--text-subtle)]">
                {algorithm} digest
              </span>
              <CopyButton text={fileShown} />
            </div>
            <p className="mt-2 break-all font-mono text-[0.82rem] leading-relaxed text-[var(--text)]" aria-live="polite">
              {busy ? (
                <span className="shimmer inline-block h-4 w-full rounded" />
              ) : (
                fileShown || <span className="text-[var(--text-subtle)]">—</span>
              )}
            </p>
            <p className="mt-1.5 text-[0.7rem] text-[var(--text-subtle)]">
              {status || "Pick an algorithm, then a file."}
            </p>
          </div>
          {fileShown ? (
            <p className="mt-2 text-xs text-[var(--text-subtle)]">
              {formatNumber(fileDigest.length / 2)} bytes · {formatNumber(fileDigest.length)} hex characters
            </p>
          ) : null}
        </>
      )}
    </ToolPanel>
  );
}
