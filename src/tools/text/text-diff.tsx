"use client";

import { useMemo, useState } from "react";
import { ArrowLeftRight } from "lucide-react";
import { Button, CopyButton, Segmented, Switch, TextArea, ToolPanel } from "@/components/ui";
import { diffLines, diffWords } from "@/lib/diff";
import { cn } from "@/lib/utils";

export default function TextDiff() {
  const [left, setLeft] = useState("");
  const [right, setRight] = useState("");
  const [view, setView] = useState<"inline" | "words">("inline");
  const [ignoreWhitespace, setIgnoreWhitespace] = useState(false);

  const result = useMemo(
    () => diffLines(left, right, { ignoreWhitespace }),
    [left, right, ignoreWhitespace],
  );

  const renderedLines = useMemo(() => {
    if (view !== "words") return result.lines;
    const out = result.lines.map((line) => ({ ...line, words: undefined as undefined | { kind: string; value: string }[] }));
    let i = 0;
    while (i < out.length) {
      if (out[i].kind === "removed") {
        let removedEnd = i;
        while (removedEnd < out.length && out[removedEnd].kind === "removed") removedEnd++;
        let addedEnd = removedEnd;
        while (addedEnd < out.length && out[addedEnd].kind === "added") addedEnd++;
        const pairs = Math.min(removedEnd - i, addedEnd - removedEnd);
        for (let k = 0; k < pairs; k++) {
          const parts = diffWords(out[i + k].text, out[removedEnd + k].text);
          out[i + k].words = parts.filter((part) => part.kind !== "added");
          out[removedEnd + k].words = parts.filter((part) => part.kind !== "removed");
        }
        i = addedEnd;
      } else {
        i++;
      }
    }
    return out;
  }, [result.lines, view]);

  const summary = useMemo(() => {
    const changes = result.lines
      .map((line) => `${line.kind === "added" ? "+ " : line.kind === "removed" ? "- " : "  "}${line.text}`)
      .join("\n");
    return changes;
  }, [result.lines]);

  const hasChanges = result.added > 0 || result.removed > 0;

  return (
    <ToolPanel>
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <Segmented
          label="Comparison view"
          value={view}
          onChange={setView}
          options={[
            { value: "inline", label: "Line by line" },
            { value: "words", label: "Word level" },
          ]}
          className="min-w-64"
        />
        <Switch
          checked={ignoreWhitespace}
          onChange={setIgnoreWhitespace}
          label="Ignore whitespace"
        />
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label htmlFor="diff-left" className="label">
            Original text
          </label>
          <TextArea
            id="diff-left"
            value={left}
            onChange={(event) => setLeft(event.target.value)}
            placeholder="Paste the original version…"
            className="min-h-40 font-mono text-[0.82rem]"
            spellCheck={false}
          />
        </div>
        <div>
          <label htmlFor="diff-right" className="label">
            Revised text
          </label>
          <TextArea
            id="diff-right"
            value={right}
            onChange={(event) => setRight(event.target.value)}
            placeholder="Paste the revised version…"
            className="min-h-40 font-mono text-[0.82rem]"
            spellCheck={false}
          />
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-2">
        <div className=" flex items-center gap-2 text-xs" aria-live="polite">
          <span className="chip !border-emerald-300/60 !bg-emerald-50 !text-emerald-700 dark:!border-emerald-500/30 dark:!bg-emerald-500/10 dark:!text-emerald-300">
            +{result.added} added
          </span>
          <span className="chip !border-rose-300/60 !bg-rose-50 !text-rose-700 dark:!border-rose-500/30 dark:!bg-rose-500/10 dark:!text-rose-300">
            −{result.removed} removed
          </span>
          {left && right && !hasChanges ? (
            <span className="text-[var(--text-subtle)]">The two texts are identical.</span>
          ) : null}
        </div>
        <div className="flex gap-1.5">
          <CopyButton text={summary} label="Copy diff" />
          <Button size="sm" variant="ghost" onClick={() => { setLeft(""); setRight(""); }}>
            <ArrowLeftRight className="size-3.5" aria-hidden /> Swap & clear
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => {
              const previous = left;
              setLeft(right);
              setRight(previous);
            }}
          >
            Swap
          </Button>
        </div>
      </div>

      <div className="mt-3 overflow-hidden rounded-xl border border-[var(--border)]">
        <div className="grid grid-cols-[3rem_1fr] bg-[var(--surface-muted)] px-3 py-1.5 text-[0.68rem] font-semibold uppercase tracking-[0.08em] text-[var(--text-subtle)] sm:grid-cols-[3rem_3rem_1fr]">
          <span>Old</span>
          <span className="hidden sm:block">New</span>
          <span>Text</span>
        </div>
        <div className="max-h-96 overflow-auto bg-[var(--surface)] font-mono text-[0.8rem]">
          {result.lines.length === 0 || (!left && !right) ? (
            <p className="p-4 font-sans text-sm text-[var(--text-subtle)]">
              Paste text in both boxes to see the difference.
            </p>
          ) : (
            <ul>
              {renderedLines.map((line, index) => {
                const words = line.words;
                return (
                  <li
                    key={`${index}-${line.text.slice(0, 12)}`}
                    className={cn(
                      "grid grid-cols-[3rem_1fr] items-start gap-2 px-3 py-1 sm:grid-cols-[3rem_3rem_1fr]",
                      line.kind === "added" && "bg-emerald-50 dark:bg-emerald-500/10",
                      line.kind === "removed" && "bg-rose-50 dark:bg-rose-500/10",
                    )}
                  >
                    <span className="select-none text-right text-[0.7rem] text-[var(--text-subtle)]">
                      {line.leftNumber ?? ""}
                    </span>
                    <span className="hidden select-none text-right text-[0.7rem] text-[var(--text-subtle)] sm:block">
                      {line.rightNumber ?? ""}
                    </span>
                    <span className="whitespace-pre-wrap break-words">
                      <span
                        aria-hidden
                        className={cn(
                          "mr-1 inline-block w-3",
                          line.kind === "added" && "text-emerald-700 dark:text-emerald-400",
                          line.kind === "removed" && "text-rose-700 dark:text-rose-400",
                        )}
                      >
                        {line.kind === "added" ? "+" : line.kind === "removed" ? "−" : ""}
                      </span>
                      {words
                        ? words.map((part, partIndex) => (
                            <span
                              key={partIndex}
                              className={cn(
                                line.kind === "added" && part.kind === "added" && "rounded bg-emerald-200/70 dark:bg-emerald-500/30",
                                line.kind === "removed" && part.kind === "removed" && "rounded bg-rose-200/70 dark:bg-rose-500/30",
                              )}
                            >
                              {part.value}
                            </span>
                          ))
                        : line.text || " "}
                    </span>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>
    </ToolPanel>
  );
}
