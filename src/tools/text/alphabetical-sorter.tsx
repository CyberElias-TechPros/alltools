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
import { sortLines, type SortMode } from "@/lib/text";

export default function AlphabeticalSorter() {
  const [input, setInput] = useState("");
  const [mode, setMode] = useState<SortMode>("az");
  const [caseSensitive, setCaseSensitive] = useState(false);
  const [numeric, setNumeric] = useState(true);
  const [unique, setUnique] = useState(false);

  const result = useMemo(
    () => sortLines(input, mode, { caseSensitive, numeric, unique }),
    [input, mode, caseSensitive, numeric, unique],
  );

  return (
    <ToolPanel>
      <div className="mb-3 flex flex-wrap items-center gap-3">
        <Segmented
          label="Sort order"
          value={mode}
          onChange={setMode}
          className="min-w-64 flex-1"
          options={[
            { value: "az", label: "A → Z" },
            { value: "za", label: "Z → A" },
            { value: "length-asc", label: "Shortest" },
            { value: "length-desc", label: "Longest" },
          ]}
        />
        <span className="chip">{result.count.toLocaleString()} lines</span>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div>
          <div className="mb-2 flex items-center justify-between">
            <label htmlFor="as-input" className="label !mb-0">
              Unsorted list
            </label>
            <Button size="sm" variant="ghost" onClick={() => setInput("")}>
              <RotateCcw className="size-3.5" aria-hidden /> Clear
            </Button>
          </div>
          <TextArea
            id="as-input"
            value={input}
            onChange={(event) => setInput(event.target.value)}
            placeholder={"Chapter 10\nChapter 2\nChapter 1"}
            className="min-h-64 font-mono text-[0.85rem]"
            spellCheck={false}
          />
        </div>
        <div>
          <div className="mb-2 flex items-center justify-between">
            <span className="label !mb-0 flex items-center gap-1.5">
              <ArrowRight className="size-3.5" aria-hidden /> Sorted
            </span>
            <div className="flex gap-1.5">
              <CopyButton text={result.output} />
              <DownloadButton filename="sorted-list.txt" content={result.output} />
            </div>
          </div>
          <div className="min-h-64 overflow-auto whitespace-pre-wrap break-words rounded-xl border border-[var(--border)] bg-[var(--surface-muted)] p-3 font-mono text-[0.85rem] text-[var(--text)]">
            {result.output || (
              <span className="font-sans text-[var(--text-subtle)]">
                Sorted lines appear here.
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="mt-4 grid gap-x-6 gap-y-1 rounded-xl border border-[var(--border)] bg-[var(--surface-muted)] p-3 sm:grid-cols-3">
        <Switch checked={numeric} onChange={setNumeric} label="Numeric aware" description="Item 2 before Item 10" />
        <Switch checked={caseSensitive} onChange={setCaseSensitive} label="Case sensitive" description="Uppercase sorts before lowercase" />
        <Switch checked={unique} onChange={setUnique} label="Remove duplicates" description="Keep only the first occurrence" />
      </div>
    </ToolPanel>
  );
}
