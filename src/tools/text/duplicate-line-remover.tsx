"use client";

import { useMemo, useState } from "react";
import { ArrowRight, RotateCcw } from "lucide-react";
import {
  Button,
  CopyButton,
  DownloadButton,
  Segmented,
  Switch,
  TextArea,
  ToolPanel,
} from "@/components/ui";
import { dedupeLines } from "@/lib/text";

export default function DuplicateLineRemover() {
  const [input, setInput] = useState("");
  const [ignoreCase, setIgnoreCase] = useState(false);
  const [trim, setTrim] = useState(true);
  const [dropEmpty, setDropEmpty] = useState(false);
  const [keep, setKeep] = useState<"first" | "last">("first");

  const result = useMemo(
    () => dedupeLines(input, { ignoreCase, trim, dropEmpty, keep }),
    [input, ignoreCase, trim, dropEmpty, keep],
  );

  const inputLines = input.trim() === "" ? 0 : input.replace(/\r\n/g, "\n").split("\n").length;

  return (
    <ToolPanel>
      <div className="grid gap-4 lg:grid-cols-2">
        <div>
          <div className="mb-2 flex items-center justify-between">
            <label htmlFor="dl-input" className="label !mb-0">
              Original list
            </label>
            <Button size="sm" variant="ghost" onClick={() => setInput("")}>
              <RotateCcw className="size-3.5" aria-hidden /> Clear
            </Button>
          </div>
          <TextArea
            id="dl-input"
            value={input}
            onChange={(event) => setInput(event.target.value)}
            placeholder={"apple\nbanana\napple\ncherry\nBanana"}
            className="min-h-64 font-mono text-[0.85rem]"
            spellCheck={false}
          />
          <p className="mt-1.5 text-xs text-[var(--text-subtle)]">
            {inputLines.toLocaleString()} lines in
          </p>
        </div>

        <div>
          <div className="mb-2 flex items-center justify-between">
            <span className="label !mb-0 flex items-center gap-1.5">
              <ArrowRight className="size-3.5" aria-hidden /> Unique lines
            </span>
            <div className="flex gap-1.5">
              <CopyButton text={result.output} />
              <DownloadButton filename="unique-lines.txt" content={result.output} />
            </div>
          </div>
          <div className="min-h-64 overflow-auto whitespace-pre-wrap break-words rounded-xl border border-[var(--border)] bg-[var(--surface-muted)] p-3 font-mono text-[0.85rem] text-[var(--text)]">
            {result.output || (
              <span className="font-sans text-[var(--text-subtle)]">
                Your de-duplicated list will appear here.
              </span>
            )}
          </div>
          <p aria-live="polite" className="mt-1.5 text-xs text-[var(--text-subtle)]">
            {result.kept.toLocaleString()} kept · {result.removed.toLocaleString()} duplicate
            {result.removed === 1 ? "" : "s"} removed
          </p>
        </div>
      </div>

      <div className="mt-4 grid gap-x-6 gap-y-1 rounded-xl border border-[var(--border)] bg-[var(--surface-muted)] p-3 sm:grid-cols-2">
        <Switch checked={trim} onChange={setTrim} label="Trim whitespace" description="Ignore leading and trailing spaces when comparing" />
        <Switch checked={ignoreCase} onChange={setIgnoreCase} label="Ignore case" description="Treat Apple and apple as the same line" />
        <Switch checked={dropEmpty} onChange={setDropEmpty} label="Remove empty lines" description="Delete blank rows from the output" />
        <div className="pt-1.5">
          <span className="label">Keep</span>
          <Segmented
            label="Which occurrence to keep"
            value={keep}
            onChange={setKeep}
            options={[
              { value: "first", label: "First" },
              { value: "last", label: "Last" },
            ]}
          />
        </div>
      </div>
    </ToolPanel>
  );
}
