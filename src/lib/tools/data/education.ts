import type { ToolDefinition } from "../types";

/**
 * Section I. Student arithmetic and reference work: grades, attendance, study
 * planning, number systems, algebra and citations. Everything is computed from
 * what the student types; nothing is uploaded and no account is needed.
 */
export const educationTools: ToolDefinition[] = [
  {
    slug: "grade-calculator",
    name: "Grade Calculator",
    category: "education",
    tagline: "Weighted grades, the letter band and the score you still need.",
    intent: "calculate my grade",
    keywords: ["grade calculator", "weighted grade calculator", "semester grade", "what grade do i need", "final grade calculator", "class grade"],
    status: "live",
    actions: ["copy"],
    effort: "instant",
    popularity: 88,
    addedAt: "2025-03-04",
    seoTitle: "Grade Calculator — Weighted Marks and What You Need",
    seoDescription:
      "Enter weighted categories to see your current grade, letter band and how much the remaining work has to score to reach your target.",
    content: {
      intro: [
        "Most grade questions are really one question: what average do I need on the rest? A weighted calculator answers it precisely, provided the weights match the syllabus rather than a guess.",
        "Leave a category blank while it is unmarked. A blank is treated as remaining weight, so the average is over the work you actually have — not diluted by zeros you have not earned yet.",
      ],
      howTo: [
        "Copy the category names and weights from your syllabus.",
        "Enter the scores you already have and leave unmarked work blank.",
        "Set the target percentage you want to finish with.",
        "Read the required average on the remaining weight.",
      ],
      method: {
        title: "Weighted average and required score",
        paragraphs: [
          "The current grade is Σ(score × weight) ÷ Σ(weight) over graded categories. The required score solves the same equation for the ungraded share: if 70% is graded at 78% and you want 85% overall, the last 30% must average 89.7%.",
          "Letter bands here are the common US cut-offs: 93 A, 90 A−, 87 B+, 83 B, 80 B−, 77 C+, 73 C, 70 C−, 67 D+, 63 D, 60 D−. Plenty of schools use 92.5 or 93.5 for an A, so the letter is a guide — the percentage is the fact.",
        ],
        formula: "grade = Σ(score × weight) ÷ Σ(weight)",
      },
      examples: [
        {
          title: "Coursework done, final left",
          steps: ["Homework 92 (20%), quizzes 85 (20%), midterm 78 (25%).", "Final 35% left blank.", "Target 90%."],
          result: "Current 84.2%; the final needs 99.7% — out of reach without extra credit",
        },
        {
          title: "Weights that do not add to 100",
          steps: ["Enter only a midterm worth 30%.", "Read the warning about the remaining 70%."],
          result: "The average is still valid for the graded part, with an explicit note",
        },
      ],
      limitations: [
        "Your syllabus is the authority. If a category is dropped, curved or weighted differently for a resit, this arithmetic will not match the official grade.",
        "Extra credit is capped at 100% here so one bonus point cannot hide a failing average.",
        "A blank category is treated as unreached, not as zero — if your school counts missing work as zero, enter 0 explicitly.",
      ],
      faqs: [
        {
          q: "What grade do I need on the final?",
          a: "Enter your graded categories with their weights, leave the final blank, and set your target. The tool solves for the average required on whatever weight remains.",
        },
        {
          q: "Why is my grade different from the portal?",
          a: "Usually a different weight, a dropped lowest score, a curve or extra credit. Check the syllabus weights and whether your institution rounds at the category level.",
        },
        {
          q: "Can I use this for a weighted GPA?",
          a: "Grades and GPA are different scales. Use the CGPA calculator for credit-weighted grade points.",
        },
      ],
    },
  },
  {
    slug: "cgpa-calculator",
    name: "CGPA Calculator",
    category: "education",
    tagline: "Combine semester GPAs across credits into one cumulative figure.",
    intent: "calculate cgpa",
    keywords: ["cgpa calculator", "cumulative gpa", "semester gpa to cgpa", "credit weighted gpa", "gpa calculator 5 point scale", "cgpa to percentage"],
    status: "live",
    actions: ["copy"],
    effort: "instant",
    popularity: 82,
    addedAt: "2025-03-04",
    seoTitle: "CGPA Calculator — Credit-Weighted Across Semesters",
    seoDescription:
      "Calculate a cumulative GPA from semester GPAs and credit loads on a 4, 5 or 10 point scale, with the grade points and credits behind the result.",
    content: {
      intro: [
        "A CGPA is not the average of your semester GPAs unless every semester carried the same number of credits. It is the total grade points divided by total credits, which is why a strong heavy semester lifts the figure more than a light one.",
        "Enter each semester's GPA and credit load, pick the scale your institution uses, and the result updates with the arithmetic visible.",
      ],
      howTo: [
        "Choose the scale — 4, 5 or 10 points.",
        "Add a row per semester with its GPA and credit hours.",
        "Check the credit-weighted table to see each semester's contribution.",
        "Copy the CGPA into your application or CV.",
      ],
      method: {
        title: "Why credits decide the total",
        paragraphs: [
          "Grade points are GPA × credits. Summing them and dividing by total credits gives the credit-weighted mean — the same method registrars use. Two semesters at 3.5 and 4.0 average 3.75 only if the credit loads match; at 12 and 24 credits the result is 3.83.",
          "Percentage conversions are institution-specific. Some divide CGPA by the maximum and multiply by 100, others apply a linear formula such as (CGPA − 0.75) × 10 on a 10-point scale. This tool shows the percentage of the scale and nothing more, because inventing a conversion would be misleading.",
        ],
        formula: "CGPA = Σ(GPA × credits) ÷ Σ(credits)",
      },
      examples: [
        {
          title: "Three semesters, uneven credits",
          steps: ["3.4 × 18, 3.7 × 18, 3.9 × 21.", "Add the grade points (61.2 + 66.6 + 81.9 = 209.7).", "Divide by 57 credits."],
          result: "CGPA 3.68 on a 4.0 scale",
        },
        {
          title: "A 10-point scale",
          steps: ["Switch the scale to 10.", "Enter GPAs of 8.2 and 7.6 with 20 credits each."],
          result: "CGPA 7.90, shown as 79% of the scale",
        },
      ],
      limitations: [
        "Grade points for a plus or minus grade vary by institution (A+ can be 4.0 or 4.3), so a transferred CGPA may differ slightly.",
        "Repeated courses are usually replaced rather than averaged; this tool cannot know your institution's policy, so enter the value that appears on your transcript.",
        "Percentage conversion is not universal — use the formula your university publishes.",
      ],
      faqs: [
        {
          q: "Is CGPA the average of my semester GPAs?",
          a: "Only when every semester has the same credit load. Otherwise it is the credit-weighted average, which is what this calculator computes.",
        },
        {
          q: "How do I convert CGPA to a percentage?",
          a: "Use your institution's formula. A common 10-point approximation is (CGPA − 0.75) × 10, but many universities publish their own and some do not convert at all.",
        },
        {
          q: "Does a failed course count?",
          a: "If it appears on the transcript with credits attempted, yes — it contributes zero grade points while adding credits. Enter it with a GPA of 0 for that semester's effect.",
        },
      ],
    },
  },
  {
    slug: "exam-score-calculator",
    name: "Exam Score Calculator",
    category: "education",
    tagline: "Marks to percentage, letter band and marks needed for a target.",
    intent: "calculate exam percentage",
    keywords: ["exam score calculator", "marks to percentage", "test score calculator", "exam grade calculator", "marks needed", "pass mark calculator"],
    status: "live",
    actions: ["copy"],
    effort: "instant",
    popularity: 76,
    addedAt: "2025-03-04",
    seoTitle: "Exam Score Calculator — Marks, Percentage and Grade",
    seoDescription:
      "Convert exam marks to a percentage and letter grade, check the pass mark and see exactly how many marks a target percentage would have needed.",
    content: {
      intro: [
        "Sixty marks out of eighty is 75%, which is an A− in the common US banding and a first in many UK modules. The arithmetic is trivial; the useful part is seeing the boundary clearly before results day.",
        "Enter the paper total, your marks, the pass mark and a target, and the tool reports the percentage, the letter, the marks lost and the marks a target would have needed.",
      ],
      howTo: [
        "Enter the marks you scored.",
        "Enter the total available on the paper.",
        "Set the pass mark and target your course uses.",
        "Read the percentage, letter band and the gap to your target.",
      ],
      method: {
        title: "What the percentage does and does not tell you",
        paragraphs: [
          "Percentage is marks ÷ total × 100. The letter band then applies a cut-off scheme; the one used here is the common US set, with 93 for an A and 60 for a D−.",
          "Marks are not always comparable across papers. A 70% on a hard paper can be a better result than 85% on an easy one, and many universities scale or curve raw marks before publishing a final grade. Treat the percentage as a description of the paper, not a verdict on the student.",
        ],
        formula: "percentage = (marks ÷ total) × 100",
      },
      examples: [
        {
          title: "A near miss",
          steps: ["41 out of 60.", "Pass mark 40%, target 70%."],
          result: "68.3% — a pass, but one more mark would have reached 70%",
        },
        {
          title: "Checking a resit target",
          steps: ["Set the total to 100.", "Enter the marks needed for the classification you want."],
          result: "The marks-to-percentage relationship shown directly",
        },
      ],
      limitations: [
        "Letter bands differ between countries and institutions; this tool uses one common scheme and says so.",
        "It cannot know about grade boundaries, curves or moderation applied after marking.",
        "Marks for individual questions may be weighted differently from their raw value — enter the weighted total if your paper does that.",
      ],
      faqs: [
        {
          q: "How many marks do I need to pass?",
          a: "Set the pass mark percentage, and the tool shows the marks lost and whether you cleared it. For a forward calculation, multiply the total by the pass percentage and round up.",
        },
        {
          q: "What is 45 out of 60 as a percentage?",
          a: "75%. Divide 45 by 60 to get 0.75, then multiply by 100.",
        },
        {
          q: "Why does my school show a different grade?",
          a: "Boundary marks are usually set after marking, and many systems round or curve. The official transcript always wins over any calculator.",
        },
      ],
    },
  },
  {
    slug: "attendance-calculator",
    name: "Attendance Calculator",
    category: "education",
    tagline: "How many classes you can miss — and how many you must attend.",
    intent: "calculate attendance percentage",
    keywords: ["attendance calculator", "attendance percentage", "how many classes can i miss", "75 percent attendance", "college attendance calculator", "attendance required"],
    status: "live",
    actions: ["copy"],
    effort: "instant",
    popularity: 80,
    addedAt: "2025-03-04",
    seoTitle: "Attendance Calculator — Classes You Can Still Miss",
    seoDescription:
      "Work out your attendance percentage, how many remaining classes you can miss and still meet the requirement, and how many you must attend to recover.",
    content: {
      intro: [
        "Attendance rules are usually stated as a minimum percentage, but the question students actually have is operational: can I miss Thursday, and how many in a row would put me below the line?",
        "Enter classes attended, classes held, the required percentage and how many are left in the term. The tool answers both directions — the safe number to skip, and the number to attend to climb back.",
      ],
      howTo: [
        "Enter the classes you have attended and the number held so far.",
        "Set the percentage your course requires.",
        "Add the classes remaining in the term.",
        "Read the skip allowance and the recovery count.",
      ],
      method: {
        title: "Two forecasts from one ratio",
        paragraphs: [
          "Current attendance is attended ÷ held × 100. The skip allowance asks the largest number k such that attending all but k of the remaining classes still ends at or above the requirement: (attended + remaining − k) ÷ total ≥ required.",
          "The recovery count is the smallest number of consecutive remaining classes that lifts the running ratio back above the line. Both are computed by stepping rather than by a closed-form formula, which keeps the arithmetic exact at boundaries.",
        ],
        formula: "attendance = attended ÷ held × 100",
      },
      examples: [
        {
          title: "Comfortably above the line",
          steps: ["18 attended, 20 held, 75% required, 10 left.", "Current 90%."],
          result: "Up to 8 of the remaining 10 can be missed",
        },
        {
          title: "Already below the line",
          steps: ["5 attended, 10 held, 75% required, 10 left."],
          result: "Every remaining class must be attended to reach 75%",
        },
      ],
      limitations: [
        "Many institutions count a late arrival as a partial or full absence, which this arithmetic cannot see.",
        "Documented sick leave is often excluded from the denominator — check whether your register does that before acting on the margin.",
        "The forecast assumes the number of remaining classes is fixed; timetable changes will move the answer.",
      ],
      faqs: [
        {
          q: "How is attendance percentage calculated?",
          a: "Classes attended divided by classes held, times 100. If your register treats a double period as two classes, count it as two.",
        },
        {
          q: "Can I miss class if I am above the requirement?",
          a: "Arithmetically yes, within the skip allowance shown. Institution policy may still require notification or medical evidence for absences, so the number is not permission.",
        },
        {
          q: "What if my attendance is already below 75%?",
          a: "The recovery count tells you how many consecutive classes it takes to get back. If it exceeds the classes remaining, the requirement cannot be met this term and you should speak to the course office.",
        },
      ],
    },
  },
  {
    slug: "study-time-calculator",
    name: "Study Time Calculator",
    category: "education",
    tagline: "Turn days left and confidence into a per-subject study budget.",
    intent: "plan study time",
    keywords: ["study time calculator", "study planner", "how many hours to study", "revision planner", "exam study schedule", "study hours per subject"],
    status: "live",
    actions: ["copy"],
    effort: "instant",
    popularity: 70,
    addedAt: "2025-03-04",
    seoTitle: "Study Time Calculator — Hours Per Subject Before an Exam",
    seoDescription:
      "Enter your exam date, daily study hours and confidence per subject to get a realistic study budget that puts more time where you are weakest.",
    content: {
      intro: [
        "Revision plans fail for a boring reason: they assume more hours than exist. If the exam is in 21 days and you can honestly study two hours a day, the budget is 42 hours — not “as much as it takes”.",
        "This calculator takes that budget and splits it by subject, weighting towards the ones you rated lower, with a floor so nothing is abandoned.",
      ],
      howTo: [
        "Pick the exam date.",
        "Enter the hours per day you can genuinely sustain.",
        "Add each subject with a confidence rating from 1 to 5.",
        "Read the total hours and the per-subject split.",
      ],
      method: {
        title: "Budget first, allocation second",
        paragraphs: [
          "Total hours = days left × hours per day. Days are counted to midnight of the exam date, so an exam tomorrow gives one day.",
          "The split weights each subject by (6 − confidence): a subject rated 1 receives five times the share of one rated 5. Weights are normalised, so the allocation always sums to the budget and every subject gets a non-zero slice.",
        ],
        formula: "hoursᵢ = total × (6 − confidenceᵢ) ÷ Σ(6 − confidence)",
      },
      examples: [
        {
          title: "Three subjects, 21 days, two hours a day",
          steps: ["Maths 2, Biology 3, History 5.", "Budget 42 hours.", "Weights 4, 3, 1."],
          result: "21 hours Maths, 15.75 Biology, 5.25 History",
        },
        {
          title: "An exam tomorrow",
          steps: ["Set the date to today.", "Read the warning and the per-day minutes."],
          result: "One day of study, allocated the same way — a triage decision, not a plan",
        },
      ],
      limitations: [
        "The confidence rating comes from you, and people are usually over-confident on familiar material. Rate against past paper performance rather than a feeling.",
        "Study hours are not equal in quality; two focused hours beat four distracted ones, and the calculator cannot see that.",
        "It allocates time, not content. It cannot tell you which topics within a subject to prioritise.",
      ],
      faqs: [
        {
          q: "How many hours a day should I study?",
          a: "A sustainable number, usually one to three hours alongside other commitments. A plan for eight hours a day is abandoned by day three, which is worse than a modest plan kept.",
        },
        {
          q: "Should I study the weakest subject most?",
          a: "Yes, up to a point. Rotating subjects produces better retention than blocking one for days, which is why the timetable generator spreads sessions across the week.",
        },
        {
          q: "Does this account for spaced repetition?",
          a: "No. It allocates total time. For retention, revisit each subject several times a week rather than in one long block — the timetable generator lays that out.",
        },
      ],
    },
  },
  {
    slug: "study-timetable-generator",
    name: "Study Timetable Generator",
    category: "education",
    tagline: "A weekly revision schedule from the hours you actually have.",
    intent: "make a study timetable",
    keywords: ["study timetable generator", "revision timetable", "study schedule maker", "weekly study plan", "exam timetable", "study planner"],
    status: "live",
    actions: ["copy", "download"],
    effort: "quick",
    popularity: 68,
    addedAt: "2025-03-04",
    seoTitle: "Study Timetable Generator — Weekly Revision Schedule",
    seoDescription:
      "Build a weekly study timetable from subject hours, session length and start time, with breaks built in and a copyable table for your calendar.",
    content: {
      intro: [
        "A timetable is a promise about time, so it has to start from hours rather than ambition. Enter the hours each subject needs this week and the tool lays out sessions in rotation, with breaks, inside your study window.",
        "Sessions rotate so no subject appears twice in a row, which is the simplest form of interleaving and is easier to keep than four hours of one subject.",
      ],
      howTo: [
        "Enter each subject and the hours it needs this week.",
        "Choose how many days you will study and how long each session runs.",
        "Set the earliest start time in your day.",
        "Copy the table into a calendar or download it as a TSV.",
      ],
      method: {
        title: "Rotation, breaks and a hard stop",
        paragraphs: [
          "Subjects are consumed in rotation, taking the smaller of the session length and the remaining time for that subject. When a subject is finished it is skipped, and the rotation continues until the hours or the day are used up.",
          "A ten-minute break sits between sessions by default. The schedule stops at 22:00 because studying past midnight trades tomorrow's attention for tonight's, which is a bad exchange in the week before an exam.",
        ],
        formula: "sessions = ceil(subject hours ÷ session length), rotated across days",
      },
      examples: [
        {
          title: "Five evenings, three subjects",
          steps: ["Maths 4h, Biology 3h, History 2h.", "60-minute sessions starting at 17:00."],
          result: "Nine sessions across the week, with breaks between them",
        },
        {
          title: "Short weekday sessions",
          steps: ["Set 30-minute sessions and four days."],
          result: "The same hours spread into smaller, more frequent blocks",
        },
      ],
      limitations: [
        "The generator allocates hours, not topics. Two hours of Maths still needs a decision about which chapters.",
        "It does not know your existing commitments — set the start time after them.",
        "A timetable that ignores sleep and meals is not realistic; the 22:00 stop is deliberate.",
      ],
      faqs: [
        {
          q: "How long should each study session be?",
          a: "45 to 90 minutes for focused work, with a short break. For memorisation, shorter and more frequent beats one long block.",
        },
        {
          q: "Can I import this into my calendar?",
          a: "Download the TSV, open it in a spreadsheet, and copy the rows into Google Calendar's import or create the events from the times shown.",
        },
        {
          q: "Why does my subject get no session?",
          a: "If the remaining hours are tiny relative to a session, the schedule may run out of days. Reduce the session length or add a study day.",
        },
      ],
    },
  },
  {
    slug: "multiplication-table-generator",
    name: "Multiplication Table Generator",
    category: "education",
    tagline: "Print or copy a times table up to any multiple.",
    intent: "multiplication table",
    keywords: ["multiplication table", "times table generator", "times tables printable", "multiplication chart", "7 times table", "times table practice"],
    status: "live",
    actions: ["copy", "download"],
    effort: "instant",
    popularity: 72,
    addedAt: "2025-03-04",
    seoTitle: "Multiplication Table Generator — Any Times Table",
    seoDescription:
      "Generate a multiplication table for any number up to 100 multiples, highlight one fact to practise and copy or download the table as plain text.",
    content: {
      intro: [
        "A times table is a reference sheet, and the useful version is the one you can print or paste rather than scroll. Choose the number and how far to go, and the table is generated immediately.",
        "The square (7 × 7, 12 × 12) is highlighted in bold and an optional third field marks a single fact you are drilling.",
      ],
      howTo: [
        "Enter the number whose table you need.",
        "Set how many multiples to show, up to 100.",
        "Optionally highlight one multiplier to practise.",
        "Copy the list or download it as a text file.",
      ],
      method: {
        title: "What the table contains",
        paragraphs: [
          "Each row is n × k for k from 1 to the limit. The square is the row where k equals n, which is the fact most often misremembered — 7 × 8 is 56, not 54.",
          "Products are exact integers. Beyond 15 or so, tables become less useful for recall and more useful as a reference, which is why the limit is generous but the default is 12.",
        ],
        formula: "n × k for k = 1 … limit",
      },
      examples: [
        {
          title: "The seven times table",
          steps: ["Enter 7.", "Keep the limit at 12.", "Highlight 8 to drill 7 × 8."],
          result: "Twelve facts from 7 to 84, with 7 × 8 emphasised",
        },
        {
          title: "A reference sheet to 20",
          steps: ["Enter 13 and set the limit to 20."],
          result: "Twenty facts for older students working beyond the standard tables",
        },
      ],
      limitations: [
        "A table does not teach recall. Cover the answers and practise retrieval, or the sheet becomes a crutch.",
        "It only generates one number's table at a time; a full grid is a different tool.",
        "Negative numbers are allowed, but the square highlight follows the absolute value.",
      ],
      faqs: [
        {
          q: "Which times tables should a child learn first?",
          a: "2, 5 and 10, then doubles and near-doubles. The 7s and 8s are usually last because they have the fewest shortcuts.",
        },
        {
          q: "Why highlight the square?",
          a: "Squares are the facts children most often confuse with a neighbour — 7 × 8 = 56 is commonly answered as 54. Seeing it in context helps.",
        },
        {
          q: "Can I print this?",
          a: "Copy the text into a document and print it, or download the file. The page is designed to read cleanly as plain text.",
        },
      ],
    },
  },
  {
    slug: "roman-numeral-converter",
    name: "Roman Numeral Converter",
    category: "education",
    tagline: "Convert both ways with the classical subtractive rules enforced.",
    intent: "roman numeral converter",
    keywords: ["roman numeral converter", "roman numerals to numbers", "numbers to roman numerals", "roman numeral chart", "mcmxciv", "roman numeral translator"],
    status: "live",
    actions: ["copy"],
    effort: "instant",
    popularity: 84,
    addedAt: "2025-03-04",
    seoTitle: "Roman Numeral Converter — Both Directions, Validated",
    seoDescription:
      "Convert numbers to Roman numerals and back, with the classical subtractive rules enforced and a reference chart of every symbol and pair.",
    content: {
      intro: [
        "Roman numerals are a subtractive system with strict rules, and most online converters quietly accept invalid forms. This one only returns a result that round-trips, so IIII or VX is rejected rather than silently read as 4 or 5.",
        "The range is 1 to 3999 — the classical limit, because standard numerals have no symbol for zero and no agreed bar notation here.",
      ],
      howTo: [
        "Choose the direction: number to Roman, or Roman to number.",
        "Type the value.",
        "Read the result, or the specific reason it was rejected.",
        "Check the symbol chart if you are learning the rules.",
      ],
      method: {
        title: "Subtractive notation, enforced by round-trip",
        paragraphs: [
          "Values are decomposed greedily from 1000 down to 1 using the thirteen canonical pairs: M, CM, D, CD, C, XC, L, XL, X, IX, V, IV, I. That produces MCMXCIV for 1994.",
          "For the reverse direction the numeral is read with the subtractive rule — a smaller symbol before a larger one is subtracted — and then converted back to a numeral. If the two do not match, the input was not canonical and is rejected.",
        ],
        formula: "1994 = 1000 + 900 + 90 + 4 = M + CM + XC + IV",
      },
      examples: [
        {
          title: "A year",
          steps: ["Enter 1994.", "Read MCMXCIV."],
          result: "MCMXCIV, the standard form used on copyright pages",
        },
        {
          title: "An invalid numeral",
          steps: ["Switch to Roman to number.", "Enter IIII."],
          result: "Rejected — the canonical form is IV; IIII is a clock-face convention",
        },
      ],
      limitations: [
        "Numbers above 3999 need overbars or alternative notation, which this tool does not implement.",
        "Clock faces and some monuments use IIII instead of IV by convention; that is not classical usage and is rejected here.",
        "Zero and negative numbers have no Roman representation.",
      ],
      faqs: [
        {
          q: "Why is 4 IV and not IIII?",
          a: "The subtractive rule places a smaller value before a larger one to mean subtraction, so IV is 5 − 1. IIII survives only as a clock-face tradition.",
        },
        {
          q: "What is the largest Roman numeral?",
          a: "With the seven standard symbols, 3999 is MMMCMXCIX. Larger values need a bar over a symbol to multiply by 1000, which is not standardised across contexts.",
        },
        {
          q: "Is there a Roman numeral for zero?",
          a: "No. The system has no zero symbol; nulla was used in medieval Latin for nothing, but it is not a Roman numeral.",
        },
      ],
    },
  },
  {
    slug: "scientific-notation-converter",
    name: "Scientific Notation Converter",
    category: "education",
    tagline: "One number as scientific, engineering and e-notation.",
    intent: "scientific notation converter",
    keywords: ["scientific notation converter", "standard form calculator", "engineering notation", "e notation converter", "scientific to decimal", "significant figures"],
    status: "live",
    actions: ["copy"],
    effort: "instant",
    popularity: 74,
    addedAt: "2025-03-04",
    seoTitle: "Scientific Notation Converter — Scientific and Engineering",
    seoDescription:
      "Convert a number between decimal, scientific, engineering and e-notation, with the exponent, coefficient and significant figures shown explicitly.",
    content: {
      intro: [
        "Scientific notation puts one non-zero digit before the decimal point; engineering notation keeps the exponent a multiple of three so it matches SI prefixes. Both describe the same number, and mixing them up is a common source of factor-of-a-thousand errors.",
        "Paste any form — 0.00042, 6.02 × 10^23 or 1.5e-7 — and the page returns all three conventions with the exponent and significant figures.",
      ],
      howTo: [
        "Type or paste the number in any common form.",
        "Read the scientific, engineering and e-notation equivalents.",
        "Check the exponent and significant figures.",
        "Copy the form your answer needs.",
      ],
      method: {
        title: "Exponents and the multiple-of-three rule",
        paragraphs: [
          "For a positive value, the exponent is floor(log₁₀|value|) and the coefficient is the value divided by 10 to that power. Engineering notation uses the nearest multiple of three below the exponent, giving coefficients between 1 and 1000.",
          "Significant figures are counted from the coefficient: 6.02 has three, so the input carried three. This matters in lab work, where the answer must not claim more precision than the measurement.",
        ],
        formula: "value = coefficient × 10^exponent, 1 ≤ |coefficient| < 10",
      },
      examples: [
        {
          title: "A small measurement",
          steps: ["Enter 0.00042."],
          result: "4.2 × 10⁻⁴, which is 420 × 10⁻⁶ — the engineering form",
        },
        {
          title: "Avogadro's number",
          steps: ["Paste 6.02 × 10^23."],
          result: "6.02 × 10²³ scientific, 602 × 10²¹ engineering",
        },
      ],
      limitations: [
        "Values are stored as 64-bit floats, so integers beyond 2⁵³ lose precision before any formatting happens.",
        "The converter cannot know how many significant figures your measurement had; it infers them from what you typed.",
        "Superscripts are for display — in code, use the e-notation form, which every language parses.",
      ],
      faqs: [
        {
          q: "What is the difference between scientific and engineering notation?",
          a: "Scientific notation restricts the coefficient to 1–10. Engineering notation allows 1–1000 and keeps the exponent divisible by three, so it maps onto kilo, mega, milli and micro.",
        },
        {
          q: "How do I write 0.00042 in scientific notation?",
          a: "Move the decimal four places right, giving 4.2 × 10⁻⁴.",
        },
        {
          q: "Which form should I use in code?",
          a: "E-notation: 4.2e-4. JavaScript, Python, C and most spreadsheets parse it and it needs no special characters.",
        },
      ],
    },
  },
  {
    slug: "number-to-words-converter",
    name: "Number to Words Converter",
    category: "education",
    tagline: "Write any number out in English, for cheques and forms.",
    intent: "number to words",
    keywords: ["number to words", "numbers in words converter", "amount in words", "cheque amount words", "spell out numbers", "number spelling"],
    status: "live",
    actions: ["copy"],
    effort: "instant",
    popularity: 78,
    addedAt: "2025-03-04",
    seoTitle: "Number to Words Converter — Cheques and Forms",
    seoDescription:
      "Convert numbers to English words for cheques, invoices and forms, with British or American “and”, decimal reading and a currency-style amount.",
    content: {
      intro: [
        "Writing an amount in words is a fraud control: the words on a cheque are what a bank reads when the figures are unclear. Spelling them out correctly — with hyphens and the right scale word — still matters.",
        "This converter handles integers, negatives and decimals up to six places, with a switch for the British “and” and a currency reading for invoices.",
      ],
      howTo: [
        "Type the number.",
        "Choose whether to use British “and” (one hundred and one).",
        "Decide whether to read the decimal part.",
        "Copy the words, or the currency form for a cheque.",
      ],
      method: {
        title: "Short scale, hyphenated tens",
        paragraphs: [
          "Numbers are grouped in threes and read with short-scale words: thousand, million, billion. British English inserts “and” before a final group under one hundred, and hyphenates compound tens such as twenty-one.",
          "Decimals are read digit by digit after “point”, so 4.5 is four point five and 4.05 is four point zero five — not four point five, which would be a different number.",
        ],
        formula: "1234567 → one million two hundred and thirty-four thousand five hundred and sixty-seven",
      },
      examples: [
        {
          title: "A cheque amount",
          steps: ["Enter 1234.56.", "Copy the currency reading."],
          result: "One thousand two hundred and thirty-four and 56/100",
        },
        {
          title: "A small decimal",
          steps: ["Enter -4.5 with decimals on."],
          result: "Minus four point five",
        },
      ],
      limitations: [
        "Only English is supported, and only the short scale — a British billion is 10⁹ here, not the historical 10¹².",
        "Amounts above 10¹⁸ are refused rather than guessed at, because JavaScript integers lose precision.",
        "Banks differ on hyphenation and capitalisation; match the style the form asks for.",
      ],
      faqs: [
        {
          q: "How do I write a cheque amount in words?",
          a: "Whole units in words, then the cents as a fraction: “one thousand two hundred and thirty-four and 56/100”. Draw a line after it so nothing can be added.",
        },
        {
          q: "Is it “one hundred one” or “one hundred and one”?",
          a: "Both are correct; British English uses “and”, American English often omits it. The switch lets you match the audience.",
        },
        {
          q: "Why is a billion 10⁹ here?",
          a: "That is the short scale, used in the US, UK since 1974 and most international contexts. The long scale (10¹²) is historical in British English.",
        },
      ],
    },
  },
  {
    slug: "words-to-number-converter",
    name: "Words to Number Converter",
    category: "education",
    tagline: "Turn “four million two hundred thousand” into 4200000.",
    intent: "words to number",
    keywords: ["words to number", "word to number converter", "spelled number to digits", "convert words to numbers", "number words parser", "read number words"],
    status: "live",
    actions: ["copy"],
    effort: "instant",
    popularity: 66,
    addedAt: "2025-03-04",
    seoTitle: "Words to Number Converter — Spelled Numbers to Digits",
    seoDescription:
      "Convert English number words into digits, including hyphens, “and”, scale words, minus and decimals, with a clear error when a phrase is not readable.",
    content: {
      intro: [
        "The reverse of spelling out a number is surprisingly fiddly: “one hundred thousand” multiplies differently from “one hundred and thousand”, and “point” switches the reader into digit mode.",
        "This parser reads the phrase greedily left to right, applies hundred and scale words correctly, and refuses phrases it cannot interpret instead of returning a plausible wrong answer.",
      ],
      howTo: [
        "Type or paste the number phrase.",
        "Hyphens, commas and “and” are ignored.",
        "Use “point” for decimals and “minus” or “negative” for negatives.",
        "Read the digits, or the error if a word is not a number word.",
      ],
      method: {
        title: "Groups, scales and points",
        paragraphs: [
          "“Hundred” multiplies the current group; thousand, million and above move that group into the total. Digits after “point” are concatenated, so “four point zero five” is 4.05 rather than 4.5.",
          "A word that is not a number word aborts the parse. That is deliberate: guessing would let a typo silently change an amount.",
        ],
        formula: "total = Σ(group × 1000^scale) + decimal digits",
      },
      examples: [
        {
          title: "A round figure",
          steps: ["Enter “four million two hundred thousand”."],
          result: "4200000",
        },
        {
          title: "A decimal",
          steps: ["Enter “minus four point five”."],
          result: "−4.5",
        },
      ],
      limitations: [
        "English only, short scale only.",
        "It expects standard number words; dialect forms such as “a hundred” are not handled.",
        "Very large phrases beyond 10¹⁸ will lose precision once converted to a JavaScript number.",
      ],
      faqs: [
        {
          q: "Does it handle “and”?",
          a: "Yes, “and” is ignored entirely, so “one hundred and one” and “one hundred one” both give 101.",
        },
        {
          q: "What about fractions like “three quarters”?",
          a: "Not supported — this parser handles whole numbers and decimal readings only.",
        },
        {
          q: "Why did my phrase fail?",
          a: "At least one word was not a recognised number word. The error says so rather than returning a number built from the words it did understand.",
        },
      ],
    },
  },
  {
    slug: "equation-solver",
    name: "Equation Solver",
    category: "education",
    tagline: "Linear and quadratic equations, solved with the steps shown.",
    intent: "solve an equation",
    keywords: ["equation solver", "quadratic equation solver", "solve for x", "linear equation solver", "quadratic formula calculator", "discriminant"],
    status: "live",
    actions: ["copy"],
    effort: "instant",
    popularity: 82,
    addedAt: "2025-03-04",
    seoTitle: "Equation Solver — Linear and Quadratic With Steps",
    seoDescription:
      "Solve linear and quadratic equations for x, see the standard form, the discriminant and the vertex, and get an explanation when there are no real roots.",
    content: {
      intro: [
        "An answer without a derivation is not much help when you have to show working. This solver rearranges both sides into standard form, prints the coefficients, the discriminant and the roots, and explains the cases where there is no single answer.",
        "Type the equation as it appears on the page — 3x + 5 = 20 or x^2 - 5x + 6 = 0 — including the equals sign.",
      ],
      howTo: [
        "Type the equation with a single = sign.",
        "Read the standard form and the coefficients.",
        "Check the discriminant to see how many real roots exist.",
        "Copy the roots, or follow the steps to reproduce them.",
      ],
      method: {
        title: "From both sides to ax² + bx + c = 0",
        paragraphs: [
          "Each side is parsed into a polynomial, then subtracted to give a single expression equal to zero. If the x² coefficient is zero the equation is linear and solved directly. Otherwise the discriminant b² − 4ac decides the case: positive gives two roots, zero gives one repeated root, negative gives none in the reals.",
          "When the variable cancels completely the equation is either an identity — true for every x — or a contradiction with no solution. Both are reported as such rather than as a root of zero.",
        ],
        formula: "x = (−b ± √(b² − 4ac)) ÷ 2a",
      },
      examples: [
        {
          title: "A linear equation",
          steps: ["3x + 5 = 20.", "3x = 15.", "x = 5."],
          result: "One real root, x = 5",
        },
        {
          title: "No real roots",
          steps: ["x^2 + 1 = 0.", "Discriminant = −4."],
          result: "No real solutions; the vertex (0, 1) is the closest the curve gets",
        },
      ],
      limitations: [
        "One variable only, and no brackets: 4(x + 2) = 12 must be written as 4x + 8 = 12.",
        "Irrational roots are shown as decimals, not exact surds — √5 appears as 2.2360679…",
        "Simultaneous equations and inequalities are outside this tool.",
      ],
      faqs: [
        {
          q: "What if the discriminant is zero?",
          a: "The parabola touches the x-axis once, so there is a single repeated root at x = −b / 2a.",
        },
        {
          q: "Why do I get “no solution”?",
          a: "Either the variable cancels and the constants disagree (a contradiction), or the quadratic has a negative discriminant and therefore no real roots.",
        },
        {
          q: "Can it solve equations with brackets?",
          a: "Not directly. Expand them first — 3(x − 1) = 9 becomes 3x − 3 = 9 — and paste the expanded form.",
        },
      ],
    },
  },
  {
    slug: "algebra-calculator",
    name: "Algebra Calculator",
    category: "education",
    tagline: "Combine like terms, evaluate at x, or solve a 2×2 system.",
    intent: "algebra calculator",
    keywords: ["algebra calculator", "simplify expression", "combine like terms", "evaluate expression", "system of equations solver", "cramer rule"],
    status: "live",
    actions: ["copy"],
    effort: "instant",
    popularity: 80,
    addedAt: "2025-03-04",
    seoTitle: "Algebra Calculator — Simplify, Evaluate, Solve Systems",
    seoDescription:
      "Simplify polynomials by combining like terms, evaluate an expression at a given x, or solve a two-variable system with Cramer's rule and a substitution check.",
    content: {
      intro: [
        "Three algebra chores cover most homework: tidying an expression into standard form, substituting a value, and solving two equations at once. Doing them by hand is the point, so each mode here shows the intermediate form as well as the answer.",
        "The system solver also substitutes the answer back into both equations, which catches the sign error that produces a confidently wrong pair.",
      ],
      howTo: [
        "Pick a mode: simplify, evaluate or solve a system.",
        "Type the polynomial — 3x, -x, 2x^2 and constants are understood.",
        "For evaluate, add the value of x; for a system, fill in the six coefficients.",
        "Read the simplified form or the coordinate pair.",
      ],
      method: {
        title: "Collecting terms and Cramer's rule",
        paragraphs: [
          "Simplification parses each term into a coefficient and a power, then sums the coefficients of x², x and the constant. That is exactly the process done on paper, which is why the coefficient grid is shown.",
          "The 2×2 system uses Cramer's rule: the determinant of the coefficient matrix divides the determinants formed by replacing each column with the constants. A zero determinant means there is no unique solution, which the page reports instead of dividing by zero.",
        ],
        formula: "x = (c₁b₂ − c₂b₁) ÷ (a₁b₂ − a₂b₁)",
      },
      examples: [
        {
          title: "Collecting like terms",
          steps: ["Enter 3x + 2x - 4 + x^2.", "Coefficients: a = 1, b = 5, c = −4."],
          result: "x² + 5x − 4",
        },
        {
          title: "A 2×2 system",
          steps: ["2x + y = 5 and x − y = 1.", "Solve and check both equations."],
          result: "x = 2, y = 1, with both sides equal after substitution",
        },
      ],
      limitations: [
        "Brackets are not expanded, and there is no factoring or symbolic division.",
        "Only polynomials in a single variable x are parsed; other letters are rejected.",
        "The system solver handles two equations in two unknowns, not three.",
      ],
      faqs: [
        {
          q: "Can it expand brackets?",
          a: "No. Expand by hand or in the equation solver first, then use this tool to combine the result.",
        },
        {
          q: "What does a zero determinant mean?",
          a: "The two lines are parallel or identical, so there is either no solution or infinitely many — the tool reports this rather than a false answer.",
        },
        {
          q: "How do I enter a negative coefficient?",
          a: "Type a minus sign, for example -3x + 4, or use the minus symbol; both are understood.",
        },
      ],
    },
  },
  {
    slug: "flashcard-generator",
    name: "Flashcard Generator",
    category: "education",
    tagline: "Turn a list of notes into Anki-ready flashcards.",
    intent: "make flashcards",
    keywords: ["flashcard generator", "make flashcards from notes", "anki card maker", "flashcard maker online", "study cards", "q and a cards"],
    status: "live",
    actions: ["copy", "download"],
    effort: "instant",
    popularity: 74,
    addedAt: "2025-03-04",
    seoTitle: "Flashcard Generator — Notes to Anki-Ready Cards",
    seoDescription:
      "Turn pasted notes into flashcards with tab, pipe, colon or Q/A separators, preview each card, and export as Anki TSV or CSV without uploading anything.",
    content: {
      intro: [
        "The fastest way to build a deck is to write the facts as one line each and let a parser split them. This tool accepts the separator you naturally type — a tab, a pipe, a colon or “Q:/A:” pairs — and shows exactly which lines it could not read.",
        "Nothing is uploaded. The export is a TSV that Anki imports directly, or a CSV for spreadsheet-based decks.",
      ],
      howTo: [
        "Paste your notes, one fact per line.",
        "Separate the front and back with a tab, pipe, colon, “ - ” or a Q:/A: pair.",
        "Click a card to check the answer side.",
        "Download the TSV and import it into Anki, mapping front and back.",
      ],
      method: {
        title: "Parsing and export formats",
        paragraphs: [
          "Each line is split at the first recognised separator. Tabs are checked first because they survive a paste from a spreadsheet, then pipes, then “ - ”, then colons and equals signs. A line starting with Q: pairs with the following A: line, which suits notes already written as questions.",
          "The TSV export uses a tab between fields and no quoting, which is Anki's default field separator. CSV quotes and doubles embedded quotes, so answers containing commas survive.",
        ],
        formula: "line → front ␉ back",
      },
      examples: [
        {
          title: "From a lecture list",
          steps: ["Paste ten lines of “term | definition”.", "Check the card count.", "Download the TSV."],
          result: "Ten cards ready for Anki, no editing needed",
        },
        {
          title: "From written questions",
          steps: ["Paste Q: and A: pairs.", "Read the preview and flip a card."],
          result: "Question on the front, answer on the back",
        },
      ],
      limitations: [
        "Cards are plain text — no images, audio or LaTeX rendering.",
        "A line without a separator is reported and skipped rather than guessed at.",
        "One idea per card is a rule the tool cannot enforce, but long backs are the usual reason a deck fails.",
      ],
      faqs: [
        {
          q: "Can I import these into Anki?",
          a: "Yes — download the TSV, then File → Import in Anki and map the two fields. Tabs are the separator Anki expects.",
        },
        {
          q: "How many cards should a deck have?",
          a: "As many as there are atomic facts, not as many as there are sentences. Ten well-cut cards beat fifty that each contain a paragraph.",
        },
        {
          q: "Is my text stored?",
          a: "No. Parsing happens in the page and the download is created locally from the text you pasted.",
        },
      ],
    },
  },
  {
    slug: "random-quiz-generator",
    name: "Random Quiz Generator",
    category: "education",
    tagline: "Multiple-choice practice built from your own facts.",
    intent: "make a quiz",
    keywords: ["random quiz generator", "multiple choice quiz maker", "practice quiz from notes", "quiz maker online", "test yourself", "revision quiz"],
    status: "live",
    actions: [],
    effort: "quick",
    popularity: 68,
    addedAt: "2025-03-04",
    seoTitle: "Random Quiz Generator — Multiple Choice From Your Notes",
    seoDescription:
      "Build a multiple-choice quiz from facts you paste, with distractors taken from your own answers, instant marking and a seed so a quiz can be reproduced.",
    content: {
      intro: [
        "Testing yourself is more effective than rereading, but writing questions is tedious. Paste facts in a list and this tool turns them into a quiz where the wrong options come from your own answers, so the choices are plausible rather than obviously silly.",
        "The shuffle is seeded: the same seed reproduces the same quiz, which matters if you want to give a class a consistent version.",
      ],
      howTo: [
        "Paste at least two facts, one per line.",
        "Choose how many questions and how many choices each has.",
        "Answer every question, then press check.",
        "Shuffle to generate a different version from the same bank.",
      ],
      method: {
        title: "Distractors and deterministic shuffling",
        paragraphs: [
          "Each question takes a fact from the shuffled bank and fills the remaining options with answers from other facts, avoiding duplicates. That produces distractors that are in the same domain — capital cities against capital cities — which makes the question discriminating.",
          "The shuffle uses a seeded pseudo-random generator, so question order and option order are reproducible from the seed. Pressing shuffle increments the seed, giving a new but still repeatable version.",
        ],
        formula: "question = fact + (n − 1) distractors from other facts",
      },
      examples: [
        {
          title: "Five questions, four choices",
          steps: ["Paste eight facts.", "Set 5 questions and 4 choices.", "Answer and check."],
          result: "A marked quiz with a score out of five",
        },
        {
          title: "A repeatable class quiz",
          steps: ["Note the seed shown.", "Generate and share the same version later."],
          result: "Identical questions and options for everyone",
        },
      ],
      limitations: [
        "The quality of the quiz is the quality of the facts you paste — the tool cannot spot a wrong answer.",
        "Distractors are other correct answers from your bank, so a bank of very different topics produces easy questions.",
        "It is practice, not assessment: no timing, no anti-cheating, no storage of results.",
      ],
      faqs: [
        {
          q: "How many facts do I need?",
          a: "At least as many as the question count plus one, and at least as many answers as the number of choices. Fewer facts produce repeated or missing options.",
        },
        {
          q: "Can I share the quiz?",
          a: "Not by link — it is generated in your browser. Export the facts and share those, along with the seed, so the same quiz can be regenerated.",
        },
        {
          q: "Are my answers saved?",
          a: "No. Answers live in page memory and are forgotten when you reload, which keeps the tool honest about not collecting data.",
        },
      ],
    },
  },
  {
    slug: "citation-formatter",
    name: "Citation Formatter",
    category: "education",
    tagline: "APA, MLA, Chicago and Harvard references from one set of fields.",
    intent: "format a citation",
    keywords: ["citation formatter", "apa citation generator", "mla citation", "harvard referencing", "chicago citation", "reference generator"],
    status: "live",
    actions: ["copy"],
    effort: "instant",
    popularity: 86,
    addedAt: "2025-03-04",
    seoTitle: "Citation Formatter — APA, MLA, Chicago and Harvard",
    seoDescription:
      "Enter a source once and get APA 7, MLA 9, Chicago and Harvard references side by side, with author initials, punctuation and URL placement handled.",
    content: {
      intro: [
        "The same book looks different in four styles, and the differences are structural rather than cosmetic: APA initials the given names and puts the year second; MLA spells names out and puts the year last.",
        "Enter the source once and compare all four forms side by side, then copy the one your department requires.",
      ],
      howTo: [
        "Fill in the authors, title and year at minimum.",
        "Add container, publisher, pages or URL where they apply.",
        "Switch style to compare formats.",
        "Copy the reference into your document and apply a hanging indent.",
      ],
      method: {
        title: "What changes between styles",
        paragraphs: [
          "APA emphasises the date: Author, A. A. (Year). Title. Source. MLA emphasises the source: Author, First, and Second Author. “Title.” Container, Year. Chicago uses notes and a bibliography with full names, and Harvard sits close to APA with parentheses around the year after the author.",
          "Author lists follow different rules too — APA uses an ampersand before the last name, MLA spells “and”, and three or more authors become “et al.” in MLA and Chicago but are listed up to twenty in APA.",
        ],
        formula: "reference = authors + date + title + source, ordered per style",
      },
      examples: [
        {
          title: "One book, four styles",
          steps: ["Jane Doe and John Smith, A History of Small Things, Acme Press, 2021.", "Switch between styles."],
          result: "Four different references that all point at the same source",
        },
        {
          title: "A web page",
          steps: ["Add the URL and an access date.", "Compare APA and Harvard."],
          result: "APA places the URL last; Harvard prefixes it with “Available at”",
        },
      ],
      limitations: [
        "Unusual sources — edited chapters, translated works, episodes, legal cases — need the official style manual for exact punctuation.",
        "No automatic DOI lookup or metadata import: you type the fields, which keeps the tool offline.",
        "Chicago has note and bibliography variants; this produces the bibliography form.",
      ],
      faqs: [
        {
          q: "Which style should I use?",
          a: "Whichever your department specifies. Psychology and education usually use APA, humanities MLA, history Chicago, and many UK universities Harvard.",
        },
        {
          q: "Do I need an access date?",
          a: "Only when the source is likely to change, such as a wiki or a news page. Stable journal articles and books do not need one in most styles.",
        },
        {
          q: "Why are the initials different between APA and MLA?",
          a: "APA identifies authors by surname and initials; MLA writes the first author surname-first and the rest in full name order.",
        },
      ],
    },
  },
  {
    slug: "bibliography-formatter",
    name: "Bibliography Formatter",
    category: "education",
    tagline: "A sorted, styled reference list from several sources.",
    intent: "make a bibliography",
    keywords: ["bibliography formatter", "reference list generator", "works cited", "bibliography maker", "harvard reference list", "apa reference list"],
    status: "live",
    actions: ["copy", "download"],
    effort: "quick",
    popularity: 72,
    addedAt: "2025-03-04",
    seoTitle: "Bibliography Formatter — Sorted Reference List",
    seoDescription:
      "Build a bibliography from several sources, sort it by author, title or year, and export a clean APA, MLA, Chicago or Harvard reference list as text.",
    content: {
      intro: [
        "A reference list is only correct if it is complete, consistently styled and ordered. This tool holds several sources at once, formats each in the chosen style and sorts the result the way the style requires.",
        "Sources without an author sort under their title, which is what APA, MLA and Chicago all specify — a detail hand-made lists often miss.",
      ],
      howTo: [
        "Add a row for each source with authors, title, container and year.",
        "Choose the style and the sort order.",
        "Check the preview for missing years or titles.",
        "Copy the list, or download it as a text file.",
      ],
      method: {
        title: "Ordering and completeness",
        paragraphs: [
          "Each entry is formatted individually, then sorted. Surname sorting uses the first author's last name; entries without one fall back to the title, which is the rule in the major styles.",
          "The tool also counts entries missing a year, because an undated reference is the most common thing a marker takes a mark off for. It does not invent dates.",
        ],
        formula: "list = sort(format(entry) for each source)",
      },
      examples: [
        {
          title: "Three sources, APA",
          steps: ["Add Adams, Bell and Achebe.", "Sort by author surname."],
          result: "Achebe, Adams, Bell — alphabetical, each fully formatted",
        },
        {
          title: "Sorted by year instead",
          steps: ["Switch sort to year.", "Check the chronology."],
          result: "Oldest first, useful for a literature review",
        },
      ],
      limitations: [
        "It formats bibliography entries, not in-text citations — those still need author and year placed in your prose.",
        "Every entry must actually be cited in the text; the tool cannot check that.",
        "Exact punctuation for unusual sources should be checked against the style manual.",
      ],
      faqs: [
        {
          q: "What is the difference between a bibliography and works cited?",
          a: "Works cited lists only sources referenced in the text. A bibliography may include background reading. MLA calls its list Works Cited; APA calls it References.",
        },
        {
          q: "How should entries be ordered?",
          a: "Alphabetically by first author surname, with undated or anonymous works under their titles. Chronological order is only used in specific citation styles such as some numeric systems.",
        },
        {
          q: "Can I export this into Word?",
          a: "Copy the plain text and paste it, then apply a hanging indent to the paragraphs. The download is plain text so it survives the paste.",
        },
      ],
    },
  },
  {
    slug: "essay-word-counter",
    name: "Essay Word Counter",
    category: "education",
    tagline: "Word count against your limit, plus how the essay reads.",
    intent: "essay word count",
    keywords: ["essay word counter", "essay length checker", "word count for essay", "essay word limit", "paragraph counter", "readability checker for essays"],
    status: "live",
    actions: [],
    effort: "instant",
    popularity: 78,
    addedAt: "2025-03-04",
    seoTitle: "Essay Word Counter — Words, Paragraphs and Readability",
    seoDescription:
      "Count an essay's words against its limit, see paragraph balance, average sentence length and readability, and check whether you are over or short.",
    content: {
      intro: [
        "Word count is a constraint, not a target: a 2,000-word essay that says what it needs in 1,700 is better than one padded to the limit. This counter shows the number against your limit and, more usefully, how the words are distributed.",
        "Paragraph balance and sentence length are what a marker notices first. A single 400-word paragraph or six consecutive 40-word sentences reads as unedited, whatever the total.",
      ],
      howTo: [
        "Paste the essay.",
        "Enter the word limit or minimum you were given.",
        "Read the difference and the percentage of the target.",
        "Check the paragraph table and the longest sentence.",
      ],
      method: {
        title: "Counting the way a word processor does",
        paragraphs: [
          "Words are runs of non-whitespace, so hyphenated compounds count as one and numbers as one each. That matches Microsoft Word closely; Google Docs and most submission systems agree within a percent.",
          "Readability scores convert sentence length and syllables into a grade level. They are a proxy, not a judgement — dense academic prose scores high on purpose, and a low score is not automatically better writing.",
        ],
        formula: "words = whitespace-separated runs; grade = Flesch–Kincaid",
      },
      examples: [
        {
          title: "Over the limit",
          steps: ["Paste 1,650 words against a 1,500 limit."],
          result: "150 words over — 10% to cut, usually from repeated examples",
        },
        {
          title: "One bloated paragraph",
          steps: ["Look at the paragraph table.", "Find a paragraph above 180 words."],
          result: "Flagged as long — splitting it improves the reading",
        },
      ],
      limitations: [
        "Counting rules differ slightly between tools, especially for hyphenated words and references. Check the system you submit through at a hard limit.",
        "Readability formulas assume English prose and are unreliable on quotations, lists and technical notation.",
        "The tool sees text, not argument: it cannot tell you whether the essay answers the question.",
      ],
      faqs: [
        {
          q: "Does the word limit include references?",
          a: "Usually not — most rubrics exclude the bibliography and appendices. Confirm in your handbook, because it changes the target by several hundred words.",
        },
        {
          q: "Why is my count different from Word?",
          a: "Word may exclude text boxes, footnotes or headers, and its hyphenation rules differ slightly. Paste only the body text for the closest match.",
        },
        {
          q: "Is a high readability grade bad?",
          a: "Not necessarily. Academic writing is dense by convention. What matters is that no sentence runs past about 35 words without a reason.",
        },
      ],
    },
  },
];
