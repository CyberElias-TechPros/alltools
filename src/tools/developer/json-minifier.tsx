"use client";

import { TransformTool } from "@/components/tools/transform-tool";
import { formatBytes } from "@/lib/format";

export default function JsonMinifier() {
  return (
    <TransformTool
      id="json-minifier"
      inputLabel="JSON"
      outputLabel="Minified JSON"
      placeholder='{ "name": "Ada", "tags": ["math", "code"] }'
      sample={'{\n  "name": "Ada Lovelace",\n  "roles": [\n    "mathematician",\n    "programmer"\n  ],\n  "active": true\n}'}
      mono
      rows={12}
      downloadName="minified.json"
      options={[
        {
          kind: "select",
          id: "mode",
          label: "Output",
          defaultValue: "minify",
          options: [
            { value: "minify", label: "Minify (no whitespace)" },
            { value: "compact", label: "Compact (2-space, no blank lines)" },
          ],
        },
        {
          kind: "toggle",
          id: "sortKeys",
          label: "Sort keys alphabetically",
          hint: "Useful for stable diffs",
          defaultValue: false,
        },
      ]}
      run={(input, values) => {
        if (!input.trim()) return { output: "" };
        let parsed: unknown;
        try {
          parsed = JSON.parse(input);
        } catch (error) {
          const message = error instanceof Error ? error.message.replace(/^JSON\.parse: /, "") : "Invalid JSON";
          return { error: `That is not valid JSON — ${message}` };
        }

        const sortKeys = (value: unknown): unknown => {
          if (Array.isArray(value)) return value.map(sortKeys);
          if (value && typeof value === "object") {
            return Object.fromEntries(
              Object.keys(value as Record<string, unknown>)
                .sort()
                .map((key) => [key, sortKeys((value as Record<string, unknown>)[key])]),
            );
          }
          return value;
        };

        const output = JSON.stringify(sortKeys(parsed), null, values.mode === "compact" ? 2 : 0);
        const before = new TextEncoder().encode(input).length;
        const after = new TextEncoder().encode(output).length;
        const saved = before > 0 ? Math.round((1 - after / before) * 100) : 0;
        return {
          output,
          note: `${formatBytes(before)} → ${formatBytes(after)}${saved > 0 ? ` · ${saved}% smaller` : ""}`,
        };
      }}
    />
  );
}
