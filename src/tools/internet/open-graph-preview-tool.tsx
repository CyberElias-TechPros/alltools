"use client";

import { useState } from "react";
import { CopyButton, Field, TextArea, TextInput, ToolPanel } from "@/components/ui";

function hostOf(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return "example.com";
  }
}

export default function OpenGraphPreviewTool() {
  const [title, setTitle] = useState("Free online tools that run in your browser");
  const [description, setDescription] = useState(
    "Convert, calculate and check things without uploading a file. Nothing you paste leaves your device.",
  );
  const [url, setUrl] = useState("https://example.com/tools");
  const [siteName, setSiteName] = useState("Example Tools");
  const [image, setImage] = useState("https://images.unsplash.com/photo-1518770660439-4636190af475?w=1200&h=630&fit=crop");

  const host = hostOf(url);

  return (
    <ToolPanel>
      <div className="grid gap-5 lg:grid-cols-[22rem_1fr]">
        <div className="space-y-3">
          <Field label="Title" htmlFor="og-title" hint="Social cards truncate around 60–70 characters.">
            <TextInput id="og-title" value={title} onChange={(event) => setTitle(event.target.value)} />
          </Field>
          <Field label="Description" htmlFor="og-description">
            <TextArea
              id="og-description"
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              rows={3}
            />
          </Field>
          <Field label="Page URL" htmlFor="og-url">
            <TextInput
              id="og-url"
              value={url}
              onChange={(event) => setUrl(event.target.value)}
              className="font-mono text-[0.8rem]"
              spellCheck={false}
            />
          </Field>
          <Field label="Site name" htmlFor="og-site">
            <TextInput id="og-site" value={siteName} onChange={(event) => setSiteName(event.target.value)} />
          </Field>
          <Field label="Image URL" htmlFor="og-image" hint="Any https image works; 1200 × 630 is the safe ratio.">
            <TextInput
              id="og-image"
              value={image}
              onChange={(event) => setImage(event.target.value)}
              className="font-mono text-[0.72rem]"
              spellCheck={false}
            />
          </Field>
        </div>

        <div className="space-y-5">
          <div>
            <p className="label">Facebook / LinkedIn</p>
            <div className="border border-[var(--border)] bg-[var(--surface)]">
              <div className="aspect-[1.91/1] w-full overflow-hidden bg-[var(--surface-muted)]">
                {image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={image} alt="Social preview" className="size-full object-cover" />
                ) : (
                  <div className="grid size-full place-items-center font-mono text-[0.6rem] uppercase tracking-[0.12em] text-[var(--text-subtle)]">
                    No image
                  </div>
                )}
              </div>
              <div className="border-t border-[var(--border)] p-3">
                <p className="font-mono text-[0.6rem] uppercase tracking-[0.1em] text-[var(--text-subtle)]">
                  {host}
                </p>
                <p className="mt-1 line-clamp-2 text-sm font-semibold leading-snug text-[var(--text)]">
                  {title || "Your title appears here"}
                </p>
                <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-[var(--text-subtle)]">
                  {description || "Your description appears here."}
                </p>
              </div>
            </div>
          </div>

          <div>
            <p className="label">X / Twitter</p>
            <div className="border border-[var(--border)] bg-[var(--surface)] p-3">
              <div className="flex gap-3">
                <div className="size-10 shrink-0 border border-[var(--border)] bg-[var(--surface-muted)]" />
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-[var(--text)]">{title || "Your title"}</p>
                  <p className="mt-0.5 line-clamp-2 text-xs leading-relaxed text-[var(--text-subtle)]">
                    {description || "Your description."}
                  </p>
                  <p className="mt-1 font-mono text-[0.62rem] text-[var(--text-subtle)]">{host}</p>
                </div>
              </div>
            </div>
          </div>

          <div>
            <p className="label">Google search snippet</p>
            <div className="border border-[var(--border)] bg-[var(--surface)] p-3">
              <p className="font-mono text-[0.62rem] text-[var(--text-subtle)]">
                {url || "https://example.com"} › tools
              </p>
              <p className="mt-1 text-base leading-snug text-[var(--accent-text)]">{title || "Your title"}</p>
              <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-[var(--text-subtle)]">
                {description || "Your description."}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <CopyButton
              text={`<meta property="og:title" content="${title}" />\n<meta property="og:description" content="${description}" />\n<meta property="og:url" content="${url}" />\n<meta property="og:site_name" content="${siteName}" />\n<meta property="og:image" content="${image}" />`}
              label="Copy Open Graph tags"
            />
          </div>
        </div>
      </div>

      <p className="mt-5 text-xs leading-relaxed text-[var(--text-subtle)]">
        Previews are rendered locally from the values you type — nothing is fetched from Facebook, X or Google, and those
        platforms may crop or truncate differently on a live share. Use the Meta Tag Generator for the full set of tags
        including Twitter cards and canonicals.
      </p>
    </ToolPanel>
  );
}
