/**
 * Business, marketing and productivity helpers: pricing arithmetic, document
 * generators and copy utilities. Deterministic, local, and honest about the
 * fact that a generated document is a starting draft.
 */

/* ------------------------------------------------------------------ */
/* Documents and money                                                 */
/* ------------------------------------------------------------------ */

export interface LineItem {
  description: string;
  quantity: number;
  unitPrice: number;
}

export interface InvoiceTotals {
  lines: { description: string; quantity: number; unitPrice: number; amount: number }[];
  subtotal: number;
  discount: number;
  taxable: number;
  tax: number;
  total: number;
  issues: string[];
}

export function invoiceTotals(input: { items: LineItem[]; taxRate: number; discountPercent?: number; discountFlat?: number }): InvoiceTotals {
  const issues: string[] = [];
  const lines = input.items
    .filter((item) => item.description.trim() || item.quantity || item.unitPrice)
    .map((item) => ({
      description: item.description.trim() || "Item",
      quantity: Number(item.quantity) || 0,
      unitPrice: Number(item.unitPrice) || 0,
      amount: (Number(item.quantity) || 0) * (Number(item.unitPrice) || 0),
    }));

  const subtotal = lines.reduce((sum, line) => sum + line.amount, 0);
  const percentDiscount = Math.min(100, Math.max(0, Number(input.discountPercent) || 0));
  const flatDiscount = Math.max(0, Number(input.discountFlat) || 0);
  const requestedDiscount = (subtotal * percentDiscount) / 100 + flatDiscount;
  const discount = Math.min(subtotal, requestedDiscount);
  const taxable = subtotal - discount;
  const tax = (taxable * Math.max(0, Number(input.taxRate) || 0)) / 100;

  if (percentDiscount > 0 && flatDiscount > 0) issues.push("Both a percentage and a fixed discount are applied — check that is what you intended.");
  if (lines.length === 0) issues.push("Add at least one line item.");
  if (requestedDiscount > subtotal) issues.push("The discount is larger than the subtotal and has been capped.");

  return { lines, subtotal, discount, taxable, tax, total: taxable + tax, issues };
}

