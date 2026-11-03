"use client";

import { TransformTool } from "@/components/tools/transform-tool";
import { beautifyCode } from "@/lib/format";

const SAMPLE = `<!doctype html><html lang="en"><head><meta charset="utf-8"><title>Example</title></head><body><main class="page"><h1>Hello</h1><p>A paragraph with <strong>bold</strong> text.</p><ul><li>One</li><li>Two</li></ul></main></body></html>`;

export default function HtmlFormatter() {
  return (
    <TransformTool
      id="html-formatter"
      inputLabel="HTML"
      outputLabel="Formatted HTML"
      placeholder="<div><p>Hello</p></div>"
      sample={SAMPLE}
      mono
      rows={14}
      downloadName="formatted.html"
      options={[
        {
          kind: "select",
          id: "indent",
          label: "Indentation",
          defaultValue: "2",
          options: [
            { value: "2", label: "2 spaces" },
            { value: "4", label: "4 spaces" },
            { value: "tab", label: "Tabs" },
          ],
        },
        {
          kind: "select",
          id: "wrap",
          label: "Wrap long lines",
          defaultValue: "0",
          options: [
            { value: "0", label: "Never" },
            { value: "80", label: "At 80 characters" },
            { value: "120", label: "At 120 characters" },
          ],
        },
      ]}
      run={(input, values) => {
        if (!input.trim()) return { output: "" };
        try {
          const output = beautifyCode("html", input, {
            tabs: values.indent === "tab",
            indent: Number(values.indent) || 2,
            wrap: Number(values.wrap) || 0,
          });
          return { output, note: `${output.split("\n").length} line(s)` };
        } catch (error) {
          return { error: error instanceof Error ? error.message : "Could not format that HTML." };
        }
      }}
    />
  );
}
