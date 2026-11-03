# Toolz build roadmap

Ultra-granular, start-to-finish plan. Every step below records **what it is**, **whether it
is done**, **why it exists**, **what it depends on / connects to**, and **how to verify it**.

- Source of truth for scope: [`docs/BLUEPRINT.md`](docs/BLUEPRINT.md) (the original plan and
  its 87-page PDF twin).
- Live code: this repository. Counts quoted here are derived from the registry, not typed
  by hand — `liveTools.length` is currently **254** across **12** live categories.
  Planned entries are likewise derived: `categories.ts` filters the registry for
  `status === "planned"`, so the public roadmap cannot drift from the catalogue.
- Status key: ✅ done · 🟡 partially done / needs a human pass · ⬜ not started ·
  ⛔ blocked on something outside the repo (owner, domain, third party).

> **Rule that shapes this whole document:** a step is only ✅ when it is verifiable in the
> repo. Anything that needs a browser, a real domain, a third-party account or a lawyer is
> recorded as 🟡/⛔ with the exact action required, never marked done.

---

## Phase 0 — Product definition

| # | Step | Status |
| --- | --- | --- |
| 0.1 | Read the blueprint README and the 87-page PDF; extract scope, rules and constraints | ✅ |
| 0.2 | Resolve blueprint ambiguity (tool names, ad rules, hosting) into decisions | ✅ |
| 0.3 | Write the product requirements document with audience and jobs to be done | ✅ |
| 0.4 | Fix the initial launch portfolio (40 tools) and category taxonomy | ✅ |
| 0.5 | Define the editorial quality bar every tool page must meet | ✅ |

**0.1 — Extract the plan.**
*Why:* the blueprint is the product's constitution — catalogue, policy rules, monetisation
limits, SEO strategy. Building without it produces a generic tool site that cannot pass an
AdSense review. *Connects to:* `docs/BLUEPRINT.md`, `alltools.pdf`.
*Verify:* blueprint preserved verbatim at `docs/BLUEPRINT.md`; PDF text extracted and
cross-checked for requirements the README stated differently.

