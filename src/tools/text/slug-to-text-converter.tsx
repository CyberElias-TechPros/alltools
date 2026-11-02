"use client";

import { TransformTool } from "@/components/tools/transform-tool";
import { slugToText } from "@/lib/text";

export default function SlugToTextConverter() {
  return (
    <TransformTool
      id="slug-to-text-converter"
      inputLabel="Slug or URL"
      outputLabel="Readable text"
      placeholder="how-to-choose-a-strong-password"
      sample="https://example.com/blog/2024/07/how-to-choose-a-strong-password"
      rows={4}
      outputRows={4}
      options={[
        {
          kind: "select",
          id: "style",
          label: "Case",
          defaultValue: "title",
          options: [
            { value: "title", label: "Title Case" },
            { value: "sentence", label: "Sentence case" },
            { value: "lower", label: "lower case" },
          ],
        },
        {
          kind: "toggle",
          id: "stripNumbers",
          label: "Strip numbers",
          hint: "Remove IDs such as 2024 or 117",
          defaultValue: false,
        },
      ]}
      run={(input, values) => {
        if (!input.trim()) return { output: "" };
        const output = slugToText(input, {
          style: (values.style as "title" | "sentence" | "lower") ?? "title",
          stripNumbers: Boolean(values.stripNumbers),
        });
        return { output, note: `${output.split(" ").filter(Boolean).length} words` };
      }}
    />
  );
}
