/**
 * Security utilities: password analysis, token generation, hashing (including
 * MD5, which Web Crypto deliberately omits), AES-GCM encryption with a
 * passphrase-derived key, and syntax-only URL risk heuristics.
 *
 * Everything runs locally. The encryption tool is a demonstration of the
 * Web Crypto API — it is not a password manager and makes no claim to be one.
 */

/* ------------------------------------------------------------------ */
/* Password analysis                                                   */
/* ------------------------------------------------------------------ */

const COMMON_PASSWORDS = new Set([
  "123456", "password", "123456789", "12345678", "12345", "qwerty", "1234567", "111111",
  "1234567890", "123123", "abc123", "1234", "password1", "iloveyou", "1q2w3e4r", "000000",
  "qwerty123", "zaq12wsx", "dragon", "sunshine", "princess", "letmein", "654321", "monkey",
  "27653", "1qaz2wsx", "123321", "qwertyuiop", "superman", "asdfghjkl", "welcome", "admin",
  "login", "passw0rd", "starwars", "football", "baseball", "shadow", "master", "michael",
]);

const KEYBOARD_RUNS = ["qwerty", "asdf", "zxcv", "1234", "0987", "qazwsx", "poiuyt", "lkjhg"];

export interface PasswordAnalysis {
  length: number;
  charsetSize: number;
  entropyBits: number;
  score: number;
  label: "Very weak" | "Weak" | "Fair" | "Strong" | "Very strong";
  warnings: string[];
  suggestions: string[];
  crackTime: string;
}

export function analysePassword(password: string): PasswordAnalysis {
  const warnings: string[] = [];
  const suggestions: string[] = [];
  const length = password.length;

  const hasLower = /[a-z]/.test(password);
  const hasUpper = /[A-Z]/.test(password);
  const hasDigit = /\d/.test(password);
  const hasSymbol = /[^A-Za-z0-9]/.test(password);
  const hasSpace = /\s/.test(password);

  let charsetSize = 0;
  if (hasLower) charsetSize += 26;
  if (hasUpper) charsetSize += 26;
  if (hasDigit) charsetSize += 10;
  if (hasSymbol) charsetSize += 32;
  if (hasSpace) charsetSize += 1;

  let entropyBits = length > 0 ? length * Math.log2(Math.max(charsetSize, 1)) : 0;

  // Penalties: patterns collapse the real search space far below the naive estimate.
  const lower = password.toLowerCase();
  if (COMMON_PASSWORDS.has(lower)) {
    warnings.push("This is one of the most commonly used passwords — it will be tried in the first seconds.");
    entropyBits = Math.min(entropyBits, 10);
  } else {
    // Crackers try a dictionary plus digits, so a known password with a number
    // glued on is barely stronger than the password alone.
    const base = [...COMMON_PASSWORDS].find((entry) => entry.length >= 5 && lower.includes(entry));
    if (base) {
      warnings.push(`It contains the very common password “${base}” with extra characters added — crackers try that pattern immediately.`);
      entropyBits = Math.min(entropyBits * 0.5, 30);
    }
  }
  if (/(.)\1{2,}/.test(password)) {
    warnings.push("It contains three or more identical characters in a row.");
    entropyBits *= 0.75;
  }
  if (KEYBOARD_RUNS.some((run) => lower.includes(run))) {
    warnings.push("It contains a keyboard pattern such as “qwerty” or “1234”.");
    entropyBits *= 0.7;
  }
  if (/(19|20)\d{2}/.test(password)) {
    warnings.push("It contains a year, which password crackers try early.");
    entropyBits *= 0.8;
  }
  if (/(.)\1/.test(password.replace(/(.)\1+/g, "$1"))) {
    entropyBits *= 0.9;
  }
  if (length < 8) {
    warnings.push("Shorter than eight characters — too short for anything that matters.");
  }
  if (!hasUpper && !hasLower) {
    warnings.push("It has no letters at all.");
  }
  if (!hasDigit && !hasSymbol) {
    suggestions.push("Add a digit or a symbol, or simply make it longer.");
  }
  if (length < 16) suggestions.push("Sixteen characters or more is the practical target for a password you must remember.");
  if (hasLower && hasUpper && hasDigit && hasSymbol) {
    suggestions.push("Mixed character sets are in use — length is now the only thing worth adding.");
  }

  const entropy = Math.max(0, Math.round(entropyBits));
  const score = Math.max(0, Math.min(4, Math.floor(entropy / 25)));
  const label: PasswordAnalysis["label"] =
    entropy < 28 ? "Very weak" : entropy < 40 ? "Weak" : entropy < 60 ? "Fair" : entropy < 80 ? "Strong" : "Very strong";

  return {
    length,
    charsetSize,
    entropyBits: entropy,
    score,
    label,
    warnings,
    suggestions,
    crackTime: crackTimeFor(entropy),
  };
}

