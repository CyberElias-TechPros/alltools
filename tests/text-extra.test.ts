import { describe, expect, it } from "vitest";
import {
  sentenceStats,
  paragraphStats,
  timeToRead,
  timeToSpeak,
  removeLineBreaks,
  slugToText,
  randomText,
  inspectCharacters,
} from "@/lib/text";

describe("sentenceStats", () => {
  it("splits sentences and measures each one", () => {
    const stats = sentenceStats("First sentence here. Second one is a little longer! Third?");
    expect(stats.sentences).toHaveLength(3);
    expect(stats.sentences[0].words).toBe(3);
    expect(stats.longest?.words).toBe(6);
    expect(stats.averageWords).toBeCloseTo((3 + 6 + 1) / 3, 5);
  });

  it("ignores fragments without letters", () => {
    expect(sentenceStats("... !!!").sentences).toHaveLength(0);
  });
});

describe("paragraphStats", () => {
  it("splits on blank lines and keeps wrapped lines together", () => {
    const stats = paragraphStats("One line\nwrapped\n\nSecond block with five words here");
    expect(stats.paragraphs).toHaveLength(2);
    expect(stats.paragraphs[0].words).toBe(3);
    expect(stats.paragraphs[1].words).toBe(6);
  });

  it("returns nothing for empty input", () => {
    expect(paragraphStats("   ").paragraphs).toHaveLength(0);
  });
});

describe("time estimates", () => {
  it("rounds reading time up to whole seconds", () => {
    const text = Array.from({ length: 225 }, () => "word").join(" ");
    expect(timeToRead(text, 225)).toBe(60);
    expect(timeToRead(text, 150)).toBe(90);
  });

  it("bases speaking time on the supplied pace", () => {
    const text = Array.from({ length: 130 }, () => "word").join(" ");
    expect(timeToSpeak(text, 130)).toBe(60);
  });

  it("returns zero for a zero pace instead of dividing by zero", () => {
    expect(timeToRead("some words", 0)).toBe(0);
  });
});

describe("removeLineBreaks", () => {
  const wrapped = "This was\nwrapped at\nseventy characters.\n\nNew paragraph\ncontinues here.";

  it("keeps paragraph breaks and joins wrapped lines", () => {
    expect(removeLineBreaks(wrapped, "double")).toBe(
      "This was wrapped at seventy characters.\n\nNew paragraph continues here.",
    );
  });

  it("joins everything in space mode", () => {
    expect(removeLineBreaks(wrapped, "space")).not.toContain("\n");
  });

  it("removes breaks entirely in nothing mode", () => {
    expect(removeLineBreaks("a\nb\nc", "nothing")).toBe("abc");
  });
});

describe("slugToText", () => {
  it("turns a slug into a title", () => {
    expect(slugToText("how-to-choose-a-strong-password")).toBe("How To Choose A Strong Password");
  });

  it("strips a domain, path and numbers when asked", () => {
    expect(slugToText("https://example.com/blog/2024/07/my-post-1234", { stripNumbers: true })).toBe(
      "My Post",
    );
  });

  it("supports sentence case", () => {
    expect(slugToText("MY-FIRST-POST", { style: "sentence" })).toBe("My first post");
  });
});

describe("randomText", () => {
  it("is reproducible for a given seed", () => {
    const a = randomText({ paragraphs: 2, sentencesPerParagraph: 2, seed: 42 });
    const b = randomText({ paragraphs: 2, sentencesPerParagraph: 2, seed: 42 });
    expect(a).toBe(b);
  });

  it("produces the requested structure", () => {
    const text = randomText({ paragraphs: 3, sentencesPerParagraph: 2, seed: 7 });
    expect(text.split("\n\n")).toHaveLength(3);
    expect(text.split(".").filter((part) => part.trim()).length).toBeGreaterThanOrEqual(6);
  });
});

describe("inspectCharacters", () => {
  it("reports code points, bytes and categories", () => {
    const [first] = inspectCharacters("A");
    expect(first.hex).toBe("U+0041");
    expect(first.decimal).toBe(65);
    expect(first.utf8).toBe("41");
    expect(first.kind).toBe("uppercase letter");
  });

  it("handles emoji as single characters with multi-byte encoding", () => {
    const [emoji] = inspectCharacters("😀");
    expect(emoji.hex).toBe("U+1F600");
    expect(emoji.utf8.split(" ")).toHaveLength(4);
    expect(emoji.utf16.split(" ")).toHaveLength(2);
    expect(emoji.kind).toBe("emoji");
  });

  it("caps the number of inspected characters", () => {
    expect(inspectCharacters("abcdef", 3)).toHaveLength(3);
  });
});
