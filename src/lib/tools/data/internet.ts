import type { ToolDefinition } from "../types";

/**
 * Section G — internet and networking.
 *
 * Ten tools run entirely in the browser. The eight marked `planned` genuinely
 * need a server: DNS resolution, TLS inspection, HTTP status checks and
 * redirect tracing cannot be done from a static page, and faking them with a
 * cached table would be dishonest.
 */
export const internetTools: ToolDefinition[] = [
  {
    slug: "url-parser",
    name: "URL Parser",
    category: "internet",
    tagline: "Break a URL into protocol, host, path and query parameters.",
    intent: "parse url into parts",
    keywords: [
      "url parser",
      "parse url",
      "url breakdown",
      "url query parameters",
      "split url",
      "url components",
    ],
    status: "live",
    actions: ["copy"],
    effort: "instant",
    popularity: 82,
    addedAt: "2025-02-16",
    seoTitle: "URL Parser — Break a Link Into Its Parts",
    seoDescription:
      "Parse any URL into protocol, hostname, port, path, query parameters and fragment. Decoded values, copyable parts and a normalised form, all offline.",
    content: {
      intro: [
        "Tracking parameters, encoded slashes and fragments are easier to reason about once the URL is taken apart. This parser splits a link into its components and decodes the query string into a table of keys and values.",
        "It uses the browser's own URL implementation, the same code that resolves the link when clicked — so what you see is what the request will actually contain, not a regex approximation.",
      ],
      howTo: [
        "Paste any URL. If the scheme is missing, https is assumed.",
        "Read each component: protocol, host, port, path, fragment and origin.",
        "Check the query parameter table for tracking parameters and duplicated keys.",
        "Copy any individual part, or the normalised URL.",
      ],
      method: {
        title: "What normalisation does",
        paragraphs: [
          "The URL parser resolves dot segments, lowercases the scheme and host, drops default ports, and percent-encodes characters that are not allowed literally. A link typed as example.com/a/../b?q=a b becomes https://example.com/b?q=a%20b.",
          "Query parameters are read through URLSearchParams, which decodes percent escapes and turns + into a space. Repeated keys are kept as separate rows rather than collapsed, because that is how servers usually interpret them.",
        ],
      },
      examples: [
        {
          title: "Auditing campaign parameters",
          steps: ["Paste a shared link with utm_ parameters.", "Read the query table.", "Copy the clean path without the tracking keys."],
          result: "utm_source, utm_medium and utm_campaign listed separately",
        },
        {
          title: "Finding a port",
          steps: ["Paste https://localhost:3000/admin.", "Read the port value.", "Copy the origin for an API base URL."],
          result: "Port 3000, origin https://localhost:3000",
        },
      ],
      limitations: [
        "Relative references such as /docs have no host, so they are shown without an origin.",
        "Punycode hostnames are displayed in their encoded form, which is what DNS stores.",
        "Parsing never contacts the server, so it cannot tell you whether the URL exists.",
      ],
      faqs: [
        {
          q: "Why was https added to my URL?",
          a: "A URL without a scheme is not absolute. The tool assumes https because that is nearly always the intent, and marks the assumption in the output.",
        },
        {
          q: "Are query values decoded?",
          a: "Yes. %20 and + both become a space, and repeated keys are listed once per occurrence.",
        },
        {
          q: "Does it support non-web schemes?",
          a: "Yes — mailto:, tel: and custom schemes parse, though their structure follows their own rules rather than host/path.",
        },
      ],
    },
  },
  {
    slug: "url-validator",
    name: "URL Validator",
    category: "internet",
    tagline: "Check that a URL is well formed and flag the risky parts.",
    intent: "validate url",
    keywords: [
      "url validator",
      "validate url",
      "check url format",
      "url syntax checker",
      "is this url valid",
      "url checker online",
    ],
    status: "live",
    actions: ["copy"],
    effort: "instant",
    popularity: 79,
    addedAt: "2025-02-16",
    seoTitle: "URL Validator — Syntax Checks and Practical Warnings",
    seoDescription:
      "Check whether a URL is valid: scheme, hostname, credentials, encoding and length. See the normalised form and the warnings that matter, without any network request.",
    content: {
      intro: [
        "“Valid” URL means two different things: the string parses, and the string is a good idea. This validator answers both — errors when the browser cannot use the URL, warnings when it parses but carries a problem such as plain http or embedded credentials.",
        "It is the check you want before storing a user-supplied link, pasting one into a config file, or debugging a redirect that will not fire.",
      ],
      howTo: [
        "Paste the URL.",
        "Read the verdict: valid, or invalid with the reason.",
        "Work through the findings list — errors first, then warnings.",
        "Copy the normalised URL, which is what the browser would actually request.",
      ],
      method: {
        title: "What is checked",
        paragraphs: [
          "Structural checks come free from the URL parser: a scheme, a host, legal characters. On top of those, the tool flags credentials in the URL (deprecated, and refused by many browsers), plain http, hostnames longer than the DNS limit, hostnames with no dot, over-long URLs and unencoded spaces.",
          "Warnings are separated from errors on purpose. A mailto: link is a valid URL and a warning at the same time — the opposite of an invalid string.",
        ],
      },
      examples: [
        {
          title: "Catching a copy-paste break",
          steps: ["Paste a URL containing a space.", "The validator reports invalid.", "Replace the space with %20 and re-check."],
          result: "Invalid → valid after encoding",
        },
        {
          title: "Reviewing a login URL",
          steps: ["Paste https://user:pass@example.com/.", "Read the credentials error.", "Move the credentials into an auth header."],
          result: "Error: credentials in a URL are deprecated",
        },
      ],
      limitations: [
        "Syntax validity says nothing about whether the server exists or responds.",
        "Homograph attacks and look-alike domains are not detected here — use the Domain Name Analyzer for punycode checks.",
        "Redirect chains and TLS state cannot be inspected without a network request.",
      ],
      faqs: [
        {
          q: "What makes a URL invalid?",
          a: "Characters that cannot be encoded, a missing host for http/https, credentials, or a scheme the browser does not recognise.",
        },
        {
          q: "Is http:// invalid?",
          a: "No, it parses. It is flagged as a warning because traffic is unencrypted and most sites redirect to https anyway.",
        },
        {
          q: "Can it validate a URL from a CSV column at scale?",
          a: "This page checks one URL at a time, which keeps the interface simple. For bulk checks, the same logic is a few lines with the URL constructor in any language.",
        },
      ],
    },
  },
  {
    slug: "domain-name-analyzer",
    name: "Domain Name Analyzer",
    category: "internet",
    tagline: "Pull a hostname apart: subdomains, TLD, hyphens and punycode.",
    intent: "analyse domain name",
    keywords: [
      "domain name analyzer",
      "domain analysis",
      "subdomain checker",
      "tld extractor",
      "punycode checker",
      "domain structure",
    ],
    status: "live",
    actions: ["copy"],
    effort: "instant",
    popularity: 70,
    addedAt: "2025-02-17",
    seoTitle: "Domain Name Analyzer — Structure, TLD and Punycode",
    seoDescription:
      "Break a hostname into labels, subdomains and TLD. See the registered name, hyphens, digits, punycode and a brandability heuristic — all computed locally.",
    content: {
      intro: [
        "Two hostnames can look identical and behave very differently: one is the site you meant, the other is a punycode look-alike. This analyzer shows the label structure, the registered name, and whether any part is encoded — the details that reveal a suspicious domain.",
        "It also gives a plain-language brandability score based on length, hyphens and digits, which is useful when shortlisting names before checking availability.",
      ],
      howTo: [
        "Paste a hostname or a full URL; the path is discarded.",
        "Read the labels, the registered name and the TLD.",
        "Check the notes for punycode, double hyphens, long names and unusual TLDs.",
        "Copy the hostname when you need the exact form.",
      ],
      method: {
        title: "How the parts are identified",
        paragraphs: [
          "A hostname is a set of dot-separated labels. The last label is the top-level domain and the one before it is the registered name for common cases like example.com; the labels to the left are subdomains.",
          "For multi-part suffixes such as co.uk the heuristic reports co as the registered name and uk as the TLD. That is deliberate: without the public suffix list, any tool that claims to know the exact registrable domain is guessing. The notes say which parts are which so nothing is hidden.",
          "Punycode labels begin with xn-- and are how non-ASCII names are stored in DNS. The analyzer flags them because a Cyrillic “а” in place of a Latin “a” is invisible in most fonts.",
        ],
      },
      examples: [
        {
          title: "Checking a look-alike",
          steps: ["Paste xn--pypal-4ve.com.", "See the punycode warning.", "Treat the domain as suspicious until proven otherwise."],
          result: "Flagged: punycode label present",
        },
        {
          title: "Shortlisting a brand name",
          steps: ["Paste a candidate such as get-your-tools-now.com.", "Read the hyphen penalty and the brandability score.", "Compare with a cleaner alternative."],
          result: "Three hyphens → low brandability score",
        },
      ],
      limitations: [
        "Multi-part suffixes are handled by heuristic rather than the full public suffix list.",
        "No registration, hosting, traffic or reputation data is available offline.",
        "The brandability score is a rough heuristic, not a valuation or an availability check.",
      ],
      faqs: [
        {
          q: "Does it tell me if a domain is available?",
          a: "No. Availability requires a registrar lookup. This tool only analyses the name itself.",
        },
        {
          q: "What is punycode?",
          a: "An ASCII encoding of internationalised domain names. It exists so DNS can carry non-Latin scripts, and it is also how homograph attacks disguise themselves.",
        },
        {
          q: "Why is co.uk reported as two labels?",
          a: "Because the public suffix list is not bundled. The tool shows the raw structure instead of pretending to know the registry boundary.",
        },
      ],
    },
  },
  {
    slug: "ipv4-subnet-calculator",
    name: "IPv4 Subnet Calculator",
    category: "internet",
    tagline: "Network address, broadcast, host range and mask — instantly.",
    intent: "ipv4 subnet calculator",
    keywords: [
      "subnet calculator",
      "ipv4 subnet calculator",
      "cidr calculator",
      "netmask calculator",
      "host range calculator",
      "subnet mask",
    ],
    status: "live",
    actions: ["copy"],
    effort: "instant",
    popularity: 88,
    addedAt: "2025-02-17",
    seoTitle: "IPv4 Subnet Calculator — CIDR, Mask and Host Range",
    seoDescription:
      "Calculate the network address, broadcast address, subnet mask, wildcard and usable host range for any IPv4 address and prefix. Binary view included.",
    content: {
      intro: [
        "Subnetting is simple arithmetic once you can see it happen. This calculator takes an address and a prefix length and returns the network, the broadcast, the mask, the wildcard and the first and last usable hosts — plus the binary working underneath.",
        "It handles the awkward prefixes too: a /31 point-to-point link has two usable addresses, and a /32 has exactly one, which is not what the usual “total minus two” formula says.",
      ],
      howTo: [
        "Enter the device address, not the network address — either works, but the address you have is usually the device.",
        "Set the prefix, or pick a common one from the shortcuts.",
        "Read the network and host range, then copy the CIDR or the mask.",
        "Check the scope line to see whether the range is private, loopback or public.",
      ],
      method: {
        title: "The arithmetic",
        paragraphs: [
          "The subnet mask is a 32-bit number with the first n bits set, where n is the prefix length. AND-ing the address with the mask zeroes the host bits and yields the network address. OR-ing it with the wildcard (the inverse mask) sets every host bit and yields the broadcast address.",
          "Usable hosts are the addresses between those two, so a /26 with 64 total addresses gives 62 usable. Exceptions are /31, defined by RFC 3021 for point-to-point links where both addresses are assignable, and /32, a single host route with no network or broadcast address at all.",
          "Private ranges are classified per RFC 1918 plus the special cases (loopback 127/8, link-local 169.254/16, CGNAT 100.64/10, multicast 224/4), because a “private” label that ignores link-local addresses is misleading.",
        ],
        formula: "network = ip AND, broadcast = network OR, hosts = 2^(32 − prefix) − 2",
      },
      examples: [
        {
          title: "Splitting a /24 into /26s",
          steps: ["Enter 192.168.1.70 and a prefix of 26.", "Read the network 192.168.1.64/26.", "Note the host range .65 to .126 — 62 hosts."],
          result: "192.168.1.64/26 · 62 usable hosts",
        },
        {
          title: "Point-to-point link",
          steps: ["Enter 10.0.0.1 with a /31.", "See that both addresses are usable.", "Copy the CIDR for the router config."],
          result: "10.0.0.0/31 · 2 usable hosts",
        },
      ],
      limitations: [
        "IPv4 only — IPv6 uses a different notation and a 128-bit address space.",
        "Public/private classification is by range, not by actual routing policy.",
        "Overlapping ranges across VPCs and VPNs are not modelled.",
      ],
      faqs: [
        {
          q: "How many hosts are in a /24?",
          a: "256 addresses, 254 usable — the network and broadcast addresses are reserved.",
        },
        {
          q: "Why does a /31 show two usable hosts?",
          a: "RFC 3021 allows both addresses on point-to-point links, where there is no need for network or broadcast identifiers.",
        },
        {
          q: "What is a wildcard mask?",
          a: "The inverse of the subnet mask, used in access control lists: 255.255.255.192 becomes 0.0.0.63.",
        },
        {
          q: "Does it support IPv6?",
          a: "Not yet. IPv6 subnets are almost always /64, but the arithmetic and notation are different enough to deserve their own tool.",
        },
      ],
    },
  },
  {
    slug: "user-agent-parser",
    name: "User-Agent Parser",
    category: "internet",
    tagline: "Read a User-Agent string: browser, engine, OS and device.",
    intent: "parse user agent",
    keywords: [
      "user agent parser",
      "parse user agent",
      "user agent string",
      "detect browser from user agent",
      "ua parser",
      "useragent lookup",
    ],
    status: "live",
    actions: ["copy"],
    effort: "instant",
    popularity: 75,
    addedAt: "2025-02-18",
    seoTitle: "User-Agent Parser — Browser, Engine, OS and Device",
    seoDescription:
      "Parse a User-Agent string into browser, version, rendering engine, operating system and device class. Includes bot detection and your own browser's string.",
    content: {
      intro: [
        "Server logs are full of User-Agent strings, and they are not written for humans. This parser pulls out the browser and version, the rendering engine, the operating system and whether the client is a phone, tablet, desktop or crawler.",
        "It also recognises the traps: Edge and Opera both claim to be Chrome, iPadOS reports itself as desktop Safari, and headless browsers announce themselves in ways that are easy to miss.",
      ],
      howTo: [
        "Paste a User-Agent string, or press “Use this browser” to parse your own.",
        "Read the detected browser, engine and OS.",
        "Check the device class and whether the string looks automated.",
        "Copy the summary line into a bug report or a log note.",
      ],
      method: {
        title: "Order of detection matters",
        paragraphs: [
          "Most browsers impersonate others for compatibility, so the parser tests the most specific tokens first: Edg/ before Chrome/, OPR/ before Chrome/, SamsungBrowser/ before Chrome/, and CriOS/FxiOS for the iOS variants that cannot use their desktop engines.",
          "The engine is inferred from the platform tokens — Blink for Chromium-based browsers, WebKit for Safari and its iOS relatives, Gecko for Firefox, Trident for the legacy Internet Explorer — because the engine determines behaviour far more than the brand does.",
          "Bot detection matches crawler, preview and HTTP-client tokens, including headless Chrome and common scripting libraries, which is what most log analysis actually needs.",
        ],
      },
      examples: [
        {
          title: "Reading a support ticket",
          steps: ["Paste the string from the ticket.", "See Chrome 126 on Windows 10/11.", "Compare with the version you support."],
          result: "Chrome 126.0.0.0 · Blink · Windows 10 or 11",
        },
        {
          title: "Spotting a crawler",
          steps: ["Paste a Googlebot string.", "Read “Automated client” and the bot note.", "Exclude it from a traffic count."],
          result: "Device: bot · notes explain it is a crawler",
        },
      ],
      limitations: [
        "User-Agent strings are self-declared and trivially spoofed, so this identifies what the client claims to be.",
        "Client Hints have largely replaced User-Agent in Chromium; a full picture needs those headers too.",
        "Minor build numbers and patched forks may not be distinguishable.",
        "Never branch behaviour on this string in code — use feature detection.",
      ],
      faqs: [
        {
          q: "Why does Edge report Chrome?",
          a: "Edge is Chromium-based and keeps the Chrome token for site compatibility. The Edg/ token is what identifies it, and the parser checks that first.",
        },
        {
          q: "Why does my iPad say macOS?",
          a: "iPadOS 13 and later request the desktop site by default, so Safari reports Macintosh. The absence of a touch-specific token is the giveaway.",
        },
        {
          q: "Is this accurate enough to block bots?",
          a: "No. Blocking on User-Agent alone punishes ordinary users and misses sophisticated scrapers. Treat it as a signal, not a gate.",
        },
      ],
    },
  },
  {
    slug: "http-status-code-reference",
    name: "HTTP Status Code Reference",
    category: "internet",
    tagline: "Every common HTTP status code, what it means and when to send it.",
    intent: "http status codes list",
    keywords: [
      "http status codes",
      "http status code list",
      "404 meaning",
      "500 error meaning",
      "status code reference",
      "http response codes",
    ],
    status: "live",
    actions: ["copy"],
    effort: "instant",
    popularity: 84,
    addedAt: "2025-02-18",
    seoTitle: "HTTP Status Code Reference — Meanings and When to Use Them",
    seoDescription:
      "Searchable list of HTTP status codes: what each one means, when a server should send it, and the difference between codes people constantly confuse.",
    content: {
      intro: [
        "Knowing that 403 exists is easy; knowing when to send 403 rather than 401 is the part that trips people up. This reference pairs each code with its registered name, a one-line meaning and a practical note on when to use it.",
        "Search by number or by meaning — “redirect”, “timeout”, “rate limit” — and filter to a class to see the full family.",
      ],
      howTo: [
        "Search for a code such as 429, or a word such as “unauthorized”.",
        "Filter by class if you want the whole 4xx or 5xx family.",
        "Read the “send it when” column before picking a code.",
        "Copy a code for a ticket or an API contract.",
      ],
      method: {
        title: "How the codes are grouped",
        paragraphs: [
          "The first digit defines the class: 1xx informational, 2xx success, 3xx redirection, 4xx client error, 5xx server error. That grouping is stable and is what clients use to decide whether to retry, redirect or fail.",
          "The list follows the IANA registry. Where a code is frequently confused with a neighbour, the note explains the distinction — 401 means “not authenticated”, 403 means “authenticated but not allowed”, 404 means “does not exist” rather than “you cannot see it”.",
        ],
      },
      examples: [
        {
          title: "Choosing between 401 and 403",
          steps: ["Search “unauthorized”.", "Read that 401 means missing or invalid credentials.", "Check 403 for a signed-in user without permission."],
          result: "Use 401 to demand authentication, 403 to refuse an authenticated request",
        },
        {
          title: "Handling a rate limit",
          steps: ["Search 429.", "Read the guidance to include Retry-After.", "Implement client back-off accordingly."],
          result: "429 with Retry-After rather than a generic 400",
        },
      ],
      limitations: [
        "This is a reference, not a checker: it cannot inspect a live response.",
        "Some frameworks invent non-standard codes, which are not listed here.",
        "Returning the right code is only half the job — the body and headers matter too.",
      ],
      faqs: [
        {
          q: "What is the difference between 301 and 302?",
          a: "301 is permanent and clients may cache it and search engines transfer signals; 302 is temporary and should not be cached long-term.",
        },
        {
          q: "Should I use 404 or 410?",
          a: "404 when the resource is not found; 410 when it deliberately existed and was removed, which search engines may drop faster.",
        },
        {
          q: "Why do 5xx codes need logging?",
          a: "They mean the server failed a valid request. Without logs you cannot tell an exception from a timeout or an upstream outage.",
        },
      ],
    },
  },
  {
    slug: "sitemap-xml-generator",
    name: "Sitemap XML Generator",
    category: "internet",
    tagline: "Build a valid sitemap.xml from a list of URLs.",
    intent: "sitemap generator",
    keywords: [
      "sitemap generator",
      "xml sitemap generator",
      "create sitemap.xml",
      "sitemap xml",
      "google sitemap generator",
      "sitemap creator",
    ],
    status: "live",
    actions: ["copy", "download"],
    effort: "quick",
    popularity: 86,
    addedAt: "2025-02-19",
    seoTitle: "Sitemap Generator — Valid XML From Your URL List",
    seoDescription:
      "Generate a standards-compliant sitemap.xml from a list of paths. Duplicates are removed, invalid URLs and dates reported, and the file is downloadable immediately.",
    content: {
      intro: [
        "A sitemap is one of the few SEO artefacts that must be exactly right: wrong namespace, relative URLs or invalid dates and the file is silently ignored. This generator produces the correct structure from a plain list of paths.",
        "It also does the boring parts — de-duplicating, rejecting relative URLs, checking that lastmod is a real date and that priority sits between 0 and 1.",
      ],
      howTo: [
        "Set your site's base URL.",
        "Paste one path per line, or full URLs if they live on another host.",
        "Optionally apply a lastmod date, change frequency and priority to every entry.",
        "Download sitemap.xml, upload it to your site root, and reference it in robots.txt.",
      ],
      method: {
        title: "What makes the file valid",
        paragraphs: [
          "The document declares the sitemap namespace and wraps each URL in a <url> element containing a <loc>. lastmod must be a W3C datetime — YYYY-MM-DD is the safe subset — and priority must be a decimal between 0.0 and 1.0.",
          "Only absolute, canonical URLs belong in a sitemap. Redirects, 404s, noindex pages and parameter duplicates should be excluded, because a sitemap full of low-value URLs wastes crawl budget and can look manipulative.",
          "A single file may hold up to 50,000 URLs and must be under 50 MB uncompressed; beyond that, split into several sitemaps and index them.",
        ],
        formula: '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"><url><loc>…</loc></url></urlset>',
      },
      examples: [
        {
          title: "A ten-page site",
          steps: ["Set the base URL.", "Paste ten paths, one per line.", "Download the file and submit it in Search Console."],
          result: "sitemap.xml with ten <url> entries",
        },
        {
          title: "Cleaning a list from a crawl",
          steps: ["Paste crawled URLs including duplicates.", "Read which entries were removed and why.", "Download the cleaned file."],
          result: "Duplicates and relative URLs removed with an explanation",
        },
      ],
      limitations: [
        "This generates the file; it does not upload it or verify that the URLs respond.",
        "Image, video and news sitemap extensions are not produced.",
        "Very large sites should generate sitemaps from their CMS rather than by hand.",
      ],
      faqs: [
        {
          q: "Where do I put sitemap.xml?",
          a: "At the site root, so https://example.com/sitemap.xml resolves, then add a Sitemap: line to robots.txt and submit it in Search Console.",
        },
        {
          q: "Is lastmod required?",
          a: "No, but it is the field search engines trust most when deciding to recrawl. Use the real date the content changed.",
        },
        {
          q: "Does a sitemap guarantee indexing?",
          a: "No. It helps discovery; indexing still depends on content quality, crawlability and duplication.",
        },
      ],
    },
  },
  {
    slug: "meta-tag-generator",
    name: "Meta Tag Generator",
    category: "internet",
    tagline: "Generate title, description, canonical and social tags with checks.",
    intent: "meta tag generator",
    keywords: [
      "meta tag generator",
      "generate meta tags",
      "og tags generator",
      "twitter card generator",
      "seo meta tags",
      "html meta tags",
    ],
    status: "live",
    actions: ["copy"],
    effort: "quick",
    popularity: 83,
    addedAt: "2025-02-19",
    seoTitle: "Meta Tag Generator — Title, Description and Social Tags",
    seoDescription:
      "Generate a complete head block: title, description, canonical, robots, Open Graph and Twitter card tags, with length checks as you type.",
    content: {
      intro: [
        "The head of a page decides how it appears in search results, in chat previews and in social cards. This generator writes the whole set at once — title, description, canonical, robots, Open Graph and Twitter — and flags the lengths that get truncated.",
        "Nothing is invented: every tag comes from a value you supplied, so you can paste the block into a template, a CMS field or a static page header.",
      ],
      howTo: [
        "Write the title and description, watching the character counters.",
        "Add the canonical URL, site name and a 1200 × 630 social image.",
        "Choose the page type and Twitter card format.",
        "Copy the generated tags into your <head>.",
      ],
      method: {
        title: "What the checks mean",
        paragraphs: [
          "Titles are truncated in search results at roughly 60 characters and descriptions around 155–160, measured in characters rather than pixels. The counters warn rather than block, because pixel width varies with the letters used.",
          "Canonical URLs must be absolute, and using http:// creates a duplicate of your https page. Social images must also be absolute — a relative path works for browsers but not for crawlers that fetch the image independently.",
          "All values are attribute-escaped, so an apostrophe or an ampersand in your description cannot break the markup.",
        ],
      },
      examples: [
        {
          title: "A tool page",
          steps: ["Enter a title under 60 characters.", "Write a 120–155 character description.", "Copy the generated block into the page head."],
          result: "Complete head block including canonical and og:image",
        },
        {
          title: "A private page",
          steps: ["Fill the fields as usual.", "Switch on noindex, nofollow.", "Copy the block — robots is written for you."],
          result: "noindex, nofollow plus a warning in the review list",
        },
      ],
      limitations: [
        "Length checks are character-based approximations of how search engines truncate.",
        "The tool does not fetch your page to see what is already there.",
        "Some platforms add their own tags; this covers the standard set only.",
      ],
      faqs: [
        {
          q: "How long should a meta description be?",
          a: "Aim for 120–155 characters: long enough to explain the page, short enough to avoid truncation.",
        },
        {
          q: "Do meta keywords matter?",
          a: "No. Google has ignored them for years, and including them only tells competitors what you were targeting.",
        },
        {
          q: "Which tags are essential?",
          a: "Title, description, canonical, viewport and robots cover search; og:title, og:description, og:image and og:url cover sharing.",
        },
      ],
    },
  },
  {
    slug: "open-graph-preview-tool",
    name: "Open Graph Preview Tool",
    category: "internet",
    tagline: "See how a link will look on Facebook, X and Google before sharing.",
    intent: "open graph preview",
    keywords: [
      "open graph preview",
      "social preview tool",
      "og preview",
      "facebook link preview",
      "twitter card preview",
      "link preview generator",
    ],
    status: "live",
    actions: ["copy"],
    effort: "instant",
    popularity: 80,
    addedAt: "2025-02-20",
    seoTitle: "Open Graph Preview — See Your Link Before You Share It",
    seoDescription:
      "Preview how a URL looks as a Facebook or LinkedIn card, an X card and a Google snippet. Edit the title, description and image, then copy the tags.",
    content: {
      intro: [
        "A shared link is judged in half a second, mostly by its image and headline. This preview shows the card that Facebook, LinkedIn and X will build from your Open Graph values, plus the Google snippet that uses the same title and description.",
        "Everything is rendered locally from the values you type — no scraping, no API keys, no waiting for a platform to render a preview.",
      ],
      howTo: [
        "Type or paste your title, description, URL, site name and image URL.",
        "Compare the large card preview against the compact X card.",
        "Check the Google snippet for truncation.",
        "Copy the Open Graph tags, or move to the Meta Tag Generator for the full set.",
      ],
      method: {
        title: "What each platform uses",
        paragraphs: [
          "Facebook and LinkedIn read og:title, og:description and og:image, and fall back to the page title and first image when they are missing. A 1.91:1 image (1200 × 630) fills the card without cropping the important part.",
          "X uses twitter:card, twitter:title and twitter:image, falling back to the Open Graph values when the Twitter-specific tags are absent. The summary_large_image card is the one that shows a wide picture.",
          "Google ignores Open Graph for its snippet and uses the title element and meta description instead, which is why both are shown side by side.",
        ],
      },
      examples: [
        {
          title: "Checking a blog post",
          steps: ["Paste the post title and description.", "Add the hero image URL.", "Confirm the headline is not cut off in the card."],
          result: "Card preview with the full headline and image",
        },
        {
          title: "Fixing a missing image",
          steps: ["Leave the image field empty.", "See the empty state in the card.", "Add an absolute https image URL."],
          result: "Image appears; the tag is included in the copied block",
        },
      ],
      limitations: [
        "Platforms may crop, cache or truncate differently on a live share.",
        "Images must be publicly reachable; a local file path will not load for anyone else.",
        "This does not fetch the live page to read existing tags.",
      ],
      faqs: [
        {
          q: "What image size should I use?",
          a: "1200 × 630 pixels, which is 1.91:1 and works for Facebook, LinkedIn and X large cards.",
        },
        {
          q: "Why is my preview out of date after changing tags?",
          a: "Platforms cache previews. Use their debugger to force a refetch once the page is live.",
        },
        {
          q: "Do I need both OG and Twitter tags?",
          a: "Twitter falls back to OG, but adding twitter:card and twitter:image gives you control over the card format.",
        },
      ],
    },
  },
  {
    slug: "canonical-url-checker",
    name: "Canonical URL Checker",
    category: "internet",
    tagline: "Check a page's canonical tag for duplicates, relative paths and mismatches.",
    intent: "check canonical tag",
    keywords: [
      "canonical url checker",
      "check canonical tag",
      "rel canonical",
      "duplicate canonical",
      "canonical tag seo",
      "self referencing canonical",
    ],
    status: "live",
    actions: ["copy"],
    effort: "quick",
    popularity: 72,
    addedAt: "2025-02-20",
    seoTitle: "Canonical Tag Checker — Spot Duplicates and Mismatches",
    seoDescription:
      "Paste a page's head to check its canonical tag: absolute or relative, duplicated, pointing elsewhere, or set alongside noindex. Findings are explained, not just listed.",
    content: {
      intro: [
        "A canonical tag is a promise about which URL is the real one. Two of them, a relative path, or a canonical pointing at a redirect quietly break that promise — and search engines simply ignore conflicting signals.",
        "This checker reads the head you paste and reports what it actually found, including the difference between “this canonical points elsewhere” (normal for a duplicate) and “this canonical points elsewhere on a page that should be self-referencing” (a mistake).",
      ],
      howTo: [
        "Open the page, choose “View source”, and copy the head block.",
        "Paste it, together with the URL the page is served from.",
        "Read the findings: missing, relative, duplicated or mismatched.",
        "Fix the tag and re-check, then confirm that the target URL returns 200 without redirecting.",
      ],
      method: {
        title: "Rules applied",
        paragraphs: [
          "The canonical link must be absolute — http or https with a host — and appear exactly once in the head. When several are present the tool treats it as an error, because the specification gives no tie-break and engines pick one or ignore all of them.",
          "The declared canonical is compared with the URL you supplied, ignoring a trailing slash. A difference is not automatically wrong: a paginated or parameterised page may legitimately point at its clean version. The message says which case it is.",
          "A noindex alongside a canonical is reported as an error, because the page is excluded from the index and the canonical cannot move signals anywhere.",
        ],
      },
      examples: [
        {
          title: "Auditing a product page",
          steps: ["Paste the product page head.", "Enter its live URL.", "Read that the canonical matches itself."],
          result: "Self-referencing canonical, no issues",
        },
        {
          title: "Finding a duplicate canonical",
          steps: ["Paste a head with two rel=canonical links.", "Read the duplicate error.", "Remove the stale one from the template."],
          result: "2 canonical tags found — keep exactly one",
        },
      ],
      limitations: [
        "The page must be pasted by hand; fetching it would require a server-side proxy, which this site does not run.",
        "Redirect chains are not followed, so a canonical pointing at a redirect cannot be detected here.",
        "hreflang and pagination relationships are not analysed.",
      ],
      faqs: [
        {
          q: "Should a page canonicalise to itself?",
          a: "Yes, for the primary version of a page. Self-referencing canonicals make the preferred URL explicit and prevent parameter duplicates from competing.",
        },
        {
          q: "Can a canonical point to another domain?",
          a: "It can, and it is used for syndicated content, but it tells search engines the other domain is the original. Do it deliberately.",
        },
        {
          q: "Does canonical work with noindex?",
          a: "Effectively no. A noindexed page is removed from the index, so it cannot consolidate signals.",
        },
      ],
    },
  },
  {
    slug: "url-shortener",
    name: "URL Shortener",
    category: "internet",
    tagline: "Create short links with click tracking and custom slugs.",
    intent: "shorten url",
    keywords: ["url shortener", "short link", "shorten url", "link shortener", "tiny url", "custom short link"],
    status: "planned",
    actions: ["copy"],
    effort: "guided",
    popularity: 74,
    addedAt: "2025-02-21",
    seoTitle: "URL Shortener — Planned, Because It Needs a Server",
    seoDescription:
      "Short links require a server that stores the mapping and redirects visitors. This tool is on the roadmap and clearly marked as not yet available.",
    content: {
      intro: [
        "A short link is a promise that someone will redirect visitors in the future. That requires persistent storage and a redirect endpoint — a static site cannot do it, because there is nowhere to keep the mapping and nothing to answer the request.",
        "Rather than ship a generator that produces links which do not work, this tool is marked as planned until the infrastructure exists.",
      ],
      howTo: [
        "There is nothing to click yet — the tool is not built.",
        "Until then, use a short link service you are willing to depend on, and check its retention policy.",
        "If you need permanent links, a path on your own domain is more reliable than any third-party shortener.",
      ],
      method: {
        title: "What building it would take",
        paragraphs: [
          "The implementation needs a small database mapping random slugs to destination URLs, an HTTP handler that looks up the slug and returns a 301 or 302, and abuse controls because open redirects attract spam.",
          "That is a backend, however small. It also brings ongoing costs and a privacy obligation, since every click is a data point about a visitor.",
        ],
      },
      examples: [
        {
          title: "Alternatives that work today",
          steps: ["Use a path on your own domain for permanent links.", "Or use your CMS's built-in short-link feature.", "Keep a note of any third-party shortener you rely on."],
          result: "Links you control, with no expiring redirect",
        },
      ],
      limitations: [
        "Not implemented, and deliberately not simulated.",
        "Short links also hide the destination, which is a phishing pattern — another reason to be cautious about depending on them.",
      ],
      faqs: [
        {
          q: "Why is this not available?",
          a: "Because shortening needs persistent storage and a redirect server. A browser-only page cannot keep the mapping alive after you close the tab.",
        },
        {
          q: "Will it be added?",
          a: "Only if the site gains a server for this purpose, with abuse handling and a clear retention policy. The roadmap page tracks that decision.",
        },
      ],
    },
  },
  {
    slug: "ip-address-information-tool",
    name: "IP Address Information Tool",
    category: "internet",
    tagline: "Look up the location, ISP and network behind an IP address.",
    intent: "ip address lookup",
    keywords: ["ip lookup", "ip address information", "what is my ip", "ip geolocation", "ip location", "ip owner lookup"],
    status: "planned",
    actions: ["copy"],
    effort: "guided",
    popularity: 76,
    addedAt: "2025-02-21",
    seoTitle: "IP Address Information — Planned, Needs a Lookup Service",
    seoDescription:
      "IP geolocation and ISP details come from a database or API, not from the address itself. This tool is planned and clearly marked, not simulated.",
    content: {
      intro: [
        "An IP address contains no location. Geolocation comes from a commercial database that maps ranges to countries, cities and network operators, and keeps that mapping current as allocations change.",
        "This site does not ship a stale copy of such a database or pretend a hard-coded table is a live lookup. Use the IPv4 Subnet Calculator for the arithmetic that is genuinely offline, and a dedicated provider for location data.",
      ],
      howTo: [
        "The subnet arithmetic — network, broadcast, host range, private versus public — is already live in the IPv4 Subnet Calculator.",
        "For location and ISP data, choose a provider whose privacy policy you have read.",
        "Remember that any IP you look up is also a data point about a person; do not log more than you need.",
      ],
      method: {
        title: "Why this needs a service",
        paragraphs: [
          "IP allocation changes constantly. A bundled database would be wrong within weeks, and refreshing it requires regular downloads measured in hundreds of megabytes.",
          "A lookup API keeps the data current but introduces a third party: every query reveals the address being investigated. That trade-off belongs to the user, not silently to the site.",
        ],
      },
      examples: [
        {
          title: "What you can do offline",
          steps: ["Open the IPv4 Subnet Calculator.", "Enter the address and prefix.", "Read whether it is private, loopback or public, and which subnet it belongs to."],
          result: "Range classification and subnet maths, without a lookup",
        },
      ],
      limitations: [
        "Not implemented: no geolocation, ASN or reputation data is available.",
        "Even commercial databases are approximate at city level and can be wrong for VPNs and mobile carriers.",
      ],
      faqs: [
        {
          q: "Can a browser find an IP's location on its own?",
          a: "No. The address itself carries no location, and there is no offline source of truth small enough to ship.",
        },
        {
          q: "Is the subnet calculator enough?",
          a: "For network maths, yes. For “where is this address”, a lookup provider is unavoidable.",
        },
      ],
    },
  },
  {
    slug: "dns-record-lookup",
    name: "DNS Record Lookup",
    category: "internet",
    tagline: "Query A, AAAA, MX, TXT, CNAME and NS records for a domain.",
    intent: "dns lookup",
    keywords: ["dns lookup", "dns checker", "mx record lookup", "txt record checker", "dns records", "check dns propagation"],
    status: "planned",
    actions: ["copy"],
    effort: "guided",
    popularity: 81,
    addedAt: "2025-02-22",
    seoTitle: "DNS Record Lookup — Planned, Requires a Resolver",
    seoDescription:
      "DNS lookups need a resolver that is not restricted by browser CORS rules. This tool is planned until a server-side resolver exists; nothing is simulated here.",
    content: {
      intro: [
        "Browsers cannot perform arbitrary DNS queries. There is no JavaScript API for MX or TXT records, and any public DNS-over-HTTPS endpoint that would answer is blocked by CORS or rate limits in practice.",
        "Rather than show a form that fails silently, this tool is marked as planned. It will exist when the site has a resolver endpoint that can be run responsibly and cached.",
      ],
      howTo: [
        "Until then, use your operating system's tools: dig, nslookup or host on the command line.",
        "For browser-based checks, your DNS provider's control panel shows the records it serves.",
        "For propagation checks, the authoritative nameservers are the only source of truth — caches will be caches.",
      ],
      method: {
        title: "What a real implementation needs",
        paragraphs: [
          "A resolver proxy would take a domain and record type, query the DNS system from the server, and return JSON. It needs rate limiting, caching to avoid becoming an open amplifier, and a clear logging policy.",
          "Doing that well is infrastructure work, not a front-end feature. That is why this entry is honest about being unbuilt instead of shipping a shell that always says “no records found”.",
        ],
      },
      examples: [
        {
          title: "Checking a domain today",
          steps: ["Open a terminal.", "Run dig example.com MX +short.", "Compare with what your provider's dashboard shows."],
          result: "Authoritative answers from the DNS system itself",
        },
      ],
      limitations: [
        "Not implemented: no DNS queries are made from this page.",
        "Propagation is not a single event — different resolvers hold records for different TTLs.",
      ],
      faqs: [
        {
          q: "Why can't the browser just ask?",
          a: "DNS is not exposed to web pages. Browsers resolve names internally for navigation only, and there is no record-type API.",
        },
        {
          q: "What about DNS-over-HTTPS?",
          a: "Some providers expose it, but cross-origin restrictions and rate limits make it unreliable for a public tool.",
        },
      ],
    },
  },
  {
    slug: "http-header-checker",
    name: "HTTP Header Checker",
    category: "internet",
    tagline: "Inspect response headers, security policies and caching rules.",
    intent: "check http headers",
    keywords: ["http header checker", "response headers", "check security headers", "header analyzer", "http headers test", "csp checker"],
    status: "planned",
    actions: ["copy"],
    effort: "guided",
    popularity: 78,
    addedAt: "2025-02-22",
    seoTitle: "HTTP Header Checker — Planned, Needs a Server Fetch",
    seoDescription:
      "Reading another site's response headers requires a server-side fetch to avoid CORS. This tool is planned and clearly marked rather than faked.",
    content: {
      intro: [
        "JavaScript can only read a handful of response headers, and only for requests it is allowed to make. Checking whether a site sends Content-Security-Policy or HSTS needs a server that fetches the URL and reports what came back.",
        "This tool is therefore planned. The browser console's Network tab remains the fastest way to inspect headers for your own site today.",
      ],
      howTo: [
        "For your own site, open DevTools, go to the Network tab and inspect the document request.",
        "Alternatively, use curl -I https://example.com from a terminal.",
        "Once a fetch endpoint exists, this page will show the header set with explanations.",
      ],
      method: {
        title: "What the tool would check",
        paragraphs: [
          "The valuable part is not listing headers but explaining them: whether HSTS has a sensible max-age, whether CSP uses nonces rather than unsafe-inline, whether caching headers agree with each other, and whether the frame-ancestors policy matches your intent.",
          "That requires a server to make the request, because a browser will not let a page read arbitrary cross-origin response headers.",
        ],
      },
      examples: [
        {
          title: "Checking headers right now",
          steps: ["Run curl -sI https://example.com.", "Read the status line and headers.", "Look for strict-transport-security and content-security-policy."],
          result: "The full header set, straight from the server",
        },
      ],
      limitations: [
        "Not implemented: this page performs no requests.",
        "Header presence is not the same as correct configuration — a CSP with unsafe-inline still allows injection.",
      ],
      faqs: [
        {
          q: "Can JavaScript read response headers?",
          a: "Only a small CORS-safelisted subset (content-type, cache-control and a few others) and only for permitted requests.",
        },
        {
          q: "Which headers matter most?",
          a: "Strict-Transport-Security, Content-Security-Policy, X-Content-Type-Options, Referrer-Policy and the caching headers.",
        },
      ],
    },
  },
  {
    slug: "ssl-certificate-expiry-checker",
    name: "SSL Certificate Expiry Checker",
    category: "internet",
    tagline: "Check when a site's TLS certificate expires and who issued it.",
    intent: "check ssl certificate expiry",
    keywords: ["ssl expiry checker", "certificate expiry", "tls certificate checker", "ssl certificate lookup", "cert expiry date", "check cert"],
    status: "planned",
    actions: ["copy"],
    effort: "guided",
    popularity: 73,
    addedAt: "2025-02-23",
    seoTitle: "SSL Certificate Expiry Checker — Planned, Needs TLS Access",
    seoDescription:
      "Certificate details live in the TLS handshake, which browsers do not expose to JavaScript. This tool is planned and labelled honestly.",
    content: {
      intro: [
        "A certificate's expiry date is exchanged during the TLS handshake, before any page code runs. JavaScript cannot read it, and there is no browser API that exposes the peer certificate chain for an arbitrary host.",
        "Checking expiry therefore needs a server that opens a TLS connection and reports the certificate. This tool is planned rather than simulated.",
      ],
      howTo: [
        "For a quick check, click the padlock in your browser's address bar.",
        "For monitoring, use a service that polls the certificate and alerts you before it expires.",
        "For many domains, openssl s_client -connect host:443 gives the full chain from a terminal.",
      ],
      method: {
        title: "Why this is server-side",
        paragraphs: [
          "A server-side checker connects to port 443, reads the peer certificate, and reports notBefore, notAfter, issuer and subject alternative names. That is a straightforward TLS client task — and impossible from a sandboxed page.",
          "Given that expiry failures are one of the most common causes of avoidable outages, the eventual tool will focus on alerting rather than a one-off lookup.",
        ],
      },
      examples: [
        {
          title: "Checking a certificate today",
          steps: ["Open a terminal.", "Run openssl s_client -connect example.com:443 -servername example.com.", "Read notAfter from the output."],
          result: "Exact expiry timestamp and issuer",
        },
      ],
      limitations: [
        "Not implemented: no TLS connection is made from this page.",
        "Certificate transparency logs can reveal issuance, but not current deployment.",
      ],
      faqs: [
        {
          q: "Why can't the browser tell me?",
          a: "The certificate is handled by the network stack and is not exposed to page JavaScript, for security reasons.",
        },
        {
          q: "How often do certificates expire?",
          a: "Public certificates now have a maximum lifetime measured in months, so automated renewal and monitoring are essential.",
        },
      ],
    },
  },
  {
    slug: "website-status-checker",
    name: "Website Status Checker",
    category: "internet",
    tagline: "Check whether a site is up, and what status code it returns.",
    intent: "website status checker",
    keywords: ["website status checker", "is website down", "check site status", "website uptime", "site is down", "http status check"],
    status: "planned",
    actions: ["copy"],
    effort: "guided",
    popularity: 79,
    addedAt: "2025-02-23",
    seoTitle: "Website Status Checker — Planned, Requires a Server Probe",
    seoDescription:
      "Checking another site's availability from a web page is blocked by CORS and would lie about failures. This tool is planned and not simulated.",
    content: {
      intro: [
        "A page cannot reliably probe another domain: cross-origin requests are blocked, opaque responses hide the status code, and a failure in the browser tells you nothing about whether the site is down for everyone.",
        "Reporting “site is down” from such a check would be actively misleading, so this tool is marked as planned until a server-side probe with multiple vantage points exists.",
      ],
      howTo: [
        "For your own site, use an uptime monitor that probes from several regions.",
        "To check from here and now, open the URL in a new tab.",
        "Remember that a single failed request is not an outage — DNS, your network and the path in between all matter.",
      ],
      method: {
        title: "What a trustworthy check requires",
        paragraphs: [
          "Uptime monitoring makes periodic requests from more than one location, records status codes and latencies, and distinguishes a real outage from a single network path failing.",
          "That is a scheduled server job with storage and alerting. A browser tab can only answer “can I reach it from here, right now”.",
        ],
      },
      examples: [
        {
          title: "Sensible alternatives",
          steps: ["Use an uptime service for availability.", "Use the HTTP Status Code Reference to interpret what you see.", "Use your own browser to confirm from your network."],
          result: "Real answers instead of a guess dressed up as a check",
        },
      ],
      limitations: [
        "Not implemented: no probe is made.",
        "CORS prevents reading status codes from cross-origin requests in a normal page.",
      ],
      faqs: [
        {
          q: "Why not just fetch the URL?",
          a: "The browser blocks reading the response unless the target allows it, and a blocked request looks identical to a down server.",
        },
        {
          q: "What does the roadmap need?",
          a: "A scheduled prober with several vantage points and honest wording about what a probe can and cannot prove.",
        },
      ],
    },
  },
  {
    slug: "website-response-time-checker",
    name: "Website Response Time Checker",
    category: "internet",
    tagline: "Measure TTFB, load time and page weight for a URL.",
    intent: "website response time",
    keywords: ["website response time", "ttfb checker", "page speed test", "response time checker", "site speed", "load time checker"],
    status: "planned",
    actions: ["copy"],
    effort: "guided",
    popularity: 71,
    addedAt: "2025-02-24",
    seoTitle: "Website Response Time Checker — Planned, Needs Real Fetching",
    seoDescription:
      "Timing another site's response needs a server-side fetch to avoid CORS and to measure the server rather than your connection. Planned, not simulated.",
    content: {
      intro: [
        "Timing a third-party site from a web page measures your connection and the browser's CORS policy as much as the server. Without the ability to read the response, the numbers are noise dressed up as data.",
        "This tool is planned. For your own pages, the browser's Performance panel and Lighthouse give far better numbers than any external timer.",
      ],
      howTo: [
        "Open DevTools on your own page and use the Network panel's timing breakdown.",
        "Run Lighthouse for a repeatable score with explanations.",
        "Use a server-side monitor when you need numbers from other regions.",
      ],
      method: {
        title: "What the measurement would need",
        paragraphs: [
          "TTFB is server think-time plus one network round trip. Measuring it fairly means issuing the request from a controlled location, several times, and reporting a median rather than a single sample.",
          "Only a server can do that consistently, which is why this entry is honest about being unbuilt rather than showing a timer that measures nothing.",
        ],
      },
      examples: [
        {
          title: "Measuring your own site properly",
          steps: ["Open DevTools → Network.", "Reload with the cache disabled.", "Read TTFB, content download and total transfer size."],
          result: "Real timings including connection setup",
        },
      ],
      limitations: [
        "Not implemented: this page does not time anything.",
        "Single measurements are dominated by network variance; medians and percentiles are what matter.",
      ],
      faqs: [
        {
          q: "What is TTFB?",
          a: "Time to first byte: from the request being sent to the first byte of the response arriving. It bundles server processing and one round trip.",
        },
        {
          q: "Why is a browser timer unreliable?",
          a: "It includes your connection, DNS caching, CORS preflights and any proxy between you and the site.",
        },
      ],
    },
  },
  {
    slug: "redirect-checker",
    name: "Redirect Checker",
    category: "internet",
    tagline: "Trace a redirect chain and check for loops or mixed hops.",
    intent: "redirect checker",
    keywords: ["redirect checker", "check redirects", "redirect chain", "301 checker", "url redirect test", "redirect loop checker"],
    status: "planned",
    actions: ["copy"],
    effort: "guided",
    popularity: 77,
    addedAt: "2025-02-24",
    seoTitle: "Redirect Checker — Planned, Because Chains Need a Server",
    seoDescription:
      "Following a redirect chain means issuing requests the browser will not let a page inspect. This tool is planned and not faked with a single fetch.",
    content: {
      intro: [
        "A redirect chain is a sequence of HTTP responses, each with a Location header. Browsers follow them automatically and hide the steps; JavaScript cannot read the intermediate 301s, and CORS blocks the rest.",
        "Tracing a chain therefore needs a server that does not follow redirects automatically, so each hop can be reported. This tool is planned.",
      ],
      howTo: [
        "From a terminal, use curl -IL https://example.com to see each hop without following silently.",
        "In your CMS, audit redirect rules for chains and loops after any URL change.",
        "Keep chains to a single hop where possible — each additional hop costs latency and dilutes link equity.",
      ],
      method: {
        title: "What a redirect check reports",
        paragraphs: [
          "For each hop: the status code, the Location header, and whether it is permanent (301/308) or temporary (302/303/307). A chain ending in a 404 is a broken redirect, which is worse than no redirect at all.",
          "Loops are detected by remembering visited URLs. Mixed http/https hops and cross-domain hops are worth flagging too, since both leak referrer data or reset cookies.",
        ],
      },
      examples: [
        {
          title: "Auditing after a site move",
          steps: ["Collect the old URLs.", "Check each one resolves in a single hop.", "Replace double redirects with direct ones."],
          result: "One hop per old URL, no loops",
        },
      ],
      limitations: [
        "Not implemented: the page cannot trace hops.",
        "Client-side redirects (meta refresh, JavaScript) are invisible to HTTP-based checks.",
      ],
      faqs: [
        {
          q: "Why do redirect chains hurt?",
          a: "Each hop adds a round trip and some browsers stop after a handful. Search engines also discount long chains.",
        },
        {
          q: "Which codes pass the method through?",
          a: "307 and 308 preserve the method and body; 301 and 302 historically rewrite POST to GET.",
        },
      ],
    },
  },
];
