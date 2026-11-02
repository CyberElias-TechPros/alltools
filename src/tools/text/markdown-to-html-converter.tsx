"use client";

import { TransformTool } from "@/components/tools/transform-tool";
import { markdownToHtml } from "@/lib/markdown";

const SAMPLE = `## Usage

Run **npm test** before you commit.

\`\`\`bash
npm run check
\`\`\`

See the [documentation](https://example.com/docs).`;

export default function MarkdownToHtmlConverter() {
  return (
    <TransformTool
      id="markdown-to-html-converter"
      inputLabel="Markdown"
      outputLabel="HTML"
      placeholder="# Heading&#10;&#10;Some **bold** text."
      sample={SAMPLE}
      mono
      rows={14}
      downloadName="converted.html"
      options={[
        {
          kind: "toggle",
          id: "indent",
          label: "Break between tags",
          hint: "Put each block on its own line for readable diffs",
          defaultValue: true,
        },
      ]}
      run={(input, values) => {
        if (!input.trim()) return { output: "" };
        const html = markdownToHtml(input, { newline: Boolean(values.indent) });
        return { output: html, note: `${html.split("\n").length} line(s) · escaped output` };
      }}
    />
  );
}
