"use client";

import { useEffect, useMemo, useState } from "react";
import { CopyButton, Field, Segmented, StatGrid, TextArea, TextInput, ToolPanel } from "@/components/ui";
import { formatBytes } from "@/lib/format";
import { hashBytes, hashText, type HashAlgorithm } from "@/lib/security";

/**
 * Shared hashing surface for the checksum and SHA pages: text or file input,
 * one or more algorithms, optional comparison against a published checksum.
 */
export function HashTool({
  id,
  algorithms,
  defaultAlgorithm,
  compare = true,
  fileFirst = false,
}: {
  id: string;
  algorithms: HashAlgorithm[];
  defaultAlgorithm: HashAlgorithm;
  compare?: boolean;
  fileFirst?: boolean;
}) {
  const [mode, setMode] = useState<"text" | "file">(fileFirst ? "file" : "text");
  const [text, setText] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [digests, setDigests] = useState<Partial<Record<HashAlgorithm, string>>>({});
  const [expected, setExpected] = useState("");
  const [status, setStatus] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const source = mode === "text" ? text : "";
    if (mode === "text" && !source) {
      setDigests({});
      setStatus("");
      return;
    }
    if (mode === "text") {
      setBusy(true);
      Promise.all(algorithms.map(async (algorithm) => [algorithm, await hashText(algorithm, source)] as const))
        .then((pairs) => {
          if (cancelled) return;
          setDigests(Object.fromEntries(pairs));
          setStatus(`${new TextEncoder().encode(source).length.toLocaleString()} bytes hashed locally`);
        })
        .catch(() => !cancelled && setStatus("Hashing is unavailable in this browser context."))
        .finally(() => !cancelled && setBusy(false));
    }
    return () => {
      cancelled = true;
    };
  }, [text, mode, algorithms, defaultAlgorithm]);

  async function hashFile(next: File) {
    setFile(next);
    setBusy(true);
    try {
      if (next.size > 200 * 1024 * 1024) {
        setStatus("That file is larger than 200 MB — hashing it here would freeze the tab.");
        setDigests({});
        return;
      }
      const buffer = await next.arrayBuffer();
      const pairs = await Promise.all(
        algorithms.map(async (algorithm) => [algorithm, await hashBytes(algorithm, buffer)] as const),
      );
      setDigests(Object.fromEntries(pairs));
      setStatus(`${formatBytes(next.size)} hashed locally — the file was never uploaded`);
    } catch {
      setStatus("Could not read that file.");
    } finally {
      setBusy(false);
    }
  }

  const matches = useMemo(() => {
    if (!expected.trim()) return null;
    const normalised = expected.trim().toLowerCase().replace(/\s+/g, "");
    return algorithms.some((algorithm) => (digests[algorithm] ?? "").toLowerCase() === normalised);
  }, [expected, digests, algorithms]);

  return (
    (<ToolPanel>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Segmented
          label="Input"
          value={mode}
          onChange={(next) => setMode(next)}
          options={[
            { value: "text", label: "Text" },
            { value: "file", label: "File" },
          ]}
        />
        <span className="font-mono text-[0.6rem] uppercase tracking-[0.1em] text-[var(--text-subtle)]">
          {busy ? "Hashing…" : status}
        </span>
      </div>

      <div className="mt-4">
        {mode === "text" ? (
          <>
            <label htmlFor={`${id}-text`} className="label">
              Text to hash
            </label>
            <TextArea
              id={`${id}-text`}
              value={text}
              onChange={(event) => setText(event.target.value)}
              rows={6}
              spellCheck={false}
              className="font-mono text-[0.82rem]"
              placeholder="Type or paste anything…"
            />
          </>
        ) : (
          <div>
            <span className="label">File to hash</span>
            <div className="border border-dashed border-[var(--border-strong)] bg-[var(--surface)] p-6 text-center">
              <p className="text-sm font-medium text-[var(--text)]">
                {file ? `${file.name} · ${formatBytes(file.size)}` : "Choose a file — nothing is uploaded"}
              </p>
              <div className="mt-3">
                <label
                  htmlFor={`${id}-file`}
                  className="btn btn-secondary inline-flex cursor-pointer items-center"
                >
                  Choose file
                </label>
              </div>
              <input
                id={`${id}-file`}
                type="file"
                className="sr-only"
                onChange={(event) => {
                  const next = event.target.files?.[0];
                  if (next) void hashFile(next);
                }}
              />
            </div>
          </div>
        )}
      </div>

      <div className="mt-5 space-y-2">
        {algorithms.map((algorithm) => {
          const digest = digests[algorithm] ?? "";
          return (
            <div key={algorithm} className="border border-[var(--border)] bg-[var(--page-elevated)] p-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="font-mono text-[0.6rem] uppercase tracking-[0.12em] text-[var(--text-subtle)]">
                  {algorithm}
                </span>
                <CopyButton text={digest} label="Copy" />
              </div>
              <code className="mt-1 block break-all font-mono text-[0.8rem] leading-relaxed text-[var(--text)]">
                {digest || "—"}
              </code>
            </div>
          );
        })}
      </div>

      {compare ? (
        <div className="mt-4">
          <Field
            label="Compare with a published checksum (optional)"
            htmlFor={`${id}-expected`}
            hint="Case and spaces are ignored. Matching means the bytes are identical."
          >
            <TextInput
              id={`${id}-expected`}
              value={expected}
              onChange={(event) => setExpected(event.target.value)}
              className="font-mono text-[0.8rem]"
              spellCheck={false}
              placeholder="Paste the expected digest"
            />
          </Field>
          {matches !== null ? (
            <div className="mt-3">
              <StatGrid
                columns={2}
                items={[
                  {
                    label: "Comparison",
                    value: matches ? "Match" : "No match",
                    hint: matches ? `Matches the ${algorithms.find((a) => digests[a]?.toLowerCase() === expected.trim().toLowerCase()) ?? "selected"} digest` : "Bytes differ, or a different algorithm produced that value",
                  },
                  { label: "Input size", value: mode === "file" && file ? formatBytes(file.size) : `${new TextEncoder().encode(text).length} bytes` },
                ]}
              />
            </div>
          ) : null}
        </div>
      ) : null}

      <p className="mt-4 text-xs leading-relaxed text-[var(--text-subtle)]">
        Hashing is one-way: the same input always produces the same digest, but you cannot recover the input from it.
        MD5 and SHA-1 are supported for legacy checksum compatibility only — never use them to store passwords. For
        password storage, use Argon2id, scrypt or bcrypt on the server.
      </p>
    </ToolPanel>)
  );
}
