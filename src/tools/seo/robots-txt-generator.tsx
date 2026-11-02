"use client";

import { useMemo, useState } from "react";
import {
  Callout,
  CopyButton,
  DownloadButton,
  Field,
  Segmented,
  TextArea,
  TextInput,
  ToolPanel,
} from "@/components/ui";

const TARGETS = [
  { value: "all", label: "Allow all" },
  { value: "block", label: "Block all" },
  { value: "custom", label: "Custom" },
] as const;

export default function RobotsTxtGenerator() {
  const [mode, setMode] = useState<"all" | "block" | "custom">("all");
  const [agent, setAgent] = useState("*");
  const [disallow, setDisallow] = useState("/admin/\n/search/\n/cart/");
  const [allow, setAllow] = useState("");
  const [sitemap, setSitemap] = useState("https://example.com/sitemap.xml");

  const output = useMemo(() => {
    const lines: string[] = [];
    if (mode === "block") {
      lines.push("User-agent: *", "Disallow: /", "");
    } else if (mode === "all") {
      lines.push("User-agent: *", "Allow: /", "");
    } else {
      lines.push(`User-agent: ${agent.trim() || "*"}`);
      const disallowPaths = disallow
        .split("\n")
        .map((line) => line.trim())
        .filter(Boolean);
      const allowPaths = allow
        .split("\n")
        .map((line) => line.trim())
        .filter(Boolean);
      if (!disallowPaths.length && !allowPaths.length) lines.push("Disallow:");
      disallowPaths.forEach((path) => lines.push(`Disallow: ${path.startsWith("/") ? path : `/${path}`}`));
      allowPaths.forEach((path) => lines.push(`Allow: ${path.startsWith("/") ? path : `/${path}`}`));
      lines.push("");
    }
    if (sitemap.trim()) lines.push(`Sitemap: ${sitemap.trim()}`);
    return lines.join("\n").replace(/\n{3,}/g, "\n\n").trim() + "\n";
  }, [mode, agent, disallow, allow, sitemap]);

  const warnings: string[] = [];
  if (/Disallow:\s*\/\s*$/m.test(output) && mode !== "block") {
    warnings.push("A rule blocks the entire site. Remove it unless this is a staging environment.");
  }
  if (/^\s*Sitemap:/i.test(sitemap) || (sitemap && !/^https?:\/\//.test(sitemap))) {
    warnings.push("The Sitemap directive must be an absolute http(s) URL.");
  }
  if (/Allow:.*\.css|Allow:.*\.js/i.test(output)) {
    warnings.push("Blocking CSS and JavaScript can stop Google rendering pages correctly. Avoid it.");
  }

  return (
    <ToolPanel>
      <Segmented
        label="Crawler policy"
        value={mode}
        onChange={setMode}
        options={TARGETS.map((target) => ({ value: target.value, label: target.label }))}
      />

      {mode === "custom" ? (
        <div className="mt-4 grid gap-3 lg:grid-cols-2">
          <div className="grid gap-3">
            <Field label="User-agent" htmlFor="rb-agent" hint="* for all crawlers, or e.g. GPTBot, Googlebot">
              <TextInput id="rb-agent" value={agent} onChange={(event) => setAgent(event.target.value)} className="font-mono" />
            </Field>
            <Field label="Disallow paths" htmlFor="rb-disallow" hint="One path per line. Longest matching rule wins.">
              <TextArea id="rb-disallow" value={disallow} onChange={(event) => setDisallow(event.target.value)} className="min-h-28 font-mono text-[0.85rem]" />
            </Field>
            <Field label="Allow paths" htmlFor="rb-allow" optional hint="Use to re-allow a sub-path inside a blocked folder">
              <TextArea id="rb-allow" value={allow} onChange={(event) => setAllow(event.target.value)} className="min-h-20 font-mono text-[0.85rem]" />
            </Field>
          </div>
          <div>
            <div className="mb-2 flex items-center justify-between">
              <span className="label !mb-0">robots.txt preview</span>
              <div className="flex gap-1.5">
                <CopyButton text={output} />
                <DownloadButton filename="robots.txt" content={output} />
              </div>
            </div>
            <pre className="min-h-64 overflow-auto whitespace-pre rounded-xl border border-[var(--border)] bg-[var(--code-bg)] p-3 font-mono text-[0.82rem] text-[var(--text)]">
              {output}
            </pre>
          </div>
        </div>
      ) : (
        <div className="mt-4 grid gap-3 lg:grid-cols-[1fr_1.2fr]">
          <div className="grid gap-3">
            <p className="rounded-lg border border-[var(--border)] bg-[var(--surface-muted)] p-3 text-sm leading-relaxed text-[var(--text-muted)]">
              {mode === "all"
                ? "Allows every crawler to access the whole site. Add your sitemap below so crawlers can find new pages quickly."
                : "Blocks every crawler. Correct for a staging or pre-launch site — and catastrophic on a live site, where it removes it from search results entirely."}
            </p>
            <Field label="Sitemap URL" htmlFor="rb-sitemap" optional>
              <TextInput
                id="rb-sitemap"
                value={sitemap}
                onChange={(event) => setSitemap(event.target.value)}
                className="font-mono text-[0.85rem]"
              />
            </Field>
          </div>
          <div>
            <div className="mb-2 flex items-center justify-between">
              <span className="label !mb-0">robots.txt preview</span>
              <div className="flex gap-1.5">
                <CopyButton text={output} />
                <DownloadButton filename="robots.txt" content={output} />
              </div>
            </div>
            <pre className="min-h-40 overflow-auto whitespace-pre rounded-xl border border-[var(--border)] bg-[var(--code-bg)] p-3 font-mono text-[0.82rem] text-[var(--text)]">
              {output}
            </pre>
          </div>
        </div>
      )}

      {warnings.length ? (
        <div className="mt-3 space-y-2">
          {warnings.map((warning) => (
            <Callout key={warning} tone="warning">
              {warning}
            </Callout>
          ))}
        </div>
      ) : null}

      <p className="mt-3 text-xs text-[var(--text-subtle)]">
        robots.txt controls crawling, not indexing. To keep a page out of search results, allow
        crawling and serve a noindex meta tag instead.
      </p>
    </ToolPanel>
  );
}