**0.2 — Decide what the blueprint leaves open.**
*Why:* the plan names tools loosely and mentions a starter kit that is not in this
repository. Ambiguity at this stage becomes rework later. Decisions taken (see
[Decision log](#decision-log)): hand-rolled Tailwind v4 design system instead of shadcn/ui;
keep the slugs already in use even where they differ from the blueprint's display names;
static export instead of a server; no paid APIs anywhere.

**0.3 — PRD.** *Why:* forces explicit choices about who the tool is for and what "done"
means; catches scope creep before it is written into code. *Connects to:* `docs/PRD.md`.

**0.4 — Launch portfolio.** *Why:* a directory of half-built tools is the fastest way to
fail both users and an AdSense review. 40 tools was the blueprint's bar; the catalogue test
enforces it as a floor, so the site can never regress below it. *Connects to:*
`src/lib/tools/data/*.ts`, `tests/catalogue.test.ts`.

**0.5 — Editorial bar.** *Why:* Google's helpful-content guidance and AdSense's
"minimum content" policy both punish thin pages. Encoding the bar as tests means new tools
cannot be added thin. *Connects to:* `tests/catalogue.test.ts` (SEO title ≤65 chars,
description 70–175 chars, ≥3 how-to steps, ≥2 worked examples, ≥2 limitations, ≥3 unique
FAQs).

---

## Phase 1 — Platform foundation

| # | Step | Status |
| --- | --- | --- |
| 1.1 | Scaffold Next.js 16 + React 19 + TypeScript (strict) + Tailwind v4 | ✅ |
| 1.2 | Configure static export, trailing slashes, unoptimised images | ✅ |
| 1.3 | Build the design system (CSS variables, dark mode, component classes) | ✅ |
| 1.4 | Typography, spacing, colour contrast, focus states | ✅ |
| 1.5 | Layout shell: header, ⌘K search trigger, footer, breadcrumbs | ✅ |
| 1.6 | Site configuration module (URL, name, nav, footer, env flags) | ✅ |
| 1.7 | Tool data model (`ToolDefinition`, `CategoryDefinition`) | ✅ |
| 1.8 | Category taxonomy: 12 categories, all 12 live | ✅ |
| 1.9 | Registry with derived helpers (live, by category, popular, recent, related) | ✅ |
| 1.10 | Tool page template (SEO, JSON-LD, sidebar, related tools, FAQ accordion) | ✅ |
| 1.11 | Lazy-loading tool component registry (one bundle per tool) | ✅ |
| 1.12 | Dark/light theme toggle with system preference and persistence | ✅ |
| 1.13 | Visual identity: "Studio" design system (Bricolage/Inter Tight/JetBrains Mono pairing, colour-coded category tiles, white cards on warm canvas, soft depth) | ✅ |

**1.1 — Stack.** *Why:* the blueprint's stack is Next.js + TypeScript + Tailwind. Strict
TypeScript catches tool-logic bugs (unit unions, discriminated results) at compile time.
*Verify:* `npx tsc --noEmit` exits 0.

**1.2 — Static export.** *Why:* hosting-independent, cheap, no server to breach, and it
proves the "nothing is uploaded" claim — there is no backend to upload to.
`trailingSlash: true` keeps paths consistent across static hosts. *Connects to:*
`next.config.ts`, every `generateStaticParams`.
*Verify:* `npm run build` emits `out/` with 73 prerendered HTML files; no route handler
exists anywhere in `src/app`.

**1.3 — Design system.** *Why:* consistent controls make 41 tools feel like one product
instead of 41 mini-apps; CSS variables make dark mode a one-class change.
*Connects to:* `src/app/globals.css` (`.btn`, `.input`, `.chip`, `.card`, `.link`,
`.prose-tool`, `.md-preview`, `--page`, `--surface`, `--border`, `--text*`), consumed by
`src/components/ui.tsx`.

**1.4 — Accessibility baseline.** *Why:* the accessibility page makes a promise; the
markup has to keep it. Focus rings, 44px touch targets, semantic headings and labelled
inputs are cheaper to build in than to retrofit. *Verify:* one `<h1>` per page, every input
labelled, no icon-only control without an accessible name (audited across all routes).

**1.5 — Shell.** *Why:* search is the primary navigation for a tool directory; putting it
behind ⌘K *and* a visible button means both keyboard users and first-time visitors find it.

**1.6 — Site config.** *Why:* one module owns the canonical URL so canonicals, sitemap,
robots and JSON-LD can never disagree. *Connects to:* `src/lib/site.ts` →
`sitemap.ts`, `robots.ts`, `manifest.ts`, breadcrumbs, article/software JSON-LD.

**1.7–1.8 — Model and taxonomy.** *Why:* typed content means the page template can render
any tool from data alone, and the catalogue test can validate every page without rendering
it. Planned categories (images, PDF, education, internet, business) are declared but hold
no fake tools.

**1.9 — Registry.** *Why:* `liveTools`, `toolCountByCategory`, `recentlyAdded`,
`relatedTools` are derived, never hand-written, so the homepage, directory, category pages,
roadmap and footer counts can never drift apart.

**1.10 — Tool page template.** *Why:* the template is the SEO and trust surface: H1,
tagline, the working tool itself, "nothing is uploaded" note, about/how-to/method/examples/
limitations/FAQ, related tools, breadcrumb + `SoftwareApplication` + `FAQPage` JSON-LD.
*Why JSON-LD:* eligibility for rich results without inventing ratings or reviews.

**1.11 — Code splitting.** *Why:* first-load JS stays flat as the catalogue grows toward
271 tools; a visitor downloading the CSV-to-JSON tool should not pay for the image
compressor. *Connects to:* `src/tools/registry.tsx` (`dynamic(() => import(...))` with a
skeleton fallback), enforced by the catalogue test's slug↔component bijection.

**1.12 — Theme toggle.** *Why:* long working sessions in front of text tools; respects
`prefers-color-scheme` and persists the choice in `localStorage`.

**1.13 — Visual identity.** *Why:* a utility site is judged in the first two seconds, and a
generic dashboard look signals "template" before anyone reads a word. The site is therefore
art-directed as an editorial catalogue: warm paper stock, ink, a single signal orange,
hairline rules, 2 px corners, no shadows, and a self-hosted three-family type system
(Bricolage Grotesque for display, Inter Tight for text, JetBrains Mono for metadata).
Numbered sections and the hover-inverting tool index give it a contents-page rhythm.
*Connects to:* `src/app/globals.css` (tokens and signature components), `next/font`-free
`@fontsource-variable` imports in `layout.tsx`, and every route, since the old component
classes (`.card`, `.btn`, `.input`, `.chip`) were redefined rather than removed.
*Verify:* token contrast passes WCAG AA (body 15.8:1, muted 7:1, mono 4.7:1); fonts are
bundled in `out/_next/static/media` (16 woff2 files, no third-party request); build and
tests unchanged.

---

## Phase 2 — Pure logic layer (the part that must be right)

| # | Step | Status |
| --- | --- | --- |
| 2.1 | Text utilities (counts, case, dedupe, sort, whitespace, slug, replace, lorem, diff) | ✅ |
| 2.2 | Calculator logic (percentages, discounts, VAT, age, date spans, statistics, GPA) | ✅ |
| 2.3 | Finance logic (loan payment + schedule, compound interest, margin, ROI) | ✅ |
| 2.4 | Unit and temperature conversion, time zones | ✅ |
| 2.5 | Developer logic (JSON, Base64, URL, HTML entities, hashes, UUID, JWT, timestamps, colour) | ✅ |
| 2.6 | Search ranking/scoring for the command palette | ✅ |
| 2.7 | Result types that never throw at the UI boundary | ✅ |
| 2.8 | Derive every worked example from the code, not by hand | ✅ |

**2.1–2.6 — Why pure functions.** No React, no DOM, no network: the same function the
browser runs is the one the tests run, so a passing suite is real evidence rather than a
mock's opinion. *Connects to:* `src/lib/{text,calc,finance,units,dev,regex,timezone,diff,search}.ts`.

**2.7 — No throwing.** *Why:* a thrown error in a client component blanks the tool. Every
parser returns `{ error }` and the component renders an inline, labelled message next to
the result region — no alert boxes, no lost input.

**2.8 — Generated examples.** *Why:* a hand-written example is a lie waiting to happen. A
patch pass found the standard-deviation page claiming σ = 8.30 when the code produces 8.70;
the copy was corrected from the code's output and a test now pins the numbers.
*Connects to:* `tests/calc.test.ts`, `tests/finance.test.ts`, `src/lib/tools/data/*.ts`.

---

## Phase 3 — Launch portfolio: 41 tools

Status of every shipped tool: ✅ implemented, registered, documented and covered by a
worked example. The list is the actual registry contents.

| Category | Tools |
| --- | --- |
| **Text** (10) | word-counter · case-converter · duplicate-line-remover · text-reverser · alphabetical-text-sorter · remove-extra-spaces · text-to-slug-converter · find-and-replace · lorem-ipsum-generator · text-diff |
| **Calculators** (9) | percentage-calculator · percentage-increase-decrease-calculator · discount-calculator · vat-calculator · age-calculator · days-between-dates-calculator · average-calculator · standard-deviation-calculator · gpa-calculator |
| **Developer** (9) | json-formatter · base64-encoder-decoder · url-encoder-decoder · html-entity-encoder · hash-generator · uuid-generator · jwt-decoder · timestamp-converter · color-code-converter |
| **Finance** (4) | loan-calculator · compound-interest-calculator · profit-margin-calculator · roi-calculator |
| **Everyday** (4) | unit-converter · temperature-converter · time-zone-converter · bmi-calculator |
| **SEO** (4) | serp-snippet-previewer · utm-link-builder · keyword-density-analyzer · robots-txt-generator |
| **Security** (1) | password-generator |

Definition of done per tool (all seven required, checked by the catalogue test plus a manual
pass):

1. Pure logic function with typed result.
2. Component wired to it — live result as you type, no "Calculate" wall where instant is
   possible.
3. Worked example whose numbers come from the function.
4. Limitations written honestly (rounding, jurisdiction, precision, what the tool does not
   claim to do).
5. ≥3 FAQs answering the questions the tool's own users ask.
6. Fixed-height layout so results do not shove the page around; copy button on output.
7. Error state for empty/invalid input, announced to assistive tech.

> **Why this order matters:** every tool in this list produces a real result in the
> browser. Tools that need a server, a paid API or a library that cannot run client-side
> (PDF editing, OCR, most image conversion) are deliberately **not** in the registry.

---

## Phase 4 — Trust, content and discovery surfaces

| # | Step | Status |
| --- | --- | --- |
| 4.1 | Homepage: search, popular, recently added, categories, "how it works", FAQ | ✅ |
| 4.2 | Tools directory with client-side filter/search | ✅ |
| 4.3 | Category index and category detail pages | ✅ |
| 4.4 | Global search dialog (keyboard nav, recents, empty state) | ✅ |
| 4.5 | Tool page content blocks (about, how-to, method, examples, limitations, FAQ) | ✅ |
| 4.6 | Four editorial guides with related tools | ✅ |
| 4.7 | About page (what the site is, how tools are built, how they are tested) | ✅ |
| 4.8 | Contact page with working no-backend mailto flow | ✅ |
| 4.9 | Privacy policy, cookie policy, terms, disclaimer | ✅ |
| 4.10 | Accessibility statement and editorial policy | ✅ |
| 4.11 | Public roadmap page derived from live data | ✅ |
| 4.12 | Sitemap, robots.txt, manifest, 404 page | ✅ |
| 4.13 | Consent-gated analytics (off by default) | ✅ |
| 4.14 | Ad slots that render nothing until ads are enabled | ✅ |

**4.6 — Guides.** *Why:* four genuinely useful explainers (reading time, percentage change
vs percentage points, encoding vs encryption, choosing a password) give the site original
editorial content and internal links into the tools. They are written here, not scraped or
spun, which is a requirement in the blueprint. *Connects to:* `src/lib/guides.ts`,
`src/app/guides/[slug]/page.tsx` (Article JSON-LD, `dynamicParams = false`).

**4.8 — Contact.** *Why:* a contact method is an AdSense requirement, and a half-working
form endpoint is worse than none. The form validates locally, then opens the visitor's own
mail client with the message pre-filled; "Copy address" is offered as a fallback.
*Owner action:* replace `hello@toolz.name.ng` in `src/lib/site.ts` with a real,
monitored mailbox before launch.

**4.9–4.10 — Legal and policy pages.** *Why:* required for trust, ads and accessibility
claims. They are written as accurate descriptions of what the code does (no analytics by
default, no uploads, localStorage for theme/search recents/consent) and are explicitly
marked as templates needing legal review for the operator's jurisdiction.

**4.11 — Roadmap page.** *Why:* the blueprint forbids presenting unfinished work as
finished. A public page that shows live counts per category and the honest status of future
categories turns "coming soon" into verifiable progress. *Connects to:*
`toolCountByCategory`, `src/lib/tools/categories.ts` (planned categories flagged).

**4.12 — Discovery files.** *Why:* `sitemap.xml` is generated from the same registry as the
pages (so it cannot list a 404); `robots.txt` points at it; `manifest.webmanifest` gives the
site a name and colour on mobile; `404.html` is what a static host serves for unknown paths.

**4.13 — Analytics.** *Why:* aggregate usage tells you which tools to invest in, but
analytics that loads before consent is a privacy-policy contradiction. With no
`NEXT_PUBLIC_GA_ID` the site loads zero third-party scripts; with one, the loader waits for
an explicit "Accept" and records only tool slugs and coarse outcomes.

**4.14 — Ad slots.** *Why:* the blueprint forbids ads before approval, and a broken ad slot
is a layout bug. `AdSlot` renders `null` unless `NEXT_PUBLIC_ADS_ENABLED === "true"` **and**
a publisher ID exists; slots are fixed-height to prevent layout shift; and a slot with no
configured ad unit id renders nothing (no empty ad frames). The AdSense loader is behind the
same consent gate as analytics.

---

## Phase 5 — Quality gates

| # | Step | Status |
| --- | --- | --- |
| 5.1 | Vitest configured for the `src/lib` layer | ✅ |
| 5.2 | Text suite (38 tests) | ✅ |
| 5.3 | Calculator suite (22 tests) | ✅ |
| 5.4 | Finance suite (18 tests) | ✅ |
| 5.5 | Unit-conversion suite (13 tests) | ✅ |
| 5.6 | Developer suite (25 tests) | ✅ |
| 5.7 | Search suite (9 tests) | ✅ |
| 5.8 | Catalogue + guides suite (14 tests) | ✅ |
| 5.9 | `typecheck` + `test` + `build` in one `npm run check` | ✅ |
| 5.10 | Manual browser QA of all 254 tools (Chrome, Firefox, Safari, mobile) — the jsdom interaction sweep already covers mechanics for every tool | 🟡 |
| 5.11 | Lighthouse / Core Web Vitals on a real deployment | ⬜ |
| 5.12 | Screen-reader pass (VoiceOver and NVDA) | ⬜ |
| 5.13 | Automated end-to-end smoke test (Playwright) | ⬜ |
| 5.14 | Visual regression baselines | ⬜ |

**5.1–5.8 — Unit suites.** 139 tests over 7 files; see
[`docs/TESTING.md`](docs/TESTING.md) for what each covers and the specific regressions they
were written to catch (percentage density denominator, HSL parsing, inclusive business-day
counts, wrong worked-example numbers, a live tool with no component).
*Verify:* `npm test` → 7 files, 139 passed.

**5.10 — Manual browser QA.** 🟡 *Why it is not ✅:* no browser exists in the build
sandbox, so the interactive behaviour (typing, copy, download, drag-drop for text files,
keyboard order, mobile keyboards) has been verified only structurally — every route
returns 200, there is one H1, all inputs are labelled, and no internal link is broken
(71 pages crawled). A human pass with the checklist in `docs/TESTING.md` is the remaining
work. *Blocked by:* a device/browser session, not by code.

**5.11–5.14 — Measurement and E2E.** ⬜ *Why:* Lighthouse numbers are meaningless without
the real domain and network; Playwright needs browser binaries that are not available in
this environment. Both are the first things to add once a real deploy exists.

---

## Phase 6 — Launch

| # | Step | Status |
| --- | --- | --- |
| 6.1 | Set `NEXT_PUBLIC_SITE_URL` to the production origin | ⛔ |
| 6.2 | Replace the placeholder contact email with a monitored mailbox | ⛔ |
| 6.3 | Legal review of privacy/terms/cookies/disclaimer | ⛔ |
| 6.4 | Choose host with terms that allow advertising (not Vercel Hobby) | ⛔ |
| 6.5 | Deploy `out/` and smoke-test every route on the real domain | ⬜ |
| 6.6 | Verify canonicals, sitemap and robots on the live domain | ⬜ |
| 6.7 | Google Search Console: verify, submit sitemap, watch coverage | ⬜ |
| 6.8 | Bing Webmaster Tools submission | ⬜ |
| 6.9 | 30 days of monitoring before applying for AdSense | ⬜ |

**6.1–6.4 — Owner actions.** *Why blocked:* these need a domain, a mailbox, a lawyer or a
hosting decision — none of which can be invented in code. The blueprint is explicit: never
invent a publisher ID, a legal claim or an email address.

**6.5–6.6 — Deploy verification.** *Why:* static export gets a lot right, but trailing
slashes, 404 handling and canonical hosts are host-specific. *Verify:* the smoke list at the
end of this document on the production URL, and `curl -I https://your-domain/tools/word-counter/`
returns 200 with the expected canonical.

**6.7–6.8 — Indexing.** *Why:* no amount of on-page work matters if the sitemap is never
read. Submitting also surfaces crawl errors early, while the site is still small.

**6.9 — Patience.** *Why:* AdSense reviewers look for a site with history, real content and
traffic patterns. Applying on day one with zero indexed pages is the most common rejection
reason in the blueprint's list.

---

## Phase 7 — Monetisation (only after approval)

| # | Step | Status |
| --- | --- | --- |
| 7.1 | Understand the rules that constrain placement (recorded in `docs/ADSENSE_QA.md`) | ✅ |
| 7.2 | Ad component that is inert by default and fixed-height when active | ✅ |
| 7.3 | Complete the pre-application audit with evidence | 🟡 |
| 7.4 | Apply for AdSense (owner only) | ⛔ |
| 7.5 | Paste the publisher ID into the host's environment | ⛔ |
| 7.6 | Add the exact AdSense `ads.txt` seller line | ⛔ |
| 7.7 | Consent management platform for EEA/UK/CH traffic | ⬜ |
| 7.8 | Enable ads per slot, then review layout shift and policy compliance | ⬜ |

**7.2 — Inert by default.** *Why:* shipping live ad code before approval breaks the
blueprint's rules and can trip "ads on a site under review". *Connects to:*
`src/components/ad-slot.tsx`, `siteConfig.adsEnabled`.

**7.3 — Audit.** 🟡 The repo-side evidence is complete; the audit cannot be signed off until
a real domain exists (every check that references the live site is 🟡 or ⛔ there).

**7.6 — `ads.txt`.** *Why:* an invented or guessed seller line is worse than an empty file —
it can invalidate authorised-seller status. `public/ads.txt` therefore contains only an
explanatory comment until Google supplies the real line.

**7.7 — CMP.** *Why:* Google requires a certified CMP for personalised ads in the EEA, UK
and Switzerland. Analytics consent already exists in `src/components/analytics.tsx`, but a
certified CMP (or Google's own consent message) must be added before ads are switched on for
those regions.

---

## Phase 8 — Expansion toward the full catalogue

Only categories that can run entirely in the browser without a paid API are eligible.

| # | Step | Status |
| --- | --- | --- |
| 8.1 | Image tools (client-side canvas: compress, resize, convert, favicon) — 20 live | ✅ |
| 8.2 | PDF tools — pdf-lib spike, then 19 live tools | ✅ |
| 8.3 | Education tools (citation, reading level, study timers) — 18 live | ✅ |
| 8.4 | Internet tools (URL parsing, subnet maths, UA parsing — no third-party calls) — 10 live | ✅ |
| 8.5 | Business tools (invoice totals, break-even, pricing, marketing) — 19 live | ✅ |
| 8.6 | Bulk/batch workflows and keyboard-first power features | ⬜ |
| 8.7 | Optional PWA offline caching of recently used tools | ⬜ |
| 8.8 | Localisation (start with a single additional locale, reviewed by a native speaker) | ⬜ |

### Blueprint coverage by section

| Section | Theme | Blueprint slots | Live now | Notes |
| --- | --- | --- | --- | --- |
| A | Text and writing | 25 | 23 | Combined encoder/decoder and find-and-replace slugs cover two slots each |
| B | Calculators and mathematics | 30 | 28 | Scientific, matrix, fraction and probability calculators all shipped |
| C | Finance and business | 25 | 26 | Includes the offline currency converter, so this section runs one over |
| D | Image tools | 20 | 20 | Canvas and WASM-free: compress, resize, convert, crop, EXIF, favicon |
| E | PDF and documents | 20 | 19 | Password protection remains planned — pdf-lib cannot encrypt |
| F | Developer and programming | 30 | 30 | Formatters, validators, hashes, JWT, regex, cron-free utilities |
| G | Internet and networking | 20 | 10 | Eight live checks need a server; see the note below |
| H | SEO and website management | 24 | 24 | Static audits plus the SERP/schema generators |
| I | Education | 20 | 18 | Citations, GPA, flashcards, study planning |
| J | Everyday and lifestyle | 23 | 25 | Cooking, fuel, sleep, dates, world clock |
| K | Business, marketing, productivity | 21 | 19 | Break-even and sales commission already existed in finance |
| L | Security and privacy | 12 | 12 | Hashing, passwords, passphrases, encoding, privacy policies |

**What stays planned, and why.** Ten catalogue entries are `status: "planned"`: URL
shortener, IP information, DNS lookup, HTTP header checker, TLS expiry, website status and
response-time probes, redirect tracer (8), the broken-link checker and the PDF password
tool. The first eight need to make an outbound request and read a response, which a static
site served over HTTPS cannot do for arbitrary third-party hosts — browsers block those
cross-origin reads and there is no backend to proxy them. The PDF password tool needs
audited encryption that `pdf-lib` does not provide. They are catalogued, gated behind
`notFound()`, and listed as planned; no page claims to perform a live check it cannot make.

**8.2 — Why a spike first.** *Why:* PDF editing is the most common trap in this product
category — the good libraries are not free for commercial use or blow up the bundle. No PDF
tool ships until the licence, bundle size and client-side viability are proven.
*Connects to:* the blueprint's rule against tools that cannot actually do the job.

**8.7 — PWA.** *Why:* the "runs in your browser" claim gets much stronger if a tool works
with the network off. It needs a deliberate cache strategy (stale-while-revalidate for
assets, network-first for HTML) so updates are not stuck behind an old service worker.

---

## Completed / pending / blocked — at a glance

**Completed (verifiable in the repo):** product definition and PRD; static Next.js
foundation; design system with dark mode; header/footer/search/breadcrumb shell; data model
and 12-category taxonomy; **254 live tools across 12 live categories** (text 23, calculators
28, finance 26, developer 30, everyday 25, SEO 24, images 20, PDF 19, education 18, security
12, internet 10, business 19), each with editorial content; every tool runs client-side with
no backend calls and no third-party APIs — including PDF editing (pdf-lib), DOCX text
extraction, image processing, hashing, code formatting, QR generation and decoding, and an
offline currency converter that uses rates the visitor supplies; tool page template with
JSON-LD; code-split tool registry; **971 automated tests across 27 suites**, including an interaction sweep that types into every
field and clicks every button in all 254 tools, known-answer checks through the real UI, a render
smoke test over every tool component and unit tests for every logic module; homepage,
directory, category, guide, about, contact, roadmap and six policy pages; sitemap, robots,
manifest, 404; consent-gated analytics; inert ad slots; public documentation (README, PRD,
testing guide, AdSense audit).

**Since the rebrand to "Tools":** the site name, copy, storage keys and docs all use "Tools";
the twelve category cards carry hand-drawn inline SVG vignettes; multi-mode calculators are
use the hub layout (`src/components/tools/mode-hub.tsx`) so every answer is visible at once;
twelve tools are converted, including percentage, VAT, product pricing, profit margin, standard
deviation, BMI, base64, URL encoding, HTML entities, Roman numerals, text reversal and hashing; and the discovery layer is complete:
`pageMetadata()`/`toolMetadata()` helpers with per-page keyword clusters, absolute canonicals,
hreflang plus RSS/markdown alternates, 1200×630 OG images per category, a registry-driven
`sitemap.xml` with image entries, `robots.txt` that allows CSS/JS and names the AI crawlers,
`/llms.txt`, `/feed.xml`, and JSON-LD for WebSite, Organization, WebPage, CollectionPage,
ItemList, SoftwareApplication + Offer, FAQPage, Article and BreadcrumbList.

**Pending (code work, no external dependency):** manual browser QA of all 254 tools;
Lighthouse/CWV measurement; screen-reader pass; Playwright smoke tests; visual regression
baselines; certified CMP integration; PWA offline caching; localisation; bulk/batch
workflows. The ten planned entries above stay planned until the site gains a server-side
component or an audited client-side encryption path — flipping them to `live` without that
would mean either a fake check or a third-party API, both of which the blueprint forbids.

**Blocked (needs an owner decision or an external account):** real domain and
`NEXT_PUBLIC_SITE_URL`; monitored contact mailbox; legal review of the policy pages;
advertising-compatible host; deploy and production smoke test; Search Console and Bing
verification; AdSense application, publisher ID and `ads.txt` seller line; paid-tier
decision if traffic grows past static-hosting limits.

---

## Decision log

| Date | Decision | Why |
| --- | --- | --- |
| Phase 0 | Keep the blueprint as `docs/BLUEPRINT.md`; write a new README | Preserves the source plan while giving developers an accurate map of the built app |
| Phase 0 | Slugs stay as implemented, even where they differ from blueprint display names | Canonical URLs cost SEO equity to change; display names are copy, slugs are infrastructure |
| Phase 1 | Hand-rolled Tailwind v4 components instead of shadcn/ui | The starter referenced by the blueprint is not in the repo; fewer dependencies, full control of the design system |
| Phase 1 | `output: "export"` static build | No server to breach or pay for, and it structurally guarantees no data leaves the browser |
| Phase 1 | Tool content lives in `src/lib/tools/data`, logic in `src/lib` | Testable without a DOM; the page template renders any tool from data |
| Phase 2 | Pure functions return `{ value } | { error }` | A thrown error blanks a client tool; typed results force a helpful UI |
| Phase 2 | Worked examples are generated from code | A hand-written example had already drifted from the implementation |
| Phase 4 | `mailto:` contact form, no form endpoint | A half-working endpoint loses messages; the honest flow is one click and no secrets |
| Phase 4 | Analytics off unless both a GA ID and consent exist | Keeps the privacy policy true and the default build third-party-free |
| Phase 5 | One test suite per logic module + a catalogue suite | Fast feedback per module, plus an editorial guardrail that cannot be bypassed by a new tool |
| Phase 7 | `ads.txt` stays comment-only | An incorrect seller line can invalidate authorised-seller status |

---

## Definition of done for the product (not just the code)

1. Every listed tool produces a correct result on the device it runs on. ✅ *(logic proven;
   browser confirmation pending — 5.10)*
2. Every page has one purpose, one H1 and original copy. ✅
3. No visitor data leaves the browser unless they opt in. ✅
4. The site is indexable, crawlable and has a working sitemap. ✅
5. Ads appear only after approval, never adjacent to a control or result. ✅ *(enforced in
   code; slot review pending — 7.8)*
6. Any claim on the site can be traced to code or a policy document. ✅
7. New tools cannot be added below the quality bar. ✅ *(catalogue test)*

## Post-launch smoke test (run on the production domain)

```bash
for p in / /tools/ /categories/ /guides/ /roadmap/ /about/ /contact/ /privacy-policy/ \
         /terms/ /disclaimer/ /cookies/ /accessibility/ /editorial-policy/ \
         /tools/word-counter/ /tools/percentage-calculator/ /tools/json-formatter/ \
         /sitemap.xml /robots.txt /manifest.webmanifest /llms.txt /feed.xml; do
  printf "%s  %s\n" "$(curl -s -o /dev/null -w '%{http_code}' https://YOUR-DOMAIN$p)" "$p"
done
```

Then: search for `example.com` in the page source of three tool pages (must be absent), run
two tools end to end in a private window, and confirm the consent banner appears only when a
GA ID is configured.