export function crackTimeFor(bits: number): string {
  const guesses = 2 ** Math.min(bits, 200) / 10_000_000_000;
  if (guesses < 1) return "instantly";
  const seconds = guesses;
  if (seconds < 60) return `${Math.round(seconds)} seconds`;
  if (seconds < 3600) return `${Math.round(seconds / 60)} minutes`;
  if (seconds < 86_400) return `${Math.round(seconds / 3600)} hours`;
  const years = seconds / 31_536_000;
  if (years < 1) return `${Math.round(seconds / 86_400)} days`;
  if (years > 1e12) return "longer than the age of the universe";
  if (years > 1e6) return `${Math.round(years / 1e6)} million years`;
  if (years > 1000) return `${Math.round(years / 1000)} thousand years`;
  return `${Math.round(years)} years`;
}

/* ------------------------------------------------------------------ */
/* Tokens                                                              */
/* ------------------------------------------------------------------ */

export type TokenEncoding = "hex" | "base64url" | "base64" | "alphanumeric";

function randomBytes(count: number): Uint8Array {
  const bytes = new Uint8Array(count);
  crypto.getRandomValues(bytes);
  return bytes;
}

const ALPHANUMERIC = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

export function generateToken(bytes: number, encoding: TokenEncoding): string {
  const safeBytes = Math.max(1, Math.min(128, Math.floor(bytes)));
  const buffer = randomBytes(safeBytes);

  if (encoding === "hex") {
    return [...buffer].map((byte) => byte.toString(16).padStart(2, "0")).join("");
  }
  if (encoding === "alphanumeric") {
    return [...randomBytes(safeBytes)]
      .map((byte) => ALPHANUMERIC[byte % ALPHANUMERIC.length])
      .join("");
  }
  let binary = "";
  for (const byte of buffer) binary += String.fromCharCode(byte);
  const base64 = btoa(binary);
  return encoding === "base64url" ? base64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "") : base64;
}

/* ------------------------------------------------------------------ */
/* Hashing                                                             */
/* ------------------------------------------------------------------ */

export type HashAlgorithm = "MD5" | "SHA-1" | "SHA-256" | "SHA-384" | "SHA-512";

function toHex(bytes: Uint8Array): string {
  return [...bytes].map((byte) => byte.toString(16).padStart(2, "0")).join("");
}

/** Web Crypto algorithms. MD5 is handled separately because it is not provided. */
export async function hashBytes(
  algorithm: HashAlgorithm,
  data: ArrayBuffer | Uint8Array,
): Promise<string> {
  if (algorithm === "MD5") {
    const bytes = data instanceof Uint8Array ? data : new Uint8Array(data);
    return md5(bytes);
  }
  const buffer = data instanceof Uint8Array ? (data.slice().buffer as ArrayBuffer) : data;
  const digest = await crypto.subtle.digest(algorithm, buffer);
  return toHex(new Uint8Array(digest));
}

export async function hashText(algorithm: HashAlgorithm, text: string): Promise<string> {
  return hashBytes(algorithm, new TextEncoder().encode(text));
}

/* ------------------------------------------------------------------ */
/* MD5 (RFC 1321) — compact reference implementation                   */
/* ------------------------------------------------------------------ */

const MD5_S = [
  7, 12, 17, 22, 7, 12, 17, 22, 7, 12, 17, 22, 7, 12, 17, 22, 5, 9, 14, 20, 5, 9, 14, 20, 5, 9,
  14, 20, 5, 9, 14, 20, 4, 11, 16, 23, 4, 11, 16, 23, 4, 11, 16, 23, 4, 11, 16, 23, 6, 10, 15,
  21, 6, 10, 15, 21, 6, 10, 15, 21, 6, 10, 15, 21,
];

