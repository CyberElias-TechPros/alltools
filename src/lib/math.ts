/**
 * Number theory, fractions, combinatorics and a small expression evaluator.
 *
 * Everything here is pure and runs in the browser. The expression parser is a
 * shunting-yard implementation rather than `eval`, so pasted text can never
 * execute code.
 */

/* ------------------------------------------------------------------ */
/* Integers                                                            */
/* ------------------------------------------------------------------ */

export function gcd(a: number, b: number): number {
  let x = Math.abs(Math.trunc(a));
  let y = Math.abs(Math.trunc(b));
  while (y !== 0) {
    [x, y] = [y, x % y];
  }
  return x;
}

export function gcdAll(values: number[]): number {
  return values.reduce((acc, value) => gcd(acc, value));
}

export function lcm(a: number, b: number): number {
  if (a === 0 || b === 0) return 0;
  return Math.abs(a * b) / gcd(a, b);
}

export function lcmAll(values: number[]): number {
  return values.reduce((acc, value) => lcm(acc, value));
}

export function isPrime(n: number): boolean {
  if (!Number.isInteger(n) || n < 2) return false;
  if (n % 2 === 0) return n === 2;
  if (n % 3 === 0) return n === 3;
  for (let i = 5; i * i <= n; i += 6) {
    if (n % i === 0 || n % (i + 2) === 0) return false;
  }
  return true;
}

export function primeFactors(n: number): number[] {
  const factors: number[] = [];
  let rest = Math.abs(Math.trunc(n));
  if (rest < 2) return factors;
  for (let divisor = 2; divisor * divisor <= rest; divisor += 1) {
    while (rest % divisor === 0) {
      factors.push(divisor);
      rest /= divisor;
    }
  }
  if (rest > 1) factors.push(rest);
  return factors;
}

export function divisors(n: number): number[] {
  const value = Math.abs(Math.trunc(n));
  if (value < 1) return [];
  const small: number[] = [];
  const large: number[] = [];
  for (let i = 1; i * i <= value; i += 1) {
    if (value % i === 0) {
      small.push(i);
      if (i !== value / i) large.unshift(value / i);
    }
  }
  return [...small, ...large];
}

export function factorial(n: number): bigint {
  if (!Number.isInteger(n) || n < 0 || n > 5000) {
    throw new Error("Factorial needs a whole number between 0 and 5000.");
  }
  let result = 1n;
  for (let i = 2n; i <= BigInt(n); i += 1n) result *= i;
  return result;
}

/** Exact binomial coefficient using BigInt, safe for large n. */
export function combinations(n: number, r: number): bigint {
  if (r < 0 || r > n) return 0n;
  const k = Math.min(r, n - r);
  let result = 1n;
  for (let i = 0; i < k; i += 1) {
    result = (result * BigInt(n - i)) / BigInt(i + 1);
  }
  return result;
}

export function permutations(n: number, r: number): bigint {
  if (r < 0 || r > n) return 0n;
  let result = 1n;
  for (let i = 0; i < r; i += 1) result *= BigInt(n - i);
  return result;
}

/** Nearest primes on either side of n (excluding n itself). */
export function nearbyPrimes(n: number, count = 2): { below: number[]; above: number[] } {
  const below: number[] = [];
  const above: number[] = [];
  let down = Math.trunc(n) - 1;
  let up = Math.trunc(n) + 1;
  while (below.length < count && down > 1) {
    if (isPrime(down)) below.push(down);
    down -= 1;
  }
  while (above.length < count && up < Number.MAX_SAFE_INTEGER) {
    if (isPrime(up)) above.push(up);
    up += 1;
  }
  return { below, above };
}

/** Simplify √n to a√b, e.g. √72 → 6√2. */
export function simplifyRadical(n: number): { outside: number; inside: number } | null {
  if (!Number.isInteger(n) || n < 0) return null;
  let outside = 1;
  let inside = n;
  for (let factor = 2; factor * factor <= inside; factor += 1) {
    while (inside % (factor * factor) === 0) {
      inside /= factor * factor;
      outside *= factor;
    }
  }
  return { outside, inside };
}

/* ------------------------------------------------------------------ */
/* Fractions                                                           */
/* ------------------------------------------------------------------ */

export interface Fraction {
  numerator: number;
  denominator: number;
}

