import type { ToolDefinition } from "../types";

/**
 * Section H additions. Everything here works on a source you paste — HTML,
 * robots.txt, sitemap XML or a keyword list — so no crawl and no API key is
 * involved. The broken-link checker, which genuinely needs a crawler, stays
 * marked as planned.
 */
export const seoMoreTools: ToolDefinition[] = [
  {
    slug: "meta-title-previewer",
    name: "Meta Title Previewer",
    category: "seo",
    tagline: "See your title in a Google result and measure its pixel width.",
    intent: "preview meta title",
    keywords: ["meta title preview", "title tag preview", "serp title checker", "title length checker", "seo title tester", "pixel width title"],
    status: "live",
    actions: ["copy"],
    effort: "instant",
    popularity: 78,
    addedAt: "2025-02-26",
    seoTitle: "Meta Title Preview — Check Truncation Before Publishing",
    seoDescription:
      "Preview a page title in a desktop and mobile Google result, with a pixel-width estimate and checks for length, clarity and missing keywords.",
    content: {
      intro: [
        "Google truncates titles by pixel width, not character count, so a 62-character title of narrow letters can fit while a 55-character title of capitals gets cut. This preview shows the result card and an estimate of the rendered width.",
        "Draft the title here before it goes into the CMS, and see immediately where the ellipsis would fall.",
      ],
      howTo: [
        "Type the title.",
        "Watch the character and pixel counters — stay under roughly 580px.",
        "Check the desktop and mobile previews for truncation.",
        "Copy the final title into your page template.",
      ],
      method: {
        title: "Why pixels beat characters",
        paragraphs: [
          "The estimate sums a width per character class: narrow glyphs such as i and l at about 4px, wide ones such as m at 13px, capitals and digits at 9px, spaces at 4.5px and everything else at 7.5px.",
          "That is an approximation of a 20px Arial line, which is close to what Google renders. It is accurate enough to catch a title that is obviously too long, and honest about being an estimate rather than a measurement.",
        ],
      },
      examples: [
        {
          title: "A title that gets cut",
          steps: ["Paste a 78-character title.", "Read the warning at over 600px.", "Shorten it until the preview shows no ellipsis."],
          result: "Truncation removed at roughly 58 characters",
        },
        {
          title: "Checking a brand suffix",
          steps: ["Type the page title.", "Add “ — Your Site”.", "See how much of the descriptive part survives."],
          result: "Brand suffix kept, descriptive words trimmed instead",
        },
      ],
      limitations: [
        "Widths are estimates from an average glyph model, not a real font measurement.",
        "Google sometimes rewrites titles it considers unhelpful, regardless of length.",
        "The mobile preview is narrower; a title that fits on desktop can still be cut there.",
      ],
      faqs: [
        {
          q: "How many characters should a title be?",
          a: "Around 50–60, but check the pixel estimate: capitals and wide letters take more room than the count suggests.",
        },
        {
          q: "Does the title have to contain the keyword?",
          a: "It should read naturally and describe the page. Exact-match keyword stuffing produces worse titles and no ranking benefit.",
        },
        {
          q: "Why does Google show a different title?",
          a: "Google rewrites titles it judges to be vague or keyword-stuffed, usually pulling from the H1 or link text.",
        },
      ],
    },
  },
  {
    slug: "meta-description-previewer",
    name: "Meta Description Previewer",
    category: "seo",
    tagline: "Preview a meta description in a search result and check its length.",
    intent: "preview meta description",
    keywords: ["meta description preview", "description length checker", "serp description", "meta description tester", "snippet preview", "description truncation"],
    status: "live",
    actions: ["copy"],
    effort: "instant",
    popularity: 76,
    addedAt: "2025-02-26",
    seoTitle: "Meta Description Preview — Length and Truncation Check",
    seoDescription:
      "Preview a meta description as it appears in Google results on desktop and mobile. See the character count, truncation point and practical writing checks.",
    content: {
      intro: [
        "A description is not a ranking factor, but it is the advert: two pages ranking equally get clicked according to the snippet. Descriptions that are too short get expanded with page text; ones that are too long get truncated mid-sentence.",
        "This preview shows where the cut would happen on desktop and mobile, so you can write to the limit deliberately.",
      ],
      howTo: [
        "Write the description.",
        "Watch the character count — aim for 120–155.",
        "Compare the desktop and mobile previews.",
        "Copy the description into the page's meta tag.",
      ],
      method: {
        title: "How the preview is built",
        paragraphs: [
          "The desktop snippet shows roughly two lines of text and the mobile preview about three, both clipped with CSS line clamps so the cut is realistic rather than computed from an approximate character budget.",
          "The character count is exact. Google's own truncation is pixel-based and varies, so treat 155–160 as the practical ceiling rather than a hard limit.",
        ],
      },
      examples: [
        {
          title: "Trimming a 210-character description",
          steps: ["Paste the long description.", "Read the truncation warning.", "Cut it to the first clear sentence and a benefit."],
          result: "Description ends without an ellipsis at 148 characters",
        },
        {
          title: "Writing to a query",
          steps: ["Start with the search intent in plain words.", "Add what makes the page different.", "Confirm both previews show the sentence intact."],
          result: "Complete sentence visible on desktop and mobile",
        },
      ],
      limitations: [
        "Google often generates its own snippet from page text regardless of your description.",
        "Truncation depends on the rendered font and viewport width.",
        "Descriptions do not affect ranking directly — they affect click-through.",
      ],
      faqs: [
        {
          q: "Does the meta description help rankings?",
          a: "Not directly. It influences clicks, and click behaviour is a signal in aggregate, so write it for people.",
        },
        {
          q: "What if I leave it empty?",
          a: "Google will pull a snippet from the page, often the first paragraph containing the query. That is usually worse than a written description.",
        },
        {
          q: "Should every page have a unique description?",
          a: "Yes. Duplicate descriptions across pages look careless and give Google no reason to prefer your snippet.",
        },
      ],
    },
  },
  {
    slug: "seo-text-analyzer",
    name: "SEO Text Analyzer",
    category: "seo",
    tagline: "Audit a page's title, headings, text, links and images in one pass.",
    intent: "analyze page seo",
    keywords: ["seo analyzer", "on page seo checker", "seo text analysis", "page seo audit", "content seo checker", "seo score tool"],
    status: "live",
    actions: ["copy"],
    effort: "quick",
    popularity: 85,
    addedAt: "2025-02-27",
    seoTitle: "SEO Text Analyzer — On-Page Checks From Pasted HTML",
    seoDescription:
      "Paste a page's HTML to check titles, descriptions, headings, word count, keyword density, images and links. Findings are explained, not scored out of 100.",
    content: {
      intro: [
        "A “SEO score” out of 100 hides the only question that matters: what is actually wrong with this page? This analyzer lists concrete findings — a missing description, two H1s, images without alt text, no internal links — and leaves the judgement to you.",
        "It works on pasted HTML, so you can audit a page you have not published yet, or one behind a login.",
      ],
      howTo: [
        "Paste the page source.",
        "Optionally add a target keyword for density and title checks.",
        "Read the findings list, starting with the errors.",
        "Fix the page and paste it again to confirm.",
      ],
      method: {
        title: "What is measured",
        paragraphs: [
          "The text is extracted by stripping script, style and tags, then the tool counts words, computes keyword density and runs a Flesch reading-ease pass. Headings, images and links are read from the markup itself, so the counts match what a crawler would parse.",
          "Checks are rule-based and deliberately conservative: title over 60 characters, description outside 70–160, fewer than 300 words, keyword absent from the title, more than 4% density, missing alt attributes, no internal links. Each finding names the fix rather than assigning a number.",
        ],
      },
      examples: [
        {
          title: "Auditing a tool page",
          steps: ["Paste the page HTML.", "Enter the primary keyword.", "Read that the description is missing and two images lack alt text."],
          result: "Actionable list instead of an opaque score",
        },
        {
          title: "Checking keyword stuffing",
          steps: ["Paste a page that repeats a phrase heavily.", "Enter the phrase.", "See the density warning above 4%."],
          result: "Density 7.2% — rewrite rather than repeat",
        },
      ],
      limitations: [
        "Keyword density is a rough ratio, not a ranking factor — treat the warning as a smell test.",
        "The analyzer cannot see rendered content injected by JavaScript.",
        "Readability formulas measure sentence shape, not clarity of thought.",
      ],
      faqs: [
        {
          q: "Is 300 words a minimum for ranking?",
          a: "No. Length is a proxy for completeness, not a requirement. A 200-word answer that fully resolves the query beats 2,000 words of padding.",
        },
        {
          q: "Why no overall score?",
          a: "Because scores encourage gaming the checklist. A list of specific, fixable findings is more useful and more honest.",
        },
        {
          q: "Does it fetch the page for me?",
          a: "No. Paste the source with View Source; fetching would need a server and would break for pages behind authentication.",
        },
      ],
    },
  },
  {
    slug: "heading-structure-checker",
    name: "Heading Structure Checker",
    category: "seo",
    tagline: "Outline every H1–H6 and catch skipped levels or duplicate H1s.",
    intent: "check heading structure",
    keywords: ["heading structure checker", "h1 h2 checker", "heading outline", "heading hierarchy seo", "h1 tag checker", "heading order"],
    status: "live",
    actions: ["copy"],
    effort: "instant",
    popularity: 74,
    addedAt: "2025-02-27",
    seoTitle: "Heading Structure Checker — H1 to H6 Outline",
    seoDescription:
      "Paste page HTML to see the heading outline, count each level, and catch missing or duplicate H1s, skipped levels and empty headings.",
    content: {
      intro: [
        "Headings are the outline of a page: they tell a reader what the sections are and tell a crawler what the page is about. A page with three H1s, or one that jumps from H2 to H4, reads as if it were assembled rather than written.",
        "This checker builds the outline from the markup, flags the structural problems and exports it as Markdown so you can plan the revision.",
      ],
      howTo: [
        "Paste the page HTML.",
        "Read the outline, indented by heading level.",
        "Check the findings for missing or duplicate H1s and skipped levels.",
        "Copy the Markdown outline into your brief.",
      ],
      method: {
        title: "What counts as a problem",
        paragraphs: [
          "Exactly one H1 is expected, and it should match the page's purpose. More than one splits the page's subject; none leaves the outline without a root.",
          "A jump of more than one level — H2 straight to H4 — is flagged because it usually means a section was deleted or a heading was styled rather than structured. Empty headings are reported too, since they appear in the outline but say nothing.",
        ],
      },
      examples: [
        {
          title: "Catching two H1s",
          steps: ["Paste a page with a logo H1 and a content H1.", "Read the duplicate warning.", "Change the logo to a div or span."],
          result: "One H1 for the page subject",
        },
        {
          title: "Fixing a skipped level",
          steps: ["Paste markup that goes H2 → H4.", "See the jump reported with the heading text.", "Re-level the headings or add the missing section."],
          result: "Continuous outline from H1 to H3",
        },
      ],
      limitations: [
        "Headings injected by JavaScript are not visible in pasted source.",
        "Visual size does not matter here — only the tag.",
        "The checker describes structure, not whether the headings are well written.",
      ],
      faqs: [
        {
          q: "Do multiple H1s hurt SEO?",
          a: "HTML5 allows several, but one clear H1 is easier to scan and avoids ambiguity about the page's subject.",
        },
        {
          q: "Should headings contain keywords?",
          a: "They should describe the section honestly. If the keyword is the honest description, include it; do not force it into every heading.",
        },
        {
          q: "Is a skipped level an accessibility failure?",
          a: "Not automatically, but it breaks the document outline that screen-reader users navigate by, so it is worth fixing.",
        },
      ],
    },
  },
  {
    slug: "image-alt-text-checker",
    name: "Image Alt Text Checker",
    category: "seo",
    tagline: "Find images with missing, empty or overlong alt attributes.",
    intent: "check image alt text",
    keywords: ["alt text checker", "image alt seo", "missing alt attributes", "alt tag checker", "accessibility image alt", "image seo audit"],
    status: "live",
    actions: ["copy"],
    effort: "instant",
    popularity: 73,
    addedAt: "2025-02-28",
    seoTitle: "Image Alt Text Checker — Missing and Overlong Alt Attributes",
    seoDescription:
      "Paste HTML to list every image, which ones lack alt text, which are correctly marked decorative, and which descriptions are too long to be useful.",
    content: {
      intro: [
        "Alt text is an accessibility requirement first and an SEO nicety second. Missing alt means a screen reader may announce a file name; an empty alt is the correct way to say “this image is decorative”; a 300-word alt is neither.",
        "This checker separates those three cases so you can fix the ones that matter without touching the ones that are already right.",
      ],
      howTo: [
        "Paste the markup containing images.",
        "Read the counts: total, missing, decorative and overlong.",
        "Fix the missing attributes with descriptions of purpose.",
        "Leave decorative images as alt=\"\".",
      ],
      method: {
        title: "Three states, three verdicts",
        paragraphs: [
          "No alt attribute at all is a problem: assistive technology falls back to the file name. An empty alt is deliberate and correct for decorative images, so it is counted but not flagged.",
          "Descriptions longer than about 125 characters are flagged as overlong — they usually describe every pixel instead of the image's purpose, and screen-reader users hear them in full.",
        ],
      },
      examples: [
        {
          title: "Auditing a blog post",
          steps: ["Paste the article HTML.", "Read that two of five images lack alt text.", "Write short purpose-based descriptions for both."],
          result: "2 missing attributes identified, 3 already fine",
        },
        {
          title: "Confirming decorative icons",
          steps: ["Paste the markup with inline icons.", "See them counted as decorative.", "Leave them unchanged."],
          result: "Empty alt values accepted, not flagged",
        },
      ],
      limitations: [
        "The checker cannot judge whether the description is accurate.",
        "Background images set in CSS are not visible in the HTML.",
        "Images in dynamically rendered components will not appear in pasted source.",
      ],
      faqs: [
        {
          q: "Should alt text contain keywords?",
          a: "Only if it describes the image. Keyword-stuffed alt text is a spam signal and does not help anyone using a screen reader.",
        },
        {
          q: "How long should alt text be?",
          a: "A concise phrase — usually under 125 characters. If the image needs more, a caption in the page body is the better place.",
        },
        {
          q: "Is empty alt bad for SEO?",
          a: "No. It is correct for decorative images; otherwise it tells assistive technology to skip them.",
        },
      ],
    },
  },
  {
    slug: "internal-link-checker",
    name: "Internal Link Checker",
    category: "seo",
    tagline: "Count internal and external links and spot repeated hrefs.",
    intent: "check internal links",
    keywords: ["internal link checker", "internal linking seo", "count links on page", "link audit", "anchor text checker", "nofollow checker"],
    status: "live",
    actions: ["copy"],
    effort: "instant",
    popularity: 71,
    addedAt: "2025-02-28",
    seoTitle: "Internal Link Checker — Counts, Anchor Text and Duplicates",
    seoDescription:
      "Paste a page's HTML to count internal and external links, see nofollow usage, repeated hrefs and generic anchor text that wastes link equity.",
    content: {
      intro: [
        "Internal links are how both readers and crawlers discover the rest of a site. A page with none is a dead end; a page with forty identical links to the same URL dilutes the signal and looks automated.",
        "This checker reads the anchors you paste and reports the balance: how many go inward, how many outward, and which ones repeat.",
      ],
      howTo: [
        "Paste the page HTML and set your hostname.",
        "Read the internal and external counts.",
        "Check the repeated-href table for accidental duplication.",
        "Replace generic anchor text such as “click here” with a description.",
      ],
      method: {
        title: "How a link is classified",
        paragraphs: [
          "Relative links, and absolute links whose host matches the hostname you entered, count as internal. Absolute links to other hosts count as external. Fragments, mailto and tel links are counted separately because they do not lead to another page.",
          "Repeated hrefs are grouped, ignoring pure fragments, since a back-to-top anchor appearing ten times is normal navigation rather than a duplication problem.",
        ],
      },
      examples: [
        {
          title: "A page with no internal links",
          steps: ["Paste the markup.", "Read zero internal links.", "Add links to the parent and two related pages."],
          result: "Dead end removed",
        },
        {
          title: "Finding repeated links",
          steps: ["Paste a page that links the same tool in every paragraph.", "Read the duplicate table.", "Keep the first mention and remove the rest."],
          result: "Six links to /pricing reduced to one",
        },
      ],
      limitations: [
        "Pasted source only — a crawler would be needed to check whether targets still return 200.",
        "JavaScript-injected links are invisible here.",
        "Link equity flow is not modelled; this is a structural count.",
      ],
      faqs: [
        {
          q: "How many internal links should a page have?",
          a: "There is no quota. Link where a reader would genuinely want more detail, and avoid repeating the same destination.",
        },
        {
          q: "Do nofollow links pass authority?",
          a: "Internal nofollow is mostly pointless — you control the target. Reserve nofollow for untrusted external links.",
        },
        {
          q: "Can this find broken links?",
          a: "No. Checking whether a target responds needs a crawler, so the broken-link checker on this site is marked as planned rather than faked.",
        },
      ],
    },
  },
  {
    slug: "page-size-analyzer",
    name: "Page Size Analyzer",
    category: "seo",
    tagline: "Measure an HTML document's weight and count the requests it implies.",
    intent: "analyze page size",
    keywords: ["page size analyzer", "html size checker", "page weight seo", "how big is my html", "page source size", "html bytes"],
    status: "live",
    actions: ["copy"],
    effort: "instant",
    popularity: 69,
    addedAt: "2025-03-01",
    seoTitle: "Page Size Analyzer — Measure HTML Weight and Requests",
    seoDescription:
      "Paste page source to measure its byte size, count inline and external scripts, stylesheets and images, and see a compressed transfer estimate.",
    content: {
      intro: [
        "Page weight is mostly assets, but the HTML is where the request count is decided: ten script tags mean ten round trips before the page can settle. This analyzer measures the document you paste and counts what it will trigger.",
        "It is honest about scope: it cannot weigh images or fonts it never sees, only the markup and the requests that markup implies.",
      ],
      howTo: [
        "Paste the page source.",
        "Read the byte size and the compressed estimate.",
        "Check the script and stylesheet counts — each is a request.",
        "Look at the largest inline block if the document itself is heavy.",
      ],
      method: {
        title: "What the numbers mean",
        paragraphs: [
          "The document size is measured in UTF-8 bytes, which is what the server transfers before compression. Gzip or Brotli typically brings HTML down to a third or a quarter of that.",
          "External scripts and stylesheets are counted separately from inline blocks, because the external ones add round trips while the inline ones add bytes to this document — both matter, for different reasons.",
        ],
      },
      examples: [
        {
          title: "A bloated template",
          steps: ["Paste a 180 KB page source.", "See nine external scripts.", "Defer or remove the ones the page does not use."],
          result: "Request count reduced before looking at images",
        },
        {
          title: "Checking a CSS-in-HTML build",
          steps: ["Paste the source.", "Read the largest inline style block.", "Compare it with the external stylesheet count."],
          result: "Duplicate CSS identified",
        },
      ],
      limitations: [
        "Assets such as images, fonts and third-party scripts are not fetched or measured.",
        "The compression estimate is a rough ratio, not a real gzip measurement.",
        "Render-blocking behaviour is not analysed — only presence and size.",
      ],
      faqs: [
        {
          q: "What is a good HTML page size?",
          a: "Under about 30 KB of markup for a content page. Beyond 100 KB, most of it is usually inline JSON or duplicated CSS.",
        },
        {
          q: "Does this measure my whole page?",
          a: "No — it measures the markup. Use Lighthouse for the full transfer including assets.",
        },
        {
          q: "Why does compressed size matter more?",
          a: "Because compressed bytes are what cross the network. HTML compresses extremely well, so a 90 KB document may ship as 25 KB.",
        },
      ],
    },
  },
  {
    slug: "readability-checker",
    name: "Readability Checker",
    category: "seo",
    tagline: "Score text with Flesch, Flesch–Kincaid, Fog, SMOG and ARI.",
    intent: "check readability",
    keywords: ["readability checker", "flesch reading ease", "readability score", "gunning fog", "text readability", "smog index"],
    status: "live",
    actions: ["copy"],
    effort: "instant",
    popularity: 77,
    addedAt: "2025-03-01",
    seoTitle: "Readability Checker — Flesch, Fog, SMOG and ARI Scores",
    seoDescription:
      "Paste text to get five readability scores with a plain-English verdict. See the words per sentence and syllables per word behind each number.",
    content: {
      intro: [
        "Readability formulas are not style guides, but they catch a real problem: sentences that are too long and words that are too dense for the audience. This checker computes five of the standard scores from the same two measurements.",
        "Because it shows the underlying ratios, you can see why a score is low — usually sentence length — instead of guessing.",
      ],
      howTo: [
        "Paste the text you want to score.",
        "Read the Flesch Reading Ease score and the verdict beside it.",
        "Compare the other formulas; disagreement usually means unusual word length.",
        "Cut long sentences first — that moves every score at once.",
      ],
      method: {
        title: "How the scores are calculated",
        paragraphs: [
          "Flesch Reading Ease is 206.835 − 1.015 × words-per-sentence − 84.6 × syllables-per-word, giving 0 (hardest) to 100 (easiest). Flesch–Kincaid converts the same inputs into a US grade level, and Gunning Fog adds a penalty for words of three syllables or more.",
          "SMOG uses polysyllable density over sentence count, and ARI uses letters rather than syllables. All five are rough instruments: they assume words are known if they are short, which is false for jargon and true for “television”.",
        ],
        formula: "Flesch = 206.835 − 1.015 × (words ÷ sentences) − 84.6 × (syllables ÷ words)",
      },
      examples: [
        {
          title: "Scoring a help article",
          steps: ["Paste the article.", "Read a Flesch score of 62 — plain English.", "Check that no sentence exceeds 25 words."],
          result: "Grade 8–9 reading level, appropriate for a general audience",
        },
        {
          title: "Diagnosing a dense paragraph",
          steps: ["Paste a legal-style paragraph.", "See a score of 24.", "Note 41 words per sentence and split them."],
          result: "Score rises above 50 after splitting sentences",
        },
      ],
      limitations: [
        "Syllable counting is heuristic and can misjudge abbreviations, numbers and hyphenated words.",
        "Technical terms are penalised even when the audience knows them well.",
        "None of these formulas understand meaning, structure or clarity.",
      ],
      faqs: [
        {
          q: "What is a good readability score?",
          a: "For a general web audience, 60–70 on Flesch Reading Ease. Technical documentation aimed at specialists can sit lower legitimately.",
        },
        {
          q: "Does readability affect rankings?",
          a: "No direct effect, but readable pages keep visitors longer and earn links, which do matter.",
        },
        {
          q: "Why do the five formulas disagree?",
          a: "They weight different things — syllables, letters, polysyllables. Large disagreements usually point to long words rather than long sentences.",
        },
      ],
    },
  },
  {
    slug: "website-content-outline-generator",
    name: "Website Content Outline Generator",
    category: "seo",
    tagline: "Turn a page's headings into a Markdown outline in one click.",
    intent: "generate content outline",
    keywords: ["content outline generator", "heading outline", "page outline tool", "content structure", "outline from html", "markdown outline"],
    status: "live",
    actions: ["copy", "download"],
    effort: "instant",
    popularity: 67,
    addedAt: "2025-03-02",
    seoTitle: "Content Outline Generator — Markdown From Page Headings",
    seoDescription:
      "Paste page HTML to generate a Markdown outline from its H1–H6 headings, ready for a content brief, an editorial review or a restructure.",
    content: {
      intro: [
        "Auditing an existing page starts with its outline: what does it promise in the H1, and what do the sections actually cover? This tool extracts the headings and formats them as Markdown, indented by level.",
        "It is the fastest way to compare a page's intended structure with what it delivers — and to hand a brief to a writer without them reading the whole article.",
      ],
      howTo: [
        "Paste the page HTML.",
        "Read the Markdown outline.",
        "Check that each section earns its place.",
        "Copy or download the outline for your brief.",
      ],
      method: {
        title: "What it extracts",
        paragraphs: [
          "Every h1–h6 element is matched with its inner text, tags inside headings are stripped, and the result is written with hashes matching the level and indentation matching the nesting.",
          "Structural problems — duplicate H1s, skipped levels, empty headings — are reported in the note below the output, so the outline doubles as a diagnosis.",
        ],
      },
      examples: [
        {
          title: "Briefing a rewrite",
          steps: ["Paste the existing page.", "Copy the outline into the brief.", "Annotate each heading with “keep, merge or cut”."],
          result: "Markdown outline with every section listed",
        },
        {
          title: "Comparing two versions",
          steps: ["Generate the outline for the old page.", "Do the same for the new draft.", "Diff the two outlines in any editor."],
          result: "Restructure visible at a glance",
        },
      ],
      limitations: [
        "Only headings present in the pasted markup are included.",
        "Body text, lists and images are ignored.",
        "Headings rendered by JavaScript will not appear in pasted source.",
      ],
      faqs: [
        {
          q: "Can it outline a page I have not published?",
          a: "Yes, paste any HTML — a draft, a static export or a component's rendered output.",
        },
        {
          q: "Does it write content for me?",
          a: "No. It extracts structure only; the writing is still yours.",
        },
        {
          q: "Why Markdown?",
          a: "Because it is readable in a plain text editor, diffs cleanly and pastes into most documentation tools.",
        },
      ],
    },
  },
  {
    slug: "json-ld-validator",
    name: "JSON-LD Validator",
    category: "seo",
    tagline: "Check structured data syntax, context and type-specific properties.",
    intent: "validate json-ld",
    keywords: ["json-ld validator", "structured data validator", "schema validator", "validate json-ld", "rich results checker", "schema markup checker"],
    status: "live",
    actions: ["copy"],
    effort: "instant",
    popularity: 79,
    addedAt: "2025-03-02",
    seoTitle: "JSON-LD Validator — Check Schema Markup Structure",
    seoDescription:
      "Paste JSON-LD or a script tag to check its syntax, @context and @type, plus type-specific expectations such as FAQ answers or article dates.",
    content: {
      intro: [
        "Structured data fails in two ways: invalid JSON, which is easy to see in a console, and valid JSON that describes the wrong thing — a FAQPage with no answers, an Article with no date. This validator catches both.",
        "It accepts a bare JSON-LD object or a full script tag, which saves a step when copying from a live page.",
      ],
      howTo: [
        "Paste the JSON-LD block, or the whole script tag.",
        "Read the detected types.",
        "Fix any errors, then check the warnings.",
        "Confirm in Google's Rich Results Test before shipping.",
      ],
      method: {
        title: "What is checked",
        paragraphs: [
          "The payload is parsed as JSON, then walked to collect every @type and to confirm that the top-level object declares an @context of schema.org. Type-specific expectations follow: FAQPage entries need acceptedAnswer, Article should carry datePublished.",
          "The validator deliberately does not claim eligibility. Search engines change rich-result requirements; the Rich Results Test is the only current source of truth.",
        ],
      },
      examples: [
        {
          title: "A missing @context",
          steps: ["Paste an object with @type but no @context.", "Read the error.", "Add \"@context\": \"https://schema.org\"."],
          result: "Markup now classifiable",
        },
        {
          title: "FAQ markup without answers",
          steps: ["Paste a FAQPage array of questions.", "Read that acceptedAnswer is missing.", "Add an answer object for each question."],
          result: "FAQPage eligible for review",
        },
      ],
      limitations: [
        "Not a substitute for the Rich Results Test or Schema Markup Validator.",
        "Unusual property names are not validated against the full schema.org vocabulary.",
        "It does not check that the markup matches visible page content.",
      ],
      faqs: [
        {
          q: "Where should JSON-LD go?",
          a: "In a script tag with type application/ld+json, usually in the head or at the end of the body.",
        },
        {
          q: "Can I have several JSON-LD blocks?",
          a: "Yes. Multiple blocks are allowed, and each may describe a different entity.",
        },
        {
          q: "Does structured data improve rankings?",
          a: "It does not raise rankings directly, but it can earn rich results that improve click-through and help engines understand the page.",
        },
      ],
    },
  },
  {
    slug: "sitemap-validator",
    name: "Sitemap Validator",
    category: "seo",
    tagline: "Check a sitemap's namespace, URLs, dates and priorities.",
    intent: "validate sitemap",
    keywords: ["sitemap validator", "validate sitemap xml", "sitemap checker", "xml sitemap test", "sitemap errors", "sitemap lastmod"],
    status: "live",
    actions: ["copy"],
    effort: "instant",
    popularity: 72,
    addedAt: "2025-03-03",
    seoTitle: "Sitemap Validator — Check XML Before Submitting",
    seoDescription:
      "Paste a sitemap.xml to check its namespace, absolute URLs, duplicates, lastmod formats and priority values, with every finding explained.",
    content: {
      intro: [
        "A sitemap that is subtly wrong is worse than none: search engines discard the whole file and you learn nothing from the silence. The usual culprits are a missing namespace, relative URLs or an invalid lastmod date.",
        "This validator reports each problem individually, so you can fix the template rather than guess.",
      ],
      howTo: [
        "Paste the contents of sitemap.xml.",
        "Read the error and warning counts.",
        "Fix errors first — they invalidate the file.",
        "Re-paste to confirm, then submit in Search Console.",
      ],
      method: {
        title: "Rules applied",
        paragraphs: [
          "The root must be urlset with the sitemaps.org 0.9 namespace, every loc must be absolute, and duplicates are flagged because they waste crawl budget. lastmod must be a W3C date and priority a decimal between 0 and 1.",
          "The 50,000-URL limit is enforced as an error: beyond that the protocol requires a sitemap index instead.",
        ],
      },
      examples: [
        {
          title: "A missing namespace",
          steps: ["Paste a sitemap built by hand.", "Read that the namespace is wrong.", "Add xmlns to the urlset element."],
          result: "Namespace error cleared",
        },
        {
          title: "Duplicate URLs",
          steps: ["Paste a sitemap with repeats.", "Read the duplicate warnings.", "De-duplicate at the source."],
          result: "Clean list, one entry per URL",
        },
      ],
      limitations: [
        "Checks structure only — it cannot confirm that any URL returns 200.",
        "Sitemap index files are reported as unrecognised rather than validated.",
        "Image, video and news extensions are not checked.",
      ],
      faqs: [
        {
          q: "Does every page need a sitemap entry?",
          a: "Only canonical, indexable pages. Including redirects and noindex pages undermines trust in the file.",
        },
        {
          q: "Is priority used by Google?",
          a: "No. It is part of the protocol but ignored by Google; lastmod is the field that matters.",
        },
        {
          q: "How large can a sitemap be?",
          a: "50,000 URLs and 50 MB uncompressed. Beyond that, split into multiple sitemaps and reference them from an index.",
        },
      ],
    },
  },
  {
    slug: "robots-txt-tester",
    name: "Robots.txt Tester",
    category: "seo",
    tagline: "Test whether a URL is allowed for a given crawler, rule by rule.",
    intent: "test robots txt",
    keywords: ["robots.txt tester", "robots txt checker", "test disallow rules", "robots.txt validator", "crawler access test", "robots wildcard"],
    status: "live",
    actions: ["copy"],
    effort: "instant",
    popularity: 75,
    addedAt: "2025-03-03",
    seoTitle: "Robots.txt Tester — Check Disallow and Allow Rules",
    seoDescription:
      "Paste robots.txt and a path to see whether a crawler is allowed, which rule matched, and whether the file itself has syntax problems.",
    content: {
      intro: [
        "robots.txt mistakes are expensive and invisible: one overly broad Disallow and a section disappears from search results for weeks. This tester applies the file's rules to a path and tells you exactly which directive decided the outcome.",
        "It also parses the whole file, so malformed lines and misplaced directives are reported rather than silently ignored.",
      ],
      howTo: [
        "Paste your robots.txt.",
        "Enter the path or URL you want to test.",
        "Set the crawler name — Googlebot, Bingbot or * for everyone else.",
        "Read the verdict and the matched rule, then adjust the file.",
      ],
      method: {
        title: "Longest match wins",
        paragraphs: [
          "For the matching group, every rule whose path pattern matches is considered. The longest pattern wins, and when an Allow and a Disallow are the same length, Allow wins. That is the behaviour Google documents, implemented here with * wildcards and $ end anchors.",
          "Groups are matched by user-agent name, falling back to the wildcard group. An empty Disallow means everything is allowed, which trips up people who expect the opposite.",
        ],
      },
      examples: [
        {
          title: "Blocking an admin area",
          steps: ["Paste Disallow: /admin/.", "Test /admin/dashboard.", "Read that it is blocked by that rule."],
          result: "Blocked — matched DISALLOW /admin/",
        },
        {
          title: "Allowing one public page",
          steps: ["Add Allow: /admin/public/ after the Disallow.", "Test /admin/public/help.", "See Allow win as the longer match."],
          result: "Allowed — matched ALLOW /admin/public/",
        },
      ],
      limitations: [
        "It tests a single path at a time.",
        "Crawlers other than Google may interpret edge cases differently.",
        "robots.txt is advisory: it does not enforce access and does not prevent indexing of linked URLs.",
      ],
      faqs: [
        {
          q: "Does Disallow remove a page from search?",
          a: "No — it stops crawling. A blocked URL can still be indexed if linked, which is why noindex is the right tool for removal.",
        },
        {
          q: "Do wildcards work?",
          a: "Google and Bing support * and $; older crawlers may ignore them.",
        },
        {
          q: "Where must the file live?",
          a: "At the site root on each host and protocol, so https://example.com/robots.txt.",
        },
      ],
    },
  },
  {
    slug: "schema-markup-generator",
    name: "Schema Markup Generator",
    category: "seo",
    tagline: "Build Article, Product, LocalBusiness or Organization JSON-LD.",
    intent: "generate schema markup",
    keywords: ["schema markup generator", "json-ld generator", "structured data generator", "schema.org generator", "article schema", "product schema"],
    status: "live",
    actions: ["copy", "download"],
    effort: "quick",
    popularity: 82,
    addedAt: "2025-03-04",
    seoTitle: "Schema Markup Generator — JSON-LD for Common Types",
    seoDescription:
      "Generate valid JSON-LD for articles, products, local businesses, organizations and websites. Required properties are checked as you type.",
    content: {
      intro: [
        "Structured data is only useful if it is accurate. This generator asks for the fields each type actually needs — an article's author and date, a product's price, a business's address — and writes the JSON-LD for you.",
        "It validates required properties as you type, so you cannot accidentally publish an Offer without a price.",
      ],
      howTo: [
        "Choose the schema type.",
        "Fill in the required fields: name, URL, and the type-specific ones.",
        "Check the validation panel.",
        "Copy the script tag into the page head.",
      ],
      method: {
        title: "What each type needs",
        paragraphs: [
          "Article expects headline, URL, author and datePublished. Product requires offers with a price and currency to be eligible for rich results. LocalBusiness needs a postal address and benefits from a telephone number. Organization and WebSite are simpler and describe the entity rather than the page.",
          "The output is a single script tag with application/ld+json and two-space indentation, which keeps it readable in a diff.",
        ],
      },
      examples: [
        {
          title: "Marking up a guide",
          steps: ["Choose Article.", "Fill in headline, URL, author and date.", "Copy the generated script."],
          result: "Article JSON-LD with author and datePublished",
        },
        {
          title: "A product page",
          steps: ["Choose Product.", "Set price and currency.", "Confirm the Offer object appears in the output."],
          result: "Product markup with an InStock Offer",
        },
      ],
      limitations: [
        "Generated markup does not guarantee rich results — eligibility rules change.",
        "Ratings, reviews and availability beyond InStock are not modelled.",
        "Only mark up content that is visible on the page.",
      ],
      faqs: [
        {
          q: "Where does JSON-LD go?",
          a: "In the head or at the end of the body, inside a script tag with type application/ld+json.",
        },
        {
          q: "Can I combine two types?",
          a: "Yes, with an @graph array, but keep it honest: every entity must exist on the page.",
        },
        {
          q: "Do I need markup on every page?",
          a: "Add it where a type genuinely applies. Empty or generic markup adds nothing and risks a manual action.",
        },
      ],
    },
  },
  {
    slug: "faq-schema-generator",
    name: "FAQ Schema Generator",
    category: "seo",
    tagline: "Turn question and answer pairs into FAQPage JSON-LD.",
    intent: "generate faq schema",
    keywords: ["faq schema generator", "faqpage json-ld", "faq structured data", "question answer schema", "faq markup", "faq schema google"],
    status: "live",
    actions: ["copy", "download"],
    effort: "instant",
    popularity: 76,
    addedAt: "2025-03-04",
    seoTitle: "FAQ Schema Generator — FAQPage JSON-LD From Q&A Pairs",
    seoDescription:
      "Paste question and answer pairs to generate valid FAQPage structured data. Blank-line separated, ready to paste into your page.",
    content: {
      intro: [
        "FAQ markup is the simplest structured data to get wrong: people generate it for content that is not on the page, or forget acceptedAnswer entirely. This generator takes plain Q&A pairs and writes the correct mainEntity array.",
        "The questions you mark up must be visible on the page — Google's guidelines are explicit about that, and violating them can remove rich results site-wide.",
      ],
      howTo: [
        "Write each question starting with Q: and each answer with A:.",
        "Separate pairs with a blank line.",
        "Copy the generated script tag.",
        "Confirm the same questions appear visibly on the page.",
      ],
      method: {
        title: "Format the generator expects",
        paragraphs: [
          "Each block is split on blank lines, then the question is read from the Q: line and the answer from the A: line, which may span several lines. Pairs missing either half are dropped rather than emitted empty.",
          "The output is a FAQPage with mainEntity entries, each a Question with an acceptedAnswer of type Answer — the structure required for eligibility.",
        ],
      },
      examples: [
        {
          title: "Three product questions",
          steps: ["Paste three Q/A pairs.", "Copy the script.", "Check the questions are visible in the page body."],
          result: "FAQPage with three Questions",
        },
        {
          title: "Cleaning up a broken block",
          steps: ["Paste a block with an answer but no question.", "See the warning about dropped pairs.", "Add the missing question line."],
          result: "All pairs emitted, none silently lost",
        },
      ],
      limitations: [
        "Only single-question blocks are parsed, not nested follow-ups.",
        "Rich results are no longer guaranteed for FAQ markup on most sites.",
        "Markup must match visible content exactly in meaning.",
      ],
      faqs: [
        {
          q: "Does FAQ markup still produce rich results?",
          a: "Google has limited FAQ rich results to authoritative government and health sites. The markup is still valid and helps machines understand the content.",
        },
        {
          q: "Can I put FAQ markup on any page?",
          a: "Only where the questions and answers are visible. Hidden FAQ markup is a guidelines violation.",
        },
        {
          q: "How many questions should I mark up?",
          a: "The ones genuinely on the page — usually three to eight. Padding with invented questions is both dishonest and ineffective.",
        },
      ],
    },
  },
  {
    slug: "breadcrumb-schema-generator",
    name: "Breadcrumb Schema Generator",
    category: "seo",
    tagline: "Generate BreadcrumbList JSON-LD from a simple trail.",
    intent: "generate breadcrumb schema",
    keywords: ["breadcrumb schema generator", "breadcrumblist json-ld", "breadcrumb structured data", "breadcrumb markup", "seo breadcrumbs", "breadcrumb generator"],
    status: "live",
    actions: ["copy", "download"],
    effort: "instant",
    popularity: 70,
    addedAt: "2025-03-05",
    seoTitle: "Breadcrumb Schema Generator — BreadcrumbList JSON-LD",
    seoDescription:
      "Turn a breadcrumb trail into valid BreadcrumbList structured data with correct positions and absolute URLs, ready to paste into your page.",
    content: {
      intro: [
        "Breadcrumb markup tells search engines where a page sits in your hierarchy, which can replace the raw URL in a result with a readable path. The structure is simple, but the position numbers and absolute URLs are easy to get wrong.",
        "Enter the trail as name and URL pairs and the generator handles the numbering.",
      ],
      howTo: [
        "Enter one level per line: name, a pipe, then the absolute URL.",
        "Start with Home.",
        "Copy or download the generated script.",
        "Make sure the same trail is visible on the page.",
      ],
      method: {
        title: "How the list is built",
        paragraphs: [
          "Every line becomes a ListItem with a position starting at one, the page name and its absolute URL. The order you type is the order emitted, so the trail reads from the site root to the current page.",
          "Lines without a URL are rejected rather than emitted with an empty item, because an item without a target is meaningless to a crawler.",
        ],
      },
      examples: [
        {
          title: "A tool page",
          steps: ["Enter Home, Tools, then Unit converter with URLs.", "Copy the script.", "Check the trail matches the visible breadcrumb."],
          result: "Three ListItems with positions 1–3",
        },
        {
          title: "A two-level trail",
          steps: ["Enter Home and the current page only.", "Confirm the output has two items.", "Paste into the page head."],
          result: "Minimal valid BreadcrumbList",
        },
      ],
      limitations: [
        "Breadcrumb trail must match the visible navigation.",
        "Cross-domain trails are allowed but unusual and should be deliberate.",
        "This is not a navigation widget — it only describes what you already show.",
      ],
      faqs: [
        {
          q: "Do I need visible breadcrumbs?",
          a: "Yes. Markup should describe what the user sees; hidden breadcrumb markup can be treated as misleading.",
        },
        {
          q: "Should the last item link to the current page?",
          a: "It may, and Google accepts it. Many sites make the final crumb plain text; both work.",
        },
        {
          q: "Does breadcrumb markup change rankings?",
          a: "Not directly. It can improve how the URL appears in results, which affects clicks.",
        },
      ],
    },
  },
  {
    slug: "canonical-tag-generator",
    name: "Canonical Tag Generator",
    category: "seo",
    tagline: "Write correct rel=canonical tags and strip tracking parameters.",
    intent: "generate canonical tag",
    keywords: ["canonical tag generator", "rel canonical generator", "canonical url tag", "seo canonical", "canonical link tag", "duplicate url fix"],
    status: "live",
    actions: ["copy", "download"],
    effort: "instant",
    popularity: 74,
    addedAt: "2025-03-05",
    seoTitle: "Canonical Tag Generator — Clean, Absolute rel=canonical",
    seoDescription:
      "Generate canonical link tags from a list of URLs, optionally stripping tracking parameters and trailing slashes, with absolute-URL checks.",
    content: {
      intro: [
        "A canonical tag is one line of HTML that prevents a duplicate-URL problem you would otherwise fight for months. The two mistakes are pointing at a relative path and leaving tracking parameters in the canonical.",
        "This generator takes your URLs, cleans them the way you specify, and writes the tag.",
      ],
      howTo: [
        "Paste one URL per line.",
        "Decide whether to strip query parameters — usually yes.",
        "Choose one trailing-slash convention and stick to it.",
        "Copy the generated tags into your page head.",
      ],
      method: {
        title: "What gets cleaned",
        paragraphs: [
          "Each URL is parsed; the fragment is always removed, since a canonical never includes one. With parameter stripping on, the entire query string is dropped — appropriate for tracking parameters, dangerous if your page identity depends on a query value.",
          "Relative or non-http URLs are skipped with an explanation rather than silently emitted, because a relative canonical is one of the most common causes of duplication.",
        ],
      },
      examples: [
        {
          title: "Stripping a campaign link",
          steps: ["Paste a URL with utm_source and utm_medium.", "Leave parameter stripping on.", "Copy the canonical without the query string."],
          result: "link rel=canonical pointing at the clean URL",
        },
        {
          title: "Keeping a query-based page",
          steps: ["Turn parameter stripping off.", "Paste a URL whose query identifies the page.", "Confirm the query survives."],
          result: "Canonical preserves the meaningful parameter",
        },
      ],
      limitations: [
        "Blind parameter stripping will merge genuinely different pages — check before using it in bulk.",
        "A canonical is a hint; conflicting signals (sitemap, internal links) weaken it.",
        "It does not verify that the target URL returns 200.",
      ],
      faqs: [
        {
          q: "Can a canonical point to another domain?",
          a: "Yes, for syndicated content — but it tells search engines the other domain is the original.",
        },
        {
          q: "Should the canonical include a trailing slash?",
          a: "Pick whichever your server serves and be consistent. Inconsistency creates the duplicates you are trying to avoid.",
        },
        {
          q: "Canonical or noindex for duplicates?",
          a: "Canonical, if you want the duplicate to consolidate signals. Noindex removes it entirely and passes nothing.",
        },
      ],
    },
  },
  {
    slug: "hreflang-generator",
    name: "Hreflang Generator",
    category: "seo",
    tagline: "Create hreflang link tags for multilingual and regional pages.",
    intent: "generate hreflang tags",
    keywords: ["hreflang generator", "hreflang tags", "multilingual seo", "language alternate tags", "x-default hreflang", "international seo"],
    status: "live",
    actions: ["copy", "download"],
    effort: "instant",
    popularity: 68,
    addedAt: "2025-03-06",
    seoTitle: "Hreflang Generator — Language and Region Alternate Tags",
    seoDescription:
      "Generate hreflang link tags from language and URL pairs, with x-default support and validation of language codes and absolute URLs.",
    content: {
      intro: [
        "Hreflang tells search engines which language or regional version of a page to serve. Get it wrong and the wrong language appears in results, or the tags are ignored entirely — usually because they are not reciprocal.",
        "This generator validates the codes and URLs and writes the tags; the reciprocity still has to be handled on each page.",
      ],
      howTo: [
        "Enter one line per version: language code, a pipe, then the absolute URL.",
        "Use ISO 639-1 language codes, optionally with a region such as es-MX.",
        "Enable x-default for users whose language is not covered.",
        "Add the same block, pointing at all versions, on every page.",
      ],
      method: {
        title: "Rules that matter",
        paragraphs: [
          "Language codes must be valid ISO 639-1 (or 639-2 where no two-letter code exists), optionally followed by an ISO 3166-1 region. The tool rejects entries that do not match, because an invalid code is ignored silently by crawlers.",
          "Every page in the cluster must list all the others, including itself. That self-reference is the most commonly missed requirement, so the output reminds you of it.",
        ],
      },
      examples: [
        {
          title: "English and German",
          steps: ["Add en-GB and de-DE with their URLs.", "Enable x-default.", "Paste the same block on both pages."],
          result: "Two alternates plus an x-default",
        },
        {
          title: "A typo in a code",
          steps: ["Enter en-UK instead of en-GB.", "Read the invalid-region warning.", "Fix the code and regenerate."],
          result: "Only valid codes are emitted",
        },
      ],
      limitations: [
        "Hreflang is a hint; search engines may still choose a different version.",
        "Reciprocity cannot be enforced from one page — each page needs the full cluster.",
        "Language detection for users is not covered; that is a server or CDN concern.",
      ],
      faqs: [
        {
          q: "Do hreflang tags improve rankings?",
          a: "They do not raise rankings, but they help the right version appear for the right audience, which improves clicks and reduces bounce.",
        },
        {
          q: "What is x-default?",
          a: "The page to serve when no language matches the user, usually a language selector or the English version.",
        },
        {
          q: "Can hreflang go in the sitemap?",
          a: "Yes. Both the head tags and sitemap annotations work; pick one approach and apply it consistently.",
        },
      ],
    },
  },
  {
    slug: "keyword-clustering-tool",
    name: "Keyword Clustering Tool",
    category: "seo",
    tagline: "Group a keyword list into topics by shared significant words.",
    intent: "cluster keywords",
    keywords: ["keyword clustering", "keyword grouping tool", "keyword clusters seo", "topic clusters", "keyword list organizer", "content clusters"],
    status: "live",
    actions: ["copy"],
    effort: "instant",
    popularity: 73,
    addedAt: "2025-03-06",
    seoTitle: "Keyword Clustering Tool — Group Keywords by Topic",
    seoDescription:
      "Paste a keyword list to group related phrases into clusters by shared significant words. Fast, predictable and free of black-box scores.",
    content: {
      intro: [
        "A flat list of 300 keywords is not a content plan. Clustering turns it into topics: everything about unit conversion belongs on one page, everything about JSON on another.",
        "This tool groups lexically — keywords sharing a significant word land together — which is fast, explainable and good enough for most lists.",
      ],
      howTo: [
        "Paste keywords, one per line or comma-separated.",
        "Read the clusters, largest first.",
        "Review the ungrouped list for terms that share meaning but not spelling.",
        "Copy the clusters into your content plan.",
      ],
      method: {
        title: "How clustering works",
        paragraphs: [
          "Each keyword is split into tokens, stop words and short tokens are discarded, and the keyword is indexed under every remaining token. Tokens shared by at least two keywords become cluster labels, assigned greedily from the largest group down so a keyword appears once.",
          "That greediness means order matters slightly: a keyword containing two common words joins the larger cluster. It is deterministic, which is more useful than a mysterious similarity score.",
        ],
      },
      examples: [
        {
          title: "Grouping tool keywords",
          steps: ["Paste twenty phrases about JSON and CSV.", "Read two clusters: json and csv.", "Plan one page per cluster."],
          result: "Two topics instead of twenty scattered ideas",
        },
        {
          title: "Spotting synonyms",
          steps: ["Cluster the list.", "Read the ungrouped remainder.", "Notice “price” and “cost” stayed apart."],
          result: "Manual merge needed for true synonyms",
        },
      ],
      limitations: [
        "Lexical matching does not understand synonyms or intent.",
        "Singular and plural forms are treated as different tokens unless you normalise them first.",
        "Search volume is not available — clustering is about structure, not demand.",
      ],
      faqs: [
        {
          q: "How many keywords per cluster?",
          a: "Enough to justify one page. If a cluster has one keyword, it is probably a section rather than a page.",
        },
        {
          q: "Why are some keywords ungrouped?",
          a: "They share no significant word with another entry. Merge synonyms by hand or rename terms consistently.",
        },
        {
          q: "Can it read a CSV export?",
          a: "Paste the keyword column directly. Commas and newlines are both accepted as separators.",
        },
      ],
    },
  },
  {
    slug: "seo-checklist-generator",
    name: "SEO Checklist Generator",
    category: "seo",
    tagline: "A working on-page and technical checklist you can tick off.",
    intent: "seo checklist",
    keywords: ["seo checklist", "on page seo checklist", "technical seo checklist", "seo audit list", "seo tasks", "site seo checklist"],
    status: "live",
    actions: ["copy", "download"],
    effort: "quick",
    popularity: 71,
    addedAt: "2025-03-07",
    seoTitle: "SEO Checklist — Technical and Content Tasks, Tickable",
    seoDescription:
      "A practical SEO checklist covering foundations, crawlability, content quality, structured data, performance and measurement. Tick items and export as Markdown.",
    content: {
      intro: [
        "Most SEO checklists are padded with 200 items of varying importance. This one keeps the tasks that actually move a site: correct titles and canonicals, crawlable navigation, original content, honest structured data, real performance.",
        "Progress is saved in your browser, so you can work through it over a week without losing your place.",
      ],
      howTo: [
        "Read the sections in order — foundations before content.",
        "Tick what is genuinely done.",
        "Copy the unticked items as Markdown into your task tracker.",
        "Revisit after any site-wide change.",
      ],
      method: {
        title: "Why these items",
        paragraphs: [
          "Each entry is a decision that changes how crawlers see the site: one canonical per page, no accidental noindex, sitemap listing only indexable URLs. Content items focus on originality, because thin templated pages are the most common reason a tool site fails review.",
          "Performance items are limited to the ones that affect user experience measurably — largest contentful paint, layout shift, tap target size — rather than a long list of micro-optimisations.",
        ],
      },
      examples: [
        {
          title: "Pre-launch pass",
          steps: ["Work through Foundations and Crawlability.", "Export the remaining items.", "Assign them before launch."],
          result: "A short, real task list",
        },
        {
          title: "Quarterly review",
          steps: ["Open the checklist.", "Reset and re-tick.", "Notice what regressed."],
          result: "Drift caught early",
        },
      ],
      limitations: [
        "Not a substitute for Search Console data or a technical crawl.",
        "Items are general — some do not apply to every site type.",
        "Progress is stored locally and is not synced between devices.",
      ],
      faqs: [
        {
          q: "Is this enough to rank?",
          a: "No checklist guarantees rankings. These are the prerequisites; content quality and demand do the rest.",
        },
        {
          q: "Where is my progress saved?",
          a: "In this browser's local storage only. Nothing is uploaded and nothing is tied to an account.",
        },
        {
          q: "Can I share the checklist?",
          a: "Yes — copy it as Markdown or download the file and share that.",
        },
      ],
    },
  },
  {
    slug: "website-launch-checklist",
    name: "Website Launch Checklist",
    category: "seo",
    tagline: "Everything to check before and after a site goes live.",
    intent: "website launch checklist",
    keywords: ["website launch checklist", "site launch checklist", "pre launch checklist", "go live checklist", "web launch tasks", "launch seo checklist"],
    status: "live",
    actions: ["copy", "download"],
    effort: "guided",
    popularity: 70,
    addedAt: "2025-03-07",
    seoTitle: "Website Launch Checklist — Pre and Post Go-Live Tasks",
    seoDescription:
      "A launch checklist covering links, forms, redirects, legal pages, analytics and post-launch monitoring, ordered by when you need each item.",
    content: {
      intro: [
        "Launch day failures are rarely exotic: a broken form, a missing redirect, a cookie banner that sets cookies before consent. This checklist is ordered by when each item matters, so you can work backwards from the switch-over.",
        "It also covers the week after, which is when most regressions are found and least often checked.",
      ],
      howTo: [
        "Work through “Before the switch” the day before launch.",
        "Complete the legal and technical sections before DNS changes.",
        "Run the post-launch items within 24 hours of go-live.",
        "Export anything outstanding into your tracker.",
      ],
      method: {
        title: "Why the order matters",
        paragraphs: [
          "Redirects and robots rules must exist before the domain moves; analytics and monitoring must be verified after, because they depend on the live host. Legal pages must exist before you collect a single cookie.",
          "Each item is phrased as something checkable in a browser, not a vague intention — “every internal link clicked once” rather than “check links”.",
        ],
      },
      examples: [
        {
          title: "Launching a new tool site",
          steps: ["Tick the technical section.", "Verify redirects from old URLs.", "Run the post-launch broken-link check."],
          result: "No orphaned URLs after the move",
        },
        {
          title: "Verifying consent",
          steps: ["Open the site in a fresh profile.", "Check no cookies are set before consent.", "Tick the item once confirmed."],
          result: "Analytics waits for consent",
        },
      ],
      limitations: [
        "Checklists prevent known mistakes, not unknown ones.",
        "Some items depend on your host or CMS and may need adapting.",
        "Progress is local to this browser.",
      ],
      faqs: [
        {
          q: "When should I lower DNS TTL?",
          a: "At least 24 hours before the move, so cached records expire quickly when you switch.",
        },
        {
          q: "Do I need a maintenance page?",
          a: "Only if the switch involves downtime. A 503 with Retry-After is the honest signal for a planned outage.",
        },
        {
          q: "What should I check first after launch?",
          a: "That the site loads over HTTPS on both apex and www, that forms work, and that no old URL returns 404.",
        },
      ],
    },
  },
  {
    slug: "broken-link-checker",
    name: "Broken Link Checker",
    category: "seo",
    tagline: "Crawl a site and report every link that no longer resolves.",
    intent: "find broken links",
    keywords: ["broken link checker", "dead link finder", "broken links seo", "404 checker", "link checker tool", "find dead links"],
    status: "planned",
    actions: ["copy"],
    effort: "guided",
    popularity: 80,
    addedAt: "2025-03-08",
    seoTitle: "Broken Link Checker — Planned, Requires a Crawler",
    seoDescription:
      "Crawling a site for broken links needs a server that can fetch pages and follow redirects. This tool is planned and clearly marked, not simulated.",
    content: {
      intro: [
        "A browser cannot crawl a site: cross-origin requests are blocked, redirects are followed invisibly, and a failed request may be CORS rather than a dead link. Reporting “broken” from such a check would be wrong more often than right.",
        "This tool is therefore planned until the site runs a crawler that can follow links server-side and report status codes honestly.",
      ],
      howTo: [
        "Until then, use your CMS's link report or a desktop crawler.",
        "Check your most-linked pages manually after any URL change.",
        "Keep a redirect map for anything you have moved.",
      ],
      method: {
        title: "What a real crawler would do",
        paragraphs: [
          "It would start from the sitemap or homepage, follow internal links to a bounded depth, request each URL without following redirects automatically, and record the status plus the Location header for each hop.",
          "It also needs to distinguish a genuine 404 from a timeout or a rate-limit — a distinction a single browser fetch cannot make.",
        ],
      },
      examples: [
        {
          title: "Finding dead links today",
          steps: ["Export your sitemap URLs.", "Run them through a desktop crawler.", "Fix any 404 or 5xx results."],
          result: "A trustworthy list of broken URLs",
        },
      ],
      limitations: [
        "Not implemented: this page performs no crawl.",
        "Client-side rendered links are invisible to a simple crawler anyway.",
      ],
      faqs: [
        {
          q: "Why can't a browser crawl?",
          a: "Same-origin policy blocks reading other sites' responses, and redirects are followed automatically, hiding the intermediate status codes.",
        },
        {
          q: "Do broken links hurt rankings?",
          a: "A few are normal. Many, especially on high-value pages, waste crawl budget and frustrate visitors.",
        },
      ],
    },
  },
];