const MD5_K = Array.from({ length: 64 }, (_, index) =>
  Math.floor(Math.abs(Math.sin(index + 1)) * 2 ** 32) >>> 0,
);

export function md5(input: Uint8Array): string {
  const originalLength = input.length;
  const paddingLength = ((56 - ((originalLength + 1) % 64)) + 64) % 64;
  const totalLength = originalLength + 1 + paddingLength + 8;
  const buffer = new Uint8Array(totalLength);
  buffer.set(input);
  buffer[originalLength] = 0x80;

  const bitLength = BigInt(originalLength) * 8n;
  for (let index = 0; index < 8; index += 1) {
    buffer[totalLength - 8 + index] = Number((bitLength >> BigInt(8 * index)) & 0xffn);
  }

  let a0 = 0x67452301;
  let b0 = 0xefcdab89;
  let c0 = 0x98badcfe;
  let d0 = 0x10325476;

  const rotl = (value: number, shift: number) => ((value << shift) | (value >>> (32 - shift))) >>> 0;

  for (let offset = 0; offset < totalLength; offset += 64) {
    const words = new Uint32Array(16);
    for (let index = 0; index < 16; index += 1) {
      const base = offset + index * 4;
      words[index] =
        buffer[base] | (buffer[base + 1] << 8) | (buffer[base + 2] << 16) | (buffer[base + 3] << 24);
    }

    let a = a0;
    let b = b0;
    let c = c0;
    let d = d0;

    for (let index = 0; index < 64; index += 1) {
      let f: number;
      let g: number;
      if (index < 16) {
        f = (b & c) | (~b & d);
        g = index;
      } else if (index < 32) {
        f = (d & b) | (~d & c);
        g = (5 * index + 1) % 16;
      } else if (index < 48) {
        f = b ^ c ^ d;
        g = (3 * index + 5) % 16;
      } else {
        f = c ^ (b | ~d);
        g = (7 * index) % 16;
      }
      f = (f + a + MD5_K[index] + words[g]) >>> 0;
      a = d;
      d = c;
      c = b;
      b = (b + rotl(f, MD5_S[index])) >>> 0;
    }

    a0 = (a0 + a) >>> 0;
    b0 = (b0 + b) >>> 0;
    c0 = (c0 + c) >>> 0;
    d0 = (d0 + d) >>> 0;
  }

  const digest = new Uint8Array(16);
  [a0, b0, c0, d0].forEach((word, wordIndex) => {
    for (let byteIndex = 0; byteIndex < 4; byteIndex += 1) {
      digest[wordIndex * 4 + byteIndex] = (word >>> (8 * byteIndex)) & 0xff;
    }
  });
  return toHex(digest);
}

/* ------------------------------------------------------------------ */
/* AES-GCM encryption with PBKDF2                                      */
/* ------------------------------------------------------------------ */

export interface EncryptedPayload {
  combined: string;
  salt: string;
  iv: string;
  ciphertext: string;
}

const ITERATIONS = 210_000;

function toBase64(bytes: Uint8Array): string {
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary);
}

function fromBase64(value: string): Uint8Array {
  const binary = atob(value.trim());
  const bytes = new Uint8Array(binary.length);
  for (let index = 0; index < binary.length; index += 1) bytes[index] = binary.charCodeAt(index);
  return bytes;
}

async function deriveKey(passphrase: string, salt: Uint8Array): Promise<CryptoKey> {
  const material = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(passphrase),
    "PBKDF2",
    false,
    ["deriveKey"],
  );
  return crypto.subtle.deriveKey(
    { name: "PBKDF2", salt: salt as unknown as BufferSource, iterations: ITERATIONS, hash: "SHA-256" },
    material,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"],
  );
}

export async function encryptText(text: string, passphrase: string): Promise<EncryptedPayload> {
  if (!passphrase) throw new Error("A passphrase is required.");
  const salt = randomBytes(16);
  const iv = randomBytes(12);
  const key = await deriveKey(passphrase, salt);
  const ciphertext = new Uint8Array(
    await crypto.subtle.encrypt(
      { name: "AES-GCM", iv: iv as unknown as BufferSource },
      key,
      new TextEncoder().encode(text),
    ),
  );

  // The combined form is what you keep: base64(salt | iv | ciphertext).
  const combined = new Uint8Array(salt.length + iv.length + ciphertext.length);
  combined.set(salt, 0);
  combined.set(iv, salt.length);
  combined.set(ciphertext, salt.length + iv.length);

  return {
    combined: toBase64(combined),
    salt: toBase64(salt),
    iv: toBase64(iv),
    ciphertext: toBase64(ciphertext),
  };
}

