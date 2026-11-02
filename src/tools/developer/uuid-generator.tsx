"use client";

import { useCallback, useEffect, useState } from "react";
import { RefreshCw } from "lucide-react";
import {
  Button,
  CopyButton,
  DownloadButton,
  Field,
  Segmented,
  TextInput,
  ToolPanel,
} from "@/components/ui";

function newUuid(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  const bytes = crypto.getRandomValues(new Uint8Array(16));
  bytes[6] = (bytes[6] & 0x0f) | 0x40;
  bytes[8] = (bytes[8] & 0x3f) | 0x80;
  const hex = [...bytes].map((byte) => byte.toString(16).padStart(2, "0")).join("");
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
}

export default function UuidGenerator() {
  const [count, setCount] = useState("5");
  const [format, setFormat] = useState<"lower" | "upper" | "compact" | "braces">("lower");
  const [nonce, setNonce] = useState(0);

  const generate = useCallback(
    (amount: number) =>
      Array.from({ length: Math.min(Math.max(amount, 1), 1000) }, () => {
        const uuid = newUuid();
        switch (format) {
          case "upper":
            return uuid.toUpperCase();
          case "compact":
            return uuid.replace(/-/g, "");
          case "braces":
            return `{${uuid}}`;
          default:
            return uuid;
        }
      }),
    [format],
  );

  const [list, setList] = useState<string[]>([]);

  useEffect(() => {
    setList(generate(Number(count) || 1));
  }, [count, format, nonce, generate]);

  const output = list.join("\n");

  return (
    <ToolPanel>
      <div className="grid gap-3 sm:grid-cols-[1fr_1.5fr]">
        <Field label="How many?" htmlFor="uuid-count" hint="1–1000">
          <TextInput
            id="uuid-count"
            type="number"
            min={1}
            max={1000}
            value={count}
            onChange={(event) => setCount(event.target.value)}
          />
        </Field>
        <div>
          <span className="label">Format</span>
          <Segmented
            label="UUID format"
            value={format}
            onChange={setFormat}
            options={[
              { value: "lower", label: "lowercase" },
              { value: "upper", label: "UPPERCASE" },
              { value: "compact", label: "nohyphens" },
              { value: "braces", label: "{braces}" },
            ]}
          />
        </div>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <Button size="sm" variant="primary" onClick={() => setNonce((value) => value + 1)}>
          <RefreshCw className="size-3.5" aria-hidden /> Generate
        </Button>
        <CopyButton text={output} label="Copy all" />
        <DownloadButton filename="uuids.txt" content={output} />
        <span className="ml-auto text-xs text-[var(--text-subtle)]">
          Generated with crypto.randomUUID
        </span>
      </div>

      <div className="mt-3 max-h-80 overflow-auto rounded-xl border border-[var(--border)] bg-[var(--code-bg)] p-3 font-mono text-[0.82rem] leading-relaxed text-[var(--text)]">
        <ul aria-live="polite">
          {list.map((uuid, index) => (
            <li key={`${uuid}-${index}`} className="break-all py-0.5">
              {uuid}
            </li>
          ))}
        </ul>
      </div>

      <p className="mt-3 text-xs text-[var(--text-subtle)]">
        RFC 4122 version 4: 122 random bits with version and variant markers, so no coordination
        between systems is needed.
      </p>
    </ToolPanel>
  );
}
