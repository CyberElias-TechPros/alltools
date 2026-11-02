"use client";

import { SnippetTool } from "@/components/tools/snippet-tool";

export default function MetaDescriptionPreviewer() {
  return (
    <SnippetTool
      id="meta-description-previewer"
      mode="description"
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