export async function decryptText(combinedBase64: string, passphrase: string): Promise<string> {
  if (!passphrase) throw new Error("A passphrase is required.");
  const combined = fromBase64(combinedBase64);
  if (combined.length < 29) throw new Error("That does not look like an encrypted payload.");
  const salt = combined.slice(0, 16);
  const iv = combined.slice(16, 28);
  const ciphertext = combined.slice(28);
  const key = await deriveKey(passphrase, salt);
  try {
    const plaintext = await crypto.subtle.decrypt(
      { name: "AES-GCM", iv: iv as unknown as BufferSource },
      key,
      ciphertext as unknown as BufferSource,
    );
    return new TextDecoder().decode(plaintext);
  } catch {
    throw new Error("Decryption failed — wrong passphrase, or the payload was altered.");
  }
}

/* ------------------------------------------------------------------ */
/* URL syntax risk                                                    */
/* ------------------------------------------------------------------ */

export interface UrlRisk {
  level: "low" | "medium" | "high";
  findings: Array<{ severity: "info" | "warning" | "danger"; message: string }>;
  host: string;
  scheme: string;
}

const SUSPICIOUS_TLDS = [".zip", ".mov", ".tk", ".ml", ".ga", ".cf", ".gq", ".click", ".top", ".work"];
const SHORTENERS = ["bit.ly", "t.co", "tinyurl.com", "goo.gl", "ow.ly", "is.gd", "buff.ly", "cutt.ly", "rb.gy"];

/** Heuristics on the string only — no blocklist, no reputation data, no fetch. */
export function checkUrlSyntax(input: string): { risk: UrlRisk } | { error: string } {
  const raw = input.trim();
  if (!raw) return { error: "Paste a URL to check." };

  let url: URL;
  try {
    url = new URL(/^[a-z][a-z0-9+.-]*:/i.test(raw) ? raw : `https://${raw}`);
  } catch {
    return { error: "That is not a URL the browser can parse." };
  }

  const findings: UrlRisk["findings"] = [];
  const host = url.hostname.toLowerCase();
  const registrable = host.split(".").slice(-2).join(".");

  if (url.protocol === "http:") {
    findings.push({ severity: "warning", message: "The link is plain http, so it travels unencrypted." });
  }
  if (url.username || url.password) {
    findings.push({ severity: "danger", message: "The URL embeds credentials before the host — a classic disguise technique." });
  }
  if (/^\d{1,3}(\.\d{1,3}){3}$/.test(host)) {
    findings.push({ severity: "warning", message: "The host is a raw IP address rather than a name." });
  }
  if (host.includes("xn--")) {
    findings.push({
      severity: "danger",
      message: "The hostname is punycode, which can hide look-alike characters. Check the spelling carefully.",
    });
  }
  if (host.split(".").length > 4) {
    findings.push({ severity: "warning", message: "There are several subdomains; only the last two labels identify the owner." });
  }
  if (SUSPICIOUS_TLDS.some((tld) => host.endsWith(tld))) {
    findings.push({
      severity: "warning",
      message: "The top-level domain is frequently used for throwaway or abusive sites — not proof of anything on its own.",
    });
  }
  if (SHORTENERS.includes(registrable)) {
    findings.push({ severity: "warning", message: "This is a link shortener: the real destination is hidden until you follow it." });
  }
  if (raw.length > 200) {
    findings.push({ severity: "warning", message: "The URL is very long, which is often used to push the real host out of view." });
  }
  if (/%[0-9a-f]{2}/i.test(url.pathname) && /\.(exe|scr|bat|cmd|js|vbs|jar|msi)$/i.test(decodeURIComponent(url.pathname))) {
    findings.push({ severity: "danger", message: "The path points at an executable file." });
  }
  if (/@/.test(raw.split("/")[2] ?? "")) {
    findings.push({ severity: "danger", message: "There is an “@” in the authority section, so everything before it is ignored by the browser." });
  }
  if (/(login|verify|secure|account|update|unlock)/i.test(url.pathname) && url.protocol === "http:") {
    findings.push({ severity: "warning", message: "A credential-shaped path over plain http is a phishing pattern." });
  }
  if (!findings.length) {
    findings.push({ severity: "info", message: "No structural red flags. That is not the same as safe — only the destination's owner knows what it serves." });
  }

  const danger = findings.some((finding) => finding.severity === "danger");
  const warning = findings.some((finding) => finding.severity === "warning");

  return { risk: { level: danger ? "high" : warning ? "medium" : "low", findings, host, scheme: url.protocol.replace(":", "") } };
}

