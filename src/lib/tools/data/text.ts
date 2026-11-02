import type { ToolDefinition } from "../types";

export const textTools: ToolDefinition[] = [
  {
    slug: "word-counter",
    name: "Word Counter",
    category: "text",
    tagline: "Count words, characters, sentences and reading time as you type.",
    intent: "count words and characters in text",
    keywords: [
      "word counter",
      "character counter",
      "count words online",
      "word count tool",
      "reading time calculator",
      "sentence counter",
    ],
    status: "live",
    actions: ["copy"],
    effort: "instant",
    popularity: 100,
    addedAt: "2025-01-12",
    seoTitle: "Word Counter — Count Words, Characters & Reading Time",
    seoDescription:
      "Free word counter that shows words, characters, sentences, paragraphs, reading time and keyword density as you type. No sign-up, nothing uploaded.",
    content: {
      intro: [
        "Paste a paragraph, an essay, a cover letter or a product description and this tool tells you exactly how long it is: words, characters with and without spaces, sentences, paragraphs, estimated reading time and speaking time. Everything updates as you type, so you can trim a paragraph to fit a limit instead of guessing.",
        "Writers use it to hit word-count briefs, students use it to check essay limits, and marketers use it to keep meta descriptions and ad copy inside platform character caps. The text never leaves your browser — there is no upload, no account and no server round trip.",
      ],
      howTo: [
        "Paste or type your text into the box. Counting starts immediately.",
        "Check the headline figures: words, characters and reading time.",
        "Open the keyword table to see which terms dominate the text.",
        "Use the reading-time context line to judge pacing for blogs, scripts or speeches.",
        "Press Copy summary to keep a record of the counts alongside your draft.",
      ],
      method: {
        title: "How counting works",
        paragraphs: [
          "Words are counted by splitting the text on whitespace after normalising non-breaking spaces. Hyphenated compounds such as well-known count as one word, matching the convention used by Microsoft Word and Google Docs. Standalone punctuation is not counted as a word.",
          "Characters are reported twice: with spaces, and without spaces or line breaks. Sentences are detected by terminal punctuation followed by a space, a closing quote or the end of the text. Paragraphs are counted as non-empty blocks separated by a blank line.",
          "Reading time assumes 225 words per minute, the middle of the 200–250 wpm range commonly used for adult silent reading. Speaking time assumes 130 words per minute, which is a comfortable presentation pace.",
        ],
        formula: "words ÷ 225 = reading minutes    ·    words ÷ 130 = speaking minutes",
      },
      examples: [
        {
          title: "Fitting a 300-word blog brief",
          steps: [
            "Paste the draft into the tool.",
            "The counter shows 412 words — 112 over the brief.",
            "Cut two paragraphs of background detail and re-check.",
            "The counter now reads 298 words, inside the limit.",
          ],
          result: "298 words · 1,842 characters · 1 min 19 sec reading time",
        },
        {
          title: "Checking a meta description",
          steps: [
            "Paste the proposed description.",
            "Look at the characters figure rather than the word count.",
            "Google typically truncates snippets beyond roughly 155–160 characters.",
          ],
          result: "152 characters, 26 words — fits comfortably inside a search snippet",
        },
      ],
      limitations: [
        "Reading and speaking times are estimates; comprehension speed varies with subject matter and reader familiarity.",
        "Word boundaries follow whitespace rules, so languages written without spaces (Chinese, Japanese, Thai) will under-count unless the text already contains separators.",
        "Hyphenated and apostrophised words count as one word, which may differ from a publisher's house style.",
      ],
      faqs: [
        {
          q: "Does the word counter include punctuation?",
          a: "Punctuation is not counted as a word. The character totals do include punctuation, because platforms such as X/Twitter and Google measure characters, not words.",
        },
        {
          q: "Is my text uploaded anywhere?",
          a: "No. The counting runs in JavaScript on your own device. There is no server endpoint that receives your text, and nothing is saved after you close the tab.",
        },
        {
          q: "Why do two word counters give different numbers?",
          a: "They disagree about hyphens, em dashes without spaces, and symbols such as URLs. This tool counts whitespace-separated tokens and treats a hyphenated compound as one word, which matches Word and Google Docs.",
        },
        {
          q: "How is reading time calculated?",
          a: "Words divided by 225 words per minute, rounded up to the nearest five seconds. Speaking time uses 130 words per minute, a typical rate for reading aloud to an audience.",
        },
      ],
    },
  },
  {
    slug: "case-converter",
    name: "Case Converter",
    category: "text",
    tagline: "Switch text between UPPER, lower, Title, sentence and programming cases.",
    intent: "convert text to uppercase, lowercase or title case",
    keywords: [
      "case converter",
      "uppercase to lowercase",
      "title case converter",
      "sentence case",
      "camelCase converter",
      "snake case converter",
    ],
    status: "live",
    actions: ["copy", "download"],
    effort: "instant",
    popularity: 92,
    addedAt: "2025-01-12",
    seoTitle: "Case Converter — UPPERCASE, lowercase, Title & Programming Case",
    seoDescription:
      "Convert text to uppercase, lowercase, title case, sentence case, camelCase, snake_case and kebab-case instantly. Free, private and browser-based.",
    content: {
      intro: [
        "Text arrives in the wrong case constantly: a headline typed in caps lock, an API key pasted in snake_case, a CSV column that needs Title Case, a variable name that has to become camelCase. Ret yping any of it by hand is slow and error-prone.",
        "This converter applies eleven case styles at once. Choose a style and the result appears immediately, ready to copy or download. It handles accented characters and multi-byte emoji correctly because it uses Unicode-aware transformations rather than naive ASCII byte maths.",
      ],
      howTo: [
        "Paste your text into the input box.",
        "Pick a case style from the grid — the result updates instantly.",
        "Check the preview, especially for acronyms in title case.",
        "Copy the converted text or download it as a .txt file.",
      ],
      method: {
        title: "What each style does",
        paragraphs: [
          "Upper and lower convert every cased character. Title Case capitalises the first letter of each significant word and lowercases the rest, skipping short articles, conjunctions and prepositions unless they are first or last. Sentence case capitalises only the first letter of each sentence. Alternating case flips the case of every other letter, and InVeRsE swaps each character's case.",
          "Programming styles split the input on spaces, hyphens and existing case boundaries, then rejoin using the chosen separator. camelCase and PascalCase remove separators; snake_case and kebab-case lower the words and join them with an underscore or hyphen; CONSTANT_CASE also uppercases.",
        ],
        formula: "words = text.split(/[\\s_-]+/)  →  join(words, separator)",
      },
      examples: [
        {
          title: "Turning a headline into a URL slug-friendly title",
          steps: ["Input: the quick brown fox jumps over the lazy dog", "Choose Title Case.", "Result capitalises the first letter of each significant word."],
          result: "The Quick Brown Fox Jumps Over the Lazy Dog",
        },
        {
          title: "Converting a label into a variable name",
          steps: ["Input: User Profile Image URL", "Choose camelCase.", "The tool splits on spaces and case boundaries, lowercases the first word and capitalises the rest."],
          result: "userProfileImageUrl",
        },
      ],
      limitations: [
        "Title case rules differ by style guide (AP, Chicago, APA). This tool follows the common AP-style rule of leaving short articles, conjunctions and prepositions lowercase.",
        "Case conversion cannot recover information that was never there: if the original text is all caps, camelCase output will guess word boundaries from spaces only.",
        "Some scripts, such as Chinese and Arabic, have no concept of case, so conversions leave them unchanged.",
      ],
      faqs: [
        {
          q: "Which words stay lowercase in title case?",
          a: "Short articles (a, an, the), coordinating conjunctions (and, but, or) and short prepositions (of, in, on, to) stay lowercase unless they are the first or last word of the title.",
        },
        {
          q: "Does it handle accented letters?",
          a: "Yes. The converter uses JavaScript's Unicode-aware case mapping, so é becomes É and ß becomes SS where the locale rules demand it.",
        },
        {
          q: "Can I convert only part of the text?",
          a: "Yes — select the text in the box and the tool applies the chosen style to your selection only. Clear the selection to convert everything again.",
        },
      ],
    },
  },
  {
    slug: "duplicate-line-remover",
    name: "Duplicate Line Remover",
    category: "text",
    tagline: "Delete repeated lines while keeping the original order.",
    intent: "remove duplicate lines from a list",
    keywords: [
      "remove duplicate lines",
      "duplicate line remover",
      "deduplicate list",
      "unique lines",
      "remove repeats from list",
    ],
    status: "live",
    actions: ["copy", "download"],
    effort: "instant",
    popularity: 74,
    addedAt: "2025-01-18",
    seoTitle: "Duplicate Line Remover — Delete Repeated Lines Online",
    seoDescription:
      "Remove duplicate lines from any list in one click. Keeps the original order, offers case-insensitive matching and reports how many lines were removed.",
    content: {
      intro: [
        "Cleaning a mailing list, a keyword export or a log file usually starts with removing repeated lines. Doing that by hand in a spreadsheet is slow, and Excel's built-in duplicate removal reorders nothing but hides its logic.",
        "This tool removes duplicates deterministically: the first occurrence of each line is kept and every later copy is deleted, so the original sequence is preserved. You can ignore case, trim surrounding whitespace, and drop empty lines in the same pass.",
      ],
      howTo: [
        "Paste one item per line into the input box.",
        "Choose whether matching should ignore case and whether to trim whitespace.",
        "Optionally keep first or last occurrence.",
        "Read the summary to see how many lines were removed.",
        "Copy the cleaned list or download it as a .txt file.",
      ],
      method: {
        title: "How the de-duplication works",
        paragraphs: [
          "Each line is normalised according to your options, then tracked in a Set. A line is written to the output only the first time its normalised value is seen. This is an O(n) single pass, which is why even very long lists finish instantly.",
          "Keeping the last occurrence instead records the index of each normalised line and emits entries in the order of their final appearance, which is useful when later rows contain more up-to-date values.",
        ],
        formula: "seen = new Set(); keep(line) if !seen.has(normalise(line))",
      },
      examples: [
        {
          title: "Cleaning a keyword export",
          steps: ["Paste 4,000 exported keywords.", "Enable Trim whitespace and Ignore case.", "Click Remove duplicates."],
          result: "4,000 lines in, 3,118 unique lines out — 882 duplicates removed",
        },
        {
          title: "De-duplicating an email list with mixed casing",
          steps: ["Paste addresses such as Sam@Example.com and sam@example.com.", "Enable Ignore case.", "Both are treated as the same address."],
          result: "Case-insensitive matching keeps the first spelling and drops the duplicate",
        },
      ],
      limitations: [
        "The comparison is exact after normalisation — near-duplicates such as 'New York' and 'New York ' only match when trimming is enabled. Typos and spelling variants are not detected.",
        "Ordering is always preserved from the input; the tool does not sort.",
        "Very large inputs (over 100,000 lines) still work but may take a moment on low-powered phones.",
      ],
      faqs: [
        {
          q: "Does removing duplicates sort my list?",
          a: "No. The output keeps the order of the lines you pasted. If you also need sorting, run the result through the alphabetical sorter afterwards.",
        },
        {
          q: "Can it remove duplicate words inside a line?",
          a: "No — this tool works line by line. It removes repeated lines, not repeated words within a sentence.",
        },
        {
          q: "What counts as a line?",
          a: "Any block of text separated by a newline. A line containing only spaces is treated as empty and can be dropped with the empty-line option.",
        },
      ],
    },
  },
  {
    slug: "text-reverser",
    name: "Text Reverser",
    category: "text",
    tagline: "Reverse characters, words or lines — including emoji-safe reversal.",
    intent: "reverse text backwards",
    keywords: [
      "text reverser",
      "reverse text",
      "backwards text generator",
      "mirror text",
      "reverse words in a sentence",
    ],
    status: "live",
    actions: ["copy"],
    effort: "instant",
    popularity: 61,
    addedAt: "2025-01-18",
    seoTitle: "Text Reverser — Reverse Text, Words or Lines Online",
    seoDescription:
      "Reverse any text by characters, words or lines. Emoji and accented characters stay intact thanks to Unicode-aware segmenting. Free and instant.",
    content: {
      intro: [
        "Reversing text sounds trivial until emoji and accented characters break apart into mojibake. Naive JavaScript reversal splits strings into UTF-16 code units, which shreds surrogate pairs and combining marks.",
        "This tool uses the browser's Intl.Segmenter to reverse by grapheme clusters, so flag emoji, family emoji and accented letters survive intact. You can reverse the whole string, reverse the word order while keeping each word readable, or flip the order of lines.",
      ],
      howTo: [
        "Paste the text you want to flip.",
        "Choose Characters, Words or Lines.",
        "The result appears instantly, preserving emoji and accents.",
        "Copy the reversed text with one click.",
      ],
      method: {
        title: "Why grapheme clusters matter",
        paragraphs: [
          "A single visible character can be made of several code points: 'é' may be e + a combining accent, and a family emoji is a sequence of people joined by zero-width joiners. Reversing code units splits those sequences and produces broken glyphs.",
          "Intl.Segmenter with granularity 'grapheme' returns user-perceived characters, and reversing that array keeps every visible glyph whole. Browsers without Intl.Segmenter fall back to a code-point-aware spread, which still protects surrogate pairs.",
        ],
        formula: "Array.from(new Intl.Segmenter().segment(text)).reverse().join('')",
      },
      examples: [
        {
          title: "Creating a mirror caption",
          steps: ["Input: Hello world 🙂", "Choose Characters.", "The emoji stays as one glyph at the start of the output."],
          result: "🙂 dlrow olleH",
        },
        {
          title: "Reversing word order for a word puzzle",
          steps: ["Input: the quick brown fox", "Choose Words.", "Words are reversed but stay readable."],
          result: "fox brown quick the",
        },
      ],
      limitations: [
        "Right-to-left scripts such as Arabic and Hebrew have their own display ordering; reversing them produces text that looks identical in some environments.",
        "Combining characters that are intentionally separate may still reorder visually depending on the font.",
        "Reversing is not encryption. It is trivially reversible and provides no security.",
      ],
      faqs: [
        {
          q: "Does it work with emoji?",
          a: "Yes. The tool segments by grapheme cluster, so compound emoji such as 👨‍👩‍👧‍👦 are treated as one character and are not broken apart.",
        },
        {
          q: "Can I reverse only one line?",
          a: "Select the line before converting, or choose Lines mode to flip the order of all lines while keeping the text inside each line readable.",
        },
        {
          q: "Is reversed text readable by screen readers?",
          a: "No. Screen readers will attempt to pronounce the reversed characters. Avoid reversed text for meaningful content and never use it on a form label or heading.",
        },
      ],
    },
  },
  {
    slug: "alphabetical-sorter",
    name: "Alphabetical Sorter",
    category: "text",
    tagline: "Sort lines A–Z, Z–A, numerically or by length in one click.",
    intent: "sort a list alphabetically",
    keywords: [
      "alphabetical sorter",
      "sort lines",
      "sort list alphabetically",
      "sort text online",
      "az sorter",
    ],
    status: "live",
    actions: ["copy", "download"],
    effort: "instant",
    popularity: 70,
    addedAt: "2025-01-20",
    seoTitle: "Alphabetical Sorter — Sort Lines A–Z, Z–A or by Length",
    seoDescription:
      "Sort any list alphabetically, reverse-alphabetically, numerically or by length. Case-insensitive, natural number ordering and duplicate removal included.",
    content: {
      intro: [
        "Spreadsheet sorting drags formatting with it, and command-line sort needs escaping. This sorter is a single text box: paste a list, choose a direction, copy the sorted result.",
        "Natural sorting means 'item 2' comes before 'item 10', which is what people expect but not what a naive string comparison produces. Case-insensitive matching is on by default so 'apple' and 'Apple' sit together rather than splitting across the alphabet.",
      ],
      howTo: [
        "Paste your list, one entry per line.",
        "Choose A–Z, Z–A, shortest first or longest first.",
        "Toggle case sensitivity or numeric awareness if you need exact byte ordering.",
        "Copy or download the sorted list.",
      ],
      method: {
        title: "How the comparison works",
        paragraphs: [
          "Sorting uses Intl.Collator with numeric mode enabled, which compares strings using locale-aware collation rules and treats digit runs as numbers. That produces the expected ordering for 'Chapter 2' before 'Chapter 10'.",
          "Case-insensitive mode folds case before comparison but keeps the original spelling in the output, so your capitalisation survives sorting. Equal entries keep their original relative order because modern Array.sort is stable.",
        ],
        formula: "items.sort(new Intl.Collator('en', { numeric: true }).compare)",
      },
      examples: [
        {
          title: "Ordering a chapter list",
          steps: ["Paste Chapter 10, Chapter 2, Chapter 1.", "Choose A–Z with numeric awareness on."],
          result: "Chapter 1, Chapter 2, Chapter 10",
        },
        {
          title: "Sorting a glossary by length",
          steps: ["Paste term definitions (one per line).", "Choose Shortest first.", "Useful for finding compact entries for a summary."],
          result: "Lines ordered from fewest to most characters",
        },
      ],
      limitations: [
        "Locale collation for English is used by default; languages such as Swedish or German have different alphabetisation rules for Å, Ä and Ö.",
        "Sorting is line-based. Multi-line records (for example a CSV row wrapped over two lines) will split incorrectly.",
        "Numerical sorting only applies to numbers at the start of a line or embedded in text, not to full arithmetic expressions.",
      ],
      faqs: [
        {
          q: "Does it remove duplicates?",
          a: "Only if you enable Remove duplicates. By default every line is kept so the sort is non-destructive.",
        },
        {
          q: "Why does 'item 10' come after 'item 9'?",
          a: "Numeric awareness is on by default, so digit runs compare as numbers. Turn it off to get strict character-code ordering where '10' comes before '9'.",
        },
        {
          q: "Can I sort a comma-separated list?",
          a: "Yes. Use the split option to treat commas as line breaks first, then sort, then rejoin with commas if needed.",
        },
      ],
    },
  },
  {
    slug: "whitespace-cleaner",
    name: "Whitespace Cleaner",
    category: "text",
    tagline: "Fix double spaces, stray tabs, ragged line breaks and invisible characters.",
    intent: "remove extra spaces from text",
    keywords: [
      "remove extra spaces",
      "whitespace remover",
      "clean text",
      "remove line breaks",
      "trim spaces online",
    ],
    status: "live",
    actions: ["copy", "download"],
    effort: "instant",
    popularity: 66,
    addedAt: "2025-01-22",
    seoTitle: "Whitespace Cleaner — Remove Extra Spaces & Line Breaks",
    seoDescription:
      "Clean pasted text in seconds: collapse double spaces, strip tabs, remove blank lines, fix non-breaking spaces and normalise line endings.",
    content: {
      intro: [
        "Text pasted from PDFs, emails and spreadsheets is full of invisible damage: double spaces, trailing tabs, non-breaking spaces that break search, and blank lines that double the height of a document. None of it is visible, and all of it causes problems downstream.",
        "This cleaner normalises whitespace in one pass. Choose exactly which fixes to apply and see a live before/after count, so you never silently change content you meant to keep.",
      ],
      howTo: [
        "Paste the text that needs cleaning.",
        "Enable the fixes you want — collapse spaces, trim lines, remove blank lines, strip tabs.",
        "Review the character count before and after.",
        "Copy the cleaned result.",
      ],
      method: {
        title: "What gets normalised",
        paragraphs: [
          "Non-breaking spaces (U+00A0), narrow no-break spaces and other Unicode space separators are converted to ordinary spaces, because they look identical but break search, sorting and diffing. Tabs can be replaced with a single space or removed entirely.",
          "Collapsing replaces runs of two or more spaces with one. Trimming removes leading and trailing whitespace from every line. Blank-line removal deletes lines that contain no visible characters. Line endings are normalised to \\n so results paste consistently across platforms.",
        ],
        formula: "text.replace(/[\\u00A0\\u2007\\u202F]/g, ' ').replace(/ {2,}/g, ' ')",
      },
      examples: [
        {
          title: "Cleaning text copied from a PDF",
          steps: ["Paste a paragraph with double spaces and hard line breaks.", "Enable Collapse spaces and Join lines.", "Compare the character counts shown above the result."],
          result: "One tidy paragraph with single spaces and consistent wrapping",
        },
        {
          title: "Preparing a CSV column for import",
          steps: ["Paste the column values.", "Enable Trim lines and Remove blank lines.", "Download the cleaned values."],
          result: "No leading spaces, no empty rows, import succeeds",
        },
      ],
      limitations: [
        "Collapsing spaces changes indentation, so do not use it on code, YAML or Markdown where leading whitespace is semantic.",
        "Joining lines removes intentional paragraph breaks; use it only for text that was hard-wrapped.",
        "Zero-width characters are removed only when that option is enabled, because they are sometimes used deliberately in languages that need word-breaking hints.",
      ],
      faqs: [
        {
          q: "What is a non-breaking space and why does it matter?",
          a: "A non-breaking space looks like a normal space but is a different character. It breaks exact-match search, sorting and many database imports, so it is usually worth converting to a regular space.",
        },
        {
          q: "Can I keep paragraph breaks while removing double spaces?",
          a: "Yes. Leave Remove blank lines and Join lines switched off — only the space collapsing applies, so paragraphs stay separated.",
        },
        {
          q: "Is my text stored?",
          a: "No. Cleaning happens in your browser and the text is discarded when you close or reload the page.",
        },
      ],
    },
  },
  {
    slug: "slug-generator",
    name: "Slug Generator",
    category: "text",
    tagline: "Turn any title into a clean, URL-safe slug with sensible options.",
    intent: "convert title to url slug",
    keywords: [
      "slug generator",
      "url slug",
      "text to slug",
      "permalink generator",
      "seo friendly url",
    ],
    status: "live",
    actions: ["copy"],
    effort: "instant",
    popularity: 55,
    addedAt: "2025-01-25",
    seoTitle: "Slug Generator — Create Clean, SEO-Friendly URL Slugs",
    seoDescription:
      "Convert any title into a lowercase, hyphenated URL slug. Handles accents, emoji, stop words and custom separators. Free and instant.",
    content: {
      intro: [
        "A slug is the readable part of a URL that identifies a page: in /blog/how-to-write-a-slug, the slug is how-to-write-a-slug. Good slugs are lowercase, hyphenated, free of punctuation and stable over time, because changing a slug breaks links and loses accumulated search signals.",
        "This generator normalises accents, removes emoji and punctuation, collapses separators and enforces a maximum length — the four things that most often go wrong when slugs are generated by hand.",
      ],
      howTo: [
        "Type or paste the page title.",
        "Choose a separator (hyphen or underscore) and whether to drop common stop words.",
        "Set a maximum length if your CMS enforces one.",
        "Copy the generated slug and use it as the page's permanent URL.",
      ],
      method: {
        title: "The normalisation pipeline",
        paragraphs: [
          "The title is decomposed with Unicode NFD so accented letters split into a base letter plus a combining mark; the marks are then stripped, leaving plain ASCII. Lowercasing and replacing anything that is not a letter, digit or space with a separator removes emoji, quotes, em dashes and bracket characters.",
          "Runs of separators collapse into one, leading and trailing separators are trimmed, and — if requested — stop words such as 'a', 'the' and 'of' are removed to keep URLs short. Finally the result is truncated at a word boundary rather than mid-word.",
        ],
        formula: "slug = title.normalize('NFD').replace(/\\p{M}/gu,'').toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'')",
      },
      examples: [
        {
          title: "Blog post title to slug",
          steps: ["Input: 10 Ways to Improve Your Writing (2025 Guide)", "Default options keep numbers and drop punctuation."],
          result: "10-ways-to-improve-your-writing-2025-guide",
        },
        {
          title: "Accented title to ASCII slug",
          steps: ["Input: Crème Brûlée — Le Meilleur Dessert", "Accents are decomposed and removed; the em dash becomes a separator."],
          result: "creme-brulee-le-meilleur-dessert",
        },
      ],
      limitations: [
        "Transliteration covers Latin diacritics; Greek, Cyrillic, Arabic and CJK characters are removed rather than romanised, which can leave an empty slug.",
        "Stop-word removal follows an English list and should be disabled for other languages.",
        "Slugs do not need to be unique — your CMS must still check for collisions before publishing.",
      ],
      faqs: [
        {
          q: "Should slugs use hyphens or underscores?",
          a: "Hyphens. Google treats hyphens as word separators, while underscores historically join words into a single token.",
        },
        {
          q: "Can I change a slug after publishing?",
          a: "You can, but add a 301 redirect from the old URL. Otherwise every existing link and any ranking signal tied to that URL is lost.",
        },
        {
          q: "Why remove stop words?",
          a: "Short, descriptive URLs are easier to read and share. Removing 'a', 'the' and 'of' rarely changes meaning. Some SEO practitioners prefer to keep every word for exact-match clarity — both are defensible, so the option is yours.",
        },
      ],
    },
  },
  {
    slug: "find-and-replace",
    name: "Find & Replace",
    category: "text",
    tagline: "Replace text with optional regex, case matching and match counts.",
    intent: "find and replace text online",
    keywords: [
      "find and replace",
      "text replacer",
      "regex replace",
      "replace words online",
      "bulk replace text",
    ],
    status: "live",
    actions: ["copy", "download"],
    effort: "quick",
    popularity: 58,
    addedAt: "2025-01-28",
    seoTitle: "Find & Replace — Bulk Text Replacement With Regex Support",
    seoDescription:
      "Find and replace text online with optional regular expressions, case-sensitive matching and capture groups. See match counts before you commit.",
    content: {
      intro: [
        "Find and replace inside a text editor is fine until the text lives in a web form, a CMS field or a chat message. This tool gives you the same power with a live match count so you can see the damage before you commit.",
        "Advanced users can enable regular expressions, including capture groups that reorder text — for example turning Firstname Lastname into Lastname, Firstname across a whole list.",
      ],
      howTo: [
        "Paste your source text.",
        "Enter the search term and its replacement.",
        "Enable regex, case-sensitivity or whole-word matching as needed.",
        "Check the match count, then copy or download the result.",
      ],
      method: {
        title: "Matching rules",
        paragraphs: [
          "Plain mode escapes every regex metacharacter, so searching for a period matches a literal period rather than any character. Whole-word mode wraps the pattern in word boundaries, which prevents 'cat' from matching inside 'category'.",
          "Regex mode compiles your pattern with the flags you select and supports numbered capture groups ($1, $2) plus named groups ($<name>) in the replacement string. Invalid patterns are reported with the browser's own error message instead of failing silently.",
        ],
        formula: "result = source.replace(new RegExp(escape(pattern), flags), replacement)",
      },
      examples: [
        {
          title: "Standardising a product name",
          steps: ["Search for 'colour' with case-insensitive matching.", "Replace with 'color'.", "The match count confirms 14 replacements."],
          result: "14 replacements across the pasted copy",
        },
        {
          title: "Swapping name order with capture groups",
          steps: [
            "Enable regex and enter ^(\\w+)\\s+(\\w+)$ as the pattern.",
            "Enter $2, $1 as the replacement.",
            "Enable the multiline flag so each line is matched separately.",
          ],
          result: "Ada Lovelace becomes Lovelace, Ada",
        },
      ],
      limitations: [
        "Regex runs in the browser's JavaScript engine, which supports a slightly different feature set from PCRE (no recursion, no \\A).",
        "Catastrophic backtracking is possible with badly written patterns; the tool processes a single pass, so an aggressive pattern on a very large input can freeze the tab briefly.",
        "Replacements are literal strings — use $1-style groups; backslash escapes from other tools may need adjusting.",
      ],
      faqs: [
        {
          q: "Is my text sent to a server?",
          a: "No. Matching and replacement run locally in the page, which also means the tool works offline once loaded.",
        },
        {
          q: "How do I replace only whole words?",
          a: "Enable Whole word. The pattern is wrapped in word boundaries, so 'art' will not match the 'art' inside 'article'.",
        },
        {
          q: "Can I use capture groups?",
          a: "Yes. Enable regex and reference groups as $1, $2 in the replacement, or use named groups with $<name>.",
        },
      ],
    },
  },
  {
    slug: "lorem-ipsum-generator",
    name: "Lorem Ipsum Generator",
    category: "text",
    tagline: "Generate placeholder paragraphs, sentences or words for mockups.",
    intent: "generate lorem ipsum placeholder text",
    keywords: [
      "lorem ipsum generator",
      "placeholder text",
      "dummy text generator",
      "filler text",
      "random text",
    ],
    status: "live",
    actions: ["copy", "download"],
    effort: "instant",
    popularity: 63,
    addedAt: "2025-02-01",
    seoTitle: "Lorem Ipsum Generator — Placeholder Text for Design Mockups",
    seoDescription:
      "Generate lorem ipsum paragraphs, sentences or individual words. Choose the amount, start with the classic opening and copy in one click.",
    content: {
      intro: [
        "Designers need text that looks like language without being language. Lorem ipsum has filled that role since the 1500s because its word-length distribution roughly matches English, so a layout looks realistic without reviewers arguing about the copy.",
        "Generate as many paragraphs, sentences or words as you need. The classic opening is available for mockups that call for it, and the rest of the text is assembled from a fixed vocabulary so every generated block has the same visual rhythm.",
      ],
      howTo: [
        "Choose whether you need paragraphs, sentences or words.",
        "Set the amount.",
        "Toggle the classic opening if the design should start with 'Lorem ipsum dolor sit amet'.",
        "Copy the generated text into your design tool.",
      ],
      method: {
        title: "How the text is assembled",
        paragraphs: [
          "Words are drawn from a fixed canonical Lorem Ipsum vocabulary, weighted so common Latin function words appear at plausible frequencies. Sentences are built between eight and twenty words and always end with a period; paragraphs contain three to six sentences.",
          "Generation uses a seeded pseudo-random generator when you supply a seed, so the same seed produces the same text — useful when you need consistent screenshots across a design review.",
        ],
        formula: "paragraph = sentences(randInt(3, 6))  ·  sentence = words(randInt(8, 20))",
      },
      examples: [
        {
          title: "Filling three card descriptions",
          steps: ["Choose Sentences.", "Set the count to 3.", "Copy each line into a card in your design."],
          result: "Three distinct placeholder sentences with realistic length variation",
        },
        {
          title: "Recreating the same placeholder for a revision",
          steps: ["Set a seed such as 2025.", "Generate and copy.", "Re-enter the same seed later to get identical text."],
          result: "Identical output for the same seed and settings",
        },
      ],
      limitations: [
        "Lorem ipsum is not English. Do not ship it as final copy — placeholder text left in production is a common and embarrassing defect.",
        "Generated text contains no semantic meaning, so it cannot be used to evaluate information hierarchy or reading comprehension.",
        "Screen readers may attempt to pronounce Latin words; mark decorative placeholders with aria-hidden in production.",
      ],
      faqs: [
        {
          q: "Why is lorem ipsum used instead of real text?",
          a: "It has a realistic letter and word-length distribution, so layouts look natural, while being meaningless enough that reviewers focus on design rather than wording.",
        },
        {
          q: "Is lorem ipsum copyrighted?",
          a: "No. The standard text is a scrambled excerpt from Cicero's De finibus, written in 45 BC — long in the public domain.",
        },
        {
          q: "Can I generate a fixed amount for a specific layout?",
          a: "Yes. Word, sentence and paragraph modes each accept an exact count, and the character total is shown so you can match a design's text block.",
        },
      ],
    },
  },
  {
    slug: "text-diff",
    name: "Text Difference Checker",
    category: "text",
    tagline: "Compare two texts and see exactly what changed, line by line.",
    intent: "compare two texts for differences",
    keywords: [
      "text diff",
      "compare text",
      "text difference checker",
      "diff checker",
      "compare two documents",
    ],
    status: "live",
    actions: ["copy"],
    effort: "quick",
    popularity: 72,
    addedAt: "2025-02-04",
    seoTitle: "Text Diff Checker — Compare Two Texts and See Changes",
    seoDescription:
      "Compare two versions of any text and highlight added, removed and unchanged lines. Side-by-side and inline views, word-level detail, no upload.",
    content: {
      intro: [
        "When two versions of a contract clause, a policy or a translation look almost identical, the eye is a poor diff engine. This tool highlights exactly which lines were added and removed, and which lines changed by only a word or two.",
        "It implements the same longest-common-subsequence approach used by version control, so the output has the familiar plus/minus structure. A word-level view breaks changed lines into the specific tokens that differ.",
      ],
      howTo: [
        "Paste the original text on the left and the revised text on the right.",
        "Choose line or word granularity.",
        "Read the summary for counts of added and removed changes.",
        "Switch between inline and side-by-side views.",
      ],
      method: {
        title: "The diff algorithm",
        paragraphs: [
          "The tool computes a longest common subsequence (LCS) between the two line arrays. Lines in the LCS are unchanged; lines present only in the original are removals; lines present only in the revision are additions. This is the same algorithm family behind git diff and GNU diff.",
          "Word mode first splits changed line pairs into tokens and runs the same LCS over tokens, which is why a rewritten sentence shows only the words that actually changed rather than the entire line.",
        ],
        formula: "diff(a, b) = LCS(a, b) with additions and deletions derived from the complement",
      },
      examples: [
        {
          title: "Reviewing a policy update",
          steps: ["Paste the old paragraph and the new one.", "Choose Word mode.", "Only the changed clause is highlighted."],
          result: "2 additions, 1 removal — the rest of the paragraph is unchanged",
        },
        {
          title: "Checking a translation against the source",
          steps: ["Paste both versions in line mode.", "Added lines show where the translation expanded the text.", "Removed lines show omissions."],
          result: "Line-level overview with a change count per side",
        },
      ],
      limitations: [
        "LCS diffing is O(n·m) in the worst case; extremely large documents (tens of thousands of lines) are truncated to keep the browser responsive.",
        "Whitespace differences are visible only when you enable Show whitespace; trailing spaces otherwise look identical.",
        "The tool compares text, not formatting. Bold, colours and images in rich text are not part of the comparison.",
      ],
      faqs: [
        {
          q: "Can this compare two PDFs?",
          a: "Not directly. Copy the text out of each PDF first, then paste both versions here. PDF tools that promise direct comparison usually extract text in the same way under the hood.",
        },
        {
          q: "What does the summary count mean?",
          a: "It reports how many line blocks were added and removed. A rewritten line counts as one removal and one addition unless the word-level view shows only part of it changed.",
        },
        {
          q: "Is my text uploaded?",
          a: "No. Both versions are compared in your browser and never leave the device.",
        },
      ],
    },
  },
];
