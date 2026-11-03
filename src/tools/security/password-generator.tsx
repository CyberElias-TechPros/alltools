"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { RefreshCw } from "lucide-react";
import { Button, CopyButton, Field, Switch, ToolPanel } from "@/components/ui";
import { cn } from "@/lib/utils";

const SETS = {
  lower: "abcdefghijklmnopqrstuvwxyz",
  upper: "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
  digits: "0123456789",
  symbols: "!@#$%^&*()-_=+[]{};:,.?/",
  similar: "il1Lo0O",
};

const WORDS = [
  "amber","anchor","basil","beacon","bramble","cedar","cobalt","comet","copper","coral","crisp","delta","ember","falcon","fern","flint","garnet","harbor","indigo","ivory","jade","lantern","linen","lunar","maple","marble","meadow","nectar","nova","olive","onyx","opal","orbit","pebble","pepper","pine","quartz","raven","river","saffron","sage","silver","solar","spruce","summit","teal","thistle","timber","topaz","velvet","violet","willow","zephyr",
];

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

function pick(alphabet: string): string {
  return alphabet[randomInt(alphabet.length)];
}

function shuffle(items: string[]): string[] {
  for (let i = items.length - 1; i > 0; i--) {
    const j = randomInt(i + 1);
    [items[i], items[j]] = [items[j], items[i]];
  }
  return items;
}

