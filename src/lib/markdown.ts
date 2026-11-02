/**
 * A small, dependency-free Markdown engine.
 *
 * It exists for three tools — Markdown preview, Markdown → HTML and HTML →
 * Markdown — and it runs entirely in the browser. It intentionally supports a
 * documented subset (headings, emphasis, inline code, fenced code, links,
 * lists, blockquotes, rules and paragraphs) rather than pretending to be
 * CommonMark: anything unsupported survives as plain text instead of being
 * silently dropped.
 */

export type Inline =
  | { type: "text"; text: string }
  | { type: "strong"; children: Inline[] }
  | { type: "em"; children: Inline[] }
  | { type: "code"; text: string }
  | { type: "link"; href: string; children: Inline[] };

export type Block =
  | { type: "heading"; level: 1 | 2 | 3 | 4 | 5 | 6; children: Inline[] }
  | { type: "paragraph"; children: Inline[] }
  | { type: "list"; ordered: boolean; items: Inline[][] }
  | { type: "code"; lang: string; code: string }
  | { type: "quote"; children: Inline[] }
  | { type: "rule" };

export function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/** Parse inline markup: **bold**, *italic*, `code` and [links](https://…). */
export function parseInline(source: string): Inline[] {
  const nodes: Inline[] = [];
  let index = 0;
  let buffer = "";

  const flush = () => {
    if (buffer) {
      nodes.push({ type: "text", text: buffer });
      buffer = "";
    }
  };

  while (index < source.length) {
    const rest = source.slice(index);

    const code = rest.match(/^`([^`]+)`/);
    if (code) {
      flush();
      nodes.push({ type: "code", text: code[1] });
      index += code[0].length;
      continue;
    }

    const strong = rest.match(/^(\*\*|__)([\s\S]+?)\1/);
    if (strong) {
      flush();
      nodes.push({ type: "strong", children: parseInline(strong[2]) });
      index += strong[0].length;
      continue;
    }

    const emphasis = rest.match(/^(\*|_)([^_\n][\s\S]*?)\1/);
    if (emphasis) {
      flush();
      nodes.push({ type: "em", children: parseInline(emphasis[2]) });
      index += emphasis[0].length;
      continue;
    }

    const link = rest.match(/^\[([^\]]+)\]\(([^)\s]+)(?:\s+"[^"]*")?\)/);
    if (link) {
      flush();
      nodes.push({ type: "link", href: link[2], children: parseInline(link[1]) });
      index += link[0].length;
      continue;
    }

    buffer += source[index];
    index += 1;
  }

  flush();
  return nodes;
}

/** Parse a Markdown document into block nodes. */
export function parseMarkdown(source: string): Block[] {
  const lines = source.replace(/\r\n/g, "\n").split("\n");
  const blocks: Block[] = [];
  let index = 0;

  while (index < lines.length) {
    const line = lines[index];

    if (!line.trim()) {
      index += 1;
      continue;
    }

    const fence = line.match(/^```\s*([\w+-]*)\s*$/);
    if (fence) {
      const lang = fence[1] ?? "";
      const body: string[] = [];
      index += 1;
      while (index < lines.length && !/^```\s*$/.test(lines[index])) {
        body.push(lines[index]);
        index += 1;
      }
      index += 1;
      blocks.push({ type: "code", lang, code: body.join("\n") });
      continue;
    }

    if (/^\s*(-{3,}|\*{3,}|_{3,})\s*$/.test(line)) {
      blocks.push({ type: "rule" });
      index += 1;
      continue;
    }

    const heading = line.match(/^(#{1,6})\s+(.*)$/);
    if (heading) {
      blocks.push({
        type: "heading",
        level: heading[1].length as 1 | 2 | 3 | 4 | 5 | 6,
        children: parseInline(heading[2].trim()),
      });
      index += 1;
      continue;
    }

    if (/^>\s?/.test(line)) {
      const body: string[] = [];
      while (index < lines.length && /^>\s?/.test(lines[index])) {
        body.push(lines[index].replace(/^>\s?/, ""));
        index += 1;
      }
      blocks.push({ type: "quote", children: parseInline(body.join(" ")) });
      continue;
    }

    const orderedMatch = line.match(/^\s*\d+[.)]\s+(.*)$/);
    const bulletMatch = line.match(/^\s*[-*+]\s+(.*)$/);
    if (orderedMatch || bulletMatch) {
      const ordered = Boolean(orderedMatch);
      const items: Inline[][] = [];
      while (index < lines.length) {
        const match = ordered
          ? lines[index].match(/^\s*\d+[.)]\s+(.*)$/)
          : lines[index].match(/^\s*[-*+]\s+(.*)$/);
        if (!match) break;
        items.push(parseInline(match[1].trim()));
        index += 1;
      }
      blocks.push({ type: "list", ordered, items });
      continue;
    }

    const paragraph: string[] = [];
    while (
      index < lines.length &&
      lines[index].trim() &&
      !/^(#{1,6})\s+/.test(lines[index]) &&
      !/^```/.test(lines[index]) &&
      !/^>\s?/.test(lines[index]) &&
      !/^\s*([-*+]|\d+[.)])\s+/.test(lines[index]) &&
      !/^\s*(-{3,}|\*{3,}|_{3,})\s*$/.test(lines[index])
    ) {
      paragraph.push(lines[index].trim());
      index += 1;
    }
    blocks.push({ type: "paragraph", children: parseInline(paragraph.join(" ")) });
  }

  return blocks;
}

