// @vitest-environment jsdom
import { afterEach, beforeAll, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render } from "@testing-library/react";
import type { ComponentType } from "react";
import { liveTools } from "../src/lib/tools/registry";

/**
 * Interaction guard.
 *
 * `render.test.tsx` proves every tool mounts. This proves each one survives being
 * used: typing into every field, selecting an option in every dropdown, toggling
 * every checkbox, choosing a file with every file input, and clicking every
 * enabled button. Any exception — or any React error logged to the console, such
 * as a duplicate key — fails the suite.
 *
 * It is not a substitute for a real browser: jsdom has no canvas, no real PDF
 * pipeline and no layout engine, so the *quality* of an image or PDF result is
 * covered by the logic tests, not here. What it does cover is the whole class of
 * bugs that only appear when a control is touched: a handler that throws on an
 * empty value, a crash on the second keystroke, a key that collides once two
 * cells share a label.
 */

const modules = import.meta.glob("../src/tools/**/*.tsx", { eager: true }) as Record<
  string,
  { default?: ComponentType }
>;

const components = Object.entries(modules)
  .filter(([path]) => path !== "../src/tools/registry.tsx")
  .map(([path, module]) => ({ path, Component: module.default }))
  .filter((entry): entry is { path: string; Component: ComponentType } => Boolean(entry.Component));

beforeAll(() => {
  Object.defineProperty(window, "matchMedia", {
    writable: true,
    value: (query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addEventListener() {},
      removeEventListener() {},
      addListener() {},
      removeListener() {},
      dispatchEvent: () => false,
    }),
  });
  URL.createObjectURL = vi.fn(() => "blob:test");
  URL.revokeObjectURL = vi.fn();
  Object.assign(navigator, { clipboard: { writeText: vi.fn(async () => {}) } });
  // jsdom ships no canvas backend; returning null keeps the failure catchable
  // instead of throwing "not implemented" from inside a tool.
  HTMLCanvasElement.prototype.getContext = (() => null) as never;
  HTMLCanvasElement.prototype.toDataURL = () => "data:image/png;base64,";
  HTMLCanvasElement.prototype.toBlob = (callback: BlobCallback) => callback(null);
  globalThis.ResizeObserver = class {
    observe() {}
    unobserve() {}
    disconnect() {}
  } as unknown as typeof ResizeObserver;
  // Download buttons click a generated <a href="blob:…" download>; jsdom cannot
  // start downloads and logs a navigation warning, so anchors are inert here.
  HTMLAnchorElement.prototype.click = () => {};
});

afterEach(() => {
  cleanup();
});

const SAMPLE_TEXT = "Hello world\nSecond line 42 café 🙂";

function usableValue(input: HTMLInputElement): string {
  const type = input.getAttribute("type") ?? "text";
  if (type === "number" || type === "range") return "12";
  if (type === "datetime-local") return "2024-06-01T10:30";
  if (type === "date") return "2024-06-01";
  if (type === "time") return "10:30";
  if (type === "color") return "#3366ff";
  return "Sample 42";
}

function exercise(container: HTMLElement) {
  for (const input of Array.from(
    container.querySelectorAll<HTMLInputElement>(
      "input:not([type=file]):not([type=checkbox]):not([type=radio])",
    ),
  )) {
    fireEvent.change(input, { target: { value: usableValue(input) } });
  }

  for (const area of Array.from(container.querySelectorAll("textarea"))) {
    fireEvent.change(area, { target: { value: SAMPLE_TEXT } });
  }

  for (const select of Array.from(container.querySelectorAll("select"))) {
    const options = Array.from(select.options).filter((option) => !option.disabled);
    const next = options[options.length - 1];
    if (next) fireEvent.change(select, { target: { value: next.value } });
  }

  for (const box of Array.from(
    container.querySelectorAll<HTMLInputElement>("input[type=checkbox], input[type=radio]"),
  )) {
    fireEvent.click(box);
  }

  for (const fileInput of Array.from(
    container.querySelectorAll<HTMLInputElement>("input[type=file]"),
  )) {
    const file = new File([new Uint8Array([137, 80, 78, 71, 13, 10, 26, 10])], "sample.png", {
      type: "image/png",
    });
    fireEvent.change(fileInput, { target: { files: [file] } });
  }

  for (const button of Array.from(container.querySelectorAll("button"))) {
    if (button.disabled) continue;
    fireEvent.click(button);
  }
}

describe("tool components survive being used", () => {
  it("has a component for every live tool", () => {
    expect(components.length).toBe(liveTools.length);
    expect(new Set(liveTools.map((tool) => tool.slug)).size).toBe(liveTools.length);
  });

  it.each(components)("$path handles input, dropdowns, files and buttons", ({ Component }) => {
    const logged: string[] = [];
    const consoleError = vi.spyOn(console, "error").mockImplementation((...args) => {
      logged.push(args.map(String).join(" "));
    });

    try {
      const { container } = render(<Component />);
      expect(() => exercise(container)).not.toThrow();
      expect(container.textContent?.trim().length ?? 0).toBeGreaterThan(0);
    } finally {
      consoleError.mockRestore();
    }

    expect(logged, `React reported: ${logged.join(" | ")}`).toEqual([]);
  }, 30_000);
});
