export function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export interface RegexMatch {
  index: number;
  length: number;
  value: string;
  groups: string[];
}

/** Run a global regex safely, guarding against zero-length match loops. */
export function collectMatches(pattern: string, flags: string, input: string): {
  matches: RegexMatch[];
  error?: string;
} {
  if (!pattern) return { matches: [] };
  try {
    const regex = new RegExp(pattern, flags.includes("g") ? flags : `${flags}g`);
    const matches: RegexMatch[] = [];
    let match: RegExpExecArray | null;
    let guard = 0;

    while ((match = regex.exec(input)) !== null) {
      matches.push({
        index: match.index,
        length: match[0].length,
        value: match[0],
        groups: match.slice(1),
      });
      if (match[0] === "") regex.lastIndex++;
      if (++guard > 5000) break;
    }
    return { matches };
  } catch (error) {
    return {
      matches: [],
      error: error instanceof Error ? error.message : "Invalid pattern",
    };
  }
}

export const REGEX_PRESETS: Array<{ label: string; pattern: string; flags: string; note: string }> = [
  { label: "Email address", pattern: "[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,}", flags: "gi", note: "Practical, not RFC-perfect" },
  { label: "URL", pattern: "https?://[\\w.-]+(?:/[^\\s]*)?", flags: "gi", note: "Matches http and https" },
  { label: "IPv4 address", pattern: "\\b(?:\\d{1,3}\\.){3}\\d{1,3}\\b", flags: "g", note: "Counts octets; does not validate 0–255" },
  { label: "Hex colour", pattern: "#(?:[0-9a-f]{3}|[0-9a-f]{6})\\b", flags: "gi", note: "3 or 6 digit hex" },
  { label: "HTML tag", pattern: "<\\/?[a-z][^>]*>", flags: "gi", note: "Simple tag matcher" },
  { label: "Number", pattern: "-?\\d+(?:\\.\\d+)?", flags: "g", note: "Integers and decimals" },
  { label: "Whitespace runs", pattern: "\\s{2,}", flags: "g", note: "Two or more spaces" },
  { label: "Date (YYYY-MM-DD)", pattern: "\\d{4}-\\d{2}-\\d{2}", flags: "g", note: "Format only" },
  { label: "UUID v4", pattern: "[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}", flags: "gi", note: "Version and variant aware" },
  { label: "Repeated word", pattern: "\\b(\\w+)\\s+\\1\\b", flags: "gi", note: "Backreference example" },
];

/** Split input into plain / matched segments for highlighting. */
export function highlightMatches(
  input: string,
  matches: RegexMatch[],
): Array<{ text: string; matched: boolean; group: number }> {
  const segments: Array<{ text: string; matched: boolean; group: number }> = [];
  let cursor = 0;
  matches.forEach((match, index) => {
    if (match.index > cursor) {
      segments.push({ text: input.slice(cursor, match.index), matched: false, group: index });
    }
    if (match.length > 0) {
      segments.push({ text: match.value, matched: true, group: index });
    }
    cursor = Math.max(cursor, match.index + match.length);
  });
  if (cursor < input.length) {
    segments.push({ text: input.slice(cursor), matched: false, group: -1 });
  }
  return segments;
}

/* ------------------------------------------------------------------ */
/* Pattern explainer                                                   */
/* ------------------------------------------------------------------ */

export interface RegexPart {
  token: string;
  label: string;
  detail?: string;
  depth: number;
}

const CLASS_NAMES: Record<string, string> = {
  d: "digit (0–9)",
  D: "any character except a digit",
  w: "word character (letter, digit or _)",
  W: "any character except a word character",
  s: "whitespace (space, tab, line break)",
  S: "any character except whitespace",
  b: "word boundary",
  B: "position that is not a word boundary",
  n: "line feed",
  r: "carriage return",
  t: "tab",
  f: "form feed",
  v: "vertical tab",
  0: "null character",
};

export interface RegexExplanation {
  parts: RegexPart[];
  error?: string;
  valid: boolean;
}

