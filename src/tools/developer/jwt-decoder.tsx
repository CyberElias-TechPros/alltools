"use client";

import { useMemo, useState } from "react";
import { Callout, CopyButton, TextArea, ToolPanel } from "@/components/ui";
import { decodeJwt } from "@/lib/dev";

const SAMPLE =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwicm9sZSI6ImFkbWluIiwiaWF0IjoxNzAwMDAwMDAwLCJleHAiOjE5MDAwMDAwMDB9.c2lnbmF0dXJlLXBsYWNlaG9sZGVy";

export default function JwtDecoder() {
  const [token, setToken] = useState("");
  const decoded = useMemo(() => (token.trim() ? decodeJwt(token) : null), [token]);

  const formatDate = (date?: Date | null) =>
    date ? `${date.toISOString().replace("T", " ").replace(".000Z", " UTC")} (${date.toLocaleString()})` : "—";

  return (
    <ToolPanel>
      <div className="mb-2 flex items-center justify-between">
        <label htmlFor="jwt-input" className="label !mb-0">
          Paste a JWT
        </label>
        <button
          type="button"
          onClick={() => setToken(SAMPLE)}
          className="text-xs font-medium text-brand-600 hover:underline dark:text-brand-300"
        >
          Load sample token
        </button>
      </div>
      <TextArea
        id="jwt-input"
        value={token}
        onChange={(event) => setToken(event.target.value)}
        placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9…"
        className="min-h-32 font-mono text-[0.8rem]"
        spellCheck={false}
        autoComplete="off"
      />

      {decoded?.error ? (
        <div className="mt-3">
          <Callout tone="warning" title="Could not decode">
            {decoded.error}
          </Callout>
        </div>
      ) : null}

      {decoded && !decoded.error ? (
        <div className="mt-4 space-y-4">
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="rounded-lg border border-[var(--border)] bg-[var(--surface-muted)] p-3">
              <p className="text-[0.68rem] font-semibold uppercase tracking-[0.07em] text-[var(--text-subtle)]">Algorithm</p>
              <p className="mt-1 font-mono text-sm">{String(decoded.header?.alg ?? "—")}</p>
            </div>
            <div className="rounded-lg border border-[var(--border)] bg-[var(--surface-muted)] p-3">
              <p className="text-[0.68rem] font-semibold uppercase tracking-[0.07em] text-[var(--text-subtle)]">Status</p>
              <p className={`mt-1 text-sm font-semibold ${decoded.expired ? "text-rose-600 dark:text-rose-400" : "text-emerald-700 dark:text-emerald-400"}`}>
                {decoded.expiresAt ? (decoded.expired ? "Expired" : "Not expired") : "No exp claim"}
              </p>
            </div>
            <div className="rounded-lg border border-[var(--border)] bg-[var(--surface-muted)] p-3">
              <p className="text-[0.68rem] font-semibold uppercase tracking-[0.07em] text-[var(--text-subtle)]">Signature verified</p>
              <p className="mt-1 text-sm font-semibold text-[var(--text-muted)]">No — decoding only</p>
            </div>
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <div>
              <div className="mb-1.5 flex items-center justify-between">
                <h3 className="text-[0.72rem] font-bold uppercase tracking-[0.08em] text-[var(--text-subtle)]">Header</h3>
                <CopyButton text={JSON.stringify(decoded.header, null, 2)} />
              </div>
              <pre className="max-h-56 overflow-auto rounded-xl border border-[var(--border)] bg-[var(--code-bg)] p-3 font-mono text-[0.78rem] text-[var(--text)]">
                {JSON.stringify(decoded.header, null, 2)}
              </pre>
            </div>
            <div>
              <div className="mb-1.5 flex items-center justify-between">
                <h3 className="text-[0.72rem] font-bold uppercase tracking-[0.08em] text-[var(--text-subtle)]">Payload claims</h3>
                <CopyButton text={JSON.stringify(decoded.payload, null, 2)} />
              </div>
              <pre className="max-h-56 overflow-auto rounded-xl border border-[var(--border)] bg-[var(--code-bg)] p-3 font-mono text-[0.78rem] text-[var(--text)]">
                {JSON.stringify(decoded.payload, null, 2)}
              </pre>
            </div>
          </div>

          <div className="overflow-hidden rounded-xl border border-[var(--border)]">
            <table className="w-full text-sm">
              <caption className="sr-only">Registered claims</caption>
              <thead className="bg-[var(--surface-muted)]">
                <tr>
                  {["Claim", "Value"].map((head) => (
                    <th key={head} scope="col" className="px-3 py-2 text-left text-[0.7rem] uppercase tracking-[0.06em] text-[var(--text-subtle)]">
                      {head}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  ["iss (issuer)", String(decoded.payload?.iss ?? "—")],
                  ["sub (subject)", String(decoded.payload?.sub ?? "—")],
                  ["aud (audience)", String(decoded.payload?.aud ?? "—")],
                  ["iat (issued at)", formatDate(decoded.issuedAt)],
                  ["nbf (not before)", formatDate(decoded.notBefore)],
                  ["exp (expires)", formatDate(decoded.expiresAt)],
                ].map(([label, value]) => (
                  <tr key={label} className="odd:bg-[var(--surface)] even:bg-[var(--surface-muted)]/40">
                    <td className="border-t border-[var(--border)] px-3 py-1.5 text-xs text-[var(--text-muted)]">{label}</td>
                    <td className="border-t border-[var(--border)] px-3 py-1.5 font-mono text-xs">{value}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <Callout tone="warning" title="This does not verify the token">
            A decoded payload proves nothing about who issued it. Signature verification needs the
            issuer&apos;s key and must happen on a trusted server. Never paste production tokens into a
            site you do not trust — this page processes locally, but the value is still on screen.
          </Callout>
        </div>
      ) : null}
    </ToolPanel>
  );
}
