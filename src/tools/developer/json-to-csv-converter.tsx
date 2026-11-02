"use client";

import { TransformTool } from "@/components/tools/transform-tool";
import { jsonToCsv } from "@/lib/tabular";

const SAMPLE = `[
  { "id": 1, "name": "Ada Lovelace", "role": "Analyst", "tags": ["math", "code"] },
  { "id": 2, "name": "Grace Hopper", "role": "Rear Admiral, USN", "tags": ["compilers"] }
]`;

export default function JsonToCsvConverter() {
  return (
    <TransformTool
      id="json-to-csv-converter"
      inputLabel="JSON array"
      outputLabel="CSV"
      placeholder='[{"name":"Ada","age":36}]'
      sample={SAMPLE}
      mono
      rows={14}
      downloadName="data.csv"
      options={[
        {
          kind: "select",
          id: "delimiter",
          label: "Delimiter",
          defaultValue: ",",
          options: [
            { value: ",", label: "Comma (,)" },
            { value: ";", label: "Semicolon (;)" },
            { value: "\t", label: "Tab" },
            { value: "|", label: "Pipe (|)" },
          ],
        },
        {
          kind: "toggle",
          id: "flatten",
          label: "Flatten nested objects",
          hint: "Turns {a:{b:1}} into an a.b column",
          defaultValue: true,
        },
        {
          kind: "toggle",
          id: "quoteAll",
          label: "Quote every cell",
          defaultValue: false,
        },
      ]}
      run={(input, values) => {
        if (!input.trim()) return { output: "" };
        try {
          const result = jsonToCsv(input, {
            delimiter: String(values.delimiter ?? ","),
            flatten: Boolean(values.flatten),
            quoteAll: Boolean(values.quoteAll),
          });
          const notes = [
            `${result.rowCount} row(s) · ${result.columns.length} column(s)`,
            ...result.warnings,
          ];
          return { output: result.csv, note: notes.join(" · ") };
        } catch (error) {
          return { error: error instanceof Error ? error.message : "Could not convert that JSON." };
        }
      }}
    />
  );
}
