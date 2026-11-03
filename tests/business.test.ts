import { describe, expect, it } from "vitest";
import {
  analyseSubjectLine,
  businessLetter,
  campaignRoi,
  contentCalendar,
  emailSignature,
  employeeCost,
  formatCaption,
  generateBusinessNames,
  generateHashtags,
  generateSlogans,
  hourlyRate,
  invoiceTotals,
  marketingBudget,
  meetingCost,
  normalizeHashtags,
  productPricing,
  projectCost,
  proposalTemplate,
  receiptText,
} from "@/lib/business";

describe("invoice totals", () => {
  const items = [
    { description: "Design", quantity: 2, unitPrice: 150 },
    { description: "Hosting", quantity: 1, unitPrice: 50 },
  ];

  it("adds lines, discount and tax", () => {
    const totals = invoiceTotals({ items, taxRate: 20, discountPercent: 10 });
    expect(totals.subtotal).toBe(350);
    expect(totals.discount).toBe(35);
    expect(totals.tax).toBeCloseTo(63, 5);
    expect(totals.total).toBeCloseTo(378, 5);
  });

  it("applies a flat discount", () => {
    const totals = invoiceTotals({ items, taxRate: 0, discountFlat: 100 });
    expect(totals.total).toBe(250);
  });

  it("caps a discount at the subtotal", () => {
    const totals = invoiceTotals({ items, taxRate: 0, discountFlat: 999 });
    expect(totals.total).toBe(0);
    expect(totals.issues.length).toBeGreaterThan(0);
  });

  it("flags an empty invoice", () => {
    expect(invoiceTotals({ items: [], taxRate: 20 }).issues.length).toBe(1);
  });

  it("builds a fixed-width receipt", () => {
    const text = receiptText({
      storeName: "Acme",
      reference: "001",
      date: "4 March 2025",
      items,
      taxRate: 20,
      paymentMethod: "Card",
    });
    expect(text).toContain("Acme");
    expect(text).toContain("TOTAL");
    expect(text).toContain("Paid by Card");
    expect(text.split("\n").every((line) => line.length <= 42)).toBe(true);
  });
});

describe("name and slogan generators", () => {
  it("is deterministic for a seed", () => {
    const a = generateBusinessNames({ keyword: "coffee", style: "modern", count: 6, seed: 3 });
    const b = generateBusinessNames({ keyword: "coffee", style: "modern", count: 6, seed: 3 });
    expect(a).toEqual(b);
    expect(a).toHaveLength(6);
    expect(new Set(a).size).toBe(a.length);
    expect(a.every((name) => name.toLowerCase().includes("coffee"))).toBe(true);
  });

  it("produces different sets for different seeds", () => {
    const a = generateBusinessNames({ keyword: "coffee", style: "compound", count: 6, seed: 1 });
    const b = generateBusinessNames({ keyword: "coffee", style: "compound", count: 6, seed: 2 });
    expect(a.join()).not.toBe(b.join());
  });

  it("builds slogans from the benefit", () => {
    const slogans = generateSlogans({ brand: "Acme", benefit: "faster invoicing", count: 4 });
    expect(slogans).toHaveLength(4);
    expect(slogans.some((line) => line.includes("Acme") || line.toLowerCase().includes("invoicing"))).toBe(true);
  });
});

describe("cost arithmetic", () => {
  it("prices a meeting", () => {
    const cost = meetingCost({ attendees: 6, hourlyRate: 40, minutes: 60, occurrencesPerYear: 50 });
    expect(cost.total).toBe(240);
    expect(cost.perMinute).toBe(4);
    expect(cost.annualised).toBe(12000);
  });

  it("prices a project with overhead and contingency", () => {
    const cost = projectCost({
      roles: [
        { role: "Designer", hours: 10, rate: 50 },
        { role: "Developer", hours: 20, rate: 70 },
      ],
      materials: 100,
      overheadRate: 10,
      contingencyRate: 20,
    });
    expect(cost.labour).toBe(1900);
    expect(cost.overhead).toBeCloseTo(190, 5);
    expect(cost.contingency).toBeCloseTo(438, 5);
    expect(cost.total).toBeCloseTo(2628, 5);
  });

  it("prices an employee's true cost", () => {
    const cost = employeeCost({ salary: 50000, employerTaxRate: 14, benefits: 3000, equipment: 2000, trainingRate: 2 });
    expect(cost.tax).toBe(7000);
    expect(cost.training).toBe(1000);
    expect(cost.total).toBe(63000);
    expect(cost.monthly).toBeCloseTo(5250, 5);
    expect(cost.multiplier).toBeCloseTo(1.26, 5);
  });

  it("derives an hourly rate from an income target", () => {
    const result = hourlyRate({ targetIncome: 60000, billableHoursPerWeek: 25, weeksPerYear: 46, overheads: 10000, profitMargin: 20 });
    expect(result.billableHours).toBe(1150);
    expect(result.revenueNeeded).toBeCloseTo(87500, 5);
    expect(result.rate).toBeCloseTo(76.087, 2);
  });
});

