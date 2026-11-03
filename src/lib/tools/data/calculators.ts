import type { ToolDefinition } from "../types";

export const calculatorTools: ToolDefinition[] = [
  {
    slug: "percentage-calculator",
    name: "Percentage Calculator",
    category: "calculators",
    tagline: "Work out X% of a number, what percent one number is of another, and percent change.",
    intent: "calculate a percentage of a number",
    keywords: [
      "percentage calculator",
      "percent of a number",
      "what is x percent of y",
      "percentage increase",
      "percentage decrease",
    ],
    status: "live",
    actions: ["copy"],
    effort: "instant",
    popularity: 99,
    addedAt: "2025-01-12",
    seoTitle: "Percentage Calculator — Percentages, Increases & Decreases",
    seoDescription:
      "Calculate percentages instantly: X% of Y, what percent X is of Y, and percentage increase or decrease. Formulas and worked examples included.",
    content: {
      intro: [
        "Percentages hide three different questions behind one word. This calculator asks which one you mean, then does the arithmetic with the formula shown: a part of a whole, one number as a share of another, or the change between two values.",
        "Mixing up those modes is the single most common percentage mistake — a 20% increase and a 20% decrease do not cancel out, and '50% more than 40' is not the same as '50% of 40'. Each mode below states exactly what it computes.",
      ],
      howTo: [
        "Pick the mode that matches your question.",
        "Enter the two values you know.",
        "Read the result, along with the formula used and a plain-language sentence.",
        "Use the related calculators for discounts, VAT or percentage change between two numbers.",
      ],
      method: {
        title: "The three percentage formulas",
        paragraphs: [
          "To find a percentage of a number, multiply the number by the percentage divided by 100. To express one number as a percentage of another, divide the part by the whole and multiply by 100. To find percentage change, subtract the old value from the new value, divide by the absolute old value, and multiply by 100.",
          "A positive change is an increase and a negative change is a decrease. Because the denominator is the starting value, an increase from 100 to 150 is +50%, while a decrease from 150 back to 100 is −33.3% — the same distance, a different percentage.",
        ],
        formula: "part = (percentage ÷ 100) × whole    ·    change % = ((new − old) ÷ |old|) × 100",
      },
      examples: [
        {
          title: "20% off a $250 jacket",
          steps: ["Choose “X% of Y”.", "Percentage = 20, value = 250.", "Multiply 0.2 × 250."],
          result: "50 — so the sale price is $200",
        },
        {
          title: "A score of 42 out of 60",
          steps: ["Choose “X is what % of Y”.", "Part = 42, whole = 60.", "42 ÷ 60 × 100 = 70."],
          result: "70%",
        },
        {
          title: "Rent rising from 1,200 to 1,380",
          steps: ["Choose “Percentage change”.", "Old = 1,200, new = 1,380.", "(1,380 − 1,200) ÷ 1,200 × 100 = 15."],
          result: "+15% increase",
        },
      ],
      limitations: [
        "Percentage change is undefined when the starting value is zero.",
        "The calculator works with decimal percentages, so entering 20 means 20%, not 0.2.",
        "Results are rounded for display; monetary results should be rounded according to local currency conventions.",
      ],
      faqs: [
        {
          q: "What is the difference between percent and percentage points?",
          a: "Moving from 10% to 12% is a 2 percentage-point increase but a 20% relative increase. Use percentage change mode only when comparing relative movement.",
        },
        {
          q: "Why doesn't +20% then −20% return the original number?",
          a: "Because the second calculation is applied to a larger base. 100 + 20% = 120, then 120 − 20% = 96. Percentages are relative, not additive.",
        },
        {
          q: "How do I calculate a value before a discount?",
          a: "Divide the sale price by (1 − discount ÷ 100). For example, a $60 price after 25% off means 60 ÷ 0.75 = $80.",
        },
        {
          q: "Can I use this for tax?",
          a: "Yes, for simple flat-rate tax. The VAT and discount calculators handle add/remove-tax conversions and rounding more precisely.",
        },
      ],
    },
  },
  {
    slug: "percentage-increase-decrease-calculator",
    name: "Percentage Increase/Decrease Calculator",
    category: "calculators",
    tagline: "Measure increase or decrease between two values, with absolute and relative change.",
    intent: "calculate percentage increase or decrease",
    keywords: [
      "percentage change calculator",
      "percentage increase calculator",
      "percentage decrease",
      "percent difference",
      "growth rate calculator",
    ],
    status: "live",
    actions: ["copy"],
    effort: "instant",
    popularity: 81,
    addedAt: "2025-01-15",
    seoTitle: "Percentage Change Calculator — Increase & Decrease",
    seoDescription:
      "Find the percentage increase or decrease between two numbers, with the absolute change and a plain-language explanation of the result.",
    content: {
      intro: [
        "Percentage change tells you how large a movement is relative to where it started. It is the right measure for growth rates, price changes, performance trends and any comparison where 'how much bigger' matters more than 'by how many units'.",
        "Enter the starting and ending values and the calculator returns the percentage change, the absolute difference, and whether the movement is an increase or a decrease.",
      ],
      howTo: [
        "Enter the original or starting value.",
        "Enter the new or ending value.",
        "Read the percentage change; the sign tells you the direction.",
        "Use the absolute change figure when you need the raw difference.",
      ],
      method: {
        title: "Formula and sign convention",
        paragraphs: [
          "Percentage change equals the difference divided by the absolute value of the starting number, multiplied by 100. Using the absolute value in the denominator keeps the sign meaningful when working with negative starting values, such as a loss shrinking from −500 to −200.",
          "A result of exactly zero means no change. The calculator also reports the multiplier — the factor you would multiply the old value by to reach the new one — which is useful for chaining growth rates.",
        ],
        formula: "change % = ((new − old) ÷ |old|) × 100    ·    multiplier = new ÷ old",
      },
      examples: [
        {
          title: "Website traffic growth",
          steps: ["Old value: 4,800 visits.", "New value: 6,240 visits.", "(6,240 − 4,800) ÷ 4,800 × 100."],
          result: "+30% — traffic grew by a third",
        },
        {
          title: "A price cut",
          steps: ["Old value: 89.99.", "New value: 69.99.", "Difference ÷ 89.99 × 100."],
          result: "−22.23%",
        },
      ],
      limitations: [
        "The starting value cannot be zero, because division by zero has no percentage interpretation.",
        "Percentage change is asymmetric: a 50% drop requires a 100% rise to recover.",
        "For comparisons with no natural starting point (two independent measurements), a percent difference formula using the average denominator is more appropriate.",
      ],
      faqs: [
        {
          q: "What is the difference between percentage change and percent difference?",
          a: "Percentage change compares a new value against an earlier baseline. Percent difference compares two values against their average when neither is a true starting point.",
        },
        {
          q: "How do I reverse a percentage change?",
          a: "Divide by the multiplier. If a price rose 30% to 130, the original was 130 ÷ 1.3 = 100.",
        },
        {
          q: "Can the result be more than 100%?",
          a: "Yes. Doubling a value is a 100% increase; tripling it is a 200% increase. There is no upper bound.",
        },
      ],
    },
  },
  {
    slug: "discount-calculator",
    name: "Discount Calculator",
    category: "calculators",
    tagline: "Find the sale price, the amount saved and the effective percentage off.",
    intent: "calculate discount and sale price",
    keywords: [
      "discount calculator",
      "sale price calculator",
      "percent off calculator",
      "how much is 30 percent off",
      "discount percentage",
    ],
    status: "live",
    actions: ["copy"],
    effort: "instant",
    popularity: 85,
    addedAt: "2025-01-16",
    seoTitle: "Discount Calculator — Sale Price and Savings",
    seoDescription:
      "Calculate the final price after a discount, the money saved and the real percentage off — including stacked discounts and tax afterwards.",
    content: {
      intro: [
        "A 25% off sign does not tell you what you will pay, and two discounts in a row are not the sum of their percentages. This calculator turns the label into the number you actually need at the till.",
        "Enter the original price and the discount, optionally add a second discount and sales tax, and you get the final price, the total saving and the real effective percentage off.",
      ],
      howTo: [
        "Enter the original price.",
        "Enter the first discount percentage.",
        "Add a second discount if the retailer stacks offers, plus tax if it applies after the discount.",
        "Read the final price and the effective total saving.",
      ],
      method: {
        title: "Stacked discounts multiply, not add",
        paragraphs: [
          "After the first discount the price is original × (1 − d₁). A second discount applies to that reduced price, so the combined multiplier is (1 − d₁) × (1 − d₂). Two 20% discounts therefore equal 36% off, not 40%.",
          "Tax is calculated on the discounted price when the retailer applies it at checkout, which is why the order of operations changes the total. The calculator reports both the money saved and the effective percentage so the two views can be compared.",
        ],
        formula: "final = price × (1 − d₁) × (1 − d₂) × (1 + tax)",
      },
      examples: [
        {
          title: "35% off a $120 item",
          steps: ["Original price 120, discount 35%.", "120 × 0.65 = 78."],
          result: "$78.00, saving $42.00",
        },
        {
          title: "Stacked offers: 20% then 10%",
          steps: ["Price 200.", "First discount leaves 160.", "10% off 160 leaves 144.", "Effective discount is 28%, not 30%."],
          result: "$144.00 — 28% off in total",
        },
      ],
      limitations: [
        "Retailers sometimes calculate discounts on a pre-tax list price and sometimes after a price match; the calculator cannot know which policy applies.",
        "Rounding rules vary by jurisdiction; totals may differ by a cent from a till receipt.",
        "Coupons with fixed monetary values are not supported — enter the equivalent percentage or subtract the coupon amount manually.",
      ],
      faqs: [
        {
          q: "Do two 20% discounts equal 40% off?",
          a: "No. The second discount applies to the already-reduced price, so the combined saving is 36%. This is one of the most common shopping maths traps.",
        },
        {
          q: "How do I find the original price from a sale price?",
          a: "Divide the sale price by (1 − discount ÷ 100). A $60 price after 25% off means 60 ÷ 0.75 = $80.",
        },
        {
          q: "Is tax applied before or after the discount?",
          a: "In most jurisdictions tax is charged on the discounted price. The calculator applies tax last, and you can set it to zero if tax is already included.",
        },
      ],
    },
  },
  {
    slug: "vat-calculator",
    name: "VAT Calculator",
    category: "calculators",
    tagline: "Add or remove VAT at any rate, with net, tax and gross broken out.",
    intent: "add or remove vat from a price",
    keywords: [
      "vat calculator",
      "add vat",
      "remove vat",
      "sales tax calculator",
      "gross to net",
    ],
    status: "live",
    actions: ["copy"],
    effort: "instant",
    popularity: 76,
    addedAt: "2025-01-20",
    seoTitle: "VAT Calculator — Add or Remove VAT at Any Rate",
    seoDescription:
      "Add VAT to a net price or extract VAT from a gross price at any rate. Shows net, VAT and gross totals with the exact formula used.",
    content: {
      intro: [
        "VAT calculations go wrong in one specific way: subtracting the rate instead of dividing by one plus the rate. Taking 20% off a £120 gross figure gives £96, but the correct net price is £100 — because VAT was charged on the net amount, not on the gross.",
        "This calculator handles both directions correctly and shows the net, tax and gross amounts separately, so the figures can be dropped straight into an invoice or an expense claim.",
      ],
      howTo: [
        "Enter the amount you know.",
        "Choose whether that amount includes VAT (gross) or excludes it (net).",
        "Set the VAT rate — 20% is prefilled for the UK, but any rate works.",
        "Copy the three-line breakdown: net, VAT and gross.",
      ],
      method: {
        title: "Adding vs removing VAT",
        paragraphs: [
          "To add VAT to a net price, multiply by (1 + rate). To remove VAT from a gross price, divide by (1 + rate) — do not multiply by (1 − rate). The extraction formula reverses the addition exactly, which is why the two directions always round-trip to the same figures.",
          "Rounding follows standard half-up rules to two decimal places. Where a jurisdiction requires per-line rounding rather than per-invoice rounding, totals can differ by a cent from an invoice system.",
        ],
        formula: "gross = net × (1 + rate)    ·    net = gross ÷ (1 + rate)",
      },
      examples: [
        {
          title: "Adding 20% VAT to a £250 invoice line",
          steps: ["Net = 250, rate = 20%.", "250 × 1.2 = 300.", "VAT portion is 50."],
          result: "Net £250.00 · VAT £50.00 · Gross £300.00",
        },
        {
          title: "Extracting VAT from a £120 gross receipt",
          steps: ["Gross = 120, rate = 20%.", "120 ÷ 1.2 = 100.", "VAT portion is 20, not 24."],
          result: "Net £100.00 · VAT £20.00 · Gross £120.00",
        },
      ],
      limitations: [
        "VAT rules differ by country and by product; reduced rates, exemptions and zero-rating are not inferred automatically.",
        "This is arithmetic, not tax advice — confirm the applicable rate with the relevant tax authority.",
        "Invoices that require per-line rounding may need figures adjusted by a cent.",
      ],
      faqs: [
        {
          q: "Why is removing 20% VAT not the same as subtracting 20%?",
          a: "Because VAT is a percentage of the net price. On a £120 gross figure the net is £100 and the VAT is £20 — that is 16.67% of the gross, not 20%.",
        },
        {
          q: "What is the difference between VAT and sales tax?",
          a: "VAT is collected at each stage of the supply chain with input credits; sales tax is usually collected once at the point of sale. The arithmetic in this tool works for both.",
        },
        {
          q: "Can I use this for multiple line items?",
          a: "Calculate each line and add the three totals, or add the net values first and apply VAT once if your invoice rounds at the invoice level.",
        },
      ],
    },
  },
  {
    slug: "age-calculator",
    name: "Age Calculator",
    category: "calculators",
    tagline: "Exact age in years, months and days — plus next birthday and day of birth.",
    intent: "calculate age from date of birth",
    keywords: [
      "age calculator",
      "how old am i",
      "date of birth calculator",
      "age in days",
      "birthday calculator",
    ],
    status: "live",
    actions: ["copy"],
    effort: "instant",
    popularity: 94,
    addedAt: "2025-01-14",
    seoTitle: "Age Calculator — Exact Age in Years, Months, Days & Hours",
    seoDescription:
      "Calculate your exact age from a date of birth in years, months, days and total days, with the weekday you were born and a countdown to your next birthday.",
    content: {
      intro: [
        "Age is not simply the difference between two years. Someone born on 31 August is not a year older until 31 August, and leap days make the arithmetic uneven. This calculator counts calendar-correct years, months and days, then shows the totals in days, hours and minutes as well.",
        "Use it for forms that require precise age, for planning a birthday, or to settle the 'am I old enough' question without counting on your fingers.",
      ],
      howTo: [
        "Enter your date of birth.",
        "The second date defaults to today; change it to compute age at any past or future date.",
        "Read the exact age in years, months and days.",
        "Check the weekday you were born and the countdown to your next birthday.",
      ],
      method: {
        title: "How calendar age is counted",
        paragraphs: [
          "The calculator counts completed years first, then completed months, then remaining days, borrowing from the next unit whenever the day-of-month is smaller than the birth day. This mirrors how people state their age in everyday speech rather than dividing total days by 365.25.",
          "Total days are computed as the difference between the two dates in UTC, which avoids daylight-saving shifts adding or removing an hour. Leap years are included automatically because the date arithmetic uses the real calendar.",
        ],
        formula: "years = end.year − start.year, adjusted when the birthday has not yet occurred",
      },
      examples: [
        {
          title: "Age on a specific date",
          steps: ["Born 12 March 1990.", "Check age on 1 January 2025.", "The birthday has not yet occurred in 2025, so a year is borrowed."],
          result: "34 years, 9 months, 20 days",
        },
        {
          title: "A leap-day birthday",
          steps: ["Born 29 February 2000.", "Check age on 28 February 2025.", "The calculator treats the birthday as reached on 1 March in non-leap years."],
          result: "25 years — with the exact day rule stated on screen",
        },
      ],
      limitations: [
        "Dates are interpreted in your device's local calendar; time-zone differences can shift results by one day near midnight.",
        "For legal or medical purposes, use the age definition required by the relevant jurisdiction — some count birthdays differently.",
        "The tool cannot know a birth time, so hours and minutes assume midnight on the birth date.",
      ],
      faqs: [
        {
          q: "How is age calculated for a leap-day birthday?",
          a: "In non-leap years the birthday is treated as 1 March for year counting. The exact convention can vary by jurisdiction, so legal documents should state the rule used.",
        },
        {
          q: "Why is my age in days different from my age × 365?",
          a: "Leap years add approximately one day every four years. The total-days figure is the true calendar count, which is why it is larger than a simple multiply-by-365 estimate.",
        },
        {
          q: "Can I calculate age at a future date?",
          a: "Yes. Change the second date to any date and the calculator returns the age that person will be on that day.",
        },
      ],
    },
  },
  {
    slug: "days-between-dates-calculator",
    name: "Days Between Dates Calculator",
    category: "calculators",
    tagline: "Count days, weeks and business days between any two dates.",
    intent: "count days between two dates",
    keywords: [
      "days between dates",
      "date difference calculator",
      "business days calculator",
      "how many days until",
      "working days between dates",
    ],
    status: "live",
    actions: ["copy"],
    effort: "instant",
    popularity: 88,
    addedAt: "2025-01-14",
    seoTitle: "Days Between Dates — Date Difference & Business Days",
    seoDescription:
      "Count the days, weeks and business days between two dates, in either direction, with an option to exclude the start or end date.",
    content: {
      intro: [
        "Counting days across a month boundary is easy to get wrong, and counting business days across public holidays is worse. This calculator returns the exact calendar difference between two dates and, separately, the number of weekdays.",
        "It also tells you whether the end date should be included, which is the difference between 'three days between Monday and Thursday' and 'a four-day project from Monday to Thursday'.",
      ],
      howTo: [
        "Pick a start date and an end date.",
        "Choose whether to include the end date in the count.",
        "Read the total days, weeks and business days.",
        "Copy a summary sentence for a document or message.",
      ],
      method: {
        title: "Inclusive vs exclusive counting",
        paragraphs: [
          "The raw difference subtracts the two dates in UTC and divides by 86,400,000 milliseconds. That gives exclusive counting: the number of full days between them. Inclusive counting adds one, because both the start and end date are part of the span.",
          "Business days skip Saturday and Sunday but do not know about public holidays, which vary by country and year. A separate holiday count is not inferred — subtract known holidays yourself, and the tool will show the weekday count it used.",
        ],
        formula: "days = (end − start) ÷ 86,400,000    ·    inclusive = days + 1",
      },
      examples: [
        {
          title: "A project from 3 March to 21 March",
          steps: ["Enter both dates.", "Exclusive count gives 18 days.", "Inclusive count gives 19 days."],
          result: "18 days apart · 19 days inclusive · 13 business days",
        },
        {
          title: "Days until a deadline",
          steps: ["Start: today. End: 31 December.", "Leave inclusive counting off.", "The result is the number of full days remaining."],
          result: "e.g. 59 days remaining",
        },
      ],
      limitations: [
        "Business-day counts exclude weekends only. Public holidays, regional holidays and company shutdowns are not applied.",
        "Dates are treated as whole calendar days in UTC; a timestamp at 23:00 may fall on a different day in another time zone.",
        "The tool does not support date ranges beyond the JavaScript Date range (roughly ±275,000 years) — irrelevant for practical use.",
      ],
      faqs: [
        {
          q: "Should I count the end date?",
          a: "Use inclusive counting for spans where both days matter, such as a hotel stay or a project timeline. Use exclusive counting for 'days between' questions, such as how many days until a deadline.",
        },
        {
          q: "Do weekends count as days?",
          a: "In the calendar total, yes. The business-day figure excludes Saturdays and Sundays separately.",
        },
        {
          q: "Why is my result one day off from another calculator?",
          a: "Almost always an inclusive/exclusive difference or a time-zone shift. Check whether the other tool includes the end date and whether it uses local or UTC midnight.",
        },
      ],
    },
  },
  {
    slug: "average-calculator",
    name: "Average Calculator",
    category: "calculators",
    tagline: "Mean, median, mode, range and sum for any list of numbers.",
    intent: "calculate the average of numbers",
    keywords: [
      "average calculator",
      "mean calculator",
      "mean median mode",
      "calculate average",
      "median calculator",
    ],
    status: "live",
    actions: ["copy"],
    effort: "instant",
    popularity: 79,
    addedAt: "2025-01-22",
    seoTitle: "Average Calculator — Mean, Median, Mode & Range",
    seoDescription:
      "Calculate the mean, median, mode, range and sum of any list of numbers. See the working and why the mean can mislead with outliers.",
    content: {
      intro: [
        "The word 'average' hides a choice. The mean adds everything and divides; the median finds the middle value; the mode finds the most frequent. With a salary list or a house-price table, those three numbers can tell completely different stories.",
        "Paste any list of numbers separated by commas, spaces or newlines and this calculator returns all three measures plus the range, sum and count — with the arithmetic shown so you can check it.",
      ],
      howTo: [
        "Paste or type your numbers, separated by commas, spaces or line breaks.",
        "Read the mean, median and mode together rather than in isolation.",
        "Check the range to see how spread out the data is.",
        "Copy a summary line for your report.",
      ],
      method: {
        title: "The three measures",
        paragraphs: [
          "The mean is the sum divided by the count. The median is the middle value of the sorted list — or the mean of the two middle values when the count is even. The mode is the value that appears most often; a list can have no mode or several modes, and this calculator reports all of them.",
          "When the mean and median differ sharply, the distribution is skewed. A single very large value pulls the mean upward while leaving the median almost unchanged, which is why median income is used for economic statistics.",
        ],
        formula: "mean = Σx ÷ n    ·    median = middle of sorted x    ·    mode = most frequent x",
      },
      examples: [
        {
          title: "Five test scores",
          steps: ["Scores: 72, 85, 91, 68, 85.", "Sum = 401, so the mean is 80.2.", "Sorted, the middle value is 85. The most frequent value is also 85."],
          result: "Mean 80.2 · Median 85 · Mode 85",
        },
        {
          title: "Spotting a skewed salary list",
          steps: ["Salaries: 30, 32, 34, 36, 38, 250 (in thousands).", "Mean is about 70, median is 35.", "The gap signals an outlier."],
          result: "Median is the better summary of a typical salary",
        },
      ],
      limitations: [
        "Only numeric values are included; text entries are skipped and counted separately in the summary.",
        "The calculator does not weight values. Use the GPA calculator or a weighted mean for weighted averages.",
        "Mode is only meaningful for repeated values; a list of unique numbers has no mode.",
      ],
      faqs: [
        {
          q: "Which average should I use?",
          a: "Use the mean for evenly distributed data, the median when outliers or skew are present, and the mode for categorical or repeated values such as shoe sizes.",
        },
        {
          q: "What if there are two middle values?",
          a: "The median is the mean of those two values. For 2, 4, 6, 8 the median is (4 + 6) ÷ 2 = 5.",
        },
        {
          q: "Can I paste numbers with currency symbols?",
          a: "Yes. Commas used as thousands separators and common currency symbols are stripped before parsing, provided the decimal separator is a period.",
        },
      ],
    },
  },
  {
    slug: "standard-deviation-calculator",
    name: "Standard Deviation Calculator",
    category: "calculators",
    tagline: "Sample and population standard deviation with variance and step-by-step working.",
    intent: "calculate standard deviation",
    keywords: [
      "standard deviation calculator",
      "sample standard deviation",
      "population standard deviation",
      "variance calculator",
      "statistics calculator",
    ],
    status: "live",
    actions: ["copy"],
    effort: "quick",
    popularity: 68,
    addedAt: "2025-01-24",
    seoTitle: "Standard Deviation Calculator — Sample & Population",
    seoDescription:
      "Calculate sample or population standard deviation, variance, mean and count with the full working shown. Handles decimals and negatives.",
    content: {
      intro: [
        "Standard deviation answers a question the mean cannot: how tightly are the values clustered around the average? Two classes can both average 70% while one has every student within five points of that and the other ranges from 30% to 100%.",
        "This calculator offers both the sample and population formulas, because dividing by n instead of n − 1 is the difference between describing your data and estimating a wider population.",
      ],
      howTo: [
        "Paste your numbers.",
        "Choose Sample (n − 1) if your data is a subset, or Population (n) if it is the entire group.",
        "Read the standard deviation and variance, plus the mean and count.",
        "Use the step table to check the squared deviations by hand.",
      ],
      method: {
        title: "Sample vs population",
        paragraphs: [
          "Both formulas start by finding the mean, then summing the squared differences from that mean. The population variance divides that sum by n; the sample variance divides by n − 1, Bessel's correction, because a sample mean is itself an estimate and dividing by n would systematically underestimate variability.",
          "Standard deviation is the square root of the variance, which returns the figure to the original units. Roughly 68% of a normal distribution lies within one standard deviation of the mean and about 95% within two.",
        ],
        formula: "σ = √(Σ(x − μ)² ÷ n)   ·   s = √(Σ(x − x̄)² ÷ (n − 1))",
      },
      examples: [
        {
          title: "Population of five test scores",
          steps: ["Scores: 72, 85, 91, 68, 85.", "Mean = 80.2.", "Squared deviations sum to 378.8; divide by 5 and take the root."],
          result: "σ ≈ 8.70 points",
        },
        {
          title: "The same values as a sample",
          steps: ["Same scores, sample mode.", "Divide the same sum by 4 instead of 5."],
          result: "s ≈ 9.73 points — larger, as expected",
        },
      ],
      limitations: [
        "Requires at least two values for the sample formula and at least one for the population formula.",
        "The 68–95 rule assumes a roughly normal distribution; skewed data needs different interpretation.",
        "The calculator uses the arithmetic mean, not a weighted or geometric mean.",
      ],
      faqs: [
        {
          q: "Should I use sample or population standard deviation?",
          a: "Use population when your numbers are the complete set — every student in the class, every day in the month. Use sample when the numbers are a subset used to infer a larger group.",
        },
        {
          q: "Why is the sample result always larger?",
          a: "Dividing by n − 1 instead of n increases the variance, correcting for the fact that a sample's spread tends to underestimate the population's.",
        },
        {
          q: "What does a standard deviation of zero mean?",
          a: "Every value is identical. There is no variability at all.",
        },
      ],
    },
  },
  {
    slug: "gpa-calculator",
    name: "GPA Calculator",
    category: "calculators",
    tagline: "Convert letter grades and credits into a weighted GPA on the 4.0 scale.",
    intent: "calculate gpa from grades",
    keywords: [
      "gpa calculator",
      "grade point average",
      "college gpa calculator",
      "weighted gpa",
      "4.0 scale calculator",
    ],
    status: "live",
    actions: ["copy"],
    effort: "quick",
    popularity: 83,
    addedAt: "2025-01-26",
    seoTitle: "GPA Calculator — Weighted Grade Point Average (4.0 Scale)",
    seoDescription:
      "Calculate your GPA from letter grades and credit hours on the standard 4.0 scale. Add semesters, see the weighted result and the credits counted.",
    content: {
      intro: [
        "A GPA is a credit-weighted average, not a plain average of grades. A four-credit course affects it twice as much as a two-credit course, which is why a single poor grade in a heavy course can move the number more than people expect.",
        "Enter your courses, credits and grades; the calculator converts each grade to its grade point, multiplies by credits, and divides by total credits. Cumulative mode lets you add semesters progressively.",
      ],
      howTo: [
        "Add a row for each course.",
        "Enter the credit hours and choose the letter grade.",
        "Add more semesters if you need a cumulative GPA.",
        "Read the weighted GPA and the total credits counted.",
      ],
      method: {
        title: "The 4.0 scale",
        paragraphs: [
          "Each letter grade maps to a grade point: A = 4.0, A− = 3.7, B+ = 3.3, B = 3.0, B− = 2.7, C+ = 2.3, C = 2.0, C− = 1.7, D+ = 1.3, D = 1.0, D− = 0.7 and F = 0. Some institutions award A+ = 4.0 and some award 4.3; this calculator uses 4.0, the most common convention.",
          "The GPA is the sum of (grade point × credits) divided by total credits. Courses with zero credits are excluded because they cannot influence a weighted average. Pass/fail courses are excluded too, since they have no grade point.",
        ],
        formula: "GPA = Σ(grade point × credits) ÷ Σ(credits)",
      },
      examples: [
        {
          title: "One semester, four courses",
          steps: ["A in a 3-credit course: 4.0 × 3 = 12.0", "B+ in a 3-credit course: 3.3 × 3 = 9.9", "A− in a 4-credit course: 3.7 × 4 = 14.8", "B in a 2-credit course: 3.0 × 2 = 6.0", "Total points 42.7 ÷ 12 credits"],
          result: "GPA 3.56",
        },
        {
          title: "Cumulative across two semesters",
          steps: ["Semester 1: 3.40 over 15 credits.", "Semester 2: 3.80 over 15 credits.", "Average the weighted points, not the two GPAs."],
          result: "3.60 cumulative — not 3.60 by coincidence of equal credits",
        },
      ],
      limitations: [
        "Grade scales vary by institution; some use A+ = 4.3, some weight honours and AP courses differently.",
        "The calculator does not know your school's policy on retaken courses or grade replacement.",
        "Self-reported grades should be verified against an official transcript before being used in an application.",
      ],
      faqs: [
        {
          q: "How do I calculate a cumulative GPA?",
          a: "Multiply each semester's GPA by its credits, sum those products, then divide by the total credits. Averaging the GPAs directly is only correct when every semester has the same number of credits.",
        },
        {
          q: "Does a pass/fail course affect my GPA?",
          a: "Usually not, because it has no grade point. It still counts toward graduation credits, so check your institution's rules.",
        },
        {
          q: "What is a good GPA?",
          a: "It depends on the institution and programme. In the US, 3.0 is often the threshold for graduate school eligibility and 3.5+ is typically competitive.",
        },
      ],
    },
  },
];
