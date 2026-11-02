import type { CategoryDefinition, CategoryId } from "./types";

export const categories: CategoryDefinition[] = [
  {
    id: "text",
    name: "Text & Writing Tools",
    shortName: "Text",
    tagline: "Count, clean, convert and compare text",
    description:
      "Free online text tools for writers, students and editors: word counting, case conversion, duplicate removal, diffing and more.",
    intro: [
      "Writing tools should get out of the way. Every text utility here runs entirely inside your browser, so a draft, an essay or a confidential memo never leaves your device — there is no upload step and no waiting for a server.",
      "Each tool is built for a specific job: checking whether a caption fits, converting messy pasted text into clean paragraphs, comparing two revisions line by line, or turning a headline into a URL-friendly slug. Results update as you type and can be copied with one click.",
    ],
    accent: "brand",
    status: "live",
    plannedTools: [
      "Character Counter",
      "Sentence Counter",
      "Paragraph Counter",
      "Reading Time Calculator",
      "Speaking Time Calculator",
      "Line Break Remover",
      "Text to Slug Converter",
      "Text Frequency Analyzer",
      "Random Text Generator",
      "Markdown to HTML Converter",
      "HTML to Markdown Converter",
      "Unicode Character Inspector",
    ],
  },
  {
    id: "calculators",
    name: "Calculators & Math",
    shortName: "Calculators",
    tagline: "Percentages, dates, averages and grades",
    description:
      "Free online calculators with worked examples and formulas: percentage, discount, age, date difference, average, standard deviation and GPA.",
    intro: [
      "A good calculator answers the question and then shows you why the answer is right. Every calculator on this page states the formula it uses, walks through a worked example with real numbers, and flags the assumptions that can change the result.",
      "Calculations run instantly in your browser and are never sent anywhere. Where a result depends on convention — such as whether an average is a mean, median or mode — the tool says so rather than guessing silently.",
    ],
    accent: "amber",
    status: "live",
    plannedTools: [
      "Basic Calculator",
      "Scientific Calculator",
      "Sales Tax Calculator",
      "Markup Calculator",
      "Mean, Median and Mode Calculator",
      "Fraction Calculator",
      "Square Root Calculator",
      "LCM & GCD Calculator",
      "Prime Number Checker",
      "Factorial Calculator",
      "Random Number Generator",
      "Time Duration Calculator",
      "Probability Calculator",
      "Matrix Calculator",
    ],
  },
  {
    id: "finance",
    name: "Finance & Business Calculators",
    shortName: "Finance",
    tagline: "Loans, interest, margin and returns",
    description:
      "Understand borrowing and investing with transparent loan amortisation, compound interest, profit margin and ROI calculators.",
    intro: [
      "Financial calculations are only useful if you can see the inputs, the assumptions and the arithmetic behind them. These calculators show a full payment or growth schedule rather than a single unexplained figure, and they never present an estimate as financial advice.",
      "They are planning tools: useful for comparing scenarios, sanity-checking a lender's quote or stress-testing a business idea. They do not include local tax rules, fees or lender-specific conditions, and figures are rounded for display.",
    ],
    accent: "emerald",
    status: "live",
    plannedTools: [
      "Savings Calculator",
      "Investment Growth Calculator",
      "Break-Even Calculator",
      "Invoice Generator",
      "Mortgage Calculator",
      "Debt Payoff Calculator",
      "VAT Return Calculator",
      "Freelance Rate Calculator",
      "Salary Calculator",
      "Budget Calculator",
      "Currency Converter",
      "Inflation Calculator",
    ],
  },
  {
    id: "developer",
    name: "Developer Tools",
    shortName: "Developer",
    tagline: "Format, encode, decode and generate",
    description:
      "Fast client-side developer utilities: JSON, XML, HTML, CSS and JavaScript formatters and minifiers, regex tools, hashes, UUIDs, JWTs, QR codes, timestamps and colour conversion.",
    intro: [
      "Developer tools are used in bursts, often while debugging something else. They should load instantly, work offline, and never quietly send your tokens, source or payloads to a server. Every tool in this category runs on your machine.",
      "The whole blueprint set is live: JSON, XML, HTML, CSS and JavaScript formatters and minifiers; Base64, URL and HTML-entity encoding; SHA hashes and UUIDs through Web Crypto; JWT decoding; regex testing and explanation; QR generation and reading; Unix timestamps; and colour, gradient and shadow builders.",
      "Each tool explains the format or algorithm it applies, so the output is verifiable rather than taken on trust — the hash generator uses the browser's Web Crypto API, the JavaScript minifier parses with Terser rather than rewriting text with regexes, and the JWT decoder shows the exact claim payload without pretending to verify the signature.",
    ],
    accent: "sky",
    status: "live",
    plannedTools: [],
  },
  {
    id: "everyday",
    name: "Everyday & Lifestyle",
    shortName: "Everyday",
    tagline: "Health estimates, cooking, units and timers",
    description:
      "Everyday calculators and converters: health estimates, pace and fuel, cooking measures and scaling, unit conversion, and local timers with a world clock.",
    intro: [
      "Everyday tools are judged by whether they answer the question in front of you — how much flour, how fast, what time is it there, how long until the oven timer. Each one here shows its working and its assumptions rather than a bare number.",
      "Health estimates are labelled as estimates: population equations with real error bars, no diagnosis and no treatment claims. Unit conversions use exact international definitions where they exist, and the timers run from your device clock rather than a server, so nothing is scheduled or stored.",
    ],
    accent: "violet",
    status: "live",
    plannedTools: [],
  },
  {
    id: "seo",
    name: "SEO & Website Management",
    shortName: "SEO",
    tagline: "Snippets, structure and structured data",
    description:
      "On-page SEO tools that work from pasted source: title and description previews, heading and alt-text checks, sitemap and robots validation, JSON-LD generators, hreflang and checklists.",
    intro: [
      "Most SEO checkers fetch your page and hide the reasoning behind a score. These tools work the other way round: you paste the source, and every finding is a sentence you can act on — a missing description, two H1s, a canonical that points elsewhere.",
      "Everything runs on your machine, which means unpublished drafts, staging pages and logged-in templates can be audited without handing the markup to anyone. Crawling-based checks, which need a server, are marked as planned instead of being faked.",
    ],
    accent: "amber",
    status: "live",
    plannedTools: ["Broken Link Checker"],
  },
  {
    id: "security",
    name: "Security & Privacy",
    shortName: "Security",
    tagline: "Passwords, hashes and encryption, all local",
    description:
      "Password strength, secure generators, hashing, checksums and a working AES-GCM demo — every calculation happens in your browser.",
    intro: [
      "Security tools are the worst place to send data to a server. Hashing, checksum verification, passphrase stretching and encryption all run locally here: the file you hash is read through the browser's File API, the password you test is analysed in page memory, and nothing is uploaded, logged or stored.",
      "The tools are also explicit about their limits. A hash is not a signature, a strength estimate is not an audit, a client-side encryption demo is not a vault, and a URL checker that makes no network request cannot tell you whether a site is malicious. Each page says which of those applies instead of implying a guarantee.",
    ],
    accent: "slate",
    status: "live",
    plannedTools: ["Passphrase Generator"],
  },
  {
    id: "images",
    name: "Image Tools",
    shortName: "Images",
    tagline: "Compress, resize and convert images",
    description:
      "Twenty browser-based image tools: compress, resize, crop, convert formats, read EXIF and generate favicons without uploading a photo.",
    intro: [
      "Image work is the strongest argument for browser-only tools. Canvas decodes and re-encodes a photo at full quality on your own machine, so a passport scan or an unreleased product shot never leaves the device.",
      "Every tool in this category follows the same rule: the file is read locally, processed on a canvas, and offered back to you as a download. Some browsers encode slightly differently, but none of them send your pixels anywhere.",
    ],
    accent: "cyan",
    status: "live",
    plannedTools: [],
  },
  {
    id: "pdf",
    name: "PDF & Documents",
    shortName: "PDF",
    tagline: "Merge, split and convert documents",
    description:
      "Merge, split, rotate, watermark and convert PDFs, and turn Word or text files into PDFs — all on your own device.",
    intro: [
      "Documents carry the highest privacy stakes of any file type, so every tool in this category runs locally: pdf-lib edits the file and pdf.js renders or reads it, both inside the page.",
      "Nineteen document tools are live. The password protection tool stays marked as planned until a standards-compliant encryption path can be tested against real PDF readers — a lock that can be opened would be worse than no lock at all.",
    ],
    accent: "orange",
    status: "live",
    plannedTools: ["PDF Password Protection Tool"],
  },
  {
    id: "education",
    name: "Education & Students",
    shortName: "Education",
    tagline: "Grades, study plans and referencing",
    description:
      "Grade and CGPA arithmetic, attendance forecasts, study timetables, flashcards, quizzes, number systems and citation formatting.",
    intro: [
      "Student tools have a short season and a long tail: everything here is needed weekly, from the first weighted grade to the last bibliography. Each one runs on what the student types, so a personal grade or an unpublished essay never leaves the device.",
      "The tools are careful about the difference between arithmetic and policy. A grade calculator cannot know your school's boundary marks, an attendance forecast cannot see how a register treats lateness, and a citation formatter follows the common style forms rather than every edge case in the manual. Each page says which is which.",
    ],
    accent: "amber",
    status: "live",
    plannedTools: [],
  },
  {
    id: "internet",
    name: "Internet & Network",
    shortName: "Internet",
    tagline: "URLs, IPs and request inspection",
    description:
      "Offline network utilities: URL parsing and validation, domain structure, IPv4 subnet maths, User-Agent parsing, HTTP status codes, sitemaps, meta tags and canonical checks.",
    intro: [
      "A browser cannot check another server's DNS, TLS certificate or response headers directly, so this category is split honestly: everything that can be computed locally is live, and the eight tools that genuinely need a server are marked as planned rather than simulated.",
      "The live half covers the work developers actually do at a desk — splitting a URL, validating one before storing it, subnetting a range, reading a User-Agent from a log, looking up a status code, and generating the head tags and sitemap a page needs. Robots.txt generation and UTM building live under SEO and are already available.",
    ],
    accent: "teal",
    status: "live",
    plannedTools: [
      "URL Shortener",
      "IP Address Information Tool",
      "DNS Record Lookup",
      "HTTP Header Checker",
      "SSL Certificate Expiry Checker",
      "Website Status Checker",
      "Website Response Time Checker",
      "Redirect Checker",
    ],
  },
  {
    id: "business",
    name: "Business & Marketing",
    shortName: "Business",
    tagline: "Rates, campaigns and communication",
    description:
      "Planned business utilities: campaign ROI, commission splits, email signature and invoice builders.",
    intro: [
      "Business tools live or die on trust, so the planned tools here will follow the same rule as the finance calculators: show the formula, show a worked example, and never imply a projection is a promise.",
      "This category is on the roadmap. The compound interest, loan and ROI calculators already cover the most common business maths.",
    ],
    accent: "fuchsia",
    status: "planned",
    plannedTools: [
      "Campaign ROI Calculator",
      "Break-Even Point Calculator",
      "Commission Calculator",
      "Email Signature Generator",
      "Invoice Generator",
      "Business Name Generator",
      "Meeting Cost Calculator",
      "Product Pricing Calculator",
      "Hashtag Generator",
      "Content Calendar Generator",
    ],
  },
];

export const categoryMap = new Map<CategoryId, CategoryDefinition>(
  categories.map((c) => [c.id, c]),
);

export function getCategory(id: CategoryId): CategoryDefinition {
  const category = categoryMap.get(id);
  if (!category) throw new Error(`Unknown category: ${id}`);
  return category;
}
