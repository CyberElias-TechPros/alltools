"use client";

import { useMemo, useState } from "react";
import { CopyButton, Switch, TextArea, ToolPanel } from "@/components/ui";
import { ModeCard, ModeHub } from "@/components/tools/mode-hub";
import { decodeHtmlEntities, encodeHtmlEntities } from "@/lib/dev";

const SAMPLE = '<div class="card">Tom & Jerry\'s "café"</div>';

function ResultPane({ text }: { text: string }) {
  return (
    <div
      aria-live="polite"
      className="min-h-32 max-h-72 overflow-auto whitespace-pre-wrap break-all rounded-xl border border-[var(--border)] bg-[var(--code-bg)] p-3 font-mono text-[0.82rem] text-[var(--text)]"
    >
      {text || <span className="text-[var(--text-subtle)]">Result appears here.</span>}
    </div>
  );
}

export default function HtmlEntityEncoder() {
  const [plain, setPlain] = useState("");
  const [encoded, setEncoded] = useState("");
  const [nonAscii, setNonAscii] = useState(false);

  const encodeOutput = useMemo(
    () => (plain ? encodeHtmlEntities(plain, nonAscii) : ""),
    [plain, nonAscii],
  );
  const decodeOutput = useMemo(() => (encoded ? decodeHtmlEntities(encoded) : ""), [encoded]);

  return (
    <ToolPanel>
      <ModeHub columns={2}>
        <ModeCard title="Text → entities" hint="Escape &, <, >, quotes and (optionally) accents." badge="Encode">
          <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
            <Switch checked={nonAscii} onChange={setNonAscii} label="Numeric entities" description="é becomes &#233;" />
            <CopyButton text={encodeOutput} />
          </div>
          <TextArea
            id="he-plain"
            value={plain}
            onChange={(event) => setPlain(event.target.value)}
            placeholder={SAMPLE}
            className="min-h-28 font-mono text-[0.85rem]"
            spellCheck={false}
            aria-label="Text to encode"
          />
          <div className="mt-2">
            <ResultPane text={encodeOutput} />
          </div>
        </ModeCard>

        <ModeCard title="Entities → text" hint="Read &amp;, &#39; and numeric escapes back as characters." badge="Decode">
          <div className="mb-2 flex items-center justify-end">
            <CopyButton text={decodeOutput} />
          </div>
          <TextArea
            id="he-encoded"
            value={encoded}
            onChange={(event) => setEncoded(event.target.value)}
            placeholder="Tom &amp; Jerry&#39;s &quot;café&quot;"
            className="min-h-28 font-mono text-[0.85rem]"
            spellCheck={false}
            aria-label="Entities to decode"
          />
          <div className="mt-2">
            <ResultPane text={decodeOutput} />
          </div>
        </ModeCard>
      </ModeHub>

      <p className="mt-3 text-xs text-[var(--text-subtle)]">
        Escaping is not sanitisation. Keep using a proper HTML sanitiser or an auto-escaping
        template engine for untrusted content.
      </p>
    </ToolPanel>
  );
}