export function simplifyFraction(fraction: Fraction): Fraction {
  const sign = fraction.denominator < 0 ? -1 : 1;
  const divisor = gcd(fraction.numerator, fraction.denominator) || 1;
  return {
    numerator: (sign * fraction.numerator) / divisor,
    denominator: Math.abs(fraction.denominator) / divisor,
  };
}

export function fractionOperation(
  a: Fraction,
  b: Fraction,
  op: "add" | "subtract" | "multiply" | "divide",
): Fraction | null {
  if (a.denominator === 0 || b.denominator === 0) return null;
  switch (op) {
    case "add":
      return simplifyFraction({
        numerator: a.numerator * b.denominator + b.numerator * a.denominator,
        denominator: a.denominator * b.denominator,
      });
    case "subtract":
      return simplifyFraction({
        numerator: a.numerator * b.denominator - b.numerator * a.denominator,
        denominator: a.denominator * b.denominator,
      });
    case "multiply":
      return simplifyFraction({
        numerator: a.numerator * b.numerator,
        denominator: a.denominator * b.denominator,
      });
    case "divide":
      if (b.numerator === 0) return null;
      return simplifyFraction({
        numerator: a.numerator * b.denominator,
        denominator: a.denominator * b.numerator,
      });
    default:
      return null;
  }
}

export function fractionToString(fraction: Fraction): string {
  if (fraction.denominator === 1) return `${fraction.numerator}`;
  return `${fraction.numerator}/${fraction.denominator}`;
}

export function mixedNumber(fraction: Fraction): string {
  const { numerator, denominator } = simplifyFraction(fraction);
  if (denominator === 1) return `${numerator}`;
  const whole = Math.trunc(numerator / denominator);
  const remainder = Math.abs(numerator % denominator);
  if (whole === 0) return `${numerator}/${denominator}`;
  return `${whole} ${remainder}/${denominator}`;
}

/* ------------------------------------------------------------------ */
/* Matrices                                                            */
/* ------------------------------------------------------------------ */

export type Matrix = number[][];

export function matrixMultiply(a: Matrix, b: Matrix): Matrix | null {
  if (a.length === 0 || b.length === 0) return null;
  if (a[0].length !== b.length) return null;
  return a.map((row) =>
    b[0].map((_, columnIndex) =>
      row.reduce((sum, value, index) => sum + value * b[index][columnIndex], 0),
    ),
  );
}

export function matrixAdd(a: Matrix, b: Matrix, sign = 1): Matrix | null {
  if (a.length !== b.length || a[0]?.length !== b[0]?.length) return null;
  return a.map((row, r) => row.map((value, c) => value + sign * b[r][c]));
}

export function transpose(matrix: Matrix): Matrix {
  return matrix[0].map((_, c) => matrix.map((row) => row[c]));
}

export function determinant(matrix: Matrix): number | null {
  const n = matrix.length;
  if (n === 0 || matrix.some((row) => row.length !== n)) return null;
  if (n === 1) return matrix[0][0];
  if (n === 2) return matrix[0][0] * matrix[1][1] - matrix[0][1] * matrix[1][0];
  let total = 0;
  for (let column = 0; column < n; column += 1) {
    const minor = matrix
      .slice(1)
      .map((row) => row.filter((_, index) => index !== column));
    const value = determinant(minor);
    if (value === null) return null;
    total += (column % 2 === 0 ? 1 : -1) * matrix[0][column] * value;
  }
  return total;
}

export function invert(matrix: Matrix): Matrix | null {
  const n = matrix.length;
  if (n !== 2 || matrix.some((row) => row.length !== n)) return null;
  const det = determinant(matrix);
  if (det === null || det === 0) return null;
  const [[a, b], [c, d]] = matrix;
  return [
    [d / det, -b / det],
    [-c / det, a / det],
  ];
}

/* ------------------------------------------------------------------ */
/* Probability                                                         */
/* ------------------------------------------------------------------ */

export function atLeastOne(probability: number, trials: number): number {
  if (probability <= 0 || trials <= 0) return 0;
  return 1 - Math.pow(1 - probability, trials);
}

export function binomialProbability(successes: number, trials: number, probability: number): number {
  if (successes < 0 || successes > trials) return 0;
  const coefficient = Number(combinations(trials, successes));
  return coefficient * Math.pow(probability, successes) * Math.pow(1 - probability, trials - successes);
}

/* ------------------------------------------------------------------ */
/* Expression evaluator                                                */
/* ------------------------------------------------------------------ */

