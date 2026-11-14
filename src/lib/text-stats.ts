/**
 * Text statistics used by the homepage demo (and safe to reuse in tools).
 *
 * Kept in `src/lib` so the numbers are testable without a DOM: the component
 * only renders what these functions return.
 */

/** Standard silent-reading speed used by the reading-time convention. */
export const WORDS_PER_MINUTE = 220;

export type TextStats = {
  /** Words in the text (whitespace-delimited, trimmed). */
  words: number;
  /** Every character, spaces included. */
  characters: number;
  /** Characters excluding all whitespace. */
  charactersNoSpaces: number;
  /** Sentences, counted by terminal punctuation; at least 1 when non-empty. */
  sentences: number;
  /** Paragraphs, counted by blank-line-separated blocks. */
  paragraphs: number;
  /** Human-readable reading time, e.g. "0s", "42s", "3m". */
  readingTime: string;
};

/** Compact reading-time label for a word count. */
export function readingTime(words: number, wordsPerMinute = WORDS_PER_MINUTE): string {
  if (words <= 0) return "0s";
  const minutes = words / wordsPerMinute;
  if (minutes < 1) return `${Math.max(1, Math.round(minutes * 60))}s`;
  if (minutes < 60) return `${Math.round(minutes)}m`;
  const hours = Math.floor(minutes / 60);
  const rest = Math.round(minutes % 60);
  return rest === 0 ? `${hours}h` : `${hours}h ${rest}m`;
}

/** Count terminal punctuation that closes a sentence. */
export function countSentences(text: string): number {
  const trimmed = text.trim();
  if (!trimmed) return 0;
  const matches = trimmed.match(/[.!?…]+(?=\s|$)/g);
  return matches?.length || 1;
}

/** Count blank-line-separated blocks. */
export function countParagraphs(text: string): number {
  return text.split(/\n\s*\n/).filter((block) => block.trim().length > 0).length;
}

/** Everything the demo panel displays, derived in one pass. */
export function summarizeText(text: string): TextStats {
  const trimmed = text.trim();
  const words = trimmed ? trimmed.split(/\s+/).filter(Boolean).length : 0;
  return {
    words,
    characters: text.length,
    charactersNoSpaces: text.replace(/\s/g, "").length,
    sentences: countSentences(text),
    paragraphs: countParagraphs(text),
    readingTime: readingTime(words),
  };
}
