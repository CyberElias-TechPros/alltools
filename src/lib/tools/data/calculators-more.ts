import type { ToolDefinition } from "../types";

/**
 * Calculators from docs/BLUEPRINT.md §B that were not in the first release.
 * Each one is backed by a component that computes in the browser and by pure
 * functions in src/lib/math.ts or src/lib/calc.ts covered by tests.
 */
export const calculatorMoreTools: ToolDefinition[] = [
  {
    slug: "basic-calculator",
    name: "Basic Calculator",
    category: "calculators",
    tagline: "A four-function calculator with a running history and keyboard support.",
    intent: "do quick arithmetic without opening a spreadsheet",
    keywords: ["basic calculator", "online calculator", "four function calculator", "free calculator"],
    status: "live",
    actions: ["copy"],
    effort: "instant",
    popularity: 95,
    addedAt: "2025-11-02",
    seoTitle: "Basic Calculator — Free Online Four-Function Calculator",
    seoDescription:
      "Do quick arithmetic with a keyboard-friendly calculator: add, subtract, multiply, divide, brackets and remainders, with a history of your last calculations.",
    content: {
      intro: [
        "A calculator should open instantly and never ask you to create an account. This one runs entirely in the page: type an expression, press Enter, and the result appears with your last few sums kept in a short history.",
        "It reads expressions rather than single operations, so you can paste a line like (1250-980)*1.2 and get the answer in one step instead of chaining buttons.",
      ],
      howTo: [
        "Type a sum into the expression field, or tap the number keys.",
        "Use * and / for multiply and divide, ^ for a power and brackets to group.",
        "Press Enter or the equals button to evaluate.",
        "Click any line in the history to load it back into the input.",
      ],
      method: {
        title: "How expressions are read",
        paragraphs: [
          "The expression is tokenised and evaluated with the standard order of operations: brackets first, then powers, then multiply and divide, then add and subtract, with same-precedence operations evaluated left to right.",
          "No JavaScript is executed. The page parses the text itself, which means pasted text can never run code and the tool keeps working offline.",
        ],
        formula: "2 + 3 × 4 = 14   ·   (2 + 3) × 4 = 20",
      },
      examples: [
        {
          title: "Splitting a bill with a tip",
          steps: ["Enter (86.40*1.15)/4", "Multiply the total by 1.15 for a 15% tip.", "Divide by four people."],
          result: "24.84 each",
        },
        {
          title: "Checking a unit price",
          steps: ["Enter 12.79/6", "Compare the answer with the shelf tag."],
          result: "2.13 per item",
        },
      ],
      limitations: [
        "It is not a scientific calculator: use the Scientific Calculator for trigonometry, logs and roots.",
        "% returns the remainder of a division, not a percentage.",
        "Very large intermediate values may lose precision because JavaScript numbers are doubles.",
      ],
      faqs: [
        { q: "Does it work with the keyboard?", a: "Yes. Type digits and operators, press Enter to evaluate, and use Backspace to correct a character." },
        { q: "Can I use it offline?", a: "Once the page has loaded, all arithmetic happens locally and needs no connection." },
        { q: "Why does 0.1 + 0.2 show 0.3?", a: "Results are rounded to twelve significant digits before display, which hides the tiny binary floating-point error." },
      ],
    },
  },
  {
    slug: "scientific-calculator",
    name: "Scientific Calculator",
    category: "calculators",
    tagline: "Trigonometry, logarithms, roots and constants with degree or radian input.",
    intent: "calculate scientific functions without a physical calculator",
    keywords: ["scientific calculator", "trigonometry calculator", "log calculator", "sin cos tan calculator"],
    status: "live",
    actions: ["copy"],
    effort: "instant",
    popularity: 90,
    addedAt: "2025-11-02",
    seoTitle: "Scientific Calculator — Trig, Logs, Roots and Powers Online",
    seoDescription:
      "A free scientific calculator for sin, cos, tan, log, ln, square and cube roots, powers, pi and e, with a degree/radian switch and calculation history.",
    content: {
      intro: [
        "Scientific calculators are usually either physical or buried inside a paid app. This one gives you the functions students and engineers reach for — trigonometry, logarithms, roots, powers and constants — on any device.",
        "Angle mode matters: sin(30) is 0.5 in degrees but −0.988 in radians. The switch is visible on screen so you always know which unit the answer is in.",
      ],
      howTo: [
        "Type an expression such as 2*sin(45)+sqrt(9), or use the keypad.",
        "Set the Degrees switch to match the unit in your problem.",
        "Press Enter or equals to evaluate.",
        "Copy the result, or click a history line to reuse it.",
      ],
      method: {
        title: "Functions and precedence",
        paragraphs: [
          "The evaluator follows the usual order of operations. Functions apply to the value that follows them, which can be a bracketed expression: sqrt(16+9) takes the root of 25, not of 16 plus 9.",
          "Trigonometric functions accept degrees when the switch is on and radians when it is off; inverse functions return results in the selected unit.",
        ],
        formula: "log(1000) = 3   ·   sin(90°) = 1   ·   2^10 = 1024",
      },
      examples: [
        {
          title: "Resolving a force at 35°",
          steps: ["Turn Degrees on.", "Enter 120*cos(35).", "The horizontal component is returned."],
          result: "98.30",
        },
        {
          title: "Doubling time from a growth rate",
          steps: ["Enter ln(2)/0.07.", "ln(2) is about 0.693."],
          result: "9.90 periods",
        },
      ],
      limitations: [
        "Angles must be entered in the selected unit; there is no automatic detection.",
        "Only real results are returned, so sqrt(-1) reports an error rather than an imaginary number.",
        "Mixed forms such as 2sin(30) without a multiplication sign are rejected.",
      ],
      faqs: [
        { q: "Is log base 10 or base e?", a: "log() is base 10 and ln() is base e. Use log2() for base 2, which is handy for bit widths." },
        { q: "How do I type a power?", a: "Use the ^ key: 2^8 means 2 to the eighth power, and powers bind tighter than multiplication." },
        { q: "Which constants are available?", a: "pi, e and tau (2π). They can be used anywhere a number can." },
      ],
    },
  },
  {
    slug: "sales-tax-calculator",
    name: "Sales Tax Calculator",
    category: "calculators",
    tagline: "Add sales tax to a price, or split tax back out of a tax-inclusive total.",
    intent: "calculate sales tax on a purchase",
    keywords: ["sales tax calculator", "add sales tax", "reverse sales tax", "tax inclusive price"],
    status: "live",
    actions: ["copy"],
    effort: "instant",
    popularity: 82,
    addedAt: "2025-11-02",
    seoTitle: "Sales Tax Calculator — Add or Reverse Sales Tax",
    seoDescription:
      "Work out sales tax on a price, or strip tax out of a tax-inclusive total. Enter a rate for any state or county and see the subtotal, tax and total.",
    content: {
      intro: [
        "Sales tax is charged on top of the shelf price, but receipts, invoices and marketplace listings often quote the total only. This calculator works in both directions: add tax to a net price, or split tax out of a gross one.",
        "Rates differ by state, county and sometimes city, and some categories are exempt, so the rate is an input rather than a fixed assumption.",
      ],
      howTo: [
        "Enter the price and the applicable sales tax rate.",
        "Set the quantity if you are buying more than one unit.",
        "Turn on the tax-inclusive switch if your figure already contains tax.",
        "Copy the subtotal, tax and total lines into your invoice or budget.",
      ],
      method: {
        title: "Forward and reverse tax",
        paragraphs: [
          "To add tax, multiply the price by the rate divided by 100 and add it to the price. To remove tax from an inclusive total, divide by one plus the rate as a decimal: a $108 total at 8% contains $100 of goods and $8 of tax.",
          "The reverse calculation is not the same as subtracting 8% — subtracting a percentage of the total removes too much, because the percentage should apply to the pre-tax amount.",
        ],
        formula: "tax = price × rate ÷ 100   ·   net = gross ÷ (1 + rate ÷ 100)",
      },
      examples: [
        {
          title: "$249.99 at 8.25%",
          steps: ["Price 249.99, rate 8.25.", "Tax = 20.62."],
          result: "$270.61 total",
        },
        {
          title: "Reverse a $108 receipt at 8%",
          steps: ["Turn on tax-inclusive.", "108 ÷ 1.08 = 100."],
          result: "$100.00 net, $8.00 tax",
        },
      ],
      limitations: [
        "One rate at a time: mixed baskets with exempt items need a line-by-line calculation.",
        "Local surcharges and rounding rules (for example rounding tax to the nearest cent per line) are not applied automatically.",
        "Rates change; confirm the current rate with the state or local tax authority.",
      ],
      faqs: [
        { q: "Why is reverse tax not simply total minus 8%?", a: "Because 8% applies to the pre-tax price. On a $108 total, 8% of $108 is $8.64, which would leave $99.36 — the correct split is $100 plus $8." },
        { q: "Does this work for VAT or GST?", a: "Yes. VAT and GST are also percentage taxes on the price, so the same forward and reverse maths applies." },
        { q: "Should I round tax per item or per invoice?", a: "Follow local rules; many jurisdictions round the total tax to the nearest cent, while some require rounding each line." },
      ],
    },
  },
  {
    slug: "markup-calculator",
    name: "Markup Calculator",
    category: "calculators",
    tagline: "Turn a unit cost into a selling price from a markup or a target margin.",
    intent: "calculate selling price from cost and markup",
    keywords: ["markup calculator", "markup vs margin", "selling price calculator", "cost plus pricing"],
    status: "live",
    actions: ["copy"],
    effort: "instant",
    popularity: 78,
    addedAt: "2025-11-02",
    seoTitle: "Markup Calculator — Selling Price, Profit and Margin",
    seoDescription:
      "Convert cost into a selling price using a markup on cost or a gross margin on price. See profit per unit, margin percentage and profit at several volumes.",
    content: {
      intro: [
        "Markup and margin describe the same profit from different directions, which is why quotes so often disagree by a few points. Markup is measured against cost; margin is measured against the selling price.",
        "Enter either one and the calculator returns the selling price, the profit per unit and the other percentage, so the two figures always reconcile.",
      ],
      howTo: [
        "Enter the unit cost.",
        "Choose whether you know a markup on cost or a target gross margin.",
        "Enter the percentage rate.",
        "Read the selling price and check the profit column at higher volumes.",
      ],
      method: {
        title: "The two formulas",
        paragraphs: [
          "A markup on cost multiplies the cost: price = cost × (1 + markup ÷ 100). A gross margin divides by the complement: price = cost ÷ (1 − margin ÷ 100), because the margin is a share of the price you have not set yet.",
          "Margin can never reach 100%, because that would require an infinite price. Markup has no such ceiling.",
        ],
        formula: "price = cost × (1 + markup%)   ·   price = cost ÷ (1 − margin%)",
      },
      examples: [
        {
          title: "60% markup on an $18.40 cost",
          steps: ["Cost 18.40, markup 60.", "18.40 × 1.6 = 29.44."],
          result: "$29.44 price, 37.5% margin",
        },
        {
          title: "Targeting a 40% margin",
          steps: ["Switch to margin.", "Enter 40 with the same cost.", "18.40 ÷ 0.6 = 30.67."],
          result: "$30.67 price",
        },
      ],
      limitations: [
        "Only unit cost and price are modelled; shipping, payment fees and overheads are excluded.",
        "Discounts applied later reduce the achieved margin, sometimes sharply.",
        "Currency is shown in dollars — the arithmetic is currency-agnostic.",
      ],
      faqs: [
        { q: "Is a 100% markup the same as a 50% margin?", a: "Yes. Doubling the cost means profit equals cost, which is half of the selling price." },
        { q: "Which should I quote to a retailer?", a: "Retail buyers usually think in margin, because their shelf price is fixed and they need a known percentage. Suppliers often think in markup." },
        { q: "Why does a 50% discount wipe out a 50% margin?", a: "The discount applies to the price, not the cost, so halving the price leaves nothing above cost." },
      ],
    },
  },
  {
    slug: "ratio-calculator",
    name: "Ratio Calculator",
    category: "calculators",
    tagline: "Simplify a ratio and scale it to any known value, with each part broken out.",
    intent: "simplify and scale a ratio",
    keywords: ["ratio calculator", "simplify ratio", "scale ratio", "aspect ratio calculator"],
    status: "live",
    actions: ["copy"],
    effort: "instant",
    popularity: 76,
    addedAt: "2025-11-02",
    seoTitle: "Ratio Calculator — Simplify and Scale Ratios",
    seoDescription:
      "Simplify a ratio such as 16:9 or 2:3:5, then scale it from any known value. See every part, the total and each part's share of it, instantly.",
    content: {
      intro: [
        "A ratio is a recipe for proportion: as long as every part scales by the same factor, the relationship holds. The two things people actually need are simplification and scaling, and this calculator does both from one input.",
        "It handles two-part ratios like 16:9 and multi-part ratios like 2:3:5, which appear in concrete mixes, profit splits and image dimensions.",
      ],
      howTo: [
        "Enter the ratio with colons, slashes or spaces.",
        "Enter the value you already know.",
        "Say which part that value belongs to.",
        "Read the scaled values, the simplified ratio and each part's share of the total.",
      ],
      method: {
        title: "Simplifying and scaling",
        paragraphs: [
          "To simplify, divide every part by the greatest common divisor of all the parts. 1920:1080 becomes 16:9 because both divide by 120.",
          "To scale, divide the known value by its ratio part to find the unit, then multiply the unit by every part. This works in either direction, including when the known value belongs to a later part.",
        ],
        formula: "unit = known ÷ its part   ·   scaled part = unit × part",
      },
      examples: [
        {
          title: "A 1920-wide 16:9 frame",
          steps: ["Ratio 16:9, known value 1920 on part 1.", "Unit = 120.", "120 × 9 = 1080."],
          result: "1920 × 1080",
        },
        {
          title: "Splitting $600 in 2:3:5",
          steps: ["Enter 2:3:5 with 600 known on the last part.", "Unit = 60.", "Parts become 120, 180 and 300."],
          result: "$120, $180, $300",
        },
      ],
      limitations: [
        "Parts must be numbers greater than zero.",
        "Decimal parts are supported but the simplified form is most readable with whole numbers.",
        "A ratio says nothing about units: 1:2 could be grams to millilitres or people to rooms.",
      ],
      faqs: [
        { q: "What does a simplified ratio tell me?", a: "The smallest whole numbers with the same proportion, which is the form usually written in specs and drawings." },
        { q: "Can I solve 3:4 = 6:? with this?", a: "Yes — enter 3:4, set the known value to 6 on part 1, and the second part comes back as 8." },
        { q: "Is aspect ratio calculated the same way?", a: "Yes. A 3440×1440 monitor reduces to 43:18, which is close to but not exactly 21:9." },
      ],
    },
  },
  {
    slug: "mean-median-mode-calculator",
    name: "Mean, Median and Mode Calculator",
    category: "calculators",
    tagline: "All three averages plus range and standard deviation from one list of numbers.",
    intent: "calculate mean median and mode",
    keywords: ["mean median mode calculator", "average calculator", "mode calculator", "median calculator"],
    status: "live",
    actions: ["copy"],
    effort: "instant",
    popularity: 80,
    addedAt: "2025-11-02",
    seoTitle: "Mean, Median and Mode Calculator with Range",
    seoDescription:
      "Paste a list of numbers to get the mean, median, mode, range and both standard deviations, plus a frequency table showing how often each value appears.",
    content: {
      intro: [
        "Three different numbers can all be called \"the average\", and the choice changes the story: a handful of very high salaries pulls the mean far above the median, while the mode simply reports the most common value.",
        "Paste any list — commas, spaces or new lines — and the calculator returns all three together, with the range and a frequency table so you can see the shape of the data.",
      ],
      howTo: [
        "Paste or type the numbers into the box.",
        "Separate values with commas, spaces or new lines.",
        "Read the mean, median and mode, along with range and standard deviation.",
        "Check the frequency table to see which values repeat.",
      ],
      method: {
        title: "How each average is defined",
        paragraphs: [
          "The mean adds every value and divides by the count. The median sorts the values and takes the middle one, or the average of the two middle values when the count is even. The mode is the value that appears most often; with no repeats there is no mode.",
          "The range is the largest value minus the smallest. Population standard deviation divides the squared deviations by n, and sample standard deviation divides by n − 1 for an unbiased estimate from a sample.",
        ],
        formula: "mean = Σx ÷ n   ·   median = middle of the sorted list   ·   mode = most frequent value",
      },
      examples: [
        {
          title: "Test scores: 12, 15, 11, 12, 19, 24, 12, 17, 15",
          steps: ["Sorted: 11, 12, 12, 12, 15, 15, 17, 19, 24.", "Mean = 137 ÷ 9.", "12 appears three times."],
          result: "mean 15.22, median 15, mode 12",
        },
        {
          title: "Shoe sizes 8, 8, 9, 10 and one outlier of 50",
          steps: ["The 50 drags the mean upwards.", "The median stays at 9."],
          result: "median is the better summary",
        },
      ],
      limitations: [
        "A data set can have several modes, which are all listed; it can also have none.",
        "The median shown is the standard average-of-two-middles definition for even counts.",
        "Outliers are not trimmed or flagged automatically.",
      ],
      faqs: [
        { q: "When should I use the median instead of the mean?", a: "When the data is skewed or has outliers — income, house prices and response times are classic examples." },
        { q: "What if two values tie for most frequent?", a: "Both are reported as modes. That distribution is called bimodal (or multimodal with more)." },
        { q: "Which standard deviation is shown?", a: "Both: population (÷ n) treats the list as the whole group, sample (÷ n − 1) estimates a larger group from it." },
      ],
    },
  },
  {
    slug: "fraction-calculator",
    name: "Fraction Calculator",
    category: "calculators",
    tagline: "Add, subtract, multiply or divide fractions and get the reduced answer.",
    intent: "add and subtract fractions",
    keywords: ["fraction calculator", "add fractions", "simplify fraction", "mixed number calculator"],
    status: "live",
    actions: ["copy"],
    effort: "instant",
    popularity: 74,
    addedAt: "2025-11-02",
    seoTitle: "Fraction Calculator — Add, Subtract, Multiply, Divide",
    seoDescription:
      "Calculate with fractions and get the answer reduced to lowest terms, as a mixed number, a decimal and a percentage. Decimals are converted automatically.",
    content: {
      intro: [
        "Fraction arithmetic is mechanical once the denominators match, and most mistakes come from that step rather than the final sum. This calculator shows the reduced fraction, the mixed number and the decimal side by side so you can check your working.",
        "You can enter proper fractions like 3/4, whole numbers, or decimals such as 0.75 — they are converted before the operation runs.",
      ],
      howTo: [
        "Type the first fraction as a/b, or as a decimal.",
        "Choose add, subtract, multiply or divide.",
        "Type the second fraction.",
        "Read the reduced answer, mixed number and decimal equivalents.",
      ],
      method: {
        title: "Common denominators and reduction",
        paragraphs: [
          "To add or subtract, rewrite both fractions with a common denominator, combine the numerators, then divide the result by the greatest common divisor. To multiply, multiply numerators and denominators directly; to divide, multiply by the reciprocal of the second fraction.",
          "Decimals are converted by finding the simplest fraction whose denominator is at most 10,000 and whose value matches within one part in 10,000.",
        ],
        formula: "a/b + c/d = (ad + bc)/bd   ·   a/b ÷ c/d = a/b × d/c",
      },
      examples: [
        {
          title: "3/4 + 5/6",
          steps: ["Common denominator 12.", "9/12 + 10/12 = 19/12.", "Reduce and convert."],
          result: "19/12 = 1 7/12 ≈ 1.583",
        },
        {
          title: "2/3 ÷ 4/5",
          steps: ["Multiply by the reciprocal: 2/3 × 5/4.", "10/12 reduces."],
          result: "5/6",
        },
      ],
      limitations: [
        "Division by zero is reported as undefined rather than returning infinity.",
        "Decimal inputs are approximated to the nearest simple fraction.",
        "Improper fractions are shown both as-is and as mixed numbers; there is no separate mixed-number input mode.",
      ],
      faqs: [
        { q: "Why is the answer reduced?", a: "Reduced fractions are the conventional answer and are easier to compare — 8/12 and 2/3 are the same number." },
        { q: "Can I enter a mixed number like 1 1/2?", a: "Convert it to an improper fraction (3/2) or enter 1.5, which the calculator converts for you." },
        { q: "How do I add three fractions?", a: "Add the first two, copy the result, then use it as the first fraction for the third." },
      ],
    },
  },
  {
    slug: "exponent-calculator",
    name: "Exponent Calculator",
    category: "calculators",
    tagline: "Raise any base to any power, including negative and fractional exponents.",
    intent: "calculate a number raised to a power",
    keywords: ["exponent calculator", "power calculator", "negative exponent", "fractional exponent"],
    status: "live",
    actions: ["copy"],
    effort: "instant",
    popularity: 72,
    addedAt: "2025-11-02",
    seoTitle: "Exponent Calculator — Powers, Negative and Fractional",
    seoDescription:
      "Calculate any base raised to any power, including negative and fractional exponents, with the scientific notation, reciprocal, square root and log of the result.",
    content: {
      intro: [
        "Exponents repeat a multiplication, but the interesting cases are the ones people cannot do in their heads: negative powers give reciprocals, fractional powers give roots, and large powers overflow into scientific notation quickly.",
        "Enter a base and an exponent and the calculator returns the value with its scientific form, so 2^80 is legible rather than a wall of digits.",
      ],
      howTo: [
        "Enter the base.",
        "Enter the exponent — negative values and decimals are allowed.",
        "Read the result, its scientific notation and related values.",
        "Check the powers table for the pattern around your exponent.",
      ],
      method: {
        title: "Rules for exponents",
        paragraphs: [
          "A positive whole exponent multiplies the base by itself that many times. A zero exponent gives 1 for any non-zero base. A negative exponent gives the reciprocal, so 2^-3 is 1/8. A fractional exponent is a root: 9^0.5 = √9 = 3 and 8^(1/3) = 2.",
          "Bases multiply when powers share a base: 2^3 × 2^4 = 2^7. That rule is why exponents are so useful for growth and for binary sizes.",
        ],
        formula: "a^n = a × a × … (n times)   ·   a^(−n) = 1 ÷ a^n   ·   a^(1/n) = ⁿ√a",
      },
      examples: [
        {
          title: "2^10",
          steps: ["Base 2, exponent 10.", "2 × 2 × … ten times."],
          result: "1024",
        },
        {
          title: "Compound growth of 5% over 12 years",
          steps: ["Use base 1.05 with exponent 12."],
          result: "1.7959 — about 1.8× the original",
        },
      ],
      limitations: [
        "Zero to a negative power is undefined and is reported as an error.",
        "Results above roughly 1.8 × 10^308 exceed the range of a double and are rejected.",
        "Integer powers above 2^53 lose exactness because numbers are stored as doubles.",
      ],
      faqs: [
        { q: "What does a negative exponent mean?", a: "It is the reciprocal: 5^-2 = 1/25 = 0.04." },
        { q: "How is a fractional exponent a root?", a: "The denominator of the fraction is the root: x^(1/2) is the square root and x^(1/3) is the cube root." },
        { q: "Why is a^0 always 1?", a: "Because dividing a^n by itself gives 1, and that subtraction of exponents is n − n = 0." },
      ],
    },
  },
  {
    slug: "square-root-calculator",
    name: "Square Root Calculator",
    category: "calculators",
    tagline: "Square roots with the exact simplified radical, cube roots and fourth roots.",
    intent: "calculate a square root",
    keywords: ["square root calculator", "sqrt calculator", "simplify radical", "cube root calculator"],
    status: "live",
    actions: ["copy"],
    effort: "instant",
    popularity: 71,
    addedAt: "2025-11-02",
    seoTitle: "Square Root Calculator — Exact and Simplified Radicals",
    seoDescription:
      "Find the square root of any number with the exact radical form (√72 = 6√2), the decimal, the cube root and the fourth root, plus perfect-square detection.",
    content: {
      intro: [
        "Most calculators give √72 as 8.485281374238571, which is correct but not what a maths teacher wants. The exact form is 6√2, and this tool returns both.",
        "It also reports the cube root and fourth root, checks whether the number is a perfect square, and squares the result back as a sanity check.",
      ],
      howTo: [
        "Enter the number you want the root of.",
        "Read the decimal square root to ten decimal places.",
        "Use the exact form when you need a surd rather than a decimal.",
        "Check the cube and fourth roots in the statistics row.",
      ],
      method: {
        title: "Simplifying a radical",
        paragraphs: [
          "Every positive integer can be split into a square factor times a square-free remainder. Pulling the square factor out of the root gives the simplified radical: √72 = √(36 × 2) = 6√2, because 36 is the largest square that divides 72.",
          "A number is a perfect square when the result is a whole number; the loop only needs to test factors up to √n, so large inputs still resolve instantly.",
        ],
        formula: "√72 = √(36 × 2) = 6√2 ≈ 8.485",
      },
      examples: [
        {
          title: "√2",
          steps: ["No square factor divides 2.", "The radical cannot be simplified."],
          result: "√2 ≈ 1.4142135624",
        },
        {
          title: "√144",
          steps: ["144 = 12².", "The root is exact."],
          result: "12",
        },
      ],
      limitations: [
        "Negative inputs are rejected because real square roots do not exist for them.",
        "Radical simplification covers whole numbers only.",
        "Very large integers lose precision in the decimal result, though the exact radical form stays integer-exact.",
      ],
      faqs: [
        { q: "Why is √72 not 8.49 exactly?", a: "Because √2 is irrational. 8.485 is a rounded value; the exact answer is 6√2." },
        { q: "What is the cube root of 27?", a: "3, because 3 × 3 × 3 = 27. The cube root of a negative number is negative, but this tool reports cube roots only for non-negative inputs." },
        { q: "Is the square root the same as raising to 0.5?", a: "Yes. x^0.5 equals √x for every non-negative x." },
      ],
    },
  },
  {
    slug: "lcm-calculator",
    name: "LCM Calculator",
    category: "calculators",
    tagline: "Least common multiple for two or more numbers, with prime factorisation shown.",
    intent: "find the least common multiple",
    keywords: ["lcm calculator", "least common multiple", "lowest common multiple", "lcm of 12 and 18"],
    status: "live",
    actions: ["copy"],
    effort: "instant",
    popularity: 69,
    addedAt: "2025-11-02",
    seoTitle: "LCM Calculator — Least Common Multiple with Factors",
    seoDescription:
      "Find the least common multiple of two or more numbers, with the prime factorisation of each number and the greatest common divisor shown alongside.",
    content: {
      intro: [
        "The least common multiple is the smallest number that every input divides into. It is the number you need to add fractions with different denominators, and to line up repeating cycles such as two machines that run on 12- and 18-minute loops.",
        "This calculator lists the prime factorisation of each number, which is how the LCM is built: take the highest power of every prime that appears.",
      ],
      howTo: [
        "Enter two or more whole numbers, separated by commas or spaces.",
        "Read the least common multiple.",
        "Check the prime factors to see how the result was assembled.",
        "Use the GCD figure alongside it to simplify fractions.",
      ],
      method: {
        title: "From prime factors to the LCM",
        paragraphs: [
          "Factorise each number into primes. For every prime that appears anywhere, take the highest exponent in any of the numbers, then multiply those prime powers together.",
          "For 12 = 2²·3 and 18 = 2·3², the highest powers are 2² and 3², so the LCM is 4 × 9 = 36. A useful shortcut for two numbers is LCM = a × b ÷ GCD(a, b).",
        ],
        formula: "LCM(a, b) = |a × b| ÷ GCD(a, b)",
      },
      examples: [
        {
          title: "12 and 18",
          steps: ["12 = 2²·3", "18 = 2·3²", "Take 2² and 3²."],
          result: "36",
        },
        {
          title: "4, 6 and 10",
          steps: ["Highest powers: 2², 3 and 5."],
          result: "60",
        },
      ],
      limitations: [
        "Positive whole numbers only; decimals and negatives are rejected.",
        "Results beyond the safe integer range are refused rather than shown approximately.",
        "The factorisation shown is by trial division, which is slow for very large primes but fine for everyday numbers.",
      ],
      faqs: [
        { q: "What is the difference between LCM and GCD?", a: "The LCM is the smallest number all inputs divide into; the GCD is the largest number that divides all inputs." },
        { q: "Can the LCM equal one of the numbers?", a: "Yes, when the larger number is a multiple of the smaller one — the LCM of 6 and 18 is 18." },
        { q: "Why do I need the LCM for fractions?", a: "Adding fractions requires a common denominator, and the least common multiple is the smallest one that works." },
      ],
    },
  },
  {
    slug: "gcd-calculator",
    name: "GCD Calculator",
    category: "calculators",
    tagline: "Greatest common divisor for a list of numbers, with shared factors listed.",
    intent: "find the greatest common divisor",
    keywords: ["gcd calculator", "greatest common divisor", "hcf calculator", "highest common factor"],
    status: "live",
    actions: ["copy"],
    effort: "instant",
    popularity: 66,
    addedAt: "2025-11-02",
    seoTitle: "GCD Calculator — Greatest Common Divisor",
    seoDescription:
      "Find the greatest common divisor of two or more whole numbers, see the shared factors and prime factorisation, and find out whether the numbers are coprime.",
    content: {
      intro: [
        "The greatest common divisor is the largest number that divides every input exactly. It is the number you divide by to reduce a fraction, and the measure of how much two quantities have in common.",
        "Euclid's algorithm finds it quickly for any size of number, and the calculator shows the shared factors so the answer can be checked by hand.",
      ],
      howTo: [
        "Enter two or more whole numbers.",
        "Read the greatest common divisor.",
        "Check the shared factors and each number's prime factorisation.",
        "If the GCD is 1, the numbers are coprime.",
      ],
      method: {
        title: "Euclid's algorithm",
        paragraphs: [
          "Replace the pair (a, b) with (b, a mod b) until the remainder is zero; the last non-zero remainder is the GCD. For a list, run the algorithm pairwise, carrying the running result forward.",
          "Equivalently, multiply the lowest power of every prime that appears in all the numbers. For 84 = 2²·3·7 and 126 = 2·3²·7, the shared primes are 2, 3 and 7.",
        ],
        formula: "GCD(84, 126) = 2 × 3 × 7 = 42",
      },
      examples: [
        {
          title: "84 and 126",
          steps: ["126 mod 84 = 42", "84 mod 42 = 0"],
          result: "42",
        },
        {
          title: "9 and 28",
          steps: ["No shared prime factors.", "The GCD is 1."],
          result: "coprime",
        },
      ],
      limitations: [
        "Zero is rejected, because every number divides zero and the answer would be trivial.",
        "Negative inputs are treated by absolute value.",
        "The factorisation display is limited to numbers a trial-division loop can factor comfortably.",
      ],
      faqs: [
        { q: "Is GCD the same as HCF?", a: "Yes. Greatest common divisor, highest common factor and greatest common measure are the same thing." },
        { q: "How does the GCD help with fractions?", a: "Divide the numerator and denominator by their GCD to reduce the fraction to lowest terms." },
        { q: "What does coprime mean?", a: "Two numbers are coprime when their only shared factor is 1, so their GCD is 1 — for example 9 and 28." },
      ],
    },
  },
  {
    slug: "prime-number-checker",
    name: "Prime Number Checker",
    category: "calculators",
    tagline: "Test any number for primality and see its factors, divisors and neighbours.",
    intent: "check whether a number is prime",
    keywords: ["prime number checker", "is 97 prime", "prime test", "composite number"],
    status: "live",
    actions: ["copy"],
    effort: "instant",
    popularity: 68,
    addedAt: "2025-11-02",
    seoTitle: "Prime Number Checker — Test Any Number Instantly",
    seoDescription:
      "Check whether a number is prime, see its prime factorisation and every divisor, and find the nearest primes below and above it. Exact, not a guess.",
    content: {
      intro: [
        "\"Is this number prime?\" is easy to answer for small values and easy to get wrong for larger ones. This checker uses deterministic trial division up to the square root, which is exact for every number it accepts.",
        "Alongside the verdict you get the prime factorisation, the full divisor count and the closest primes on either side, which is often the more useful answer.",
      ],
      howTo: [
        "Enter a whole number.",
        "Read whether it is prime, composite, or neither (0 and 1).",
        "Check the factorisation and the list of divisors.",
        "Use the neighbouring primes if you need a nearby prime.",
      ],
      method: {
        title: "Why testing to √n is enough",
        paragraphs: [
          "If n has a factor larger than √n, it must also have a factor smaller than √n, because the two multiply back to n. So checking every divisor from 2 to √n either finds a factor or proves there is none.",
          "The loop skips even numbers and multiples of three in pairs, which cuts the work by roughly two-thirds without changing the result.",
        ],
        formula: "n is prime ⇔ no integer d in [2, √n] divides n",
      },
      examples: [
        {
          title: "97",
          steps: ["Test divisors up to 9.", "None divide 97."],
          result: "prime",
        },
        {
          title: "91",
          steps: ["Try 7: 91 ÷ 7 = 13."],
          result: "composite — 7 × 13",
        },
      ],
      limitations: [
        "The input is capped below JavaScript's maximum safe integer, so very large primes used in cryptography cannot be tested here.",
        "Trial division is slow for large primes near the cap, though still fast enough for everyday inputs.",
        "1 is neither prime nor composite and is reported as such rather than forced into either category.",
      ],
      faqs: [
        { q: "Is 1 a prime number?", a: "No. A prime has exactly two distinct positive divisors, and 1 has only one." },
        { q: "Is 2 the only even prime?", a: "Yes, because every other even number is divisible by 2 as well as by itself." },
        { q: "What is a twin prime?", a: "A prime that differs from another prime by 2, such as 11 and 13. The neighbouring primes shown make these easy to spot." },
      ],
    },
  },
  {
    slug: "factorial-calculator",
    name: "Factorial Calculator",
    category: "calculators",
    tagline: "Exact factorials with digit counts, trailing zeros and a downloadable value.",
    intent: "calculate a factorial",
    keywords: ["factorial calculator", "n factorial", "20 factorial", "trailing zeros factorial"],
    status: "live",
    actions: ["copy", "download"],
    effort: "instant",
    popularity: 62,
    addedAt: "2025-11-02",
    seoTitle: "Factorial Calculator — Exact Values and Digit Counts",
    seoDescription:
      "Calculate n! exactly for any n up to 5000, see how many digits it has, count the trailing zeros and download the full value for your own records.",
    content: {
      intro: [
        "Factorials grow absurdly fast: 20! is already 2,432,902,008,176,640,000, and 70! exceeds the largest number JavaScript can represent as an integer. This calculator uses exact big-integer arithmetic, so the digits are right rather than rounded.",
        "It reports the digit count and the number of trailing zeros, both of which appear in combinatorics and probability questions.",
      ],
      howTo: [
        "Enter a whole number n.",
        "Read n! with its digit count.",
        "Download or copy the full value if you need all the digits.",
        "Use the trailing-zero count for combinatorics work.",
      ],
      method: {
        title: "Multiplication and trailing zeros",
        paragraphs: [
          "n! multiplies every whole number from 1 to n. Big-integer arithmetic keeps every digit exact, at the cost of speed, which is why the input is capped at 5000.",
          "Trailing zeros come from factors of 10, and each one needs a pair of 2 and 5. Since there are always more 2s, the number of trailing zeros equals the number of times 5 divides n!, counting 25 as two, 125 as three and so on.",
        ],
        formula: "n! = n × (n−1) × … × 2 × 1",
      },
      examples: [
        {
          title: "10!",
          steps: ["10 × 9 × … × 1"],
          result: "3,628,800 — seven digits, two trailing zeros",
        },
        {
          title: "52! (a shuffled deck)",
          steps: ["Enter 52 and download the value.", "The digit count alone is 68."],
          result: "8.07 × 10^67",
        },
      ],
      limitations: [
        "Inputs above 5000 are refused because the result becomes unwieldy to display.",
        "Very long values are truncated in the display; download the file for the complete number.",
        "There is no support for the gamma function, so only whole numbers are accepted.",
      ],
      faqs: [
        { q: "Why is 0! equal to 1?", a: "There is exactly one way to arrange nothing, and defining 0! = 1 keeps formulas such as C(n,0) = 1 consistent." },
        { q: "How many digits does 100! have?", a: "158. The calculator shows the digit count for any input without you having to count." },
        { q: "Is a double factorial supported?", a: "No. Double factorials skip every other number (n!! = n × (n−2) × …) and are not part of this calculation." },
      ],
    },
  },
  {
    slug: "random-number-generator",
    name: "Random Number Generator",
    category: "calculators",
    tagline: "Draw random whole numbers from a range, with or without repeats.",
    intent: "generate random numbers in a range",
    keywords: ["random number generator", "random number picker", "raffle draw", "random integers"],
    status: "live",
    actions: ["copy"],
    effort: "instant",
    popularity: 79,
    addedAt: "2025-11-02",
    seoTitle: "Random Number Generator — Pick Numbers in Any Range",
    seoDescription:
      "Generate random whole numbers between any two values, with optional no-repeat draws, sorted output and a reproducible seed for raffles and sampling.",
    content: {
      intro: [
        "Random draws have three practical requirements: the range must be exact, repeats must be controllable, and the result must be reproducible if someone asks how it was made. This generator handles all three.",
        "It is intended for raffles, sampling, test data and games. It uses a seeded pseudo-random generator rather than the browser's cryptographic source, and it says so.",
      ],
      howTo: [
        "Set the minimum and maximum values, inclusive.",
        "Choose how many numbers you need.",
        "Turn on no-repeat to draw without replacement.",
        "Press Generate; the seed shown lets anyone repeat the draw.",
      ],
      method: {
        title: "Seeded pseudo-randomness",
        paragraphs: [
          "The generator uses mulberry32, a small seeded generator with good distribution for this kind of use. Each press produces a new seed; the same seed and settings always produce the same sequence.",
          "When no-repeat is on, values are drawn until the requested count is reached, which is why the count cannot exceed the size of the range. That case is reported instead of silently returning fewer numbers.",
        ],
        formula: "value = min + floor(random() × (max − min + 1))",
      },
      examples: [
        {
          title: "Raffle for 3 winners from 120 tickets",
          steps: ["Set 1 to 120, count 3.", "Turn no-repeat on.", "Generate."],
          result: "three distinct ticket numbers",
        },
        {
          title: "Test data",
          steps: ["Set 1 to 1000, count 20, no-repeat off.", "Generate with a fixed seed for repeatable tests."],
          result: "a reusable sample",
        },
      ],
      limitations: [
        "Not cryptographically secure — use the Random Token Generator for anything security-sensitive.",
        "Duplicate draws are impossible only when no-repeat is on.",
        "Seed values are 32-bit, so there are about four billion distinct sequences.",
      ],
      faqs: [
        { q: "Is the maximum included?", a: "Yes. A range of 1 to 10 can produce 10, and every value in between has the same chance." },
        { q: "Can two people get the same seed?", a: "Only if they press Generate at the same moment with identical settings; the seed is otherwise redrawn each time." },
        { q: "Why does it say I cannot draw 20 unique numbers from 1 to 10?", a: "Because drawing without replacement from a range of ten values cannot produce twenty distinct values." },
      ],
    },
  },
  {
    slug: "date-difference-calculator",
    name: "Date Difference Calculator",
    category: "calculators",
    tagline: "Days, weeks and weekdays between two dates, with both ends optionally counted.",
    intent: "calculate the difference between two dates",
    keywords: ["date difference calculator", "days between two dates", "business days calculator", "date calculator"],
    status: "live",
    actions: ["copy"],
    effort: "instant",
    popularity: 84,
    addedAt: "2025-11-02",
    seoTitle: "Date Difference Calculator — Days, Weeks and Weekdays",
    seoDescription:
      "Find the difference between two dates in days, weeks, months and weekdays. Choose whether both dates count, and see weekend days and total hours.",
    content: {
      intro: [
        "The same two dates can be described as 29 days, four weeks and one day, or one month — all correct, all different answers. This calculator gives every form at once so you can pick the one your context needs.",
        "It also counts Monday-to-Friday days, which is what most project and delivery deadlines actually mean, and shows whether both end dates are included.",
      ],
      howTo: [
        "Pick the start and end dates.",
        "Turn on count-both-ends if the first and last day should both be counted.",
        "Read the total days and the calendar gap.",
        "Use the weekdays figure for working-day deadlines.",
      ],
      method: {
        title: "Calendar versus elapsed time",
        paragraphs: [
          "Total days are simple elapsed time: subtract the earlier date from the later one. The calendar gap is counted in months and days, which is not the same thing because months have different lengths.",
          "Weekdays are counted by walking each day and excluding Saturdays and Sundays. Public holidays are not in the calculation, since they vary by country.",
        ],
        formula: "days = later − earlier   ·   calendar gap = years, months, days",
      },
      examples: [
        {
          title: "31 January to 1 March (non-leap year)",
          steps: ["Elapsed days: 29.", "Calendar gap: one month and one day."],
          result: "29 days",
        },
        {
          title: "A two-week project starting Monday",
          steps: ["Pick Monday to the second Friday.", "Count both ends to include the last day."],
          result: "10 weekdays",
        },
      ],
      limitations: [
        "Public holidays are not subtracted; the weekday count is Monday to Friday only.",
        "Counting both ends adds one to the elapsed total, which is what calendar-style questions expect.",
        "Dates are treated as whole-day values in UTC, so daylight-saving shifts do not affect the count.",
      ],
      faqs: [
        { q: "Why is the day count one higher when counting both ends?", a: "Because an event from Monday to Friday spans five calendar days but only four elapsed days." },
        { q: "Does it handle leap years?", a: "Yes, including 29 February. Fractions of a day are not offered because dates are treated as whole days." },
        { q: "How is the weekday count useful?", a: "Deadlines, billing periods and shipping windows usually count working days, so the total-days figure overstates the time you have." },
      ],
    },
  },
  {
    slug: "time-duration-calculator",
    name: "Time Duration Calculator",
    category: "calculators",
    tagline: "Hours and minutes between two clock times, minus breaks, ready for a timesheet.",
    intent: "calculate hours worked between two times",
    keywords: ["time duration calculator", "hours calculator", "timesheet calculator", "time between times"],
    status: "live",
    actions: ["copy"],
    effort: "instant",
    popularity: 86,
    addedAt: "2025-11-02",
    seoTitle: "Time Duration Calculator — Hours Between Two Times",
    seoDescription:
      "Work out hours and minutes between a start and end time, subtract a break, and get decimal hours for a timesheet. Overnight shifts are handled automatically.",
    content: {
      intro: [
        "Timesheets want decimal hours, clocks show hours and minutes, and payroll systems want both. This calculator converts between them in one step and subtracts breaks so the figure you copy is the one you are paid for.",
        "Shift workers get the overnight case for free: if the end time is earlier than the start time, the calculation assumes the shift crossed midnight.",
      ],
      howTo: [
        "Enter the start and end times in 24-hour HH:MM format.",
        "Enter any unpaid break in minutes.",
        "Add an hourly rate if you want the gross pay.",
        "Copy the decimal hours or the pay figure.",
      ],
      method: {
        title: "From minutes to decimal hours",
        paragraphs: [
          "Convert both times to minutes after midnight, subtract, and add 24 hours if the result is negative. Subtract the break, then divide by 60 for decimal hours.",
          "The conversion matters because 7 hours 30 minutes is 7.5 hours, not 7.3. Multiplying 7.3 by an hourly rate understates the pay by a noticeable amount.",
        ],
        formula: "decimal hours = (end − start − break) ÷ 60",
      },
      examples: [
        {
          title: "09:15 to 17:45 with a 45-minute break",
          steps: ["Elapsed: 8h 30m.", "Minus 45 minutes: 7h 45m.", "Divide by 60."],
          result: "7.75 hours",
        },
        {
          title: "Night shift 22:30 to 01:15",
          steps: ["End time is earlier, so add a day."],
          result: "2h 45m",
        },
      ],
      limitations: [
        "Times are entered as HH:MM; seconds are not accepted as input.",
        "Only one start and one end time per calculation — split shifts need separate runs.",
        "Overtime multipliers and tax deductions are not applied to the pay figure.",
      ],
      faqs: [
        { q: "Why is 7h 30m 7.5 hours and not 7.3?", a: "Because 30 minutes is half of 60, so it is 0.5 of an hour. Writing 7.3 would mean seven hours and eighteen minutes." },
        { q: "Does it account for daylight saving?", a: "No. Clock times are used as entered, so a shift spanning a clock change will appear an hour longer or shorter than the wall-clock time." },
        { q: "Can I use 12-hour times?", a: "Convert them first: 1:45 PM is 13:45. The input expects 24-hour format to avoid ambiguity." },
      ],
    },
  },
  {
    slug: "percentage-grade-calculator",
    name: "Percentage Grade Calculator",
    category: "calculators",
    tagline: "Turn marks into a percentage, a letter grade and a projected course grade.",
    intent: "convert marks to a percentage grade",
    keywords: ["grade calculator", "percentage grade", "marks to letter grade", "test score percentage"],
    status: "live",
    actions: ["copy"],
    effort: "instant",
    popularity: 83,
    addedAt: "2025-11-02",
    seoTitle: "Percentage Grade Calculator — Marks to Letter Grade",
    seoDescription:
      "Convert marks earned into a percentage and US letter grade, see the grade points, and project your course grade by weighting the assignment in.",
    content: {
      intro: [
        "A score of 84 out of 100 is easy. A score of 34 out of 40 is the same grade but needs arithmetic, and the letter it maps to depends on the school's scale. This calculator does both steps and shows the bands it used so nothing is hidden.",
        "If the assignment is only part of your course, add its weight and your current grade to see where the course stands afterwards.",
      ],
      howTo: [
        "Enter the marks earned and the marks possible.",
        "Read the percentage and the letter grade.",
        "Optionally add the assignment's weight and your current course grade.",
        "Check the grade table against your own syllabus before assuming the band applies.",
      ],
      method: {
        title: "Percentage, band and weighting",
        paragraphs: [
          "The percentage is marks earned divided by marks possible, times 100. The letter grade is the highest band whose minimum the percentage reaches, using the standard US scale where 90 is an A and 80 a B.",
          "When a weight is supplied, the projected course grade is the current grade scaled by the remaining weight plus this percentage scaled by the assignment's weight.",
        ],
        formula: "% = earned ÷ possible × 100   ·   projected = current × (1 − w) + this × w",
      },
      examples: [
        {
          title: "34 out of 40",
          steps: ["34 ÷ 40 = 0.85.", "That is 85%."],
          result: "B, 3.0 grade points",
        },
        {
          title: "85% on a 35%-weighted exam with a 78% course grade",
          steps: ["78 × 0.65 + 85 × 0.35."],
          result: "80.45% projected",
        },
      ],
      limitations: [
        "The letter bands are a common US convention; schools that use 10-point or curved scales may differ.",
        "Only one assignment is weighted at a time.",
        "Extra credit and dropped lowest scores are not modelled.",
      ],
      faqs: [
        { q: "Does 89.5% round to an A?", a: "It depends on the school. Some round to the nearest whole percent, others cut strictly at 90." },
        { q: "What are grade points?", a: "The numeric value used in a GPA: an A is 4.0, a B is 3.0, and plus or minus grades shift that by 0.3." },
        { q: "How do I work out my final grade?", a: "Use the weighting fields, or add each component separately and average them by credit if all pieces are already graded." },
      ],
    },
  },
  {
    slug: "probability-calculator",
    name: "Probability Calculator",
    category: "calculators",
    tagline: "Chance of either event, both events, at least one hit, or exactly k successes.",
    intent: "calculate the probability of an event",
    keywords: ["probability calculator", "odds calculator", "binomial probability", "at least one probability"],
    status: "live",
    actions: ["copy"],
    effort: "instant",
    popularity: 73,
    addedAt: "2025-11-02",
    seoTitle: "Probability Calculator — And, Or, At Least One",
    seoDescription:
      "Calculate the chance of A or B, A and B, at least one success over repeated tries, or exactly k successes in n trials — with combinations and permutations.",
    content: {
      intro: [
        "Most probability mistakes are formula mistakes, not arithmetic ones: adding when events can overlap, or forgetting that \"at least one\" is the complement of \"none\". This calculator makes you pick the question first, then applies the matching rule.",
        "It also covers the binomial case and the combinations and permutations behind it, which is where exam questions usually end up.",
      ],
      howTo: [
        "Choose the type of question you are answering.",
        "Enter probabilities as decimals — 25% is 0.25.",
        "Add trials and successes for the repeated-trial modes.",
        "Read the probability, plus the complementary figures that make it checkable.",
      ],
      method: {
        title: "Which rule applies",
        paragraphs: [
          "For either event, P(A or B) = P(A) + P(B) − P(A and B); the subtraction removes the overlap counted twice. For both, multiply when the events are independent. For at least one success in n tries, subtract the chance of none from 1.",
          "The binomial rule gives exactly k successes: C(n,k) p^k (1−p)^(n−k). C(n,k) counts the orderings, which is why combinations appear in the formula.",
        ],
        formula: "P(A or B) = P(A) + P(B) − P(A∩B)   ·   P(at least one) = 1 − (1−p)ⁿ",
      },
      examples: [
        {
          title: "A die shows 2 or an even number",
          steps: ["P(2) = 1/6, P(even) = 3/6.", "P(both) = 1/6."],
          result: "1/6 + 3/6 − 1/6 = 50%",
        },
        {
          title: "At least one 6 in four rolls",
          steps: ["P(none) = (5/6)⁴ ≈ 48.2%.", "Subtract from 1."],
          result: "51.8%",
        },
      ],
      limitations: [
        "Independence is assumed in the both-events and binomial modes.",
        "Probabilities must be between 0 and 1; percentages are not accepted as input.",
        "Mutually exclusive events need plain addition rather than the general or-rule.",
      ],
      faqs: [
        { q: "What is the difference between odds and probability?", a: "Probability is successes over all outcomes; odds compare successes to failures. A 25% chance is 1:3 odds." },
        { q: "Why is at least one not just p × n?", a: "Because the events overlap. Multiplying gives the expected number of successes, which can exceed 1 and is not a probability." },
        { q: "What does n choose k mean?", a: "The number of ways to select k items from n when order does not matter; permutations count order." },
      ],
    },
  },
  {
    slug: "matrix-calculator",
    name: "Matrix Calculator",
    category: "calculators",
    tagline: "Multiply, add, transpose and invert matrices, with determinants shown.",
    intent: "multiply matrices",
    keywords: ["matrix calculator", "matrix multiplication", "determinant calculator", "inverse matrix"],
    status: "live",
    actions: ["copy"],
    effort: "quick",
    popularity: 64,
    addedAt: "2025-11-02",
    seoTitle: "Matrix Calculator — Multiply, Add, Invert, Determinant",
    seoDescription:
      "Multiply, add or subtract two matrices, transpose them, and find the determinant or the inverse of a 2×2 matrix. Errors explain what shape is required.",
    content: {
      intro: [
        "Matrix arithmetic is easy on paper and tedious in practice, and the failure cases are shape errors rather than number errors. This calculator checks the dimensions first and explains the mismatch instead of returning nothing.",
        "Matrices are typed as plain text, one row per line, which makes them easy to paste from a spreadsheet or a homework sheet.",
      ],
      howTo: [
        "Type matrix A with one row per line, values separated by commas or spaces.",
        "Type matrix B the same way for operations that need it.",
        "Choose the operation.",
        "Copy the resulting matrix; the shape and determinant are shown alongside.",
      ],
      method: {
        title: "Shapes and rules",
        paragraphs: [
          "Addition and subtraction require identical shapes and work element by element. Multiplication requires the number of columns in A to equal the number of rows in B, and the result has A's rows and B's columns.",
          "The determinant is defined only for square matrices; a 2×2 determinant is ad − bc, and a matrix is invertible exactly when that value is not zero.",
        ],
        formula: "(A × B)ᵢⱼ = Σ Aᵢₖ Bₖⱼ   ·   det[[a,b],[c,d]] = ad − bc",
      },
      examples: [
        {
          title: "[[1,2],[3,4]] × [[5,6],[7,8]]",
          steps: ["Row 1 × column 1: 1×5 + 2×7 = 19.", "Repeat for the other three entries."],
          result: "[[19,22],[43,50]]",
        },
        {
          title: "Inverse of [[1,2],[3,4]]",
          steps: ["det = −2.", "Swap a and d, negate b and c, divide by the determinant."],
          result: "[[−2,1],[1.5,−0.5]]",
        },
      ],
      limitations: [
        "Inverses are limited to 2×2 matrices; larger sizes need full row reduction, which this tool does not implement.",
        "Matrices must be rectangular — ragged rows are rejected.",
        "Entries are decimals, so results can carry floating-point rounding at the last digit.",
      ],
      faqs: [
        { q: "Why can't I multiply these two matrices?", a: "Multiplication needs the columns of the first to equal the rows of the second. A 2×3 times a 2×3 cannot be multiplied; the second would need to be 3×n." },
        { q: "What does a zero determinant mean?", a: "The matrix squashes space into a lower dimension, so it has no inverse — the rows are linearly dependent." },
        { q: "Is A × B the same as B × A?", a: "Usually not. Matrix multiplication is not commutative, and one order may not even be defined." },
      ],
    },
  },
];
