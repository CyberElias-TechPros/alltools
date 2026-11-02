/**
 * Password generation with the Web Crypto API.
 *
 * Every character is drawn with `crypto.getRandomValues`, not `Math.random` —
 * the latter is a predictable PRNG and must never be used for credentials. The
 * entropy figure assumes the attacker knows the exact recipe (length, character
 * sets) and is the only figure worth trusting when comparing options.
 */

export interface PasswordOptions {
  length: number;
  lower: boolean;
  upper: boolean;
  digits: boolean;
  symbols: boolean;
  /** Remove characters that are easy to confuse: 0/O, 1/l/I, and quote marks. */
  excludeAmbiguous: boolean;
  /** Guarantee at least one character from every selected set. */
  requireEach: boolean;
}

export const SYMBOLS = "!@#$%^&*()-_=+[]{};:,.?/";
export const AMBIGUOUS = "0O1lI|`'\"";

export function characterSets(options: PasswordOptions): string[] {
  const sets: string[] = [];
  if (options.lower) sets.push("abcdefghijklmnopqrstuvwxyz");
  if (options.upper) sets.push("ABCDEFGHIJKLMNOPQRSTUVWXYZ");
  if (options.digits) sets.push("0123456789");
  if (options.symbols) sets.push(SYMBOLS);

  return sets.map((set) =>
    options.excludeAmbiguous
      ? [...set].filter((char) => !AMBIGUOUS.includes(char)).join("")
      : set,
  );
}

function randomInt(max: number): number {
  if (max <= 0) return 0;
  const limit = Math.floor(0xffffffff / max) * max;
  const buffer = new Uint32Array(1);
  let value = 0;
  do {
    crypto.getRandomValues(buffer);
    value = buffer[0];
  } while (value >= limit);
  return value % max;
}

export function generatePassword(options: PasswordOptions): string {
  const sets = characterSets(options);
  const pool = sets.join("");
  const length = Math.max(1, Math.min(128, Math.floor(options.length)));
  if (!pool) return "";

  const characters: string[] = [];
  if (options.requireEach) {
    for (const set of sets) {
      if (characters.length >= length) break;
      characters.push(set[randomInt(set.length)]);
    }
  }
  while (characters.length < length) {
    characters.push(pool[randomInt(pool.length)]);
  }

  // Fisher–Yates with crypto randomness so the guaranteed characters are not
  // stuck at the front of the password.
  for (let index = characters.length - 1; index > 0; index -= 1) {
    const swap = randomInt(index + 1);
    [characters[index], characters[swap]] = [characters[swap], characters[index]];
  }

  return characters.join("");
}

/** Shannon entropy of the generation recipe, in bits. */
export function passwordEntropy(options: PasswordOptions): number {
  const pool = characterSets(options).join("").length;
  if (!pool) return 0;
  return Math.round(options.length * Math.log2(pool));
}

export interface StrengthVerdict {
  label: string;
  tone: "weak" | "fair" | "strong" | "excellent";
  detail: string;
}

export function strengthOf(bits: number): StrengthVerdict {
  if (bits < 40) {
    return { label: "Weak", tone: "weak", detail: "Breakable with consumer hardware in hours or less." };
  }
  if (bits < 60) {
    return { label: "Fair", tone: "fair", detail: "Fine for throwaway accounts, not for email or banking." };
  }
  if (bits < 80) {
    return { label: "Strong", tone: "strong", detail: "A good default for most accounts." };
  }
  return { label: "Excellent", tone: "excellent", detail: "Comfortably beyond offline cracking budgets." };
}

/** Rough “time to crack” at 10 billion guesses per second, for context only. */
export function crackTime(bits: number): string {
  const guesses = 2 ** Math.min(bits, 200) / 10_000_000_000;
  if (guesses < 1) return "under a second";
  const seconds = guesses;
  const years = seconds / (60 * 60 * 24 * 365);
  if (years < 1) {
    const days = seconds / 86_400;
    if (days < 1) return `${Math.round(seconds)} seconds`;
    return `${Math.round(days)} days`;
  }
  if (years > 1e12) return "longer than the age of the universe";
  if (years > 1e6) return `${(years / 1e6).toFixed(1)} million years`;
  if (years > 1000) return `${Math.round(years / 1000)} thousand years`;
  return `${Math.round(years)} years`;
}
