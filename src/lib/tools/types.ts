export type CategoryId =
  | "text"
  | "calculators"
  | "developer"
  | "everyday"
  | "finance"
  | "seo"
  | "security"
  | "images"
  | "pdf"
  | "education"
  | "internet"
  | "business";

export type ToolStatus = "live" | "planned";

export interface ToolExample {
  title: string;
  steps: string[];
  result: string;
}

export interface ToolFaq {
  q: string;
  a: string;
}

export interface ToolContent {
  /** 1–2 short paragraphs that explain the problem the tool solves. */
  intro: string[];
  /** Numbered, task-oriented instructions. */
  howTo: string[];
  /** How the result is produced: formula, rule or algorithm. */
  method?: {
    title?: string;
    paragraphs: string[];
    formula?: string;
  };
  /** Two or three concrete, worked examples. */
  examples: ToolExample[];
  /** Honest boundaries of the tool. */
  limitations: string[];
  faqs: ToolFaq[];
}

export interface ToolDefinition {
  slug: string;
  name: string;
  category: CategoryId;
  /** One-line summary used on cards and in search results. */
  tagline: string;
  /** Primary search intent this page is written to satisfy. */
  intent: string;
  keywords: string[];
  status: ToolStatus;
  /** What the visitor can do with the output. */
  actions: Array<"copy" | "download" | "share" | "print">;
  /** How many seconds a typical task takes — used for the ease score. */
  effort: "instant" | "quick" | "guided";
  /** Relative ordering weight for "popular" lists (higher first). */
  popularity: number;
  addedAt: string;
  seoTitle: string;
  seoDescription: string;
  content: ToolContent;
}

export interface CategoryDefinition {
  id: CategoryId;
  name: string;
  shortName: string;
  tagline: string;
  description: string;
  /** Longer, original category intro used on the category page. */
  intro: string[];
  accent: string;
  status: ToolStatus;
  /** Tools that are documented on this site but not yet built. */
  plannedTools: string[];
}