function inlineToHtml(nodes: Inline[]): string {
  return nodes
    .map((node) => {
      switch (node.type) {
        case "text":
          return escapeHtml(node.text);
        case "code":
          return `<code>${escapeHtml(node.text)}</code>`;
        case "strong":
          return `<strong>${inlineToHtml(node.children)}</strong>`;
        case "em":
          return `<em>${inlineToHtml(node.children)}</em>`;
        case "link":
          return `<a href="${escapeHtml(node.href)}" rel="noopener noreferrer nofollow">${inlineToHtml(
            node.children,
          )}</a>`;
        default:
          return "";
      }
    })
    .join("");
}

/** Convert Markdown to HTML (escaped output; no raw HTML passes through). */
export function markdownToHtml(source: string, options: { newline?: boolean } = {}): string {
  const blocks = parseMarkdown(source);
  const html = blocks
    .map((block) => {
      switch (block.type) {
        case "heading":
          return `<h${block.level}>${inlineToHtml(block.children)}</h${block.level}>`;
        case "paragraph":
          return `<p>${inlineToHtml(block.children)}</p>`;
        case "code":
          return `<pre><code${block.lang ? ` class="language-${escapeHtml(block.lang)}"` : ""}>${escapeHtml(
            block.code,
          )}</code></pre>`;
        case "quote":
          return `<blockquote>${inlineToHtml(block.children)}</blockquote>`;
        case "rule":
          return "<hr />";
        case "list": {
          const tag = block.ordered ? "ol" : "ul";
          const items = block.items
            .map((item) => `<li>${inlineToHtml(item)}</li>`)
            .join("");
          return `<${tag}>${items}</${tag}>`;
        }
        default:
          return "";
      }
    })
    .join("\n");

  return options.newline ? html.replace(/></g, ">\n<") : html;
}

/** Plain-text rendering of a Markdown document (used by the preview fallback). */
export function markdownToText(source: string): string {
  return parseMarkdown(source)
    .map((block) => {
      if (block.type === "code") return block.code;
      if (block.type === "list") return block.items.map((item) => inlineText(item)).join("\n");
      if (block.type === "rule") return "---";
      if (block.type === "heading" || block.type === "paragraph" || block.type === "quote") {
        return inlineText(block.children);
      }
      return "";
    })
    .join("\n\n");
}

function inlineText(nodes: Inline[]): string {
  return nodes
    .map((node) => {
      if (node.type === "text" || node.type === "code") return node.text;
      return inlineText(node.children);
    })
    .join("");
}

/**
 * Convert an HTML fragment to Markdown.
 *
 * This is a pragmatic converter for pasted markup: it understands headings,
 * paragraphs, emphasis, links, images, lists, code blocks, blockquotes, breaks
 * and horizontal rules. It strips script/style content entirely and decodes the
 * common entities. Nested lists are flattened one level rather than guessed at.
 */
