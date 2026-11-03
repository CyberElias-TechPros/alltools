import type { ToolDefinition } from "../types";

export const securityTools: ToolDefinition[] = [
  {
    slug: "password-generator",
    name: "Secure Password Generator",
    category: "security",
    tagline: "Create strong random passwords with a live entropy estimate.",
    intent: "generate a strong random password",
    keywords: [
      "password generator",
      "strong password generator",
      "random password",
      "secure password",
      "passphrase generator",
    ],
    status: "live",
    actions: ["copy"],
    effort: "instant",
    popularity: 90,
    addedAt: "2025-02-20",
    seoTitle: "Strong Password Generator — Cryptographically Secure",
    seoDescription:
      "Generate strong random passwords in your browser with crypto.getRandomValues. Adjust length and character sets and see the entropy estimate.",
    content: {
      intro: [
        "A strong password is long, random and unique to one service. This generator uses the browser's cryptographically secure random number generator — the same source used for TLS keys — and never uses Math.random, which is predictable enough to be a real weakness.",
        "Nothing is stored, logged or transmitted: generated passwords exist only in the page's memory until you navigate away. The entropy meter tells you how much guessing resistance the current settings provide.",
      ],
      howTo: [
        "Choose a length. Twelve characters is a minimum; sixteen or more is better.",
        "Select which character sets to include.",
        "Read the entropy estimate and the approximate time to crack.",
        "Copy the password straight into your password manager.",
      ],
      method: {
        title: "Entropy and how it is calculated",
        paragraphs: [
          "Entropy in bits is the base-2 logarithm of the number of possible passwords: length × log₂(alphabet size). A 16-character password from 94 printable ASCII characters has about 104 bits of entropy — far beyond any feasible brute-force attack.",
          "Characters are chosen with rejection sampling over crypto.getRandomValues so that every character in the alphabet is equally likely. Each selected set is guaranteed at least one character, which slightly reduces entropy but prevents policy rejections.",
        ],
        formula: "entropy ≈ length × log₂(alphabet size)",
      },
      examples: [
        {
          title: "A 16-character password with all character sets",
          steps: ["Set length to 16.", "Enable upper, lower, digits and symbols."],
          result: "About 104 bits of entropy — effectively uncrackable by brute force",
        },
        {
          title: "A 12-character password, letters and digits only",
          steps: ["Length 12, alphabet size 62.", "12 × log₂(62) ≈ 71.5 bits."],
          result: "Strong, but consider 16 characters for long-term credentials",
        },
      ],
      limitations: [
        "Entropy describes resistance to guessing — it does not protect against phishing, keyloggers, malware or password reuse.",
        "Some sites reject symbols or impose short maximum lengths; those sites are weakening their own security.",
        "A copied password can leak through clipboard history. Clear your clipboard after pasting into a manager.",
      ],
      faqs: [
        {
          q: "How long should a password be?",
          a: "NIST guidance emphasises length over complexity. Use at least 12 characters for legacy systems and 16 or more for anything important, ideally generated and stored in a password manager.",
        },
        {
          q: "Are these passwords stored anywhere?",
          a: "No. Generation happens entirely in your browser using Web Crypto; there is no network request and no storage.",
        },
        {
          q: "Should I use a passphrase instead?",
          a: "Passphrases are easier to type and remember. Four to six random words from a large list provide strong entropy, but random characters remain stronger per character.",
        },
        {
          q: "How often should I change my password?",
          a: "Current guidance is not to rotate on a schedule, but to change immediately after any breach, suspected compromise or reuse across sites.",
        },
      ],
    },
  },
];
