import type { ToolDefinition } from "../types";

/**
 * Finance tools from docs/BLUEPRINT.md §C. Everything compounds, discounts and
 * amortises locally — no rates are fetched from a server, so nothing here can
 * silently go stale except a rate you type in yourself.
 */
export const financeMoreTools: ToolDefinition[] = [
  {
    slug: "simple-interest-calculator",
    name: "Simple Interest Calculator",
    category: "finance",
    tagline: "Interest charged on the original principal only, year by year.",
    intent: "calculate simple interest",
    keywords: ["simple interest calculator", "interest formula", "loan interest calculator", "i = prt"],
    status: "live",
    actions: ["copy"],
    effort: "instant",
    popularity: 70,
    addedAt: "2025-11-02",
    seoTitle: "Simple Interest Calculator — I = P × R × T",
    seoDescription:
      "Calculate simple interest on a loan or deposit: enter the principal, annual rate and term to see the interest, the total and a year-by-year balance.",
    content: {
      intro: [
        "Simple interest is exactly that: interest on the original amount, never on interest already earned. A five-year loan at 6% costs 30% of the principal in total interest, evenly spread.",
        "That makes it predictable, and it is why short-term loans, some car finance and many savings products quote it. Compare the total against a compound calculator before deciding a deal is cheap.",
      ],
      howTo: [
        "Enter the principal, the annual rate and the term in years.",
        "Read the interest, the total to repay and the per-year table.",
        "Compare the total with a compound interest calculation for the same terms.",
        "Copy the figures into a quote or a study answer.",
      ],
      method: {
        title: "The formula",
        paragraphs: [
          "Simple interest is principal × rate × time, with the rate as a decimal: $5,000 at 6% for 3 years earns 5,000 × 0.06 × 3 = $900.",
          "Because the interest is never added to the principal, the yearly charge is constant. Fractional years work too: 18 months is 1.5 years.",
          "The table shows the balance as if the interest were accumulating for display, but the interest calculation itself never reinvests it.",
        ],
        formula: "I = P × r × t   ·   total = P + I",
      },
      examples: [
        { title: "$5,000 at 6% for 3 years", steps: ["5,000 × 0.06 × 3"], result: "$900 interest, $5,900 total" },
        { title: "$1,200 at 4.5% for 18 months", steps: ["1,200 × 0.045 × 1.5"], result: "$81 interest" },
      ],
      limitations: [
        "Assumes a fixed rate for the whole term; variable rates need a year-by-year calculation.",
        "Fees, arrangement charges and taxes are excluded.",
        "Some loans quote add-on interest, which is calculated like this but charged on the full principal for the whole term even as the balance falls — it is more expensive than it looks.",
      ],
      faqs: [
        { q: "When is simple interest used?", a: "Short-term and bridging loans, some car finance, and savings accounts that pay interest out rather than compounding it." },
        { q: "How is it different from compound interest?", a: "Compound interest charges interest on unpaid interest, so the balance grows faster. Over long periods the gap is large." },
        { q: "Can I use it for months?", a: "Yes — express the term as a fraction of a year, so 6 months is 0.5." },
      ],
    },
  },
  {
    slug: "savings-calculator",
    name: "Savings Calculator",
    category: "finance",
    tagline: "See what regular deposits plus interest add up to over time.",
    intent: "calculate savings growth with monthly deposits",
    keywords: ["savings calculator", "monthly savings calculator", "savings goal calculator", "compound savings"],
    status: "live",
    actions: ["copy"],
    effort: "instant",
    popularity: 81,
    addedAt: "2025-11-02",
    seoTitle: "Savings Calculator — Monthly Deposits and Interest",
    seoDescription:
      "See how a starting balance plus monthly deposits grows with interest. Enter a rate and term to get the final balance, total contributions and interest earned.",
    content: {
      intro: [
        "\"Save $250 a month\" sounds concrete until you ask what it adds up to. This calculator combines a starting balance, a monthly deposit and an interest rate into one projected balance, then separates your contributions from the interest.",
        "Splitting the total that way is the useful part: it shows how much of the final figure you actually paid in, which is usually the smaller share over long horizons.",
      ],
      howTo: [
        "Enter what you already have saved.",
        "Add the amount you deposit each month.",
        "Enter the interest rate and the number of years.",
        "Read the final balance and the interest earned.",
      ],
      method: {
        title: "Monthly compounding with deposits",
        paragraphs: [
          "Each month the balance earns one twelfth of the annual rate and the deposit is added. Over a year the effective return is slightly higher than the nominal rate because interest is credited monthly.",
          "Deposits are added at the end of the month, which is a slightly conservative assumption compared with depositing on payday.",
        ],
        formula: "balanceₙ = balanceₙ₋₁ × (1 + r/12) + deposit",
      },
      examples: [
        { title: "$2,000 start, $250 a month, 4.25% for 10 years", steps: ["Compound monthly.", "Compare contributions with interest."], result: "about $40,000, roughly a fifth of it interest" },
        { title: "Emergency fund", steps: ["$500 start, $150 a month at 3% for 2 years."], result: "about $4,240" },
      ],
      limitations: [
        "Interest rates on savings change; a single fixed rate is an assumption.",
        "Tax on interest is not deducted.",
        "Regular deposit amounts are assumed constant — the tool does not model increases.",
      ],
      faqs: [
        { q: "Should I save or pay down debt first?", a: "Compare the interest rate on the debt with the savings rate. Debt at 20% costs far more than savings at 4% earns." },
        { q: "Does the interest rate compound monthly?", a: "Yes. A 4.25% annual rate applied monthly is 4.33% effective over the year." },
        { q: "What about inflation?", a: "Use the Investment Growth Calculator, which shows the inflation-adjusted value alongside the nominal one." },
      ],
    },
  },
  {
    slug: "investment-growth-calculator",
    name: "Investment Growth Calculator",
    category: "finance",
    tagline: "Project a lump sum plus monthly contributions, in nominal and real terms.",
    intent: "project investment growth",
    keywords: ["investment growth calculator", "compound investment calculator", "portfolio projection", "real return"],
    status: "live",
    actions: ["copy"],
    effort: "instant",
    popularity: 75,
    addedAt: "2025-11-02",
    seoTitle: "Investment Growth Calculator — Nominal and Real Value",
    seoDescription:
      "Project an investment with monthly contributions and see both the nominal and inflation-adjusted value, plus the growth multiple and a year-by-year table.",
    content: {
      intro: [
        "Investment projections are only honest if they show the difference between the number on the statement and what that number will buy. This calculator shows both, using a real return derived from your expected return and your inflation assumption.",
        "The assumption is constant returns, which no market delivers — but a transparent assumption beats a vague hope, and the year-by-year table shows how much of the final balance is contributions rather than growth.",
      ],
      howTo: [
        "Enter the starting amount and any monthly top-up.",
        "Set an expected annual return.",
        "Add the number of years and an inflation assumption.",
        "Compare the nominal and real values before making a plan.",
      ],
      method: {
        title: "Nominal, real and the order of returns",
        paragraphs: [
          "The nominal projection compounds the expected return monthly. The real projection first converts the return into a real rate with (1 + r) ÷ (1 + inflation) − 1, then runs the same compounding, so the result is expressed in today's money.",
          "Real markets do not deliver constant returns: a bad decade early hurts far more than one late, because the money that would have compounded is missing. Treat a projection as a range, not a promise.",
        ],
        formula: "real rate = (1 + r) ÷ (1 + i) − 1   ·   FV = P(1 + r)ⁿ + contributions",
      },
      examples: [
        { title: "$10,000 plus $300 a month at 7% for 20 years", steps: ["Compound monthly.", "Subtract contributions from the final balance."], result: "roughly $200,000, of which about $82,000 is contributions" },
        { title: "Adding inflation", steps: ["Set inflation to 2.5% and compare."], result: "the real value is roughly a third lower" },
      ],
      limitations: [
        "Constant returns and constant contributions; real portfolios and salaries vary.",
        "Taxes on gains, platform fees and fund charges are not deducted — a 1% fee cuts a 20-year outcome by roughly 15%.",
        "Past returns do not predict future ones, and this is not investment advice.",
      ],
      faqs: [
        { q: "What return should I assume?", a: "Many planners use 5–7% nominal for a diversified equity portfolio, but the honest answer is a range with a wide spread." },
        { q: "Why show the real value?", a: "Because inflation erodes purchasing power. A nominal $500,000 in 30 years buys far less than $500,000 today." },
        { q: "Do fees matter that much?", a: "Yes. Charges compound against you exactly as returns compound for you." },
      ],
    },
  },
  {
    slug: "break-even-calculator",
    name: "Break-Even Calculator",
    category: "finance",
    tagline: "How many units you must sell to cover fixed costs, and the profit beyond it.",
    intent: "calculate break even point",
    keywords: ["break even calculator", "break even point", "contribution margin", "units to break even"],
    status: "live",
    actions: ["copy"],
    effort: "instant",
    popularity: 77,
    addedAt: "2025-11-02",
    seoTitle: "Break-Even Calculator — Units, Revenue and Profit",
    seoDescription:
      "Find the number of units needed to cover fixed costs, the revenue at break-even, the contribution per unit, and profit at higher volumes.",
    content: {
      intro: [
        "Break-even is the volume where revenue finally covers every cost. Below it you lose money at a predictable rate; above it each extra sale adds the contribution margin straight to profit.",
        "The calculator needs three numbers — fixed costs, price and variable cost — and returns the break-even volume rounded up, since half a unit cannot be sold.",
      ],
      howTo: [
        "Enter the fixed costs that exist whatever you sell.",
        "Enter the price per unit and its variable cost.",
        "Read the break-even units, revenue and contribution per unit.",
        "Use the scenarios table to see profit at higher volumes.",
      ],
      method: {
        title: "Contribution margin",
        paragraphs: [
          "Each sale contributes price minus variable cost. Divide fixed costs by that contribution and you get the number of sales needed to cover them: $12,000 of fixed costs with a $24 contribution needs 500 units.",
          "If the contribution is zero or negative, no volume will ever break even — selling more simply multiplies the loss. The tool says so rather than returning a nonsensical number.",
        ],
        formula: "break-even units = fixed costs ÷ (price − variable cost)",
      },
      examples: [
        { title: "$12,000 fixed, $40 price, $16 variable", steps: ["Contribution = 24.", "12,000 ÷ 24"], result: "500 units, $20,000 revenue" },
        { title: "A product that loses money per sale", steps: ["Price 20, variable cost 25."], result: "no break-even exists" },
      ],
      limitations: [
        "Assumes fixed costs and unit prices stay constant across the volume range.",
        "Variable costs are linear; bulk discounts and step costs are not modelled.",
        "Tax and financing costs sit outside this calculation.",
      ],
      faqs: [
        { q: "What is contribution margin?", a: "Price minus variable cost — the money each sale contributes towards fixed costs and then profit." },
        { q: "Why round up?", a: "Because 499.6 units is not achievable; you need the first whole unit at which the business stops losing money." },
        { q: "Does break-even include the owner's salary?", a: "Only if you count it as a fixed cost, which you should if the business must pay it." },
      ],
    },
  },
  {
    slug: "business-profit-calculator",
    name: "Business Profit Calculator",
    category: "finance",
    tagline: "Gross, operating and net profit with margins, from one simple P&L.",
    intent: "calculate business profit and margins",
    keywords: ["profit calculator", "business profit", "net profit calculator", "gross margin calculator"],
    status: "live",
    actions: ["copy"],
    effort: "instant",
    popularity: 80,
    addedAt: "2025-11-02",
    seoTitle: "Business Profit Calculator — Gross, Operating and Net",
    seoDescription:
      "Turn revenue, cost of goods sold and operating expenses into gross profit, operating profit and net profit, with margins and an optional tax line.",
    content: {
      intro: [
        "Profit is three different numbers stacked on top of each other: gross profit after direct costs, operating profit after running costs, and net profit after interest and tax. Each answers a different question about the business.",
        "This calculator builds the stack from four inputs and shows every line as a share of revenue, which is how a profit and loss statement is usually read.",
      ],
      howTo: [
        "Enter revenue and the cost of goods sold.",
        "Add operating expenses such as rent, salaries and marketing.",
        "Optionally add other income or costs and a tax rate.",
        "Read net profit and the margin at each level.",
      ],
      method: {
        title: "The three profit lines",
        paragraphs: [
          "Gross profit = revenue − cost of goods sold, and its margin shows how much each sale leaves before overheads. Operating profit subtracts operating expenses, showing whether the business model works before financing. Net profit subtracts tax to give what the owner keeps.",
          "A business can be profitable gross and loss-making net — a healthy 40% gross margin can vanish under overheads. That is why the margins at each level are shown, not just the final figure.",
        ],
        formula: "gross = revenue − COGS   ·   operating = gross − opex   ·   net = operating + other − tax",
      },
      examples: [
        { title: "Revenue $48,000, COGS $27,000, opex $11,500", steps: ["Gross profit $21,000 (43.8%).", "Operating profit $9,500 (19.8%)."], result: "$9,500 before tax" },
        { title: "Adding 21% tax", steps: ["Tax $1,995.", "Net $7,505."], result: "15.6% net margin" },
      ],
      limitations: [
        "A single period is modelled; seasonal businesses need each month or quarter separately.",
        "Depreciation, amortisation and interest are folded into other costs rather than broken out.",
        "Tax rules vary by country and entity type — treat the tax line as an estimate.",
      ],
      faqs: [
        { q: "What counts as cost of goods sold?", a: "Costs that rise directly with each sale: materials, packaging, payment fees, delivery, and sometimes the labour of producing the item." },
        { q: "Which margin matters most?", a: "Gross margin for pricing decisions, operating margin for the health of the business, net margin for what is actually retained." },
        { q: "Why is my net margin lower than my accountant's?", a: "Because this model does not include depreciation, interest, one-off costs or the specific tax treatment of your entity." },
      ],
    },
  },
  {
    slug: "business-revenue-calculator",
    name: "Business Revenue Calculator",
    category: "finance",
    tagline: "Gross to net revenue after discounts, returns and payment fees.",
    intent: "calculate net revenue",
    keywords: ["revenue calculator", "net revenue", "sales revenue calculator", "gross revenue"],
    status: "live",
    actions: ["copy"],
    effort: "instant",
    popularity: 72,
    addedAt: "2025-11-02",
    seoTitle: "Revenue Calculator — Gross to Net After Discounts",
    seoDescription:
      "Work out revenue from units and price, then see how discounts, returns and payment fees reduce it. Includes a waterfall table and a net revenue figure.",
    content: {
      intro: [
        "The number at the top of a sales report is rarely what lands in the bank. Discounts, refunds and payment processing each take a slice, and each slice applies to a smaller amount than the one before it.",
        "This calculator builds that waterfall from units and average price, so the net figure reflects what the business actually keeps before costs.",
      ],
      howTo: [
        "Enter the average selling price and the number of units.",
        "Add your discount rate, return rate and payment fees.",
        "Read the net revenue and the waterfall table.",
        "Copy the figure into a forecast or a dashboard.",
      ],
      method: {
        title: "Why the order matters",
        paragraphs: [
          "Deductions compound in sequence. If 8% of sales are discounted and 3% are refunded after that, the refund applies to the discounted amount, not the original gross. Applying all percentages to the gross figure overstates net revenue.",
          "Payment fees are charged on what is actually collected, so they come last, after refunds.",
        ],
        formula: "net = price × units × (1 − discount) × (1 − returns) × (1 − fees)",
      },
      examples: [
        { title: "820 units at $45", steps: ["Gross $36,900.", "Apply 8% discount, 3% returns and 2.9% fees."], result: "about $32,000 net" },
        { title: "Ignoring returns", steps: ["Compare with returns at 0%."], result: "the difference is roughly $1,000 of revenue that never arrives" },
      ],
      limitations: [
        "Averages only: a mixed basket with different prices needs a line-by-line calculation.",
        "Payment fees are assumed to be percentage-only; fixed per-transaction fees are not included.",
        "Revenue is not profit — cost of goods is not part of this calculation.",
      ],
      faqs: [
        { q: "What is the difference between gross and net revenue?", a: "Gross revenue is sales before deductions; net revenue is what remains after discounts, returns and fees." },
        { q: "Should I include tax in revenue?", a: "No. Sales tax is collected on behalf of the tax authority and is not revenue." },
        { q: "How do refunds affect revenue timing?", a: "In accrual accounting a refund reduces the period it relates to; in cash accounting it reduces the period it is paid." },
      ],
    },
  },
  {
    slug: "commission-calculator",
    name: "Commission Calculator",
    category: "finance",
    tagline: "Commission on a sale, with thresholds, splits and an optional base salary.",
    intent: "calculate sales commission",
    keywords: ["commission calculator", "sales commission", "real estate commission", "commission split"],
    status: "live",
    actions: ["copy"],
    effort: "instant",
    popularity: 74,
    addedAt: "2025-11-02",
    seoTitle: "Commission Calculator — Sales, Thresholds and Splits",
    seoDescription:
      "Calculate commission on a sale, apply a threshold so only the excess earns commission, split the fee with a co-broker and add any base salary.",
    content: {
      intro: [
        "Commission arithmetic gets messy in three places: whether the rate applies to the whole sale or only the part above a threshold, how the fee is split with another agent, and whether a base salary is added on top.",
        "This calculator handles all three in one screen, and shows how the payout changes with the size of the deal.",
      ],
      howTo: [
        "Enter the sale amount and the commission rate.",
        "Add a threshold if commission only starts above a certain figure.",
        "Choose the split if you share the fee.",
        "Add a base salary to see total pay.",
      ],
      method: {
        title: "Thresholds and splits",
        paragraphs: [
          "With a threshold, only sales above it earn commission: a 5% rate on a $20,000 sale with a $5,000 threshold pays 5% of $15,000, not of $20,000. Thresholds protect the employer and are common in recruitment and property.",
          "A split divides the commission after it is calculated — a 50/50 co-broke on a 6% fee on $18,500 gives each side $555.",
        ],
        formula: "commission = (sale − threshold) × rate × split",
      },
      examples: [
        { title: "6% on $18,500", steps: ["18,500 × 0.06"], result: "$1,110" },
        { title: "Same sale, 50% co-broke", steps: ["$1,110 × 0.5"], result: "$555 each" },
      ],
      limitations: [
        "Tiered or accelerating commission plans (where the rate rises with volume) need a separate calculation per tier.",
        "Taxes and deductions from the commission are not applied.",
        "Clawbacks if a deal falls through are not modelled.",
      ],
      faqs: [
        { q: "Is commission calculated before or after tax?", a: "Commission is normally a percentage of the sale value before tax; sales tax is not commissionable." },
        { q: "What is a co-broke split?", a: "When two agents represent different sides of the same deal and divide the total fee between them." },
        { q: "How do draw accounts work?", a: "A draw is an advance against future commission — you repay it from later earnings, so net pay can be lower than the commission earned." },
      ],
    },
  },
  {
    slug: "salary-calculator",
    name: "Salary Calculator",
    category: "finance",
    tagline: "Take-home pay per week, month or year after tax, pension and deductions.",
    intent: "calculate take home pay from salary",
    keywords: ["salary calculator", "take home pay", "net salary", "paycheck calculator"],
    status: "live",
    actions: ["copy"],
    effort: "instant",
    popularity: 88,
    addedAt: "2025-11-02",
    seoTitle: "Salary Calculator — Take-Home Pay After Deductions",
    seoDescription:
      "Convert a gross salary into take-home pay using an effective tax rate and optional pension and deductions. See weekly, biweekly, monthly and annual net pay.",
    content: {
      intro: [
        "Gross salary is the number in the offer letter; take-home pay is the number that pays rent. The gap comes from income tax, social contributions, pension and any local deductions.",
        "This calculator takes those as rates and fixed amounts rather than pretending to know your tax code, and shows the result at every common pay frequency.",
      ],
      howTo: [
        "Enter the annual gross salary.",
        "Enter your effective income tax rate — total tax divided by gross income.",
        "Add pension and any fixed annual deductions.",
        "Choose how often you are paid to see the per-period figure.",
      ],
      method: {
        title: "Effective rate, not marginal bracket",
        paragraphs: [
          "Tax systems are progressive, so your marginal bracket is only charged on the last slice of income. The effective rate — total tax divided by total income — is the number that turns gross into net in one step.",
          "Deductions that are percentages of salary (pension, sometimes union dues) are applied to the gross, then fixed amounts are subtracted. The remainder is split by the number of pay periods.",
        ],
        formula: "net = gross − gross × tax% − gross × pension% − fixed deductions",
      },
      examples: [
        { title: "$85,000 gross, 22% tax, 5% pension", steps: ["Tax $18,700, pension $4,250.", "Net $62,050."], result: "about $5,171 a month" },
        { title: "Same salary paid biweekly", steps: ["Divide by 26."], result: "about $2,387 per paycheque" },
      ],
      limitations: [
        "A single effective rate cannot reproduce progressive brackets, thresholds or allowances exactly.",
        "Country and state specific rules, student loan repayments and benefit clawbacks need a payroll calculator.",
        "Biweekly and semi-monthly differ: 26 paycheques versus 24, which changes each cheque even though the annual total is the same.",
      ],
      faqs: [
        { q: "Why is biweekly pay not half of monthly?", a: "Because there are 26 biweekly pays but only 12 months; each biweekly cheque is smaller even though the annual total matches." },
        { q: "What is an effective tax rate?", a: "Total income tax divided by gross income. If you earn 85,000 and pay 18,700 in tax, the effective rate is 22%." },
        { q: "Should pension be included in net pay?", a: "Money going into a pension is not in your bank account, so it is excluded here. It is still yours, just not spendable today." },
      ],
    },
  },
  {
    slug: "hourly-to-monthly-salary-converter",
    name: "Hourly to Monthly Salary Converter",
    category: "finance",
    tagline: "Turn an hourly rate into weekly, monthly and annual pay — and back again.",
    intent: "convert hourly rate to annual salary",
    keywords: ["hourly to salary", "hourly to annual salary", "wage converter", "salary to hourly"],
    status: "live",
    actions: ["copy"],
    effort: "instant",
    popularity: 82,
    addedAt: "2025-11-02",
    seoTitle: "Hourly to Salary Converter — Weekly, Monthly, Annual",
    seoDescription:
      "Convert an hourly wage into weekly, monthly and annual pay using your real working weeks, including unpaid leave. Shows the equivalent day rate as well.",
    content: {
      intro: [
        "An hourly rate and a salary are not directly comparable until you know the hours. $28.50 an hour sounds like $59,280 a year at 40 hours for 52 weeks, but unpaid leave, holiday and overtime change the real figure.",
        "Set your actual paid weeks and weekly hours and the conversion reflects the job you have rather than an idealised one.",
      ],
      howTo: [
        "Enter the hourly rate and the hours you are paid for each week.",
        "Set the number of paid weeks — 52 if holiday is paid, fewer if it is not.",
        "Subtract any additional unpaid weeks.",
        "Read the equivalent weekly, monthly and annual figures.",
      ],
      method: {
        title: "The calculation",
        paragraphs: [
          "Annual pay is hourly rate × weekly hours × paid weeks. Monthly pay is that total divided by 12, regardless of how many days the month has, because salaries are annual figures spread evenly.",
          "For contractors the paid-weeks input matters most: 46 weeks instead of 52 cuts the annual equivalent by more than 11%, and that is before unpaid admin time.",
        ],
        formula: "annual = rate × hours × paid weeks   ·   monthly = annual ÷ 12",
      },
      examples: [
        { title: "$28.50 × 40 hours × 52 weeks", steps: ["Multiply through."], result: "$59,280 a year, $4,940 a month" },
        { title: "Contracting with 46 paid weeks", steps: ["$28.50 × 40 × 46."], result: "$52,440 a year" },
      ],
      limitations: [
        "Overtime, bonuses and shift differentials are not included.",
        "Taxes and deductions are not applied; this is gross pay.",
        "Paid weeks assume a regular weekly pattern — irregular shift work needs an average.",
      ],
      faqs: [
        { q: "How do I compare a salary with a contract rate?", a: "Convert both to annual gross, then subtract the costs a contractor carries: equipment, insurance, software, unpaid holiday and admin time." },
        { q: "Why divide by 12 rather than by days?", a: "Salaried pay is an annual figure divided into equal periods, so February pays the same as March." },
        { q: "What about a 37.5-hour week?", a: "Enter 37.5 directly — decimal hours are fine." },
      ],
    },
  },
  {
    slug: "overtime-calculator",
    name: "Overtime Calculator",
    category: "finance",
    tagline: "Regular pay plus time-and-a-half or double time, with a blended rate.",
    intent: "calculate overtime pay",
    keywords: ["overtime calculator", "time and a half calculator", "overtime pay", "double time"],
    status: "live",
    actions: ["copy"],
    effort: "instant",
    popularity: 76,
    addedAt: "2025-11-02",
    seoTitle: "Overtime Calculator — Time and a Half, Double Time",
    seoDescription:
      "Calculate overtime pay from an hourly rate, regular hours and overtime hours at any multiplier. Compare 1.25×, 1.5×, 1.75× and 2× in one table.",
    content: {
      intro: [
        "Overtime pay is straightforward once the multiplier is clear: regular hours at the normal rate, extra hours at the multiplier. The confusion usually comes from which hours qualify and how the blended rate is reported.",
        "This calculator handles any multiplier, so time-and-a-quarter, time-and-a-half and double time all work without a separate tool.",
      ],
      howTo: [
        "Enter the hourly rate.",
        "Enter regular and overtime hours for the period.",
        "Set the multiplier your contract specifies.",
        "Compare the total against the other common multipliers in the table.",
      ],
      method: {
        title: "Pay and blended rate",
        paragraphs: [
          "Regular pay is rate × regular hours. Overtime pay is rate × multiplier × overtime hours. The blended rate divides the total by all hours worked, which is useful when a payslip quotes an average.",
          "A 1.5× multiplier on a $22 rate pays $33 an hour for overtime. Because only the overtime hours are enhanced, the blended rate lands between $22 and $33.",
        ],
        formula: "total = rate × regular + rate × multiplier × overtime",
      },
      examples: [
        { title: "40 regular and 6 overtime hours at $22, 1.5×", steps: ["$880 regular.", "$198 overtime."], result: "$1,078 total" },
        { title: "The same week at double time", steps: ["6 × $44."], result: "$1,144 total" },
      ],
      limitations: [
        "Does not decide which hours legally qualify — that depends on your jurisdiction and contract.",
        "Shift differentials, bonuses and tips are excluded.",
        "Taxes are not deducted.",
      ],
      faqs: [
        { q: "When does overtime start?", a: "In many places after 40 hours in a work week, but some countries use 8 hours a day or 48 hours a week. Check your contract." },
        { q: "Is overtime taxed more?", a: "Not as a special rate — it is taxed as ordinary income, though withholding can look higher because it is calculated per pay period." },
        { q: "What is time and a half?", a: "1.5 times the normal hourly rate, so $20 becomes $30 for those hours." },
      ],
    },
  },
  {
    slug: "freelance-rate-calculator",
    name: "Freelance Rate Calculator",
    category: "finance",
    tagline: "The hourly rate you need to hit a target income from billable hours alone.",
    intent: "calculate freelance hourly rate",
    keywords: ["freelance rate calculator", "hourly rate calculator", "contractor rate", "day rate calculator"],
    status: "live",
    actions: ["copy"],
    effort: "instant",
    popularity: 79,
    addedAt: "2025-11-02",
    seoTitle: "Freelance Rate Calculator — Hourly and Day Rates",
    seoDescription:
      "Work out the minimum hourly and day rate that covers your costs, tax reserve and target take-home income, based on the hours you can actually bill.",
    content: {
      intro: [
        "New freelancers usually price by dividing a salary by 2,080 hours. That is wrong twice: nobody bills 40 hours a week, and a contractor pays their own tax, tools, insurance and unpaid holiday.",
        "This calculator starts from the income you want to take home, adds business costs and a tax reserve, and divides by realistic billable hours.",
      ],
      howTo: [
        "Enter the take-home income you want for the year.",
        "Add your annual business costs.",
        "Set billable hours per week — typically 50–70% of working hours.",
        "Add a tax reserve percentage and read the minimum hourly rate.",
      ],
      method: {
        title: "Grossing up and dividing down",
        paragraphs: [
          "Target income plus business costs gives the money you need before tax. Dividing by one minus the tax reserve grosses that up to required revenue. Then divide by billable hours — hours per week × working weeks.",
          "The second table shows how the rate falls as billable hours rise, which makes the trade-off visible: selling more hours lowers the rate you need but also caps your income.",
        ],
        formula: "rate = (income + costs) ÷ (1 − tax%) ÷ (hours/week × weeks)",
      },
      examples: [
        { title: "$70,000 target, $9,000 costs, 25% tax, 22 h/week for 46 weeks", steps: ["Required revenue $105,333.", "Billable hours 1,012."], result: "about $104 an hour" },
        { title: "Billing 30 hours a week instead", steps: ["Billable hours 1,380."], result: "about $76 an hour" },
      ],
      limitations: [
        "Assumes billable hours are actually sold — a full pipeline is not guaranteed.",
        "Pension contributions, sick leave and parental leave are not separate line items; the tax reserve and buffer you choose must cover them.",
        "Tax rules for self-employment vary widely by country.",
      ],
      faqs: [
        { q: "Why can't I bill 40 hours a week?", a: "Because admin, invoicing, sales, learning and breaks are unpaid. Most freelancers bill 20–30 hours in a 40-hour week." },
        { q: "Should I quote a day rate?", a: "Day rates suit clients who buy blocks of time; derive one from the hourly rate at six to eight billable hours and state your assumptions." },
        { q: "How do I raise rates with existing clients?", a: "Give notice, explain the value delivered, and move new work to the new rate first. Discounts are easier to give than to withdraw." },
      ],
    },
  },
  {
    slug: "invoice-calculator",
    name: "Invoice Calculator",
    category: "finance",
    tagline: "Line totals, discounts, tax and the balance due, with a copyable summary.",
    intent: "calculate an invoice total",
    keywords: ["invoice calculator", "invoice total", "tax invoice calculator", "balance due"],
    status: "live",
    actions: ["copy"],
    effort: "instant",
    popularity: 71,
    addedAt: "2025-11-02",
    seoTitle: "Invoice Calculator — Subtotal, Discount, Tax, Balance",
    seoDescription:
      "Calculate an invoice from unit price and quantity: apply a discount, add shipping and tax, then subtract any deposit to get the balance due, with a summary to copy.",
    content: {
      intro: [
        "An invoice has to add up in a way a client can check. The awkward part is the order of operations: discount before tax, shipping sometimes taxed, deposit deducted from the total rather than the subtotal.",
        "This calculator follows that order and produces a plain-text summary you can paste into an email or an invoice template.",
      ],
      howTo: [
        "Enter how many lines and the average unit price, or a single line with quantity.",
        "Add a discount percentage and a tax rate.",
        "Add shipping or other fees if they apply.",
        "Subtract any deposit already paid to see the balance due.",
      ],
      method: {
        title: "The order of operations",
        paragraphs: [
          "Subtotal = lines × quantity × price. The discount reduces the subtotal. Shipping is added, and tax is charged on the discounted goods plus any taxable fees. Finally, payments already received are subtracted from the total.",
          "Applying the discount after tax, or taxing the deposit, both produce a figure the client's accounts team will query.",
        ],
        formula: "total = (subtotal − discount + fees) × (1 + tax)   ·   due = total − paid",
      },
      examples: [
        { title: "3 lines × 2 units at $420, 10% discount, 8.25% tax", steps: ["Subtotal $2,520.", "Discount $252, tax on $2,303."], result: "about $2,493 total" },
        { title: "With a $500 deposit", steps: ["Subtract the deposit from the total."], result: "$1,993 due" },
      ],
      limitations: [
        "One averaged unit price per line type; a mixed invoice needs each line calculated separately.",
        "Rounding is to the cent per line, which may differ by a cent from per-invoice rounding.",
        "This is an arithmetic aid, not an invoicing system — it does not store clients or issue documents.",
      ],
      faqs: [
        { q: "Should tax be charged before or after a discount?", a: "On the discounted amount, because the customer never pays the full price that was discounted away." },
        { q: "Is shipping taxable?", a: "It depends on the jurisdiction and whether shipping is separately stated. Many places tax delivery that is part of a taxable sale." },
        { q: "What should an invoice include?", a: "A unique number, dates, both parties' details, itemised goods or services, tax amounts, payment terms and the balance due." },
      ],
    },
  },
  {
    slug: "budget-calculator",
    name: "Budget Calculator",
    category: "finance",
    tagline: "Monthly essentials against take-home pay, and whether the savings goal fits.",
    intent: "make a monthly budget",
    keywords: ["budget calculator", "monthly budget", "50 30 20 budget", "savings goal calculator"],
    status: "live",
    actions: ["copy"],
    effort: "instant",
    popularity: 78,
    addedAt: "2025-11-02",
    seoTitle: "Monthly Budget Calculator — Essentials and Savings",
    seoDescription:
      "Build a monthly budget from take-home pay: enter housing, food, transport, debt and other essentials, set a savings goal and see what is left over.",
    content: {
      intro: [
        "A budget only works if it is arithmetic you can keep up with. This one asks for five broad categories and a savings goal, then tells you whether the goal is reachable before you start cutting anything.",
        "Broad categories beat forty line items: the point is to see the gap, not to achieve accounting precision.",
      ],
      howTo: [
        "Enter your monthly take-home pay.",
        "Fill in housing, food, transport, debt payments and other essentials.",
        "Set the share of income you want to save.",
        "Read the unallocated amount or the shortfall.",
      ],
      method: {
        title: "Where the money goes",
        paragraphs: [
          "Essentials are summed and subtracted from take-home pay; the savings goal is a percentage of income. The difference is what you have left to save or spend on everything else.",
          "The 50/30/20 guideline — half needs, a third wants, a fifth savings — is a useful reference but not a rule. In expensive cities housing alone can exceed 50%.",
        ],
        formula: "left = income − essentials   ·   gap = left − income × savings goal%",
      },
      examples: [
        { title: "$4,200 pay, $2,730 essentials, 20% goal", steps: ["Left $1,470.", "Goal $840."], result: "$630 spare beyond the goal" },
        { title: "The same budget after a rent rise", steps: ["Housing $1,400 → $1,650."], result: "the surplus shrinks to $380" },
      ],
      limitations: [
        "Monthly figures only; annual or irregular costs such as insurance need to be divided by twelve.",
        "Debt payments are treated as a fixed cost rather than modelled with interest.",
        "Categories are deliberately broad, so it will not replace a detailed spreadsheet.",
      ],
      faqs: [
        { q: "Should savings count as an expense?", a: "Treat it like a bill: pay it first, then live on the rest. Saving what is left over rarely works." },
        { q: "How big should an emergency fund be?", a: "Three to six months of essentials is the usual target, built before aggressive investing." },
        { q: "What if essentials exceed my income?", a: "The shortfall is the real number to attack — usually housing, transport or debt payments, in that order of impact." },
      ],
    },
  },
  {
    slug: "expense-split-calculator",
    name: "Expense Split Calculator",
    category: "finance",
    tagline: "Split a bill with tip and tax, and work out who owes whom.",
    intent: "split a bill between people",
    keywords: ["bill split calculator", "split the bill", "expense splitter", "tip calculator"],
    status: "live",
    actions: ["copy"],
    effort: "instant",
    popularity: 85,
    addedAt: "2025-11-02",
    seoTitle: "Expense Split Calculator — Bill, Tip and Tax",
    seoDescription:
      "Split a restaurant bill or shared expense: add tax and tip, divide between any number of people, and see who should collect if one person already paid.",
    content: {
      intro: [
        "Splitting a bill is simple until tip and tax enter the picture, or until one person has already paid the whole thing on their card. This calculator handles both and produces a shareable summary.",
        "It splits evenly, which is the right choice for shared plates and the wrong one for a table where someone ordered the lobster — in that case agree the individual items and split only the shared ones.",
      ],
      howTo: [
        "Enter the bill total before tip.",
        "Set the number of people and the tip percentage.",
        "Add tax if it is not already included.",
        "Enter the amount one person already paid to see the reimbursements.",
      ],
      method: {
        title: "Tip on the taxed amount",
        paragraphs: [
          "Tax is calculated on the bill, then the tip is calculated on the bill plus tax, which is the common convention when tipping a percentage. The grand total is divided by the number of people.",
          "If one person has already paid, each other person owes their share to that person. The summary lists the per-person amount and the reimbursement.",
        ],
        formula: "total = bill × (1 + tax) × (1 + tip)   ·   each = total ÷ people",
      },
      examples: [
        { title: "$248.60 for 4 people, 18% tip", steps: ["Tip $44.75.", "Total $293.35."], result: "$73.34 each" },
        { title: "One person paid the whole bill", steps: ["The other three each owe their share."], result: "three transfers of $73.34" },
      ],
      limitations: [
        "Even splits only — it does not itemise individual orders.",
        "Currency is dollars; the arithmetic is currency-agnostic.",
        "Rounding to cents can leave a one-cent difference, which someone has to absorb.",
      ],
      faqs: [
        { q: "Should I tip on the pre-tax or post-tax amount?", a: "Post-tax is the common convention in the US; pre-tax is slightly less generous. Either is defensible if agreed." },
        { q: "How do I split unevenly?", a: "Have each person pay for their own items, then split only the shared plates, tax and tip." },
        { q: "Does this work for group trips?", a: "Yes for a single shared cost. For a whole trip with multiple expenses, use a shared ledger and settle up at the end." },
      ],
    },
  },
  {
    slug: "inflation-calculator",
    name: "Inflation Calculator",
    category: "finance",
    tagline: "What an amount is worth in future money, and what today's money will buy later.",
    intent: "calculate the effect of inflation",
    keywords: ["inflation calculator", "purchasing power", "inflation adjusted value", "cost of living calculator"],
    status: "live",
    actions: ["copy"],
    effort: "instant",
    popularity: 73,
    addedAt: "2025-11-02",
    seoTitle: "Inflation Calculator — Future Prices and Purchase Power",
    seoDescription:
      "See what an amount becomes after years of inflation, how much buying power it loses, and what a basket of goods costs year by year at a constant rate.",
    content: {
      intro: [
        "Inflation is a compounding rate applied to prices, which means small annual numbers add up to large changes: 3% a year for a decade is 34%, not 30%.",
        "This calculator answers both directions of the question: what something will cost later, and what today's money will still buy.",
      ],
      howTo: [
        "Enter the amount you are thinking about.",
        "Set an average inflation rate.",
        "Enter the number of years.",
        "Read the future cost and the lost buying power.",
      ],
      method: {
        title: "Compounding prices",
        paragraphs: [
          "Future cost = amount × (1 + rate)ⁿ. Buying power falls by the same factor in reverse: the amount ÷ (1 + rate)ⁿ tells you what today's money can buy after n years.",
          "A negative rate models deflation, which is rare but does happen; the same formula applies.",
        ],
        formula: "future = amount × (1 + i)ⁿ   ·   real value = amount ÷ (1 + i)ⁿ",
      },
      examples: [
        { title: "$100 at 3% for 10 years", steps: ["1.03¹⁰ = 1.344."], result: "$134.39, and $100 buys what $74.41 buys today" },
        { title: "A salary that keeps pace", steps: ["Increase 3% a year to maintain buying power."], result: "no real raise" },
      ],
      limitations: [
        "A constant rate is a simplification; real inflation varies by year and by spending category.",
        "Housing, education and healthcare often inflate faster than the headline index.",
        "The tool uses a rate you supply rather than historical index data, so it does not look up official figures.",
      ],
      faqs: [
        { q: "Why is inflation called compounding?", a: "Because each year's increase applies to the already-increased price, exactly like compound interest." },
        { q: "Does inflation make debt cheaper?", a: "In real terms yes, if your income rises with inflation while the debt is fixed — which is why inflation helps fixed-rate borrowers." },
        { q: "Which inflation rate should I use?", a: "Your central bank's target for the long run, or the specific index for the spending category you are modelling." },
      ],
    },
  },
  {
    slug: "mortgage-calculator",
    name: "Mortgage Calculator",
    category: "finance",
    tagline: "Principal, interest, tax, insurance and fees in one monthly payment.",
    intent: "calculate mortgage payments",
    keywords: ["mortgage calculator", "home loan calculator", "monthly mortgage payment", "amortisation"],
    status: "live",
    actions: ["copy"],
    effort: "instant",
    popularity: 91,
    addedAt: "2025-11-02",
    seoTitle: "Mortgage Calculator — Monthly Payment and Total Interest",
    seoDescription:
      "Calculate a mortgage payment from the home price, down payment, rate and term, including property tax, insurance and HOA, with the remaining balance by year.",
    content: {
      intro: [
        "The payment quoted on a mortgage site is usually principal and interest only, which is not the number that leaves your account. Property tax, home insurance and any HOA fee are collected monthly too.",
        "This calculator shows both: the loan payment and the all-in housing cost, along with how much interest the term really costs.",
      ],
      howTo: [
        "Enter the home price, down payment, rate and term.",
        "Add annual property tax and insurance if you know them.",
        "Include any monthly HOA or service charge.",
        "Read the all-in monthly figure and the total interest.",
      ],
      method: {
        title: "Amortisation",
        paragraphs: [
          "A fixed-rate mortgage uses the annuity formula: payment = P × r ÷ (1 − (1 + r)⁻ⁿ), where r is the monthly rate and n the number of payments. With a 0% rate the payment is simply principal ÷ months.",
          "Each payment covers that month's interest first, and whatever remains reduces the balance. Because the balance is largest at the start, early payments are mostly interest — which is why overpaying early saves so much.",
        ],
        formula: "M = P × r ÷ (1 − (1 + r)⁻ⁿ)",
      },
      examples: [
        { title: "$420,000 home, 20% down, 6.4%, 30 years", steps: ["Loan $336,000.", "Apply the annuity formula."], result: "about $2,100 principal and interest before tax and insurance" },
        { title: "A 15-year term instead", steps: ["Same loan, 180 payments."], result: "a much larger payment but less than half the total interest" },
      ],
      limitations: [
        "Fixed rates only; adjustable-rate mortgages need a scenario per rate period.",
        "Mortgage insurance, closing costs and prepayment penalties are excluded.",
        "Property tax and insurance are estimates that change annually, usually through escrow.",
      ],
      faqs: [
        { q: "How much deposit do I need?", a: "In the US, 20% avoids mortgage insurance; many programmes accept 3–5%. Lenders also weigh income, credit and existing debt." },
        { q: "What is amortisation?", a: "The schedule showing how each payment splits between interest and principal until the balance reaches zero." },
        { q: "Is a shorter term always better?", a: "It costs less interest but more each month and less liquidity. It is better if the payment is comfortably affordable." },
      ],
    },
  },
  {
    slug: "debt-payoff-calculator",
    name: "Debt Payoff Calculator",
    category: "finance",
    tagline: "How long a balance takes to clear, and what extra payments save.",
    intent: "calculate how long to pay off debt",
    keywords: ["debt payoff calculator", "credit card payoff", "debt free date", "extra payment calculator"],
    status: "live",
    actions: ["copy"],
    effort: "instant",
    popularity: 84,
    addedAt: "2025-11-02",
    seoTitle: "Debt Payoff Calculator — Months to Clear and Interest",
    seoDescription:
      "See how many months a balance takes to clear at a given payment, how much interest it costs, and how much time and interest extra payments save.",
    content: {
      intro: [
        "A credit card balance with a minimum payment can take decades to clear, because the minimum is calculated to keep you paying rather than to finish the debt. This calculator answers the two questions that change behaviour: when will it be gone, and what does each extra tenner save?",
        "It also refuses the impossible case — when the payment is smaller than the monthly interest, the balance never falls and no payoff date exists.",
      ],
      howTo: [
        "Enter the balance and the interest rate.",
        "Enter what you actually pay each month.",
        "Add an optional extra payment.",
        "Compare the months and interest in the table.",
      ],
      method: {
        title: "Simulating the balance",
        paragraphs: [
          "Each month the balance is charged one twelfth of the annual rate, then the payment is applied. The loop continues until the balance reaches zero, which is exactly what a lender's statement does.",
          "Because interest is charged on the remaining balance, extra payments reduce future interest as well as the current principal — the effect accelerates over time.",
        ],
        formula: "balanceₙ = balanceₙ₋₁ × (1 + APR/12) − payment",
      },
      examples: [
        { title: "$9,000 at 19.9% paying $300", steps: ["Simulate monthly.", "Interest exceeds $100 a month at first."], result: "roughly 3 years and $1,800 of interest" },
        { title: "Adding $100 a month", steps: ["Re-run with $400."], result: "several months shorter and hundreds saved" },
      ],
      limitations: [
        "One balance at a time; the snowball and avalanche methods across several debts need a separate plan.",
        "Assumes a fixed APR and no new spending on the card.",
        "Fees, promotional rates and minimum-payment rules are not modelled.",
      ],
      faqs: [
        { q: "Why did my minimum payment barely change the balance?", a: "Because most of it covers interest. On a 20% card, a balance of $9,000 is charged about $150 a month in interest." },
        { q: "Snowball or avalanche?", a: "Avalanche pays the highest rate first and costs least; snowball clears the smallest balance first and feels better. Both beat paying only the minimum." },
        { q: "Does paying early in the month help?", a: "Yes, slightly: paying before the interest is calculated reduces the average balance, which reduces the interest charged." },
      ],
    },
  },
  {
    slug: "rental-yield-calculator",
    name: "Rental Yield Calculator",
    category: "finance",
    tagline: "Gross and net rental yield, price-to-rent ratio and monthly cash flow.",
    intent: "calculate rental yield",
    keywords: ["rental yield calculator", "gross yield", "net yield property", "buy to let calculator"],
    status: "live",
    actions: ["copy"],
    effort: "instant",
    popularity: 68,
    addedAt: "2025-11-02",
    seoTitle: "Rental Yield Calculator — Gross, Net and Cash Flow",
    seoDescription:
      "Calculate gross and net rental yield from property value, monthly rent and running costs, plus the price-to-rent ratio and monthly cash flow after a mortgage.",
    content: {
      intro: [
        "Rental yield compares the rent a property earns with what it costs. Gross yield ignores expenses and flatters every property; net yield is the number that tells you whether the investment actually works.",
        "The price-to-rent ratio translates the same information into years of rent needed to equal the purchase price, which is easier to compare with other investments.",
      ],
      howTo: [
        "Enter the property value and the monthly rent.",
        "Add annual running costs: tax, insurance, maintenance, management and expected voids.",
        "Add the annual mortgage payment if there is one.",
        "Read gross yield, net yield and monthly cash flow.",
      ],
      method: {
        title: "Two yields and a ratio",
        paragraphs: [
          "Gross yield = annual rent ÷ property value. Net yield subtracts running costs first. The difference between them is the cost of owning, and it is often a third of the rent.",
          "Cash flow subtracts the mortgage as well. A property can show a healthy yield and still lose money each month if the loan is large.",
        ],
        formula: "gross = rent × 12 ÷ value   ·   net = (rent × 12 − costs) ÷ value",
      },
      examples: [
        { title: "$320,000 property, $1,950 a month, $7,200 costs", steps: ["Gross 7.31%.", "Net 5.06%."], result: "net yield 5.06%" },
        { title: "Rent drops by $200", steps: ["Re-run at $1,750."], result: "net yield falls below 4.5%" },
      ],
      limitations: [
        "Purchase costs such as stamp duty and legal fees are excluded from the value used.",
        "Voids are only captured through the running-costs figure you enter.",
        "Capital growth is not modelled — yield measures income, not total return.",
      ],
      faqs: [
        { q: "What is a good rental yield?", a: "It depends on the market and the risk-free rate; 5–7% gross is often quoted as a working target, with net yield several points lower." },
        { q: "Should maintenance be a percentage?", a: "A common rule is 1% of property value a year, or one month's rent, whichever is higher." },
        { q: "Does yield include capital growth?", a: "No. Total return combines income yield with price appreciation, and the two often move in opposite directions." },
      ],
    },
  },
  {
    slug: "stock-average-price-calculator",
    name: "Stock Average Price Calculator",
    category: "finance",
    tagline: "Cost-weighted average share price across several purchases, with profit.",
    intent: "calculate average share price",
    keywords: ["average share price calculator", "cost basis calculator", "stock average calculator", "dollar cost averaging"],
    status: "live",
    actions: ["copy"],
    effort: "instant",
    popularity: 70,
    addedAt: "2025-11-02",
    seoTitle: "Stock Average Price Calculator — Cost Basis",
    seoDescription:
      "Work out your average cost per share across up to three purchases, see each purchase's weight, and check unrealised profit against the current price.",
    content: {
      intro: [
        "Averaging down feels good and can be a mistake. The number that matters is your cost basis: total spent divided by total shares, weighted by how much you bought at each price.",
        "Enter up to three purchases and the current price to see the average, the weight of each purchase and the unrealised profit or loss.",
      ],
      howTo: [
        "Enter shares and price for each purchase you made.",
        "Add the current price if you want the profit figure.",
        "Read the weighted average cost per share.",
        "Check the weight column to see which purchase dominates the average.",
      ],
      method: {
        title: "Why it is weighted",
        paragraphs: [
          "The average is total cost ÷ total shares, not the mean of the prices. Buying 20 shares at $140 and 15 at $112 gives 35 shares costing $4,480, so the average is $128 — not $126.",
          "Weights show the same thing from the other side: the larger purchase pulls the average towards its own price.",
        ],
        formula: "average = Σ(shares × price) ÷ Σshares",
      },
      examples: [
        { title: "20 shares at $140 and 15 at $112", steps: ["Cost $2,800 + $1,680 = $4,480.", "Divide by 35 shares."], result: "$128 average" },
        { title: "At a current price of $128", steps: ["Market value $4,480."], result: "break-even before fees" },
      ],
      limitations: [
        "Three purchases only; larger histories need a spreadsheet.",
        "Fees, commissions and taxes are excluded from the cost basis.",
        "Does not adjust for splits, dividends or currency conversion.",
      ],
      faqs: [
        { q: "Does buying more at a lower price always help?", a: "It lowers the average but increases your exposure to a stock that has fallen — averaging down is a decision about conviction, not arithmetic." },
        { q: "What is dollar-cost averaging?", a: "Investing a fixed amount at regular intervals, which buys more shares when prices are low and fewer when high." },
        { q: "How do fees affect cost basis?", a: "They increase it. Add commission and platform fees to the total cost for an accurate figure." },
      ],
    },
  },
  {
    slug: "percentage-of-ownership-calculator",
    name: "Percentage of Ownership Calculator",
    category: "finance",
    tagline: "Equity bought by an investment, with pre- and post-money dilution shown.",
    intent: "calculate equity percentage from investment",
    keywords: ["equity calculator", "ownership percentage", "pre-money post-money", "dilution calculator"],
    status: "live",
    actions: ["copy"],
    effort: "instant",
    popularity: 66,
    addedAt: "2025-11-02",
    seoTitle: "Ownership Percentage Calculator — Pre and Post-Money",
    seoDescription:
      "Work out the equity an investment buys, whether the valuation you have is pre- or post-money, and how many new shares that means at the current share count.",
    content: {
      intro: [
        "The most common cap-table error is mixing up pre-money and post-money valuations. Investing $50,000 at a $2,000,000 pre-money buys 2.44% of the company, not 2.5%, because the investment itself increases the value being divided.",
        "This calculator asks which basis you have, then reports ownership, the new share count and the price per share.",
      ],
      howTo: [
        "Enter the investment amount.",
        "Enter the company valuation and say whether it is pre- or post-money.",
        "Add the existing share count to convert the percentage into shares.",
        "Read the ownership percentage and dilution.",
      ],
      method: {
        title: "Pre-money versus post-money",
        paragraphs: [
          "Post-money value is pre-money plus the new money. Ownership is investment ÷ post-money, always. Founders are diluted by exactly that percentage.",
          "When new shares are issued rather than existing shares sold, the new share count is existing × p ÷ (1 − p), where p is the ownership percentage as a decimal.",
        ],
        formula: "ownership = investment ÷ (pre-money + investment)",
      },
      examples: [
        { title: "$50,000 at $2,000,000 pre-money", steps: ["Post-money $2,050,000.", "50,000 ÷ 2,050,000."], result: "2.44%" },
        { title: "The same deal quoted post-money", steps: ["50,000 ÷ 2,000,000."], result: "2.5%" },
      ],
      limitations: [
        "Assumes a priced equity round with no option pool shuffle, convertible notes or liquidation preferences.",
        "Existing shareholders' individual stakes are not broken out.",
        "Not legal or investment advice — cap tables are worth getting right with a lawyer.",
      ],
      faqs: [
        { q: "What is a safe valuation?", a: "A convertible instrument with a valuation cap, common in early rounds; it converts later at the lower of the cap or the next round's price." },
        { q: "Why does an option pool reduce founder ownership?", a: "Because the pool is usually carved out of the pre-money, diluting existing holders before the new investor's percentage is calculated." },
        { q: "How is price per share set?", a: "Pre-money valuation divided by fully diluted shares outstanding before the round." },
      ],
    },
  },
  {
    slug: "loan-repayment-calculator",
    name: "Loan Repayment Calculator",
    category: "finance",
    tagline: "Monthly repayment, total interest and what extra payments actually save.",
    intent: "calculate loan repayments",
    keywords: ["loan repayment calculator", "monthly repayment", "amortisation schedule", "extra payment savings"],
    status: "live",
    actions: ["copy"],
    effort: "instant",
    popularity: 87,
    addedAt: "2025-11-02",
    seoTitle: "Loan Repayment Calculator — Extra Payments and Savings",
    seoDescription:
      "Calculate the monthly repayment on any fixed-rate loan, see the total interest, then find out how many months and how much interest an extra payment saves.",
    content: {
      intro: [
        "A repayment figure alone does not tell you what a loan costs. The same rate over a longer term lowers the monthly payment and raises the total interest, sometimes dramatically.",
        "This calculator shows the repayment, the total interest and the effect of paying extra each month, so the trade-off is visible rather than theoretical.",
      ],
      howTo: [
        "Enter the amount borrowed, the rate and the term.",
        "Read the monthly repayment and total interest.",
        "Add an extra monthly amount to see the time and interest saved.",
        "Include any monthly account fee if your lender charges one.",
      ],
      method: {
        title: "The annuity payment",
        paragraphs: [
          "The repayment is P × r ÷ (1 − (1 + r)⁻ⁿ). At a 0% rate it degenerates to principal ÷ months, which the calculator handles without dividing by zero.",
          "Extra payments go entirely to principal because the interest for the month has already been charged. That lowers every subsequent interest charge, so the effect compounds.",
        ],
        formula: "M = P × r ÷ (1 − (1 + r)⁻ⁿ)",
      },
      examples: [
        { title: "$25,000 at 7.5% over 5 years", steps: ["Apply the formula."], result: "about $501 a month, $5,070 of interest" },
        { title: "Adding $100 a month", steps: ["Re-run the schedule."], result: "roughly a year shorter and about $1,000 saved" },
      ],
      limitations: [
        "Fixed rates only; variable-rate loans need a per-period calculation.",
        "Fees are shown as monthly costs rather than financed into the balance.",
        "Early-repayment penalties, if any, are not included.",
      ],
      faqs: [
        { q: "Does a longer term ever cost less?", a: "No for total interest at the same rate — but it can be the only affordable option, and inflation erodes the real cost of later payments." },
        { q: "Should I pay extra or invest?", a: "Compare the loan's after-tax rate with the expected after-tax investment return, then weight the certainty of the saving." },
        { q: "Why is my bank's figure slightly different?", a: "Day-count conventions, fees and the exact date of the first payment usually explain the gap." },
      ],
    },
  },
  {
    slug: "currency-converter",
    name: "Currency Converter",
    category: "finance",
    tagline: "Convert with the exact rate you were quoted.",
    intent: "convert currency",
    keywords: ["currency converter", "exchange rate calculator", "convert usd to eur", "money conversion", "travel money calculator", "fx rate"],
    status: "live",
    actions: ["copy"],
    effort: "instant",
    popularity: 80,
    addedAt: "2025-03-08",
    seoTitle: "Currency Converter — Convert at Your Own Rate",
    seoDescription:
      "Convert between sixteen currencies using the rate you enter or paste, see the inverse and cross rates, and record the date the rate applied. No feed, no account.",
    content: {
      intro: [
        "Most currency converters hide the rate that produced the number. This one does the opposite: it shows the rate applied, its inverse, and the date you recorded it, and you can edit every rate in the table. That matters because the rate a bank or card gives you is almost never the one published on a rate feed.",
        "Rates are expressed as units per 1 US dollar, which makes cross rates between any two currencies a single division. Nothing is fetched over the network — the numbers on screen are the numbers you supplied.",
      ],
      howTo: [
        "Enter the amount and pick the two currencies.",
        "Check the rate table — replace the defaults with your quoted rates.",
        "Record the date the rate applied.",
        "Paste a rate list if your bank gave you several at once.",
      ],
      method: {
        title: "One base, every pair",
        paragraphs: [
          "Each currency has a rate in units per 1 USD. Converting from A to B is amount × (rate B ÷ rate A), which handles every pair without storing separate cross rates.",
          "The inverse rate is 1 ÷ rate, and the full table shows the same amount in every currency that has a usable rate. Zero or blank rates are excluded rather than producing an infinity.",
        ],
        formula: "amount in B = amount × (rate B ÷ rate A)",
      },
      examples: [
        {
          title: "Dollars to euros",
          steps: ["100 USD, EUR rate 0.92 per USD."],
          result: "92.00 EUR, with an inverse of 1.087 USD per euro",
        },
        {
          title: "A cross rate",
          steps: ["Convert 50 EUR to GBP with EUR 0.92 and GBP 0.79 per USD."],
          result: "About 42.93 GBP — no dollar figure appears in the calculation",
        },
      ],
      limitations: [
        "No live rates: the defaults are approximate and go stale, which is why the date field exists.",
        "It uses one rate per currency, so it cannot model buy and sell spreads or card fees — apply those yourself.",
        "Cryptocurrencies and precious metals are not included; their pricing is not a simple quoted pair.",
      ],
      faqs: [
        {
          q: "Why not fetch live exchange rates?",
          a: "Live rates need a third-party API. This site processes everything in your browser with no backend and no keys, so you supply the rate — which is also the rate that actually applies to your transaction.",
        },
        {
          q: "Why is my bank's amount different?",
          a: "Banks and card networks apply a margin of roughly 0.5–3% and often use a different snapshot time. Enter the rate from your statement to see exactly what you paid.",
        },
        {
          q: "Can I convert several amounts at once?",
          a: "Change the amount — every row in the table recalculates. For a batch, paste each amount in turn or use the date field to keep track of which rates you used.",
        },
      ],
    },
  },
];