export function htmlToMarkdown(html: string): string {
  let source = html
    .replace(/<!--[\s\S]*?-->/g, "")
    .replace(/<(script|style)[\s\S]*?<\/\1>/gi, "");

  const decode = (value: string) =>
    value
      .replace(/&nbsp;/gi, " ")
      .replace(/&lt;/gi, "<")
      .replace(/&gt;/gi, ">")
      .replace(/&quot;/gi, '"')
      .replace(/&#39;|&apos;/gi, "'")
      .replace(/&amp;/gi, "&");

  const inline = (value: string) =>
    decode(
      value
        .replace(/<br\s*\/?>/gi, "\n")
        .replace(/<(strong|b)>([\s\S]*?)<\/\1>/gi, "**$2**")
        .replace(/<(em|i)>([\s\S]*?)<\/\1>/gi, "*$2*")
        .replace(/<code>([\s\S]*?)<\/code>/gi, "`$1`")
        .replace(/<a\b[^>]*href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi, "[$2]($1)")
        .replace(/<img\b[^>]*src=["']([^"']+)["'][^>]*alt=["']([^"']*)["'][^>]*\/?>/gi, "![$2]($1)")
        .replace(/<img\b[^>]*alt=["']([^"']*)["'][^>]*src=["']([^"']+)["'][^>]*\/?>/gi, "![$1]($2)")
        .replace(/<[^>]+>/g, "")
        .replace(/[ \t]+/g, " ")
        .trim(),
    );

  const blocks: string[] = [];
  const stash = (markdown: string) => {
    blocks.push(markdown);
    return `\u0000${blocks.length - 1}\u0000`;
  };

  // Code blocks first so their whitespace survives untouched.
  source = source.replace(
    /<pre\b[^>]*>\s*<code\b[^>]*>([\s\S]*?)<\/code>\s*<\/pre>/gi,
    (_match, code: string) =>
      stash(["```", decode(code.replace(/<[^>]+>/g, "")).trim(), "```"].join("\n")),
  );

  source = source.replace(
    /<h([1-6])\b[^>]*>([\s\S]*?)<\/h\1>/gi,
    (_match, level: string, body: string) => stash(`${"#".repeat(Number(level))} ${inline(body)}`),
  );

  source = source.replace(/<blockquote\b[^>]*>([\s\S]*?)<\/blockquote>/gi, (_match, body: string) => {
    const text = inline(body.replace(/<\/?p[^>]*>/gi, "\n"));
    return stash(
      text
        .split("\n")
        .map((line) => (line.trim() ? `> ${line.trim()}` : ">"))
        .join("\n"),
    );
  });

  source = source.replace(
    /<(ul|ol)\b[^>]*>([\s\S]*?)<\/\1>/gi,
    (_match, tag: string, body: string) => {
      const items = [...body.matchAll(/<li\b[^>]*>([\s\S]*?)<\/li>/gi)].map((item) =>
        inline(item[1].replace(/<[^>]+>/g, " ")),
      );
      return stash(
        items
          .map((item, position) =>
            tag.toLowerCase() === "ol" ? `${position + 1}. ${item}` : `- ${item}`,
          )
          .join("\n"),
      );
    },
  );

  source = source.replace(/<hr\s*\/?>/gi, () => stash("---"));
  source = source.replace(/<table[\s\S]*?<\/table>/gi, (table) =>
    stash(
      [...table.matchAll(/<tr\b[^>]*>([\s\S]*?)<\/tr>/gi)]
        .map((row) =>
          [...row[1].matchAll(/<t[hd]\b[^>]*>([\s\S]*?)<\/t[hd]>/gi)]
            .map((cell) => inline(cell[1]))
            .join(" | "),
        )
        .join("\n"),
    ),
  );

  const chunks = source
    .split(/<\/p>|<br\s*\/?>\s*<br\s*\/?>/i)
    .map((chunk) => inline(chunk.replace(/<p\b[^>]*>/gi, "")))
    .filter(Boolean);

  // Each stashed block becomes its own section, in document order, so a heading
  // is never glued onto the paragraph that follows it.
  const rendered: string[] = [];
  for (const chunk of chunks) {
    const pieces = chunk.split(/\u0000(\d+)\u0000/);
    pieces.forEach((piece, position) => {
      if (position % 2 === 1) {
        rendered.push(blocks[Number(piece)] ?? "");
      } else if (piece.trim()) {
        rendered.push(piece.trim());
      }
    });
  }

  return rendered
    .join("\n\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}
