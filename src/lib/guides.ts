export interface GuideSection {
  heading: string;
  paragraphs: string[];
  list?: string[];
}

export interface Guide {
  slug: string;
  title: string;
  description: string;
  updated: string;
  readingMinutes: number;
  intro: string;
  sections: GuideSection[];
  toolSlugs: string[];
}

export const guides: Guide[] = [
  {
    slug: "how-reading-time-is-calculated",
    title: "How reading time is calculated (and why 225 words per minute)",
    description:
      "Where reading-speed estimates come from, why the number varies, and how to adjust it for technical content, scripts and screen readers.",
    updated: "2 November 2025",
    readingMinutes: 5,
    intro:
      "Reading time appears on nearly every article and takes about two seconds to produce. It is also almost always wrong in one direction: it underestimates how long a dense technical article will actually take. Understanding where the number comes from makes it more useful.",
    sections: [
      {
        heading: "The standard estimate",
        paragraphs: [
          "The figure used by most publishing tools — including the word counter on this site — is 225 words per minute for silent adult reading. It sits in the middle of the widely cited 200–250 wpm range, which comes from studies of adult reading of ordinary prose.",
          "Medium popularised a variant of about 265 wpm for blog posts, based on its own internal data. Newsrooms often use 200 wpm to allow for skimming and re-reading. There is no single correct number, and any figure is a convention rather than a measurement of your readers.",
        ],
      },
      {
        heading: "Why the estimate drifts",
        paragraphs: [
          "Comprehension speed depends on far more than word count. A page of legal text with nested clauses takes longer per word than a listicle. Reading on a phone is slower than reading on a large monitor. Non-native speakers read more slowly in a second language, and screen-reader users listen at rates that have nothing to do with visual reading.",
          "Word count also ignores structure. A 1,000-word article with subheadings, short paragraphs and a summary is faster to absorb than the same words in four dense blocks, because scanning is part of reading.",
        ],
        list: [
          "Technical or legal content: assume 150–180 wpm.",
          "Conversational blog posts: 200–250 wpm is reasonable.",
          "Scripts read aloud: 130–150 wpm, which is slower than silent reading.",
          "Screen-reader listening at 2× speed: roughly 400–500 words per minute of content, but comprehension varies enormously.",
        ],
      },
      {
        heading: "What to do with the number",
        paragraphs: [
          "Treat reading time as a courtesy label, not a precision instrument. Round it generously — 'about 6 minutes' is more honest than '5 min 47 sec' — and adjust the assumption for your content type. On a technical article, a slightly overestimated reading time is better than one that implies a two-minute skim.",
          "If you publish audio or video versions, compute their duration separately. A five-minute read is not a five-minute listen: spoken delivery at 140 wpm stretches the same script by roughly 60%.",
        ],
      },
      {
        heading: "Doing it yourself",
        paragraphs: [
          "Divide the word count by the reading speed in words per minute, then multiply by 60 to get seconds. To keep the label stable while you edit, recompute only when the word count changes by more than about 5%. The word counter shows both reading and speaking estimates and updates as you type.",
        ],
      },
    ],
    toolSlugs: ["word-counter", "keyword-density-analyzer"],
  },
  {
    slug: "percentage-change-vs-percentage-points",
    title: "Percentage change vs percentage points: the difference that misleads",
    description:
      "A move from 10% to 12% is a 2 percentage-point rise or a 20% increase. Both are true, and using the wrong one changes the story.",
    updated: "2 November 2025",
    readingMinutes: 5,
    intro:
      "Most numerical errors in journalism and business reporting are not arithmetic mistakes. They come from describing the right number the wrong way. The percentage-point confusion is the most common example, and it is worth ten minutes to fix permanently.",
    sections: [
      {
        heading: "Two different questions",
        paragraphs: [
          "Imagine a risk falling from 4% to 2%. You can say it halved — a 50% relative reduction — or that it fell by 2 percentage points. Both statements are correct, but they answer different questions: 'how much did the rate change compared with itself?' versus 'how much did the rate change in absolute terms?'",
          "The distinction matters because a 50% reduction sounds dramatic while 2 points sounds modest, even though they describe the same event. A writer choosing between them is choosing a frame, whether or not they realise it.",
        ],
      },
      {
        heading: "The formulas",
        paragraphs: [
          "Percentage change divides the difference by the starting value: ((new − old) ÷ |old|) × 100. Percentage points are simply the arithmetic difference between two percentages: new − old.",
          "Absolute change is the raw difference in the underlying unit — dollars, people, days. It is the figure to use when the size of the effect is what matters, and it is the one most often missing from summaries.",
        ],
        list: [
          "10% → 12%: +2 percentage points, +20% relative change.",
          "50% → 40%: −10 percentage points, −20% relative change.",
          "1% → 2%: +1 percentage point, +100% relative change.",
        ],
      },
      {
        heading: "The asymmetry trap",
        paragraphs: [
          "Percentage change is not symmetric. If a price rises 50% and then falls 50%, it does not return to its starting point: 100 → 150 → 75. Recovering requires a larger percentage than the loss, which is why an investment that drops 30% needs a 43% gain to break even.",
          "This asymmetry is also why stacked discounts do not add. Two 20% discounts compound to 36% off, not 40%, because the second applies to the reduced price.",
        ],
      },
      {
        heading: "How to state it clearly",
        paragraphs: [
          "Give the absolute numbers alongside any percentage. 'The rate fell from 4% to 2%' contains everything a reader needs; 'the rate was cut in half' is accurate but incomplete on its own. If you must choose one framing, say which one it is.",
          "For small bases, avoid percentages entirely: a change from 1 case to 2 is a 100% increase and also one additional case. Lead with the count.",
        ],
      },
    ],
    toolSlugs: ["percentage-change-calculator", "percentage-calculator", "discount-calculator"],
  },
  {
    slug: "encoding-vs-encryption",
    title: "Base64 is not encryption — encoding, hashing and encryption explained",
    description:
      "Three operations that look similar and do completely different jobs. Getting them confused causes real security bugs.",
    updated: "2 November 2025",
    readingMinutes: 6,
    intro:
      "A Base64 string looks like ciphertext: random characters, no spaces, obviously not meant to be read. That resemblance causes a specific class of bug, where an encoded value is treated as if it were protected. It is not — anyone can decode it in a browser console in under a second.",
    sections: [
      {
        heading: "Encoding: change the representation, keep the meaning",
        paragraphs: [
          "Encoding converts data into a different format so it can survive transport. Base64 exists because some channels — email headers, JSON strings, URL paths — only accept text. It maps every three bytes onto four printable characters, which is why encoded data is about 33% larger.",
          "There is no key. Decoding is the inverse transformation and requires no secret. Base64's purpose is compatibility, not confidentiality.",
        ],
      },
      {
        heading: "Hashing: a one-way fingerprint",
        paragraphs: [
          "A hash function maps input of any length to a fixed-length digest. The same input always produces the same digest; a one-character change produces a completely different one. You cannot reverse a hash to recover the input.",
          "Hashes are used for integrity checks — comparing a downloaded file against a published SHA-256 value — and for storing passwords, though only with a deliberately slow, salted algorithm such as Argon2id or bcrypt. A plain SHA-256 hash of a password is not safe, because fast hashing makes offline guessing cheap.",
        ],
      },
      {
        heading: "Encryption: confidentiality with a key",
        paragraphs: [
          "Encryption transforms data using a key so that only someone with the key can reverse it. This is the only one of the three that protects confidentiality, and it depends entirely on key management — an encrypted file with a shared password in the same folder is not protected.",
          "Encryption also does not guarantee integrity by itself. Modern constructions such as AES-GCM add authentication so that tampering is detected, which is why 'encrypt then MAC' or authenticated modes are the default recommendation.",
        ],
      },
      {
        heading: "A quick decision guide",
        paragraphs: [
          "Ask what you are trying to achieve. If the data must survive a channel that only accepts text, encode. If you need to check whether something changed, hash. If nobody else may read it, encrypt — and then think hard about where the key lives.",
        ],
        list: [
          "Embedding an image in CSS or JSON → Base64 encode.",
          "Verifying a download → SHA-256 hash.",
          "Storing user passwords → salted Argon2id/bcrypt, never plain SHA.",
          "Sending a secret to a colleague → end-to-end encrypted channel, not Base64.",
          "Decoding a JWT to debug claims → Base64URL decode (this does not verify it).",
        ],
      },
      {
        heading: "Why this matters on a tools site",
        paragraphs: [
          "Utilities that encode, hash or decode are convenient places to accidentally paste production secrets. That is why the tools on this site run entirely in your browser and never transmit input — but a decoded token is still visible on screen. Never paste a live credential into a page you do not trust, and rotate anything that may have been exposed.",
        ],
      },
    ],
    toolSlugs: ["base64-encoder-decoder", "hash-generator", "jwt-decoder"],
  },
  {
    slug: "how-to-choose-a-strong-password",
    title: "How to choose a strong password (and actually remember it)",
    description:
      "Length beats complexity, reuse is the real risk, and a password manager solves both. A practical guide without the myths.",
    updated: "2 November 2025",
    readingMinutes: 5,
    intro:
      "Password advice has been repeated so often that the myths have outlived the facts. Special characters and 90-day rotations were plausible in 2005 and are actively counterproductive now. Here is what the evidence supports.",
    sections: [
      {
        heading: "Length is the lever that matters",
        paragraphs: [
          "An attacker guessing at random has to try a space that grows exponentially with each additional character. Adding four characters multiplies the work enormously; adding a symbol only multiplies it by the size of the symbol set. Length is the better investment, which is why current guidance emphasises minimum lengths of 12–16 characters rather than complexity rules.",
          "Entropy in bits is roughly length × log₂(alphabet size). A 16-character password drawn from 94 printable characters has about 104 bits — beyond any feasible brute-force attack. A 12-character password from letters and digits only has about 71 bits, still strong but with less margin.",
        ],
      },
      {
        heading: "Reuse is the real vulnerability",
        paragraphs: [
          "Most account compromises do not come from cracking a strong password. They come from a breach at one service, where a stolen email and password pair is replayed against other sites. If you reuse a password, one breach becomes many.",
          "This is why the single most valuable habit is not a clever password scheme but a password manager: unique values per site, generated automatically, so a breach of one account cannot unlock another.",
        ],
      },
      {
        heading: "Passphrases versus random strings",
        paragraphs: [
          "A passphrase of four to six randomly chosen words is easier to type on a phone and easier to remember than a random string of the same strength. The words must be chosen randomly — a memorable phrase you invented yourself is usually far weaker than it feels.",
          "For values you never type — API keys, database passwords, service accounts — use maximum-length random strings and store them in a manager or secret store.",
        ],
      },
      {
        heading: "Practical rules",
        paragraphs: [
          "These are the habits worth keeping. Everything else is optional.",
        ],
        list: [
          "Use a password manager and let it generate every password.",
          "Aim for 16+ characters on anything important; 12 is a floor for legacy systems.",
          "Turn on two-factor authentication, preferably an app or hardware key rather than SMS.",
          "Never reuse a password, even a 'throwaway' one, on an account that can reset others.",
          "Do not rotate on a calendar — change on suspicion or after a breach notice.",
          "Check breach exposure occasionally and change the affected credentials first.",
          "Never send a password over chat or email; use a manager's sharing feature instead.",
        ],
      },
      {
        heading: "What to ignore",
        paragraphs: [
          "Ignore advice to substitute letters with numbers (P@ssw0rd) — cracking tools know those substitutions. Ignore forced 90-day rotation, which produces predictably incremental passwords. Ignore security questions with real answers: treat them as additional passwords and store invented answers in your manager.",
        ],
      },
    ],
    toolSlugs: ["password-generator", "hash-generator"],
  },
];

export const guideMap = new Map(guides.map((guide) => [guide.slug, guide]));
