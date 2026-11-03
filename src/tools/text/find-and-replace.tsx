"use client";

import { useMemo, useState } from "react";
import { RotateCcw } from "lucide-react";
import {
  Button,
  Callout,
  CopyButton,
  DownloadButton,
  Field,
  Switch,
  TextArea,
  TextInput,
  ToolPanel,
} from "@/components/ui";
import { escapeRegExp } from "@/lib/regex";

export default function FindAndReplace() {
  const [text, setText] = useState("");
  const [find, setFind] = useState("");
  const [replace, setReplace] = useState("");
  const [useRegex, setUseRegex] = useState(false);
  const [caseSensitive, setCaseSensitive] = useState(false);
  const [wholeWord, setWholeWord] = useState(false);
  const [multiline, setMultiline] = useState(true);

  const { output, count, error } = useMemo(() => {
    if (!find) return { output: text, count: 0, error: "" };
    try {
      const flags = `${caseSensitive ? "" : "i"}g${multiline ? "m" : ""}${useRegex ? "" : ""}`;
      let pattern = useRegex ? find : escapeRegExp(find);
      if (wholeWord) pattern = `\\b(?:${pattern})\\b`;
      const regex = new RegExp(pattern, flags);
      const matches = text.match(regex);
      return {
        output: text.replace(regex, replace),
        count: matches ? matches.length : 0,
        error: "",
      };
    } catch (caught) {
      return {
        output: text,
        count: 0,
        error: caught instanceof Error ? caught.message : "Invalid regular expression",
      };
    }
  }, [text, find, replace, useRegex, caseSensitive, wholeWord, multiline]);

  return (
    <ToolPanel>
      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="Find" htmlFor="fr-find">
          <TextInput
            id="fr-find"
            value={find}
            onChange={(event) => setFind(event.target.value)}
            placeholder={useRegex ? "e\\.g\\. ^(\\w+)\\s+(\\w+)$" : "colour"}
            className="font-mono"
            spellCheck={false}
          />
        </Field>
        <Field label="Replace with" htmlFor="fr-replace" hint={useRegex ? "Use $1, $2 for capture groups" : undefined}>
          <TextInput
            id="fr-replace"
            value={replace}
            onChange={(event) => setReplace(event.target.value)}
            placeholder={useRegex ? "$2, $1" : "color"}
            className="font-mono"
            spellCheck={false}
          />
        </Field>
      </div>

      <div className="mt-3 grid gap-x-6 gap-y-1 rounded-xl border border-[var(--border)] bg-[var(--surface-muted)] p-3 sm:grid-cols-2 lg:grid-cols-4">
        <Switch checked={useRegex} onChange={setUseRegex} label="Regex" description="Pattern matching" />
        <Switch checked={caseSensitive} onChange={setCaseSensitive} label="Match case" />
        <Switch checked={wholeWord} onChange={setWholeWord} label="Whole word" description="cat ≠ category" />
        <Switch checked={multiline} onChange={setMultiline} label="Multiline" description="^ and $ per line" />
      </div>

      {error ? (
        <div className="mt-3">
          <Callout tone="warning" title="That pattern is not valid">
            {error}
          </Callout>
        </div>
      ) : null}

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <div>
          <div className="mb-2 flex items-center justify-between">
            <label htmlFor="fr-text" className="label !mb-0">
              Source text
            </label>
            <Button size="sm" variant="ghost" onClick={() => setText("")}>
              <RotateCcw className="size-3.5" aria-hidden /> Clear
            </Button>
          </div>
          <TextArea
            id="fr-text"
            value={text}
            onChange={(event) => setText(event.target.value)}
            placeholder="Paste the text to transform…"
            className="min-h-56 font-mono text-[0.85rem]"
            spellCheck={false}
          />
        </div>
        <div>
          <div className="mb-2 flex items-center justify-between">
            <span className="label !mb-0">Result</span>
            <div className="flex gap-1.5">
              <CopyButton text={output} />
              <DownloadButton filename="replaced.txt" content={output} />
            </div>
          </div>
          <div className="min-h-56 overflow-auto whitespace-pre-wrap break-words rounded-xl border border-[var(--border)] bg-[var(--surface-muted)] p-3 font-mono text-[0.85rem] text-[var(--text)]">
            {output || (
              <span className="font-sans text-[var(--text-subtle)]">
                Your replaced text will appear here.
              </span>
            )}
          </div>
          <p aria-live="polite" className="mt-1.5 text-xs text-[var(--text-subtle)]">
            {count.toLocaleString()} match{count === 1 ? "" : "es"} replaced
          </p>
        </div>
      </div>
    </ToolPanel>
  );
}
