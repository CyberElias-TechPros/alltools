import type { ToolDefinition } from "../types";

/**
 * Section L additions. Every tool here runs on Web Crypto or on text the user
 * typed — no key server, no blocklist service, no upload. The secure password
 * generator from section L already exists as `password-generator`.
 */
export const securityMoreTools: ToolDefinition[] = [
  {
    slug: "password-strength-checker",
    name: "Password Strength Checker",
    category: "security",
    tagline: "Estimate entropy, spot weak patterns and see crack times.",
    intent: "check password strength",
    keywords: ["password strength checker", "password entropy", "how strong is my password", "password crack time", "password tester", "password security check"],
    status: "live",
    actions: ["copy"],
    effort: "instant",
    popularity: 86,
    addedAt: "2025-03-02",
    seoTitle: "Password Strength Checker — Entropy and Crack Time",
    seoDescription:
      "Test a password with a local entropy estimate, pattern penalties and a crack-time table. Nothing you type is transmitted, stored or logged.",
    content: {
      intro: [
        "Password meters in signup forms usually count character classes and reward a symbol, which is why “P@ssw0rd1” passes everything while a four-word passphrase is called weak. This checker estimates entropy instead, then subtracts for the things attackers actually try first: dictionary words, keyboard runs, repeated characters and years.",
        "It runs in the page. There is no request, no storage and no logging, so the password can be a real one — though the honest advice is still to test a variant of it, not the credential itself.",
      ],
      howTo: [
        "Type or paste a password into the field.",
        "Read the entropy figure in bits and the label above it.",
        "Check the warning list for patterns the score penalised.",
        "Compare the crack-time row for an offline attack against a slow hash and a fast one.",
        "Use the suggestions to decide what to change — usually length.",
      ],
      method: {
        title: "How the estimate is built",
        paragraphs: [
          "The base score is length × log₂(alphabet size), where the alphabet is the number of distinct character classes present: lowercase, uppercase, digits, symbols and any non-ASCII characters. That is the same model used to describe the strength of a randomly generated password.",
          "Human-chosen passwords are not random, so the raw figure overstates them. The estimator applies penalties for entries on a short list of common passwords, for repeated or sequential characters, for keyboard walks, for years and for looks like a word plus a digit. Each penalty is subtracted from the bonus rather than from the base, so the result is an upper bound on real strength.",
          "Crack times divide 2^bits by a guessed rate: roughly 10⁹ guesses per second for a fast hash such as unsalted MD5 on a GPU, and thousands per second for a memory-hard hash such as bcrypt or Argon2.",
        ],
        formula: "entropy ≈ length × log₂(alphabet size) − pattern penalties",
      },
      examples: [
        {
          title: "A classic “complex” password",
          steps: ["Enter P@ssw0rd1.", "Read the common-password penalty.", "Compare against the 10-character alphabet estimate."],
          result: "Around 40 bits after penalties — crackable offline in minutes",
        },
        {
          title: "A four-word passphrase",
          steps: ["Enter four unrelated lowercase words.", "Note the length-based entropy.", "Check that no dictionary penalty applies."],
          result: "Above 70 bits with no symbol at all",
        },
      ],
      limitations: [
        "Entropy is a model of guessing, not a measurement. A password can be long and still guessable if it follows a pattern the model does not know.",
        "The common-password list is short and English-weighted; a password built from another language, a local name or a personal reference can score well and still be weak.",
        "The tool cannot see breach exposure. A password that is strong but already in a leaked database is compromised — check it against a breach service, which by definition requires a network call this site does not make.",
        "Nothing here protects against phishing, keyloggers or reuse across sites, which cause more account takeovers than brute force.",
      ],
      faqs: [
        {
          q: "Is my password sent anywhere?",
          a: "No. The analysis is a pure function over the string, run in the page. There is no fetch, no WebSocket and no storage call in this tool.",
        },
        {
          q: "How many bits is strong enough?",
          a: "Around 70–80 bits is comfortable for a password manager–generated secret. Anything below 50 bits should be treated as breakable offline by a motivated attacker.",
        },
        {
          q: "Why is my 12-character password rated weak?",
          a: "Almost always because it is a word plus digits, a keyboard walk or a known pattern. The estimator subtracts for those, which is closer to how cracking tools work than a length-only score.",
        },
        {
          q: "Should I use this instead of a password manager?",
          a: "No. A manager generates genuinely random passwords and remembers them. This tool is for understanding why one password is better than another.",
        },
      ],
    },
  },
  {
    slug: "random-token-generator",
    name: "Random Token Generator",
    category: "security",
    tagline: "Cryptographically secure API keys in hex, base64 or base64url.",
    intent: "generate a random token",
    keywords: ["random token generator", "api key generator", "secure random string", "hex token", "base64 token", "nonce generator", "secret key generator"],
    status: "live",
    actions: ["copy", "download"],
    effort: "instant",
    popularity: 72,
    addedAt: "2025-03-02",
    seoTitle: "Random Token Generator — Hex, Base64, Base64url",
    seoDescription:
      "Generate cryptographically secure tokens and API keys as hex, base64, base64url or alphanumeric strings, with byte length, entropy and copy or download.",
    content: {
      intro: [
        "A token is only as good as its randomness. Tokens built from timestamps, counters or Math.random are guessable, and a guessable API key is an authentication bypass. This generator draws bytes from crypto.getRandomValues — the browser's CSPRNG — and formats them without touching the network.",
        "Byte count is the setting that matters, not character count. Format decides how many characters those bytes occupy: 32 bytes become 64 hex characters, 44 base64 characters or 43 base64url characters.",
      ],
      howTo: [
        "Pick a byte length — 16 for a nonce, 32 for an API key, 64 for a signing secret.",
        "Choose the encoding your system expects.",
        "Generate one token, or a batch up to fifty.",
        "Copy a single token, or download the batch as a text file.",
      ],
      method: {
        title: "Entropy, encoding and why bytes come first",
        paragraphs: [
          "Every byte contributes exactly eight bits of entropy, so a 32-byte token has 256 bits regardless of how it is printed. Encodings are just alphabets: hex uses 4 bits per character, base64 uses 6, base64url swaps + and / for - and _ so the token survives in a URL, and the alphanumeric mode maps to a 62-character alphabet which wastes a little entropy per character but avoids escaping entirely.",
          "Base64 output includes padding unless the byte count is a multiple of three. Padding is fine in a header, awkward in a URL path, which is the practical reason base64url exists.",
        ],
        formula: "entropy = bytes × 8 bits",
      },
      examples: [
        {
          title: "An API key for a header",
          steps: ["Set 32 bytes.", "Choose hex.", "Copy the 64-character string into your secret store."],
          result: "256 bits of entropy, safe to paste in an Authorization header",
        },
        {
          title: "A URL-safe identifier",
          steps: ["Set 16 bytes.", "Choose base64url.", "Use the 22-character result in a reset link."],
          result: "128 bits, no escaping needed in a query string",
        },
      ],
      limitations: [
        "A token generated here is shown in the page and may persist in browser history, clipboard managers or screenshots. Generate production secrets inside your secret manager where possible.",
        "Randomness quality depends on the browser's CSPRNG. That is sound on every current browser, but a compromised or ancient environment is outside the tool's control.",
        "This tool does not store tokens, and it cannot recover one you navigated away from.",
      ],
      faqs: [
        {
          q: "How long should an API key be?",
          a: "At least 128 bits, so 16 bytes. 256 bits (32 bytes) is the common choice for long-lived credentials because it removes any doubt.",
        },
        {
          q: "Is Math.random ever acceptable?",
          a: "Not for anything an attacker benefits from predicting. It is fine for choosing a random colour in a demo, not for tokens, nonces, session IDs or keys.",
        },
        {
          q: "What is base64url?",
          a: "Standard base64 with + and / replaced by - and _ and padding dropped, so the token can appear in a URL or filename without percent-encoding.",
        },
        {
          q: "Can I generate a UUID here?",
          a: "A 16-byte hex token is not a formal UUID because it lacks the version and variant bits. Use the UUID generator for RFC 4122 identifiers.",
        },
      ],
    },
  },
  {
    slug: "hash-calculator",
    name: "Hash Calculator",
    category: "security",
    tagline: "MD5, SHA-1, SHA-256, SHA-384 and SHA-512 for text or files.",
    intent: "calculate a hash",
    keywords: ["hash calculator", "hash generator", "md5 hash", "sha256 hash", "checksum calculator", "hash text online", "file hash"],
    status: "live",
    actions: ["copy"],
    effort: "instant",
    popularity: 80,
    addedAt: "2025-03-02",
    seoTitle: "Hash Calculator — MD5, SHA-1, SHA-256, SHA-512",
    seoDescription:
      "Hash text or a local file with MD5, SHA-1, SHA-256, SHA-384 and SHA-512 in the browser, then compare every digest against an expected checksum.",
    content: {
      intro: [
        "A hash turns any input into a fixed-length fingerprint. Change one byte and the digest changes completely, which is why hashes are used to verify downloads and to detect tampering. This tool computes five digests at once and can check them against a checksum you were given.",
        "SHA-2 and SHA-3 are computed by Web Crypto, which is native and fast. MD5 is not exposed by Web Crypto at all, so it is implemented locally in the page for compatibility with legacy manifests — it is offered only because old systems still print MD5 sums.",
      ],
      howTo: [
        "Type text, or switch to a file up to 200 MB.",
        "Read the digest for each algorithm.",
        "Paste an expected checksum to compare it character by character.",
        "Copy the digest your system needs.",
      ],
      method: {
        title: "One input, several fingerprints",
        paragraphs: [
          "MD5 produces 128 bits, SHA-1 160 bits, SHA-256 256 bits and SHA-512 512 bits. The digest is usually written as lowercase hex, two characters per byte, so SHA-256 is 64 characters and SHA-512 is 128.",
          "Collision resistance is what separates them. MD5 and SHA-1 have practical collisions and must not be used to prove that two files differ in an adversarial setting; they are fine for deduplication where nobody is attacking you. SHA-256 and SHA-512 have no known practical collisions.",
          "Files are read as bytes and streamed in chunks, so the hash is over the file's exact contents. A trailing newline added by an editor changes the digest — the usual cause of a checksum that “should” match.",
        ],
        formula: "digest = H(input bytes), fixed length per algorithm",
      },
      examples: [
        {
          title: "Verifying a download",
          steps: ["Switch to file mode.", "Choose the .zip you downloaded.", "Paste the SHA-256 from the vendor's page."],
          result: "Match, or a precise mismatch warning — corruption or tampering",
        },
        {
          title: "Hashing an API payload",
          steps: ["Paste the exact JSON body.", "Copy the SHA-256 digest.", "Compare it with the value your server computes."],
          result: "Identical 64-character digests when the bytes agree",
        },
      ],
      limitations: [
        "A matching hash proves the bytes are identical to what was hashed — it says nothing about whether those bytes are safe to run.",
        "MD5 and SHA-1 are broken for collision resistance. Never use them for signatures, certificates or anything an attacker could benefit from forging.",
        "Hashing is not encryption. There is no key and no way back, which is the point.",
      ],
      faqs: [
        {
          q: "Which algorithm should I use?",
          a: "SHA-256 unless a system requires otherwise. SHA-512 is equally sound and faster on 64-bit hardware; MD5 and SHA-1 exist here for legacy verification only.",
        },
        {
          q: "Why does my file hash differ from the published one?",
          a: "Usually a different file version, a partial download, or text-mode transfer converting line endings. Re-download and hash the raw file, not a copy opened and re-saved by an editor.",
        },
        {
          q: "Is my file uploaded?",
          a: "No. The browser reads the file through the File API and hashes it locally. Nothing leaves the device, which is why large files work without a queue or a timeout.",
        },
      ],
    },
  },
  {
    slug: "text-encryption-demo",
    name: "Text Encryption Demo",
    category: "security",
    tagline: "AES-256-GCM with a PBKDF2-derived key, sealed in your browser.",
    intent: "encrypt text in the browser",
    keywords: ["text encryption", "aes gcm online", "encrypt text with password", "client side encryption", "decrypt text online", "pbkdf2 demo"],
    status: "live",
    actions: ["copy"],
    effort: "instant",
    popularity: 66,
    addedAt: "2025-03-02",
    seoTitle: "Text Encryption Demo — AES-GCM in the Browser",
    seoDescription:
      "Encrypt and decrypt text with AES-256-GCM and a PBKDF2-derived key entirely in your browser, and see exactly what a passphrase-protected payload contains.",
    content: {
      intro: [
        "This is a working demonstration of authenticated encryption, not a vault. You supply text and a passphrase; the page derives a key with PBKDF2, encrypts with AES-256-GCM and base64-encodes salt, IV and ciphertext into one string you can copy.",
        "The distinction that matters: the ciphertext is real AES-GCM output, but a demo page cannot promise that the device, the browser extensions or the clipboard are clean. For actual secrets, use an audited tool.",
      ],
      howTo: [
        "Paste the text you want to protect.",
        "Choose a passphrase with real entropy — the key is only as strong as this.",
        "Encrypt and copy the combined string (salt | IV | ciphertext).",
        "To read it back, paste the combined string with the same passphrase.",
      ],
      method: {
        title: "What the combined string contains",
        paragraphs: [
          "PBKDF2-SHA-256 with 210,000 iterations stretches the passphrase into a 256-bit AES key. A random 16-byte salt makes the same passphrase produce a different key on every encryption, which defeats precomputed tables.",
          "A 12-byte random IV gives GCM its uniqueness guarantee. Reusing an IV with the same key breaks GCM catastrophically, which is why it is generated fresh per message rather than derived.",
          "The output is base64 of salt (16 bytes) followed by IV (12 bytes) followed by ciphertext and the 16-byte GCM authentication tag. On decryption the tag is verified first: a wrong passphrase or an altered payload fails with an authentication error instead of returning garbage.",
        ],
        formula: "key = PBKDF2-SHA256(passphrase, salt, 210000) → AES-256-GCM(key, iv, plaintext)",
      },
      examples: [
        {
          title: "Protecting a note",
          steps: ["Paste the note.", "Use a long passphrase.", "Copy the combined base64 string into a message or file."],
          result: "Unreadable without the passphrase; tampering is detected",
        },
        {
          title: "A wrong passphrase",
          steps: ["Paste a ciphertext you made earlier.", "Type a passphrase with one letter changed.", "Decrypt."],
          result: "Authentication failure — no partial plaintext is returned",
        },
      ],
      limitations: [
        "This is a demonstration. It has not been audited, and it is not a replacement for a password manager or a dedicated encryption tool.",
        "If the page is compromised, or a malicious extension is installed, the plaintext and passphrase are exposed regardless of the cipher.",
        "A forgotten passphrase cannot be recovered. There is no key escrow, no account and no server-side copy.",
        "AES-GCM protects confidentiality and integrity of the message; it does not hide that a message exists or how long it is.",
      ],
      faqs: [
        {
          q: "Is this safe for real secrets?",
          a: "The cryptography is standard, but the delivery is a web page. For anything that matters, use an audited local tool such as age, GnuPG or your password manager's secure notes.",
        },
        {
          q: "Can I decrypt a payload made here somewhere else?",
          a: "Yes, if you implement the same recipe: base64 salt, IV and ciphertext, PBKDF2-SHA-256 with 210,000 iterations, AES-256-GCM with the tag appended.",
        },
        {
          q: "Why 210,000 iterations?",
          a: "It follows OWASP's PBKDF2-SHA-256 guidance, which raises the cost of guessing a passphrase offline without making the page feel slow.",
        },
        {
          q: "Does the passphrase get stored?",
          a: "No. It exists in memory while the page is open. Reloading clears it, and nothing is written to storage or sent over the network.",
        },
      ],
    },
  },
  {
    slug: "file-checksum-calculator",
    name: "File Checksum Calculator",
    category: "security",
    tagline: "Hash a local file without uploading a single byte.",
    intent: "calculate file checksum",
    keywords: ["file checksum calculator", "sha256 file", "md5 file", "file hash checker", "verify download checksum", "checksum verifier"],
    status: "live",
    actions: ["copy"],
    effort: "instant",
    popularity: 74,
    addedAt: "2025-03-02",
    seoTitle: "File Checksum Calculator — SHA-256 Without Upload",
    seoDescription:
      "Compute MD5, SHA-1, SHA-256, SHA-384 or SHA-512 checksums for a local file. The file is read in the browser and never uploaded, with checksum comparison.",
    content: {
      intro: [
        "Most checksum tools upload your file to a server, which is absurd for the case that matters: verifying an installer, a backup or a signed document before you trust it. This one reads the file through the File API and hashes it in the page.",
        "Because nothing is transferred, size is limited only by memory rather than by an upload timeout. A 200 MB file is hashed in a few seconds on a normal machine.",
      ],
      howTo: [
        "Choose a file from your device.",
        "Wait for the digest cards to fill — large files take a moment.",
        "Paste the checksum published by the vendor to compare.",
        "Copy the digest that matches the format the vendor used.",
      ],
      method: {
        title: "Local hashing, and why it matters",
        paragraphs: [
          "The file is read as bytes with the File API and passed to Web Crypto, with MD5 computed by the local implementation for legacy sums. No form submission, no multipart upload, no progress bar pretending to be a network transfer.",
          "A checksum verifies integrity, not authenticity. If an attacker controls both the download and the checksum page, both will agree. For authenticity you need a signature — checksums published over HTTPS on the vendor's own domain are the practical middle ground.",
        ],
        formula: "digest = H(file bytes) — computed on device",
      },
      examples: [
        {
          title: "Verifying a Linux ISO",
          steps: ["Select the .iso.", "Copy the SHA-256 digest.", "Compare against the value in SHA256SUMS."],
          result: "Identical digests confirm the download completed intact",
        },
        {
          title: "Spotting a truncated archive",
          steps: ["Hash an archive that fails to open.", "Hash the same archive re-downloaded.", "Compare."],
          result: "Different digests prove the first copy was damaged",
        },
      ],
      limitations: [
        "Checksums prove integrity, not safety. A hash match does not mean a file is free of malware.",
        "Very large files are held in memory during hashing; the tool caps at 200 MB to avoid freezing a tab.",
        "MD5 and SHA-1 remain available for compatibility but are not collision-resistant.",
      ],
      faqs: [
        {
          q: "Is my file really not uploaded?",
          a: "Correct. There is no server endpoint for this tool; the bytes are read from the file input and hashed in the page. You can verify with the network panel.",
        },
        {
          q: "Why does the checksum differ after I edit the file?",
          a: "Any change alters the digest, including metadata that editors rewrite on save. Hash the original file, not a re-saved copy.",
        },
        {
          q: "Can I hash several files at once?",
          a: "This tool hashes one file at a time so the digests stay associated with a name. Repeat for each file, or use a batch hasher for large sets.",
        },
      ],
    },
  },
  {
    slug: "sha-256-generator",
    name: "SHA-256 Generator",
    category: "security",
    tagline: "Generate a SHA-256 digest of any text, instantly and locally.",
    intent: "generate sha256 hash",
    keywords: ["sha256 generator", "sha 256 hash online", "sha256 text", "generate sha256", "sha256 checksum", "sha256 converter"],
    status: "live",
    actions: ["copy"],
    effort: "instant",
    popularity: 78,
    addedAt: "2025-03-02",
    seoTitle: "SHA-256 Generator — Hash Any Text Instantly",
    seoDescription:
      "Generate the SHA-256 hash of any text in your browser, compare it against an expected digest and understand why the output is always 64 characters.",
    content: {
      intro: [
        "SHA-256 maps any input — one character or a gigabyte — to 256 bits, written as 64 hexadecimal characters. It is the default choice for integrity checks, content addressing and signatures, because no practical collision has ever been found.",
        "This page hashes text as you type, using Web Crypto. There is no upload and no round trip, so you can hash a private key fragment or an internal document without it leaving the machine.",
      ],
      howTo: [
        "Type or paste the exact text you want hashed.",
        "Read the 64-character digest, lowercase hex by default.",
        "Switch to uppercase if a system expects that form.",
        "Paste an expected value to check it matches byte for byte.",
      ],
      method: {
        title: "Deterministic, one-way, fixed length",
        paragraphs: [
          "SHA-256 processes the input in 512-bit blocks through 64 rounds of a compression function. The digest is deterministic — the same bytes always produce the same output — and one-way, so you cannot reconstruct the input from it.",
          "Whitespace counts. A trailing newline, a non-breaking space copied from a document, or a capitalisation change produces a completely different digest. That is the function working as designed, and the most common source of “the hashes do not match”.",
        ],
        formula: "digest = SHA-256(input), 32 bytes = 64 hex characters",
      },
      examples: [
        {
          title: "Hashing a short string",
          steps: ["Type hello.", "Read the digest.", "Change one letter and watch all 64 characters change."],
          result: "Avalanche effect — no resemblance between the two outputs",
        },
        {
          title: "Comparing a published hash",
          steps: ["Paste the string you received.", "Paste the expected digest.", "Read the match or mismatch verdict."],
          result: "A match is byte-identical; a mismatch means the input differs",
        },
      ],
      limitations: [
        "A hash is not a signature: anyone can compute one, so it proves integrity only when the expected value comes from a trusted source.",
        "SHA-256 cannot be reversed. If you need a password check, use a password hash such as Argon2 or bcrypt, which are deliberately slow and salted.",
        "Hashing text in a page cannot protect against a compromised device or a malicious extension.",
      ],
      faqs: [
        {
          q: "Is SHA-256 still secure?",
          a: "Yes. There is no known practical collision or preimage attack. Quantum computers would weaken it via Grover's algorithm, but the response is longer keys, not abandonment.",
        },
        {
          q: "SHA-256 or SHA-512?",
          a: "Both are secure. SHA-512 is faster on 64-bit CPUs and produces a longer digest; SHA-256 is more widely implemented and shorter to store.",
        },
        {
          q: "Why do two different tools give different hashes for the same text?",
          a: "Almost always whitespace, encoding or line endings. Check for a trailing newline and for UTF-8 versus UTF-16 input.",
        },
        {
          q: "Can I hash a file here?",
          a: "Use the File Checksum Calculator, which reads files locally. This page is tuned for text input.",
        },
      ],
    },
  },
  {
    slug: "sha-512-generator",
    name: "SHA-512 Generator",
    category: "security",
    tagline: "512-bit digests as 128 hex characters, computed on device.",
    intent: "generate sha512 hash",
    keywords: ["sha512 generator", "sha 512 hash", "sha512 text", "generate sha512", "sha512 checksum", "512 bit hash"],
    status: "live",
    actions: ["copy"],
    effort: "instant",
    popularity: 68,
    addedAt: "2025-03-02",
    seoTitle: "SHA-512 Generator — 512-bit Hash of Any Text",
    seoDescription:
      "Generate a SHA-512 digest of any text locally in the browser. See the 128-character output and when the 512-bit variant is a better fit than SHA-256.",
    content: {
      intro: [
        "SHA-512 is the same design family as SHA-256 with a wider state: 512 bits instead of 256, written as 128 hex characters. On 64-bit processors it often runs faster than SHA-256 because its internal words match the machine word size.",
        "Choose it when a system requires a 512-bit digest, when you are hashing very large amounts of data on modern hardware, or when you simply prefer the extra margin. For ordinary integrity checks either is fine.",
      ],
      howTo: [
        "Paste the text to hash.",
        "Read the 128-character lowercase digest.",
        "Toggle uppercase for systems that store digests in that form.",
        "Compare against an expected digest if you have one.",
      ],
      method: {
        title: "Why 512 bits, and when it matters",
        paragraphs: [
          "The digest length sets the collision resistance: 512 bits gives 256 bits of collision resistance by the birthday bound, versus 128 bits for SHA-256. Neither is reachable today; the difference is margin, not necessity.",
          "SHA-512 uses 80 rounds over 1024-bit blocks with 64-bit words. On x86-64 and ARM64 that structure is a good match for the hardware, which is why benchmarks sometimes show SHA-512 outpacing SHA-256 on large inputs.",
        ],
        formula: "digest = SHA-512(input), 64 bytes = 128 hex characters",
      },
      examples: [
        {
          title: "A long configuration file",
          steps: ["Paste the file contents.", "Copy the 128-character digest.", "Store it beside the release."],
          result: "A fingerprint that changes completely on any edit",
        },
        {
          title: "Checking a vendor checksum",
          steps: ["Paste the payload.", "Paste the vendor's SHA-512 value.", "Read the verdict."],
          result: "Match confirms the exact bytes, not their trustworthiness",
        },
      ],
      limitations: [
        "A longer digest is not automatically “more secure” in practice; SHA-256 is already far beyond feasible attack.",
        "Two different tools can disagree because of encoding or trailing whitespace, not because either is wrong.",
        "For password storage neither SHA-256 nor SHA-512 is appropriate — use a salted, memory-hard function.",
      ],
      faqs: [
        {
          q: "Should I use SHA-512 instead of SHA-256?",
          a: "Only if a system asks for it or you are hashing very large inputs on 64-bit hardware. Otherwise SHA-256 is shorter and equally safe.",
        },
        {
          q: "Why is the digest 128 characters?",
          a: "512 bits divided by 4 bits per hex character. Base64 encoding would shorten it to 86 characters at the cost of a less universal format.",
        },
        {
          q: "Is SHA-512 vulnerable to length-extension attacks?",
          a: "Like SHA-256, raw SHA-512 is, which is why HMAC exists. Never build a MAC by concatenating a secret with the message and hashing it.",
        },
      ],
    },
  },
  {
    slug: "url-safety-syntax-checker",
    name: "URL Safety Syntax Checker",
    category: "security",
    tagline: "Spot the structural tricks in a suspicious link before you tap it.",
    intent: "check if a url looks safe",
    keywords: ["url safety checker", "suspicious link checker", "phishing url check", "url syntax checker", "check link before clicking", "punycode checker"],
    status: "live",
    actions: ["copy"],
    effort: "instant",
    popularity: 70,
    addedAt: "2025-03-02",
    seoTitle: "URL Safety Checker — Syntax and Phishing Tells",
    seoDescription:
      "Inspect a link for structural red flags such as punycode look-alikes, credentials in the address, odd ports and executable endings. No lookup, no logging.",
    content: {
      intro: [
        "Most phishing links are not clever at the network level; they rely on the reader misparsing the string. A subdomain called paypal.com.evil.tld, an @ that hides the real host, or a Cyrillic character that looks like an a in a Latin domain will fool a person scanning quickly.",
        "This checker parses the URL and reports those structural tells. It deliberately does not claim to know whether a site is malicious — that requires a reputation database and a network request, neither of which this site has.",
      ],
      howTo: [
        "Paste the full link, including the scheme if you have it.",
        "Read the parsed host and scheme at the top of the result.",
        "Work through the findings list, starting with the risky ones.",
        "If the host is punycode, decode it before deciding anything.",
      ],
      method: {
        title: "The tells that survive a quick look",
        paragraphs: [
          "An @ in the authority means everything before it is a username and the real host follows — a favourite trick because the eye stops at the familiar name.",
          "Punycode (an xn-- label) allows a domain to render with characters from another script that resemble Latin letters. Any legitimate internationalised brand uses it too, so it is a signal to decode, not an automatic verdict.",
          "Other checks: an explicit port other than 80 or 443, a very long host with many subdomain levels, an executable or archive file ending, an IP address where a name belongs, and http rather than https. Each is individually common and collectively informative.",
        ],
        formula: "risk = f(scheme, credentials, punycode, port, path ending, host depth)",
      },
      examples: [
        {
          title: "A credential-stuffed link",
          steps: ["Paste https://apple.com@203.0.113.9/login.", "Read the parsed host.", "See the credential warning."],
          result: "Host is the IP address, not apple.com — a strong phishing signal",
        },
        {
          title: "A look-alike domain",
          steps: ["Paste a link with an xn-- label.", "Decode the host shown in the result.", "Compare it with the brand it imitates."],
          result: "The decoded label is a homoglyph of the real brand",
        },
      ],
      limitations: [
        "This is a syntax and heuristic check, not a reputation lookup. A structurally ordinary URL can still serve malware or phishing.",
        "Legitimate internationalised domains use punycode, so a punycode finding alone is not evidence of fraud.",
        "Shortened links hide the destination entirely; the checker can only judge the shortener's own URL.",
        "No request is made to the URL — the page cannot see what the destination serves, and it does not try.",
      ],
      faqs: [
        {
          q: "Does this tool check whether a site is actually malicious?",
          a: "No. That needs a blocklist or a live lookup service. This tool only reads the string, and the page says so instead of implying a verdict it cannot support.",
        },
        {
          q: "Is a low-risk result a green light?",
          a: "No. It means the URL is structurally ordinary. Check the domain spelling, the certificate and how you received the link before entering credentials.",
        },
        {
          q: "What does an @ in a URL mean?",
          a: "The part before @ is a username for the connection, and the real host is what follows. Browsers may hide the prefix, which is exactly why it is used in attacks.",
        },
        {
          q: "Why does http matter?",
          a: "Without TLS the page can be altered in transit, so any credentials typed into it are readable by anyone on the path.",
        },
      ],
    },
  },
  {
    slug: "privacy-policy-generator",
    name: "Privacy Policy Generator",
    category: "security",
    tagline: "A structured privacy policy draft built from what you actually do.",
    intent: "generate a privacy policy",
    keywords: ["privacy policy generator", "gdpr privacy policy", "website privacy policy template", "privacy policy draft", "cookie policy generator", "free privacy policy"],
    status: "live",
    actions: ["copy", "download"],
    effort: "instant",
    popularity: 76,
    addedAt: "2025-03-02",
    seoTitle: "Privacy Policy Generator — Editable Markdown Draft",
    seoDescription:
      "Build a structured privacy policy draft from your data practices, covering collection, cookies, sharing and rights, with clear warnings about legal review.",
    content: {
      intro: [
        "A privacy policy has to describe what a specific site does. Templates fail because they either over-claim, promising rights and practices the site does not have, or under-claim and omit processing that regulators care about. This generator asks what you collect and writes only the sections that follow from your answers.",
        "It produces Markdown you can edit, not a finished legal document. Read every line and delete what does not apply — an inaccurate policy is worse than a sparse one.",
      ],
      howTo: [
        "Fill in the site name, URL, contact email and the jurisdiction you operate from.",
        "Tick only the data you actually collect — the list drives the sections written.",
        "Answer the cookie, analytics, advertising and sharing questions honestly.",
        "Read the draft, delete anything untrue and add what is missing.",
        "Have a lawyer review it before publishing, then link it in your footer.",
      ],
      method: {
        title: "What the draft is built from",
        paragraphs: [
          "The output is assembled from conditional blocks: a collection section only appears if something is collected, a cookie section only if cookies are set, and a data-sharing section names processors only where sharing is claimed. That structure is what makes the draft useful — it mirrors your actual processing rather than a generic checklist.",
          "The sections follow the shape regulators expect to find: what is collected, why, the legal basis, retention, sharing, international transfers, security, rights and contact. Under GDPR and similar regimes, ambiguity in any of those is the usual finding.",
          "The generator does not invent a legal basis, a retention period or a supervisory authority for you. Those depend on facts only you know, and guessing them would produce a document that looks authoritative and is wrong.",
        ],
        formula: "policy = static skeleton + conditional sections from selected practices",
      },
      examples: [
        {
          title: "A tools site with no accounts",
          steps: ["Tick browser-only processing and email contact.", "Leave analytics and ads unticked.", "Read the resulting short draft."],
          result: "A policy that says inputs never leave the device — accurate and defensible",
        },
        {
          title: "A site running analytics and ads",
          steps: ["Tick analytics and advertising.", "Note the consent and third-party sections that appear.", "Add the actual vendor names."],
          result: "A draft that discloses the ad-tech and cookie reality",
        },
      ],
      limitations: [
        "This is not legal advice, and no generator can tell you which laws apply to your business.",
        "You must add the names of your actual processors, retention periods and the supervisory authority you report to.",
        "A published policy must match reality. If it says you do not sell data, your tag setup must agree.",
        "The output is not reviewed by a lawyer; treat it as a structured first draft.",
      ],
      faqs: [
        {
          q: "Do I need a privacy policy if my site has no accounts?",
          a: "If you collect anything at all — analytics, contact emails, server logs — most privacy regimes expect a policy. A site with genuinely zero collection still benefits from saying so.",
        },
        {
          q: "Is this GDPR compliant?",
          a: "It covers the sections GDPR expects, but compliance depends on your actual processing, your records and your contracts with processors. No generator can certify that.",
        },
        {
          q: "Can I edit the output?",
          a: "You should. Copy or download the Markdown, remove anything that does not apply and add specifics such as processor names and retention periods.",
        },
        {
          q: "Is the information I enter stored?",
          a: "No. The draft is assembled in the page from your answers; nothing is submitted, saved or logged.",
        },
      ],
    },
  },
  {
    slug: "terms-conditions-generator",
    name: "Terms and Conditions Generator",
    category: "security",
    tagline: "A readable terms draft with the clauses that actually vary.",
    intent: "generate terms and conditions",
    keywords: ["terms and conditions generator", "terms of service template", "website terms generator", "terms and conditions draft", "tos generator", "terms of use"],
    status: "live",
    actions: ["copy", "download"],
    effort: "instant",
    popularity: 68,
    addedAt: "2025-03-02",
    seoTitle: "Terms and Conditions Generator — Plain Draft",
    seoDescription:
      "Generate a readable terms of service draft covering acceptable use, liability, intellectual property and termination, with the choices that need a lawyer.",
    content: {
      intro: [
        "Terms of service are the rules a visitor agrees to by using the site. Most templates are impenetrable and overreaching; a short, specific document that matches how the site actually works is both more usable and more likely to hold up.",
        "This generator writes a draft from your site details and the choices you make about liability, changes and termination. It flags the places where a decision is genuinely legal rather than stylistic.",
      ],
      howTo: [
        "Enter the site name, URL, contact address and governing jurisdiction.",
        "Choose the liability position and how you will handle changes to the terms.",
        "Generate the draft and read it end to end.",
        "Delete clauses that do not fit your service and add the ones it misses.",
        "Have a lawyer review before publishing, and record the effective date.",
      ],
      method: {
        title: "Which clauses vary, and which are boilerplate",
        paragraphs: [
          "The stable skeleton is: acceptance, licence to use, acceptable use, intellectual property, disclaimers, limitation of liability, changes, termination and governing law. Every site needs those in some form.",
          "The clauses that genuinely differ are liability caps, the dispute route and consumer rights. A business-to-business service can limit liability more freely than a consumer product, and in many jurisdictions consumer protections cannot be waived at all — which is why the draft states the position instead of asserting an unenforceable one.",
          "The draft is written in plain sentences on purpose. Terms that a reader cannot understand are weak evidence of agreement, and a wall of capitals does not create enforceability.",
        ],
        formula: "terms = stable skeleton + jurisdiction, liability and change-policy choices",
      },
      examples: [
        {
          title: "A free tool site",
          steps: ["Describe a free site with no accounts.", "Choose no liability cap beyond “as is”.", "Read the short resulting draft."],
          result: "A concise terms page with no payment or subscription clauses",
        },
        {
          title: "A paid service",
          steps: ["Add billing and cancellation details.", "Set a liability cap.", "Note the consumer-rights carve-out."],
          result: "A draft that reflects the commercial relationship",
        },
      ],
      limitations: [
        "Not legal advice. Enforceability depends on jurisdiction, the nature of the service and how the terms are presented.",
        "The generator does not know your refund policy, your SLA or your data-processing terms; add or link them yourself.",
        "Consumer law in many countries overrides limitation-of-liability clauses, so a cap in the text may not be effective.",
        "Definitions of acceptable use must be specific to your service to be usable in a dispute.",
      ],
      faqs: [
        {
          q: "Do I need terms and conditions for a free tool?",
          a: "It helps. Terms set out acceptable use, disclaim warranties and explain that outputs are not professional advice — the last point matters for calculators and generators.",
        },
        {
          q: "Are these terms enforceable?",
          a: "Only a lawyer familiar with your jurisdiction can say. Presentation matters too: terms buried where nobody sees them are weaker than a clear link at signup.",
        },
        {
          q: "Can I edit the draft?",
          a: "Yes, and you should. Copy or download the Markdown, then tailor the acceptable-use and liability sections to how your service actually behaves.",
        },
        {
          q: "Where should the terms link go?",
          a: "In the footer on every page, and as an explicit checkbox at signup if you have accounts.",
        },
      ],
    },
  },
  {
    slug: "cookie-policy-checklist-generator",
    name: "Cookie Policy Checklist Generator",
    category: "security",
    tagline: "A 12-point review of your cookie banner, inventory and policy.",
    intent: "cookie policy checklist",
    keywords: ["cookie policy checklist", "cookie consent checklist", "gdpr cookie banner", "cookie audit checklist", "consent management checklist", "cookie compliance"],
    status: "live",
    actions: [],
    effort: "guided",
    popularity: 62,
    addedAt: "2025-03-02",
    seoTitle: "Cookie Policy Checklist — Consent Setup Review",
    seoDescription:
      "Work through a 12-point cookie compliance checklist covering inventory, consent mechanics and disclosure, with progress saved locally in your browser.",
    content: {
      intro: [
        "Cookie problems are rarely about the wording of the banner. They are practical: analytics fires before consent, the reject button is hidden behind a second click, and the policy lists three cookies while the browser shows eleven.",
        "This checklist walks the setup in the order that works — inventory first, because every later decision depends on knowing what is actually set. Progress is saved in your browser, so a review can span several sittings.",
      ],
      howTo: [
        "Open your site in a private window with a clean profile.",
        "List every cookie and local-storage key, with its purpose and expiry.",
        "Mark each checklist item as you verify it, not as you assume it.",
        "Return to the list after any change to analytics, ads or embeds.",
      ],
      method: {
        title: "Why the order matters",
        paragraphs: [
          "Inventory comes first because classification, consent and disclosure all depend on it. A policy written before the inventory is guesswork, and a banner configured before it usually blocks the wrong scripts.",
          "The consent section covers the mechanics that regulators test: nothing non-essential before a choice, refusing as easy as accepting, granular categories, a persistent way to withdraw, and a record of what was consented to and when.",
          "The final section is upkeep: disclose the actual cookies, review after vendor changes, and handle visitors in jurisdictions with different rules. It is short because it is the part most sites skip.",
        ],
        formula: "inventory → classification → consent mechanics → disclosure → review",
      },
      examples: [
        {
          title: "A site with analytics and no banner",
          steps: ["Inventory shows _ga and _gid.", "Item one fails: non-essential cookie before consent.", "Fix the loader, then re-check."],
          result: "Analytics deferred until consent, verified in a clean profile",
        },
        {
          title: "A banner with only “Accept”",
          steps: ["Look for a reject control at the same level.", "Check that closing the banner does not count as consent.", "Add a real reject path."],
          result: "Consent that is specific rather than implied by dismissal",
        },
      ],
      limitations: [
        "A checklist is not a legal opinion; which rules apply depends on your jurisdiction and your visitors'.",
        "Progress is stored in this browser's local storage only — clearing site data resets it.",
        "Consent requirements change; review the list annually and after any vendor change.",
      ],
      faqs: [
        {
          q: "Is my progress saved?",
          a: "Yes, in local storage on this device. Nothing is sent anywhere, and clearing site data removes it.",
        },
        {
          q: "Do necessary cookies need consent?",
          a: "Generally no, provided they are strictly necessary for a service the visitor requested — session and security cookies, for example. Analytics and advertising are not necessary.",
        },
        {
          q: "Does closing the banner count as consent?",
          a: "In most interpretations, no. Consent has to be an affirmative act, and refusing must be as easy as accepting.",
        },
      ],
    },
  },
];
