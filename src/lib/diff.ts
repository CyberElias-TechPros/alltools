export type DiffKind = "same" | "added" | "removed";

export interface DiffPart {
  kind: DiffKind;
  value: string;
}

export interface DiffLine {
  kind: DiffKind;
  text: string;
  leftNumber?: number;
  rightNumber?: number;
  words?: DiffPart[];
}

/** Longest common subsequence table for two string arrays. */
function lcsMatrix(a: string[], b: string[]): number[][] {
  const rows = a.length + 1;
  const cols = b.length + 1;
  const table: number[][] = Array.from({ length: rows }, () => new Array<number>(cols).fill(0));

  for (let i = a.length - 1; i >= 0; i--) {
    for (let j = b.length - 1; j >= 0; j--) {
      table[i][j] =
        a[i] === b[j] ? table[i + 1][j + 1] + 1 : Math.max(table[i + 1][j], table[i][j + 1]);
    }
  }
  return table;
}

export function diffLines(
  left: string,
  right: string,
  options: { ignoreWhitespace?: boolean } = {},
): { lines: DiffLine[]; added: number; removed: number } {
  const normalise = (line: string) =>
    options.ignoreWhitespace ? line.replace(/\s+/g, " ").trim() : line;

  const a = left.replace(/\r\n?/g, "\n").split("\n");
  const b = right.replace(/\r\n?/g, "\n").split("\n");
  const table = lcsMatrix(a.map(normalise), b.map(normalise));

  const lines: DiffLine[] = [];
  let i = 0;
  let j = 0;
  let leftNumber = 1;
  let rightNumber = 1;
  let added = 0;
  let removed = 0;

  while (i < a.length && j < b.length) {
    if (normalise(a[i]) === normalise(b[j])) {
      lines.push({ kind: "same", text: a[i], leftNumber: leftNumber++, rightNumber: rightNumber++ });
      i++;
      j++;
    } else if (table[i + 1][j] >= table[i][j + 1]) {
      lines.push({ kind: "removed", text: a[i], leftNumber: leftNumber++ });
      removed++;
      i++;
    } else {
      lines.push({ kind: "added", text: b[j], rightNumber: rightNumber++ });
      added++;
      j++;
    }
  }
  while (i < a.length) {
    lines.push({ kind: "removed", text: a[i], leftNumber: leftNumber++ });
    removed++;
    i++;
  }
  while (j < b.length) {
    lines.push({ kind: "added", text: b[j], rightNumber: rightNumber++ });
    added++;
    j++;
  }

  return { lines, added, removed };
}

/** Word-level comparison used to highlight changes inside replaced lines. */
export function diffWords(left: string, right: string): DiffPart[] {
  const tokenise = (value: string) => value.split(/(\s+)/).filter((token) => token !== "");
  const a = tokenise(left);
  const b = tokenise(right);
  const table = lcsMatrix(a, b);

  const parts: DiffPart[] = [];
  let i = 0;
  let j = 0;

  const push = (kind: DiffKind, value: string) => {
    const last = parts[parts.length - 1];
    if (last && last.kind === kind) last.value += value;
    else parts.push({ kind, value });
  };

  while (i < a.length && j < b.length) {
    if (a[i] === b[j]) {
      push("same", a[i]);
      i++;
      j++;
    } else if (table[i + 1][j] >= table[i][j + 1]) {
      push("removed", a[i++]);
    } else {
      push("added", b[j++]);
    }
  }
  while (i < a.length) push("removed", a[i++]);
  while (j < b.length) push("added", b[j++]);

  return parts;
}
