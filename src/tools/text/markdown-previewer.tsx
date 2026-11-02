"use client";

import { useMemo, useState } from "react";
import { CopyButton, TextArea, ToolPanel } from "@/components/ui";
import { parseMarkdown, markdownToText, type Inline } from "@/lib/markdown";
import type { ReactNode } from "react";

function renderInline(nodes: Inline[], keyPrefix = ""): ReactNode[] {
  return nodes.map((node, index) => {
    const key = `${keyPrefix}-${index}`;
    switch (node.type) {
      case "text":
        return <span key={key}>{node.text}</span>;
      case "code":
        return (
          <code key={key} className="bg-[var(--code-bg)] px-1 py-0.5 font-mono text-[0.85em]">
            {node.text}
          </code>
        );
      case "strong":
        return <strong key={key}>{renderInline(node.children, key)}</strong>;
      case "em":
        return <em key={key}>{renderInline(node.children, key)}</em>;
      case "link":
        return (
          <a key={key} href={node.href} target="_blank" rel="noopener noreferrer nofollow" className="link">
            {renderInline(node.children, key)}
          </a>
        );
      default:
        return null;
    }
  });
}

const SAMPLE = `# Release notes

A small **markdown** engine, no dependencies.

- headings, lists and quotes
- \`inline code\` and fenced blocks
- [links](https://example.com) with rel="nofollow"

> Everything renders in your browser.

\`\`\`js
const total = tools.length;
\`\`\``;

export default function MarkdownPreviewer() {
  const [source, setSource] = useState(SAMPLE);
  const blocks = useMemo(() => parseMarkdown(source), [source]);

  return (
    <ToolPanel>
      <div className="grid gap-4 lg:grid-cols-2">
        <div>
          <div className="mb-2 flex items-center justify-between">
            <label htmlFor="md-input" className="label !mb-0">
              Markdown
            </label>
            <CopyButton text={source} size="sm" label="Copy source" />
          </div>
          <TextArea
            id="md-input"
            value={source}
            onChange={(event) => setSource(event.target.value)}
            className="min-h-[24rem] font-mono text-[0.84rem]"
            spellCheck={false}
          />
        </div>

        <div>
          <div className="mb-2 flex items-center justify-between">
            <span className="label !mb-0">Preview</span>
            <CopyButton text={markdownToText(source)} size="sm" label="Copy text" />
          </div>
          <div
            aria-label="Rendered markdown"
            className="min-h-[24rem] overflow-auto border border-[var(--border)] bg-[var(--page-elevated)] p-4"
          >
            {blocks.length === 0 ? (
              <p className="text-sm text-[var(--text-muted)]">Rendered Markdown appears here.</p>
            ) : (
              blocks.map((block, index) => {
                if (block.type === "heading") {
                  const Tag = (`h${block.level}` as unknown) as "h1";
                  return (
                    <Tag
                      key={index}
                      className="mb-2 mt-4 font-display font-semibold tracking-[-0.02em] text-[var(--text)] first:mt-0"
                      style={{ fontSize: `${1.5 - block.level * 0.08}rem` }}
                    >
                      {renderInline(block.children, `h${index}`)}
                    </Tag>
                  );
                }
                if (block.type === "paragraph") {
                  return (
                    <p key={index} className="mb-3 text-sm leading-relaxed text-[var(--text-muted)]">
                      {renderInline(block.children, `p${index}`)}
                    </p>
                  );
                }
                if (block.type === "list") {
                  const Tag = block.ordered ? "ol" : "ul";
                  return (
                    <Tag
                      key={index}
                      className={`mb-3 pl-5 text-sm text-[var(--text-muted)] ${
                        block.ordered ? "list-decimal" : "list-disc"
                      }`}
                    >
                      {block.items.map((item, itemIndex) => (
                        <li key={itemIndex} className="mb-1">
                          {renderInline(item, `l${index}-${itemIndex}`)}
                        </li>
                      ))}
                    </Tag>
                  );
                }
                if (block.type === "code") {
                  return (
                    <pre
                      key={index}
                      className="mb-3 overflow-x-auto border border-[var(--border)] bg-[var(--code-bg)] p-3 font-mono text-[0.8rem] text-[var(--text)]"
                    >
                      <code>{block.code}</code>
                    </pre>
                  );
                }
                if (block.type === "quote") {
                  return (
                    <blockquote
                      key={index}
                      className="mb-3 border-l-2 border-[var(--ring)] pl-3 text-sm italic text-[var(--text-muted)]"
                    >
                      {renderInline(block.children, `q${index}`)}
                    </blockquote>
                  );
                }
                return <hr key={index} className="my-4 border-[var(--border)]" />;
              })
            )}
          </div>
        </div>
      </div>
    </ToolPanel>
  );
}
