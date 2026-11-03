/**
 * XML pretty-printer and well-formedness checker.
 *
 * This is not a schema validator and does not resolve namespaces, entities or
 * DTDs: it answers the question developers actually ask — "is this document
 * well formed, and if not, where?" — without a network fetch and without
 * handing your payload to a parser service.
 */

export interface XmlIssue {
  message: string;
  line: number;
  column: number;
}

type Token =
  | { kind: "decl"; text: string }
  | { kind: "comment"; text: string }
  | { kind: "cdata"; text: string }
  | { kind: "doctype"; text: string }
  | { kind: "open"; name: string; text: string; selfClosing: boolean }
  | { kind: "close"; name: string; text: string }
  | { kind: "text"; text: string };

interface TokenizeResult {
  tokens: Token[];
  issue?: XmlIssue;
}

function positionAt(source: string, index: number) {
  const before = source.slice(0, index).split("\n");
  return { line: before.length, column: before[before.length - 1].length + 1 };
}

const NAME = /^[A-Za-z_:][\w:.-]*/;

function tokenize(source: string): TokenizeResult {
  const tokens: Token[] = [];
  let index = 0;

  while (index < source.length) {
    const char = source[index];

    if (char !== "<") {
      let end = source.indexOf("<", index);
      if (end === -1) end = source.length;
      tokens.push({ kind: "text", text: source.slice(index, end) });
      index = end;
      continue;
    }

    if (source.startsWith("<!--", index)) {
      const end = source.indexOf("-->", index + 4);
      if (end === -1) return { tokens, issue: { message: "Unterminated comment — missing -->", ...positionAt(source, index) } };
      tokens.push({ kind: "comment", text: source.slice(index, end + 3) });
      index = end + 3;
      continue;
    }

    if (source.startsWith("<![CDATA[", index)) {
      const end = source.indexOf("]]>", index + 9);
      if (end === -1) return { tokens, issue: { message: "Unterminated CDATA section — missing ]]>", ...positionAt(source, index) } };
      tokens.push({ kind: "cdata", text: source.slice(index, end + 3) });
      index = end + 3;
      continue;
    }

    if (source.startsWith("<!", index)) {
      const end = source.indexOf(">", index);
      if (end === -1) return { tokens, issue: { message: "Unterminated declaration", ...positionAt(source, index) } };
      tokens.push({ kind: "doctype", text: source.slice(index, end + 1) });
      index = end + 1;
      continue;
    }

    if (source.startsWith("<?", index)) {
      const end = source.indexOf("?>", index);
      if (end === -1) return { tokens, issue: { message: "Unterminated processing instruction — missing ?>", ...positionAt(source, index) } };
      tokens.push({ kind: "decl", text: source.slice(index, end + 2) });
      index = end + 2;
      continue;
    }

    // Closing tag
    if (source[index + 1] === "/") {
      const end = source.indexOf(">", index);
      if (end === -1) return { tokens, issue: { message: "Unterminated closing tag", ...positionAt(source, index) } };
      const raw = source.slice(index + 2, end).trim();
      const name = NAME.exec(raw)?.[0] ?? "";
      if (!name || name.length !== raw.length) {
        return { tokens, issue: { message: `Invalid closing tag </${raw}>`, ...positionAt(source, index) } };
      }
      tokens.push({ kind: "close", name, text: source.slice(index, end + 1) });
      index = end + 1;
      continue;
    }

    // Opening tag — find the closing bracket, skipping quoted attribute values.
    let cursor = index + 1;
    let quote: string | null = null;
    while (cursor < source.length) {
      const current = source[cursor];
      if (quote) {
        if (current === quote) quote = null;
      } else if (current === '"' || current === "'") {
        quote = current;
      } else if (current === ">") {
        break;
      }
      cursor += 1;
    }
    if (cursor >= source.length) {
      return { tokens, issue: { message: "Unterminated tag — missing >", ...positionAt(source, index) } };
    }
    if (quote) {
      return { tokens, issue: { message: "Unterminated attribute value — missing closing quote", ...positionAt(source, index) } };
    }

    const inner = source.slice(index + 1, cursor);
    if (!/^[A-Za-z_:]/.test(inner)) {
      return {
        tokens,
        issue: { message: "A bare “<” in text content must be written as &lt;", ...positionAt(source, index) },
      };
    }
    const name = NAME.exec(inner)?.[0] ?? "";
    const rest = inner.slice(name.length);
    const selfClosing = rest.trimEnd().endsWith("/");
    const attributeText = selfClosing ? rest.trimEnd().slice(0, -1) : rest;

    // Every attribute must be `name="value"` or `name='value'`.
    const attributeIssue = validateAttributes(attributeText);
    if (attributeIssue) {
      return { tokens, issue: { message: `${attributeIssue} in <${name}>`, ...positionAt(source, index) } };
    }

    tokens.push({
      kind: "open",
      name,
      text: source.slice(index, cursor + 1),
      selfClosing,
    });
    index = cursor + 1;
  }

  return { tokens };
}

function validateAttributes(text: string): string | null {
  let rest = text;
  const seen = new Set<string>();
  while (rest.trim()) {
    const trimmed = rest.trimStart();
    const match = NAME.exec(trimmed);
    if (!match) return `Unexpected “${trimmed.slice(0, 12)}”`;
    const name = match[0];
    if (seen.has(name)) return `Duplicate attribute “${name}”`;
    seen.add(name);
    const afterName = trimmed.slice(name.length);
    if (!afterName.startsWith("=")) return `Attribute “${name}” has no value`;
    const afterEquals = afterName.slice(1);
    const quote = afterEquals[0];
    if (quote !== '"' && quote !== "'") return `Attribute “${name}” must be quoted`;
    const close = afterEquals.indexOf(quote, 1);
    if (close === -1) return `Attribute “${name}” is missing its closing quote`;
    if (afterEquals.slice(1, close).includes("<")) return `Attribute “${name}” contains a raw “<”`;
    rest = afterEquals.slice(close + 1);
  }
  return null;
}

