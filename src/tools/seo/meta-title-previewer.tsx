"use client";

import { SnippetTool } from "@/components/tools/snippet-tool";

export default function MetaTitlePreviewer() {
  return (
    <SnippetTool
      id="meta-title-previewer"
      mode="title"
      sample={{
        title: "Free Unit Converter — Length, Mass and Temperature",
        description:
          "Convert between metric and imperial units with exact factors, worked examples and no rounding surprises.",
        url: "https://example.com/unit-converter",
        siteName: "Example Tools",
      }}
    />
  );
}