export default function PasswordGenerator() {
  const [length, setLength] = useState(16);
  const [lower, setLower] = useState(true);
  const [upper, setUpper] = useState(true);
  const [digits, setDigits] = useState(true);
  const [symbols, setSymbols] = useState(true);
  const [avoidSimilar, setAvoidSimilar] = useState(false);
  const [passphrase, setPassphrase] = useState(false);
  const [wordCount, setWordCount] = useState(5);
  const [password, setPassword] = useState("");
  const timer = useRef<number | null>(null);

  const alphabet = useMemo(() => {
    let chars = "";
    if (lower) chars += SETS.lower;
    if (upper) chars += SETS.upper;
    if (digits) chars += SETS.digits;
    if (symbols) chars += SETS.symbols;
    if (avoidSimilar) {
      chars = [...chars].filter((char) => !SETS.similar.includes(char)).join("");
    }
    return chars;
  }, [lower, upper, digits, symbols, avoidSimilar]);

  const generate = useCallback(() => {
    if (passphrase) {
      const words = Array.from({ length: Math.min(Math.max(wordCount, 3), 10) }, () => WORDS[randomInt(WORDS.length)]);
      const separator = pick("-_. ");
      setPassword(words.join(separator));
      return;
    }
    if (!alphabet) {
      setPassword("");
      return;
    }
    const chars: string[] = [];
    if (lower) chars.push(pick(SETS.lower));
    if (upper) chars.push(pick(SETS.upper));
    if (digits) chars.push(pick(SETS.digits));
    if (symbols) chars.push(pick(SETS.symbols));
    while (chars.length < length) chars.push(pick(alphabet));
    setPassword(shuffle(chars).slice(0, Math.max(length, chars.length)).join(""));
  }, [alphabet, length, lower, upper, digits, symbols, passphrase, wordCount]);

  useEffect(() => {
    generate();
    return () => {
      if (timer.current) window.clearTimeout(timer.current);
    };
  }, [generate]);

  const entropy = useMemo(() => {
    if (passphrase) return Math.log2(WORDS.length) * Math.min(Math.max(wordCount, 3), 10);
    if (!alphabet.length) return 0;
    return Math.log2(alphabet.length) * length;
  }, [alphabet, length, passphrase, wordCount]);

  const strength =
    entropy >= 90 ? { label: "Excellent", tone: "emerald" } :
    entropy >= 70 ? { label: "Strong", tone: "emerald" } :
    entropy >= 50 ? { label: "Good", tone: "amber" } :
    entropy >= 30 ? { label: "Weak", tone: "amber" } :
    { label: "Very weak", tone: "rose" };

  const crackTime = useMemo(() => {
    const guessesPerSecond = 1e10; // offline attack against a fast hash
    const seconds = 2 ** entropy / guessesPerSecond;
    if (seconds < 60) return "seconds";
    if (seconds < 3600) return `${Math.round(seconds / 60)} minutes`;
    if (seconds < 86400) return `${Math.round(seconds / 3600)} hours`;
    if (seconds < 31_536_000) return `${Math.round(seconds / 86400)} days`;
    if (seconds < 3.15e9) return `${Math.round(seconds / 31_536_000)} years`;
    return "longer than the age of the universe";
  }, [entropy]);

  return (
    <ToolPanel>
      <div className="rounded-xl border border-[var(--border)] bg-[var(--code-bg)] p-4">
        <div className="flex items-start justify-between gap-3">
          <p
            aria-live="polite"
            className="break-all font-mono text-lg font-semibold leading-relaxed text-[var(--text)] sm:text-xl"
          >
            {password || "Select at least one character set"}
          </p>
          <div className="flex shrink-0 gap-1.5">
            <Button size="sm" variant="primary" onClick={generate}>
              <RefreshCw className="size-3.5" aria-hidden /> New
            </Button>
            <CopyButton text={password} />
          </div>
        </div>
        <div className="mt-3 flex flex-wrap items-center gap-3 text-xs">
          <span
            className={cn(
              "rounded-full px-2 py-0.5 font-semibold",
              strength.tone === "emerald" && "bg-emerald-100 text-emerald-800 dark:bg-emerald-500/15 dark:text-emerald-300",
              strength.tone === "amber" && "bg-amber-100 text-amber-900 dark:bg-amber-500/15 dark:text-amber-200",
              strength.tone === "rose" && "bg-rose-100 text-rose-900 dark:bg-rose-500/15 dark:text-rose-200",
            )}
          >
            {strength.label}
          </span>
          <span className="text-[var(--text-muted)]">{entropy.toFixed(1)} bits of entropy</span>
          <span className="text-[var(--text-subtle)]">≈ {crackTime} to brute-force offline</span>
        </div>
        <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-[var(--border)]">
          <div
            className={cn(
              "h-full rounded-full transition-all",
              strength.tone === "emerald" && "bg-emerald-500",
              strength.tone === "amber" && "bg-amber-500",
              strength.tone === "rose" && "bg-rose-500",
            )}
            style={{ width: `${Math.min((entropy / 110) * 100, 100)}%` }}
          />
        </div>
      </div>

      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <div>
          {passphrase ? (
            <Field label={`Words: ${wordCount}`} htmlFor="pw-words">
              <input
                id="pw-words"
                type="range"
                min={3}
                max={10}
                value={wordCount}
                onChange={(event) => setWordCount(Number(event.target.value))}
                className="w-full accent-brand-600"
              />
            </Field>
          ) : (
            <Field label={`Length: ${length} characters`} htmlFor="pw-length">
              <input
                id="pw-length"
                type="range"
                min={8}
                max={64}
                value={length}
                onChange={(event) => setLength(Number(event.target.value))}
                className="w-full accent-brand-600"
              />
              <div className="mt-1 flex justify-between text-[0.68rem] text-[var(--text-subtle)]">
                <span>8</span><span>16 (recommended)</span><span>64</span>
              </div>
            </Field>
          )}
          <Switch
            checked={passphrase}
            onChange={setPassphrase}
            label="Passphrase mode"
            description="Random words — easier to type and remember"
          />
        </div>

        <div className="rounded-xl border border-[var(--border)] bg-[var(--surface-muted)] p-3">
          {!passphrase ? (
            <>
              <Switch checked={lower} onChange={setLower} label="Lowercase (a–z)" />
              <Switch checked={upper} onChange={setUpper} label="Uppercase (A–Z)" />
              <Switch checked={digits} onChange={setDigits} label="Digits (0–9)" />
              <Switch checked={symbols} onChange={setSymbols} label="Symbols (!@#$…)" />
              <Switch
                checked={avoidSimilar}
                onChange={setAvoidSimilar}
                label="Avoid look-alike characters"
                description="Excludes i, l, 1, L, o, 0, O"
              />
            </>
          ) : (
            <p className="text-sm leading-relaxed text-[var(--text-muted)]">
              Passphrase mode joins randomly chosen words with a random separator. Five words from
              this {WORDS.length}-word list give about {Math.log2(WORDS.length ** 5).toFixed(0)} bits
              of entropy — strong, and much easier to type on a phone.
            </p>
          )}
        </div>
      </div>

      <p className="mt-4 text-xs text-[var(--text-subtle)]">
        Generated locally with <code className="font-mono">crypto.getRandomValues</code>. Nothing is
        stored, logged or transmitted. Clear your clipboard after pasting into a password manager.
      </p>
    </ToolPanel>
  );
}
