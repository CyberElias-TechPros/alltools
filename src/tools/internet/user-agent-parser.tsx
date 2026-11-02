"use client";

import { useEffect, useState } from "react";
import { CopyButton, ResultCard, SimpleTable, StatGrid, TextArea, ToolPanel } from "@/components/ui";
import { parseUserAgent, type UserAgentInfo } from "@/lib/web";

const SAMPLES: Array<{ label: string; value: string }> = [
  {
    label: "Chrome · Windows",
    value:
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36",
  },
  {
    label: "Safari · iPhone",
    value:
      "Mozilla/5.0 (iPhone; CPU iPhone OS 17_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4 Mobile/15E148 Safari/604.1",
  },
  {
    label: "Edge · Windows",
    value:
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36 Edg/126.0.2592.87",
  },
  { label: "Googlebot", value: "Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)" },
];

export default function UserAgentParser() {
  const [input, setInput] = useState("");
  const [own, setOwn] = useState("");

  useEffect(() => {
    setOwn(navigator.userAgent);
    setInput(navigator.userAgent);
  }, []);

  const result = input.trim() ? parseUserAgent(input) : null;
  const error = result && "error" in result ? result.error : "";
  const info: UserAgentInfo | null = result && !error ? (result as UserAgentInfo) : null;

  return (
    <ToolPanel>
      <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
        <label htmlFor="ua-input" className="label !mb-0">
          User-Agent string
        </label>
        <div className="flex flex-wrap gap-1">
          {own ? (
            <button
              type="button"
              className="btn btn-ghost !min-h-8 !px-2.5 !py-1.5 !text-[0.6rem] !tracking-[0.1em]"
              onClick={() => setInput(own)}
            >
              Use this browser
            </button>
          ) : null}
        </div>
      </div>
      <TextArea
        id="ua-input"
        value={input}
        onChange={(event) => setInput(event.target.value)}
        rows={4}
        spellCheck={false}
        className="font-mono text-[0.78rem]"
        placeholder="Paste a User-Agent header value"
      />

      <div className="mt-3 flex flex-wrap gap-1.5">
        {SAMPLES.map((sample) => (
          <button
            key={sample.label}
            type="button"
            onClick={() => setInput(sample.value)}
            className="border border-[var(--border)] px-2.5 py-1.5 font-mono text-[0.6rem] uppercase tracking-[0.1em] text-[var(--text-subtle)] transition-colors hover:border-[var(--border-strong)] hover:text-[var(--text)]"
          >
            {sample.label}
          </button>
        ))}
      </div>

      <div className="mt-5">
        {error ? (
          <div role="alert" className="border border-[#c0392b] bg-[var(--surface-muted)] p-3 font-mono text-[0.8rem] text-[#8d2f22] dark:text-[#ff9a8a]">
            {error}
          </div>
        ) : info ? (
          <ResultCard
            label="Detected"
            value={`${info.browser.name}${info.browser.version ? ` ${info.browser.version}` : ""}`}
            tone="brand"
            sub={`${info.os.name}${info.os.version ? ` ${info.os.version}` : ""} · ${info.device.type}`}
          >
            <StatGrid
              columns={4}
              items={[
                { label: "Browser", value: info.browser.name },
                { label: "Version", value: info.browser.version || "unknown" },
                { label: "Engine", value: info.engine },
                { label: "Operating system", value: info.os.name },
                { label: "OS version", value: info.os.version || "unknown" },
                { label: "Device", value: info.device.type },
                { label: "Vendor", value: info.device.vendor || "unknown" },
                { label: "Automated", value: info.isBot ? "Yes" : "No" },
              ]}
            />

            <div className="mt-4">
              <SimpleTable
                head={["Token", "Reads as"]}
                caption="Raw tokens found in the string"
                rows={[
                  ["Browser", info.browser.name],
                  ["Engine", info.engine],
                  ["Platform", `${info.os.name} ${info.os.version}`.trim()],
                  ["Device class", info.device.type],
                ]}
              />
            </div>

            {info.notes.length ? (
              <ul className="mt-4 space-y-1.5 border-t border-[var(--border)] pt-3 text-sm leading-relaxed text-[var(--text-subtle)]">
                {info.notes.map((note) => (
                  <li key={note}>{note}</li>
                ))}
              </ul>
            ) : null}

            <div className="mt-4 flex flex-wrap gap-2">
              <CopyButton text={input} label="Copy input" />
              <CopyButton
                text={`${info.browser.name} ${info.browser.version} on ${info.os.name} ${info.os.version}`.trim()}
                label="Copy summary"
              />
            </div>
          </ResultCard>
        ) : null}
      </div>

      <p className="mt-5 text-xs leading-relaxed text-[var(--text-subtle)]">
        Detection is pattern matching against well-known tokens. User-Agent strings are self-declared and easy to spoof,
        which is why feature detection — not this string — is the right way to branch behaviour in code.
      </p>
    </ToolPanel>
  );
}
