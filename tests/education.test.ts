import { describe, expect, it } from "vitest";
import {
  attendancePlan,
  buildQuiz,
  buildTimetable,
  calculateCgpa,
  evaluatePolynomial,
  examResult,
  flashcardsToCsv,
  flashcardsToTsv,
  formatBibliography,
  formatCitation,
  fromRoman,
  gradePoints,
  letterGrade,
  multiplicationTable,
  numberToWords,
  parseFlashcards,
  parseNumberInput,
  parsePolynomial,
  scientificForms,
  scoreNeededForTarget,
  shuffle,
  simplifyPolynomial,
  solveEquation,
  solveSystem2,
  studyPlan,
  toRoman,
  weightedGrade,
  wordsToNumber,
} from "@/lib/education";

describe("grades", () => {
  it("maps percentages to letters and points", () => {
    expect(letterGrade(97)).toBe("A+");
    expect(letterGrade(91.5)).toBe("A-");
    expect(letterGrade(84)).toBe("B");
    expect(letterGrade(59.9)).toBe("F");
    expect(gradePoints(93)).toBe(4);
    expect(gradePoints(80)).toBe(2.7);
  });

  it("averages weighted categories", () => {
    const grade = weightedGrade([
      { name: "Homework", score: 90, weight: 20 },
      { name: "Midterm", score: 80, weight: 30 },
      { name: "Final", score: 100, weight: 50 },
    ]);
    expect(grade.percent).toBeCloseTo(92, 5);
    expect(grade.letter).toBe("A-");
    expect(grade.remainingWeight).toBe(0);
  });

  it("treats ungraded categories as remaining weight", () => {
    const grade = weightedGrade([
      { name: "Quiz", score: 85, weight: 25 },
      { name: "Final", score: Number.NaN, weight: 75 },
    ]);
    expect(grade.percent).toBeCloseTo(85, 5);
    expect(grade.remainingWeight).toBe(75);
  });

  it("computes the score needed to hit a target", () => {
    const categories = [
      { name: "Coursework", score: 78, weight: 40 },
      { name: "Exam", score: Number.NaN, weight: 60 },
    ];
    expect(scoreNeededForTarget(categories, 85)).toBeCloseTo(89.6667, 3);
    expect(scoreNeededForTarget([{ name: "All", score: 90, weight: 100 }], 95)).toBeNull();
  });

  it("warns when weights do not add up", () => {
    const grade = weightedGrade([
      { name: "A", score: 80, weight: 30 },
      { name: "B", score: 90, weight: 30 },
    ]);
    expect(grade.issues.length).toBeGreaterThan(0);
  });

  it("computes a credit-weighted CGPA", () => {
    const result = calculateCgpa([
      { name: "Semester 1", gpa: 3.5, credits: 18 },
      { name: "Semester 2", gpa: 4, credits: 12 },
    ]);
    expect(result.cgpa).toBeCloseTo(3.7, 5);
    expect(result.credits).toBe(30);
  });

  it("converts exam marks", () => {
    const result = examResult({ scored: 41, total: 60, pass: 40, target: 70 });
    expect(result.percent).toBeCloseTo(68.333, 3);
    expect(result.letter).toBe("D+");
    expect(result.passed).toBe(true);
    expect(result.correctForTarget).toBe(42);
  });

  it("rejects a zero total", () => {
    expect(examResult({ scored: 1, total: 0 }).issues.length).toBe(1);
  });
});

describe("attendance", () => {
  it("works out how many classes can be skipped", () => {
    const plan = attendancePlan({ attended: 18, held: 20, required: 75, remaining: 10 });
    expect(plan.percent).toBe(90);
    expect(plan.canSkip).toBeGreaterThan(0);
    expect(plan.mustAttend).toBe(0);
  });

  it("works out how many classes must be attended", () => {
    const plan = attendancePlan({ attended: 5, held: 10, required: 75, remaining: 10 });
    expect(plan.met).toBe(false);
    expect(plan.mustAttend).toBe(10);
  });

  it("reports the best possible finish", () => {
    const plan = attendancePlan({ attended: 5, held: 10, required: 90, remaining: 0 });
    expect(plan.maxFinalPercent).toBeCloseTo(50, 5);
  });
});

