"use client";

import { TransformTool } from "@/components/tools/transform-tool";
import { beautifyCode } from "@/lib/format";

const SAMPLE = `const prices=[12.5,3,19];function total(items,tax=.2){return items.reduce((sum,price)=>sum+price,0)*(1+tax)}async function load(url){const response=await fetch(url);if(!response.ok)throw new Error("HTTP "+response.status);return response.json()}`;

export default function JavascriptFormatter() {
  return (
    <TransformTool
      id="javascript-formatter"
      inputLabel="JavaScript"
      outputLabel="Formatted JavaScript"
      placeholder="const add=(a,b)=>a+b;"
      sample={SAMPLE}
      mono
      rows={14}
      downloadName="formatted.js"
      options={[
        {
          kind: "select",
          id: "indent",
          label: "Indentation",
          defaultValue: "2",
          options: [
            { value: "2", label: "2 spaces" },
            { value: "4", label: "4 spaces" },
            { value: "tab", label: "Tabs" },
          ],
        },
        {
          kind: "select",
          id: "braces",
          label: "Braces",
          defaultValue: "collapse",
          options: [
            { value: "collapse", label: "Same line (K&R)" },
            { value: "expand", label: "New line (Allman)" },
          ],
        },
        {
          kind: "toggle",
          id: "chains",
          label: "Break method chains",
          hint: "One .map() / .filter() per line",
          defaultValue: false,
        },
      ]}
      run={(input, values) => {
        if (!input.trim()) return { output: "" };
        try {
          const output = beautifyCode("js", input, {
            tabs: values.indent === "tab",
            indent: Number(values.indent) || 2,
            braces: values.braces === "expand" ? "expand" : "collapse",
            breakChains: Boolean(values.chains),
          });
          return { output, note: `${output.split("\n").length} line(s)` };
        } catch (error) {
          return { error: error instanceof Error ? error.message : "Could not format that JavaScript." };
        }
      }}
    />
  );
}
