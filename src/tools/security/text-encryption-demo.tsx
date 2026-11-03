"use client";

import { useState } from "react";
import { Callout, CopyButton, Field, Segmented, TextArea, TextInput, ToolPanel } from "@/components/ui";
import { decryptText, encryptText } from "@/lib/security";

export default function TextEncryptionDemo() {
  const [mode, setMode] = useState<"encrypt" | "decrypt">("encrypt");
  const [plaintext, setPlaintext] = useState("");
  const [passphrase, setPassphrase] = useState("");
  const [ciphertext, setCiphertext] = useState("");
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function run() {
    setBusy(true);
    setError("");
    setOutput("");
    try {
      if (mode === "encrypt") {
        if (!plaintext.trim()) throw new Error("Type something to encrypt.");
        if (passphrase.length < 8) throw new Error("Use a passphrase of at least eight characters.");
        const payload = await encryptText(plaintext, passphrase);
        setOutput(payload.combined);
      } else {
        if (!ciphertext.trim()) throw new Error("Paste the encrypted payload.");
        if (!passphrase) throw new Error("Enter the passphrase used to encrypt.");
        setOutput(await decryptText(ciphertext, passphrase));
      }
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "That did not work.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <ToolPanel>
      <Segmented
        label="Direction"
        value={mode}
        onChange={(next) => {
          setMode(next);
          setOutput("");
          setError("");
        }}
        options={[
          { value: "encrypt", label: "Encrypt" },
          { value: "decrypt", label: "Decrypt" },
        ]}
      />

      {mode === "encrypt" ? (
        <div className="mt-4">
          <label htmlFor="encrypt-plaintext" className="label">
            Plaintext
          </label>
          <TextArea
            id="encrypt-plaintext"
            value={plaintext}
            onChange={(event) => setPlaintext(event.target.value)}
            rows={6}
            placeholder="The message you want to encrypt…"
          />
        </div>
      ) : (
        <div className="mt-4">
          <label htmlFor="decrypt-ciphertext" className="label">
            Encrypted payload (base64)
          </label>
          <TextArea
            id="decrypt-ciphertext"
            value={ciphertext}
            onChange={(event) => setCiphertext(event.target.value)}
            rows={6}
            className="font-mono text-[0.78rem]"
            placeholder="Paste the base64 output from the encrypt step"
            spellCheck={false}
          />
        </div>
      )}

      <div className="mt-4 grid gap-3 sm:grid-cols-[1fr_auto] sm:items-end">
        <Field
          label="Passphrase"
          htmlFor="encrypt-passphrase"
          hint="Derived into an AES-256 key with PBKDF2-SHA-256 and 210,000 iterations."
        >
          <TextInput
            id="encrypt-passphrase"
            type="password"
            value={passphrase}
            onChange={(event) => setPassphrase(event.target.value)}
            className="font-mono"
            autoComplete="off"
          />
        </Field>
        <button type="button" className="btn btn-primary" onClick={run} disabled={busy}>
          {busy ? "Working…" : mode === "encrypt" ? "Encrypt" : "Decrypt"}
        </button>
      </div>

      {error ? (
        <div className="mt-4">
          <Callout tone="warning">{error}</Callout>
        </div>
      ) : null}

      {output ? (
        <div className="mt-4 border border-[var(--border)] bg-[var(--page-elevated)] p-3">
          <div className="mb-1 flex items-center justify-between">
            <span className="font-mono text-[0.6rem] uppercase tracking-[0.12em] text-[var(--text-subtle)]">
              {mode === "encrypt" ? "Ciphertext (base64)" : "Decrypted text"}
            </span>
            <CopyButton text={output} label="Copy" />
          </div>
          <code className="block max-h-64 overflow-auto whitespace-pre-wrap break-all font-mono text-[0.78rem] leading-relaxed text-[var(--text)]">
            {output}
          </code>
        </div>
      ) : null}

      <div className="mt-4">
        <Callout tone="warning">
          A demonstration of AES-GCM in the browser, not a secure messaging product. Losing the passphrase loses the
          message permanently, and a weak passphrase is the weakest link — the key is only as strong as what you type.
        </Callout>
      </div>
    </ToolPanel>
  );
}
