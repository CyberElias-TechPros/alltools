"use client";

import { useState } from "react";
import { Field, Select } from "@/components/ui";
import { FormatConvertTool } from "@/components/tools/format-convert-tool";

export default function ImageFormatConverter() {
  const [format, setFormat] = useState<"image/png" | "image/jpeg" | "image/webp">("image/webp");
  return (
    <div className="space-y-4">
      <div className="border border-[var(--border)] bg-[var(--surface)] p-4">
        <Field label="Convert to" htmlFor="ifc-format" hint="Pick a target format, then add the image. The original stays untouched on your device.">
          <Select id="ifc-format" value={format} onChange={(event) => setFormat(event.target.value as typeof format)}>
            <option value="image/webp">WebP</option>
            <option value="image/png">PNG</option>
            <option value="image/jpeg">JPEG</option>
          </Select>
        </Field>
      </div>
      <FormatConvertTool
        key={format}
        id="image-format-converter"
        title="Image format converter"
        target={format}
        accept="image/png,image/jpeg,image/webp,image/gif,image/avif"
      />
    </div>
  );
}