export function explainRegex(pattern: string, flags = ""): RegexExplanation {
  const parts: RegexPart[] = [];
  const push = (token: string, label: string, detail?: string, depth = 0) =>
    parts.push({ token, label, detail, depth });

  if (!pattern) return { parts: [], valid: false, error: "Enter a pattern to explain." };

  let depth = 0;
  let index = 0;

  while (index < pattern.length) {
    const char = pattern[index];

    if (char === "\\") {
      const escaped = pattern[index + 1];
      if (escaped === undefined) {
        return { parts, valid: false, error: "The pattern ends with a lone backslash." };
      }

      if (CLASS_NAMES[escaped]) {
        push(`\\${escaped}`, "Character class", CLASS_NAMES[escaped], depth);
        index += 2;
        continue;
      }
      if (/[1-9]/.test(escaped)) {
        push(`\\${escaped}`, "Backreference", `matches whatever group ${escaped} captured`, depth);
        index += 2;
        continue;
      }
      if (escaped === "x") {
        const hex = pattern.slice(index + 2, index + 4);
        push(pattern.slice(index, index + 4), "Character escape", `character U+${hex.toUpperCase().padStart(4, "0")}`, depth);
        index += 4;
        continue;
      }
      if (escaped === "u") {
        const braced = pattern[index + 2] === "{";
        const end = pattern.indexOf("}", index);
        const slice = braced && end !== -1 ? pattern.slice(index, end + 1) : pattern.slice(index, index + 6);
        push(slice, "Unicode escape", "a specific Unicode code point", depth);
        index = braced && end !== -1 ? end + 1 : index + 6;
        continue;
      }
      if (escaped === "p" || escaped === "P") {
        const end = pattern.indexOf("}", index);
        const slice = end === -1 ? pattern.slice(index) : pattern.slice(index, end + 1);
        push(slice, "Unicode property", `${escaped === "p" ? "has" : "does not have"} the property ${slice.replace(/\\[pP]\{|\}/g, "")}`, depth);
        index = end === -1 ? pattern.length : end + 1;
        continue;
      }
      if (escaped === "k") {
        const end = pattern.indexOf(">", index);
        const slice = end === -1 ? pattern.slice(index) : pattern.slice(index, end + 1);
        push(slice, "Named backreference", "matches the text captured by that named group", depth);
        index = end === -1 ? pattern.length : end + 1;
        continue;
      }
      push(`\\${escaped}`, "Escaped literal", `a literal “${escaped}” character`, depth);
      index += 2;
      continue;
    }

    if (char === "[") {
      let cursor = index + 1;
      let negated = false;
      if (pattern[cursor] === "^") {
        negated = true;
        cursor += 1;
      }
      let closed = false;
      while (cursor < pattern.length) {
        if (pattern[cursor] === "\\") {
          cursor += 2;
          continue;
        }
        if (pattern[cursor] === "]") {
          closed = true;
          break;
        }
        cursor += 1;
      }
      const token = pattern.slice(index, closed ? cursor + 1 : pattern.length);
      if (!closed) return { parts, valid: false, error: "A character class is never closed with ]." };
      const body = token.slice(negated ? 2 : 1, -1);
      const hasRanges = /\w-\w/.test(body);
      push(
        token,
        negated ? "Negated character class" : "Character class",
        `one character ${negated ? "that is not" : "that is"} ${body}${hasRanges ? " (ranges like a-z are accepted)" : ""}`,
        depth,
      );
      index = cursor + 1;
      continue;
    }

    if (char === "(") {
      if (pattern.startsWith("(?<=", index)) {
        push("(?<=", "Lookbehind (positive)", "the preceding text must match, but is not consumed", depth);
        depth += 1;
        index += 4;
        continue;
      }
      if (pattern.startsWith("(?<!", index)) {
        push("(?<!", "Lookbehind (negative)", "the preceding text must not match", depth);
        depth += 1;
        index += 4;
        continue;
      }
      if (pattern.startsWith("(?=", index)) {
        push("(?=", "Lookahead (positive)", "the following text must match, but is not consumed", depth);
        depth += 1;
        index += 3;
        continue;
      }
      if (pattern.startsWith("(?!", index)) {
        push("(?!", "Lookahead (negative)", "the following text must not match", depth);
        depth += 1;
        index += 3;
        continue;
      }
      if (pattern.startsWith("(?:", index)) {
        push("(?:", "Non-capturing group", "groups alternatives without capturing", depth);
        depth += 1;
        index += 3;
        continue;
      }
      if (pattern.startsWith("(?<", index)) {
        const end = pattern.indexOf(">", index);
        if (end === -1) return { parts, valid: false, error: "A named group is missing its closing >." };
        push(pattern.slice(index, end + 1), "Named capture group", "captures the match under that name", depth);
        depth += 1;
        index = end + 1;
        continue;
      }
      push("(", "Capture group", "captures the matched text for backreferences or extraction", depth);
      depth += 1;
      index += 1;
      continue;
    }

    if (char === ")") {
      depth = Math.max(0, depth - 1);
      push(")", "End of group", undefined, depth);
      index += 1;
      continue;
    }

    if (char === "|") {
      push("|", "Alternation", "matches either the expression before or after it", depth);
      index += 1;
      continue;
    }

    if (char === "^") {
      push("^", "Start anchor", "matches the beginning of the string, or of a line with the m flag", depth);
      index += 1;
      continue;
    }

    if (char === "$") {
      push("$", "End anchor", "matches the end of the string, or of a line with the m flag", depth);
      index += 1;
      continue;
    }

    if (char === ".") {
      push(".", "Any character", "any character except a line break (unless the s flag is set)", depth);
      index += 1;
      continue;
    }

    if (char === "*" || char === "+" || char === "?") {
      const lazy = pattern[index + 1] === "?";
      const possessive = pattern[index + 1] === "+";
      const meaning =
        char === "*" ? "zero or more times" : char === "+" ? "one or more times" : "zero or one time";
      push(
        pattern.slice(index, index + 1 + (lazy || possessive ? 1 : 0)),
        "Quantifier",
        `${meaning}${lazy ? ", as few as possible (lazy)" : possessive ? ", greedily and without backtracking" : " (greedy)"}`,
        depth,
      );
      index += 2;
      continue;
    }

    if (char === "{") {
      const end = pattern.indexOf("}", index);
      if (end === -1) {
        push("{", "Literal", "a “{” character", depth);
        index += 1;
        continue;
      }
      const token = pattern.slice(index, end + 1);
      push(token, "Repetition", describeRepetition(token), depth);
      index = end + 1;
      continue;
    }

    push(char, describeLiteral(char), undefined, depth);
    index += 1;
  }

  try {
    new RegExp(pattern, flags);
  } catch (error) {
    return {
      parts,
      valid: false,
      error: error instanceof Error ? error.message : "Invalid regular expression",
    };
  }

  return { parts, valid: true };
}

