"use client";

import { FormatConvertTool } from "@/components/tools/format-convert-tool";

export default function WebpConverter() {
  return <FormatConvertTool id="webp-converter" title="WebP converter" target="image/webp" accept="image/*" />;
}
