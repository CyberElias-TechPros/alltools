"use client";

import { TransformTool } from "@/components/tools/transform-tool";
import { formatBytes, minifyCss } from "@/lib/format";

const SAMPLE = `/* Buttons */
.btn {
  display: inline-flex;
  align-items: center;
  padding: 0.5rem 1rem;
  border-radius: 2px;
}

.btn:hover {
  background: #14140f;
}`;

export default function CssMinifier() {
  return (
    <TransformTool
      id="css-minifier"
      inputLabel="CSS"
      outputLabel="Minified CSS"
      placeholder=".card { color: red; }"
      sample={SAMPLE}
      mono
      rows={14}
      downloadName="styles.min.css"
      run={(input) => {
        if (!input.trim()) return { output: "" };
        const output = minifyCss(input);
        const before = new TextEncoder().encode(input).length;
        const after = new TextEncoder().encode(output).length;
        const saved = before > 0 ? Math.round((1 - after / before) * 100) : 0;
        return {
          output,
          note: `${formatBytes(before)} → ${formatBytes(after)} · ${saved}% smaller. Comments and indentation only — no rules are reordered.`,
        };
      }}
    />
  );
}