/* ------------------------------------------------------------------ */
/* Policy drafts                                                       */
/* ------------------------------------------------------------------ */

export interface PolicyInput {
  siteName: string;
  siteUrl: string;
  contactEmail: string;
  country: string;
  collects: string[];
  usesCookies: boolean;
  usesAnalytics: boolean;
  usesAds: boolean;
  sellsData: boolean;
  children: boolean;
  updated: string;
}

function list(items: string[], fallback = "No personal data is collected directly by this site.") {
  const clean = items.filter(Boolean);
  if (!clean.length) return `- ${fallback}`;
  return clean.map((item) => `- ${item}`).join("\n");
}

export function buildPrivacyPolicy(input: PolicyInput): string {
  const name = input.siteName || "[Site name]";
  const url = input.siteUrl || "[site URL]";
  const email = input.contactEmail || "[contact email]";
  const country = input.country || "[jurisdiction]";

  return `# Privacy Policy for ${name}

Last updated: ${input.updated || "[date]"}

> This is a starting draft generated from your answers, not legal advice. Review it against your actual setup and the rules that apply where your visitors live before publishing.

## 1. Who we are

${name} operates ${url}. For any privacy question, contact ${email}.

## 2. What we collect

${list(input.collects)}

We collect only what is needed to run the site and answer you. We do not buy personal data from third parties.

## 3. Why we process it

- To provide the pages and tools you request.
- To respond to messages you send us.
- To keep the site secure and diagnose faults.
- ${input.usesAnalytics ? "To understand aggregate usage so we can improve the site." : "We do not run visitor analytics."}

## 4. Cookies and similar storage

${
  input.usesCookies
    ? `We use cookies and local storage. Anything that is not strictly necessary is set only after you consent, and you can withdraw consent at any time from the cookie banner or your browser settings.`
    : "We do not set cookies for tracking. Tools may keep preferences in your browser's local storage; that data stays on your device."
}

${input.usesAds ? "Advertising: ads are served only where consent allows, and personalised advertising is off unless you opt in." : "We do not display advertising."}

## 5. Sharing

${input.sellsData ? "We share limited data with the processors listed below. We do not sell personal data." : "We do not sell your personal data, and we share it only with processors that help us run the site."}

Processors may include a hosting provider, an email provider${input.usesAnalytics ? ", an analytics provider" : ""}${input.usesAds ? ", and an advertising network" : ""}. Each is bound by its own terms and, where required, standard contractual clauses.

## 6. Retention

Support emails are kept for as long as needed to resolve the matter and then deleted or anonymised. Server logs, if any, are rotated on a short schedule.

## 7. Your rights

Depending on where you live (for example under the GDPR in the EU/UK, or the CCPA in California), you may have the right to access, correct, delete, restrict or port your data, and to object to processing. Write to ${email} and we will respond within the period the law requires.

## 8. Children

${input.children ? "This site is not directed at children, and we do not knowingly collect their data." : "This site is not directed at children under 13, and we do not knowingly collect their data."}

## 9. International transfers

The site is operated from ${country}. Where data is transferred outside your country, we rely on appropriate safeguards such as standard contractual clauses.

## 10. Changes

If this policy changes materially, we will update the date above and, where appropriate, note the change on the site.

## 11. Contact

${email}`;
}

