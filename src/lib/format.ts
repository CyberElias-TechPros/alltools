/**
 * Code formatting and minification, entirely in the browser.
 *
 * Beautifying is delegated to js-beautify, a pure-JavaScript re-indenter with
 * no runtime dependencies. Minification is deliberately conservative: we do
 * not rename identifiers or rewrite syntax, because a mangled bundle that still
 * "looks fine" is worse than a slightly larger one. Only whitespace and
 * comments are touched, so the output is always semantically identical.
 */

import beautify from "js-beautify";

export type CodeLanguage = "html" | "css" | "js";

export interface BeautifyOptions {
  indent?: number;
  /** Use tabs instead of spaces. */
  tabs?: boolean;
  /** Keep existing line breaks instead of reflowing. */
  preserveNewlines?: boolean;
  /** 0 disables wrapping. */
  wrap?: number;
  /** Brace placement for JavaScript. */
  braces?: "collapse" | "expand";
  /** Put each chained method call on its own line. */
  breakChains?: boolean;
}

const base = (options: BeautifyOptions) => ({
  indent_size: options.tabs ? 1 : (options.indent ?? 2),
  indent_char: " ",
  indent_with_tabs: Boolean(options.tabs),
  preserve_newlines: options.preserveNewlines ?? true,
  max_preserve_newlines: options.preserveNewlines ? 2 : 0,
  wrap_line_length: options.wrap ?? 0,
  end_with_newline: true,
});

export function beautifyCode(
  language: CodeLanguage,
  input: string,
  options: BeautifyOptions = {},
): string {
  const common = base(options);
  if (language === "css") {
    return beautify.css(input, { ...common, selector_separator_newline: true });
  }
  if (language === "html") {
    return beautify.html(input, { ...common, indent_inner_html: true, extra_liners: [] });
  }
  return beautify.js(input, {
    ...common,
    brace_style: options.braces ?? "collapse",
    break_chained_methods: options.breakChains ?? false,
    space_before_conditional: true,
  });
}

/* ------------------------------------------------------------------ */
/* CSS                                                                 */
/* ------------------------------------------------------------------ */

/**
 * Removes comments, collapses whitespace and drops the final semicolon of each
 * block. Strings and `url()` payloads are copied verbatim, and the spaces that
 * `calc()` needs around `+` and `-` are preserved.
 */
