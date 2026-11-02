"use client";

import { useState } from "react";
import { Field, Select } from "@/components/ui";
import { ImageTool } from "@/components/tools/image-tool";
import { formatBytes } from "@/lib/utils";

function readAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error("The file could not be read."));
    reader.readAsDataURL(file);
  });
}

export default function ImageToBase64Converter() {
  const [mode, setMode] = useState("dataurl");

  return (
    <ImageTool
      id="image-to-base64-converter"
      accept="image/*,image/svg+xml"
      runKey={mode}
      settings={() => (
        <Field label="Output" htmlFor="i64-mode" hint="A data URL can be pasted straight into CSS or HTML; raw base64 is for APIs.">
          <Select id="i64-mode" value={mode} onChange={(event) => setMode(event.target.value)}>
            <option value="dataurl">Data URL (data:image/…;base64,…)</option>
            <option value="raw">Raw base64 only</option>
            <option value="css">CSS background rule</option>
            <option value="img">HTML img tag</option>
          </Select>
        </Field>
      )}
      run={async ({ file, image }) => {
        const dataUrl = await readAsDataUrl(file);
        const base64 = dataUrl.split(",")[1] ?? "";
        const text =
          mode === "raw"
            ? base64
            : mode === "css"
              ? `background-image: url("${dataUrl}");`
              : mode === "img"
                ? `<img src="${dataUrl}" alt="" width="${image.width}" height="${image.height}" />`
                : dataUrl;
        const overhead = Math.round((base64.length / Math.max(file.size, 1)) * 100);
        return {
          text,
          textLabel: mode === "raw" ? "Base64 string" : "Embeddable code",
          stats: [
            { label: "File size", value: formatBytes(file.size) },
            { label: "Base64 length", value: `${base64.length.toLocaleString()} chars` },
            { label: "Size overhead", value: `~${overhead}%` },
            { label: "MIME", value: file.type || "unknown" },
          ],
          note:
            "Base64 encodes every three bytes as four characters, so the text is about a third larger than the binary file. Inline data skips an HTTP request but cannot be cached separately, so keep it for small images.",
        };
      }}
    />
  );
}
