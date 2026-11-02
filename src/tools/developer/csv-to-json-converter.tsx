"use client";

import { TransformTool } from "@/components/tools/transform-tool";
import { csvToJson } from "@/lib/tabular";

const SAMPLE = `id,name,role,joined
1,Ada Lovelace,Analyst,1843-01-01
2,"Hopper, Grace",Rear Admiral,1944-06-01
3,Alan Turing,Logician,1936-05-28`;

export default function CsvToJsonConverter() {
  return (
    <TransformTool
      id="csv-to-json-converter"
      inputLabel="CSV"
      outputLabel="JSON"
      placeholder={"name,age\nAda,36"}
      sample={SAMPLE}
      mono
      rows={14}
      downloadName="data.json"
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
          id: "header",
          label: "First row contains names",
          hint: "Off turns each row into a plain array",
          defaultValue: true,
        },
        {
          kind: "toggle",
          id: "inferTypes",
          label: "Convert numbers and booleans",
          hint: "“36” becomes 36, “true” becomes true",
          defaultValue: true,
        },
        {
          kind: "select",
          id: "indent",
          label: "Indentation",
          defaultValue: "2",
          options: [
            { value: "0", label: "Minified" },
            { value: "2", label: "2 spaces" },
            { value: "4", label: "4 spaces" },
          ],
        },
      ]}
      run={(input, values) => {
        if (!input.trim()) return { output: "" };
        try {
          const result = csvToJson(input, {
            delimiter: String(values.delimiter ?? ","),
            header: Boolean(values.header),
            inferTypes: Boolean(values.inferTypes),
            indent: Number(values.indent) || 0,
          });
          const notes = [`${result.rowCount} row(s)`, ...result.warnings];
          return { output: result.json, note: notes.join(" · ") };
        } catch (error) {
          return { error: error instanceof Error ? error.message : "Could not parse that CSV." };
        }
      }}
    />
  );
}
