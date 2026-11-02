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
