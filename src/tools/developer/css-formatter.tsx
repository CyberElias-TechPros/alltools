"use client";

import { TransformTool } from "@/components/tools/transform-tool";
import { beautifyCode } from "@/lib/format";

const SAMPLE = `.card{display:grid;gap:1rem;padding:1.5rem;border:1px solid #e5e5e5}
.card__title{font-size:1.25rem;font-weight:600;letter-spacing:-.01em}
@media (min-width:768px){.card{grid-template-columns:repeat(2,1fr)}}`;

export default function CssFormatter() {
  return (
    <TransformTool
      id="css-formatter"
      inputLabel="CSS"
      outputLabel="Formatted CSS"
      placeholder=".card{color:red;padding:0 1rem}"
      sample={SAMPLE}
      mono
      rows={14}
      downloadName="formatted.css"
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
          id: "selectorBreak",
          label: "Multiple selectors",
          defaultValue: "newline",
          options: [
            { value: "newline", label: "One per line" },
            { value: "same", label: "Keep on one line" },
          ],
        },
      ]}
      run={(input, values) => {
        if (!input.trim()) return { output: "" };
        try {
          const output = beautifyCode("css", input, {
            tabs: values.indent === "tab",
            indent: Number(values.indent) || 2,
          }).replace(/\n{3,}/g, "\n\n");
          return { output, note: `${output.split("\n").length} line(s)` };
        } catch (error) {
          return { error: error instanceof Error ? error.message : "Could not format that CSS." };
        }
      }}
    />
  );
}
