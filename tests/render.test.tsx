import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import type { ComponentType } from "react";

/**
 * End-to-end rendering guard.
 *
 * Every tool component is rendered once with react-dom/server. This catches
 * the failure modes that a logic test cannot: a broken import, a hook used
 * conditionally, a crash on the initial (empty) state, or a component that
 * renders nothing at all. It does not replace clicking through the UI, but it
 * makes "the tool is registered, compiles and renders" a test result rather
 * than an assumption.
 */

const modules = import.meta.glob("../src/tools/**/*.tsx", { eager: true }) as Record<
  string,
  { default?: ComponentType }
>;

const components = Object.entries(modules)
  .map(([path, module]) => ({ path, Component: module.default }))
  .filter((entry): entry is { path: string; Component: ComponentType } => Boolean(entry.Component));

describe("tool components render", () => {
  it("finds every tool component", () => {
    expect(components.length).toBeGreaterThanOrEqual(50);
  });

  it.each(components)("$path renders without throwing", ({ Component }) => {
    const html = renderToStaticMarkup(<Component />);
    expect(html.length).toBeGreaterThan(80);
    expect(html).toContain("<");
  });

  it("renders an input control in every tool", () => {
    const missing = components.filter(({ Component }) => {
      const html = renderToStaticMarkup(<Component />);
      return !/<(input|textarea|select|button)\b/.test(html);
    });
    expect(missing.map((entry) => entry.path)).toEqual([]);
  });
});

describe("the component map matches the catalogue", () => {
  it("has a component for every live tool, and no orphan components", async () => {
    const { liveTools } = await import("@/lib/tools/registry");
    const { toolComponents } = await import("@/tools/registry");
    const live = new Set(liveTools.map((tool) => tool.slug));
    const mapped = new Set(Object.keys(toolComponents));
    expect([...live].filter((slug) => !mapped.has(slug))).toEqual([]);
    expect([...mapped].filter((slug) => !live.has(slug))).toEqual([]);
  });

  it("does not map the slug of a planned tool", async () => {
    const { tools } = await import("@/lib/tools/registry");
    const { toolComponents } = await import("@/tools/registry");
    const planned = tools.filter((tool) => tool.status === "planned").map((tool) => tool.slug);
    expect(planned.filter((slug) => slug in toolComponents)).toEqual([]);
  });
});
