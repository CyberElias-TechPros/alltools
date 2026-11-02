import type { ToolDefinition } from "../types";

/**
 * Section K. Business, marketing and productivity tools. Every generator here
 * produces a starting draft from fields the user fills in — no invented prices,
 * no fabricated credentials, no legal claims — and every calculation shows its
 * working. Break-even and sales commission already live in the finance category.
 */
export const businessTools: ToolDefinition[] = [
  {
    slug: "invoice-generator",
    name: "Invoice Generator",
    category: "business",
    tagline: "Line items, discounts and tax, out as a clean text invoice.",
    intent: "create an invoice",
    keywords: ["invoice generator", "free invoice template", "invoice maker", "vat invoice", "billing template", "invoice with tax"],
    status: "live",
    actions: ["copy", "download"],
    effort: "quick",
    popularity: 88,
    addedAt: "2025-03-08",
    seoTitle: "Invoice Generator — Line Items, Tax and Totals",
    seoDescription:
      "Build an invoice with line items, quantities, discounts and tax, see the totals update live, then copy or download it as plain text.",
    content: {
      intro: [
        "A text invoice is the version that survives: it pastes into an email body, converts cleanly to PDF, and does not break when the recipient opens it in a different client. This generator does the arithmetic properly — line amounts, discount, tax on the discounted subtotal — and shows the result as you type.",
        "Numbering, currency and payment terms are fields rather than assumptions, because what makes an invoice valid depends on where you are billing.",
      ],
      howTo: [
        "Enter your business details and the client's.",
        "Add each line with a quantity and unit price.",
        "Set a discount and a tax rate if they apply.",
        "Write the payment terms, then copy or download the invoice.",
      ],
      method: {
        title: "The arithmetic, in order",
        paragraphs: [
          "Each line is quantity × unit price. The subtotal is the sum of the lines, the discount is taken from the subtotal, and tax is charged on what remains. Doing it in that order matters: charging tax before a discount overstates the tax, which is the most common invoice error.",
          "Totals are rounded only for display. Many jurisdictions require the tax amount to be stated separately, so the template keeps subtotal, discount, tax and total on their own lines.",
        ],
        formula: "total = (Σ qty × price − discount) × (1 + tax)",
      },
      examples: [
        {
          title: "A small project",
          steps: ["Website design 1 × 1,200.", "Hosting 1 × 180.", "Tax 20%."],
          result: "Subtotal 1,380, tax 276, total 1,656",
        },
        {
          title: "A 10% discount",
          steps: ["Subtotal 350, discount 10%, tax 20%."],
          result: "Tax is charged on 315, not on 350",
        },
      ],
      limitations: [
        "Invoice requirements — numbering, tax identification, retention periods — vary by country; check what yours demands.",
        "It produces text, not a styled PDF. Paste into your editor or a PDF converter if you need letterhead.",
        "It is not accounting software: nothing is stored, numbered automatically or reconciled.",
      ],
      faqs: [
        {
          q: "Is a text invoice acceptable?",
          a: "In most places an invoice needs the parties, a date, a description, the amount and any tax — not a particular design. Check local requirements for numbering and tax identifiers.",
        },
        {
          q: "Should tax be added before or after a discount?",
          a: "After. Tax applies to the amount actually charged, so discount first, then tax on the discounted subtotal.",
        },
        {
          q: "Can I save the invoice for later?",
          a: "Download it — nothing is stored in the page. Keep your own copy for your records and for any tax filing deadline.",
        },
      ],
    },
  },
  {
    slug: "receipt-generator",
    name: "Receipt Generator",
    category: "business",
    tagline: "A fixed-width receipt that prints and pastes cleanly.",
    intent: "create a receipt",
    keywords: ["receipt generator", "receipt template", "payment receipt", "sales receipt", "cash receipt", "printable receipt"],
    status: "live",
    actions: ["copy", "download"],
    effort: "quick",
    popularity: 76,
    addedAt: "2025-03-08",
    seoTitle: "Receipt Generator — Printable Plain-Text Receipt",
    seoDescription:
      "Create a receipt with items, totals, tax and payment method in a fixed-width layout that prints on thermal printers or pastes into email.",
    content: {
      intro: [
        "A receipt records that money changed hands: what was bought, how much, and how it was paid. The fixed-width layout here is deliberate — it aligns in any monospace font, which means it survives email, messaging apps and thermal-printer utilities.",
        "Items, tax and the payment method are all editable, and a footer note covers returns policies or a thank-you line.",
      ],
      howTo: [
        "Enter the business name, receipt number and date.",
        "Add each item with quantity and price.",
        "Choose the payment method and add a footer note if needed.",
        "Copy the receipt or download it as a text file.",
      ],
      method: {
        title: "Why plain text",
        paragraphs: [
          "Thermal printers and email clients both handle plain text predictably, while HTML receipts need a rendering engine at both ends. The layout pads with spaces to a 40-character width so columns line up in any monospace font.",
          "Totals are subtotal, optional tax and total. No discount column is included because a receipt records what was charged, not what could have been.",
        ],
        formula: "total = Σ(qty × price) + tax",
      },
      examples: [
        {
          title: "A café receipt",
          steps: ["2 espressos at 3.50, 1 croissant at 2.80, no tax."],
          result: "Total 9.80, paid by card",
        },
        {
          title: "With sales tax",
          steps: ["Same items, tax 7.5%."],
          result: "Total 10.54, with the tax shown separately",
        },
      ],
      limitations: [
        "Some jurisdictions require a tax registration number or a specific sequential numbering scheme on receipts.",
        "It is not a fiscal receipt and cannot be used where an approved cash register is mandatory.",
        "Money values use a decimal point and no currency symbol — add the symbol in the business name or note if needed.",
      ],
      faqs: [
        {
          q: "What is the difference between an invoice and a receipt?",
          a: "An invoice requests payment; a receipt confirms payment. Issuing a receipt before payment is received is a bookkeeping error.",
        },
        {
          q: "Can I print this on a thermal printer?",
          a: "Yes, in any utility that accepts plain text at 40 or 42 columns. Set the font to monospace and keep the width setting consistent.",
        },
        {
          q: "Do I need to keep copies?",
          a: "In most countries businesses must retain sales records for several years. Download and archive each receipt rather than relying on the page.",
        },
      ],
    },
  },
  {
    slug: "business-name-generator",
    name: "Business Name Generator",
    category: "business",
    tagline: "Name ideas in four styles, with the checks that matter.",
    intent: "business name generator",
    keywords: ["business name generator", "company name ideas", "brand name generator", "startup name generator", "shop name ideas", "business name ideas"],
    status: "live",
    actions: ["copy"],
    effort: "instant",
    popularity: 82,
    addedAt: "2025-03-08",
    seoTitle: "Business Name Generator — Ideas in Four Styles",
    seoDescription:
      "Generate business name ideas from a keyword in modern, classic, invented or compound styles, with a practical checklist for domains and trademarks.",
    content: {
      intro: [
        "A name is a constraint problem: short, pronounceable, spellable, available as a domain and not already trademarked in your class. A generator can widen the list quickly; it cannot do the checking, so this page pairs the ideas with the checklist that actually decides.",
        "Four styles cover the common shapes — modern (keyword plus a suffix), classic (name plus & Co.), invented (constructed stems) and compound (two words fused).",
      ],
      howTo: [
        "Type one or two words describing what you do.",
        "Pick a style and a count.",
        "Shuffle for a fresh set from the same keyword.",
        "Check the domain, the social handles and the trademark register before choosing.",
      ],
      method: {
        title: "Structured recombination, not improvisation",
        paragraphs: [
          "Names are built by combining your keyword with a fixed bank of prefixes and suffixes, or by constructing an invented stem from it. The result is transparent: you can see why each name appeared, and the same seed reproduces it.",
          "That is a deliberate limitation. A language model can produce hundreds of names, most of them unmemorable, and none of them checked. This tool gives a smaller set you can evaluate quickly.",
        ],
        formula: "name = keyword + prefix | suffix | invented stem",
      },
      examples: [
        {
          title: "A coffee business",
          steps: ["Keyword “coffee”, style modern, 8 results."],
          result: "Names such as Coffee Labs, Bright Coffee, Harvest Coffee",
        },
        {
          title: "An invented brand",
          steps: ["Same keyword, style invented."],
          result: "Shorter coined words that are more likely to have a free domain",
        },
      ],
      limitations: [
        "Nothing is checked: domain availability, trademarks, company registers and social handles all need separate checks.",
        "Coined names are more likely to be available and less likely to be remembered until you spend money making them mean something.",
        "The generator does not know your market, so names that sound wrong in another language will still appear.",
      ],
      faqs: [
        {
          q: "Should I use a descriptive or an invented name?",
          a: "Descriptive names explain the business but are harder to trademark and often already taken. Invented names are easier to own and need marketing to acquire meaning.",
        },
        {
          q: "How do I check a name is free?",
          a: "Search the domain registrar, the national company register, the trademark register for your class, and the main social platforms. All four, every time.",
        },
        {
          q: "Does the limited pool matter?",
          a: "It keeps the list evaluable. Shuffle for more options, or combine two keywords for a wider pool.",
        },
      ],
    },
  },
  {
    slug: "slogan-generator",
    name: "Slogan Generator",
    category: "business",
    tagline: "Tagline patterns built from your actual benefit.",
    intent: "slogan generator",
    keywords: ["slogan generator", "tagline generator", "business slogan ideas", "catchphrase generator", "brand tagline", "motto generator"],
    status: "live",
    actions: ["copy"],
    effort: "instant",
    popularity: 70,
    addedAt: "2025-03-08",
    seoTitle: "Slogan Generator — Taglines From Your Benefit",
    seoDescription:
      "Generate slogan options from your brand and the benefit you deliver, with short lines that fit a sign, an email signature and a social bio.",
    content: {
      intro: [
        "Most bad slogans are abstract: “excellence delivered” could belong to anyone. A useful slogan names a benefit a customer recognises, in words they would use, and stays short enough to fit a business card.",
        "Enter the brand, the benefit as a verb phrase, and who it is for; the generator returns structural patterns you can edit into something ownable.",
      ],
      howTo: [
        "Enter the brand name.",
        "Describe the benefit as a verb phrase, not an adjective.",
        "Add the audience if it helps.",
        "Shuffle, then pick two to test on real customers.",
      ],
      method: {
        title: "Patterns that survive editing",
        paragraphs: [
          "The generator applies common tagline structures: brand plus benefit, benefit plus audience, imperative, and contrast. Each is a scaffold rather than a finished line, which is why the output stays editable.",
          "Character counts are shown because a slogan that does not fit a bio or a sign is not doing its job.",
        ],
        formula: "slogan = pattern(brand, benefit, audience)",
      },
      examples: [
        {
          title: "A studio",
          steps: ["Brand “North Studio”, benefit “design that ships on time”."],
          result: "Lines such as “North Studio: design that ships on time.”",
        },
        {
          title: "A service business",
          steps: ["Add the audience “small teams”."],
          result: "Audience-led options such as “Built for small teams”",
        },
      ],
      limitations: [
        "The lines are patterns, not poetry — expect to rewrite the best one by hand.",
        "Taglines can be trademarked; check before using one on packaging.",
        "It cannot test comprehension; five real customers can, quickly.",
      ],
      faqs: [
        {
          q: "How long should a slogan be?",
          a: "Short enough to say in one breath, usually under 40 characters. If it needs a comma to make sense, it is too long.",
        },
        {
          q: "Should the brand name be in the slogan?",
          a: "Not always. If the logo is beside it, the slogan can spend its words on the benefit instead of repeating the name.",
        },
        {
          q: "Can I use these commercially?",
          a: "The patterns are generic, but a distinctive phrase can already be trademarked by someone else. Search before printing.",
        },
      ],
    },
  },
  {
    slug: "qr-business-card-generator",
    name: "QR Business Card Generator",
    category: "business",
    tagline: "A vCard QR code that saves your contact in one scan.",
    intent: "qr business card",
    keywords: ["qr business card", "vcard qr code", "digital business card qr", "contact qr code", "scan to save contact", "qr code generator"],
    status: "live",
    actions: ["copy", "download"],
    effort: "instant",
    popularity: 74,
    addedAt: "2025-03-08",
    seoTitle: "QR Business Card Generator — vCard Contact Code",
    seoDescription:
      "Turn your contact details into a vCard QR code that phones can save in one scan. Download the PNG for a card, slide or email footer.",
    content: {
      intro: [
        "A QR code that opens a website still asks the other person to type. A vCard QR code offers to save the contact directly, which is the difference between a useful card and a novelty.",
        "Fill in your details and the code updates as you type, ready to download for print or a slide.",
      ],
      howTo: [
        "Enter your name, company and title.",
        "Add phone, email, website and address as needed.",
        "Test the code with a phone camera before printing.",
        "Download the PNG and place it on the card.",
      ],
      method: {
        title: "What is encoded",
        paragraphs: [
          "The code contains vCard 3.0 text: name, organisation, title, telephone, email, URL and address, each on its own line, terminated by END:VCARD. Most phone cameras recognise the format and offer to add the contact.",
          "QR capacity is finite. A short vCard produces a sparse code that scans easily from a small print; a long address and multiple phone numbers increase the module count until the code needs to be larger to scan reliably.",
        ],
        formula: "QR payload = vCard 3.0 text",
      },
      examples: [
        {
          title: "A minimal card",
          steps: ["Name, company, phone and email only."],
          result: "A low-density code that scans from 2 cm on a printed card",
        },
        {
          title: "A full card",
          steps: ["Add website and a two-line address."],
          result: "Denser code — print it larger and test before the print run",
        },
      ],
      limitations: [
        "Anyone who scans can save the details; a QR code is public by nature.",
        "Avoid putting a personal mobile number on a code you cannot change — the code is static.",
        "Print quality matters: low-resolution printing or a glossy finish can make the code unscannable.",
      ],
      faqs: [
        {
          q: "Do all phones read vCard QR codes?",
          a: "iOS and Android cameras both recognise the format and offer to add the contact. Older scanners may only display the raw text.",
        },
        {
          q: "How big should the code be when printed?",
          a: "At least 2 cm square for a short vCard, larger for a dense one. Keep a quiet margin of white space around it.",
        },
        {
          q: "Can I change the details later?",
          a: "Not in a static code — you would need to generate and print a new one. A dynamic redirect requires a server, which this site does not run.",
        },
      ],
    },
  },
  {
    slug: "meeting-cost-calculator",
    name: "Meeting Cost Calculator",
    category: "business",
    tagline: "What an hour of six people actually costs.",
    intent: "meeting cost calculator",
    keywords: ["meeting cost calculator", "cost of a meeting", "meeting roi", "time cost calculator", "hourly meeting cost", "salary cost of meeting"],
    status: "live",
    actions: ["copy"],
    effort: "instant",
    popularity: 70,
    addedAt: "2025-03-08",
    seoTitle: "Meeting Cost Calculator — Hourly Cost of Attendees",
    seoDescription:
      "Work out what a meeting costs from the number of attendees, their loaded hourly cost and the duration, including the annual figure for recurring meetings.",
    content: {
      intro: [
        "A meeting is the most expensive way to exchange information that could have been written down. Putting a number on it changes the conversation: a 45-minute call with six people costs more than a day of a junior's time.",
        "Enter the attendees, an average fully loaded hourly cost and the duration; the annual figure shows what a recurring meeting really commits.",
      ],
      howTo: [
        "Count the attendees, including anyone dialled in.",
        "Enter the average fully loaded hourly cost — salary plus tax, benefits and overhead.",
        "Set the duration in minutes.",
        "Add how often it recurs for the annual figure.",
      ],
      method: {
        title: "Loaded cost, not salary",
        paragraphs: [
          "Cost per minute is attendees × hourly cost ÷ 60. A salary divided by 2,080 hours understates the real cost, because employers also pay contributions, benefits and overhead — typically 25–40% on top.",
          "The annual figure multiplies by occurrences. A weekly one-hour meeting with eight people at 45 an hour commits nearly 15,000 a year, which is often the most useful number on the page.",
        ],
        formula: "cost = attendees × hourly cost × minutes ÷ 60",
      },
      examples: [
        {
          title: "A weekly sync",
          steps: ["6 attendees, 40 per hour, 60 minutes, 50 times a year."],
          result: "240 per meeting, 12,000 a year",
        },
        {
          title: "Cutting it to 45 minutes",
          steps: ["Same meeting, 45 minutes."],
          result: "180 per meeting — a 25% saving for a written agenda",
        },
      ],
      limitations: [
        "Opportunity cost is not cash: those people were paid either way. The number is an argument, not an invoice.",
        "Averages hide the real spread — a meeting with a director and three juniors is not four average salaries.",
        "It says nothing about the value produced. Some expensive meetings are worth every minute.",
      ],
      faqs: [
        {
          q: "Should I use salary or fully loaded cost?",
          a: "Fully loaded. Salary alone understates the cost by a third or more once contributions, benefits and overhead are included.",
        },
        {
          q: "How do I reduce meeting cost?",
          a: "Shorten the default duration, cut the attendee list to decision-makers and contributors, and replace status updates with a written note.",
        },
        {
          q: "Does this include preparation time?",
          a: "No — add it as extra minutes. Preparation is often longer than the meeting and is where the real saving usually sits.",
        },
      ],
    },
  },
  {
    slug: "project-cost-calculator",
    name: "Project Cost Calculator",
    category: "business",
    tagline: "Labour by role, materials, overhead and contingency.",
    intent: "project cost calculator",
    keywords: ["project cost calculator", "project estimate", "labour cost calculator", "project budget template", "contingency calculator", "cost estimate"],
    status: "live",
    actions: ["copy"],
    effort: "quick",
    popularity: 72,
    addedAt: "2025-03-08",
    seoTitle: "Project Cost Calculator — Labour, Materials, Contingency",
    seoDescription:
      "Estimate a project cost from hours and rates by role, plus materials, overhead and a contingency buffer, with a blended hourly rate for comparison.",
    content: {
      intro: [
        "Estimates fail in predictable ways: hours are optimistic, overhead is forgotten, and there is no contingency for the part nobody has done before. This calculator puts all four components on one page so the omissions are visible.",
        "Labour is built role by role, then materials, overhead as a share of labour, and contingency on the lot.",
      ],
      howTo: [
        "Add a row per role with hours and an hourly rate.",
        "Enter materials and licence costs.",
        "Set an overhead percentage for tools, rent and admin.",
        "Add contingency — 15% is a floor for unfamiliar work.",
      ],
      method: {
        title: "Four components, one total",
        paragraphs: [
          "Labour is the sum of hours × rate. Overhead is charged as a percentage of labour because it scales with the people doing the work, and contingency is charged on labour plus materials plus overhead.",
          "The blended hourly rate — total ÷ total hours — is the number to compare with a fixed-price quote. If it is below your true cost per hour, the project loses money however good the estimate looks.",
        ],
        formula: "total = (labour × (1 + overhead%) + materials) × (1 + contingency%)",
      },
      examples: [
        {
          title: "A small build",
          steps: ["24 h design at 55, 60 h development at 70, 300 materials.", "Overhead 15%, contingency 15%."],
          result: "About 6,780 including buffers",
        },
        {
          title: "Checking a fixed price",
          steps: ["Compare the blended rate with your target rate."],
          result: "If the blended rate is under target, the quote is a discount you did not intend",
        },
      ],
      limitations: [
        "The total is cost, not price — add profit margin before quoting.",
        "Hours are estimates; a range (optimistic, likely, pessimistic) is more honest than a single figure.",
        "It cannot know about dependencies, client delays or scope creep, which is what contingency is for.",
      ],
      faqs: [
        {
          q: "How much contingency should I allow?",
          a: "15% for work you have done before, 25–30% for unfamiliar technology or clients. Contingency is not padding; it is the expected cost of the unknown.",
        },
        {
          q: "Should overhead be a percentage of labour?",
          a: "For a project estimate, yes — it scales with the people. Company-wide, overhead is usually expressed as a share of revenue.",
        },
        {
          q: "Why show a blended rate?",
          a: "It makes a fixed-price quote comparable with your own costs, which is how you catch a project that is busy but unprofitable.",
        },
      ],
    },
  },
  {
    slug: "employee-cost-calculator",
    name: "Employee Cost Calculator",
    category: "business",
    tagline: "The true annual cost of a hire, not just the salary.",
    intent: "employee cost calculator",
    keywords: ["employee cost calculator", "true cost of an employee", "cost to company calculator", "employer contributions", "salary overhead", "hiring cost"],
    status: "live",
    actions: ["copy"],
    effort: "instant",
    popularity: 74,
    addedAt: "2025-03-08",
    seoTitle: "Employee Cost Calculator — True Cost of a Hire",
    seoDescription:
      "Calculate the real annual cost of an employee from salary, employer contributions, benefits, equipment and training, with a cost multiplier.",
    content: {
      intro: [
        "A salary is roughly three quarters of what an employee costs. Employer contributions, benefits, equipment and training add the rest, and a hiring plan built on salary alone is usually 25–40% short.",
        "Enter the components and the tool returns the true annual cost, the monthly figure, a cost per worked hour, and the multiplier that summarises it.",
      ],
      howTo: [
        "Enter the gross annual salary.",
        "Add your employer contribution rate from payroll — pension, insurance, payroll taxes.",
        "Include benefits, equipment and a training budget.",
        "Read the total, the monthly cost and the multiplier.",
      ],
      method: {
        title: "Everything the employer pays",
        paragraphs: [
          "Total cost is salary plus employer contributions (a percentage of salary), benefits, one-off equipment and training. The multiplier — total ÷ salary — is the number to carry into planning: around 1.25 in most markets, higher where benefits are generous.",
          "The hourly figure divides the total by paid hours across 46 working weeks. The six weeks not counted are leave, public holidays and sickness, which cost money while producing nothing billable.",
        ],
        formula: "total = salary × (1 + contribution%) + benefits + equipment + training",
      },
      examples: [
        {
          title: "A mid-level hire",
          steps: ["45,000 salary, 14% contributions, 3,000 benefits, 2,000 equipment, 2% training."],
          result: "63,000 a year — a 1.40 multiplier",
        },
        {
          title: "The monthly view",
          steps: ["Same hire, monthly budget."],
          result: "5,250 a month, which is what the cash-flow forecast should show",
        },
      ],
      limitations: [
        "Contribution rates and statutory benefits vary by country and by salary band; enter your own rather than trusting a default.",
        "Recruitment fees, onboarding time and management overhead are not included and can add another 10–20%.",
        "It models a full year; part-year hires need the salary and equipment prorated.",
      ],
      faqs: [
        {
          q: "Why is an employee more expensive than their salary?",
          a: "Employers pay contributions, insurance and pension on top, then supply equipment, software and training. Those are real costs that a salary figure hides.",
        },
        {
          q: "What multiplier should I use for planning?",
          a: "1.25–1.4 is typical for a salaried role with benefits. Compute yours once and reuse it rather than guessing per hire.",
        },
        {
          q: "Should contractors be costed the same way?",
          a: "No. Contractors usually invoice a rate that already includes their overheads, so use the invoice value plus any management time.",
        },
      ],
    },
  },
  {
    slug: "hourly-rate-calculator",
    name: "Hourly Rate Calculator",
    category: "business",
    tagline: "The rate your income target actually requires.",
    intent: "hourly rate calculator",
    keywords: ["hourly rate calculator", "freelance rate calculator", "what should i charge", "consulting rate", "billable rate", "day rate calculator"],
    status: "live",
    actions: ["copy"],
    effort: "instant",
    popularity: 78,
    addedAt: "2025-03-08",
    seoTitle: "Hourly Rate Calculator — What to Charge",
    seoDescription:
      "Work out the hourly and day rate you need from an income target, realistic billable hours, overheads and a profit margin, with weekly revenue examples.",
    content: {
      intro: [
        "Dividing a target income by 40 hours a week produces a rate that loses money. Nobody bills 40 hours: proposals, invoicing, learning and holidays are unpaid, and overheads come out before income.",
        "This calculator starts from the income you want to take, adds business overheads, adds a margin, and divides by hours you can actually bill.",
      ],
      howTo: [
        "Enter the income you want before personal tax.",
        "Set realistic billable hours per week — 20 to 25 is common.",
        "Add the weeks you will work, allowing for holidays.",
        "Include annual overheads and a margin, then read the rate.",
      ],
      method: {
        title: "Gross up, then divide",
        paragraphs: [
          "Revenue needed is (income + overheads) ÷ (1 − margin). Dividing by 0.8 with a 20% margin is not the same as adding 20% — the difference is where most rate calculations drift.",
          "The rate is that revenue divided by billable hours. The day rate multiplies by the billable hours in a day, not by eight hours of availability.",
        ],
        formula: "rate = (income + overheads) ÷ (1 − margin) ÷ billable hours",
      },
      examples: [
        {
          title: "A 60,000 income target",
          steps: ["25 billable hours a week, 46 weeks, 10,000 overheads, 20% margin."],
          result: "87,500 revenue needed — about 76 per hour",
        },
        {
          title: "The five-day illusion",
          steps: ["Same target at 40 billable hours."],
          result: "A rate near 48 that cannot survive a quiet month",
        },
      ],
      limitations: [
        "Billable hours are the input most people get wrong; look at last month's invoices rather than an ideal week.",
        "The rate is a floor, not a ceiling — specialist work and urgent timelines justify more.",
        "It does not include tax on the income you take out; add that to the income target.",
      ],
      faqs: [
        {
          q: "How many billable hours should I assume?",
          a: "20–25 a week for a solo freelancer who also sells, administers and learns. Track your actual ratio for a month before committing.",
        },
        {
          q: "Should I quote a day rate or an hourly rate?",
          a: "Day rates are easier for clients to budget and discourage micro-management. Derive the day rate from billable hours, not from eight.",
        },
        {
          q: "Why include a profit margin?",
          a: "It is the only money that covers a slow month, new equipment or a bad debt. Without it, a single quiet quarter becomes a cash crisis.",
        },
      ],
    },
  },
  {
    slug: "email-signature-generator",
    name: "Email Signature Generator",
    category: "business",
    tagline: "A five-line signature that renders in any mail client.",
    intent: "email signature generator",
    keywords: ["email signature generator", "signature template", "professional email signature", "html email signature", "gmail signature", "outlook signature"],
    status: "live",
    actions: ["copy", "download"],
    effort: "instant",
    popularity: 76,
    addedAt: "2025-03-08",
    seoTitle: "Email Signature Generator — Works in Gmail and Outlook",
    seoDescription:
      "Generate a compact HTML email signature with name, role, company and contact details, using inline styles that survive Gmail, Outlook and Apple Mail.",
    content: {
      intro: [
        "Email signature problems are rendering problems. Mail clients strip style blocks, ignore modern layout and block images by default, so a signature has to be a table with inline styles — which is exactly what this generator produces.",
        "Keep it to five lines or fewer: every line appears on every message in a thread, and a signature longer than the message reads as noise.",
      ],
      howTo: [
        "Fill in name, role and company.",
        "Add phone, email, website and address as needed.",
        "Copy the HTML into your mail client's signature editor in HTML mode.",
        "Send yourself a test from the account you use most.",
      ],
      method: {
        title: "Why a table with inline styles",
        paragraphs: [
          "Gmail strips <style> blocks and Outlook uses Word's rendering engine, so the only layout that survives both is a two-column table with inline styles on every cell. Fonts fall back to a system stack for the same reason.",
          "The accent rule is a border, not an image, so nothing breaks when images are blocked — which is the default in most clients.",
        ],
        formula: "signature = table with inline styles + escaped text",
      },
      examples: [
        {
          title: "A compact signature",
          steps: ["Name, role, company, email."],
          result: "Four lines that survive every client, with no images",
        },
        {
          title: "With pronouns and phone",
          steps: ["Add both fields."],
          result: "Six lines — still short enough for a thread",
        },
      ],
      limitations: [
        "Some corporate clients force their own signature templates and will strip yours.",
        "It contains no images or tracking pixels, by design.",
        "You must paste the HTML into an editor that accepts HTML; plain-text-only editors will show the markup.",
      ],
      faqs: [
        {
          q: "How do I install this in Gmail?",
          a: "Settings → See all settings → General → Signature → Create new, then paste the HTML. Gmail accepts pasted HTML in the signature box.",
        },
        {
          q: "Why does my signature look broken in Outlook?",
          a: "Outlook renders email with Word. Tables with inline styles are the only reliable layout; flexbox and <style> blocks are not.",
        },
        {
          q: "Should I include a photo?",
          a: "Only if the brand calls for it. Images are blocked by default in many clients, and a missing image leaves a placeholder box.",
        },
      ],
    },
  },
  {
    slug: "business-letter-generator",
    name: "Business Letter Generator",
    category: "business",
    tagline: "Enquiry, complaint, request or resignation — laid out properly.",
    intent: "business letter template",
    keywords: ["business letter generator", "formal letter template", "complaint letter", "resignation letter template", "enquiry letter", "letter format"],
    status: "live",
    actions: ["copy", "download"],
    effort: "quick",
    popularity: 70,
    addedAt: "2025-03-08",
    seoTitle: "Business Letter Generator — Formal Letter Templates",
    seoDescription:
      "Draft a formal business letter — enquiry, complaint, request or resignation — with addresses, subject line and the correct British closing.",
    content: {
      intro: [
        "A formal letter is mostly structure: addresses, date, subject, salutation, body, closing. Getting the structure right means the reader spends their attention on the content instead of the formatting.",
        "Four templates cover the letters people actually write — enquiry, complaint, request and resignation — each with the placeholders that must be replaced before sending.",
      ],
      howTo: [
        "Pick the closest template.",
        "Replace your details and the recipient's.",
        "Rewrite the body in your own words, keeping the facts and dates specific.",
        "Choose the closing that matches the salutation.",
      ],
      method: {
        title: "Conventions that still matter",
        paragraphs: [
          "British convention pairs “Dear Sir or Madam” with “Yours faithfully” and a named recipient with “Yours sincerely”. The date is written in full so it cannot be misread — 04/03/2025 is March in Britain and April in the United States.",
          "A complaint works best when it is factual and specific: dates, amounts, what happened, what remedy you want, and a deadline for the reply.",
        ],
        formula: "sender → date → recipient → subject → salutation → body → closing → signature",
      },
      examples: [
        {
          title: "A complaint",
          steps: ["Include the order reference, the date and the exact problem.", "State the remedy you want."],
          result: "A letter a support team can act on without asking follow-up questions",
        },
        {
          title: "A resignation",
          steps: ["State the role, the notice period and the last working day.", "Keep the reason out unless you want it on record."],
          result: "A clean record with no ambiguity about dates",
        },
      ],
      limitations: [
        "Templates are not legal advice; a letter before legal action should be checked by a professional.",
        "It produces plain text — paste into your letterhead template for the visual version.",
        "The templates are British English by default; adjust spelling for US recipients.",
      ],
      faqs: [
        {
          q: "Yours faithfully or yours sincerely?",
          a: "Faithfully when you do not know the recipient's name (Dear Sir or Madam), sincerely when you do (Dear Ms Okafor).",
        },
        {
          q: "Do I need to include my address?",
          a: "For a formal letter, yes — sender and recipient addresses, then the date. Email has relaxed this, but posted letters still expect it.",
        },
        {
          q: "How long should a complaint letter be?",
          a: "One page. Facts, impact, requested remedy, deadline. Longer letters bury the ask.",
        },
      ],
    },
  },
  {
    slug: "proposal-template-generator",
    name: "Proposal Template Generator",
    category: "business",
    tagline: "Problem, approach, deliverables, timeline, price.",
    intent: "proposal template",
    keywords: ["proposal template", "project proposal generator", "client proposal", "freelance proposal", "business proposal outline", "statement of work"],
    status: "live",
    actions: ["copy", "download"],
    effort: "quick",
    popularity: 72,
    addedAt: "2025-03-08",
    seoTitle: "Proposal Template Generator — Client-Ready Draft",
    seoDescription:
      "Draft a client proposal in Markdown with problem, approach, deliverables, timeline and price, and a warning for every placeholder left unfilled.",
    content: {
      intro: [
        "A proposal is an argument, not a brochure. The structure that works is the client's problem in their own words, what you will do about it, exactly what they receive, when, and what it costs.",
        "Fill the fields and the generator assembles a Markdown draft with every section in place — and counts the placeholders you have not replaced, because a proposal containing “[Price]” reads as carelessness.",
      ],
      howTo: [
        "Describe the problem with a number attached if you can.",
        "Write the approach and the deliverables as lists of facts.",
        "Set the timeline and the price, including what is excluded.",
        "Copy the Markdown into your document, then fill every bracket.",
      ],
      method: {
        title: "Why the order matters",
        paragraphs: [
          "Problem before solution makes the price legible: a quote for “a website” invites comparison with the cheapest option, while a quote for “a 6-second load time on mobile” compares against the cost of doing nothing.",
          "Naming exclusions explicitly prevents the most expensive misunderstanding in a project. The template gives that sentence a place to live.",
        ],
        formula: "problem → approach → deliverables → timeline → price → next steps",
      },
      examples: [
        {
          title: "A rebuild proposal",
          steps: ["Problem: 6-second load, 70% mobile traffic.", "Deliverables: 12 pages, redirect map, analytics."],
          result: "A draft where every claim ties back to the problem",
        },
        {
          title: "Checking completeness",
          steps: ["Leave the price bracket in and read the counter."],
          result: "One placeholder remaining — the page tells you before the client does",
        },
      ],
      limitations: [
        "It is a starting draft, not a contract; terms, payment schedules and IP clauses belong in an agreement.",
        "The template cannot know your differentiators — that paragraph is yours to write.",
        "Markdown output needs a converter if you want a styled PDF.",
      ],
      faqs: [
        {
          q: "How long should a proposal be?",
          a: "Two to four pages for most projects. Long enough to show you understood the problem, short enough to be read in one sitting.",
        },
        {
          q: "Should the price come first or last?",
          a: "After the value and before the terms. Leading with price invites comparison before the client knows what they are buying.",
        },
        {
          q: "What should I include about exclusions?",
          a: "Anything a reasonable client might assume is included — content writing, photography, third-party licences, ongoing support. Name it and price it separately.",
        },
      ],
    },
  },
  {
    slug: "social-media-caption-formatter",
    name: "Social Media Caption Formatter",
    category: "business",
    tagline: "Fit a caption to each platform, hashtags and all.",
    intent: "social media caption formatter",
    keywords: ["caption formatter", "social media caption", "instagram caption length", "linkedin post formatter", "caption character counter", "hashtag placement"],
    status: "live",
    actions: ["copy"],
    effort: "instant",
    popularity: 66,
    addedAt: "2025-03-08",
    seoTitle: "Social Media Caption Formatter — Per-Platform Limits",
    seoDescription:
      "Format a caption for X, Instagram, LinkedIn, Facebook, TikTok or Threads, with live character counts, hashtag checks and optional sentence breaks.",
    content: {
      intro: [
        "The same post does not fit every platform: 280 characters on X, 3,000 on LinkedIn, 2,200 on Instagram, and a hashtag convention that differs on each. Copying and pasting blind produces truncated captions and hashtag walls.",
        "Write once, choose a platform, and see the exact length against the limit with the hashtags tidied and deduplicated.",
      ],
      howTo: [
        "Write the caption.",
        "Paste hashtags with or without #.",
        "Pick the platform.",
        "Fix anything flagged, then copy the formatted caption.",
      ],
      method: {
        title: "Limits, hashtags and the first line",
        paragraphs: [
          "Character counts include spaces and hashtags because that is what the platform counts. Hashtags are normalised — leading # symbols are stripped, duplicates removed — so a messy paste becomes a clean set.",
          "The optional sentence-break switch inserts blank lines after full stops, which makes a caption scannable on mobile without changing the words.",
        ],
        formula: "length = caption + call to action + hashtag line",
      },
      examples: [
        {
          title: "A LinkedIn post",
          steps: ["Write 600 characters, add three hashtags."],
          result: "Well within the 3,000 limit, with the tag line separated",
        },
        {
          title: "The same text on X",
          steps: ["Switch platform to X."],
          result: "A truncation warning and the exact number of characters to cut",
        },
      ],
      limitations: [
        "Limits change; they are listed as published and can differ for verified accounts or API posting.",
        "It does not check hashtag volume or relevance — a tag can be relevant and still useless.",
        "No scheduling, posting or image handling: this formats text only.",
      ],
      faqs: [
        {
          q: "How many hashtags should I use?",
          a: "Three to five on LinkedIn and X, 8–12 niche tags on Instagram, and one or two on TikTok. More than that reads as spam almost everywhere.",
        },
        {
          q: "Do hashtags count towards the character limit?",
          a: "Yes, on every platform listed. The counter here includes them, which is why the total can exceed the caption you typed.",
        },
        {
          q: "Should hashtags go in the caption or the first comment?",
          a: "Either works on Instagram. In the caption they are part of the post; in the comment they keep the caption clean. Test both on your own account.",
        },
      ],
    },
  },
  {
    slug: "hashtag-generator",
    name: "Hashtag Generator",
    category: "business",
    tagline: "Broad, niche and branded tags from one topic.",
    intent: "hashtag generator",
    keywords: ["hashtag generator", "instagram hashtags", "hashtag ideas", "trending hashtags", "niche hashtags", "social media tags"],
    status: "live",
    actions: ["copy"],
    effort: "instant",
    popularity: 72,
    addedAt: "2025-03-08",
    seoTitle: "Hashtag Generator — Broad, Niche and Branded Tags",
    seoDescription:
      "Generate a hashtag set from your topic: broad tags for reach, niche tags for intent and a branded tag, all deduplicated and copyable in one click.",
    content: {
      intro: [
        "Hashtags are a discovery mechanism with diminishing returns. A tag with millions of posts buries a small account in minutes; a tag nobody searches reaches nobody. The useful set mixes one or two broad tags with several narrow ones and one of your own.",
        "Enter the topic and a branded tag, and the generator builds a set split by tier so you can see what each tag is doing.",
      ],
      howTo: [
        "Enter the topic in one or two words.",
        "Add your branded tag if you have one.",
        "Choose how many tags you need.",
        "Copy the set, then check volume in the platform's search.",
      ],
      method: {
        title: "Three tiers, three jobs",
        paragraphs: [
          "Broad tags name the subject — #coffee, #cycling — and compete with everything. Niche tags add intent, such as #CoffeeForBeginners or #CyclingTips, where the audience is smaller and more specific. Branded tags collect user posts and build an archive you control.",
          "Tags are built from the topic words with modifiers attached, which keeps them relevant rather than randomly popular. Duplicates and case-only variants are removed.",
        ],
        formula: "tags = topic + modifiers, tiered by breadth",
      },
      examples: [
        {
          title: "A coffee brand",
          steps: ["Topic “specialty coffee”, branded “acmecoffee”."],
          result: "#coffee and #specialty for reach, #SpecialtyCoffeeTips for intent, #acmecoffee for brand",
        },
        {
          title: "A local service",
          steps: ["Topic “plumbing”, add the city as a branded tag."],
          result: "A set weighted to local intent rather than national competition",
        },
      ],
      limitations: [
        "No volume data: you have to check how many posts each tag carries in the platform's search.",
        "Hashtag performance changes monthly and by account size.",
        "Tags do not replace keywords in the caption, which platforms increasingly use for matching.",
      ],
      faqs: [
        {
          q: "How many hashtags is too many?",
          a: "Over ten looks promotional on most platforms. Instagram tolerates more, but 8–12 niche tags usually beat 30 generic ones.",
        },
        {
          q: "Should I use the same tags every post?",
          a: "Rotate a core set and vary the niche tags around the specific post. Identical tag blocks on every post look automated.",
        },
        {
          q: "Do hashtags still work?",
          a: "They help discovery on Instagram and TikTok, matter less on X and LinkedIn, and are close to noise on Facebook. Match the effort to the platform.",
        },
      ],
    },
  },
  {
    slug: "content-calendar-generator",
    name: "Content Calendar Generator",
    category: "business",
    tagline: "Four weeks of post ideas, spaced and assigned to channels.",
    intent: "content calendar generator",
    keywords: ["content calendar generator", "social media calendar", "posting schedule template", "content planner", "editorial calendar", "content schedule"],
    status: "live",
    actions: ["copy", "download"],
    effort: "quick",
    popularity: 68,
    addedAt: "2025-03-08",
    seoTitle: "Content Calendar Generator — Spaced Posting Schedule",
    seoDescription:
      "Generate a content calendar from a start date, cadence and channels, with post ideas spaced through each week and a TSV export for your planner.",
    content: {
      intro: [
        "A content calendar fails when it promises more than you can write. Start from a cadence you can hold — three posts a week beats a fortnight of daily posting followed by silence — and let the schedule space them out.",
        "The generator assigns dates, days and channels, and rotates through a bank of twelve post formats so the calendar has variety without inventing topics you cannot deliver.",
      ],
      howTo: [
        "Pick a start date.",
        "Choose the number of weeks and posts per week.",
        "List the channels, comma separated.",
        "Download the TSV and paste it into your planner.",
      ],
      method: {
        title: "Spacing, rotation and honest formats",
        paragraphs: [
          "Posts are spaced within each week rather than stacked on one day, because a gap of several days between posts trains the audience to forget you. Channels rotate so no single platform gets everything.",
          "The idea bank covers formats that are cheap to produce from real work: how-to, myth-busting, customer question, checklist, case study. Nothing requires a studio or a budget.",
        ],
        formula: "posts = weeks × posts per week, spaced across each week",
      },
      examples: [
        {
          title: "Three posts a week for four weeks",
          steps: ["Start on a Monday, 4 weeks, 3 posts, two channels."],
          result: "Twelve posts alternating between the channels",
        },
        {
          title: "A daily fortnight",
          steps: ["2 weeks at 7 posts."],
          result: "Fourteen entries — realistic only if you batch them in advance",
        },
      ],
      limitations: [
        "It generates formats, not topics specific to your business; you still supply the substance.",
        "No publishing, scheduling or image planning — it is a list, not a tool integration.",
        "It does not know your capacity; the cadence must be one you can sustain.",
      ],
      faqs: [
        {
          q: "How often should I post?",
          a: "Whatever you can sustain for six months. Consistency beats frequency, and three good posts a week outperform seven rushed ones.",
        },
        {
          q: "Can I import this into Notion or a spreadsheet?",
          a: "Yes — the TSV export pastes into a Notion table or Excel with the columns intact.",
        },
        {
          q: "Should every channel get the same content?",
          a: "Reuse the idea, rewrite the format. A LinkedIn post and a TikTok video can share a premise but not a script.",
        },
      ],
    },
  },
  {
    slug: "marketing-budget-calculator",
    name: "Marketing Budget Calculator",
    category: "business",
    tagline: "Split a budget by channel and see the cost per lead.",
    intent: "marketing budget calculator",
    keywords: ["marketing budget calculator", "ad budget split", "marketing spend planner", "cost per lead calculator", "channel budget", "media budget"],
    status: "live",
    actions: ["copy"],
    effort: "instant",
    popularity: 68,
    addedAt: "2025-03-08",
    seoTitle: "Marketing Budget Calculator — Channel Split and CPL",
    seoDescription:
      "Divide a marketing budget across channels by percentage, check it adds to 100%, and see the spend per lead and any unallocated budget.",
    content: {
      intro: [
        "A marketing budget is a set of bets, and a split that adds to 130% is not a plan. This calculator allocates a total across channels, shows the remainder, and converts the spend into a cost per lead if you have a lead estimate.",
        "Leave 10–20% unallocated so the channel that proves itself mid-quarter can be scaled without reopening the whole plan.",
      ],
      howTo: [
        "Enter the total budget.",
        "Add channels and their percentage share.",
        "Check that the shares total 100%.",
        "Add expected leads for a cost-per-lead figure.",
      ],
      method: {
        title: "Percentages, remainder and cost per lead",
        paragraphs: [
          "Each channel's amount is total × share ÷ 100. The tool sums the shares and flags anything that is not 100%, because that check catches most budget errors before they reach a spreadsheet.",
          "Cost per lead is allocated spend ÷ expected leads. It is a planning number, not a measurement — the point of splitting the budget is to replace it with real data after a few weeks.",
        ],
        formula: "amount = total × share ÷ 100; CPL = spend ÷ leads",
      },
      examples: [
        {
          title: "A 10,000 budget",
          steps: ["40% search, 30% social, 20% content, 10% email."],
          result: "4,000 / 3,000 / 2,000 / 1,000, fully allocated",
        },
        {
          title: "With 250 expected leads",
          steps: ["Same split, 10,000 spend."],
          result: "A cost per lead of 40 to compare against your margin per customer",
        },
      ],
      limitations: [
        "It does not model diminishing returns: doubling a channel's budget rarely doubles its leads.",
        "Lead quality varies — a cheap lead that never converts is expensive.",
        "Channel conventions differ by industry; the split is a starting hypothesis, not a benchmark.",
      ],
      faqs: [
        {
          q: "How should I split a small budget?",
          a: "Concentrate. Under about 5,000 a month, two channels executed well beat five executed badly — usually one intent channel and one content channel.",
        },
        {
          q: "What is a good cost per lead?",
          a: "It depends on your margin and close rate. Compare CPL with (average sale value × close rate); if the lead costs more than a fifth of expected profit, the channel needs work.",
        },
        {
          q: "Should I keep a reserve?",
          a: "Yes — 10–20% unallocated. It lets you double down on what works without cutting a channel mid-flight.",
        },
      ],
    },
  },
  {
    slug: "email-subject-line-analyzer",
    name: "Email Subject Line Analyzer",
    category: "business",
    tagline: "Length, spam phrases and a mobile inbox preview.",
    intent: "email subject line analyzer",
    keywords: ["subject line analyzer", "email subject tester", "subject line length", "spam word checker", "email preview", "open rate subject"],
    status: "live",
    actions: ["copy"],
    effort: "instant",
    popularity: 64,
    addedAt: "2025-03-08",
    seoTitle: "Email Subject Line Analyzer — Length and Spam Words",
    seoDescription:
      "Check a subject line's length on mobile, spot phrases spam filters penalise, compare it with the preview text and see how it looks in an inbox.",
    content: {
      intro: [
        "Most subject lines are judged in about 40 characters on a phone, next to a sender name and a line of preview text. Anything important after the cut is invisible to the majority of recipients.",
        "This analyzer counts characters, flags spammy phrasing and caps, previews the inbox rendering, and checks whether the preview text is repeating the subject instead of adding to it.",
      ],
      howTo: [
        "Paste the subject line.",
        "Read the character count against 40 and 60.",
        "Fix anything flagged — caps, repeated punctuation, spam phrases.",
        "Add preview text that adds information rather than repeating.",
      ],
      method: {
        title: "What the score reflects",
        paragraphs: [
          "The score combines length in the useful window, the presence of a specific number, absence of spam phrases, and no all-caps shouting. It is a heuristic: a subject line that scores 100 can still be ignored, and one that scores 60 can beat expectations on a good list.",
          "Deliverability is decided by authentication, reputation and engagement long before word choice, which is why the tool says so rather than pretending a subject line fixes a spam problem.",
        ],
        formula: "score = length + specificity − spam signals − formatting penalties",
      },
      examples: [
        {
          title: "A specific line",
          steps: ["“3 ways to cut invoice time by half”."],
          result: "48 characters, one number, no spam phrases — scores well",
        },
        {
          title: "A promotional line",
          steps: ["“FREE CASH GUARANTEED!! ACT NOW”."],
          result: "Multiple spam phrases and repeated punctuation — heavily penalised",
        },
      ],
      limitations: [
        "No open-rate prediction: that depends on the list, the sender and the offer.",
        "Spam filters are proprietary and change; a word list is an approximation, not a test.",
        "It analyses one line in isolation, not A/B results from your own audience.",
      ],
      faqs: [
        {
          q: "How long should a subject line be?",
          a: "Around 40–50 characters for mobile safety. Under 60 keeps most of the line visible on desktop clients.",
        },
        {
          q: "Do emoji help or hurt?",
          a: "They can lift opens on consumer lists and look unprofessional on B2B ones. Test on your own audience rather than following a general rule.",
        },
        {
          q: "What is preview text?",
          a: "The grey line after the subject in the inbox. It is free real estate — use it to add information instead of repeating the subject.",
        },
      ],
    },
  },
  {
    slug: "campaign-roi-calculator",
    name: "Campaign ROI Calculator",
    category: "business",
    tagline: "ROI, ROAS, cost per lead and cost per sale.",
    intent: "campaign roi calculator",
    keywords: ["campaign roi calculator", "roas calculator", "marketing roi", "cost per acquisition", "ad spend calculator", "return on ad spend"],
    status: "live",
    actions: ["copy"],
    effort: "instant",
    popularity: 74,
    addedAt: "2025-03-08",
    seoTitle: "Campaign ROI Calculator — ROI, ROAS and CPA",
    seoDescription:
      "Calculate campaign ROI, return on ad spend, cost per lead and cost per acquisition from spend, revenue, leads and sales, with a margin check.",
    content: {
      intro: [
        "ROI and ROAS are routinely confused, and the confusion flatters campaigns. ROI is profit as a share of spend; ROAS is revenue per unit spent. A 3× ROAS on a product with a 30% margin is a losing campaign, even though it sounds like a win.",
        "Enter spend, attributed revenue, leads and sales to see both measures, the cost per acquisition and the margin implied by the result.",
      ],
      howTo: [
        "Enter the campaign spend.",
        "Add revenue you can genuinely attribute.",
        "Include leads and sales for the unit costs.",
        "Compare ROI with ROAS and check the margin line.",
      ],
      method: {
        title: "Two measures, one decision",
        paragraphs: [
          "ROI = (revenue − spend) ÷ spend × 100. ROAS = revenue ÷ spend. Cost per lead is spend ÷ leads, and cost per sale is spend ÷ sales. Each answers a different question, and a campaign can look excellent on one and poor on another.",
          "Attribution is the weak link: last-click over-credits the final channel, view-through windows over-credit display. Use the same window for every campaign you compare.",
        ],
        formula: "ROI = (revenue − spend) ÷ spend; ROAS = revenue ÷ spend",
      },
      examples: [
        {
          title: "A profitable campaign",
          steps: ["1,000 spend, 3,200 revenue."],
          result: "220% ROI and 3.2× ROAS, with 2,200 profit",
        },
        {
          title: "The same ROAS, worse margin",
          steps: ["3.2× ROAS but a 25% gross margin."],
          result: "Profit before ad spend is 800, so the campaign actually loses 200",
        },
      ],
      limitations: [
        "It counts revenue, not gross profit — include cost of goods for a real verdict.",
        "Attribution windows and models are outside the tool; the numbers are only as good as the tracking.",
        "Lifetime value is not included; a campaign can lose money on the first order and still be worth running.",
      ],
      faqs: [
        {
          q: "What is a good ROAS?",
          a: "It depends on margin: at 50% gross margin you need at least 2× just to break even on ad spend. Work backwards from your margin rather than copying a benchmark.",
        },
        {
          q: "Is ROI or ROAS more useful?",
          a: "ROAS for day-to-day channel decisions, ROI for deciding whether the campaign was worth running at all.",
        },
        {
          q: "How do I attribute revenue fairly?",
          a: "Pick one model, apply it to every campaign, and note it alongside the results. Consistency matters more than the model chosen.",
        },
      ],
    },
  },
  {
    slug: "product-pricing-calculator",
    name: "Product Pricing Calculator",
    category: "business",
    tagline: "Price from a target margin, a markup or a fixed number.",
    intent: "product pricing calculator",
    keywords: ["product pricing calculator", "margin calculator", "markup calculator", "selling price calculator", "gross margin", "pricing strategy"],
    status: "live",
    actions: ["copy"],
    effort: "instant",
    popularity: 76,
    addedAt: "2025-03-08",
    seoTitle: "Product Pricing Calculator — Margin and Markup",
    seoDescription:
      "Set a product price from a target gross margin, a markup or a fixed figure, and see the margin, markup and profit per unit side by side.",
    content: {
      intro: [
        "Margin and markup are different numbers and mixing them up is expensive. A 50% markup on a 40 cost gives a price of 60 — a 33% margin, not 50%. This calculator converts between the three ways people price: cost-plus markup, target margin and a fixed price.",
        "Every result shows margin, markup and profit per unit, so the relationships stay visible.",
      ],
      howTo: [
        "Enter the true unit cost, including packaging and inbound shipping.",
        "Choose whether you are setting a margin, a markup or a fixed price.",
        "Read the resulting price and both measures.",
        "Check the price table to see how sensitive the margin is to cost changes.",
      ],
      method: {
        title: "The two formulas",
        paragraphs: [
          "Price from margin = cost ÷ (1 − margin). Price from markup = cost × (1 + markup). Margin measures profit against price; markup measures it against cost, which is why markup is always the larger number for the same deal.",
          "Payment processing, marketplace commission and returns should be added to the unit cost first, because they are charged on the price, not the cost.",
        ],
        formula: "price = cost ÷ (1 − margin) = cost × (1 + markup)",
      },
      examples: [
        {
          title: "A 60% margin",
          steps: ["Cost 40, target margin 60%."],
          result: "Price 100, markup 150%, profit 60",
        },
        {
          title: "Cost inflation",
          steps: ["Cost rises from 40 to 50 at the same price."],
          result: "Margin falls from 60% to 50% — the table shows the sensitivity",
        },
      ],
      limitations: [
        "It prices on cost, not on what the market will pay; a value-based price can be much higher.",
        "It excludes fixed costs — rent and salaries must be covered by total margin, not by a single product.",
        "Tax treatment of the price (inclusive or exclusive) is not modelled.",
      ],
      faqs: [
        {
          q: "What is the difference between margin and markup?",
          a: "Margin is profit ÷ price; markup is profit ÷ cost. A 50% margin is a 100% markup — the same money described two ways.",
        },
        {
          q: "What margin should I aim for?",
          a: "Physical products often need 50–70% gross margin to cover returns, fees and marketing. Services can run higher because there is no inventory.",
        },
        {
          q: "Should I include shipping in the unit cost?",
          a: "Inbound shipping, yes. Outbound shipping is usually a separate line, but if you offer free delivery, its cost belongs in the unit economics.",
        },
      ],
    },
  },
];
