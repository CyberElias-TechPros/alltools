"use client";

import { TransformTool } from "@/components/tools/transform-tool";
import { buildHreflang } from "@/lib/seo-tools";

const SAMPLE = `en-GB | https://example.com/en-gb/
en-US | https://example.com/en-us/
de-DE | https://example.com/de-de/`;

export default function HreflangGenerator() {
  return (
    <TransformTool
      id="hreflang-generator"
      inputLabel="Language | URL"
      outputLabel="Alternate link tags"
      placeholder={"en-GB | https://example.com/en-gb/\nde-DE | https://example.com/de-de/"}
      sample={SAMPLE}
      mono
      rows={8}
      downloadName="hreflang.txt"
      options={[
        {
          kind: "toggle",
          id: "xDefault",
          label: "Add x-default",
          hint: "Points at the page for unmatched languages",
          defaultValue: true,
        },
      ]}
      run={(input, values) => {
        if (!input.trim()) return { output: "" };
        const entries = input
          .split("\n")
          .map((line) => line.trim())
          .filter(Boolean)
          .map((line) => {
            const [language, url] = line.split("|").map((part) => part.trim());
            return { language: language ?? "", url: url ?? "" };
          });
        const { html, issues } = buildHreflang(entries, Boolean(values.xDefault));
        if (!html) return { error: issues.join(" ") || "No valid entries found." };
        return {
          output: html,
          note: `${entries.length} language(s)${issues.length ? ` · ${issues.join(" ")}` : ""} · every entry must also be self-referencing on its own page`,
        };
      }}
    />
  );
}
