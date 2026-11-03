"use client";

import { TransformTool } from "@/components/tools/transform-tool";
import { analyseHeadings, outlineFromHtml } from "@/lib/seo-tools";

export default function WebsiteContentOutlineGenerator() {
  return (
    <TransformTool
      id="website-content-outline-generator"
      inputLabel="Page HTML"
      outputLabel="Markdown outline"
      placeholder="<h1>Title</h1><h2>Section</h2>…"
      sample={"<h1>Unit converter</h1>\n<h2>How it works</h2>\n<h3>Length</h3>\n<h3>Mass</h3>\n<h2>FAQ</h2>"}
      mono
      rows={12}
      downloadName="outline.md"
      run={(input) => {
        if (!input.trim()) return { output: "" };
        const report = analyseHeadings(input);
        if (report.headings.length === 0) {
          return { error: "No h1–h6 elements found. Paste markup that contains headings." };
        }
        return {
          output: outlineFromHtml(input),
          note: `${report.headings.length} heading(s)${
            report.issues.length ? ` · ${report.issues.join(" ")}` : " · structure looks clean"
          }`,
        };
      }}
    />
  );
}