const FUNCTIONS: Record<string, (value: number) => number> = {
  sqrt: Math.sqrt,
  cbrt: Math.cbrt,
  abs: Math.abs,
  ln: Math.log,
  log: Math.log10,
  log2: Math.log2,
  exp: Math.exp,
  sin: Math.sin,
  cos: Math.cos,
  tan: Math.tan,
  asin: Math.asin,
  acos: Math.acos,
  atan: Math.atan,
  sinh: Math.sinh,
  cosh: Math.cosh,
  tanh: Math.tanh,
  round: Math.round,
  floor: Math.floor,
  ceil: Math.ceil,
};

const CONSTANTS: Record<string, number> = {
  pi: Math.PI,
  e: Math.E,
  tau: Math.PI * 2,
};

type Token =
  | { type: "number"; value: number }
  | { type: "operator"; value: string }
  | { type: "function"; value: string }
  | { type: "paren"; value: "(" | ")" }
  | { type: "comma" };

const PRECEDENCE: Record<string, number> = {
  "+": 1,
  "-": 1,
  "*": 2,
  "/": 2,
  "%": 2,
  "^": 4,
  "u-": 3,
};

function tokenize(source: string): Token[] {
  const tokens: Token[] = [];
  const text = source
    .toLowerCase()
    .replace(/\u00d7/g, "*")
    .replace(/\u00f7/g, "/")
    .replace(/\u2212/g, "-")
    .replace(/,/g, ",");
  let index = 0;

  while (index < text.length) {
    const char = text[index];
    if (char === " " || char === "\t") {
      index += 1;
      continue;
    }
    if (/[0-9.]/.test(char)) {
      let literal = "";
      while (index < text.length && /[0-9._]/.test(text[index])) {
        if (text[index] !== "_") literal += text[index];
        index += 1;
      }
      // Scientific notation: 1e3, 2.5e-4
      if (index < text.length && text[index] === "e" && /[0-9+-]/.test(text[index + 1] ?? "")) {
        // Only treat as exponent when the next character starts a digit or sign+digit
        const rest = text.slice(index);
        const match = rest.match(/^e[+-]?\d+/);
        if (match) {
          literal += match[0];
          index += match[0].length;
        }
      }
      const value = Number(literal);
      if (!Number.isFinite(value)) throw new Error(`"${literal}" is not a number.`);
      tokens.push({ type: "number", value });
      continue;
    }
    if (/[a-z]/i.test(char)) {
      let name = "";
      while (index < text.length && /[a-z0-9]/i.test(text[index])) {
        name += text[index];
        index += 1;
      }
      if (name in FUNCTIONS) {
        tokens.push({ type: "function", value: name });
      } else if (name in CONSTANTS) {
        tokens.push({ type: "number", value: CONSTANTS[name] });
      } else {
        throw new Error(`Unknown name "${name}". Use numbers, pi, e or the listed functions.`);
      }
      continue;
    }
    if ("+-*/^%".includes(char)) {
      tokens.push({ type: "operator", value: char });
      index += 1;
      continue;
    }
    if (char === "(" || char === ")") {
      tokens.push({ type: "paren", value: char });
      index += 1;
      continue;
    }
    if (char === ",") {
      tokens.push({ type: "comma" });
      index += 1;
      continue;
    }
    throw new Error(`Unexpected character "${char}".`);
  }
  return tokens;
}

export interface EvaluateOptions {
  /** Treat trig arguments as degrees instead of radians. */
  degrees?: boolean;
}

