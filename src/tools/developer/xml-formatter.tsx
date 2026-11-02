"use client";

import { TransformTool } from "@/components/tools/transform-tool";
import { formatXml, validateXml } from "@/lib/xml";

const SAMPLE = `<?xml version="1.0" encoding="UTF-8"?>
<order id="A-1042"><customer><name>Ada Lovelace</name><email>ada@example.com</email></customer><items><item sku="M-1" qty="2">Analytical Engine part</item></items><total currency="GBP">42.00</total></order>`;

export default function XmlFormatter() {
  return (
    <TransformTool
      id="xml-formatter"
      inputLabel="XML"
      outputLabel="Formatted XML"
      placeholder='<root><item id="1">Text</item></root>'
      sample={SAMPLE}
      mono
      rows={14}
      downloadName="formatted.xml"
      options={[
        {
          kind: "select",
          id: "indent",
          label: "Indentation",
          defaultValue: "2",
          options: [
            { value: "2", label: "2 spaces" },
            { value: "4", label: "4 spaces" },
            { value: "8", label: "8 spaces" },
          ],
        },
        {
          kind: "toggle",
          id: "inlineText",
          label: "Keep short text inline",
          hint: "<title>Dune</title> stays on one line",
          defaultValue: true,
        },
      ]}
      run={(input, values) => {
        if (!input.trim()) return { output: "" };
        const check = validateXml(input);
        if (!check.valid && check.issue) {
          return { error: `Not well formed — ${check.issue.message}` };
        }
        try {
          const output = formatXml(input, {
            indent: Number(values.indent) || 2,
            inlineText: Boolean(values.inlineText),
          });
          const stats = check.stats;
          return {
            output,
            note: stats
              ? `${stats.elements} element(s) · ${stats.attributes} attribute(s) · max depth ${stats.maxDepth}`
              : undefined,
          };
        } catch (error) {
          return { error: error instanceof Error ? error.message : "Could not format that XML." };
        }
      }}
    />
  );
}
