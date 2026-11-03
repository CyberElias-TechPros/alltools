import type { ToolDefinition } from "../types";

export const developerTools: ToolDefinition[] = [
  {
    slug: "json-formatter",
    name: "JSON Formatter & Validator",
    category: "developer",
    tagline: "Pretty-print, minify and validate JSON with precise error positions.",
    intent: "format and validate json",
    keywords: [
      "json formatter",
      "json validator",
      "pretty print json",
      "json beautifier",
      "json minifier",
      "validate json online",
    ],
    status: "live",
    actions: ["copy", "download"],
    effort: "instant",
    popularity: 96,
    addedAt: "2025-01-12",
    seoTitle: "JSON Formatter & Validator — Pretty Print and Minify",
    seoDescription:
      "Format, validate and minify JSON in your browser. Get the exact line and column of syntax errors, sort keys and copy the cleaned output.",
    content: {
      intro: [
        "Pasted JSON is usually minified, badly indented, or subtly invalid because of a trailing comma. This formatter parses it with the browser's own JSON engine, reports the exact line and column of the first syntax error, and reprints it with consistent indentation.",
        "Your payload never leaves the page, which matters when it contains API responses with tokens, customer records or internal hostnames. Nothing is logged and nothing is stored.",
      ],
      howTo: [
        "Paste JSON into the input panel.",
        "Read the validation banner: valid, or the line and column of the error.",
        "Choose indentation (2 spaces, 4 spaces or tabs) and whether to sort keys.",
        "Copy the formatted output, minify it, or download it as a .json file.",
      ],
      method: {
        title: "What the formatter does",
        paragraphs: [
          "Validation calls JSON.parse, which rejects trailing commas, single quotes, comments, unquoted keys and NaN — all of which are JavaScript conveniences that JSON does not permit. The error message is normalised to a line and column by counting newlines up to the reported offset.",
          "Formatting re-serialises the parsed value with JSON.stringify and a chosen number of spaces, so duplicate whitespace collapses and key order follows the object's own order. Sorting keys recursively produces deterministic output, which is useful when diffing configuration files.",
        ],
        formula: "parsed = JSON.parse(input); output = JSON.stringify(parsed, null, indent)",
      },
      examples: [
        {
          title: "Formatting an API response",
          steps: ["Paste a single-line response body.", "Choose 2-space indentation.", "Copy the formatted JSON into a fixture file."],
          result: "Readable nested JSON with consistent indentation",
        },
        {
          title: "Finding a trailing comma",
          steps: ["Paste invalid JSON.", "The banner reports the error position.", "Remove the comma at that line and re-validate."],
          result: "“Invalid JSON — unexpected token at line 12, column 5”",
        },
      ],
      limitations: [
        "Duplicate object keys are silently collapsed to the last value, as the JSON specification allows but does not require.",
        "Numbers beyond IEEE-754 double precision lose accuracy when parsed, so very large integers should be treated as strings.",
        "The tool formats, it does not query or transform — use jq-style filtering elsewhere for that.",
      ],
      faqs: [
        {
          q: "Why does my JSON fail to parse?",
          a: "The most common causes are a trailing comma before a closing brace, single-quoted strings, unquoted keys, comments, or an unescaped newline inside a string. The error banner points at the first offending character.",
        },
        {
          q: "Can it handle very large files?",
          a: "Yes, up to the memory your browser tab allows. Files beyond roughly 50 MB may be slow — formatting is intended for typical API payloads, not database dumps.",
        },
        {
          q: "Is my JSON uploaded?",
          a: "No. Parsing and formatting run locally, so the tool works offline and is safe for payloads containing credentials.",
        },
        {
          q: "Does sorting keys change the data?",
          a: "No. JSON objects are unordered by definition; sorting only changes the printed order, not the meaning.",
        },
      ],
    },
  },
  {
    slug: "base64-encoder-decoder",
    name: "Base64 Encoder & Decoder",
    category: "developer",
    tagline: "Encode text or files to Base64, and decode safely — including URL-safe variants.",
    intent: "base64 encode and decode",
    keywords: [
      "base64 encoder",
      "base64 decoder",
      "encode base64 online",
      "base64url",
      "decode base64 string",
    ],
    status: "live",
    actions: ["copy", "download"],
    effort: "instant",
    popularity: 90,
    addedAt: "2025-01-16",
    seoTitle: "Base64 Encoder & Decoder — Text and URL-Safe",
    seoDescription:
      "Encode or decode Base64 in your browser, with UTF-8 support and an optional URL-safe alphabet. Files up to 20 MB are converted locally.",
    content: {
      intro: [
        "Base64 turns arbitrary bytes into 64 printable ASCII characters so they can travel through systems that only accept text. It is an encoding, not encryption: anyone can decode it, so it must never be used to protect passwords or secrets.",
        "This tool handles the two variations you actually meet in the wild — standard Base64 with + and /, and URL-safe Base64 with - and _ — and correctly round-trips UTF-8 text such as accented characters and emoji.",
      ],
      howTo: [
        "Choose Encode or Decode.",
        "Paste text, or upload a file to encode it.",
        "Toggle URL-safe if the value will appear in a URL or JWT.",
        "Copy the result, or download the decoded bytes as a file.",
      ],
      method: {
        title: "How Base64 works",
        paragraphs: [
          "Every three bytes (24 bits) are split into four 6-bit groups, each mapped to one character of the Base64 alphabet. When the input length is not divisible by three, padding with = keeps the output length a multiple of four.",
          "URL-safe Base64 replaces + with - and / with _ so the value can appear in a path or query string without percent-encoding. Text is first converted to UTF-8 bytes, which is why 'é' becomes two Base64 characters per byte rather than being mangled.",
        ],
        formula: "base64 = btoa(String.fromCharCode(...new TextEncoder().encode(text)))",
      },
      examples: [
        {
          title: "Encoding a basic-auth header",
          steps: ["Input: user:pass", "Encode as UTF-8."],
          result: "dXNlcjpwYXNz",
        },
        {
          title: "Decoding a JWT payload segment",
          steps: ["Take the middle segment of a JWT.", "Choose Decode with URL-safe enabled.", "Read the JSON claims."],
          result: "Readable JSON claims — signatures are not verified",
        },
      ],
      limitations: [
        "Base64 increases size by about 33%, so it is a poor choice for large payloads that could be sent as binary.",
        "Decoding invalid input fails with a clear error rather than guessing at missing padding.",
        "Encoding a file produces a very long string; browsers handle it, but email clients often truncate.",
      ],
      faqs: [
        {
          q: "Is Base64 encryption?",
          a: "No. It is a reversible encoding with no key. Anyone who sees a Base64 string can decode it in seconds.",
        },
        {
          q: "Why does my Base64 end with ==?",
          a: "Padding characters align the output to a multiple of four characters. One = means two bytes of padding, two means one byte.",
        },
        {
          q: "What is Base64URL?",
          a: "A variant that replaces + and / with - and _ and usually omits padding, so the string is safe in URLs, filenames and JWT segments.",
        },
      ],
    },
  },
  {
    slug: "url-encoder-decoder",
    name: "URL Encoder & Decoder",
    category: "developer",
    tagline: "Percent-encode query strings, paths and form data correctly.",
    intent: "url encode and decode",
    keywords: [
      "url encoder",
      "url decoder",
      "percent encoding",
      "urlencode online",
      "encode query string",
    ],
    status: "live",
    actions: ["copy"],
    effort: "instant",
    popularity: 82,
    addedAt: "2025-01-18",
    seoTitle: "URL Encoder & Decoder — Percent-Encoding Made Clear",
    seoDescription:
      "Encode or decode URL components with the right rules for paths, query strings and form data. Handles spaces, unicode and reserved characters.",
    content: {
      intro: [
        "URL encoding goes wrong when the wrong function is used: encodeURIComponent on a whole URL escapes the colons and slashes, while encodeURI leaves ampersands in a value, silently splitting a query parameter in two.",
        "This tool applies the correct rule for the context you pick — full URL, path segment, query value or form field — and decodes malformed sequences gracefully instead of throwing.",
      ],
      howTo: [
        "Choose Encode or Decode.",
        "Select the context: full URL, path segment, query value or form data.",
        "Paste your value and copy the result.",
        "Decode a parameter you suspect is double-encoded to check.",
      ],
      method: {
        title: "Which characters get escaped",
        paragraphs: [
          "Percent-encoding replaces a character with a percent sign followed by its UTF-8 bytes in hexadecimal. Unreserved characters (A–Z, a–z, 0–9, -, _, ., ~) are never escaped. Everything else is, depending on context.",
          "For a query value, spaces may become %20 or + depending on whether the receiver follows RFC 3986 or the older form-encoding convention. This tool lets you choose, because sending + to a path segment produces a literal plus sign.",
        ],
        formula: "encodeURIComponent(value) escapes everything except A–Z a–z 0–9 - _ . ! ~ * ' ( )",
      },
      examples: [
        {
          title: "Encoding a search query",
          steps: ["Input: red shoes & socks", "Choose query value with %20 spaces."],
          result: "red%20shoes%20%26%20socks",
        },
        {
          title: "Decoding a double-encoded value",
          steps: ["Input: hello%2520world", "Decode once to see hello%20world.", "Decode again to see hello world."],
          result: "Double-encoding revealed",
        },
      ],
      limitations: [
        "Encoding does not make a URL safe from injection; validate parameters on the server as well.",
        "The tool works on strings, not on parsed URL objects — it will not reorder or normalise query parameters for you.",
        "Decoding invalid percent sequences is reported rather than silently guessed.",
      ],
      faqs: [
        {
          q: "Should a space be %20 or +?",
          a: "In a path segment or fragment, use %20. In application/x-www-form-urlencoded data, + is also accepted. Use %20 when in doubt — it is valid everywhere.",
        },
        {
          q: "Why did my URL break after encoding?",
          a: "You probably encoded the entire URL, escaping the scheme and slashes. Encode only the dynamic value and leave the structure intact.",
        },
        {
          q: "What is double encoding?",
          a: "Encoding an already-encoded string turns % into %25. It usually signals a bug at the boundary between two systems.",
        },
      ],
    },
  },
  {
    slug: "html-entity-encoder",
    name: "HTML Entity Encoder",
    category: "developer",
    tagline: "Escape and unescape HTML entities and special characters safely.",
    intent: "html encode special characters",
    keywords: [
      "html encoder",
      "html entity encoder",
      "escape html",
      "html decoder",
      "special characters to html",
    ],
    status: "live",
    actions: ["copy"],
    effort: "instant",
    popularity: 60,
    addedAt: "2025-01-20",
    seoTitle: "HTML Entity Encoder & Decoder — Escape Special Characters",
    seoDescription:
      "Convert text to HTML-safe entities and back. Escapes ampersands, angle brackets, quotes and non-ASCII characters, with named or numeric output.",
    content: {
      intro: [
        "Any text you inject into an HTML template must be escaped, or a stray angle bracket breaks the page and a stray ampersand breaks the validation. This tool encodes the five reserved characters (and optionally everything non-ASCII) into entities, and decodes them back.",
        "It is a text transformation, not a sanitiser: encoding output is safe to display as text, but it will not fix an injection vulnerability caused by concatenating untrusted input into attributes or scripts.",
      ],
      howTo: [
        "Paste the text to escape.",
        "Choose Encode or Decode.",
        "Select whether non-ASCII characters become numeric entities.",
        "Copy the result into your template.",
      ],
      method: {
        title: "The five reserved characters",
        paragraphs: [
          "In HTML text and attribute values, & < > \" and ' have special meanings. Replacing them with &amp; &lt; &gt; &quot; and &#39; removes that meaning, so the characters display literally rather than being interpreted as markup.",
          "Named entities exist for hundreds of characters, but numeric entities (&#233;) work everywhere, including in XML and in environments that do not recognise the HTML5 entity list.",
        ],
        formula: "text.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')",
      },
      examples: [
        {
          title: "Escaping a code snippet",
          steps: ["Input: <div class=\"box\">Tom & Jerry</div>", "Choose Encode."],
          result: "&lt;div class=&quot;box&quot;&gt;Tom &amp; Jerry&lt;/div&gt;",
        },
        {
          title: "Decoding scraped content",
          steps: ["Input: Caf&eacute; &amp; Cr&egrave;me", "Choose Decode."],
          result: "Café & Crème",
        },
      ],
      limitations: [
        "Encoding is not sanitisation. Never use it as a substitute for a proper HTML sanitiser or template engine auto-escaping.",
        "Decoding untrusted input can produce markup; display decoded output as text, not HTML.",
        "Attribute escaping differs in unquoted attributes, which are invalid in XHTML and best avoided entirely.",
      ],
      faqs: [
        {
          q: "When should I use &amp; instead of &?",
          a: "In HTML source, a literal ampersand must be written as &amp;. Browsers often tolerate a bare &, but validators and XML parsers will not.",
        },
        {
          q: "Does escaping prevent XSS?",
          a: "Escaping text nodes and quoted attributes correctly prevents the most common XSS vectors, but context matters: JavaScript strings, CSS and URLs need different escaping.",
        },
        {
          q: "What is the difference between named and numeric entities?",
          a: "Named entities (&eacute;) are readable; numeric entities (&#233;) are universally supported. Both render identically in modern browsers.",
        },
      ],
    },
  },
  {
    slug: "hash-generator",
    name: "Hash Generator",
    category: "developer",
    tagline: "Generate SHA-1, SHA-256, SHA-384 and SHA-512 digests locally.",
    intent: "generate sha256 hash of text",
    keywords: [
      "hash generator",
      "sha256 generator",
      "sha512 hash",
      "md5 hash online",
      "checksum generator",
    ],
    status: "live",
    actions: ["copy"],
    effort: "instant",
    popularity: 86,
    addedAt: "2025-01-22",
    seoTitle: "Hash Generator — SHA-256, SHA-512 & SHA-1 Checksums",
    seoDescription:
      "Generate SHA-1, SHA-256, SHA-384 and SHA-512 hashes of text or files using the browser's Web Crypto API. Nothing is uploaded.",
    content: {
      intro: [
        "A cryptographic hash turns any input into a fixed-length fingerprint. Change one character and the digest changes completely, which makes hashes useful for verifying downloads, comparing content and storing non-reversible identifiers.",
        "This generator uses the browser's built-in Web Crypto API — the same implementation your operating system trusts for TLS — rather than a hand-rolled JavaScript algorithm. Text and files are hashed locally and never transmitted.",
      ],
      howTo: [
        "Choose whether to hash text or a file.",
        "Paste the text, or drop a file into the picker.",
        "Select the algorithms you need; they are computed in parallel.",
        "Copy any digest as lowercase hexadecimal.",
      ],
      method: {
        title: "Why SHA-2, and why not MD5",
        paragraphs: [
          "SHA-256 and SHA-512 are part of the SHA-2 family and remain standard for integrity checks and digital signatures. SHA-1 is included for compatibility with legacy systems but is cryptographically broken — collisions are practical, so it must not be used for security decisions.",
          "MD5 is deliberately not offered: it is broken for collision resistance and dangerous for anything security-related. Web Crypto does not expose it at all, which is the right default.",
        ],
        formula: "digest = await crypto.subtle.digest('SHA-256', bytes)",
      },
      examples: [
        {
          title: "Verifying a downloaded installer",
          steps: ["Hash the downloaded file with SHA-256.", "Compare with the publisher's published digest.", "Any character difference means a different file."],
          result: "Identical digests confirm the download is intact",
        },
        {
          title: "Hashing a password for a test fixture",
          steps: ["Paste a test password.", "Copy the SHA-256 digest.", "Store the digest in the fixture, never the password."],
          result: "A stable fingerprint for repeatable tests",
        },
      ],
      limitations: [
        "Raw hashing is not password storage. Real password storage needs a slow, salted KDF such as Argon2id, scrypt or bcrypt.",
        "MD5 is intentionally unavailable because it is unsafe for integrity and collision resistance.",
        "Hashing proves integrity only when you already trust the published digest; compare against an independent source.",
      ],
      faqs: [
        {
          q: "Is SHA-256 the same as encryption?",
          a: "No. Hashing is one-way — you cannot recover the input. Encryption is reversible with the right key.",
        },
        {
          q: "Can I hash a large file?",
          a: "Yes, though the file is read fully into memory first. Files over a few hundred megabytes may be slow on low-memory devices.",
        },
        {
          q: "Why do two hashes of the same text differ?",
          a: "Usually an invisible difference: a trailing newline, a different encoding, or Windows CRLF line endings. Check the byte length before hashing.",
        },
      ],
    },
  },
  {
    slug: "uuid-generator",
    name: "UUID Generator",
    category: "developer",
    tagline: "Generate cryptographically random UUID v4 values in bulk.",
    intent: "generate uuid",
    keywords: [
      "uuid generator",
      "guid generator",
      "uuid v4",
      "random uuid",
      "generate uuid online",
    ],
    status: "live",
    actions: ["copy", "download"],
    effort: "instant",
    popularity: 88,
    addedAt: "2025-01-24",
    seoTitle: "UUID Generator — Random v4 UUIDs in Bulk",
    seoDescription:
      "Generate one or thousands of RFC 4122 version 4 UUIDs using crypto.randomUUID. Choose formatting options and copy or download the list.",
    content: {
      intro: [
        "A UUID is a 128-bit identifier designed to be unique without coordination between systems. Version 4 values are random, which is why they are safe to generate on the client and safe to expose in URLs.",
        "This generator uses crypto.randomUUID where available and falls back to crypto.getRandomValues, never Math.random. Generate one identifier or thousands, in several common formats.",
      ],
      howTo: [
        "Choose how many UUIDs you need.",
        "Select a format: lowercase, uppercase, no hyphens or braces.",
        "Generate, then copy the list or download it as a text file.",
      ],
      method: {
        title: "What makes a v4 UUID",
        paragraphs: [
          "A v4 UUID is 122 random bits with six fixed bits marking the version (4) and the variant (RFC 4122). The canonical text form is 8-4-4-4-12 hexadecimal characters separated by hyphens.",
          "Randomness comes from the operating system's CSPRNG through Web Crypto. That matters: Math.random is seeded deterministically in some engines and is unsuitable for identifiers that must not collide or be guessable.",
        ],
        formula: "crypto.randomUUID() // e.g. 3f2504e0-4f89-41d3-9a0c-0305e82c3301",
      },
      examples: [
        {
          title: "Generating fixture IDs",
          steps: ["Set the count to 500.", "Choose lowercase with hyphens.", "Download the list."],
          result: "500 unique v4 UUIDs, one per line",
        },
        {
          title: "Creating a database primary key format",
          steps: ["Disable hyphens for a compact key.", "Copy the value.", "Store as a 32-character string or a native uuid column."],
          result: "A compact 32-hex-character identifier",
        },
      ],
      limitations: [
        "UUID v4 values are random, not sequential, so they are poor database primary keys when index locality matters — consider UUID v7 for time-ordered IDs.",
        "Generated values are unique with overwhelming probability, not certainty; the collision odds are negligible for practical use.",
        "Uppercase and brace formats are for interoperability with legacy systems, not a security difference.",
      ],
      faqs: [
        {
          q: "Are UUID v4 values really unique?",
          a: "With 122 random bits, you would need to generate about 2.7 × 10¹⁸ values before a 50% chance of a single collision.",
        },
        {
          q: "Is a UUID safe to expose in a URL?",
          a: "Yes, provided it is not a secret. The value leaks nothing, but knowing it grants access if it is used as a capability — protect sensitive resources with authorisation.",
        },
        {
          q: "Should I use UUID or a sequential ID?",
          a: "Sequential IDs are smaller and index better; UUIDs avoid coordination and hide record counts. UUID v7 gives you both time ordering and randomness.",
        },
      ],
    },
  },
  {
    slug: "jwt-decoder",
    name: "JWT Decoder",
    category: "developer",
    tagline: "Inspect JWT header and claims, and check expiry — without verifying signatures.",
    intent: "decode jwt token",
    keywords: [
      "jwt decoder",
      "decode json web token",
      "jwt payload",
      "jwt expiry check",
      "parse jwt",
    ],
    status: "live",
    actions: ["copy"],
    effort: "instant",
    popularity: 89,
    addedAt: "2025-01-26",
    seoTitle: "JWT Decoder — Read Header, Claims & Expiry",
    seoDescription:
      "Decode a JSON Web Token to inspect its header and payload claims, see expiry times in your timezone and understand what is and isn't verified.",
    content: {
      intro: [
        "A JWT is three Base64URL segments: header, payload and signature. Decoding the first two takes no secret, which makes inspection a useful debugging step — and makes it obvious why no sensitive data should ever be placed in a payload.",
        "This decoder shows the header, the claims and a human-readable expiry. It does not verify the signature and it says so plainly: verifying requires the signing key or public certificate and must happen on a trusted server.",
      ],
      howTo: [
        "Paste the token — the Bearer prefix is stripped automatically.",
        "Read the algorithm and key ID from the header.",
        "Check the claims table for issuer, audience, subject and expiry times.",
        "Compare exp and iat against the current time shown in the status line.",
      ],
      method: {
        title: "Structure and claims",
        paragraphs: [
          "Each segment is Base64URL-encoded JSON, except the signature which is raw bytes. The decoder splits on periods, converts - and _ back to + and /, adds padding, and parses the JSON.",
          "Registered claims follow RFC 7519: iss (issuer), sub (subject), aud (audience), exp (expiry), nbf (not before) and iat (issued at). exp, nbf and iat are NumericDate values — seconds since the Unix epoch.",
        ],
        formula: "payload = JSON.parse(base64urlDecode(token.split('.')[1]))",
      },
      examples: [
        {
          title: "Diagnosing a 401 after a token refresh",
          steps: ["Paste the token from the failing request.", "Check exp against the current time.", "Compare aud with the API's expected audience."],
          result: "Expired token or audience mismatch identified",
        },
        {
          title: "Reading a custom claim",
          steps: ["Paste the token.", "Open the claims table.", "Look for the role or scope claim your app sets."],
          result: "Claim value visible without any server call",
        },
      ],
      limitations: [
        "The signature is not verified. A decoded payload proves nothing about who issued it.",
        "Encrypted JWEs (five segments) are not supported — only signed JWTs.",
        "Decoding reveals whatever is in the payload; never paste a production token into an untrusted site. This page does the work locally, but the token still appears on screen.",
      ],
      faqs: [
        {
          q: "Does this validate my token?",
          a: "No. It decodes it. Signature validation requires the issuer's key and must be done server-side — never rely on client-side decoding for authorisation.",
        },
        {
          q: "What does the exp claim mean?",
          a: "It is the expiry time in seconds since the Unix epoch. The tool converts it to your local time and shows whether the token has already expired.",
        },
        {
          q: "Is it safe to put data in a JWT payload?",
          a: "Only if you are comfortable with anyone holding the token reading it. JWTs are signed, not encrypted.",
        },
      ],
    },
  },
  {
    slug: "timestamp-converter",
    name: "Unix Timestamp Converter",
    category: "developer",
    tagline: "Convert Unix timestamps to dates and back, in seconds or milliseconds.",
    intent: "convert unix timestamp to date",
    keywords: [
      "unix timestamp converter",
      "epoch converter",
      "timestamp to date",
      "date to timestamp",
      "epoch milliseconds",
    ],
    status: "live",
    actions: ["copy"],
    effort: "instant",
    popularity: 80,
    addedAt: "2025-01-28",
    seoTitle: "Unix Timestamp Converter — Epoch to Date and Back",
    seoDescription:
      "Convert Unix timestamps to readable dates and back. Handles seconds and milliseconds, local time and UTC, with a live current-timestamp reference.",
    content: {
      intro: [
        "Epoch timestamps are unambiguous until you have to read one. This converter turns a 10-digit seconds value or a 13-digit milliseconds value into a full date in UTC and your local time zone, and converts a date back into a timestamp.",
        "It also shows the current epoch time live, which is handy when writing expiry tests or debugging a cache header.",
      ],
      howTo: [
        "Paste a timestamp; the tool detects seconds versus milliseconds from the digit count.",
        "Read the UTC and local interpretations side by side.",
        "Use the date field to go the other way and produce a timestamp.",
        "Copy whichever form you need.",
      ],
      method: {
        title: "Seconds, milliseconds and time zones",
        paragraphs: [
          "Unix time counts seconds since 1970-01-01T00:00:00Z, excluding leap seconds. JavaScript's Date uses milliseconds, so seconds values are multiplied by 1,000 before conversion.",
          "A timestamp is an instant, not a local time: the same value renders as different clock times in Lagos, London and Los Angeles. Both UTC and your browser's time zone are shown so the distinction is explicit.",
        ],
        formula: "date = new Date(seconds * 1000).toISOString()",
      },
      examples: [
        {
          title: "Reading a cache expiry header",
          steps: ["Paste 1735689600.", "The tool detects seconds.", "UTC renders as 1 January 2025, 00:00:00."],
          result: "2025-01-01T00:00:00.000Z",
        },
        {
          title: "Converting a date to a timestamp",
          steps: ["Enter 2025-06-15T12:00 in the date field.", "Choose UTC.", "Copy the seconds value."],
          result: "1749988800",
        },
      ],
      limitations: [
        "Timestamps do not encode time zones or DST rules — the same instant is a different wall-clock time in each zone.",
        "Dates before 1970 produce negative timestamps, which the tool supports but some legacy systems do not.",
        "Leap seconds are not represented; Unix time ignores them by design.",
      ],
      faqs: [
        {
          q: "How do I tell seconds from milliseconds?",
          a: "Seconds timestamps are 10 digits today; milliseconds are 13. The tool detects this automatically, and you can override it when working with unusual values.",
        },
        {
          q: "Why does my timestamp show the wrong date?",
          a: "Most often the value is in milliseconds but was interpreted as seconds (or the reverse), which shifts the date by decades. Check the magnitude.",
        },
        {
          q: "What is the Year 2038 problem?",
          a: "Systems storing Unix time in a signed 32-bit integer overflow on 19 January 2038. Modern systems use 64-bit values and are unaffected.",
        },
      ],
    },
  },
  {
    slug: "color-code-converter",
    name: "Color Code Converter",
    category: "developer",
    tagline: "Convert HEX, RGB, HSL and HSV with live preview and contrast checking.",
    intent: "convert hex to rgb and hsl",
    keywords: [
      "color converter",
      "hex to rgb",
      "rgb to hex",
      "hsl converter",
      "color picker code",
      "contrast checker",
    ],
    status: "live",
    actions: ["copy"],
    effort: "instant",
    popularity: 75,
    addedAt: "2025-01-30",
    seoTitle: "Color Converter — HEX, RGB, HSL & Contrast Checker",
    seoDescription:
      "Convert colours between HEX, RGB, HSL and HSV, preview them, generate tints and shades, and check contrast against white or black for accessibility.",
    content: {
      intro: [
        "A colour picked in a design tool rarely arrives in the format a codebase needs. This converter translates a single colour into HEX, RGB, HSL and HSV simultaneously and shows the CSS variable you can paste directly.",
        "It also computes the WCAG contrast ratio against white and black, which tells you immediately whether text in that colour will be readable — the most common accessibility failure in hand-built interfaces.",
      ],
      howTo: [
        "Enter a colour in any common format — #4f46e5, rgb(79,70,229) or hsl(243,75%,59%).",
        "Read all equivalent formats side by side.",
        "Check the contrast ratios to see which backgrounds are safe for text.",
        "Copy the format your codebase uses.",
      ],
      method: {
        title: "Colour spaces and contrast",
        paragraphs: [
          "HEX is RGB in hexadecimal; RGB is the same data in decimal. HSL describes the colour as hue (0–360°), saturation and lightness, which is far easier to reason about when generating tints and shades.",
          "The contrast ratio follows WCAG 2.1: relative luminance is computed by linearising each sRGB channel, and the ratio is (L1 + 0.05) ÷ (L2 + 0.05). AA requires 4.5:1 for normal text and 3:1 for large text.",
        ],
        formula: "ratio = (L_lighter + 0.05) ÷ (L_darker + 0.05)",
      },
      examples: [
        {
          title: "Converting a brand colour",
          steps: ["Input: #4f46e5.", "Read the RGB and HSL equivalents."],
          result: "rgb(79, 70, 229) · hsl(243, 75%, 59%)",
        },
        {
          title: "Checking a button label",
          steps: ["Enter the button background colour.", "Read the contrast ratio against white.", "If it is below 4.5:1, use a darker shade or larger text."],
          result: "4.9:1 — passes WCAG AA for normal text",
        },
      ],
      limitations: [
        "HSL is not perceptually uniform: equal lightness steps look uneven to the eye. Use OKLCH for perceptual palette design.",
        "Contrast is computed against pure white and pure black only; arbitrary background colours need a manual check.",
        "Named CSS colours are supported for common values, but some browser-specific names are not.",
      ],
      faqs: [
        {
          q: "What contrast ratio do I need?",
          a: "WCAG AA requires 4.5:1 for body text, 3:1 for large text (18.66px bold or 24px regular) and 3:1 for UI component boundaries.",
        },
        {
          q: "Why convert to HSL?",
          a: "Because adjusting lightness in HSL keeps the hue stable, which makes generating hover states and tint ramps predictable.",
        },
        {
          q: "Does this support alpha transparency?",
          a: "Yes — 8-digit hex and rgba() input are parsed, and the alpha value is preserved in the output.",
        },
      ],
    },
  },
];