describe("study planning", () => {
  it("allocates more time to weaker subjects", () => {
    const plan = studyPlan({
      examDate: "2030-01-11",
      hoursPerDay: 2,
      today: new Date("2030-01-01T09:00:00"),
      subjects: [
        { name: "Maths", confidence: 1 },
        { name: "History", confidence: 5 },
      ],
    });
    expect(plan.daysLeft).toBe(10);
    expect(plan.totalHours).toBe(20);
    expect(plan.allocations[0].hours).toBeGreaterThan(plan.allocations[1].hours);
    expect(plan.allocations[0].hours + plan.allocations[1].hours).toBeCloseTo(20, 5);
  });

  it("flags an exam in the past", () => {
    const plan = studyPlan({ examDate: "2000-01-01", hoursPerDay: 1, subjects: [{ name: "A", confidence: 3 }] });
    expect(plan.daysLeft).toBe(0);
    expect(plan.issues.length).toBeGreaterThan(0);
  });

  it("builds a timetable that respects the daily window", () => {
    const blocks = buildTimetable({
      subjects: [{ name: "Maths", hours: 2 }, { name: "Biology", hours: 2 }],
      days: ["Mon", "Tue"],
      sessionMinutes: 60,
      startHour: 17,
    });
    expect(blocks.length).toBe(4);
    expect(blocks[0].day).toBe("Mon");
    expect(blocks[0].start).toBe("17:00");
    expect(blocks[0].end).toBe("18:00");
    expect(blocks.every((block) => block.minutes <= 60)).toBe(true);
  });
});

describe("flashcards and quizzes", () => {
  const text = "cell\tbasic unit of life\nmitosis | cell division\nQ: osmosis\nA: water movement";

  it("parses tabs, pipes and Q/A pairs", () => {
    const { cards, skipped } = parseFlashcards(text);
    expect(cards).toHaveLength(3);
    expect(cards[0]).toEqual({ front: "cell", back: "basic unit of life" });
    expect(cards[1].back).toBe("cell division");
    expect(cards[2].front).toBe("osmosis");
    expect(skipped).toHaveLength(0);
  });

  it("reports lines it cannot split", () => {
    const { cards, skipped } = parseFlashcards("just one line\nterm - meaning");
    expect(cards).toHaveLength(1);
    expect(skipped).toEqual(["just one line"]);
  });

  it("exports TSV and escaped CSV", () => {
    const cards = [{ front: 'Say "hi"', back: "a, b" }];
    expect(flashcardsToTsv(cards)).toBe('Say "hi"\ta, b');
    expect(flashcardsToCsv(cards)).toBe('front,back\n"Say ""hi""","a, b"');
  });

  it("shuffles deterministically", () => {
    const items = [1, 2, 3, 4, 5];
    expect(shuffle(items, 42)).toEqual(shuffle(items, 42));
    expect(items).toEqual([1, 2, 3, 4, 5]);
  });

  it("builds a quiz with one correct option", () => {
    const cards = [
      { front: "a", back: "1" },
      { front: "b", back: "2" },
      { front: "c", back: "3" },
      { front: "d", back: "4" },
    ];
    const quiz = buildQuiz(cards, { count: 4, choices: 3, seed: 7 });
    expect(quiz).toHaveLength(4);
    for (const question of quiz) {
      expect(question.options).toHaveLength(3);
      expect(new Set(question.options).size).toBe(3);
      expect(question.options[question.answer]).toBe(cards.find((card) => card.front === question.prompt)?.back);
    }
  });

  it("returns no quiz for a single card", () => {
    expect(buildQuiz([{ front: "a", back: "1" }])).toEqual([]);
  });
});

describe("number systems", () => {
  it("builds a multiplication table", () => {
    const table = multiplicationTable(7, 3);
    expect(table).toEqual([
      { multiplier: 1, product: 7 },
      { multiplier: 2, product: 14 },
      { multiplier: 3, product: 21 },
    ]);
  });

  it("converts to and from Roman numerals", () => {
    expect(toRoman(1994)).toBe("MCMXCIV");
    expect(toRoman(4)).toBe("IV");
    expect(toRoman(0)).toBeNull();
    expect(toRoman(4000)).toBeNull();
    expect(fromRoman("MCMXCIV")).toBe(1994);
    expect(fromRoman("mmxxv")).toBe(2025);
    expect(fromRoman("IIII")).toBeNull();
    expect(fromRoman("ABC")).toBeNull();
  });

  it("writes numbers in words", () => {
    expect(numberToWords(0)).toBe("zero");
    expect(numberToWords(21)).toBe("twenty-one");
    expect(numberToWords(101)).toBe("one hundred and one");
    expect(numberToWords(101, { and: false })).toBe("one hundred one");
    expect(numberToWords(1234567)).toBe("one million two hundred and thirty-four thousand five hundred and sixty-seven");
    expect(numberToWords(-4.5)).toBe("minus four point five");
  });

  it("reads numbers from words", () => {
    expect(wordsToNumber("twenty-one")).toBe(21);
    expect(wordsToNumber("one hundred and one")).toBe(101);
    expect(wordsToNumber("four million two hundred thousand")).toBe(4200000);
    expect(wordsToNumber("minus four point five")).toBe(-4.5);
    expect(wordsToNumber("banana")).toBeNull();
  });

  it("round-trips a spread of values", () => {
    for (const value of [7, 42, 999, 1000, 1001, 12345, 987654, 1000000]) {
      expect(wordsToNumber(numberToWords(value))).toBe(value);
    }
  });
});

