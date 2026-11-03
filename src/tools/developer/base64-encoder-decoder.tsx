"use client";

import { useMemo, useRef, useState } from "react";
import { Upload } from "lucide-react";
import { Button, CopyButton, DownloadButton, Switch, TextArea, ToolPanel } from "@/components/ui";
import { ModeCard, ModeHub } from "@/components/tools/mode-hub";
import { bytesToBase64, decodeBase64, encodeBase64 } from "@/lib/dev";

function OutputPane({
  text,
  placeholder,
  error,
}: {
  text: string;
  placeholder: string;
  error?: string;
}) {
  return (
    <div
      aria-live="polite"
      className="min-h-32 max-h-72 overflow-auto whitespace-pre-wrap break-all rounded-xl border border-[var(--border)] bg-[var(--code-bg)] p-3 font-mono text-[0.78rem] text-[var(--text)]"
    >
      {error ? (
        <span className="text-rose-700 dark:text-rose-300">{error}</span>
      ) : text ? (
        text
      ) : (
        <span className="text-[var(--text-subtle)]">{placeholder}</span>
      )}
    </div>
  );
}

export default function Base64EncoderDecoder() {
  const [plain, setPlain] = useState("");
  const [encoded, setEncoded] = useState("");
  const [urlSafe, setUrlSafe] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const encodeResult = useMemo(() => {
    if (!plain) return { output: "", error: "" };
    try {
      return { output: encodeBase64(plain, urlSafe), error: "" };
    } catch {
      return { output: "", error: "That text could not be encoded." };
    }
  }, [plain, urlSafe]);

  const decodeResult = useMemo(() => {
    if (!encoded) return { output: "", error: "" };
    try {
      return { output: decodeBase64(encoded), error: "" };
    } catch {
      return {
        output: "",
        error: "That input is not valid Base64. Check for missing padding or stray characters.",
      };
    }
  }, [encoded]);

  async function handleFile(file: File) {
    if (file.size > 20 * 1024 * 1024) {
      setFileName(`${file.name} is larger than 20 MB`);
      return;
    }
    const buffer = new Uint8Array(await file.arrayBuffer());
    setPlain(bytesToBase64(buffer));
    setFileName(`${file.name} · ${(file.size / 1024).toFixed(1)} KB`);
  }

  return (
    <ToolPanel>
      <div className="mb-3 flex flex-wrap items-center gap-3">
        <input
          ref={fileRef}
          type="file"
          className="hidden"
          onChange={(event) => {
            const file = event.target.files?.[0];
            if (file) void handleFile(file);
          }}
        />
        <Button size="sm" variant="secondary" onClick={() => fileRef.current?.click()}>
          <Upload className="size-3.5" aria-hidden /> Encode a file
        </Button>
        <span className="text-xs text-[var(--text-subtle)]">
          Files up to 20 MB are read in your browser — nothing is uploaded.
        </span>
      </div>

      {fileName ? <p className="mb-2 text-xs text-[var(--text-subtle)]">{fileName}</p> : null}

      <ModeHub columns={2}>
        <ModeCard title="Text → Base64" hint="UTF-8 text, emoji included." badge="Encode">
          <div className="mb-2 flex items-center justify-between gap-2">
            <Switch checked={urlSafe} onChange={setUrlSafe} label="URL-safe" />
            <div className="flex gap-1.5">
              <CopyButton text={encodeResult.output} />
              <DownloadButton filename="encoded.txt" content={encodeResult.output} />
            </div>
          </div>
          <TextArea
            id="b64-plain"
            value={plain}
            onChange={(event) => setPlain(event.target.value)}
            placeholder="Hello, world! 👋"
            className="min-h-28 font-mono text-[0.82rem]"
            spellCheck={false}
            aria-label="Text to encode"
          />
          <div className="mt-2">
            <OutputPane
              text={encodeResult.output}
              error={encodeResult.error || undefined}
              placeholder="Base64 output appears here."
            />
          </div>
        </ModeCard>

        <ModeCard title="Base64 → text" hint="Paste an encoded string to read it back." badge="Decode">
          <div className="mb-2 flex items-center justify-end gap-1.5">
            <CopyButton text={decodeResult.output} />
            <DownloadButton filename="decoded.txt" content={decodeResult.output} />
          </div>
          <TextArea
            id="b64-encoded"
            value={encoded}
            onChange={(event) => setEncoded(event.target.value)}
            placeholder="SGVsbG8sIHdvcmxkIQ=="
            className="min-h-28 font-mono text-[0.82rem]"
            spellCheck={false}
            aria-label="Base64 to decode"
          />
          <div className="mt-2">
            <OutputPane
              text={decodeResult.output}
              error={decodeResult.error || undefined}
              placeholder="Decoded text appears here."
            />
          </div>
        </ModeCard>
      </ModeHub>

      <p className="mt-3 text-xs text-[var(--text-subtle)]">
        Base64 is an encoding, not encryption — anyone can decode it. Both directions run at the
        same time, so you can convert one way and straight back without switching modes.
      </p>
    </ToolPanel>
  );
}