export function formatMoney(value: number, currency = ""): string {
  if (!Number.isFinite(value)) return "—";
  const formatted = value.toLocaleString("en-GB", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  return currency ? `${currency} ${formatted}` : formatted;
}

export interface ReceiptInput {
  storeName: string;
  reference: string;
  date: string;
  items: LineItem[];
  taxRate: number;
  paymentMethod: string;
  note?: string;
}

export function receiptText(input: ReceiptInput): string {
  const totals = invoiceTotals({ items: input.items, taxRate: input.taxRate });
  const width = 40;
  const line = "-".repeat(width);
  const row = (left: string, right: string) => {
    const space = Math.max(1, width - left.length - right.length);
    return `${left}${" ".repeat(space)}${right}`;
  };

  return [
    input.storeName.trim() || "Store name",
    input.reference ? `Receipt ${input.reference}` : "",
    input.date,
    line,
    ...totals.lines.map((item) =>
      row(
        `${item.quantity} × ${item.description}`.slice(0, width - 10),
        formatMoney(item.amount),
      ),
    ),
    line,
    row("Subtotal", formatMoney(totals.subtotal)),
    totals.discount > 0 ? row("Discount", `-${formatMoney(totals.discount)}`) : "",
    row(`Tax (${Number(input.taxRate) || 0}%)`, formatMoney(totals.tax)),
    row("TOTAL", formatMoney(totals.total)),
    line,
    `Paid by ${input.paymentMethod}`,
    input.note?.trim() ? input.note.trim() : "",
    "",
    "Thank you.",
  ]
    .filter((entry) => entry !== "")
    .join("\n");
}

/* ------------------------------------------------------------------ */
/* Name and slogan generation                                          */
/* ------------------------------------------------------------------ */

const NAME_PREFIXES = ["North", "Bright", "Cedar", "River", "True", "Blue", "Iron", "Silver", "Urban", "Golden", "Clear", "Harvest", "Summit", "Copper"];
const NAME_SUFFIXES = ["Labs", "Works", "Studio", "Collective", "Supply", "Partners", "Co", "House", "Group", "Craft", "Union", "& Sons"];
const NAME_ABSTRACT = ["Novo", "Luma", "Verda", "Kito", "Aven", "Zori", "Mira", "Tavo", "Nilo", "Quill"];

function mulberry32(seed: number) {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function shuffleWith<T>(items: T[], seed: number): T[] {
  const random = mulberry32(seed);
  const copy = [...items];
  for (let index = copy.length - 1; index > 0; index -= 1) {
    const swap = Math.floor(random() * (index + 1));
    [copy[index], copy[swap]] = [copy[swap], copy[index]];
  }
  return copy;
}

const titleCase = (value: string) => value.replace(/\b[a-z]/g, (character) => character.toUpperCase());

export function generateBusinessNames(input: {
  keyword: string;
  style: "modern" | "classic" | "invented" | "compound";
  count: number;
  seed?: number;
}): string[] {
  const keyword = input.keyword.trim().replace(/[^a-zA-Z0-9 ]/g, "");
  const words = keyword.split(/\s+/).filter(Boolean).map((word) => titleCase(word.toLowerCase()));
  const base = words.join("") || "North";
  const count = Math.max(1, Math.min(24, input.count || 8));
  const seed = input.seed ?? 7;

  const candidates: string[] = [];
  if (input.style === "modern") {
    for (const suffix of NAME_SUFFIXES) candidates.push(`${base} ${suffix}`);
    for (const prefix of NAME_PREFIXES) candidates.push(`${prefix} ${base}`);
  } else if (input.style === "classic") {
    for (const word of words.length ? words : ["North"]) candidates.push(`${word} & Co.`);
    for (const suffix of ["Trading Company", "Established", "Merchants", "Workshop"]) candidates.push(`${base} ${suffix}`);
    candidates.push(`The ${base} Company`);
  } else if (input.style === "invented") {
    for (const prefix of NAME_ABSTRACT) candidates.push(`${prefix}${base.slice(0, 4).toLowerCase()}`);
    for (const suffix of ["ly", "io", "ora", "ify"]) candidates.push(`${base.toLowerCase()}${suffix}`);
  } else {
    for (const prefix of NAME_PREFIXES) candidates.push(`${prefix}${base}`);
    for (const suffix of ["Hub", "Point", "Base", "Link", "Market"]) candidates.push(`${base}${suffix}`);
  }

  return shuffleWith([...new Set(candidates)], seed).slice(0, count);
}

export function generateSlogans(input: { brand: string; benefit: string; audience?: string; count: number; seed?: number }): string[] {
  const brand = input.brand.trim() || "Your brand";
  const benefit = input.benefit.trim().replace(/\.$/, "") || "work that works";
  const audience = input.audience?.trim();
  const count = Math.max(1, Math.min(16, input.count || 6));

  const patterns = [
    `${brand}: ${benefit}.`,
    `${benefit.charAt(0).toUpperCase()}${benefit.slice(1)}, every time.`,
    `Built for ${audience || "people who notice the difference"}.`,
    `Less friction. More ${benefit.split(" ").slice(-1)[0]}.`,
    `${brand} — because ${benefit} should not be hard.`,
    `Serious about ${benefit.split(" ").slice(-1)[0]}.`,
    `Do the ${benefit.split(" ").slice(-1)[0]}, skip the rest.`,
    `The ${benefit.split(" ").slice(-1)[0]} you asked for.`,
  ];

  return shuffleWith(patterns, input.seed ?? 11).slice(0, count);
}

/* ------------------------------------------------------------------ */
/* Cost arithmetic                                                     */
/* ------------------------------------------------------------------ */

export interface MeetingCost {
  perMinute: number;
  total: number;
  perAttendee: number;
  annualised: number;
  issues: string[];
}

export function meetingCost(input: { attendees: number; hourlyRate: number; minutes: number; occurrencesPerYear?: number }): MeetingCost {
  const attendees = Math.max(0, Math.floor(input.attendees));
  const rate = Math.max(0, input.hourlyRate);
  const minutes = Math.max(0, input.minutes);
  const issues: string[] = [];

  if (attendees === 0) issues.push("A meeting needs at least one attendee.");
  if (minutes > 480) issues.push("Longer than eight hours — consider splitting it into shorter sessions.");
  if (attendees > 30) issues.push("Above 30 attendees, most people contribute nothing: a written update is cheaper.");

  const perMinute = (attendees * rate) / 60;
  const total = perMinute * minutes;
  return {
    perMinute,
    total,
    perAttendee: attendees > 0 ? total / attendees : 0,
    annualised: total * Math.max(0, input.occurrencesPerYear ?? 0),
    issues,
  };
}

export function projectCost(input: {
  roles: { role: string; hours: number; rate: number }[];
  materials: number;
  overheadRate: number;
  contingencyRate: number;
}): {
  labour: number;
  materials: number;
  overhead: number;
  contingency: number;
  total: number;
  byRole: { role: string; hours: number; cost: number }[];
  issues: string[];
} {
  const byRole = input.roles
    .filter((role) => role.role.trim() || role.hours > 0)
    .map((role) => ({ role: role.role.trim() || "Role", hours: Math.max(0, role.hours), cost: Math.max(0, role.hours) * Math.max(0, role.rate) }));
  const labour = byRole.reduce((sum, role) => sum + role.cost, 0);
  const materials = Math.max(0, input.materials);
  const overhead = (labour * Math.max(0, input.overheadRate)) / 100;
  const contingency = ((labour + materials + overhead) * Math.max(0, input.contingencyRate)) / 100;

  const issues: string[] = [];
  if (byRole.length === 0) issues.push("Add at least one role with hours.");
  if (input.contingencyRate < 10) issues.push("Projects under 10% contingency usually overrun; 15–20% is common for unfamiliar work.");

  return { labour, materials, overhead, contingency, total: labour + materials + overhead + contingency, byRole, issues };
}

export function employeeCost(input: {
  salary: number;
  employerTaxRate: number;
  benefits: number;
  equipment: number;
  trainingRate: number;
  hoursPerWeek?: number;
}): {
  salary: number;
  tax: number;
  benefits: number;
  equipment: number;
  training: number;
  total: number;
  monthly: number;
  trueHourly: number;
  multiplier: number;
  issues: string[];
} {
  const salary = Math.max(0, input.salary);
  const tax = (salary * Math.max(0, input.employerTaxRate)) / 100;
  const benefits = Math.max(0, input.benefits);
  const equipment = Math.max(0, input.equipment);
  const training = (salary * Math.max(0, input.trainingRate)) / 100;
  const total = salary + tax + benefits + equipment + training;
  const hours = Math.max(1, (input.hoursPerWeek ?? 40) * 46);

  const issues: string[] = [];
  if (salary === 0) issues.push("Enter the gross annual salary.");
  if (input.employerTaxRate === 0) issues.push("Employer contributions are never zero in practice — add pension and payroll taxes as a percentage.");

  return {
    salary,
    tax,
    benefits,
    equipment,
    training,
    total,
    monthly: total / 12,
    trueHourly: total / hours,
    multiplier: salary > 0 ? total / salary : Number.NaN,
    issues,
  };
}

export function hourlyRate(input: {
  targetIncome: number;
  billableHoursPerWeek: number;
  weeksPerYear: number;
  overheads: number;
  profitMargin: number;
}): {
  rate: number;
  dayRate: number;
  revenueNeeded: number;
  billableHours: number;
  issues: string[];
} {
  const weeks = Math.min(52, Math.max(1, input.weeksPerYear || 46));
  const hoursPerWeek = Math.max(1, input.billableHoursPerWeek || 20);
  const billableHours = weeks * hoursPerWeek;
  const margin = Math.min(80, Math.max(0, input.profitMargin || 0)) / 100;
  const revenueNeeded = (Math.max(0, input.targetIncome) + Math.max(0, input.overheads)) / Math.max(0.2, 1 - margin);
  const rate = revenueNeeded / billableHours;

  const issues: string[] = [];
  if (input.billableHoursPerWeek > 35) issues.push("Above 35 billable hours a week, admin and sales get squeezed out and the rate becomes fiction.");
  if (input.profitMargin === 0 || input.profitMargin === undefined) issues.push("A 0% margin means no buffer for slow months or reinvestment. 15–25% is typical.");

  return { rate, dayRate: rate * Math.min(8, hoursPerWeek), revenueNeeded, billableHours, issues };
}

/* ------------------------------------------------------------------ */
/* Generated documents                                                 */
/* ------------------------------------------------------------------ */

export interface SignatureInput {
  name: string;
  role: string;
  company: string;
  phone?: string;
  email?: string;
  website?: string;
  address?: string;
  pronouns?: string;
}

export function emailSignature(input: SignatureInput): { html: string; text: string } {
  const rows = [
    [input.name, input.role].filter(Boolean).join(" · "),
    input.company,
    input.phone ? `Phone: ${input.phone}` : "",
    input.email ? `Email: ${input.email}` : "",
    input.website ? `Web: ${input.website}` : "",
    input.address,
    input.pronouns ? `Pronouns: ${input.pronouns}` : "",
  ].filter((row): row is string => Boolean(row));

  const html = [
    '<table cellpadding="0" cellspacing="0" style="font-family: Arial, Helvetica, sans-serif; font-size: 13px; color: #14140f; line-height: 1.5;">',
    "  <tr>",
    '    <td style="padding-right: 16px; border-right: 2px solid #ff4b00;">',
    `      <strong style="font-size: 15px;">${escapeHtml(input.name || "Your name")}</strong><br />`,
    `      ${escapeHtml(input.role || "Your role")}<br />`,
    `      <span style="color: #5c5c52;">${escapeHtml(input.company || "Company")}</span>`,
    "    </td>",
    '    <td style="padding-left: 16px;">',
    ...rows
      .slice(2)
      .map((row) => `      <span style="color: #5c5c52;">${escapeHtml(row)}</span><br />`),
    "    </td>",
    "  </tr>",
    "</table>",
  ].join("\n");

  return { html, text: rows.join("\n") };
}

function escapeHtml(value: string): string {
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

export interface LetterInput {
  senderName: string;
  senderAddress: string;
  date: string;
  recipientName: string;
  recipientAddress: string;
  subject: string;
  body: string;
  closing?: string;
}

export function businessLetter(input: LetterInput): string {
  return [
    input.senderName.trim(),
    input.senderAddress.trim(),
    "",
    input.date,
    "",
    input.recipientName.trim(),
    input.recipientAddress.trim(),
    "",
    `Subject: ${input.subject.trim() || "Enquiry"}`,
    "",
    "Dear " + (input.recipientName.trim().split(" ")[0] || "Sir or Madam") + ",",
    "",
    input.body.trim() || "[Your message]",
    "",
    input.closing?.trim() || "Yours faithfully,",
    "",
    input.senderName.trim(),
  ].join("\n");
}

export interface ProposalInput {
  client: string;
  project: string;
  problem: string;
  approach: string;
  deliverables: string;
  timeline: string;
  price: string;
  validity: string;
}

export function proposalTemplate(input: ProposalInput): string {
  return `# Proposal: ${input.project || "Project"} for ${input.client || "Client"}

Prepared ${new Date().toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}
Valid for ${input.validity || "30 days"}

## 1. The problem

${input.problem || "[Describe the client's situation in their words, with the cost of leaving it unresolved.]"}

## 2. Approach

${input.approach || "[Explain what you will do, in what order, and why that order.]"}

## 3. Deliverables

${input.deliverables || "[List exactly what the client receives, with formats and quantities.]"}

## 4. Timeline

${input.timeline || "[Milestones with dates or weeks, and what you need from the client at each stage.]"}

## 5. Investment

${input.price || "[Price, what it includes, and what is excluded.]"}

## 6. Next steps

To proceed, reply to confirm and I will send the agreement and the first invoice. If anything above needs adjusting, tell me which section and I will revise it.
`;
}

/* ------------------------------------------------------------------ */
/* Marketing copy                                                      */
/* ------------------------------------------------------------------ */

export const PLATFORM_LIMITS: { id: string; label: string; limit: number; hashtagLimit?: number }[] = [
  { id: "x", label: "X / Twitter", limit: 280 },
  { id: "instagram", label: "Instagram", limit: 2200, hashtagLimit: 30 },
  { id: "linkedin", label: "LinkedIn", limit: 3000 },
  { id: "facebook", label: "Facebook", limit: 63206 },
  { id: "tiktok", label: "TikTok", limit: 2200 },
  { id: "threads", label: "Threads", limit: 500 },
];

export function normalizeHashtags(input: string): string[] {
  return [...new Set(
    input
      .split(/[\s,]+/)
      .map((tag) => tag.replace(/^#+/, "").replace(/[^a-zA-Z0-9_]/g, ""))
      .filter(Boolean)
      .map((tag) => `#${tag}`),
  )];
}

export function formatCaption(input: { text: string; hashtags: string; platform: string; lineBreaks?: boolean; cta?: string }): {
  caption: string;
  length: number;
  limit: number;
  over: boolean;
  hashtags: string[];
  notes: string[];
} {
  const platform = PLATFORM_LIMITS.find((item) => item.id === input.platform) ?? PLATFORM_LIMITS[0];
  const tags = normalizeHashtags(input.hashtags);
  const body = input.lineBreaks ? input.text.replace(/([.!?])\s+/g, "$1\n\n") : input.text;
  const cta = input.cta?.trim() ? `\n\n${input.cta.trim()}` : "";
  const tagLine = tags.length ? `\n\n${tags.join(" ")}` : "";
  const caption = `${body.trim()}${cta}${tagLine}`;

  const notes: string[] = [];
  if (caption.length > platform.limit) notes.push(`${caption.length - platform.limit} characters over the ${platform.label} limit.`);
  if (platform.hashtagLimit && tags.length > platform.hashtagLimit) notes.push(`${platform.label} accepts at most ${platform.hashtagLimit} hashtags.`);
  if (tags.length > 10) notes.push("More than ten hashtags reads as spam on most platforms.");
  if (caption.length > 0 && caption.length < 40) notes.push("Very short captions give the algorithm little to work with.");

  return { caption, length: caption.length, limit: platform.limit, over: caption.length > platform.limit, hashtags: tags, notes };
}

const HASHTAG_MODIFIERS = {
  broad: ["Tips", "Daily", "Life", "Love", "Community", "Inspiration"],
  niche: ["Tips", "ForBeginners", "Checklist", "Mistakes", "Guide", "Strategy", "Tools"],
  engagement: ["Chat", "Challenge", "Question", "Ideas", "Debate"],
};

export function generateHashtags(input: { topic: string; extra?: string; count?: number }): {
  broad: string[];
  niche: string[];
  branded: string[];
  all: string[];
} {
  const words = input.topic
    .trim()
    .split(/\s+/)
    .map((word) => word.replace(/[^a-zA-Z0-9]/g, ""))
    .filter(Boolean);
  const compact = words.map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join("");
  const single = words[0]?.toLowerCase() ?? "";
  const limit = Math.max(3, Math.min(30, input.count ?? 12));

  const second = words[1]?.toLowerCase() ?? "";
  const broad = [single ? `#${single}` : "", second ? `#${second}` : "", compact ? `#${compact}` : ""].filter(Boolean);
  const niche = [
    ...HASHTAG_MODIFIERS.niche.map((modifier) => (compact ? `#${compact}${modifier}` : "")),
    ...HASHTAG_MODIFIERS.engagement.map((modifier) => (single ? `#${single}${modifier}` : "")),
  ].filter(Boolean);
  const branded = (input.extra ?? "")
    .split(/[\s,]+/)
    .map((tag) => tag.replace(/^#+/, "").trim())
    .filter(Boolean)
    .map((tag) => `#${tag}`);

  const all = [...new Set([...broad, ...branded, ...niche])].slice(0, limit);
  return { broad, niche, branded, all };
}

const SPAM_WORDS = [
  "free", "act now", "limited time", "guarantee", "guaranteed", "winner", "cash", "urgent", "risk-free",
  "last chance", "click here", "buy now", "no cost", "cheap", "amazing", "100%", "!!", "$$", "credit card",
];

export function analyseSubjectLine(input: { subject: string; preview?: string }): {
  length: number;
  words: number;
  mobileVisible: number;
  spamWords: string[];
  notes: string[];
  score: number;
} {
  const subject = input.subject.trim();
  const lower = subject.toLowerCase();
  const spamWords = SPAM_WORDS.filter((word) => lower.includes(word));
  const notes: string[] = [];

  if (subject.length === 0) {
    notes.push("Enter a subject line.");
  } else {
    if (subject.length > 60) notes.push("Over 60 characters, most mobile clients truncate before the end.");
    else if (subject.length < 20) notes.push("Under 20 characters usually reads as vague.");

    if (spamWords.length) notes.push(`Contains ${spamWords.length} phrase${spamWords.length === 1 ? "" : "s"} filters commonly penalise.`);
    if (subject === subject.toUpperCase() && subject.length > 3) notes.push("ALL CAPS reads as shouting and filters treat it as a signal.");
    if (/[!?]{2,}/.test(subject)) notes.push("Repeated punctuation looks promotional.");
    if (!/\d/.test(subject)) notes.push("No number — specifics such as “3 ways” or “20 minutes” tend to lift opens.");
    if (input.preview?.trim() && input.preview.trim().slice(0, 30) === subject.slice(0, 30)) {
      notes.push("The preview text repeats the subject; use it to add information instead.");
    }
  }

  const score = Math.max(
    0,
    Math.min(
      100,
      70 + (subject.length >= 20 && subject.length <= 60 ? 15 : 0) + (/\d/.test(subject) ? 8 : 0) - spamWords.length * 15 - (subject === subject.toUpperCase() && subject.length > 3 ? 20 : 0),
    ),
  );

  return {
    length: subject.length,
    words: subject ? subject.split(/\s+/).filter(Boolean).length : 0,
    mobileVisible: Math.min(subject.length, 40),
    spamWords,
    notes,
    score,
  };
}

export function campaignRoi(input: { spend: number; revenue: number; leads?: number; conversions?: number }): {
  profit: number;
  roi: number;
  roas: number;
  cpl: number | null;
  cpa: number | null;
  issues: string[];
} {
  const spend = Math.max(0, input.spend);
  const revenue = Math.max(0, input.revenue);
  const issues: string[] = [];
  if (spend === 0) issues.push("Enter the campaign spend — ROI is undefined without it.");
  if (revenue === 0) issues.push("No revenue recorded: this is a cost, not a campaign result yet.");

  const profit = revenue - spend;
  const leads = Number(input.leads) || 0;
  const conversions = Number(input.conversions) || 0;

  return {
    profit,
    roi: spend > 0 ? (profit / spend) * 100 : Number.NaN,
    roas: spend > 0 ? revenue / spend : Number.NaN,
    cpl: leads > 0 ? spend / leads : null,
    cpa: conversions > 0 ? spend / conversions : null,
    issues,
  };
}

export function marketingBudget(input: { total: number; channels: { name: string; percent: number }[] }): {
  rows: { name: string; percent: number; amount: number }[];
  allocated: number;
  remaining: number;
  issues: string[];
} {
  const total = Math.max(0, input.total);
  const rows = input.channels.map((channel) => ({
    name: channel.name.trim() || "Channel",
    percent: Number(channel.percent) || 0,
    amount: (total * (Number(channel.percent) || 0)) / 100,
  }));
  const allocatedPercent = rows.reduce((sum, row) => sum + row.percent, 0);
  const allocated = rows.reduce((sum, row) => sum + row.amount, 0);
  const issues: string[] = [];

  if (Math.abs(allocatedPercent - 100) > 0.01) {
    issues.push(`Allocations add up to ${allocatedPercent.toFixed(1)}% of the budget, not 100%.`);
  }
  if (rows.some((row) => row.percent < 0)) issues.push("A negative allocation is not a budget line.");

  return { rows, allocated, remaining: total - allocated, issues };
}

export function productPricing(input: { cost: number; mode: "margin" | "markup" | "price"; value: number }): {
  price: number;
  margin: number;
  markup: number;
  profit: number;
  issues: string[];
} {
  const cost = Math.max(0, input.cost);
  const issues: string[] = [];
  let price: number;

  if (input.mode === "margin") {
    const margin = Math.min(99, Math.max(0, input.value));
    price = cost / (1 - margin / 100);
  } else if (input.mode === "markup") {
    price = cost * (1 + Math.max(0, input.value) / 100);
  } else {
    price = Math.max(0, input.value);
  }

  const profit = price - cost;
  if (price <= cost) issues.push("The price does not cover unit cost.");
  if (!Number.isFinite(price)) issues.push("That margin leaves no room for a price.");

  return {
    price,
    margin: price > 0 ? (profit / price) * 100 : Number.NaN,
    markup: cost > 0 ? (profit / cost) * 100 : Number.NaN,
    profit,
    issues,
  };
}

/* ------------------------------------------------------------------ */
/* Content planning                                                    */
/* ------------------------------------------------------------------ */

export interface CalendarEntry {
  date: string;
  day: string;
  channel: string;
  idea: string;
}

const CONTENT_IDEAS = [
  "How-to: solve one specific problem",
  "Behind the scenes of a recent job",
  "Customer question answered in detail",
  "Myth versus what the data says",
  "Checklist the audience can save",
  "Before and after with the reasoning",
  "Tool or template available for free",
  "Common mistake and how to avoid it",
  "Price or process transparency post",
  "Quick tip with a visual",
  "Case study with numbers",
  "Poll or question to the audience",
];

export function contentCalendar(input: {
  startDate: string;
  weeks: number;
  postsPerWeek: number;
  channels: string[];
  seed?: number;
}): CalendarEntry[] {
  const start = new Date(`${input.startDate}T00:00:00`);
  if (Number.isNaN(start.getTime())) return [];

  const weeks = Math.max(1, Math.min(52, input.weeks || 4));
  const postsPerWeek = Math.max(1, Math.min(7, input.postsPerWeek || 3));
  const channels = input.channels.length ? input.channels : ["Blog"];
  const ideas = shuffleWith(CONTENT_IDEAS, input.seed ?? 5);
  const spacing = Math.max(1, Math.floor(7 / postsPerWeek));

  const entries: CalendarEntry[] = [];
  for (let week = 0; week < weeks; week += 1) {
    for (let post = 0; post < postsPerWeek; post += 1) {
      const date = new Date(start.getTime());
      date.setDate(date.getDate() + week * 7 + post * spacing);
      const index = entries.length;
      entries.push({
        date: `${date.getDate()} ${date.toLocaleDateString("en-GB", { month: "short" })}`,
        day: date.toLocaleDateString("en-GB", { weekday: "short" }),
        channel: channels[index % channels.length],
        idea: ideas[index % ideas.length],
      });
    }
  }

  return entries;
}
