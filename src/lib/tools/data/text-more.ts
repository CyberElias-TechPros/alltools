import type { ToolDefinition } from "../types";

/**
 * Second wave of text tools, matching the catalogue in docs/BLUEPRINT.md §A.
 * Every entry here is backed by a working component and by functions in
 * src/lib/text.ts (or src/lib/markdown.ts) covered by tests.
 */
export const textMoreTools: ToolDefinition[] = [
  {
    slug: "character-counter",
    name: "Character Counter",
    category: "text",
    tagline: "Count characters and see how close a draft is to a platform limit.",
    intent: "count characters for social posts, meta descriptions and SMS",
    keywords: ["character counter", "character count", "twitter character limit", "sms length", "meta description length"],
    status: "live",
    actions: ["copy"],
    effort: "instant",
    popularity: 88,
    addedAt: "2025-11-02",
    seoTitle: "Character Counter — Check Limits for X, SMS and Meta Tags",
    seoDescription:
      "Count characters with and without spaces, then check a draft against real platform limits for X posts, SMS, meta titles and descriptions. Free and local.",
    content: {
      intro: [
        "Character counts are set by platforms, not by writers: 280 on X, 160 for a single SMS segment, about 60 for a meta title and 155 for a meta description. This counter shows every count that matters at once and compares your draft with the limit you choose.",
        "The text is measured in your browser. Nothing is uploaded, so you can paste unpublished copy.",
      ],
      howTo: [
        "Paste or type your text into the box.",
        "Read the live totals: characters with spaces, without spaces, words and lines.",
        "Pick a platform limit to see the remaining characters and whether the draft fits.",
        "Trim the text and watch the remaining count update as you type.",
      ],
      method: {
        title: "What counts as a character",
        paragraphs: [
          "The counter measures Unicode code points, which is what people mean by \"characters\": an emoji or an accented letter counts once even though JavaScript stores it as two UTF-16 units.",
          "Line breaks are counted as one character each and included in the total, because platforms treat them as characters too.",
        ],
        formula: "characters = [ ...text ].length\ntwitter limit 280 · sms segment 160 · meta title 60 · meta description 155",
      },
      examples: [
        {
          title: "Checking an X post",
          steps: ["Paste a 300-character announcement.", "Select the X (280) limit."],
          result: "300 characters — 20 over the limit.",
        },
        {
          title: "Fitting a meta description",
          steps: ["Paste a two-sentence summary.", "Select the meta description (155) limit."],
          result: "142 characters — 13 to spare.",
        },
      ],
      limitations: [
        "Platform limits change. The built-in figures are a guide, not an official specification — check the platform's current documentation before publishing.",
        "Some services count UTF-16 units or grapheme clusters instead of code points, and SMS counting also depends on the encoding (GSM-7 or UCS-2) used by the carrier.",
      ],
      faqs: [
        {
          q: "Do spaces count?",
          a: "Yes. Platforms count every character, including spaces and line breaks. The tool shows both totals so you can see the difference.",
        },
        {
          q: "Why does an emoji count as one character here but as two elsewhere?",
          a: "JavaScript stores most emoji as a surrogate pair. This counter follows the code point (the character a person sees); some platform counters use UTF-16 units. When a value is close to a limit, leave a margin.",
        },
        {
          q: "Is there a maximum amount of text?",
          a: "No hard limit is imposed, but browsers slow down on very large documents. For anything above a few hundred thousand characters, paste a section at a time.",
        },
      ],
    },
  },
  {
    slug: "sentence-counter",
    name: "Sentence Counter",
    category: "text",
    tagline: "Count sentences and see the length of each one at a glance.",
    intent: "count sentences and analyse sentence length",
    keywords: ["sentence counter", "count sentences", "sentence length", "average sentence length"],
    status: "live",
    actions: ["copy"],
    effort: "instant",
    popularity: 72,
    addedAt: "2025-11-02",
    seoTitle: "Sentence Counter — Count and Measure Sentences",
    seoDescription:
      "Count sentences, see each sentence's word count and find the longest and shortest ones. Useful for readability checks, essays and scripts. Runs offline.",
    content: {
      intro: [
        "Sentence counts are the least reliable of the basic text statistics, because punctuation is ambiguous: is \"Dr.\" an abbreviation or the end of a sentence? This tool uses an explicit rule — a sentence ends at a full stop, question mark or exclamation mark, optionally followed by closing quotes or brackets — and shows you every sentence it found so you can check the split.",
        "Long sentences are the usual cause of low readability scores. Seeing the actual list makes the problem concrete.",
      ],
      howTo: [
        "Paste your text into the input box.",
        "Read the total sentence count and the average number of words per sentence.",
        "Scan the list below the result to find unusually long sentences.",
        "Copy the summary or the sentence list for your notes.",
      ],
      method: {
        title: "How sentences are separated",
        paragraphs: [
          "The text is normalised, then split after any run of . ! or … characters that is followed by closing punctuation such as a quote or bracket.",
          "Fragments with no letters or digits are discarded, so a stray \"...\" does not create an empty sentence.",
        ],
        formula: "sentences = text.split(/(?<=[.!?…][\"'”’)\\]]*)\\s+/)",
      },
      examples: [
        {
          title: "A short paragraph",
          steps: ["Paste three sentences of 12, 8 and 21 words.", "Read the summary."],
          result: "3 sentences · average 13.7 words · longest 21 words.",
        },
        {
          title: "A paragraph with an abbreviation",
          steps: ["Paste \"Dr. Smith arrived. He was late.\"", "Check the sentence list."],
          result: "2 sentences — the abbreviation is followed by a capitalised word, so it is treated as a sentence end and shown for review.",
        },
      ],
      limitations: [
        "Abbreviations such as \"Dr.\", \"e.g.\" and decimal points can be read as sentence endings; the list view exists so you can spot that.",
        "Text without punctuation (headings, bullet lists, poetry) is counted as a single sentence.",
      ],
      faqs: [
        {
          q: "Why does the count differ from my word processor?",
          a: "Each program has its own rules for abbreviations and ellipses. Here the rule is explicit and the split is visible, so you can decide which count is right for your purpose.",
        },
        {
          q: "Does it count sentence length in words or characters?",
          a: "Both. The list shows words per sentence; the summary reports the average and highlights the longest and shortest sentences.",
        },
        {
          q: "Can I use it for an essay limit?",
          a: "Yes, but check your institution's definition — some count only complete sentences and exclude headings or parenthetical notes.",
        },
      ],
    },
  },
  {
    slug: "paragraph-counter",
    name: "Paragraph Counter",
    category: "text",
    tagline: "Count paragraphs and see the word count of each block.",
    intent: "count paragraphs in a document",
    keywords: ["paragraph counter", "count paragraphs", "paragraph word count", "document structure"],
    status: "live",
    actions: ["copy"],
    effort: "instant",
    popularity: 63,
    addedAt: "2025-11-02",
    seoTitle: "Paragraph Counter — Count Paragraphs and Their Words",
    seoDescription:
      "Count paragraphs in any text and see how many words and sentences each one holds. Spot unbalanced sections before you publish or submit. No uploads.",
    content: {
      intro: [
        "A paragraph count is only meaningful if you know how paragraphs were detected. This tool splits on blank lines — the convention used by Markdown, most CMSs and word processors — and shows each block with its own word and sentence count.",
        "That view exposes the problem most drafts have: one enormous paragraph carrying half the argument while three others hold a single line.",
      ],
      howTo: [
        "Paste the document into the text area.",
        "Read the paragraph total and the average words per paragraph.",
        "Compare the per-paragraph counts to find blocks that are too long or too short.",
        "Copy the breakdown if you need it for an edit note.",
      ],
      method: {
        title: "How paragraphs are detected",
        paragraphs: [
          "The text is split on two or more consecutive line breaks, which is how a blank line between blocks is stored in plain text.",
          "A single line break inside a block is treated as a wrapped line, not a new paragraph. Trimmed-empty blocks are ignored.",
        ],
        formula: "paragraphs = text.split(/\\n{2,}/).filter(block => block.trim())",
      },
      examples: [
        {
          title: "Three paragraphs",
          steps: ["Paste three blocks separated by blank lines.", "Read the counts."],
          result: "3 paragraphs · average 41 words · longest 78 words.",
        },
        {
          title: "Hard-wrapped text",
          steps: ["Paste text where every line ends at 80 characters.", "Check the paragraph count."],
          result: "1 paragraph — line wrapping does not start a new paragraph.",
        },
      ],
      limitations: [
        "Text that uses a single line break between paragraphs (common in some plain-text emails) is counted as one paragraph.",
        "Indented first lines and HTML <p> tags are not interpreted; paste plain text for the most predictable result.",
      ],
      faqs: [
        {
          q: "What counts as a paragraph break?",
          a: "A blank line — two consecutive newlines with nothing between them. That is what most editors store when you press Enter twice.",
        },
        {
          q: "Can I count paragraphs in a Word document?",
          a: "Copy the text out of the document and paste it here. Copying preserves paragraph breaks in almost every case.",
        },
        {
          q: "Does the tool count headings?",
          a: "It counts every non-empty block, including headings and list blocks. Remove headings first if you need body paragraphs only.",
        },
      ],
    },
  },
  {
    slug: "reading-time-calculator",
    name: "Reading Time Calculator",
    category: "text",
    tagline: "Estimate reading time at any pace, from careful study to skimming.",
    intent: "calculate reading time for an article",
    keywords: ["reading time calculator", "how long to read", "words per minute", "reading speed"],
    status: "live",
    actions: ["copy"],
    effort: "instant",
    popularity: 84,
    addedAt: "2025-11-02",
    seoTitle: "Reading Time Calculator — Estimate Time to Read Any Text",
    seoDescription:
      "Estimate how long a piece takes to read at 150, 200, 250 or 300 words per minute, or set your own pace. Works on pasted text only, entirely in your browser.",
    content: {
      intro: [
        "Reading time estimates are a promise to the reader: \"6 min read\" tells someone whether to start now or save it for later. The estimate is only useful if the pace is stated, because average adult reading speed varies from about 150 words per minute for dense technical material to over 300 for skimming familiar topics.",
        "This calculator shows your text at several paces at once, plus a custom pace if you know your audience.",
      ],
      howTo: [
        "Paste the article, script or document into the box.",
        "Read the word count and the estimated time at each standard pace.",
        "Set a custom words-per-minute value to match your audience or your own measured speed.",
        "Copy the figure you want to publish.",
      ],
      method: {
        title: "The estimate",
        paragraphs: [
          "Words are counted by splitting on whitespace. Time is words divided by pace, rounded up to the next whole minute so a 5 min 10 s article is advertised as 6 minutes rather than under-promising.",
          "The default pace is 225 words per minute, a common average for adult non-fiction reading.",
        ],
        formula: "minutes = ceil(words / wordsPerMinute)",
      },
      examples: [
        {
          title: "A 1,200-word article",
          steps: ["Paste 1,200 words.", "Read the table at 150–300 wpm."],
          result: "8 min at 150 wpm · 6 min at 200 · 5 min at 250 · 4 min at 300.",
        },
        {
          title: "A two-minute speech",
          steps: ["Paste a 260-word script.", "Set the pace to 130 wpm (speaking)."],
          result: "2 minutes — the standard length of a short talk.",
        },
      ],
      limitations: [
        "Reading speed ignores images, code samples, tables and diagrams, which take extra time.",
        "Estimates are averages: a specialist audience reading unfamiliar material can be three times slower than the headline figure.",
      ],
      faqs: [
        {
          q: "What reading speed should I use?",
          a: "200–250 words per minute is the usual editorial standard for general non-fiction. Use 150 for technical or legal material and 300 only for light skimming.",
        },
        {
          q: "Should reading time include code or tables?",
          a: "Ideally yes, but there is no reliable formula. A practical approach is to add 10–15 seconds per code block or table row that a reader has to study.",
        },
        {
          q: "Does this work for non-English text?",
          a: "It counts whitespace-separated tokens, which suits languages written with spaces. For Chinese or Japanese, count characters instead — roughly 400–500 characters per minute.",
        },
      ],
    },
  },
  {
    slug: "speaking-time-calculator",
    name: "Speaking Time Calculator",
    category: "text",
    tagline: "Work out how long a script takes to deliver out loud.",
    intent: "calculate speaking time for a speech or presentation",
    keywords: ["speaking time calculator", "speech length", "words per minute speaking", "presentation script timing"],
    status: "live",
    actions: ["copy"],
    effort: "instant",
    popularity: 70,
    addedAt: "2025-11-02",
    seoTitle: "Speaking Time Calculator — Time Your Speech or Script",
    seoDescription:
      "Estimate how long a script takes to speak at conversational, presentation or slow paces, with slide counts. Free, browser-based and nothing uploaded.",
    content: {
      intro: [
        "Most talks run long because the script was timed at reading speed. Speaking is slower: conversation runs at roughly 130–150 words per minute, a rehearsed presentation at about 120, and deliberate delivery with pauses can drop below 100.",
        "Paste the script and the tool shows the delivery time at each pace, plus how many words fit in a target slot.",
      ],
      howTo: [
        "Paste your script into the box.",
        "Choose a pace, or read the table showing each pace.",
        "Set a target duration to see how many words fit in that slot.",
        "Cut or add material and watch the estimate change instantly.",
      ],
      method: {
        title: "The estimate",
        paragraphs: [
          "Speaking time is word count divided by the pace. The default is 130 words per minute, a natural conversational rate that includes small pauses.",
          "The reverse calculation — words that fit a duration — multiplies the target minutes by the pace, which is the figure to aim for when writing to a slot.",
        ],
        formula: "seconds = ceil(words / wordsPerMinute × 60)\nwords that fit = minutes × wordsPerMinute",
      },
      examples: [
        {
          title: "A five-minute slot",
          steps: ["Set a target of 5 minutes.", "Read the word budget at 130 wpm."],
          result: "650 words — about 2.5 pages of A4 at 12 pt.",
        },
        {
          title: "A 900-word keynote",
          steps: ["Paste 900 words.", "Compare the paces."],
          result: "6 min 56 s at 130 wpm · 7 min 30 s at 120 wpm.",
        },
      ],
      limitations: [
        "Pauses, audience laughter, questions and demonstrations are not included — add 10–20% for an interactive session.",
        "Reading a script aloud is usually faster than speaking naturally; time a rehearsal to correct the estimate.",
      ],
      faqs: [
        {
          q: "How many words is a 10-minute speech?",
          a: "About 1,300 words at a conversational 130 words per minute, or 1,200 at a measured presentation pace. Rehearse with a timer before you rely on it.",
        },
        {
          q: "Why is speaking slower than reading?",
          a: "Speaking adds breath pauses, emphasis and time to form sentences. Reading silently skips all of that, which is why scripts timed at reading pace overrun.",
        },
        {
          q: "Should I include slide changes?",
          a: "Yes if they involve a pause. A reliable rule is to add two to three seconds per slide, or simply rehearse the full deck once.",
        },
      ],
    },
  },
  {
    slug: "line-break-remover",
    name: "Line Break Remover",
    category: "text",
    tagline: "Turn hard-wrapped lines back into flowing paragraphs.",
    intent: "remove line breaks from copied text",
    keywords: ["remove line breaks", "line break remover", "remove newlines", "unwrap text"],
    status: "live",
    actions: ["copy", "download"],
    effort: "instant",
    popularity: 68,
    addedAt: "2025-11-02",
    seoTitle: "Line Break Remover — Unwrap Text and Remove Newlines",
    seoDescription:
      "Remove line breaks from pasted text, or keep paragraph breaks while joining wrapped lines. Handles Windows, Mac and Unix line endings. No uploads.",
    content: {
      intro: [
        "Copy text out of a PDF, an email or a terminal window and you inherit hard line breaks at the end of every visual line. Paste that into a CMS and the text wraps in the wrong places.",
        "This tool joins the lines back up. You choose whether blank lines should stay as paragraph breaks, become single spaces or disappear entirely.",
      ],
      howTo: [
        "Paste the wrapped text into the input box.",
        "Choose a mode: spaces (all breaks become spaces), paragraph (blank lines kept, wrapped lines joined), single space or remove entirely.",
        "Copy the cleaned text into your document.",
      ],
      method: {
        title: "What each mode does",
        paragraphs: [
          "Spaces mode replaces every run of newlines with a single space and collapses repeated spaces.",
          "Paragraph mode splits on blank lines first, joins the lines inside each block with spaces, then re-joins the blocks with a blank line — so structure survives.",
        ],
        formula: "spaces:    text.replace(/\\n+/g, \" \")\nparagraph: text.split(/\\n{2,}/).map(join).join(\"\\n\\n\")",
      },
      examples: [
        {
          title: "A hard-wrapped paragraph",
          steps: ["Paste four lines of 70 characters each.", "Choose Paragraph mode."],
          result: "One continuous paragraph with the words separated by single spaces.",
        },
        {
          title: "Two paragraphs",
          steps: ["Paste two blocks separated by a blank line.", "Choose Paragraph mode."],
          result: "Two paragraphs, each joined internally, separated by one blank line.",
        },
      ],
      limitations: [
        "Hyphenated line breaks (\"exam-\\nple\") are left as \"exam- ple\"; fix those manually.",
        "Very long lines are not wrapped for you — the output is a single line per paragraph.",
      ],
      faqs: [
        {
          q: "Will this remove paragraph breaks too?",
          a: "Only in Spaces or Remove mode. Paragraph mode keeps blank lines, which is usually what you want for prose.",
        },
        {
          q: "Does it handle Windows line endings?",
          a: "Yes. Carriage returns are normalised first, so text from Windows, macOS and Linux behaves the same.",
        },
        {
          q: "Can I download the result?",
          a: "Yes — use the download button to save the cleaned text as a .txt file, or copy it straight to the clipboard.",
        },
      ],
    },
  },
  {
    slug: "slug-to-text-converter",
    name: "Slug to Text Converter",
    category: "text",
    tagline: "Turn a URL slug back into readable words and a proper title.",
    intent: "convert a URL slug to readable text",
    keywords: ["slug to text", "url to title", "slug converter", "readable url"],
    status: "live",
    actions: ["copy"],
    effort: "instant",
    popularity: 58,
    addedAt: "2025-11-02",
    seoTitle: "Slug to Text Converter — Make a URL Readable Again",
    seoDescription:
      "Convert a URL slug such as my-first-post back into readable text, title case or a sentence. Strips domains, query strings and numeric IDs. Free.",
    content: {
      intro: [
        "Slugs are compressed for URLs, not for reading: hyphens replace spaces, punctuation disappears and case is lost. Rebuilding a human-readable title from one is a routine job when migrating content or auditing a sitemap.",
        "Paste a slug, a path or a whole URL. The converter strips the domain and query string, then rebuilds the words.",
      ],
      howTo: [
        "Paste a slug, path or full URL.",
        "Choose title case, sentence case or lower case.",
        "Enable \"strip numbers\" if IDs such as -2024-117 should be dropped.",
        "Copy the result.",
      ],
      method: {
        title: "How the words are rebuilt",
        paragraphs: [
          "The input is reduced to its path segment, separators (hyphens, underscores, slashes, plus signs) become spaces, and everything that is not a letter or digit is removed.",
          "Title case capitalises the first letter of each word. Sentence case lowercases everything then capitalises the first character.",
        ],
        formula: "words = slug.replace(/[-_/+]+/g, \" \").replace(/[^\\p{L}\\p{N} ]/gu, \"\")",
      },
      examples: [
        {
          title: "A blog slug",
          steps: ["Paste how-to-choose-a-strong-password.", "Select title case."],
          result: "How To Choose A Strong Password",
        },
        {
          title: "A full URL with an ID",
          steps: ["Paste https://example.com/blog/2024/07/my-post-1234.", "Enable strip numbers."],
          result: "My Post",
        },
      ],
      limitations: [
        "Lost information cannot be recovered: a slug that dropped stop words or accents cannot be restored to the original phrasing.",
        "Acronyms come back capitalised as words (\"api-guide\" becomes \"Api Guide\"); fix those by hand.",
      ],
      faqs: [
        {
          q: "Does it work with non-Latin slugs?",
          a: "Yes. Letters and digits in any script are preserved; only URL punctuation is removed.",
        },
        {
          q: "Can it restore the original title exactly?",
          a: "No. Slugs are lossy by design. The output is a readable approximation you can edit.",
        },
        {
          q: "Why are numbers still there?",
          a: "Numbers are meaningful in many slugs (\"iphone-15-review\"). Turn on strip numbers only when they are identifiers.",
        },
      ],
    },
  },
  {
    slug: "random-text-generator",
    name: "Random Text Generator",
    category: "text",
    tagline: "Generate neutral filler text when lorem ipsum is the wrong flavour.",
    intent: "generate random filler text",
    keywords: ["random text generator", "filler text", "dummy text", "placeholder copy"],
    status: "live",
    actions: ["copy", "download"],
    effort: "instant",
    popularity: 54,
    addedAt: "2025-11-02",
    seoTitle: "Random Text Generator — Neutral Filler for Layouts",
    seoDescription:
      "Generate neutral English filler text by paragraph and sentence count for mockups and layout tests. Seeded, repeatable and generated in your browser.",
    content: {
      intro: [
        "Lorem ipsum is the default placeholder, but its Latin look distracts stakeholders and its word lengths are unrepresentative. This generator produces ordinary English words instead, so a layout is judged on realistic line lengths and no reviewer asks what the text means.",
        "Output is generated locally from a fixed word bank with a seeded random number generator, so the same seed produces the same text twice.",
      ],
      howTo: [
        "Choose how many paragraphs you need.",
        "Choose sentences per paragraph.",
        "Press Generate for a new sample, then copy or download the result.",
      ],
      method: {
        title: "How the text is produced",
        paragraphs: [
          "Each sentence draws six to fourteen words from a 50-word bank of ordinary English nouns, then capitalises the first word and adds a full stop.",
          "A mulberry32 pseudo-random generator seeded per run makes output reproducible — the same seed always yields the same text, which is useful when a mockup needs to stay stable.",
        ],
        formula: "sentences = 6…14 words, seeded PRNG (mulberry32)",
      },
      examples: [
        {
          title: "Three paragraphs",
          steps: ["Set paragraphs to 3 and sentences to 4.", "Generate."],
          result: "Three paragraphs of four sentences, roughly 35–50 words each.",
        },
        {
          title: "A single line",
          steps: ["Set paragraphs to 1 and sentences to 1.", "Generate."],
          result: "One sentence of 6–14 words.",
        },
      ],
      limitations: [
        "The output is not meaningful English — it is filler, and must never ship as real content.",
        "The word bank is small, so long documents repeat words; that is fine for layout testing and wrong for prose.",
      ],
      faqs: [
        {
          q: "Is this better than lorem ipsum?",
          a: "For stakeholder reviews, usually yes: readers stop trying to translate Latin and judge spacing and hierarchy instead.",
        },
        {
          q: "Can I get the same text twice?",
          a: "Yes — regeneration is seeded, so repeating the same settings reproduces the same output within a session.",
        },
        {
          q: "Can I use it in a published template?",
          a: "No. Replace every placeholder before publishing; leftover filler is one of the most common and most embarrassing site defects.",
        },
      ],
    },
  },
  {
    slug: "markdown-previewer",
    name: "Markdown Previewer",
    category: "text",
    tagline: "Write Markdown and see it rendered as you type.",
    intent: "preview markdown live",
    keywords: ["markdown previewer", "markdown editor", "live markdown", "markdown viewer"],
    status: "live",
    actions: ["copy"],
    effort: "instant",
    popularity: 82,
    addedAt: "2025-11-02",
    seoTitle: "Markdown Previewer — Live Editor With Instant Rendering",
    seoDescription:
      "Write or paste Markdown and see the rendered result side by side: headings, lists, code, links, quotes and tables. Runs offline in your browser.",
    content: {
      intro: [
        "Markdown is easy to write and easy to break: one missing blank line turns a list into a wall of text. A live preview makes the difference visible before you paste into a README, a CMS or a documentation tool.",
        "This previewer parses your Markdown with its own small engine and renders it as HTML elements — no external library, no upload, no network request.",
      ],
      howTo: [
        "Type or paste Markdown in the left pane.",
        "Read the rendered output on the right; it updates on every keystroke.",
        "Check headings, lists, code blocks and links before publishing.",
        "Copy the rendered text or switch to the HTML converter when you need markup.",
      ],
      method: {
        title: "What is supported",
        paragraphs: [
          "Supported block types: ATX headings (# to ######), paragraphs, ordered and unordered lists, fenced code blocks, blockquotes and horizontal rules.",
          "Supported inline markup: **bold**, *italic*, `code` and [links](https://example.com). Raw HTML is escaped, never executed, so pasted script tags render as text.",
        ],
        formula: "# heading  ·  **bold**  ·  *italic*  ·  `code`  ·  [text](url)  ·  - list  ·  > quote",
      },
      examples: [
        {
          title: "A README opening",
          steps: ["Paste \"# Project\\n\\nA one-line description.\\n\\n- install\\n- run\".", "Read the preview."],
          result: "An H1, a paragraph and a two-item bullet list.",
        },
        {
          title: "Inline formatting",
          steps: ["Paste \"Use **bold** for emphasis and `code` for values.\".", "Read the preview."],
          result: "Use bold for emphasis and code for values, each styled accordingly.",
        },
      ],
      limitations: [
        "This is a documented subset, not full CommonMark: tables, footnotes, reference links and nested lists are not rendered as such.",
        "Raw HTML is escaped for safety, so HTML pasted inside Markdown appears as text rather than being rendered.",
      ],
      faqs: [
        {
          q: "Is my Markdown uploaded anywhere?",
          a: "No. Parsing and rendering happen in this page's JavaScript. There is no server component to receive the text.",
        },
        {
          q: "Why does my table show as text?",
          a: "Table syntax is outside the supported subset. Use the HTML converter output, or keep tables in the destination's own editor.",
        },
        {
          q: "Can I get the HTML instead of a preview?",
          a: "Yes — the Markdown to HTML converter uses the same engine and gives you escaped, copyable markup.",
        },
      ],
    },
  },
  {
    slug: "markdown-to-html-converter",
    name: "Markdown to HTML Converter",
    category: "text",
    tagline: "Convert Markdown into clean, escaped HTML you can paste anywhere.",
    intent: "convert markdown to html",
    keywords: ["markdown to html", "convert markdown", "md to html", "markdown converter"],
    status: "live",
    actions: ["copy", "download"],
    effort: "instant",
    popularity: 76,
    addedAt: "2025-11-02",
    seoTitle: "Markdown to HTML Converter — Clean, Escaped Output",
    seoDescription:
      "Convert Markdown to HTML in your browser: headings, lists, emphasis, code, quotes and links. Output is escaped, so pasted markup cannot inject scripts.",
    content: {
      intro: [
        "Converting Markdown to HTML sounds trivial until someone pastes a script tag into a comment field. This converter escapes all text content and links, so the output is safe to insert into a page that trusts your CMS.",
        "The conversion runs on the same parser as the previewer, which means what you see is exactly what gets generated.",
      ],
      howTo: [
        "Paste your Markdown into the input box.",
        "Choose whether the output should be on one line or indented across lines.",
        "Copy the HTML, or download it as a file.",
        "Paste it into your CMS or template and check the result in a browser.",
      ],
      method: {
        title: "Conversion rules",
        paragraphs: [
          "Block elements are parsed first (headings, lists, code, quotes, paragraphs), then inline markup inside each block.",
          "Every text node and attribute value is HTML-escaped, and links receive rel=\"noopener noreferrer nofollow\" by default.",
        ],
        formula: "<p>**bold**</p>  →  <p><strong>bold</strong></p>",
      },
      examples: [
        {
          title: "Headings and emphasis",
          steps: ["Paste \"## Usage\\n\\nRun **npm test** first.\".", "Copy the output."],
          result: "<h2>Usage</h2> <p>Run <strong>npm test</strong> first.</p>",
        },
        {
          title: "A code block",
          steps: ["Paste a fenced block tagged js.", "Copy the output."],
          result: "<pre><code class=\"language-js\">…</code></pre>",
        },
      ],
      limitations: [
        "The output is a fragment, not a full HTML document — it has no <head>, doctype or styles.",
        "Unsupported Markdown syntax (tables, footnotes) passes through as plain text rather than being guessed.",
      ],
      faqs: [
        {
          q: "Is the output safe to insert into my site?",
          a: "Text and attributes are escaped, and links are marked nofollow, so pasted Markdown cannot inject a script. Always review generated markup before publishing.",
        },
        {
          q: "Does it support tables and footnotes?",
          a: "Not yet. Table and footnote syntax is left as text. Use the HTML editor for those constructs.",
        },
        {
          q: "Can I convert HTML back to Markdown?",
          a: "Yes — the HTML to Markdown converter handles headings, paragraphs, emphasis, links, lists, code and blockquotes.",
        },
      ],
    },
  },
  {
    slug: "html-to-markdown-converter",
    name: "HTML to Markdown Converter",
    category: "text",
    tagline: "Turn pasted HTML into tidy Markdown for docs and READMEs.",
    intent: "convert html to markdown",
    keywords: ["html to markdown", "convert html", "html to md", "markdown conversion"],
    status: "live",
    actions: ["copy", "download"],
    effort: "instant",
    popularity: 79,
    addedAt: "2025-11-02",
    seoTitle: "HTML to Markdown Converter — Docs, READMEs and Wikis",
    seoDescription:
      "Convert HTML into Markdown: headings, paragraphs, links, images, lists, code blocks, quotes and tables. Scripts and styles are stripped. No uploads.",
    content: {
      intro: [
        "Moving documentation into a Git repository usually means converting rendered HTML into Markdown. Doing it by hand is slow and error-prone; doing it with a naive regex leaves stray tags in the output.",
        "This converter walks the common block elements, strips script and style content entirely, and emits Markdown that renders correctly on GitHub, GitLab and most wikis.",
      ],
      howTo: [
        "Paste the HTML source into the input box.",
        "Read the Markdown output on the right.",
        "Copy it, or download it as a .md file.",
        "Check lists and code blocks in your target renderer before committing.",
      ],
      method: {
        title: "What is converted",
        paragraphs: [
          "Headings become # markers, paragraphs are separated by blank lines, strong and em map to ** and *, anchors to [text](url), images to ![alt](src), and ul/ol to bullet or numbered lists.",
          "Code blocks are extracted before any other processing so their indentation and angle brackets survive intact.",
        ],
        formula: "<h2>Title</h2>  →  ## Title\n<a href=\"…\">text</a>  →  [text](…)\n<strong>x</strong>  →  **x**",
      },
      examples: [
        {
          title: "A documentation snippet",
          steps: ["Paste <h2>Install</h2><p>Run <code>npm i</code>.</p>", "Copy the output."],
          result: "## Install\n\nRun `npm i`.",
        },
        {
          title: "A link and an image",
          steps: ["Paste an anchor and an img tag.", "Copy the output."],
          result: "[Docs](https://example.com/docs) and ![Screenshot](/img/shot.png)",
        },
      ],
      limitations: [
        "Nested lists are flattened to a single level; deep structures need manual indentation.",
        "Inline CSS, classes and data attributes are discarded — Markdown has no equivalent.",
      ],
      faqs: [
        {
          q: "Are scripts removed?",
          a: "Yes. <script> and <style> elements are deleted before conversion, so their contents never appear in the output.",
        },
        {
          q: "Will tables convert?",
          a: "Tables become pipe-separated rows, which pipe-table renderers may accept. Check the result in your target renderer.",
        },
        {
          q: "Can it handle a full page's HTML?",
          a: "Paste the body markup rather than the whole document. Head, meta and script content is stripped, so the output would only contain the readable content anyway.",
        },
      ],
    },
  },
  {
    slug: "text-frequency-analyzer",
    name: "Text Frequency Analyzer",
    category: "text",
    tagline: "See which words and phrases a text repeats, with counts and density.",
    intent: "find word frequency in text",
    keywords: ["word frequency", "text frequency analyzer", "repeated words", "word count list"],
    status: "live",
    actions: ["copy"],
    effort: "instant",
    popularity: 66,
    addedAt: "2025-11-02",
    seoTitle: "Text Frequency Analyzer — Word and Phrase Counts",
    seoDescription:
      "List the most frequent words and phrases in any text with counts and density, ignoring common stop words. Spot repetition and over-used phrases instantly.",
    content: {
      intro: [
        "Repetition is invisible while writing and obvious in a frequency table. This analyser lists the most common words and two-word phrases in a text, with counts and the share of the total they represent.",
        "Stop words such as \"the\" and \"and\" are excluded by default so the list surfaces the words that carry meaning.",
      ],
      howTo: [
        "Paste the text into the box.",
        "Read the ranked list of words with counts and density.",
        "Toggle two-word phrases to find repeated pairs such as \"very important\".",
        "Copy the table into your editing notes.",
      ],
      method: {
        title: "How frequency and density are calculated",
        paragraphs: [
          "Text is lowercased and split into word tokens, keeping letters, digits, apostrophes and internal hyphens. Density is the token's count divided by the total number of tokens in the whole text — not just the filtered list — so percentages always add up to a meaningful share.",
          "Phrase mode counts adjacent two-word pairs after stop-word removal, which is useful for spotting stock phrasing.",
        ],
        formula: "density = count ÷ totalTokens × 100",
      },
      examples: [
        {
          title: "A short paragraph",
          steps: ["Paste a 60-word paragraph.", "Read the top five words."],
          result: "The most repeated content word appears 4 times, 6.7% of all tokens.",
        },
        {
          title: "Phrase repetition",
          steps: ["Enable two-word phrases on a marketing draft.", "Sort by count."],
          result: "\"customer experience\" appears 6 times — a sign the phrasing needs variation.",
        },
      ],
      limitations: [
        "English stop words are filtered with a fixed list; other languages keep their function words in the results.",
        "No stemming is applied, so \"analyse\" and \"analysing\" count separately.",
      ],
      faqs: [
        {
          q: "How is this different from a word counter?",
          a: "A word counter gives totals. This tool ranks individual words and phrases by how often they occur, which is what you need to find repetition.",
        },
        {
          q: "Does density include stop words in the total?",
          a: "Yes. The denominator is every token in the text, so a word's share is honest even though stop words are hidden from the list.",
        },
        {
          q: "Can I analyse another language?",
          a: "Yes, but stop-word filtering is English-only, so common words in other languages will appear in the ranking.",
        },
      ],
    },
  },
  {
    slug: "unicode-character-inspector",
    name: "Unicode Character Inspector",
    category: "text",
    tagline: "Inspect any character's code point, UTF-8 bytes and category.",
    intent: "inspect unicode characters and code points",
    keywords: ["unicode inspector", "code point", "utf-8 bytes", "character inspector"],
    status: "live",
    actions: ["copy"],
    effort: "instant",
    popularity: 57,
    addedAt: "2025-11-02",
    seoTitle: "Unicode Character Inspector — Code Points and UTF-8 Bytes",
    seoDescription:
      "Inspect each character in a string: code point, decimal value, UTF-8 bytes, UTF-16 units and Unicode category. Debug encoding problems in the browser.",
    content: {
      intro: [
        "Encoding bugs usually look like a single wrong character: a mojibake sequence, a zero-width space, or an emoji that counts as two. Inspecting the actual code points is the fastest way to identify what is really in a string.",
        "Paste text and this inspector lists every character with its code point, decimal value, UTF-8 byte sequence and category.",
      ],
      howTo: [
        "Paste or type the text you want to inspect.",
        "Read the table: character, code point (U+XXXX), decimal value, UTF-8 bytes and category.",
        "Look for invisible characters such as U+00A0 (non-breaking space) or U+200B (zero-width space).",
        "Copy a row when you need to document the finding in a bug report.",
      ],
      method: {
        title: "What each column means",
        paragraphs: [
          "The code point is the Unicode number of the character. UTF-8 bytes show how it is stored in a file or an HTTP body; UTF-16 units show how JavaScript stores it in memory.",
          "The category comes from Unicode property escapes — letter, digit, punctuation, symbol, space, control, combining mark — which is enough to tell an invisible space from a stray letter.",
        ],
        formula: "\"é\" → U+00E9 · 233 · UTF-8 C3 A9 · UTF-16 00E9 · lowercase letter",
      },
      examples: [
        {
          title: "A non-breaking space",
          steps: ["Paste \"10 kg\" copied from a web page.", "Inspect the space."],
          result: "U+00A0 · 160 · UTF-8 C2 A0 · space",
        },
        {
          title: "An emoji",
          steps: ["Paste a single emoji.", "Read the row."],
          result: "U+1F600 · 128512 · UTF-8 F0 9F 98 80 · UTF-16 D83D DE00 · emoji",
        },
      ],
      limitations: [
        "The inspector shows the first 200 characters so the page stays responsive on huge inputs.",
        "Character names (\"LATIN SMALL LETTER E WITH ACUTE\") come from the Unicode database, which the browser does not expose; the category is shown instead.",
      ],
      faqs: [
        {
          q: "Why does an emoji show two UTF-16 units?",
          a: "JavaScript's strings are UTF-16. Characters above U+FFFF need a surrogate pair, which is why emoji length checks often report 2 for a single glyph.",
        },
        {
          q: "How do I find an invisible character?",
          a: "Paste the suspicious text and look for control, zero-width or non-breaking space entries in the category column.",
        },
        {
          q: "Is my text sent anywhere?",
          a: "No. Inspection happens in the page with TextEncoder, entirely offline.",
        },
      ],
    },
  },
];