export function buildTerms(input: PolicyInput): string {
  const name = input.siteName || "[Site name]";
  const url = input.siteUrl || "[site URL]";
  const email = input.contactEmail || "[contact email]";
  const country = input.country || "[jurisdiction]";

  return `# Terms of Use for ${name}

Last updated: ${input.updated || "[date]"}

> A plain-language starting draft, not legal advice. Have a lawyer review it for your jurisdiction and business model before publishing.

## 1. Agreement

By using ${url} you agree to these terms. If you do not agree, please do not use the site.

## 2. What the service is

${name} provides free browser-based utilities. Results are produced on your device. The tools are provided for general information and convenience.

## 3. No professional advice

Nothing on this site is legal, medical, financial or tax advice. Calculations and generated documents are starting points — verify anything that matters with a qualified professional.

## 4. Acceptable use

You agree not to:

- attempt to disrupt or overload the service;
- use the tools to break the law or infringe someone else's rights;
- scrape the site in a way that degrades it for others;
- misrepresent the site or its output as your own professional service.

## 5. Your content

You keep all rights to what you paste or upload. Because processing happens in your browser, we do not receive it. You are responsible for having the right to use that content.

## 6. Intellectual property

The site's design, text and code are owned by ${name} unless stated otherwise. Generated output (a converted file, a formatted document) is yours to use.

## 7. Availability

The site is offered as-is, without a guarantee of uptime. Features may change or be withdrawn. Planned tools are labelled as such and are not offered for use.

## 8. Disclaimer of warranties

To the extent permitted by law, the service is provided without warranties of any kind, express or implied, including fitness for a particular purpose.

## 9. Limitation of liability

To the extent permitted by law, ${name} is not liable for indirect or consequential losses arising from use of the site. Nothing here limits liability that cannot be limited by law.

## 10. Third-party links

Links to other sites are provided for convenience. We do not control them and are not responsible for their content or privacy practices.

## 11. Changes to these terms

We may update these terms. The date above shows the current version; continued use after a change means acceptance.

## 12. Governing law

These terms are governed by the law of ${country}. Disputes are subject to the courts of that jurisdiction, except where consumer law in your country of residence gives you the right to bring a claim locally.

## 13. Contact

Questions about these terms: ${email}`;
}

export interface CookieChecklistItem {
  id: string;
  label: string;
  detail: string;
}

export const COOKIE_CHECKLIST: CookieChecklistItem[] = [
  {
    id: "inventory",
    label: "List every cookie and storage key you set",
    detail: "Name, purpose, provider, duration and whether it is first- or third-party. Browsers' developer tools show what is actually stored.",
  },
  {
    id: "classify",
    label: "Classify each one as strictly necessary or optional",
    detail: "Login sessions and CSRF tokens are necessary. Analytics, advertising and preference cookies are optional and need consent in the EU/UK.",
  },
  {
    id: "block-before-consent",
    label: "Block optional cookies until consent is given",
    detail: "Loading the analytics script and then asking permission is not consent. Nothing optional should fire before the choice.",
  },
  {
    id: "refuse-as-easy",
    label: "Make refusing as easy as accepting",
    detail: "A banner with only “Accept” fails the freely-given requirement. Provide a clear reject path on the same layer.",
  },
  {
    id: "granular",
    label: "Offer granular choices",
    detail: "Separate toggles for analytics, advertising and preferences. All-or-nothing consent is weaker and harder to defend.",
  },
  {
    id: "withdraw",
    label: "Provide a persistent way to change your mind",
    detail: "A cookie settings link in the footer, available after the banner is dismissed.",
  },
  {
    id: "record",
    label: "Record consent",
    detail: "Store what was consented to and when, so you can demonstrate it. Do not store it in a cookie that itself needs consent.",
  },
  {
    id: "disclose",
    label: "Document everything in a cookie policy",
    detail: "A table of cookies with purposes and durations, linked from the banner and the footer.",
  },
  {
    id: "third-parties",
    label: "Check your third parties",
    detail: "Embeds such as video players and tag managers can set cookies you never intended. Audit them or use a two-click embed.",
  },
  {
    id: "expiry",
    label: "Set sensible lifetimes",
    detail: "Consent records typically last six to twelve months; session cookies should expire with the session.",
  },
  {
    id: "review",
    label: "Review after every change",
    detail: "Adding a font CDN or an analytics tool can silently add cookies. Re-check the inventory after each deploy.",
  },
  {
    id: "global",
    label: "Consider visitors outside the EU",
    detail: "California, Brazil and other regimes have their own rules. The safest baseline is opt-in for anything non-essential, everywhere.",
  },
];