describe("generated documents", () => {
  it("escapes the signature and keeps the details", () => {
    const signature = emailSignature({ name: "Ada <Lovelace>", role: "Engineer", company: "Analytical", email: "ada@example.com" });
    expect(signature.html).toContain("&lt;Lovelace&gt;");
    expect(signature.html).toContain("ada@example.com");
    expect(signature.text).toContain("Ada <Lovelace> · Engineer");
  });

  it("lays out a business letter", () => {
    const letter = businessLetter({
      senderName: "Acme Ltd",
      senderAddress: "1 Market Street",
      date: "4 March 2025",
      recipientName: "Jane Doe",
      recipientAddress: "2 High Street",
      subject: "Refund request",
      body: "Paragraph one.",
    });
    expect(letter).toContain("Dear Jane,");
    expect(letter).toContain("Subject: Refund request");
    expect(letter.trim().endsWith("Acme Ltd")).toBe(true);
  });

  it("drafts a proposal with every section", () => {
    const proposal = proposalTemplate({ client: "Acme", project: "Website", problem: "Old site", approach: "Rebuild", deliverables: "Pages", timeline: "6 weeks", price: "5000", validity: "30 days" });
    expect(proposal).toContain("# Proposal: Website for Acme");
    expect(proposal).toContain("## 5. Investment");
    expect(proposal).toContain("30 days");
  });
});

describe("captions and hashtags", () => {
  it("normalises hashtags", () => {
    expect(normalizeHashtags("#coffee, coffee #Beans  ##Cups")).toEqual(["#coffee", "#Beans", "#Cups"]);
  });

  it("counts against the platform limit", () => {
    const result = formatCaption({ text: "A".repeat(270), hashtags: "#one #two", platform: "x" });
    expect(result.over).toBe(true);
    expect(result.limit).toBe(280);
    expect(result.notes.length).toBeGreaterThan(0);
  });

  it("adds a call to action and hashtags", () => {
    const result = formatCaption({ text: "Hello.", hashtags: "coffee", platform: "instagram", cta: "Link in bio" });
    expect(result.caption).toContain("Link in bio");
    expect(result.caption).toContain("#coffee");
    expect(result.length).toBe(result.caption.length);
  });

  it("generates tiered hashtags", () => {
    const tags = generateHashtags({ topic: "specialty coffee", extra: "acmecoffee" });
    expect(tags.broad).toContain("#coffee");
    expect(tags.niche).toContain("#SpecialtyCoffeeTips");
    expect(tags.branded).toEqual(["#acmecoffee"]);
    expect(new Set(tags.all).size).toBe(tags.all.length);
  });
});

describe("email subject analysis", () => {
  it("scores a specific subject higher than a spammy one", () => {
    const good = analyseSubjectLine({ subject: "3 ways to cut invoice time by half" });
    const bad = analyseSubjectLine({ subject: "FREE CASH GUARANTEED!! ACT NOW" });
    expect(good.score).toBeGreaterThan(bad.score);
    expect(bad.spamWords.length).toBeGreaterThan(2);
    expect(good.notes.some((note) => note.includes("ALL CAPS"))).toBe(false);
  });

  it("flags length problems", () => {
    expect(analyseSubjectLine({ subject: "x".repeat(80) }).notes.length).toBeGreaterThan(0);
    expect(analyseSubjectLine({ subject: "" }).notes.length).toBe(1);
  });
});

describe("campaign maths", () => {
  it("computes ROI, ROAS and costs per lead", () => {
    const result = campaignRoi({ spend: 1000, revenue: 3000, leads: 100, conversions: 25 });
    expect(result.roi).toBe(200);
    expect(result.roas).toBe(3);
    expect(result.profit).toBe(2000);
    expect(result.cpl).toBe(10);
    expect(result.cpa).toBe(40);
  });

  it("warns about zero spend", () => {
    expect(campaignRoi({ spend: 0, revenue: 100 }).issues.length).toBeGreaterThan(0);
  });

  it("budgets across channels", () => {
    const result = marketingBudget({ total: 10000, channels: [{ name: "Search", percent: 50 }, { name: "Social", percent: 40 }] });
    expect(result.allocated).toBe(9000);
    expect(result.remaining).toBe(1000);
    expect(result.issues.length).toBe(1);
  });

  it("prices a product from margin", () => {
    const result = productPricing({ cost: 40, mode: "margin", value: 60 });
    expect(result.price).toBeCloseTo(100, 5);
    expect(result.margin).toBeCloseTo(60, 5);
    expect(result.markup).toBeCloseTo(150, 5);
  });

  it("prices from markup and flags a loss", () => {
    expect(productPricing({ cost: 40, mode: "markup", value: 50 }).price).toBe(60);
    expect(productPricing({ cost: 40, mode: "price", value: 30 }).issues.length).toBe(1);
  });
});

describe("content calendar", () => {
  it("spaces posts across weeks and rotates channels", () => {
    const entries = contentCalendar({ startDate: "2025-03-03", weeks: 2, postsPerWeek: 3, channels: ["Blog", "Social"] });
    expect(entries).toHaveLength(6);
    expect(entries[0].channel).toBe("Blog");
    expect(entries[1].channel).toBe("Social");
    expect(entries[3].date).not.toBe(entries[0].date);
  });

  it("returns nothing for an invalid date", () => {
    expect(contentCalendar({ startDate: "not-a-date", weeks: 2, postsPerWeek: 2, channels: ["Blog"] })).toEqual([]);
  });
});
