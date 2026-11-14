import { describe, expect, it } from "vitest";
import {
  WORDS_PER_MINUTE,
  countParagraphs,
  countSentences,
  readingTime,
  summarizeText,
} from "@/lib/text-stats";

describe("readingTime", () => {
  it("returns 0s for empty text", () => {
    expect(readingTime(0)).toBe("0s");
    expect(readingTime(-5)).toBe("0s");
  });

  it("never rounds a short read down to zero", () => {
    expect(readingTime(1)).toBe("1s");
    expect(readingTime(3)).toBe("1s");
  });

  it("uses the 220 wpm convention", () => {
    expect(readingTime(WORDS_PER_MINUTE)).toBe("1m");
    expect(readingTime(440)).toBe("2m");
    expect(readingTime(110)).toBe("30s");
  });

  it("switches to hours past an hour of reading", () => {
    expect(readingTime(WORDS_PER_MINUTE * 60)).toBe("1h");
    expect(readingTime(WORDS_PER_MINUTE * 75)).toBe("1h 15m");
  });
});

describe("countSentences", () => {
  it("counts terminal punctuation", () => {
    expect(countSentences("One. Two! Three?")).toBe(3);
  });

  it("counts an unterminated sentence as one", () => {
    expect(countSentences("no full stop here")).toBe(1);
  });

  it("returns zero for blank input", () => {
    expect(countSentences("")).toBe(0);
    expect(countSentences("   \n  ")).toBe(0);
  });

  it("ignores decimal points inside numbers", () => {
    expect(countSentences("Pi is 3.14 exactly.")).toBe(1);
  });

  it("handles ellipses as a single terminator", () => {
    expect(countSentences("Wait… then go.")).toBe(2);
  });
});

describe("countParagraphs", () => {
  it("counts blank-line separated blocks", () => {
    expect(countParagraphs("one\n\ntwo\n\nthree")).toBe(3);
  });

  it("treats single newlines as one paragraph", () => {
    expect(countParagraphs("one\ntwo\nthree")).toBe(1);
  });

  it("ignores whitespace-only blocks", () => {
    expect(countParagraphs("one\n\n   \n\ntwo")).toBe(2);
  });
});

describe("summarizeText", () => {
  it("reports zeros for empty input", () => {
    expect(summarizeText("")).toEqual({
      words: 0,
      characters: 0,
      charactersNoSpaces: 0,
      sentences: 0,
      paragraphs: 0,
      readingTime: "0s",
    });
  });

  it("counts the demo sample accurately", () => {
    const sample =
      "Paste your text here. Everything is counted on your device — no uploads, no accounts, no waiting.";
    const stats = summarizeText(sample);
    expect(stats.words).toBe(17);
    expect(stats.characters).toBe(sample.length);
    expect(stats.sentences).toBe(2);
    expect(stats.paragraphs).toBe(1);
    expect(stats.readingTime).toBe("5s");
  });

  it("excludes whitespace from the no-space count", () => {
    const stats = summarizeText("a b\n\tc");
    expect(stats.characters).toBe(6);
    expect(stats.charactersNoSpaces).toBe(3);
    expect(stats.words).toBe(3);
  });

  it("treats whitespace-only input as empty text", () => {
    const stats = summarizeText("   \n\t ");
    expect(stats.words).toBe(0);
    expect(stats.charactersNoSpaces).toBe(0);
    expect(stats.sentences).toBe(0);
    expect(stats.paragraphs).toBe(0);
  });
});
