export interface SearchableTool {
  slug: string;
  name: string;
  tagline: string;
  category: string;
  keywords: string[];
  popularity?: number;
}

function normalise(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/** Cheap in-order subsequence test used as a last-resort fuzzy match. */
function isSubsequence(needle: string, haystack: string): boolean {
  let i = 0;
  for (let j = 0; j < haystack.length && i < needle.length; j++) {
    if (haystack[j] === needle[i]) i++;
  }
  return i === needle.length;
}

export function scoreTool(tool: SearchableTool, query: string): number {
  const q = normalise(query);
  if (!q) return tool.popularity ?? 0;

  const name = normalise(tool.name);
  const tagline = normalise(tool.tagline);
  const category = normalise(tool.category);
  const keywords = tool.keywords.map(normalise);

  let score = 0;

  if (name === q) score += 120;
  else if (name.startsWith(q)) score += 80;
  else if (name.includes(q)) score += 55;

  for (const keyword of keywords) {
    if (keyword === q) score += 50;
    else if (keyword.startsWith(q)) score += 32;
    else if (keyword.includes(q)) score += 18;
  }

  if (tagline.includes(q)) score += 14;
  if (category.includes(q)) score += 8;

  const tokens = q.split(" ").filter(Boolean);
  if (tokens.length > 1) {
    const haystack = `${name} ${tagline} ${keywords.join(" ")} ${category}`;
    const matched = tokens.filter((token) => haystack.includes(token));
    score += matched.length * 9;
  }

  if (score === 0 && q.length >= 3) {
    if (isSubsequence(q, name)) score += 6;
    else if (keywords.some((keyword) => isSubsequence(q, keyword))) score += 4;
  }

  return score;
}

export function searchTools<T extends SearchableTool>(tools: T[], query: string, limit = 8): T[] {
  const trimmed = query.trim();
  if (!trimmed) {
    return [...tools]
      .sort((a, b) => (b.popularity ?? 0) - (a.popularity ?? 0))
      .slice(0, limit);
  }

  return tools
    .map((tool) => ({ tool, score: scoreTool(tool, trimmed) }))
    .filter((entry) => entry.score > 0)
    .sort(
      (a, b) =>
        b.score - a.score ||
        (b.tool.popularity ?? 0) - (a.tool.popularity ?? 0) ||
        a.tool.name.localeCompare(b.tool.name),
    )
    .slice(0, limit)
    .map((entry) => entry.tool);
}