/** Evaluate an arithmetic expression without `eval`. Throws on bad input. */
export function evaluateExpression(source: string, options: EvaluateOptions = {}): number {
  const tokens = tokenize(source);
  if (tokens.length === 0) throw new Error("Nothing to calculate.");

  const output: Token[] = [];
  const stack: Token[] = [];
  let previous: Token | null = null;

  for (const token of tokens) {
    if (token.type === "number") {
      output.push(token);
    } else if (token.type === "function") {
      stack.push(token);
    } else if (token.type === "comma") {
      while (stack.length > 0 && stack[stack.length - 1].type !== "paren") {
        output.push(stack.pop() as Token);
      }
    } else if (token.type === "operator") {
      const unary = token.value === "-" && (previous === null || previous.type === "operator" || (previous.type === "paren" && previous.value === "("));
      const operator = unary ? "u-" : token.value;
      while (stack.length > 0) {
        const top = stack[stack.length - 1];
        if (top.type === "operator") {
          const topPower = PRECEDENCE[top.value] ?? 0;
          const power = PRECEDENCE[operator] ?? 0;
          const rightAssociative = operator === "^" || operator === "u-";
          if (topPower > power || (topPower === power && !rightAssociative)) {
            output.push(stack.pop() as Token);
            continue;
          }
        }
        break;
      }
      stack.push({ type: "operator", value: operator });
    } else if (token.value === "(") {
      stack.push(token);
    } else {
      let found = false;
      while (stack.length > 0) {
        const top = stack.pop() as Token;
        if (top.type === "paren" && top.value === "(") {
          found = true;
          break;
        }
        output.push(top);
      }
      if (!found) throw new Error("Mismatched brackets — check for a missing \"(\".");
      if (stack.length > 0 && stack[stack.length - 1].type === "function") {
        output.push(stack.pop() as Token);
      }
    }
    previous = token;
  }

  while (stack.length > 0) {
    const top = stack.pop() as Token;
    if (top.type === "paren") throw new Error("Mismatched brackets — check for a missing \")\".");
    output.push(top);
  }

  const values: number[] = [];
  const toRadians = (value: number) => (options.degrees ? (value * Math.PI) / 180 : value);
  const fromRadians = (value: number) => (options.degrees ? (value * 180) / Math.PI : value);

  for (const token of output) {
    if (token.type === "number") {
      values.push(token.value);
      continue;
    }
    if (token.type === "operator") {
      if (token.value === "u-") {
        const value = values.pop();
        if (value === undefined) throw new Error("Incomplete expression.");
        values.push(-value);
        continue;
      }
      const b = values.pop();
      const a = values.pop();
      if (a === undefined || b === undefined) throw new Error("Incomplete expression.");
      switch (token.value) {
        case "+":
          values.push(a + b);
          break;
        case "-":
          values.push(a - b);
          break;
        case "*":
          values.push(a * b);
          break;
        case "/":
          if (b === 0) throw new Error("Division by zero is not defined.");
          values.push(a / b);
          break;
        case "%":
          if (b === 0) throw new Error("Modulo by zero is not defined.");
          values.push(a % b);
          break;
        case "^":
          values.push(Math.pow(a, b));
          break;
        default:
          throw new Error(`Unsupported operator "${token.value}".`);
      }
      continue;
    }
    if (token.type === "function") {
      const argument = values.pop();
      if (argument === undefined) throw new Error(`"${token.value}" needs a value.`);
      const fn = FUNCTIONS[token.value];
      let input = argument;
      if (options.degrees && ["sin", "cos", "tan"].includes(token.value)) input = toRadians(argument);
      const result = fn(input);
      values.push(options.degrees && ["asin", "acos", "atan"].includes(token.value) ? fromRadians(result) : result);
      continue;
    }
    throw new Error("Malformed expression.");
  }

  const [result] = values;
  if (result === undefined || values.length !== 1) throw new Error("Malformed expression.");
  if (!Number.isFinite(result)) throw new Error("The result is not a finite number.");
  return result;
}

/** Format a number without scientific noise: 12 significant digits, trimmed. */
export function formatNumber(value: number, maxDecimals = 10): string {
  if (!Number.isFinite(value)) return "—";
  const rounded = Number(value.toPrecision(12));
  const fixed = rounded.toFixed(maxDecimals);
  return fixed.replace(/\.?0+$/, "") || "0";
}

/** Express a number in normalized scientific notation: 4500 → 4.5 × 10³. */
export function toScientific(value: number, digits = 4): { coefficient: number; exponent: number; text: string } | null {
  if (!Number.isFinite(value) || value === 0) return null;
  const exponent = Math.floor(Math.log10(Math.abs(value)));
  const coefficient = Number((value / Math.pow(10, exponent)).toPrecision(digits));
  return { coefficient, exponent, text: `${coefficient} × 10^${exponent}` };
}

/* ------------------------------------------------------------------ */
/* Seeded random integers                                              */
/* ------------------------------------------------------------------ */

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

export function randomIntegers(options: {
  min: number;
  max: number;
  count: number;
  unique?: boolean;
  seed?: number;
}): number[] {
  const min = Math.ceil(Math.min(options.min, options.max));
  const max = Math.floor(Math.max(options.min, options.max));
  const count = Math.min(Math.max(Math.trunc(options.count), 1), 1000);
  const random = mulberry32(options.seed ?? Date.now());
  const range = max - min + 1;

  if (options.unique) {
    if (range < count) return [];
    const pool = new Set<number>();
    while (pool.size < count) {
      pool.add(min + Math.floor(random() * range));
    }
    return [...pool];
  }
  return Array.from({ length: count }, () => min + Math.floor(random() * range));
}

