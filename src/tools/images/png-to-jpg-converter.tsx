"use client";

import { FormatConvertTool } from "@/components/tools/format-convert-tool";

export default function PngToJpgConverter() {
  return <FormatConvertTool id="png-to-jpg-converter" title="PNG to JPG" target="image/jpeg" accept="image/png,image/webp" />;
}
