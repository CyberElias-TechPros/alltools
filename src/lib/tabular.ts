/**
 * JSON ⇄ CSV conversion.
 *
 * The CSV reader follows RFC 4180: quoted fields may contain the delimiter,
 * doubled quotes and line breaks. The writer only quotes when it has to, so
 * the output opens cleanly in Excel, Numbers, Google Sheets and pandas.
 */

export interface CsvParseResult {
  rows: string[][];
  /** True when the file ended inside a quoted field. */
  unterminatedQuote: boolean;
}

export function parseCsv(input: string, delimiter = ","): CsvParseResult {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let quoted = false;
  let index = 0;
  let unterminatedQuote = false;

  const pushField = () => {
    row.push(field);
    field = "";
  };
  const pushRow = () => {
    pushField();
    rows.push(row);
    row = [];
  };

  // Strip a UTF-8 BOM — Excel writes one and it otherwise becomes part of the
  // first header cell.
  const text = input.charCodeAt(0) === 0xfeff ? input.slice(1) : input;

  while (index < text.length) {
    const char = text[index];

    if (quoted) {
      if (char === '"') {
        if (text[index + 1] === '"') {
          field += '"';
          index += 2;
          continue;
        }
        quoted = false;
        index += 1;
        continue;
      }
      field += char;
      index += 1;
      continue;
    }

    if (char === '"' && field === "") {
      quoted = true;
      index += 1;
      continue;
    }

    if (char === delimiter) {
      pushField();
      index += 1;
      continue;
    }

    if (char === "\r" && text[index + 1] === "\n") {
      pushRow();
      index += 2;
      continue;
    }

    if (char === "\n" || char === "\r") {
      pushRow();
      index += 1;
      continue;
    }

    field += char;
    index += 1;
  }

  if (quoted) unterminatedQuote = true;
  if (field !== "" || row.length > 0) pushRow();

  // Trailing blank line produces a single empty cell row; drop it.
  while (rows.length > 0 && rows[rows.length - 1].length === 1 && rows[rows.length - 1][0] === "") {
    rows.pop();
  }

  return { rows, unterminatedQuote };
}

function escapeCell(value: string, delimiter: string): string {
  const needsQuotes =
    value.includes(delimiter) ||
    value.includes('"') ||
    value.includes("\n") ||
    value.includes("\r") ||
    /^\s|\s$/.test(value);
  return needsQuotes ? `"${value.replace(/"/g, '""')}"` : value;
}

type Primitive = string | number | boolean | null;

function flattenObject(
  value: Record<string, unknown>,
  prefix = "",
  target: Record<string, Primitive> = {},
): Record<string, Primitive> {
  for (const [key, child] of Object.entries(value)) {
    const path = prefix ? `${prefix}.${key}` : key;
    if (child === null || child === undefined) {
      target[path] = child === null ? null : "";
    } else if (Array.isArray(child) || typeof child === "string" || typeof child === "number" || typeof child === "boolean") {
      target[path] = Array.isArray(child) ? JSON.stringify(child) : child;
    } else if (typeof child === "object") {
      flattenObject(child as Record<string, unknown>, path, target);
    } else {
      target[path] = String(child);
    }
  }
  return target;
}

export interface JsonToCsvOptions {
  delimiter?: string;
  /** Turn nested objects into `parent.child` columns. */
  flatten?: boolean;
  /** Quote every cell, not just those that need it. */
  quoteAll?: boolean;
}

export interface JsonToCsvResult {
  csv: string;
  columns: string[];
  rowCount: number;
  warnings: string[];
}

export function jsonToCsv(input: string, options: JsonToCsvOptions = {}): JsonToCsvResult {
  const delimiter = options.delimiter ?? ",";
  const flatten = options.flatten ?? true;
  const warnings: string[] = [];

  let parsed: unknown;
  try {
    parsed = JSON.parse(input);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Invalid JSON";
    throw new Error(`That is not valid JSON — ${message}`);
  }

  const records: Record<string, Primitive>[] = [];

  const toRecord = (value: unknown): Record<string, Primitive> => {
    if (value === null || typeof value !== "object") return { value: value as Primitive };
    if (Array.isArray(value)) return { value: JSON.stringify(value) };
    return flatten
      ? flattenObject(value as Record<string, unknown>)
      : Object.fromEntries(
          Object.entries(value as Record<string, unknown>).map(([key, child]) => [
            key,
            child !== null && typeof child === "object" ? JSON.stringify(child) : (child as Primitive),
          ]),
        );
  };

  if (Array.isArray(parsed)) {
    if (parsed.length === 0) warnings.push("The array is empty, so only the header row was produced.");
    for (const item of parsed) records.push(toRecord(item));
  } else if (parsed !== null && typeof parsed === "object") {
    const entries = Object.entries(parsed as Record<string, unknown>);
    const allArrays = entries.length > 0 && entries.every(([, value]) => Array.isArray(value));
    if (allArrays) {
      // Column-oriented JSON: { name: [...], age: [...] }
      const columns = entries.map(([key]) => key);
      const length = Math.max(...entries.map(([, value]) => (value as unknown[]).length));
      for (let index = 0; index < length; index += 1) {
        const record: Record<string, Primitive> = {};
        entries.forEach(([key, value], column) => {
          const cell = (value as unknown[])[index];
          record[columns[column]] = cell === undefined || cell === null
            ? ""
            : typeof cell === "object"
              ? JSON.stringify(cell)
              : (cell as Primitive);
        });
        records.push(record);
      }
    } else {
      records.push(toRecord(parsed));
    }
  } else {
    records.push({ value: parsed as Primitive });
  }

  const columns: string[] = [];
  const seen = new Set<string>();
  for (const record of records) {
    for (const key of Object.keys(record)) {
      if (!seen.has(key)) {
        seen.add(key);
        columns.push(key);
      }
    }
  }

  const cellText = (value: Primitive | undefined): string => {
    if (value === undefined || value === null) return "";
    if (typeof value === "object") return JSON.stringify(value);
    return String(value);
  };

  const lines = [columns.map((column) => escapeCell(column, delimiter)).join(delimiter)];
  for (const record of records) {
    const cells = columns.map((column) => cellText(record[column]));
    lines.push(
      options.quoteAll
        ? cells.map((cell) => `"${cell.replace(/"/g, '""')}"`).join(delimiter)
        : cells.map((cell) => escapeCell(cell, delimiter)).join(delimiter),
    );
  }

  return { csv: lines.join("\n"), columns, rowCount: records.length, warnings };
}

