"use client";

import { useCallback, useEffect, useState } from "react";
import { Button, CopyButton, DownloadButton, Field, StatGrid, TextArea, ToolPanel, TextInput } from "@/components/ui";
import { randomText } from "@/lib/text";
import { countText } from "@/lib/text";

export default function RandomTextGenerator() {
  const [paragraphs, setParagraphs] = useState("3");
  const [sentences, setSentences] = useState("4");
  const [seed, setSeed] = useState(1);
  const [output, setOutput] = useState("");

  const generate = useCallback(
    (nextSeed: number) => {
      const text = randomText({
        paragraphs: Number(paragraphs) || 1,
        sentencesPerParagraph: Number(sentences) || 1,
        seed: nextSeed,
      });
      setOutput(text);
      setSeed(nextSeed);
    },
    [paragraphs, sentences],
  );

  useEffect(() => {
    setOutput(
      randomText({
        paragraphs: Number(paragraphs) || 1,
        sentencesPerParagraph: Number(sentences) || 1,
        seed: 1,
      }),
    );
    setSeed(1);
  }, [paragraphs, sentences]);

  const stats = countText(output);

  return (
    <ToolPanel>
      <div className="grid gap-4 lg:grid-cols-[1fr_1.2fr]">
        <div className="flex flex-col gap-3">
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Paragraphs" htmlFor="rtg-paragraphs">
              <TextInput
                id="rtg-paragraphs"
                type="number"
                min={1}
                max={20}
                value={paragraphs}
                onChange={(event) => setParagraphs(event.target.value)}
                inputMode="numeric"
              />
            </Field>
            <Field label="Sentences each" htmlFor="rtg-sentences">
              <TextInput
                id="rtg-sentences"
                type="number"
                min={1}
                max={12}
                value={sentences}
                onChange={(event) => setSentences(event.target.value)}
                inputMode="numeric"
              />
            </Field>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button variant="primary" onClick={() => generate(seed + 1)}>
              Generate new
            </Button>
            <CopyButton text={output} label="Copy" />
            <DownloadButton filename="filler.txt" content={output} label="Download" />
          </div>

          <StatGrid
            items={[
              { label: "Words", value: stats.words.toLocaleString() },
              { label: "Characters", value: stats.characters.toLocaleString() },
              { label: "Paragraphs", value: stats.paragraphs.toString() },
              { label: "Seed", value: String(seed) },
            ]}
          />
          <p className="text-xs leading-relaxed text-[var(--text-muted)]">
            Filler only — never publish it. The seed makes a run repeatable: press Generate for a new
            sample, and the same seed reproduces the same text.
          </p>
        </div>

        <div>
          <div className="mb-2 flex items-center justify-between">
            <span className="label !mb-0">Generated text</span>
          </div>
          <TextArea
            readOnly
            value={output}
            aria-label="Generated filler text"
            className="min-h-[20rem]"
            spellCheck={false}
          />
        </div>
      </div>
    </ToolPanel>
  );
}
