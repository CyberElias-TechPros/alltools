import type { ToolDefinition } from "../types";

export const financeTools: ToolDefinition[] = [
  {
    slug: "loan-calculator",
    name: "Loan Calculator",
    category: "finance",
    tagline: "Monthly payment; total interest and a full amortisation schedule.",
    intent: "calculate loan repayment and monthly payment",
    keywords: [
      "loan calculator",
      "loan repayment calculator",
      "monthly payment calculator",
      "amortization schedule",
      "mortgage payment calculator",
    ],
    status: "live",
    actions: ["copy", "download"],
    effort: "guided",
    popularity: 87,
    addedAt: "2025-02-02",
    seoTitle: "Loan Calculator — Monthly Payment & Amortisation Schedule",
    seoDescription:
      "Calculate monthly loan payments, total interest and a complete amortisation schedule. Includes the formula, a worked example and a CSV download.",
    content: {
      intro: [
        "A loan quote usually gives you a rate and a term. What you need is the payment, the total interest and a sense of how much of each payment actually reduces the balance. This calculator produces all three, plus a month-by-month amortisation schedule you can download.",
        "The maths is a standard annuity formula, not a bank's proprietary model. That means the numbers here are usually within rounding of a lender's quote, but fees, insurance, origination charges and compounding conventions are not included unless you enter their effect yourself.",
      ],
      howTo: [
        "Enter the amount borrowed, the annual interest rate and the term in years.",
        "Optionally add a monthly fee or extra payment to see the impact.",
        "Review the monthly payment and total interest.",
        "Scroll to the schedule and download it as CSV for a spreadsheet.",
      ],
      method: {
        title: "The annuity formula",
        paragraphs: [
          "A fixed-rate loan is an annuity: equal payments over a set number of periods. The payment is the principal multiplied by the periodic rate, divided by one minus (1 + periodic rate) to the negative number of periods. When the rate is zero the formula collapses to principal ÷ periods.",
          "Each payment splits into interest on the outstanding balance and principal reduction. Early payments are mostly interest; later payments are mostly principal. The schedule applies this split month by month, which is why total interest is not simply rate × principal × years.",
        ],
        formula: "PMT = P × r ÷ (1 − (1 + r)^−n)   where r = annual rate ÷ 12, n = years × 12",
      },
      examples: [
        {
          title: "A $20,000 car loan at 6% for 5 years",
          steps: ["Principal 20,000, rate 6%, 60 months.", "Monthly rate 0.005.", "PMT = 20,000 × 0.005 ÷ (1 − 1.005⁻⁶⁰)."],
          result: "$386.66 per month · $3,199.58 total interest",
        },
        {
          title: "Adding $100 extra each month",
          steps: ["Same loan with a $100 extra payment.", "The balance falls faster, shortening the term.", "The schedule shows the payoff month."],
          result: "Loan repaid several months early with less interest paid",
        },
      ],
      limitations: [
        "Does not include lender fees, insurance, taxes or early-repayment penalties.",
        "Assumes a fixed rate for the whole term; variable-rate loans need a separate projection.",
        "Rounding differences of a few cents are normal compared with a lender's statement.",
      ],
      faqs: [
        {
          q: "Why is most of my early payment interest?",
          a: "Interest is charged on the outstanding balance, which is largest at the start. As the balance falls, the interest portion shrinks and the principal portion grows.",
        },
        {
          q: "Does paying extra always save money?",
          a: "On a simple fixed-rate loan, yes — extra principal reduces the balance that interest is charged on. Check for prepayment penalties and confirm the lender applies extra payments to principal.",
        },
        {
          q: "Is this a mortgage calculator?",
          a: "It uses the same amortisation maths, so it works for fixed-rate mortgages. Property taxes, insurance and escrow are not included.",
        },
      ],
    },
  },
  {
    slug: "compound-interest-calculator",
    name: "Compound Interest Calculator",
    category: "finance",
    tagline: "Project savings growth with compounding and regular contributions.",
    intent: "calculate compound interest",
    keywords: [
      "compound interest calculator",
      "savings calculator",
      "investment growth calculator",
      "monthly contribution calculator",
      "future value calculator",
    ],
    status: "live",
    actions: ["copy", "download"],
    effort: "guided",
    popularity: 84,
    addedAt: "2025-02-03",
    seoTitle: "Compound Interest Calculator — Growth With Contributions",
    seoDescription:
      "See how savings grow with compound interest and monthly contributions. Includes a year-by-year table, the formula and the effect of fee drag.",
    content: {
      intro: [
        "Compound interest is interest earning interest. The difference between simple and compound growth is invisible in year one and dramatic in year twenty, which is exactly why a projection is more useful than a rule of thumb.",
        "Enter a starting balance, a rate, a term and any regular contribution. The calculator returns the future value, the split between contributions and growth, and a year-by-year table so you can see when compounding starts to dominate.",
      ],
      howTo: [
        "Enter your starting amount and the annual rate.",
        "Choose the compounding frequency — monthly is the usual convention for savings accounts.",
        "Add a regular contribution and choose whether it is monthly or annual.",
        "Set the term and optionally an annual fee to see its effect.",
        "Download the year-by-year projection as CSV.",
      ],
      method: {
        title: "Future value with contributions",
        paragraphs: [
          "The lump sum grows as P × (1 + r/n)^(n·t). Contributions form an annuity whose future value is PMT × ((1 + r/n)^(n·t) − 1) ÷ (r/n), assuming contributions arrive at the end of each period. When the rate is zero the contribution part becomes simply PMT × periods.",
          "The annual fee is deducted from the effective rate before compounding, which approximates the drag of an expense ratio. Real funds deduct fees continuously from the balance, so a small difference is possible in long projections.",
        ],
        formula: "FV = P(1 + r/n)^(nt) + PMT × ((1 + r/n)^(nt) − 1) ÷ (r/n)",
      },
      examples: [
        {
          title: "$5,000 at 7% for 10 years, no contributions",
          steps: ["P = 5,000, r = 0.07, n = 12, t = 10.", "5,000 × (1 + 0.07/12)^120."],
          result: "$10,048.31 — contributions $5,000, growth $5,048.31",
        },
        {
          title: "$200 a month for 30 years at 6%",
          steps: ["No starting balance.", "Monthly rate 0.005, 360 periods.", "Annuity future value formula."],
          result: "About $200,903 — $72,000 contributed, the rest is growth",
        },
      ],
      limitations: [
        "Projections assume a constant rate; real returns vary year to year and can be negative.",
        "Tax is not modelled. Tax-advantaged accounts and capital gains rules change the effective result.",
        "Contributions are assumed to arrive at period end; contributing at the start of each period produces a slightly higher result.",
      ],
      faqs: [
        {
          q: "What compounding frequency should I use?",
          a: "Use monthly for savings accounts and most loan-style products, annually for quoted annual returns, and daily only if a provider states daily compounding — the difference is small at typical rates.",
        },
        {
          q: "Does this account for inflation?",
          a: "No. Subtract expected inflation from the nominal rate to approximate real growth, or treat the result as future nominal money.",
        },
        {
          q: "Why is my bank's figure different?",
          a: "Usually due to contribution timing, fee treatment or rounding. Banks may also compound daily and credit monthly.",
        },
      ],
    },
  },
  {
    slug: "profit-margin-calculator",
    name: "Profit Margin Calculator",
    category: "finance",
    tagline: "Turn cost and price into margin, markup and profit — without confusing the two.",
    intent: "calculate profit margin and markup",
    keywords: [
      "profit margin calculator",
      "markup calculator",
      "gross margin",
      "margin vs markup",
      "selling price calculator",
    ],
    status: "live",
    actions: ["copy"],
    effort: "instant",
    popularity: 71,
    addedAt: "2025-02-05",
    seoTitle: "Profit Margin Calculator — Margin, Markup & Selling Price",
    seoDescription:
      "Calculate profit margin, markup and profit from cost and price. Understand why a 50% markup is only a 33% margin, with worked examples.",
    content: {
      intro: [
        "Margin and markup are different numbers describing the same sale, and confusing them is expensive. A product that costs $60 and sells for $90 has a 50% markup but only a 33.3% margin — and pricing decisions made with the wrong one quietly erode profit.",
        "This calculator shows both, plus the profit in currency, and can work backwards from a target margin to the price you should charge.",
      ],
      howTo: [
        "Enter your unit cost and selling price.",
        "Read margin (profit as a share of price) and markup (profit as a share of cost).",
        "Switch to target mode to solve for the price that achieves a margin you specify.",
        "Copy the figures into a pricing sheet.",
      ],
      method: {
        title: "Margin vs markup",
        paragraphs: [
          "Profit is price minus cost. Margin divides profit by price; markup divides profit by cost. Because price is always larger than cost for a profitable sale, markup is always the larger percentage.",
          "To price for a target margin, divide cost by (1 − target margin). A 40% target margin on a $60 cost gives 60 ÷ 0.6 = $100. Pricing by adding 40% to cost gives $84, which is only a 28.6% margin — the classic mistake.",
        ],
        formula: "margin = (price − cost) ÷ price    ·    markup = (price − cost) ÷ cost",
      },
      examples: [
        {
          title: "Cost $60, price $90",
          steps: ["Profit = 30.", "Margin = 30 ÷ 90 = 33.3%.", "Markup = 30 ÷ 60 = 50%."],
          result: "33.3% margin · 50% markup · $30 profit per unit",
        },
        {
          title: "Pricing for a 40% margin",
          steps: ["Cost = 60, target margin = 40%.", "Price = 60 ÷ (1 − 0.4)."],
          result: "$100 selling price",
        },
      ],
      limitations: [
        "This is gross margin on a single unit. It excludes overheads, shipping, payment fees and returns, all of which reduce net margin.",
        "Currency is not converted; enter all figures in the same currency.",
        "Margin cannot be 100% or more because cost must be greater than zero.",
      ],
      faqs: [
        {
          q: "Is a 50% markup the same as a 50% margin?",
          a: "No. A 50% markup on a $60 cost is a $30 profit on a $90 price, which is a 33.3% margin. Reaching a 50% margin requires a $120 price — a 100% markup.",
        },
        {
          q: "What is a good profit margin?",
          a: "It varies enormously by industry: grocery retail often runs in single digits, software can exceed 70%. Compare against your sector rather than a universal target.",
        },
        {
          q: "Does margin include shipping?",
          a: "Only if you include shipping cost in the unit cost. Many businesses calculate a contribution margin that includes delivery and payment processing.",
        },
      ],
    },
  },
  {
    slug: "roi-calculator",
    name: "ROI Calculator",
    category: "finance",
    tagline: "Return on investment, net gain and annualised return.",
    intent: "calculate return on investment",
    keywords: [
      "roi calculator",
      "return on investment",
      "investment return calculator",
      "annualized roi",
      "profit on investment",
    ],
    status: "live",
    actions: ["copy"],
    effort: "instant",
    popularity: 77,
    addedAt: "2025-02-06",
    seoTitle: "ROI Calculator — Return on Investment & Annualised Return",
    seoDescription:
      "Calculate ROI, net gain and annualised return for any investment. Includes the formula, worked examples and an honest look at ROI's limits.",
    content: {
      intro: [
        "Return on investment expresses profit as a percentage of what you put in, which makes projects of different sizes comparable: a $200 gain on a $1,000 outlay is a 20% return, the same as $20,000 on $100,000.",
        "The simple ROI formula ignores time, though. This calculator also shows the annualised return, which is the figure to use when comparing a two-year project with a ten-year one.",
      ],
      howTo: [
        "Enter the amount invested, including fees and costs.",
        "Enter the amount returned or the final value.",
        "Optionally enter the holding period in months to annualise the result.",
        "Compare the simple ROI with the annualised figure.",
      ],
      method: {
        title: "Simple and annualised ROI",
        paragraphs: [
          "Simple ROI is (gain ÷ cost) × 100, where gain is the return minus the investment. It is easy to compute and easy to misread: a 30% return over five years is far worse than 30% over one year.",
          "Annualised ROI converts the total return into a compound annual growth rate: (final ÷ initial)^(1 ÷ years) − 1. This is the correct way to compare investments of different durations.",
        ],
        formula: "ROI = (gain ÷ cost) × 100    ·    CAGR = (final ÷ initial)^(1 ÷ years) − 1",
      },
      examples: [
        {
          title: "A $1,000 investment returning $1,250",
          steps: ["Gain = 250.", "250 ÷ 1,000 × 100."],
          result: "25% ROI",
        },
        {
          title: "The same return over four years",
          steps: ["Annualise the 25% total return over 4 years.", "(1.25)^(1/4) − 1."],
          result: "About 5.74% per year compounded",
        },
      ],
      limitations: [
        "Simple ROI ignores the timing of cash flows; use IRR or NPV when money moves in and out over time.",
        "It does not account for risk, taxes or inflation.",
        "A negative ROI is possible and is shown with a minus sign.",
      ],
      faqs: [
        {
          q: "What counts as the investment cost?",
          a: "Everything you spend to make the return: purchase price, fees, transaction costs, and any ongoing costs you want to attribute to the project.",
        },
        {
          q: "Why annualise ROI?",
          a: "Because percentages without a time frame are not comparable. Annualising puts a one-year and a ten-year investment on the same footing.",
        },
        {
          q: "Is ROI the same as profit?",
          a: "No. Profit is an absolute amount; ROI expresses it relative to the capital used. Both matter — a large ROI on a tiny investment may still be less valuable than a modest ROI on a large one.",
        },
      ],
    },
  },
];