describe("scientific notation", () => {
  it("parses common inputs", () => {
    expect(parseNumberInput("1.5e-7")).toBeCloseTo(1.5e-7, 12);
    expect(parseNumberInput("6.02 × 10^23")).toBeCloseTo(6.02e23, 15);
    expect(parseNumberInput("0.00042")).toBeCloseTo(0.00042, 10);
    expect(parseNumberInput("abc")).toBeNull();
  });

  it("produces scientific and engineering forms", () => {
    const forms = scientificForms(4500);
    expect(forms?.scientific).toBe("4.5 × 10³");
    expect(forms?.engineering).toBe("4.5 × 10³");
    expect(scientificForms(0.00234)?.engineering).toBe("2.34 × 10⁻³");
    expect(scientificForms(1234567)?.engineering).toBe("1.234567 × 10⁶");
    expect(scientificForms(0)?.scientific).toBe("0 × 10⁰");
  });
});

describe("algebra", () => {
  it("parses polynomials", () => {
    expect(parsePolynomial("3x^2 - 5x + 6")).toEqual({ a: 3, b: -5, c: 6 });
    expect(parsePolynomial("-x + 4")).toEqual({ a: 0, b: -1, c: 4 });
    expect(parsePolynomial("2x²")).toEqual({ a: 2, b: 0, c: 0 });
    expect(parsePolynomial("x + y")).toBeNull();
  });

  it("simplifies like terms", () => {
    expect(simplifyPolynomial("3x + 2x - 4 + x^2")).toBe("x² + 5x − 4");
    expect(simplifyPolynomial("x - x")).toBe("0");
  });

  it("solves linear equations", () => {
    const result = solveEquation("3x + 5 = 20");
    expect(result?.kind).toBe("linear");
    expect(result?.roots[0]).toBeCloseTo(5, 10);
  });

  it("solves quadratics with two, one and no real roots", () => {
    const two = solveEquation("x^2 - 5x + 6 = 0");
    expect(two?.roots).toEqual([2, 3]);
    expect(two?.discriminant).toBe(1);
    expect(two?.vertex).toEqual({ x: 2.5, y: -0.25 });

    const one = solveEquation("x^2 - 4x + 4 = 0");
    expect(one?.roots).toEqual([2]);

    const none = solveEquation("x^2 + 1 = 0");
    expect(none?.roots).toEqual([]);
    expect(none?.issues.length).toBe(1);
  });

  it("detects identity and contradiction", () => {
    expect(solveEquation("2x = 2x")?.kind).toBe("identity");
    expect(solveEquation("2x + 1 = 2x + 3")?.kind).toBe("contradiction");
  });

  it("evaluates a polynomial", () => {
    expect(evaluatePolynomial({ a: 1, b: 0, c: -9 }, 3)).toBe(0);
  });

  it("solves a 2x2 system", () => {
    expect(solveSystem2({ a1: 2, b1: 1, c1: 5, a2: 1, b2: -1, c2: 1 })).toEqual({ x: 2, y: 1 });
    expect(solveSystem2({ a1: 1, b1: 1, c1: 1, a2: 2, b2: 2, c2: 3 })).toBeNull();
  });
});

describe("citations", () => {
  const book = {
    authors: "Jane Doe and John Smith",
    title: "A History of Small Things",
    publisher: "Acme Press",
    year: "2021",
  };

  it("formats APA", () => {
    expect(formatCitation(book, "apa")).toBe("Doe, J., & Smith, J. (2021). A History of Small Things. Acme Press.");
  });

  it("formats MLA", () => {
    expect(formatCitation(book, "mla")).toBe("Doe, Jane, and John Smith. “A History of Small Things.” Acme Press, 2021.");
  });

  it("formats Chicago", () => {
    expect(formatCitation(book, "chicago")).toBe("Doe, Jane, and John Smith. “A History of Small Things.” (2021) Acme Press.");
  });

  it("formats Harvard", () => {
    expect(formatCitation(book, "harvard")).toBe("Doe, J. and Smith, J. (2021) A History of Small Things. Acme Press.");
  });

  it("handles a single author and a URL", () => {
    const web = { authors: "Grace Hopper", title: "On Compilers", container: "Proceedings", year: "1952", url: "https://example.com/paper" };
    expect(formatCitation(web, "apa")).toContain("Hopper, G.");
    expect(formatCitation(web, "apa")).toContain("https://example.com/paper");
  });

  it("returns nothing without a title", () => {
    expect(formatCitation({ authors: "A B", title: "" }, "apa")).toBe("");
  });

  it("sorts a bibliography", () => {
    const entries = [
      { authors: "Zoe Adams", title: "Zebra", year: "2019" },
      { authors: "Mark Bell", title: "Apple", year: "2020" },
    ];
    expect(formatBibliography(entries, "apa", "author")[0]).toContain("Adams");
    expect(formatBibliography(entries, "apa", "title")[0]).toContain("Apple");
    expect(formatBibliography(entries, "apa", "year")[0]).toContain("2019");
  });
});
