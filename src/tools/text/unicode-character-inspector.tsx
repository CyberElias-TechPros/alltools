"use client";

import { useMemo, useState } from "react";
import { CopyButton, SimpleTable, TextArea, ToolPanel } from "@/components/ui";
import { inspectCharacters } from "@/lib/text";

export default function UnicodeCharacterInspector() {
  const [text, setText] = useState("");
  const chars = useMemo(() => inspectCharacters(text), [text]);
  const copyText = chars
    .map((item) => `${item.char}\t${item.hex}\t${item.decimal}\t${item.utf8}\t${item.utf16}\t${item.kind}`)
    .join("\n");

  return (
    <ToolPanel>
      <div className="grid gap-4 lg:grid-cols-[1fr_1.3fr]">
        <div>
          <label htmlFor="uci-input" className="label">
            Text to inspect
          </label>
          <TextArea
            id="uci-input"
            value={text}
            onChange={(event) => setText(event.target.value)}
            placeholder="Paste the text whose characters you need to identify…"
            className="min-h-[18rem]"
            spellCheck={false}
          />
          <p className="mt-2 text-xs leading-relaxed text-[var(--text-subtle)]">
            {chars.length} character{chars.length === 1 ? "" : "s"} shown (first 200). Look for
            U+00A0 and U+200B when text refuses to behave.
          </p>
        </div>

        <div>
          <div className="mb-2 flex items-center justify-between">
            <span className="label !mb-0">Characters</span>
            <CopyButton text={copyText} size="sm" label="Copy table" />
          </div>
          {chars.length ? (
            <div className="max-h-[24rem] overflow-y-auto">
              <SimpleTable
                head={["Char", "Code point", "Decimal", "UTF-8", "UTF-16", "Kind"]}
                rows={chars.map((item) => [
                  <span key={item.codePoint} className="font-mono text-base">
                    {item.char === " " ? "␣" : item.char}
                  </span>,
                  <span key={`${item.codePoint}-h`} className="font-mono">{item.hex}</span>,
                  <span key={`${item.codePoint}-d`} className="font-mono">{item.decimal}</span>,
                  <span key={`${item.codePoint}-8`} className="font-mono text-[0.7rem]">{item.utf8}</span>,
                  <span key={`${item.codePoint}-16`} className="font-mono text-[0.7rem]">{item.utf16}</span>,
                  item.kind,
                ])}
                caption="Character code points"
              />
            </div>
          ) : (
            <p className="border border-dashed border-[var(--border-strong)] p-6 text-sm text-[var(--text-muted)]">
              Each character's code point, bytes and category will appear here.
            </p>
          )}
        </div>
      </div>
    </ToolPanel>
  );
}
