"use client";

import { TransformTool } from "@/components/tools/transform-tool";
import { htmlToMarkdown } from "@/lib/markdown";

const SAMPLE = `<h2>Installation</h2>
<p>Run <strong>npm install</strong> and then <code>npm run dev</code>.</p>
<ul>
  <li>Node 20 or newer</li>
  <li>No external services</li>
</ul>
<p><a href="https://example.com/docs">Read the docs</a></p>`;

export default function HtmlToMarkdownConverter() {
  return (
    <TransformTool
      id="html-to-markdown-converter"
      inputLabel="HTML"
      outputLabel="Markdown"
      placeholder="<h1>Title</h1><p>Paragraph</p>"
      sample={SAMPLE}
      mono
      rows={14}
      downloadName="converted.md"
      run={(input) => {
        if (!input.trim()) return { output: "" };
        const markdown = htmlToMarkdown(input);
        if (!markdown) return { error: "No readable content found — the HTML may contain only scripts, styles or empty elements." };
        return { output: markdown, note: `${markdown.split("\n").length} line(s)` };
      }}
    />
  );
}
