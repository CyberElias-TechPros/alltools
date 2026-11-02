"use client";

import { useMemo, useState } from "react";
import { CopyButton, DownloadButton, Field, Select, StatGrid, TextArea, TextInput, ToolPanel } from "@/components/ui";
import { buildSitemap, type SitemapEntry } from "@/lib/tags";

const FREQUENCIES: Array<NonNullable<SitemapEntry["changefreq"]>> = [
  "daily",
  "weekly",
  "monthly",
  "yearly",
  "always",
  "hourly",
  "never",
];

export default function SitemapXmlGenerator() {
  const [baseUrl, setBaseUrl] = useState("https://example.com");
  const [paths, setPaths] = useState("/\n/about\n/tools\n/blog/first-post");
  const [lastmod, setLastmod] = useState("");
  const [changefreq, setChangefreq] = useState<SitemapEntry["changefreq"]>("weekly");
  const [priority, setPriority] = useState("");

  const entries = useMemo<SitemapEntry[]>(
    () =>
      paths
        .split("\n")
        .map((line) => line.trim())
        .filter(Boolean)
        .map((line) => {
          const url = /^https?:\/\//i.test(line)
            ? line
            : `${baseUrl.replace(/\/+$/, "")}${line.startsWith("/") ? "" : "/"}${line}`;
          return { url, lastmod, changefreq, priority };
        }),
    [paths, baseUrl, lastmod, changefreq, priority],
  );

  const result = useMemo(() => buildSitemap(entries), [entries]);

  return (
    <ToolPanel>
      <div className="grid gap-4 lg:grid-cols-2">
        <div>
          <Field label="Site base URL" htmlFor="sitemap-base" hint="Used to turn relative paths into absolute URLs.">
            <TextInput
              id="sitemap-base"
              value={baseUrl}
              onChange={(event) => setBaseUrl(event.target.value)}
              placeholder="https://example.com"
              spellCheck={false}
              className="font-mono text-[0.85rem]"
            />
          </Field>

          <div className="mt-4">
            <Field
              label="Paths or full URLs"
              htmlFor="sitemap-paths"
              hint="One per line. Lines starting with http are used as-is."
            >
              <TextArea
                id="sitemap-paths"
                value={paths}
                onChange={(event) => setPaths(event.target.value)}
                rows={10}
                spellCheck={false}
                className="font-mono text-[0.82rem]"
              />
            </Field>
          </div>

          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            <Field label="lastmod" htmlFor="sitemap-lastmod" hint="YYYY-MM-DD, optional">
              <TextInput
                id="sitemap-lastmod"
                type="date"
                value={lastmod}
                onChange={(event) => setLastmod(event.target.value)}
                className="font-mono"
              />
            </Field>
            <Field label="changefreq" htmlFor="sitemap-changefreq">
              <Select
                id="sitemap-changefreq"
                value={changefreq ?? ""}
                onChange={(event) => setChangefreq(event.target.value as SitemapEntry["changefreq"])}
              >
                <option value="">(omit)</option>
                {FREQUENCIES.map((frequency) => (
                  <option key={frequency} value={frequency}>
                    {frequency}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="priority" htmlFor="sitemap-priority" hint="0.0 – 1.0, optional">
              <TextInput
                id="sitemap-priority"
                value={priority}
                onChange={(event) => setPriority(event.target.value)}
                placeholder="0.8"
                className="font-mono"
              />
            </Field>
          </div>
        </div>

        <div>
          <div className="mb-2 flex items-center justify-between gap-2">
            <span className="label !mb-0">sitemap.xml</span>
            <div className="flex gap-1">
              <CopyButton text={result.xml} label="Copy" />
              <DownloadButton filename="sitemap.xml" content={result.xml} mime="application/xml" label="Download" />
            </div>
          </div>
          <pre className="max-h-[26rem] overflow-auto border border-[var(--border)] bg-[var(--page-elevated)] p-3 font-mono text-[0.72rem] leading-relaxed text-[var(--text)]">
            {result.xml}
          </pre>
        </div>
      </div>

      <div className="mt-5">
        <StatGrid
          columns={3}
          items={[
            { label: "URLs included", value: result.urlCount.toLocaleString() },
            { label: "Entries skipped", value: String(result.issues.length) },
            { label: "Size", value: `${(new TextEncoder().encode(result.xml).length / 1024).toFixed(1)} KB` },
          ]}
        />
      </div>

      {result.issues.length ? (
        <ul className="mt-3 space-y-1 text-sm leading-relaxed text-[var(--text-subtle)]">
          {result.issues.map((issue) => (
            <li key={issue}>{issue}</li>
          ))}
        </ul>
      ) : null}

      <p className="mt-5 text-xs leading-relaxed text-[var(--text-subtle)]">
        Sitemaps list canonical, indexable URLs only. Exclude redirects, 404s, noindex pages and parameter duplicates —
        a sitemap full of low-value URLs is worse than a short accurate one. Reference the file from{" "}
        <span className="font-mono">/robots.txt</span> after uploading it.
      </p>
    </ToolPanel>
  );
}