function describeRepetition(token: string): string {
  const inner = token.slice(1, -1);
  if (inner.endsWith(",")) return `at least ${inner.slice(0, -1)} times`;
  if (inner.includes(",")) {
    const [min, max] = inner.split(",");
    return `between ${min} and ${max} times`;
  }
  return `exactly ${inner} times`;
}

function describeLiteral(char: string): string {
  if (char === " ") return "a literal space";
  if (char === ",") return "a literal comma";
  if (char === "-") return "a literal hyphen";
  return `a literal “${char}” character`;
}

export const REGEX_CHEATSHEET: Array<{ token: string; meaning: string }> = [
  { token: ".", meaning: "any character except a newline" },
  { token: "\\d", meaning: "a digit" },
  { token: "\\w", meaning: "a letter, digit or underscore" },
  { token: "\\s", meaning: "whitespace" },
  { token: "[abc]", meaning: "one of a, b or c" },
  { token: "[^abc]", meaning: "anything except a, b or c" },
  { token: "^", meaning: "start of string or line" },
  { token: "$", meaning: "end of string or line" },
  { token: "*", meaning: "zero or more" },
  { token: "+", meaning: "one or more" },
  { token: "?", meaning: "zero or one" },
  { token: "{2,5}", meaning: "between two and five times" },
  { token: "(…)", meaning: "capturing group" },
  { token: "(?:…)", meaning: "non-capturing group" },
  { token: "(?<name>…)", meaning: "named capture group" },
  { token: "(?=…)", meaning: "positive lookahead" },
  { token: "(?<=…)", meaning: "positive lookbehind" },
  { token: "a|b", meaning: "a or b" },
];
