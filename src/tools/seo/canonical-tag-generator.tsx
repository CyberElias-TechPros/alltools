"use client";

import { TransformTool } from "@/components/tools/transform-tool";

const SAMPLE = `https://example.com/tools
https://example.com/tools?utm_source=newsletter`;

export default function CanonicalTagGenerator() {
  return (
    <TransformTool
      id="canonical-tag-generator"
      inputLabel="URLs (one per line)"
      outputLabel="Canonical tags"
      placeholder="https://example.com/page"
      sample={SAMPLE}
      mono
      rows={8}
      downloadName="canonical-tags.txt"
      options={[
        {
          kind: "toggle",
          id: "stripParams",
          label: "Strip query parameters",
          hint: "Tracking parameters almost never belong in a canonical",
          defaultValue: true,
        },
        {
          kind: "toggle",
          id: "stripTrailing",
          label: "Remove the trailing slash",
          hint: "Pick one form and use it everywhere",
          defaultValue: false,
        },
      ]}
      run={(input, values) => {
        if (!input.trim()) return { output: "" };
        const lines: string[] = [];
        const notes: string[] = [];

        for (const raw of input.split("\n").map((line) => line.trim()).filter(Boolean)) {
          let url: URL;
          try {
            url = new URL(raw);
          } catch {
            notes.push(`Skipped “${raw}” — not an absolute URL.`);
            continue;
          }
          if (!/^https?:$/.test(url.protocol)) {
            notes.push(`Skipped “${raw}” — canonical URLs must be http or https.`);
            continue;
          }
          const clean = new URL(url.toString());
          if (values.stripParams) clean.search = "";
          clean.hash = "";
          let href = clean.toString();
          if (values.stripTrailing) href = href.replace(/\/+$/, "");
          if (clean.protocol === "http:") notes.push(`${href} uses http — prefer https.`);
          lines.push(`<link rel="canonical" href="${href}" />`);
        }

        return {
          output: lines.join("\n"),
          note: [`${lines.length} tag(s)`, ...notes].join(" · "),
        };
      }}
    />
  );
}
