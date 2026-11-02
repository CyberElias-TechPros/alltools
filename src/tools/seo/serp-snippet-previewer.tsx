"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Callout, Field, TextArea, TextInput, ToolPanel } from "@/components/ui";
import { cn } from "@/lib/utils";

const TITLE_LIMIT = 580;
const DESCRIPTION_LIMIT = 990;

function measure(text: string, font: string): number {
  if (typeof document === "undefined") return 0;
  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d");
  if (!context) return 0;
  context.font = font;
  return context.measureText(text).width;
}

function truncateToWidth(text: string, font: string, limit: number): string {
  if (measure(text, font) <= limit) return text;
  let low = 0;
  let high = text.length;
  while (low < high) {
    const mid = Math.ceil((low + high) / 2);
    if (measure(text.slice(0, mid) + "…", font) <= limit) low = mid;
    else high = mid - 1;
  }
  return text.slice(0, low).trimEnd() + "…";
}

export default function SerpPreview() {
  const [title, setTitle] = useState("Percentage Calculator — Percentages, Increases & Decreases");
  const [description, setDescription] = useState(
    "Calculate percentages instantly: X% of Y, what percent X is of Y, and percentage increase or decrease. Formulas and worked examples included.",
  );
  const [url, setUrl] = useState("https://toolora.example.com/tools/percentage-calculator/");
  const [mounted, setMounted] = useState(false);
  const measureRef = useRef<HTMLSpanElement>(null);

  useEffect(() => setMounted(true), []);

  const measurements = useMemo(() => {
    if (!mounted) return { title: 0, description: 0 };
    return {
      title: measure(title, "600 20px Arial, sans-serif"),
      description: measure(description, "400 14px Arial, sans-serif"),
    };
  }, [title, description, mounted]);

  const desktopTitle = mounted ? truncateToWidth(title, "600 20px Arial, sans-serif", TITLE_LIMIT) : title;
  const desktopDescription = mounted
    ? truncateToWidth(description, "400 14px Arial, sans-serif", DESCRIPTION_LIMIT)
    : description;
  const mobileTitle = mounted ? truncateToWidth(title, "600 20px Arial, sans-serif", 420) : title;
  const mobileDescription = mounted ? truncateToWidth(description, "400 14px Arial, sans-serif", 660) : description;

  let displayUrl = url;
  try {
    const parsed = new URL(url);
    displayUrl = `${parsed.hostname}${parsed.pathname}`.replace(/\/$/, "");
  } catch {
    /* keep raw input */
  }

  const titleStatus =
    measurements.title === 0
      ? "empty"
      : measurements.title > TITLE_LIMIT
        ? "long"
        : measurements.title < 200
          ? "short"
          : "good";
  const descriptionStatus =
    measurements.description === 0
      ? "empty"
      : measurements.description > DESCRIPTION_LIMIT
        ? "long"
        : measurements.description < 400
          ? "short"
          : "good";

  return (
    <ToolPanel>
      <div className="grid gap-3">
        <Field
          label="Page title"
          htmlFor="serp-title"
          hint={`${Math.round(measurements.title)}px of ~${TITLE_LIMIT}px · ${title.length} characters`}
        >
          <TextInput
            id="serp-title"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            className={cn(titleStatus === "long" && "!border-amber-500")}
          />
        </Field>
        <Field
          label="Meta description"
          htmlFor="serp-description"
          hint={`${Math.round(measurements.description)}px of ~${DESCRIPTION_LIMIT}px · ${description.length} characters`}
        >
          <TextArea
            id="serp-description"
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            className={cn("min-h-24", descriptionStatus === "long" && "!border-amber-500")}
          />
        </Field>
        <Field label="Page URL" htmlFor="serp-url">
          <TextInput
            id="serp-url"
            value={url}
            onChange={(event) => setUrl(event.target.value)}
            className="font-mono text-[0.85rem]"
            spellCheck={false}
          />
        </Field>
      </div>

      <div className="mt-5 grid gap-4 lg:grid-cols-2">
        <div>
          <p className="mb-2 text-[0.7rem] font-bold uppercase tracking-[0.08em] text-[var(--text-subtle)]">
            Desktop preview
          </p>
          <div className="rounded-xl border border-[var(--border)] bg-white p-4 dark:bg-[#202124]">
            <div className="flex items-center gap-2">
              <span className="flex size-6 items-center justify-center rounded-full bg-[#e8f0fe] text-[0.65rem] font-bold text-[#1a73e8]">
                T
              </span>
              <div className="min-w-0 leading-tight">
                <p className="truncate text-[0.75rem] text-[#202124] dark:text-[#e8eaed]">
                  Toolora
                </p>
                <p className="truncate text-[0.7rem] text-[#4d5156] dark:text-[#bdc1c6]">{displayUrl}</p>
              </div>
            </div>
            <p className="mt-1.5 cursor-pointer text-[1.05rem] leading-snug text-[#1a0dab] hover:underline dark:text-[#8ab4f8]">
              {desktopTitle || "Your page title appears here"}
            </p>
            <p className="mt-1 text-[0.78rem] leading-snug text-[#4d5156] dark:text-[#bdc1c6]">
              <span className="text-[#70757a] dark:text-[#9aa0a6]">Nov 2, 2025 — </span>
              {desktopDescription || "Your meta description appears here."}
            </p>
          </div>
        </div>

        <div>
          <p className="mb-2 text-[0.7rem] font-bold uppercase tracking-[0.08em] text-[var(--text-subtle)]">
            Mobile preview
          </p>
          <div className="mx-auto max-w-xs rounded-xl border border-[var(--border)] bg-white p-3.5 dark:bg-[#202124]">
            <div className="flex items-center gap-2">
              <span className="flex size-5 items-center justify-center rounded-full bg-[#e8f0fe] text-[0.6rem] font-bold text-[#1a73e8]">
                T
              </span>
              <div className="min-w-0 leading-tight">
                <p className="truncate text-[0.7rem] text-[#202124] dark:text-[#e8eaed]">Toolora</p>
                <p className="truncate text-[0.65rem] text-[#4d5156] dark:text-[#bdc1c6]">{displayUrl}</p>
              </div>
            </div>
            <p className="mt-1.5 text-[0.98rem] leading-snug text-[#1a0dab] dark:text-[#8ab4f8]">
              {mobileTitle || "Your page title appears here"}
            </p>
            <p className="mt-1 text-[0.76rem] leading-snug text-[#4d5156] dark:text-[#bdc1c6]">
              {mobileDescription || "Your meta description appears here."}
            </p>
          </div>
        </div>
      </div>

      <div className="mt-4 grid gap-2 sm:grid-cols-2">
        <div
          className={cn(
            "rounded-lg border px-3 py-2 text-xs",
            titleStatus === "good"
              ? "border-emerald-300/70 bg-emerald-50 text-emerald-900 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-200"
              : "border-amber-300/70 bg-amber-50 text-amber-900 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-200",
          )}
        >
          <strong>Title:</strong>{" "}
          {titleStatus === "good"
            ? "fits comfortably on one line on desktop."
            : titleStatus === "short"
              ? "short — there is room for a clearer benefit or qualifier."
              : titleStatus === "long"
                ? "likely truncated on desktop. Move a qualifier into the description."
                : "empty."}
        </div>
        <div
          className={cn(
            "rounded-lg border px-3 py-2 text-xs",
            descriptionStatus === "good"
              ? "border-emerald-300/70 bg-emerald-50 text-emerald-900 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-200"
              : "border-amber-300/70 bg-amber-50 text-amber-900 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-200",
          )}
        >
          <strong>Description:</strong>{" "}
          {descriptionStatus === "good"
            ? "makes efficient use of the available snippet."
            : descriptionStatus === "short"
              ? "shorter than the space available — add a concrete benefit."
              : descriptionStatus === "long"
                ? "will be cut off. Front-load the distinguishing detail."
                : "empty."}
        </div>
      </div>

      <div className="mt-3">
        <Callout tone="info">
          Google measures snippets in pixels, not characters, and rewrites titles for many queries.
          Treat this as a design aid, not a guarantee of what searchers will see.{" "}
          <span ref={measureRef} />
        </Callout>
      </div>
    </ToolPanel>
  );
}
