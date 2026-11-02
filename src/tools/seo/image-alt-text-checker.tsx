"use client";

import { useMemo, useState } from "react";
import { EmptyState, ResultCard, SimpleTable, StatGrid, TextArea, ToolPanel } from "@/components/ui";
import { analyseImageAlts } from "@/lib/seo-tools";

const SAMPLE = `<img src="/hero.jpg" alt="A person typing on a laptop" />
<img src="/icon.svg" alt="" />
<img src="/chart.png" />
<img src="/photo.jpg" alt="A very long description that keeps going well past the point where a screen reader user has already understood what the image shows, which is not helpful." />`;

export default function ImageAltTextChecker() {
  const [html, setHtml] = useState("");
  const report = useMemo(() => analyseImageAlts(html), [html]);

  return (
    <ToolPanel>
      <div className="mb-2 flex items-center justify-between">
        <label htmlFor="alt-input" className="label !mb-0">
          HTML containing images
        </label>
        <button
          type="button"
          className="btn btn-ghost !min-h-8 !px-2.5 !py-1.5 !text-[0.6rem] !tracking-[0.1em]"
          onClick={() => setHtml(SAMPLE)}
        >
          Sample
        </button>
      </div>
      <TextArea
        id="alt-input"
        value={html}
        onChange={(event) => setHtml(event.target.value)}
        rows={10}
        spellCheck={false}
        className="font-mono text-[0.78rem]"
        placeholder='<img src="hero.jpg" alt="Description" />'
      />

      <div className="mt-5">
        {!html.trim() ? (
          <EmptyState title="No images yet">Paste markup to check every image for a useful alt attribute.</EmptyState>
        ) : (
          <ResultCard
            label="Images"
            value={`${report.total} found`}
            tone={report.missing.length ? "neutral" : "brand"}
            sub={`${report.missing.length} missing alt · ${report.decorative} decorative · ${report.lazy} lazy-loaded`}
          >
            <StatGrid
              columns={4}
              items={[
                { label: "Total images", value: String(report.total) },
                { label: "Missing alt", value: String(report.missing.length) },
                { label: "Decorative (alt=\"\")", value: String(report.decorative) },
                { label: "Over 125 chars", value: String(report.long.length) },
              ]}
            />

            <div className="mt-4">
              {report.missing.length === 0 && report.long.length === 0 ? (
                <p className="text-sm text-[var(--text-subtle)]">
                  Every image has an alt attribute and none are excessively long.
                </p>
              ) : (
                <SimpleTable
                  head={["Finding", "Image"]}
                  caption="Alt text findings"
                  rows={[
                    ...report.missing.map((image) => ["Missing alt", image.src || "(no src)"]),
                    ...report.long.map((image) => [`${image.length} characters`, image.src || "(no src)"]),
                  ]}
                />
              )}
            </div>
          </ResultCard>
        )}
      </div>

      <p className="mt-5 text-xs leading-relaxed text-[var(--text-subtle)]">
        An empty alt (<span className="font-mono">alt=&quot;&quot;</span>) is correct for decorative images: it tells a screen
        reader to skip them. A missing alt is different — the reader may announce the file name instead. Alt text should
        describe the image&apos;s purpose in context, not its contents in exhaustive detail.
      </p>
    </ToolPanel>
  );
}
