"use client";

import { useEffect, useState } from "react";
import { Button, CopyButton, Field, Segmented, SimpleTable, StatGrid, TextInput, ToolPanel } from "@/components/ui";
import { generateToken, type TokenEncoding } from "@/lib/security";

export default function RandomTokenGenerator() {
  const [bytes, setBytes] = useState(32);
  const [encoding, setEncoding] = useState<TokenEncoding>("hex");
  const [count, setCount] = useState(1);
  const [tokens, setTokens] = useState<string[]>([]);

  function generate() {
    setTokens(Array.from({ length: Math.max(1, Math.min(50, count)) }, () => generateToken(bytes, encoding)));
  }

  useEffect(() => {
    setTokens([generateToken(32, "hex")]);
  }, []);

  return (
    <ToolPanel>
      <div className="grid gap-4 sm:grid-cols-3">
        <Field label="Entropy source" htmlFor="token-bytes" hint="Bytes drawn from crypto.getRandomValues">
          <TextInput
            id="token-bytes"
            type="number"
            min={8}
            max={128}
            value={bytes}
            onChange={(event) => setBytes(Number(event.target.value) || 16)}
            className="font-mono"
          />
        </Field>
        <Field label="How many tokens" htmlFor="token-count" hint="Up to 50 at a time">
          <TextInput
            id="token-count"
            type="number"
            min={1}
            max={50}
            value={count}
            onChange={(event) => setCount(Number(event.target.value) || 1)}
            className="font-mono"
          />
        </Field>
        <div>
          <span className="label">Encoding</span>
          <Segmented
            label="Token encoding"
            value={encoding}
            onChange={(next) => setEncoding(next)}
            options={[
              { value: "hex", label: "Hex" },
              { value: "base64url", label: "Base64url" },
              { value: "base64", label: "Base64" },
              { value: "alphanumeric", label: "A–Z" },
            ]}
          />
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <Button variant="primary" onClick={generate}>
          Generate
        </Button>
        <CopyButton text={tokens.join("\n")} label="Copy all" />
        <span className="font-mono text-[0.6rem] uppercase tracking-[0.1em] text-[var(--text-subtle)]">
          {bytes * 8} bits of entropy per token
        </span>
      </div>

      <div className="mt-5">
        <StatGrid
          columns={3}
          items={[
            { label: "Tokens", value: String(tokens.length) },
            { label: "Bits", value: `${bytes * 8}` },
            { label: "Encoding", value: encoding },
          ]}
        />
      </div>

      <div className="mt-4">
        {tokens.length > 1 ? (
          <SimpleTable
            head={["#", "Token"]}
            caption="Generated tokens"
            rows={tokens.map((token, index) => [String(index + 1), token])}
          />
        ) : (
          <div className="border border-[var(--border)] bg-[var(--page-elevated)] p-3">
            <div className="mb-1 flex items-center justify-between">
              <span className="font-mono text-[0.6rem] uppercase tracking-[0.12em] text-[var(--text-subtle)]">
                Token
              </span>
              <CopyButton text={tokens[0] ?? ""} label="Copy" />
            </div>
            <code className="block break-all font-mono text-[0.82rem] text-[var(--text)]">{tokens[0] ?? "—"}</code>
          </div>
        )}
      </div>

      <p className="mt-5 text-xs leading-relaxed text-[var(--text-subtle)]">
        Tokens come from the operating system&apos;s cryptographic generator, so 32 bytes gives 256 bits of entropy. Use
        them for API keys, session identifiers and CSRF nonces — not for passwords a human must remember. If a token is
        shown to a user, treat it as public the moment it leaves your screen.
      </p>
    </ToolPanel>
  );
}
