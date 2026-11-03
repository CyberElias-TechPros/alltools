"use client";

import { TransformTool } from "@/components/tools/transform-tool";
import { removeLineBreaks, type LineBreakMode } from "@/lib/text";

const MODES = [
  { value: "paragraph", label: "Keep paragraph breaks" },
  { value: "space", label: "Join everything with spaces" },
  { value: "single", label: "Join with spaces (keep single breaks)" },
  { value: "nothing", label: "Remove all line breaks" },
];

export default function LineBreakRemover() {
  return (
    <TransformTool
      id="line-break-remover"
      inputLabel="Wrapped text"
      outputLabel="Unwrapped text"
      placeholder="Paste text with hard line breaks…"
      sample={"This paragraph was\nwrapped at seventy\ncharacters by an email\nclient.\n\nThis second block\nshould stay separate."}
      rows={14}
      downloadName="unwrapped.txt"
      options={[
        { kind: "select", id: "mode", label: "Mode", defaultValue: "paragraph", options: MODES },
      ]}
      run={(input, values) => {
        if (!input.trim()) return { output: "" };
        const mode = (values.mode as LineBreakMode) ?? "paragraph";
        const output = removeLineBreaks(input, mode);
        return { output, note: `${output.split("\n").length} line(s) in the result` };
      }}
    />
  );
}
