import { describe, expect, it } from "vitest";
import {
  cleanWhitespace,
  countText,
  dedupeLines,
  generateLorem,
  keywordFrequency,
  reverseText,
  slugify,
  sortLines,
  toCase,
} from "@/lib/text";

describe("countText", () => {
  it("counts words, characters and sentences", () => {
    const stats = countText("Hello world. This is a test!");
    expect(stats.words).toBe(6);
    expect(stats.sentences).toBe(2);
    expect(stats.characters).toBe(28);
  });

  it("treats hyphenated compounds as one word", () => {
    expect(countText("well-known example").words).toBe(2);
  });

  it("handles empty input without throwing", () => {
    const stats = countText("");
    expect(stats.words).toBe(0);
    expect(stats.paragraphs).toBe(0);
    expect(stats.readingSeconds).toBe(0);
  });

  it("counts paragraphs by blank-line separation", () => {
    const stats = countText("First paragraph.\n\nSecond paragraph.");
    expect(stats.paragraphs).toBe(2);
  });

  it("estimates reading time at 225 wpm", () => {
    const words = Array.from({ length: 450 }, (_, index) => `word${index}`).join(" ");
    expect(countText(words).readingSeconds).toBe(120);
  });

  it("ignores punctuation-only tokens", () => {
    expect(countText("hello — world").words).toBe(2);
  });
});

describe("keywordFrequency", () => {
  it("returns the most frequent non-stop words first", () => {
    const result = keywordFrequency("design design design the the layout", 3);
    expect(result[0]).toEqual({ term: "design", count: 3, density: 50 });
  });

  it("builds bigrams", () => {
    const result = keywordFrequency("user interface user interface design", 3, { ngram: 2 });
    expect(result[0].term).toBe("user interface");
    expect(result[0].count).toBe(2);
  });

  it("returns an empty array for empty input", () => {
    expect(keywordFrequency("", 5)).toEqual([]);
  });
});

describe("toCase", () => {
  it("converts to upper and lower", () => {
    expect(toCase("Hello There", "upper")).toBe("HELLO THERE");
    expect(toCase("Hello There", "lower")).toBe("hello there");
  });

  it("applies AP-style title case, keeping small words lowercase", () => {
    expect(toCase("the quick brown fox jumps over the lazy dog", "title")).toBe(
      "The Quick Brown Fox Jumps Over the Lazy Dog",
    );
  });

  it("produces sentence case across multiple sentences", () => {
    expect(toCase("first sentence. second sentence!", "sentence")).toBe(
      "First sentence. Second sentence!",
    );
  });

  it("produces programming case styles", () => {
    expect(toCase("User Profile Image URL", "camel")).toBe("userProfileImageUrl");
    expect(toCase("user profile image", "snake")).toBe("user_profile_image");
    expect(toCase("user profile image", "kebab")).toBe("user-profile-image");
    expect(toCase("user profile image", "constant")).toBe("USER_PROFILE_IMAGE");
    expect(toCase("user profile image", "pascal")).toBe("UserProfileImage");
  });

  it("preserves non-letter characters when alternating", () => {
    expect(toCase("ab cd", "alternating")).toBe("aB cD");
  });
});

describe("dedupeLines", () => {
  it("keeps the first occurrence and preserves order", () => {
    const result = dedupeLines("b\na\nb\nc");
    expect(result.output).toBe("b\na\nc");
    expect(result.removed).toBe(1);
    expect(result.kept).toBe(3);
  });

  it("can ignore case", () => {
    const result = dedupeLines("Apple\napple", { ignoreCase: true });
    expect(result.output).toBe("Apple");
  });

  it("can keep the last occurrence", () => {
    const result = dedupeLines("a\nb\na", { keep: "last" });
    expect(result.output).toBe("b\na");
  });

  it("can drop empty lines", () => {
    const result = dedupeLines("a\n\nb\n", { dropEmpty: true });
    expect(result.output).toBe("a\nb");
  });
});

describe("sortLines", () => {
  it("sorts alphabetically", () => {
    expect(sortLines("banana\napple\ncherry").output).toBe("apple\nbanana\ncherry");
  });

  it("sorts numerically when enabled", () => {
    expect(sortLines("item 10\nitem 2\nitem 1", "az", { numeric: true }).output).toBe(
      "item 1\nitem 2\nitem 10",
    );
  });

  it("sorts in reverse", () => {
    expect(sortLines("a\nb\nc", "za").output).toBe("c\nb\na");
  });

  it("can remove duplicates", () => {
    expect(sortLines("b\na\nb", "az", { unique: true }).output).toBe("a\nb");
  });
});

describe("cleanWhitespace", () => {
  it("collapses double spaces and trims lines", () => {
    expect(cleanWhitespace("  hello   world  ")).toBe("hello world");
  });

  it("converts non-breaking spaces", () => {
    expect(cleanWhitespace("hello\u00A0world")).toBe("hello world");
  });

  it("keeps paragraph breaks unless asked to join", () => {
    expect(cleanWhitespace("one\n\ntwo")).toBe("one\n\ntwo");
    expect(cleanWhitespace("one\n\ntwo", { removeLineBreaks: true })).toBe("one two");
  });

  it("removes blank lines when enabled", () => {
    expect(cleanWhitespace("a\n\nb", { removeBlankLines: true })).toBe("a\nb");
  });
});

describe("slugify", () => {
  it("lowercases and hyphenates", () => {
    expect(slugify("10 Ways to Improve Writing (2025)")).toBe("10-ways-to-improve-writing-2025");
  });

  it("strips accents", () => {
    expect(slugify("Crème Brûlée")).toBe("creme-brulee");
  });

  it("respects a maximum length at a word boundary", () => {
    const slug = slugify("one two three four five", { maxLength: 13 });
    expect(slug.length).toBeLessThanOrEqual(13);
    expect(slug.endsWith("-")).toBe(false);
  });

  it("can remove stop words", () => {
    expect(slugify("The Best of Both Worlds", { stopWords: true })).toBe("best-both-worlds");
  });

  it("supports an underscore separator", () => {
    expect(slugify("hello world", { separator: "_" })).toBe("hello_world");
  });
});

describe("reverseText", () => {
  it("reverses characters", () => {
    expect(reverseText("abc", "characters")).toBe("cba");
  });

  it("keeps emoji intact", () => {
    expect(reverseText("a🙂", "characters")).toBe("🙂a");
  });

  it("reverses words", () => {
    expect(reverseText("one two three", "words")).toBe("three two one");
  });

  it("reverses lines", () => {
    expect(reverseText("a\nb\nc", "lines")).toBe("c\nb\na");
  });
});

describe("generateLorem", () => {
  it("is deterministic for the same seed", () => {
    expect(generateLorem(2, "paragraphs", { seed: 42 })).toBe(
      generateLorem(2, "paragraphs", { seed: 42 }),
    );
  });

  it("differs across seeds", () => {
    expect(generateLorem(2, "sentences", { seed: 1 })).not.toBe(
      generateLorem(2, "sentences", { seed: 2 }),
    );
  });

  it("returns the requested number of words", () => {
    const output = generateLorem(10, "words", { seed: 3, classicOpening: false });
    expect(output.trim().split(/\s+/)).toHaveLength(10);
  });
});
