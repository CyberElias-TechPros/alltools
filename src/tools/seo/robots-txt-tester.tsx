"use client";

import { useMemo, useState } from "react";
import { Callout, CopyButton, Field, ResultCard, SimpleTable, StatGrid, TextArea, TextInput, ToolPanel } from "@/components/ui";
import { parseRobots, testRobots } from "@/lib/seo-tools";

const SAMPLE = `User-agent: *
Disallow: /admin/
Disallow: /*.pdf$
Allow: /admin/public/

Sitemap: https://example.com/sitemap.xml`;

export default function RobotsTxtTester() {
  const [robots, setRobots] = useState(SAMPLE);
  const [path, setPath] = useState("/admin/dashboard");
  const [agent, setAgent] = useState("Googlebot");

  const parsed = useMemo(() => parseRobots(robots), [robots]);
  const test = useMemo(() => testRobots(robots, path, agent), [robots, path, agent]);

  return (
    <ToolPanel>
      <div className="grid gap-4 lg:grid-cols-2">
        <div>
          <div className="mb-2 flex items-center justify-between">
            <label htmlFor="robots-input" className="label !mb-0">
              robots.txt
            </label>
            <CopyButton text={robots} label="Copy" />
          </div>
          <TextArea
            id="robots-input"
            value={robots}
            onChange={(event) => setRobots(event.target.value)}
            rows={12}
            spellCheck={false}
            className="font-mono text-[0.78rem]"
          />
        </div>

        <div className="space-y-3">
          <Field label="Path or URL to test" htmlFor="robots-path" hint="Supports the same wildcards as the file.">
            <TextInput
              id="robots-path"
              value={path}
              onChange={(event) => setPath(event.target.value)}
              className="font-mono text-[0.82rem]"
              spellCheck={false}
            />
          </Field>
          <Field label="User-agent" htmlFor="robots-agent" hint="Bots are matched by name; * applies to everyone else.">
            <TextInput
              id="robots-agent"
              value={agent}
              onChange={(event) => setAgent(event.target.value)}
              className="font-mono text-[0.82rem]"
              spellCheck={false}
            />
          </Field>

          <ResultCard
            label="Access"
            value={test.allowed ? "Allowed" : "Blocked"}
            tone={test.allowed ? "brand" : "neutral"}
            sub={
              test.matchedRule
                ? `Matched ${test.matchedRule.type.toUpperCase()} ${test.matchedRule.path || "(empty)"}`
                : "No rule matched this path."
            }
          >
            <StatGrid
              columns={3}
              items={[
                { label: "Groups", value: String(parsed.groups.length) },
                { label: "Rules", value: String(parsed.groups.reduce((total, group) => total + group.rules.length, 0)) },
                { label: "Sitemaps", value: String(parsed.sitemaps.length) },
              ]}
            />
            {test.group ? (
              <p className="mt-3 font-mono text-[0.65rem] uppercase tracking-[0.1em] text-[var(--text-subtle)]">
                Group: {test.group}
              </p>
            ) : null}
            {test.notes.length ? (
              <ul className="mt-2 space-y-1 text-sm leading-relaxed text-[var(--text-subtle)]">
                {test.notes.map((note) => (
                  <li key={note}>{note}</li>
                ))}
              </ul>
            ) : null}
          </ResultCard>
        </div>
      </div>

      <div className="mt-5 grid gap-4 lg:grid-cols-2">
        <div>
          <p className="label">Groups parsed</p>
          <SimpleTable
            head={["User-agent", "Rules", "Notes"]}
            caption="Parsed robots.txt groups"
            rows={parsed.groups.map((group) => [
              group.agents.join(", "),
              String(group.rules.length),
              group.crawlDelay ? `crawl-delay ${group.crawlDelay}` : "—",
            ])}
          />
        </div>
        <div>
          <p className="label">Problems</p>
          {parsed.issues.length ? (
            <Callout tone="warning">
              <ul className="space-y-1">
                {parsed.issues.map((issue) => (
                  <li key={issue}>{issue}</li>
                ))}
              </ul>
            </Callout>
          ) : (
            <p className="text-sm leading-relaxed text-[var(--text-subtle)]">
              No syntax problems found. Longest match wins, and Allow wins ties — the behaviour implemented here is the
              same rule Google documents.
            </p>
          )}
        </div>
      </div>

      <p className="mt-5 text-xs leading-relaxed text-[var(--text-subtle)]">
        robots.txt is a request, not access control. A crawler that ignores it can still fetch blocked URLs, so keep
        anything genuinely private behind authentication.
      </p>
    </ToolPanel>
  );
}
