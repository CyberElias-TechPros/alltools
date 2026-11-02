"use client";

import { useMemo, useRef, useState } from "react";
import { Upload } from "lucide-react";
import {
  Button,
  Callout,
  CopyButton,
  DownloadButton,
  Segmented,
  Switch,
  TextArea,
  ToolPanel,
} from "@/components/ui";
import { bytesToBase64, decodeBase64, encodeBase64 } from "@/lib/dev";

export default function Base64EncoderDecoder() {
  const [mode, setMode] = useState<"encode" | "decode">("encode");
  const [input, setInput] = useState("");
  const [urlSafe, setUrlSafe] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const { output, error } = useMemo(() => {
    if (!input) return { output: "", error: "" };
    try {
      return {
        output: mode === "encode" ? encodeBase64(input, urlSafe) : decodeBase64(input),
        error: "",
      };
    } catch {
      return {
        output: "",
        error: "That input is not valid Base64. Check for missing padding or stray characters.",
      };
    }
  }, [input, mode, urlSafe]);

  async function handleFile(file: File) {
    if (file.size > 20 * 1024 * 1024) {
      setFileName(`${file.name} is larger than 20 MB`);
      return;
    }
    const buffer = new Uint8Array(await file.arrayBuffer());
    setInput(bytesToBase64(buffer));
    setFileName(`${file.name} · ${(file.size / 1024).toFixed(1)} KB`);
    setMode("encode");
  }

  return (
    <ToolPanel>
      <div className="mb-3 flex flex-wrap items-center gap-3">
        <Segmented
          label="Direction"
          value={mode}
          onChange={setMode}
          options={[
            { value: "encode", label: "Encode → Base64" },
            { value: "decode", label: "Decode → text" },
          ]}
          className="min-w-64"
        />
        {mode === "encode" ? <Switch checked={urlSafe} onChange={setUrlSafe} label="URL-safe" /> : null}
        <input
          ref={fileRef}
          type="file"
          className="hidden"
          onChange={(event) => {
            const file = event.target.files?.[0];
            if (file) void handleFile(file);
          }}
        />
        <Button
          size="sm"
          variant="secondary"
          className="ml-auto"
          onClick={() => fileRef.current?.click()}
        >
          <Upload className="size-3.5" aria-hidden /> Encode a file
        </Button>
      </div>

      {fileName ? <p className="mb-2 text-xs text-[var(--text-subtle)]">{fileName}</p> : null}

      <div className="grid gap-4 lg:grid-cols-2">
        <div>
          <label htmlFor="b64-input" className="label">
            {mode === "encode" ? "Text to encode" : "Base64 to decode"}
          </label>
          <TextArea
            id="b64-input"
            value={input}
            onChange={(event) => setInput(event.target.value)}
            placeholder={mode === "encode" ? "Hello, world! 👋" : "SGVsbG8sIHdvcmxkIQ=="}
            className="min-h-56 font-mono text-[0.82rem]"
            spellCheck={false}
          />
        </div>
        <div>
          <div className="mb-2 flex items-center justify-between">
            <span className="label !mb-0">Result</span>
            <div className="flex gap-1.5">
              <CopyButton text={output} />
              <DownloadButton filename={mode === "encode" ? "encoded.txt" : "decoded.txt"} content={output} />
            </div>
          </div>
          <div
            aria-live="polite"
            className="min-h-56 overflow-auto whitespace-pre-wrap break-all rounded-xl border border-[var(--border)] bg-[var(--code-bg)] p-3 font-mono text-[0.82rem] text-[var(--text)]"
          >
            {output || <span className="text-[var(--text-subtle)]">Output appears here.</span>}
          </div>
        </div>
      </div>

      {error ? (
        <div className="mt-3">
          <Callout tone="warning">{error}</Callout>
        </div>
      ) : null}

      <p className="mt-3 text-xs text-[var(--text-subtle)]">
        Base64 is an encoding, not encryption — anyone can decode it. UTF-8 text and emoji are
        handled correctly.
      </p>
    </ToolPanel>
  );
}