/* ------------------------------------------------------------------ */
/* Time durations                                                      */
/* ------------------------------------------------------------------ */

export interface Duration {
  hours: number;
  minutes: number;
  seconds: number;
  totalMinutes: number;
  totalSeconds: number;
}

export function durationBetween(
  start: { hours: number; minutes: number; seconds?: number },
  end: { hours: number; minutes: number; seconds?: number },
): Duration {
  const startSeconds = start.hours * 3600 + start.minutes * 60 + (start.seconds ?? 0);
  let endSeconds = end.hours * 3600 + end.minutes * 60 + (end.seconds ?? 0);
  if (endSeconds < startSeconds) endSeconds += 86_400; // crosses midnight
  const totalSeconds = endSeconds - startSeconds;
  return {
    hours: Math.floor(totalSeconds / 3600),
    minutes: Math.floor((totalSeconds % 3600) / 60),
    seconds: totalSeconds % 60,
    totalMinutes: totalSeconds / 60,
    totalSeconds,
  };
}

/** Split "1:30" or "90" or "1h30m" into hours and minutes. */
export function parseDuration(input: string): { hours: number; minutes: number } | null {
  const text = input.trim().toLowerCase();
  if (!text) return null;
  const clock = text.match(/^(\d+):([0-5]?\d)$/);
  if (clock) return { hours: Number(clock[1]), minutes: Number(clock[2]) };
  const units = text.match(/^(?:(\d+)\s*h)?\s*(?:(\d+)\s*m)?$/);
  if (units && (units[1] || units[2])) {
    return { hours: Number(units[1] ?? 0), minutes: Number(units[2] ?? 0) };
  }
  const decimal = Number(text);
  if (Number.isFinite(decimal) && decimal >= 0) {
    return { hours: Math.floor(decimal), minutes: Math.round((decimal % 1) * 60) };
  }
  return null;
}

/* ------------------------------------------------------------------ */
/* Number lists                                                        */
/* ------------------------------------------------------------------ */

/** Read numbers out of free text: "3, 4 5\n6" → [3, 4, 5, 6]. */
export function parseNumberList(input: string): number[] {
  const matches = input.match(/-?\d+(?:\.\d+)?/g) ?? [];
  return matches.map(Number).filter((value) => Number.isFinite(value));
}

/** Parse a fraction written "3/4", "-2/5" or "7". */
export function parseFraction(input: string): Fraction | null {
  const text = input.trim();
  if (!text) return null;
  const match = text.match(/^(-?\d+(?:\.\d+)?)\s*\/\s*(-?\d+(?:\.\d+)?)$/);
  if (match) {
    const denominator = Number(match[2]);
    if (denominator === 0) return null;
    return simplifyFraction({ numerator: Number(match[1]), denominator });
  }
  const value = Number(text);
  if (!Number.isFinite(value)) return null;
  return makeFraction(value);
}

/** Convert a decimal to the simplest fraction with a denominator under 10,000. */
export function makeFraction(value: number): Fraction {
  if (Number.isInteger(value)) return { numerator: value, denominator: 1 };
  const sign = value < 0 ? -1 : 1;
  const abs = Math.abs(value);
  let best = { numerator: sign, denominator: 1 };
  let bestError = Infinity;
  for (let denominator = 1; denominator <= 10_000; denominator += 1) {
    const numerator = Math.round(abs * denominator);
    const error = Math.abs(abs - numerator / denominator);
    if (error < bestError - 1e-12) {
      best = { numerator: sign * numerator, denominator };
      bestError = error;
      if (error < 1e-12) break;
    }
  }
  return simplifyFraction(best);
}

/** Mode(s) of a list — every value that appears most often. */
export function modes(values: number[]): number[] {
  if (values.length === 0) return [];
  const counts = new Map<number, number>();
  for (const value of values) counts.set(value, (counts.get(value) ?? 0) + 1);
  const max = Math.max(...counts.values());
  if (max === 1) return [];
  return [...counts.entries()].filter(([, count]) => count === max).map(([value]) => value).sort((a, b) => a - b);
}
