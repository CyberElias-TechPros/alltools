"use client";

import { TransformTool } from "@/components/tools/transform-tool";
import { formatBytes, minifyHtml } from "@/lib/format";

const SAMPLE = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <title>Example page</title>
  </head>
  <body>
    <!-- Header -->
    <header class="site-header">
      <h1>Example</h1>
      <p>A short introduction with <a href="/docs">a link</a>.</p>
    </header>
  </body>
</html>`;

export default function HtmlMinifier() {
  return (
    <TransformTool
      id="html-minifier"
      inputLabel="HTML"
      outputLabel="Minified HTML"
      placeholder="<div>   <p>Hello</p>   </div>"
      sample={SAMPLE}
      mono
      rows={14}
      downloadName="minified.html"
      run={(input) => {
        if (!input.trim()) return { output: "" };
        const output = minifyHtml(input);
        const before = new TextEncoder().encode(input).length;
        const after = new TextEncoder().encode(output).length;
        const saved = before > 0 ? Math.round((1 - after / before) * 100) : 0;
        return {
          output,
          note: `${formatBytes(before)} → ${formatBytes(after)} · ${saved}% smaller. <pre>, <textarea>, <script> and <style> content is untouched.`,
        };
      }}
    />
  );
}