export interface CsvToJsonOptions {
  delimiter?: string;
  /** Treat the first row as field names. */
  header?: boolean;
  indent?: number;
  /** Parse values that look like numbers or booleans into real JSON types. */
  inferTypes?: boolean;
}

export interface CsvToJsonResult {
  json: string;
  columns: string[];
  rowCount: number;
  warnings: string[];
}

export function csvToJson(input: string, options: CsvToJsonOptions = {}): CsvToJsonResult {
  const delimiter = options.delimiter ?? ",";
  const useHeader = options.header ?? true;
  const indent = options.indent ?? 2;
  const inferTypes = options.inferTypes ?? true;
  const warnings: string[] = [];

  const { rows, unterminatedQuote } = parseCsv(input, delimiter);
  if (unterminatedQuote) warnings.push("The file ends inside a quoted field — the last cell may be truncated.");
  if (rows.length === 0) {
    return { json: "[]", columns: [], rowCount: 0, warnings: ["No rows found."] };
  }

  const widest = Math.max(...rows.map((row) => row.length));
  const ragged = rows.filter((row) => row.length !== widest).length;
  if (ragged > 0) warnings.push(`${ragged} row(s) had a different number of cells and were padded with empty values.`);

  const headers = useHeader
    ? rows[0].map((cell, index) => cell.trim() || `column_${index + 1}`)
    : Array.from({ length: widest }, (_, index) => `column_${index + 1}`);

  const duplicateHeaders = headers.length !== new Set(headers).size;
  if (duplicateHeaders) warnings.push("Duplicate column names were kept — later columns overwrite earlier ones in object output.");

  const convert = (cell: string): unknown => {
    if (!inferTypes) return cell;
    const trimmed = cell.trim();
    if (trimmed === "") return "";
    if (trimmed === "true") return true;
    if (trimmed === "false") return false;
    if (trimmed === "null") return null;
    if (/^-?(0|[1-9]\d*)(\.\d+)?([eE][+-]?\d+)?$/.test(trimmed)) return Number(trimmed);
    return cell;
  };

  const body = useHeader ? rows.slice(1) : rows;
  const data = body.map((row) => {
    if (!useHeader) return row.map(convert);
    const record: Record<string, unknown> = {};
    headers.forEach((header, index) => {
      record[header] = convert(row[index] ?? "");
    });
    return record;
  });

  return {
    json: JSON.stringify(data, null, Math.max(0, indent)),
    columns: headers,
    rowCount: data.length,
    warnings,
  };
}

/* ------------------------------------------------------------------ */
/* JSON inspection (validator tool)                                    */
/* ------------------------------------------------------------------ */

export interface JsonStats {
  valid: boolean;
  error?: { message: string; line: number; column: number };
  type: string;
  nodes: number;
  depth: number;
  keys: number;
  bytes: number;
}

export function inspectJson(input: string): JsonStats {
  const bytes = new TextEncoder().encode(input).length;
  if (!input.trim()) {
    return { valid: false, error: { message: "There is nothing to validate.", line: 1, column: 1 }, type: "", nodes: 0, depth: 0, keys: 0, bytes };
  }
  let parsed: unknown;
  try {
    parsed = JSON.parse(input);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Invalid JSON";
    // V8 reports "… at position 123 (line 4 column 7)".
    const positionMatch = /position (\d+)/.exec(message);
    let line = 1;
    let column = 1;
    if (positionMatch) {
      const position = Number(positionMatch[1]);
      const before = input.slice(0, position).split("\n");
      line = before.length;
      column = before[before.length - 1].length + 1;
    }
    return {
      valid: false,
      error: { message: message.replace(/^JSON\.parse: /, ""), line, column },
      type: "",
      nodes: 0,
      depth: 0,
      keys: 0,
      bytes,
    };
  }

  let nodes = 0;
  let keys = 0;
  let depth = 0;

  const walk = (value: unknown, level: number) => {
    nodes += 1;
    depth = Math.max(depth, level);
    if (Array.isArray(value)) {
      for (const child of value) walk(child, level + 1);
    } else if (value !== null && typeof value === "object") {
      for (const child of Object.values(value as Record<string, unknown>)) {
        keys += 1;
        walk(child, level + 1);
      }
    }
  };
  walk(parsed, 1);

  const type = Array.isArray(parsed) ? "array" : parsed === null ? "null" : typeof parsed;
  return { valid: true, type, nodes, depth, keys, bytes };
}