export interface XmlStats {
  root: string;
  elements: number;
  attributes: number;
  comments: number;
  cdata: number;
  maxDepth: number;
}

export interface XmlValidation {
  valid: boolean;
  issue?: XmlIssue;
  stats?: XmlStats;
}

export function validateXml(source: string): XmlValidation {
  if (!source.trim()) return { valid: false, issue: { message: "There is nothing to validate.", line: 1, column: 1 } };

  const { tokens, issue } = tokenize(source);
  if (issue) return { valid: false, issue };

  const stack: Array<{ name: string }> = [];
  let root: string | null = null;
  let elements = 0;
  let attributes = 0;
  let comments = 0;
  let cdata = 0;
  let maxDepth = 0;
  let textOutsideRoot = false;

  for (const token of tokens) {
    if (token.kind === "comment") comments += 1;
    if (token.kind === "cdata") cdata += 1;

    if (token.kind === "text") {
      if (stack.length === 0 && token.text.trim()) {
        if (!root) {
          return { valid: false, issue: { message: "Text appears before the root element.", line: 1, column: 1 } };
        }
        textOutsideRoot = true;
      }
      continue;
    }

    if (token.kind === "open") {
      elements += 1;
      const attributeCount = (token.text.match(/=\s*["']/g) ?? []).length;
      attributes += attributeCount;
      if (!root) {
        root = token.name;
      } else if (stack.length === 0) {
        return {
          valid: false,
          issue: { message: `A document may only have one root element — found a second one, <${token.name}>.`, line: 1, column: 1 },
        };
      }
      if (!token.selfClosing) {
        stack.push({ name: token.name });
        maxDepth = Math.max(maxDepth, stack.length);
      } else {
        maxDepth = Math.max(maxDepth, stack.length + 1);
      }
      continue;
    }

    if (token.kind === "close") {
      const open = stack.pop();
      if (!open) {
        return { valid: false, issue: { message: `</${token.name}> closes an element that was never opened.`, line: 1, column: 1 } };
      }
      if (open.name !== token.name) {
        return {
          valid: false,
          issue: { message: `</${token.name}> does not match the open element <${open.name}>.`, line: 1, column: 1 },
        };
      }
    }
  }

  if (stack.length > 0) {
    const unclosed = stack[stack.length - 1];
    return { valid: false, issue: { message: `<${unclosed.name}> is never closed.`, line: 1, column: 1 } };
  }
  if (!root) return { valid: false, issue: { message: "No root element found.", line: 1, column: 1 } };
  if (textOutsideRoot) return { valid: false, issue: { message: "Text appears after the root element.", line: 1, column: 1 } };

  return { valid: true, stats: { root, elements, attributes, comments, cdata, maxDepth } };
}

/* ------------------------------------------------------------------ */
/* Formatting                                                          */
/* ------------------------------------------------------------------ */

export interface FormatXmlOptions {
  indent?: number;
  /** Leave text nodes on the same line as their tag when they are short. */
  inlineText?: boolean;
}

function attributesOf(openTag: string): string {
  const inner = openTag.replace(/^<[^\s/>]+/, "").replace(/\/?>$/, "").trim();
  return inner ? ` ${inner}` : "";
}

export function formatXml(source: string, options: FormatXmlOptions = {}): string {
  const indent = " ".repeat(Math.max(1, options.indent ?? 2));
  const inlineText = options.inlineText ?? true;
  const { tokens, issue } = tokenize(source);
  if (issue) throw new Error(`${issue.message} (line ${issue.line}, column ${issue.column})`);

  const lines: string[] = [];
  const stack: string[] = [];
  let index = 0;

  const currentIndent = () => indent.repeat(stack.length);

  while (index < tokens.length) {
    const token = tokens[index];

    if (token.kind === "text") {
      const trimmed = token.text.trim();
      if (trimmed) lines.push(currentIndent() + trimmed);
      index += 1;
      continue;
    }

    if (token.kind === "open") {
      if (token.selfClosing) {
        lines.push(`${currentIndent()}<${token.name}${attributesOf(token.text)}/>`);
        index += 1;
        continue;
      }

      const next = tokens[index + 1];
      const afterNext = tokens[index + 2];
      const isSimplePair =
        inlineText &&
        next?.kind === "text" &&
        next.text.trim().length > 0 &&
        next.text.trim().length <= 80 &&
        !next.text.includes("\n") &&
        afterNext?.kind === "close" &&
        afterNext.name === token.name;

      if (isSimplePair) {
        lines.push(
          `${currentIndent()}<${token.name}${attributesOf(token.text)}>${next.text.trim()}</${token.name}>`,
        );
        index += 3;
        continue;
      }

      // Empty pair <a></a>
      if (next?.kind === "close" && next.name === token.name) {
        lines.push(`${currentIndent()}<${token.name}${attributesOf(token.text)}></${token.name}>`);
        index += 2;
        continue;
      }

      lines.push(`${currentIndent()}<${token.name}${attributesOf(token.text)}>`);
      stack.push(token.name);
      index += 1;
      continue;
    }

    if (token.kind === "close") {
      stack.pop();
      lines.push(`${currentIndent()}</${token.name}>`);
      index += 1;
      continue;
    }

    // Comments, CDATA, declarations and doctypes keep their own line.
    lines.push(currentIndent() + token.text.trim());
    index += 1;
  }

  return lines.join("\n");
}
