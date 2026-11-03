export interface TextStats {
  words: number;
  characters: number;
  charactersNoSpaces: number;
  sentences: number;
  paragraphs: number;
  lines: number;
  readingSeconds: number;
  speakingSeconds: number;
  longestWord: number;
  averageWordLength: number;
}

export const WORDS_PER_MINUTE_READING = 225;
export const WORDS_PER_MINUTE_SPEAKING = 130;

/** Split text into words using Unicode-aware whitespace rules. */
export function words(text: string): string[] {
  return text
    .replace(/[\u00A0\u2007\u202F]/g, " ")
    .trim()
    .split(/\s+/)
    .filter((token) => /[\p{L}\p{N}]/u.test(token));
}

export function countText(text: string): TextStats {
  const wordList = words(text);
  const clean = text.replace(/\r\n/g, "\n");
  const nonEmptyLines = clean.split("\n").filter((line) => line.trim() !== "");
  const sentences = clean
    .replace(/([.!?…])["'”’)\]]*/g, "$1|")
    .split("|")
    .filter((sentence) => /[\p{L}\p{N}]/u.test(sentence)).length;

  const paragraphBlocks = clean
    .split(/\n{2,}/)
    .map((block) => block.trim())
    .filter((block) => block !== "");

  const charactersNoSpaces = clean.replace(/\s/g, "").length;
  const wordLengths = wordList.map((word) => [...word].length);
  const totalLetters = wordLengths.reduce((sum, length) => sum + length, 0);

  return {
    words: wordList.length,
    characters: clean.length,
    charactersNoSpaces,
    sentences,
    paragraphs: paragraphBlocks.length || (clean.trim() ? 1 : 0),
    lines: nonEmptyLines.length,
    readingSeconds: Math.ceil((wordList.length / WORDS_PER_MINUTE_READING) * 60),
    speakingSeconds: Math.ceil((wordList.length / WORDS_PER_MINUTE_SPEAKING) * 60),
    longestWord: wordLengths.length ? Math.max(...wordLengths) : 0,
    averageWordLength: wordList.length ? totalLetters / wordList.length : 0,
  };
}

const STOP_WORDS = new Set([
  "the","a","an","and","or","but","if","then","than","that","this","these","those","of","to","in","on","at","by","for","with","from","as","is","are","was","were","be","been","being","it","its","it's","i","you","he","she","we","they","them","his","her","their","our","my","me","us","do","does","did","not","no","so","up","out","about","into","over","after","also","can","will","just","have","has","had","would","could","should","may","might","must","there","here","when","where","which","who","whom","what","why","how",
]);

export function keywordFrequency(
  text: string,
  limit = 10,
  options: { includeStopWords?: boolean; ngram?: 1 | 2 | 3 } = {},
) {
  const { includeStopWords = false, ngram = 1 } = options;
  const tokens = words(text.toLowerCase()).map((token) =>
    token.replace(/^[^\p{L}\p{N}]+|[^\p{L}\p{N}]+$/gu, ""),
  ).filter(Boolean);

  const filtered = includeStopWords ? tokens : tokens.filter((token) => !STOP_WORDS.has(token));
  if (filtered.length === 0) return [];

  const counts = new Map<string, number>();
  for (let i = 0; i <= filtered.length - ngram; i++) {
    const gram = filtered.slice(i, i + ngram).join(" ");
    counts.set(gram, (counts.get(gram) ?? 0) + 1);
  }

  // Density is relative to the whole text, not only the filtered tokens, so a
  // stop-word list does not silently inflate the percentage.
  const total = Math.max(tokens.length, 1);
  return [...counts.entries()]
    .map(([term, count]) => ({ term, count, density: (count / total) * 100 }))
    .sort((a, b) => b.count - a.count || a.term.localeCompare(b.term))
    .slice(0, limit);
}

export type CaseStyle =
  | "upper"
  | "lower"
  | "title"
  | "sentence"
  | "capitalized"
  | "alternating"
  | "inverse"
  | "camel"
  | "pascal"
  | "snake"
  | "kebab"
  | "constant";

const SMALL_WORDS = new Set([
  "a","an","and","as","at","but","by","for","in","nor","of","on","or","per","the","to","up","vs","via",
]);

export function splitWords(text: string): string[] {
  return text
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .split(/[^\p{L}\p{N}]+/u)
    .filter(Boolean);
}

export function toCase(text: string, style: CaseStyle): string {
  switch (style) {
    case "upper":
      return text.toUpperCase();
    case "lower":
      return text.toLowerCase();
    case "title":
      return text.replace(/\p{L}[\p{L}'’]*/gu, (word, offset: number) => {
        const lower = word.toLowerCase();
        const isEdge = offset === 0 || /^[\s"'“‘(\[]*$/.test(text.slice(Math.max(0, offset - 2), offset));
        if (!isEdge && SMALL_WORDS.has(lower)) return lower;
        return lower.charAt(0).toUpperCase() + lower.slice(1);
      });
    case "sentence":
      return text
        .toLowerCase()
        .replace(/(^\s*\p{L})|([.!?]\s+\p{L})/gu, (match) => match.toUpperCase());
    case "capitalized":
      return text.replace(/(^|\s)(\p{L})/gu, (_match, space: string, letter: string) =>
        space + letter.toUpperCase(),
      );
    case "alternating": {
      let index = 0;
      return [...text]
        .map((char) => {
          if (!/\p{L}/u.test(char)) return char;
          const next = index % 2 === 0 ? char.toLowerCase() : char.toUpperCase();
          index++;
          return next;
        })
        .join("");
    }
    case "inverse":
      return [...text]
        .map((char) =>
          char === char.toLowerCase()
            ? char.toUpperCase()
            : char === char.toUpperCase()
              ? char.toLowerCase()
              : char,
        )
        .join("");
    case "camel": {
      const parts = splitWords(text).map((word) => word.toLowerCase());
      return parts
        .map((word, index) =>
          index === 0 ? word : word.charAt(0).toUpperCase() + word.slice(1),
        )
        .join("");
    }
    case "pascal":
      return splitWords(text)
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join("");
    case "snake":
      return splitWords(text)
        .map((word) => word.toLowerCase())
        .join("_");
    case "kebab":
      return splitWords(text)
        .map((word) => word.toLowerCase())
        .join("-");
    case "constant":
      return splitWords(text)
        .map((word) => word.toUpperCase())
        .join("_");
    default:
      return text;
  }
}

export function dedupeLines(
  input: string,
  options: { ignoreCase?: boolean; trim?: boolean; dropEmpty?: boolean; keep?: "first" | "last" } = {},
): { output: string; removed: number; kept: number } {
  const { ignoreCase = false, trim = false, dropEmpty = false, keep = "first" } = options;
  const lines = input.replace(/\r\n/g, "\n").split("\n");

  const normalise = (line: string) => {
    let value = trim ? line.trim() : line;
    if (ignoreCase) value = value.toLowerCase();
    return value;
  };

  if (keep === "last") {
    const lastIndex = new Map<string, number>();
    lines.forEach((line, index) => {
      if (dropEmpty && line.trim() === "") return;
      lastIndex.set(normalise(line), index);
    });
    const output = lines.filter((line, index) => {
      if (dropEmpty && line.trim() === "") return false;
      return lastIndex.get(normalise(line)) === index;
    });
    return { output: output.join("\n"), removed: lines.length - output.length, kept: output.length };
  }

  const seen = new Set<string>();
  const output: string[] = [];
  for (const line of lines) {
    if (dropEmpty && line.trim() === "") continue;
    const key = normalise(line);
    if (seen.has(key)) continue;
    seen.add(key);
    output.push(trim ? line.trim() : line);
  }
  return { output: output.join("\n"), removed: lines.length - output.length, kept: output.length };
}

export type SortMode = "az" | "za" | "length-asc" | "length-desc";

export function sortLines(
  input: string,
  mode: SortMode = "az",
  options: { caseSensitive?: boolean; numeric?: boolean; unique?: boolean } = {},
): { output: string; count: number } {
  const { caseSensitive = false, numeric = true, unique = false } = options;
  let lines = input.replace(/\r\n/g, "\n").split("\n");

  if (unique) {
    const seen = new Set<string>();
    lines = lines.filter((line) => {
      const key = caseSensitive ? line : line.toLowerCase();
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }

  const collator = new Intl.Collator("en", {
    numeric,
    sensitivity: caseSensitive ? "variant" : "base",
  });

  lines.sort((a, b) => {
    switch (mode) {
      case "za":
        return collator.compare(b, a);
      case "length-asc":
        return a.length - b.length || collator.compare(a, b);
      case "length-desc":
        return b.length - a.length || collator.compare(a, b);
      default:
        return collator.compare(a, b);
    }
  });

  return { output: lines.join("\n"), count: lines.length };
}

export interface CleanOptions {
  collapseSpaces?: boolean;
  trimLines?: boolean;
  removeBlankLines?: boolean;
  removeLineBreaks?: boolean;
  normaliseUnicodeSpaces?: boolean;
}

export function cleanWhitespace(input: string, options: CleanOptions = {}): string {
  const {
    collapseSpaces = true,
    trimLines = true,
    removeBlankLines = false,
    removeLineBreaks = false,
    normaliseUnicodeSpaces = true,
  } = options;

  let text = input.replace(/\r\n?/g, "\n");
  if (normaliseUnicodeSpaces) {
    text = text.replace(/[\u00A0\u1680\u2000-\u200A\u202F\u205F\u3000]/g, " ");
  }
  if (collapseSpaces) {
    text = text.replace(/[ \t]{2,}/g, " ").replace(/\t/g, " ");
  }
  if (removeLineBreaks) {
    text = text.replace(/\n+/g, " ");
  } else {
    if (trimLines) text = text.split("\n").map((line) => line.trim()).join("\n");
    if (removeBlankLines) text = text.split("\n").filter((line) => line.trim() !== "").join("\n");
  }
  return text.trim();
}

export function slugify(
  input: string,
  options: { separator?: "-" | "_"; maxLength?: number; stopWords?: boolean } = {},
): string {
  const { separator = "-", maxLength = 80, stopWords = false } = options;
  const stop = new Set(["a", "an", "and", "the", "of", "to", "in", "for", "on", "with", "at", "by", "or"]);

  let slug = input
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[’']/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  let parts = slug.split("-").filter(Boolean);
  if (stopWords) {
    const filtered = parts.filter((part) => !stop.has(part));
    if (filtered.length) parts = filtered;
  }

  slug = parts.join(separator);

  if (slug.length > maxLength) {
    slug = slug.slice(0, maxLength);
    slug = slug.replace(new RegExp(`${separator}[^${separator}]*$`), "");
  }
  return slug;
}

export function reverseText(text: string, mode: "characters" | "words" | "lines"): string {
  if (mode === "words") {
    return text
      .split(/(\s+)/)
      .filter((token) => token.trim() !== "")
      .reverse()
      .join(" ");
  }
  if (mode === "lines") {
    return text.split("\n").reverse().join("\n");
  }

  const segmenter =
    typeof Intl !== "undefined" && "Segmenter" in Intl
      ? new Intl.Segmenter(undefined, { granularity: "grapheme" })
      : null;

  if (segmenter) {
    return [...segmenter.segment(text)].map((part) => part.segment).reverse().join("");
  }
  return [...text].reverse().join("");
}

const LOREM_WORDS = [
  "lorem","ipsum","dolor","sit","amet","consectetur","adipiscing","elit","sed","do","eiusmod",
  "tempor","incididunt","ut","labore","et","dolore","magna","aliqua","enim","ad","minim","veniam",
  "quis","nostrud","exercitation","ullamco","laboris","nisi","aliquip","ex","ea","commodo","consequat",
  "duis","aute","irure","in","reprehenderit","voluptate","velit","esse","cillum","eu","fugiat","nulla",
  "pariatur","excepteur","sint","occaecat","cupidatat","non","proident","sunt","culpa","qui","officia",
  "deserunt","mollit","anim","id","est","laborum",
];

const LOREM_OPENING = "lorem ipsum dolor sit amet consectetur adipiscing elit".split(" ");

/** Deterministic pseudo-random generator so seeds reproduce the same output. */
function mulberry32(seed: number) {
  let a = seed >>> 0;
  return function random() {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function generateLorem(
  amount: number,
  unit: "paragraphs" | "sentences" | "words",
  options: { seed?: number; classicOpening?: boolean } = {},
): string {
  const { seed = 1, classicOpening = true } = options;
  const random = mulberry32(seed);
  const pick = () => LOREM_WORDS[Math.floor(random() * LOREM_WORDS.length)];
  const sentence = (length: number) => {
    const words = Array.from({ length }, pick);
    words[0] = words[0].charAt(0).toUpperCase() + words[0].slice(1);
    return `${words.join(" ")}.`;
  };

  if (unit === "words") {
    const base = classicOpening ? [...LOREM_OPENING] : [];
    const count = Math.max(1, Math.floor(amount));
    const output = [...base, ...Array.from({ length: Math.max(0, count - base.length) }, pick)]
      .slice(0, count)
      .join(" ");
    return output.charAt(0).toUpperCase() + output.slice(1) + ".";
  }

  if (unit === "sentences") {
    const sentences = Array.from({ length: Math.max(1, Math.floor(amount)) }, () =>
      sentence(8 + Math.floor(random() * 13)),
    );
    if (classicOpening) {
      sentences[0] = "Lorem ipsum dolor sit amet, consectetur adipiscing elit.";
    }
    return sentences.join(" ");
  }

  const paragraphs = Array.from({ length: Math.max(1, Math.floor(amount)) }, () => {
    const count = 3 + Math.floor(random() * 4);
    return Array.from({ length: count }, () => sentence(8 + Math.floor(random() * 13))).join(" ");
  });
  if (classicOpening) {
    paragraphs[0] =
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit. " + paragraphs[0];
  }
  return paragraphs.join("\n\n");
}

/* ------------------------------------------------------------------ */
/* Counters used by the dedicated counting tools                       */
/* ------------------------------------------------------------------ */

export type SentenceInfo = { text: string; words: number; characters: number };

/** Sentence-level detail: length of each sentence plus summary figures. */
export function sentenceStats(text: string): {
  sentences: SentenceInfo[];
  averageWords: number;
  longest: SentenceInfo | null;
  shortest: SentenceInfo | null;
} {
  const clean = text.replace(/\r\n/g, "\n").replace(/\s+/g, " ").trim();
  if (!clean) {
    return { sentences: [], averageWords: 0, longest: null, shortest: null };
  }

  const parts = clean
    .replace(/([.!?…]+["'”’)\]]*)/g, "$1|")
    .split("|")
    .map((part) => part.trim())
    .filter((part) => /[\p{L}\p{N}]/u.test(part));

  const sentences = parts.map((part) => ({
    text: part,
    words: words(part).length,
    characters: [...part].length,
  }));

  const total = sentences.reduce((sum, item) => sum + item.words, 0);
  const sorted = [...sentences].sort((a, b) => b.words - a.words);

  return {
    sentences,
    averageWords: sentences.length ? total / sentences.length : 0,
    longest: sorted[0] ?? null,
    shortest: sorted.length ? sorted[sorted.length - 1] : null,
  };
}

export type ParagraphInfo = { text: string; words: number; sentences: number };

/** Paragraph-level detail, split on blank lines. */
export function paragraphStats(text: string): {
  paragraphs: ParagraphInfo[];
  averageWords: number;
} {
  const blocks = text
    .replace(/\r\n/g, "\n")
    .split(/\n{2,}/)
    .map((block) => block.trim())
    .filter(Boolean);

  const paragraphs = blocks.map((block) => ({
    text: block,
    words: words(block).length,
    sentences: sentenceStats(block).sentences.length,
  }));

  const total = paragraphs.reduce((sum, item) => sum + item.words, 0);

  return {
    paragraphs,
    averageWords: paragraphs.length ? total / paragraphs.length : 0,
  };
}

/** Reading time with a caller-supplied pace (words per minute). */
export function timeToRead(text: string, wordsPerMinute = WORDS_PER_MINUTE_READING): number {
  const count = words(text).length;
  if (!wordsPerMinute || wordsPerMinute <= 0) return 0;
  return Math.ceil((count / wordsPerMinute) * 60);
}

/** Speaking time with a caller-supplied pace (words per minute). */
export function timeToSpeak(text: string, wordsPerMinute = WORDS_PER_MINUTE_SPEAKING): number {
  return timeToRead(text, wordsPerMinute);
}

/* ------------------------------------------------------------------ */
/* Line handling                                                       */
/* ------------------------------------------------------------------ */

export type LineBreakMode = "space" | "nothing" | "double" | "single";

/** Collapse (or normalise) line breaks between paragraphs and wrapped lines. */
export function removeLineBreaks(input: string, mode: LineBreakMode = "space"): string {
  const normalised = input.replace(/\r\n/g, "\n");
  if (!normalised.trim()) return "";

  if (mode === "nothing") return normalised.replace(/\n+/g, "");
  if (mode === "single") return normalised.replace(/\n+/g, " ");
  if (mode === "double") {
    // Keep paragraph breaks, collapse single line breaks inside a paragraph.
    return normalised
      .split(/\n{2,}/)
      .map((block) => block.replace(/\n/g, " ").replace(/[ \t]+/g, " ").trim())
      .join("\n\n");
  }
  return normalised.replace(/\n+/g, " ").replace(/[ \t]+/g, " ").trim();
}

/* ------------------------------------------------------------------ */
/* Slugs back to readable text                                         */
/* ------------------------------------------------------------------ */

/** Turn a URL slug back into readable text ("my-first-post" → "My First Post"). */
export function slugToText(
  slug: string,
  options: { style?: "title" | "sentence" | "lower"; stripNumbers?: boolean } = {},
): string {
  const style = options.style ?? "title";
  // A full URL or path is reduced to its last meaningful segment, so
  // "https://site.com/blog/2024/07/my-post" reads as "My Post" rather than
  // "Blog My Post".
  const candidate = slug
    .trim()
    .replace(/^[a-z]+:\/\//i, "")
    .replace(/[?#].*$/, "");
  const segments = candidate
    .split("/")
    .map((segment) => segment.trim())
    .filter((segment) => segment.length > 0 && !/^(?:\d+|www\.[^/]*|[a-z0-9-]+\.(?:com|net|org|io|dev|co|app|ai))$/i.test(segment));

  const cleaned = (segments.length > 0 ? segments[segments.length - 1] : candidate)
    .replace(/[/_+#?&=]+/g, "-")
    .replace(/[^\p{L}\p{N}-]+/gu, "")
    .replace(/-{2,}/g, "-")
    .replace(/^-|-$/g, "");

  if (!cleaned) return "";

  const wordsOut = cleaned
    .split("-")
    .filter((part) => part.length > 0 && (!options.stripNumbers || !/^\d+$/.test(part)));

  if (style === "lower") return wordsOut.join(" ").toLowerCase();

  const joined = wordsOut.join(" ");
  if (style === "sentence") {
    const lower = joined.toLowerCase();
    return lower.charAt(0).toUpperCase() + lower.slice(1);
  }
  return joined.replace(/\b[\p{L}]/gu, (char) => char.toUpperCase());
}

/* ------------------------------------------------------------------ */
/* Random text                                                         */
/* ------------------------------------------------------------------ */

const RANDOM_WORD_BANK = [
  "amber","basin","cobalt","delta","ember","fable","garnet","harbor","indigo","juniper",
  "kestrel","lantern","meadow","nectar","orchid","pebble","quartz","ripple","summit","tundra",
  "umber","velvet","willow","xenon","yarrow","zephyr","anchor","bramble","cinder","dune",
  "echo","fjord","glade","hollow","island","jasper","kindle","lumen","marble","nimbus",
  "ocean","prairie","quiver","ridge","saffron","thistle","unity","vessel","wander","yonder",
];

/** Generate random filler text (distinct from lorem ipsum). */
export function randomText(options: {
  paragraphs?: number;
  sentencesPerParagraph?: number;
  seed?: number;
  capitalise?: boolean;
} = {}): string {
  const paragraphs = Math.min(Math.max(options.paragraphs ?? 2, 1), 20);
  const perParagraph = Math.min(Math.max(options.sentencesPerParagraph ?? 3, 1), 12);
  const random = mulberry32(options.seed ?? Math.floor(Math.random() * 1e9));
  const capitalise = options.capitalise ?? true;

  const sentence = () => {
    const length = 6 + Math.floor(random() * 9);
    const picked: string[] = [];
    for (let index = 0; index < length; index += 1) {
      picked.push(RANDOM_WORD_BANK[Math.floor(random() * RANDOM_WORD_BANK.length)]);
    }
    const text = picked.join(" ");
    return `${capitalise ? text.charAt(0).toUpperCase() + text.slice(1) : text}.`;
  };

  return Array.from({ length: paragraphs }, () =>
    Array.from({ length: perParagraph }, sentence).join(" "),
  ).join("\n\n");
}

/* ------------------------------------------------------------------ */
/* Unicode inspection                                                  */
/* ------------------------------------------------------------------ */

export type CharInfo = {
  char: string;
  codePoint: number;
  hex: string;
  decimal: number;
  utf8: string;
  utf16: string;
  kind: string;
};

function describeChar(char: string): string {
  if (/\p{Extended_Pictographic}/u.test(char)) return "emoji";
  if (/\p{Lu}/u.test(char)) return "uppercase letter";
  if (/\p{Ll}/u.test(char)) return "lowercase letter";
  if (/\p{Lt}/u.test(char)) return "titlecase letter";
  if (/\p{Nd}/u.test(char)) return "decimal digit";
  if (/\p{N}/u.test(char)) return "number";
  if (/\p{P}/u.test(char)) return "punctuation";
  if (/\p{S}/u.test(char)) return "symbol";
  if (/\p{Zs}/u.test(char)) return "space";
  if (/\p{Cc}/u.test(char)) return "control";
  if (/\p{M}/u.test(char)) return "combining mark";
  return "other";
}

/** Code point, UTF-8 bytes, UTF-16 units and a category for each character. */
export function inspectCharacters(text: string, limit = 200): CharInfo[] {
  return [...text]
    .slice(0, limit)
    .map((char) => {
      const codePoint = char.codePointAt(0) ?? 0;
      const bytes = [...new TextEncoder().encode(char)]
        .map((byte) => byte.toString(16).toUpperCase().padStart(2, "0"))
        .join(" ");
      const units = Array.from({ length: char.length }, (_, index) =>
        char.charCodeAt(index).toString(16).toUpperCase().padStart(4, "0"),
      ).join(" ");

      return {
        char,
        codePoint,
        hex: `U+${codePoint.toString(16).toUpperCase().padStart(4, "0")}`,
        decimal: codePoint,
        utf8: bytes,
        utf16: units,
        kind: describeChar(char),
      };
    });
}
