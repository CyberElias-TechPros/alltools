"use client";

import { FormatConvertTool } from "@/components/tools/format-convert-tool";

export default function JpgToPngConverter() {
  return <FormatConvertTool id="jpg-to-png-converter" title="JPG to PNG" target="image/png" accept="image/jpeg" />;
}
