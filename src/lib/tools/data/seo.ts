import type { ToolDefinition } from "../types";

export const seoTools: ToolDefinition[] = [
  {
    slug: "serp-preview",
    name: "SERP Snippet Preview",
    category: "seo",
    tagline: "See how your title and description fit in Google's results, by pixel width.",
    intent: "preview google search result snippet",
    keywords: [
      "serp preview",
      "google snippet preview",
      "meta title preview",
      "meta description length",
      "seo title checker",
    ],
    status: "live",
    actions: ["copy"],
    effort: "instant",
    popularity: 69,
    addedAt: "2025-02-14",
    seoTitle: "SERP Preview — Check Title and Meta Description Length",
    seoDescription:
      "Preview how a page title and meta description appear in Google results, measured in pixels rather than characters, on desktop and mobile widths.",
    content: {
      intro: [
        "Google truncates titles and descriptions by pixel width, not character count. A string of narrow letters such as iii fits more characters than a string of wide ones such as WWW, which is why 'optimal character count' advice is only ever approximate.",
        "This preview renders your title and description in a Google-like result, measures each string against desktop and mobile limits, and marks where truncation would occur — so you can see the cut instead of guessing it.",
      ],
      howTo: [
        "Paste your title, description and URL.",
        "Compare the pixel width against the reference limits.",
        "Look at where the ellipsis appears on the mobile preview.",
        "Adjust the wording and watch the fit indicator change.",
      ],
      method: {
        title: "Pixel measurement",
        paragraphs: [
          "Each character is measured with the canvas text metrics API using a 20px Arial stack for titles and 14px for descriptions, then summed. The working limits used here are roughly 580px for desktop titles and 990px for descriptions, with tighter caps on mobile.",
          "These are approximations of Google's rendering, which varies by device, language, query and Google's own rewriting behaviour. Treat the preview as a design aid, not a guarantee.",
        ],
        formula: "width = ctx.measureText(title).width compared with ~580px",
      },
      examples: [
        {
          title: "Trim a 70-character title",
          steps: ["Paste the title.", "The indicator shows it exceeds the desktop limit.", "Move a qualifier to the description and re-measure."],
          result: "Title fits on one line without truncation",
        },
        {
          title: "Check a long product description",
          steps: ["Paste a two-sentence description.", "Compare where the mobile preview truncates.", "Front-load the distinguishing benefit."],
          result: "Key message visible before the ellipsis",
        },
      ],
      limitations: [
        "Google rewrites titles and descriptions for many queries, so a perfect preview may still not be what searchers see.",
        "Fonts differ between platforms, so pixel measurements vary slightly by operating system.",
        "The tool measures, it does not advise on keyword placement or search intent.",
      ],
      faqs: [
        {
          q: "How long should a meta description be?",
          a: "Roughly 150–160 characters is a reasonable target, but pixels matter more than characters. Aim for a complete sentence within the width shown by the preview.",
        },
        {
          q: "Can Google change my title?",
          a: "Yes. Google often rewrites titles to better match the query, particularly when the original is keyword-stuffed or truncated.",
        },
        {
          q: "Does this check my live page?",
          a: "No. It measures the text you paste. Fetching live pages would require a backend request, which this tool deliberately avoids.",
        },
      ],
    },
  },
  {
    slug: "utm-link-builder",
    name: "UTM Link Builder",
    category: "seo",
    tagline: "Build consistent, correctly encoded campaign URLs.",
    intent: "build utm tracking link",
    keywords: [
      "utm builder",
      "utm link generator",
      "campaign url builder",
      "google analytics utm",
      "tracking link",
    ],
    status: "live",
    actions: ["copy"],
    effort: "instant",
    popularity: 64,
    addedAt: "2025-02-15",
    seoTitle: "UTM Link Builder — Campaign URLs for Analytics",
    seoDescription:
      "Build UTM-tagged campaign URLs with correctly encoded parameters, a naming-convention checklist and a live preview of the final link.",
    content: {
      intro: [
        "UTM tags tell analytics where a click came from: source, medium, campaign, term and content. They are easy to add and easy to ruin — a capitalised 'Facebook' and a lowercase 'facebook' become two separate sources in every report.",
        "This builder enforces lowercase, hyphen-separated values, encodes the parameters correctly, preserves any query string already on the URL, and gives you a checklist for the naming convention your team should agree on first.",
      ],
      howTo: [
        "Paste the destination URL, including https://.",
        "Fill in source, medium and campaign — the three required parameters.",
        "Add term and content for paid search or A/B variants.",
        "Check the preview, then copy the final URL.",
      ],
      method: {
        title: "How the parameters combine",
        paragraphs: [
          "The builder creates a URL object from your destination, appends the non-empty UTM parameters as search params, and serialises the result. This preserves existing parameters rather than overwriting them, and encodes spaces and non-ASCII characters correctly.",
          "Values are lowercased and whitespace is replaced with hyphens so that the same campaign always produces the same string. Consistency matters more than the convention itself: pick one and document it.",
        ],
        formula: "url.searchParams.set('utm_source', source); url.toString()",
      },
      examples: [
        {
          title: "A newsletter campaign",
          steps: ["Destination: https://example.com/pricing", "Source: newsletter · Medium: email · Campaign: spring-launch"],
          result: "https://example.com/pricing?utm_source=newsletter&utm_medium=email&utm_campaign=spring-launch",
        },
        {
          title: "A paid search variant",
          steps: ["Medium: cpc · Term: running-shoes · Content: ad-a"],
          result: "…?utm_source=google&utm_medium=cpc&utm_campaign=sale&utm_term=running-shoes&utm_content=ad-a",
        },
      ],
      limitations: [
        "UTMs are visible and can be stripped by redirects or shared by users copying a tagged URL.",
        "Analytics platforms differ in which parameters they honour; GA4 uses all five but maps them to specific dimensions.",
        "Adding UTMs to internal links restarts the session and breaks attribution — never tag links on your own site.",
      ],
      faqs: [
        {
          q: "Are UTM parameters case-sensitive?",
          a: "Technically the values are, and analytics tools treat them as such. 'Facebook' and 'facebook' appear as two separate sources, which is why this builder lowercases everything.",
        },
        {
          q: "Which UTM parameters are required?",
          a: "Source, medium and campaign. Term and content are optional and mainly used for paid search and creative variants.",
        },
        {
          q: "Should I use UTMs on internal links?",
          a: "No. They overwrite the original attribution and can start a new session, distorting your reports.",
        },
      ],
    },
  },
  {
    slug: "keyword-density-analyzer",
    name: "Keyword Density Analyzer",
    category: "seo",
    tagline: "Count word frequency, phrases and density with stop-word filtering.",
    intent: "check keyword density of text",
    keywords: [
      "keyword density checker",
      "word frequency counter",
      "seo keyword analyzer",
      "term frequency",
      "content optimization",
    ],
    status: "live",
    actions: ["copy", "download"],
    effort: "quick",
    popularity: 55,
    addedAt: "2025-02-16",
    seoTitle: "Keyword Density Analyzer — Word and Phrase Frequency",
    seoDescription:
      "Analyse keyword density, single words and two- or three-word phrases in any text. Filter stop words and export the frequency table as CSV.",
    content: {
      intro: [
        "Keyword density is the share of a page's words made up of a given term. It is a crude metric that search engines do not use directly, but it remains a fast way to spot repetition, accidental over-optimisation, or a topic that drifted away from its heading.",
        "Paste your copy and the analyser returns single-word frequency, two- and three-word phrase frequency, and the density of each term — with common stop words filtered out of the default view.",
      ],
      howTo: [
        "Paste the article, product page or draft.",
        "Choose whether to include stop words.",
        "Switch between single words, 2-word and 3-word phrases.",
        "Sort by frequency or density and export the table as CSV.",
      ],
      method: {
        title: "How density is calculated",
        paragraphs: [
          "Text is lowercased, stripped of punctuation and split into tokens. Stop words (the, and, of) are optionally removed. N-grams are built by sliding a window of the chosen size across the token list.",
          "Density is the count of a term divided by the total token count, expressed as a percentage. Because the denominator is the whole text, densities always sum to roughly 100% across all single words.",
        ],
        formula: "density = (occurrences of term ÷ total words) × 100",
      },
      examples: [
        {
          title: "Checking an article for repetition",
          steps: ["Paste a 1,000-word draft.", "Sort single words by density.", "Notice 'solution' appears 24 times, 2.4% of the text."],
          result: "24 occurrences · 2.4% density · likely overused",
        },
        {
          title: "Finding the dominant phrase",
          steps: ["Switch to 3-word phrases.", "Sort by count.", "Compare with the page's target topic."],
          result: "Top phrase matches the search intent — or reveals topic drift",
        },
      ],
      limitations: [
        "Search engines do not publish or use a keyword density threshold. There is no 'correct' density and chasing a number is not a ranking strategy.",
        "Word counting is whitespace-based, so heavily hyphenated or CJK text needs different tokenisation.",
        "The analyser does not lemmatise, so 'run' and 'running' are counted separately.",
      ],
      faqs: [
        {
          q: "What is a good keyword density?",
          a: "There is no official target. Natural writing typically lands between 0.5% and 2% for a primary term. Higher values usually indicate awkward repetition, which harms readability more than it helps rankings.",
        },
        {
          q: "Does Google use keyword density?",
          a: "Google has repeatedly said it does not use a keyword density metric. Terms, synonyms and context matter; mechanical repetition does not help.",
        },
        {
          q: "Why remove stop words?",
          a: "Words like 'the' and 'of' dominate raw counts without saying anything about the topic. Filtering them reveals the meaningful vocabulary.",
        },
      ],
    },
  },
  {
    slug: "robots-txt-generator",
    name: "Robots.txt Generator",
    category: "seo",
    tagline: "Write valid robots.txt rules for crawlers, sitemaps and blocked paths.",
    intent: "generate robots.txt file",
    keywords: [
      "robots.txt generator",
      "robots txt file",
      "disallow crawlers",
      "sitemap directive",
      "seo robots file",
    ],
    status: "live",
    actions: ["copy", "download"],
    effort: "quick",
    popularity: 62,
    addedAt: "2025-02-18",
    seoTitle: "Robots.txt Generator — Create a Valid Crawler File",
    seoDescription:
      "Generate a valid robots.txt with user-agent rules, disallowed paths and a sitemap directive. Includes syntax checks and common mistakes to avoid.",
    content: {
      intro: [
        "robots.txt is a small file with a large blast radius. One stray Disallow: / can remove an entire site from search results, and a comment placed in the wrong spot can silently disable a rule.",
        "This generator assembles a syntactically valid file from the options you choose, checks for the common mistakes, and explains what each directive does. It cannot check what your server actually serves — that requires a live request.",
      ],
      howTo: [
        "Choose whether to allow all crawlers, block all, or target specific user agents.",
        "Add paths to disallow, one per line.",
        "Add your sitemap URL.",
        "Copy or download the file and upload it to your domain root.",
      ],
      method: {
        title: "How robots.txt is parsed",
        paragraphs: [
          "Each group starts with a User-agent line and contains Allow and Disallow rules. Matching crawlers obey the longest matching rule, with Allow winning ties. A Disallow: / blocks everything; an empty Disallow allows everything.",
          "The Sitemap directive is not part of the original standard but is supported by all major crawlers. It must be an absolute URL, and it belongs outside any group or after a blank line.",
        ],
        formula: "User-agent: *\nDisallow: /private/\nSitemap: https://example.com/sitemap.xml",
      },
      examples: [
        {
          title: "A standard site file",
          steps: ["Allow all crawlers.", "Disallow /admin/ and /search/."],
          result: "User-agent: * / Disallow: /admin/ / Disallow: /search/ / Sitemap: …",
        },
        {
          title: "Staging environment",
          steps: ["Block all crawlers.", "Do not include a sitemap."],
          result: "User-agent: * / Disallow: /",
        },
      ],
      limitations: [
        "robots.txt controls crawling, not indexing. A disallowed URL can still appear in results if other pages link to it — use a noindex meta tag for that.",
        "Crawlers may ignore rules they do not support; it is a convention, not access control.",
        "Never use robots.txt to hide private data. Anyone can read the file.",
      ],
      faqs: [
        {
          q: "Does robots.txt prevent a page from appearing in Google?",
          a: "Not reliably. It prevents crawling, which means Google cannot see a noindex tag on that page. To remove a page from the index, allow crawling and serve noindex, or use the Removals tool in Search Console.",
        },
        {
          q: "Where does robots.txt go?",
          a: "At the root of the domain, exactly at /robots.txt. It does not apply to subdirectories unless the host is configured that way.",
        },
        {
          q: "Can I block AI crawlers?",
          a: "Yes — add a rule for the specific user agent (for example GPTBot or CCBot). Blocking them is a policy choice, not an SEO requirement.",
        },
      ],
    },
  },
];