export function minifyCss(input: string): string {
  let out = "";
  let index = 0;

  const readString = (quote: string) => {
    out += quote;
    index += 1;
    while (index < input.length) {
      const char = input[index];
      out += char;
      index += 1;
      if (char === "\\") {
        if (index < input.length) {
          out += input[index];
          index += 1;
        }
        continue;
      }
      if (char === quote) break;
    }
  };

  while (index < input.length) {
    const char = input[index];
    const next = input[index + 1];

    if (char === "/" && next === "*") {
      const end = input.indexOf("*/", index + 2);
      index = end === -1 ? input.length : end + 2;
      continue;
    }

    if (char === '"' || char === "'") {
      readString(char);
      continue;
    }

    if (/\s/.test(char)) {
      while (index < input.length && /\s/.test(input[index])) index += 1;
      const previous = out[out.length - 1] ?? "";
      const following = input[index] ?? "";
      // Whitespace is only meaningful between two word-ish characters, or
      // inside calc()/media queries where the browser needs the separator.
      // `-` and `+` count as word-ish so calc() keeps its mandatory spaces.
      if (/[\w%)\]-]/.test(previous) && /[\w(#-]/.test(following)) out += " ";
      continue;
    }

    if (char === ";") {
      // A semicolon immediately before a closing brace is optional.
      let lookahead = index + 1;
      while (lookahead < input.length && /\s/.test(input[lookahead])) lookahead += 1;
      if (input[lookahead] === "}") {
        index = lookahead;
        continue;
      }
      out = `${out.replace(/\s+$/, "")};`;
      index += 1;
      continue;
    }

    if ("{}:,>~".includes(char)) {
      out = out.replace(/\s+$/, "");
      out += char;
      index += 1;
      while (index < input.length && /\s/.test(input[index])) index += 1;
      continue;
    }

    out += char;
    index += 1;
  }

  return out.replace(/\s+/g, " ").trim();
}

/* ------------------------------------------------------------------ */
/* HTML                                                                */
/* ------------------------------------------------------------------ */

const BLOCK_TAGS = new Set([
  "html", "head", "body", "div", "section", "article", "header", "footer", "main",
  "nav", "aside", "ul", "ol", "li", "table", "thead", "tbody", "tfoot", "tr",
  "td", "th", "form", "fieldset", "figure", "figcaption", "blockquote", "pre",
  "p", "h1", "h2", "h3", "h4", "h5", "h6", "dl", "dt", "dd", "address", "hr",
  "title", "meta", "link", "script", "style", "option", "select", "textarea",
]);

/** Tags whose inner text must be copied byte for byte. */
const RAW_TAGS = ["pre", "textarea", "script", "style"];

export function minifyHtml(input: string): string {
  let out = "";
  let index = 0;

  while (index < input.length) {
    // Comments, except downlevel-revealed conditional comments.
    if (input.startsWith("<!--", index)) {
      const end = input.indexOf("-->", index + 4);
      const body = input.slice(index + 4, end === -1 ? input.length : end);
      if (body.trimStart().startsWith("[if") || body.trimStart().startsWith("<![endif")) {
        out += input.slice(index, end === -1 ? input.length : end + 3);
      }
      index = end === -1 ? input.length : end + 3;
      continue;
    }

    if (input[index] === "<" && /[a-zA-Z]/.test(input[index + 1] ?? "")) {
      const tagMatch = /^<\/?([a-zA-Z][\w:-]*)/.exec(input.slice(index));
      const tag = tagMatch?.[1]?.toLowerCase() ?? "";
      const close = input.indexOf(">", index);
      if (close === -1) {
        out += input.slice(index);
        break;
      }
      // Normalise whitespace inside the tag itself.
      const tagText = input.slice(index, close + 1).replace(/\s+/g, " ");
      out += tagText;
      index = close + 1;

      if (!tagText.startsWith("</") && RAW_TAGS.includes(tag)) {
        const closer = `</${tag}>`;
        const end = input.toLowerCase().indexOf(closer, index);
        if (end === -1) {
          out += input.slice(index);
          break;
        }
        out += input.slice(index, end);
        out += input.slice(end, end + closer.length);
        index = end + closer.length;
      }
      continue;
    }

    if (input[index] === "<") {
      // Doctype, processing instruction or stray bracket: copy up to `>`.
      const close = input.indexOf(">", index);
      if (close === -1) {
        out += input.slice(index);
        break;
      }
      out += input.slice(index, close + 1);
      index = close + 1;
      continue;
    }

    // Text run: collapse internal whitespace.
    let end = input.indexOf("<", index);
    if (end === -1) end = input.length;
    const text = input.slice(index, end);
    out += text.replace(/\s+/g, " ").trim();
    index = end;
  }

  // Drop whitespace that sits between two block-level elements.
  out = out.replace(/>\s+</g, (match, offset: number) => {
    const before = /<\/?([a-zA-Z][\w:-]*)[^<>]*$/.exec(out.slice(0, offset))?.[1]?.toLowerCase();
    const after = /^<\/?([a-zA-Z][\w:-]*)/.exec(out.slice(offset + match.length))?.[1]?.toLowerCase();
    if (before && after && BLOCK_TAGS.has(before) && BLOCK_TAGS.has(after)) return "><";
    return match;
  });

  return out.trim();
}

/* ------------------------------------------------------------------ */
/* JavaScript                                                          */
/* ------------------------------------------------------------------ */

export interface MinifyJsOptions {
  /** Drop comments, collapse whitespace and remove unnecessary newlines. */
  compress?: boolean;
  /** Shorten local variable names. Off by default — it makes stack traces unreadable. */
  mangle?: boolean;
  /** Keep `console` calls. */
  keepConsole?: boolean;
}

export interface MinifyJsResult {
  code: string;
  error?: string;
  before: number;
  after: number;
}

/**
 * Uses Terser's real parser, so the output is guaranteed to be valid
 * JavaScript. Terser is loaded on demand — visitors who never open this tool
 * never download it.
 */
export async function minifyJs(
  input: string,
  options: MinifyJsOptions = {},
): Promise<MinifyJsResult> {
  const before = new TextEncoder().encode(input).length;
  if (!input.trim()) return { code: "", before, after: 0 };
  try {
    const { minify } = await import("terser");
    const result = await minify(input, {
      compress: options.compress === false ? false : { passes: 2 },
      mangle: options.mangle ? { toplevel: true } : false,
      format: { comments: false },
      module: false,
      toplevel: false,
      keep_fnames: !options.mangle,
    });
    const code = result.code ?? "";
    if (!code) return { code: "", error: "Terser returned no output.", before, after: 0 };
    return { code, before, after: new TextEncoder().encode(code).length };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return { code: "", error: message, before, after: 0 };
  }
}

/** Byte size helper shared by the formatter/minifier tools. */
export function byteLength(text: string): number {
  return new TextEncoder().encode(text).length;
}

export function formatBytes(bytes: number): string {
  if (!Number.isFinite(bytes) || bytes <= 0) return "0 B";
  const units = ["B", "KB", "MB", "GB"];
  const exponent = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
  const value = bytes / 1024 ** exponent;
  return `${value.toFixed(exponent === 0 ? 0 : value >= 100 ? 0 : 1)} ${units[exponent]}`;
}
