# Toolora — Product requirements

| | |
| --- | --- |
| **Status** | Live: 254 tools, 12 categories, 4 guides |
| **Owner** | Site operator (see `src/lib/site.ts`) |
| **Last updated** | Phase 5 of [`ROADMAP.md`](../ROADMAP.md) |
| **Source plan** | [`BLUEPRINT.md`](./BLUEPRINT.md) |

---

## 1. Problem

People need small, disposable digital tasks done — count words before submitting a form,
check what a discount really saves, decode the JWT that is failing, work out a loan payment,
turn a title into a URL slug. Today they:

- search for a tool and land on a page that is **mostly advertising**, with the actual input
  buried under three interstitials;
- find a "free" tool that demands a sign-up, an email, or a download;
- paste a document into a form with no idea where it goes, or whether it is retained;
- hit a tool that is visibly broken, half-built, or behind a paywall teaser.

The cost of failure is not just annoyance: a wrong percentage or a mis-parsed date can go
straight into a contract, an invoice or a form.

## 2. Product

**Toolora is a directory of small, instant, browser-local utilities with honest
documentation.**

Three promises, and the code enforces each one:

1. **Instant.** Results update as you type; no "Calculate" wall, no queue, no page reload.
2. **Local.** Every computation happens in the tab. There is no backend in the product to
   receive input — the build is a static export.
3. **Honest.** Every tool page states what the tool does, how it computes, what it does not
   handle, and what the limitations are. Worked examples come from the implementation.

## 3. Audience

| Persona | Situation | What they need | Where they land |
| --- | --- | --- | --- |
| **Deadline Dara** — student or office worker | Submitting an essay, form or application in ten minutes | Word/character count, case fix, duplicate removal, slug | Text tools, homepage search |
| **Analyst Ada** — ops, marketing or finance generalist | Needs a number now: discount, VAT, margin, loan, growth | A calculator that shows the formula and the steps | Calculators, finance |
| **Developer Dev** — engineer mid-debug | Payload is broken; token is expired; colour contrast fails | JSON/Base64/JWT tools with error messages that explain themselves | Developer |
| **Marketer Mo** — small-business marketer | Writes titles, checks SERP length, builds campaign URLs | Preview and validation, not just transformation | SEO |
| **Cautious Chris** — privacy-conscious professional | Will not paste client data into a random website | A visible, specific privacy statement plus a design that makes it true | Any tool → privacy policy |

Common thread: **short, high-intent sessions on a phone or a work laptop**, often arriving
from a search result for one specific task. The product must be useful within seconds of
arrival, without a tutorial.

## 4. Jobs to be done

- *When I need a number fixed for a document,* I want a calculator that shows its working,
  so I can trust the figure enough to paste it into something that matters.
- *When I paste text that may be confidential,* I want to know exactly what happens to it,
  so I can use the tool without asking permission first.
- *When I arrive from a search,* I want the input to be the first thing I see, so I do not
  have to hunt through advertising.
- *When a tool gives a strange result,* I want to know whether it is my input or its
  rounding, so I can decide whether to trust it.
- *When I need a tool that does not exist yet,* I want to understand what is coming and
  when, rather than see a fake "coming soon" tool.

## 5. Principles (in priority order)

1. **Correct over clever.** A conservative, documented approximation beats an undocumented
   magic number. When the domain is ambiguous (VAT rates, GPA scales, business-day
   holidays), the tool explains the assumption.
2. **Usable in one screen.** Input, result and an explanation of the result without
   scrolling on a laptop; on mobile, the result is never below the fold.
3. **Nothing hidden.** No uploads, no sign-up, no autoplay, no interstitials, no fake
   scarcity, no "download our app" detour.
4. **Honest status.** Nothing is labelled live until it works; the roadmap page shows
   planned work as planned.
5. **Boring technology.** Static export, no runtime dependencies in the logic layer, no
   third-party calls at rest.

## 6. Scope

### In scope (built)

- 254 tools across all twelve categories: text, calculators, finance, developer, everyday,
  SEO, security, images, PDF, internet, education and business.
- Homepage with search, popular and recent tools, category grid, FAQ.
- Tools directory with client-side search and category filters.
- Category index and per-category pages.
- Tool page template: tool, about, how-to, method (with formula), worked examples,
  limitations, FAQ, related tools.
- Four editorial guides: reading time, percentage points, encoding vs encryption, password
  choice.
- About, contact, privacy, cookies, terms, disclaimer, accessibility, editorial policy,
  public roadmap.
- Command-palette search (⌘K / Ctrl-K), recents in `localStorage`.
- Consent-gated analytics, inert ad slots, sitemap/robots/manifest/404.

### Out of scope (deliberately)

| Excluded | Why |
| --- | --- |
| Accounts, saved history, sync | Would require a backend and personal data; contradicts the privacy promise |
| Server-side file processing (PDF editing, OCR, video) | Needs compute, storage and a cost model the blueprint rules out |
| Paid APIs (exchange rates, AI generation, geolocation) | Blueprint forbids unnecessary paid dependencies; also creates a data-sharing third party |
| User-generated content, comments, forums | Moderation burden and AdSense risk with no product need |
| Native apps | The web app already works on every device; an app adds a distribution surface with no new capability |
| Dark-pattern growth (exit intent, notification prompts, forced sharing) | Directly contradicts principle 3 |

### Planned (see roadmap phases 7–8)

Image tools (canvas-based), PDF tools (after a licence/feasibility spike), education,
internet and business tools; certified CMP; PWA offline caching; a second locale.

## 7. Functional requirements

### 7.1 Tool page (all 41)

| ID | Requirement | Verified by |
| --- | --- | --- |
| T1 | One H1 matching the tool name; tagline directly below | Route audit |
| T2 | The working tool appears before any prose or ad slot | Template review |
| T3 | Result updates without a submit action where the computation is cheap | Manual QA |
| T4 | Invalid input produces an inline, labelled message — never a blank panel or a thrown error | Unit tests + manual QA |
| T5 | A copy control exists for any produced text/number | Manual QA |
| T6 | Copy button confirms success, and fails safely when the clipboard API is unavailable | Manual QA |
| T7 | "Nothing you type is uploaded" note next to the tool, with a report-a-problem link | Route audit |
| T8 | About, how-to (≥3 steps), method with formula where applicable, ≥2 worked examples, ≥2 limitations, ≥3 FAQs | `tests/catalogue.test.ts` |
| T9 | Breadcrumbs and `BreadcrumbList`, `SoftwareApplication`, `FAQPage` JSON-LD | Source review |
| T10 | Canonical URL and OpenGraph/Twitter metadata derived from `NEXT_PUBLIC_SITE_URL` | Source review |

### 7.2 Search

| ID | Requirement |
| --- | --- |
| S1 | ⌘K / Ctrl-K opens search from any page; Escape closes it |
| S2 | Results rank name matches above tagline and keyword matches |
| S3 | Arrow keys move the selection; Enter opens; the active item is announced to assistive tech |
| S4 | Empty state offers categories instead of a blank panel |
| S5 | Recent tools (max 6, `localStorage`) appear before typing and are clearable |
| S6 | Search covers every live tool and never surfaces a planned one |

### 7.3 Directory and categories

| ID | Requirement |
| --- | --- |
| D1 | Directory lists every live tool and nothing else |
| D2 | Client-side text filter narrows by name, tagline and keyword |
| D3 | Category pages show only that category's live tools, with a count |
| D4 | Planned categories are visibly marked planned and list no fake tools |

### 7.4 Trust and policy pages

| ID | Requirement |
| --- | --- |
| P1 | Contact offers a working path (mailto composer + copyable address) without a server |
| P2 | Privacy policy enumerates exactly what is stored: theme, search recents, consent, and nothing else unless analytics is accepted |
| P3 | Every policy page is dated and marked as pending legal review |
| P4 | Accessibility statement describes the conformance target and how to report a barrier |
| P5 | Roadmap page derives its counts from the registry |

## 8. Non-functional requirements

| Area | Target | Current state |
| --- | --- | --- |
| Performance | < 100 KB first-load JS per tool route; no layout shift from results or ad slots | Each tool is code-split; ad slots are fixed-height and inert by default |
| Availability | Static hosting, no runtime dependencies | `output: "export"` |
| Privacy | No third-party requests by default | Zero external scripts unless GA is configured *and* consented |
| Accessibility | WCAG 2.2 AA intent: contrast, focus visibility, 44px targets, labelled controls, keyboard paths | Built in; screen-reader pass pending (roadmap 5.12) |
| Security | No secrets in the client; no HTML injection from user input | No secrets exist; text rendering escapes by default |
| SEO | Unique title/description, canonical, sitemap, structured data, no thin pages | Enforced by tests + template |
| Test coverage | Every logic module covered, plus a catalogue guardrail | 139 tests / 7 files |

## 9. Content requirements

- Copy is written for this site. No scraped or spun text.
- Every worked example is produced by running the function it documents.
- Limitations are written as sentences a user can act on ("this uses the standard 5-day
  week and ignores public holidays"), not as legal boilerplate.
- No medical, legal or financial advice; calculators state that results are informational.
- Compliance-sensitive numbers (VAT rates, tax bands) are never hard-coded as "current" —
  they are inputs the user supplies.

## 10. Success metrics

Instrumented only when analytics is consented; otherwise measured through
Search Console and server logs.

| Metric | Target |
| --- | --- |
| Task completion (tool used without bouncing) | > 60% of tool-page sessions |
| Time to first useful result | < 5 s on a mid-range phone |
| Search success (opened search → opened a tool) | > 50% |
| Support contacts about wrong results | < 1 per 1,000 tool sessions |
| Core Web Vitals | "Good" on all three metrics in the field |
| Indexation | Every sitemap URL indexed, zero soft 404s |

## 11. Risks and mitigations

| Risk | Impact | Mitigation |
| --- | --- | --- |
| A tool is quietly wrong | Trust, and real-world harm | Pure functions + unit tests + code-derived examples + visible formula + report link |
| Copy drifts from behaviour | Misleading users, thin-content penalties | Catalogue tests on SEO copy; examples pinned by unit tests |
| AdSense rejection for thin content | No revenue | 41 substantive pages, 4 guides, policy pages, 30-day wait before applying |
| Ads degrade the experience | Bounce, policy risk | Inert by default, fixed-height, never adjacent to a control or result |
| Brand name conflict (Toolora unverified) | Rebrand cost | Confirmed as a risk in the blueprint; rename is a config + copy change, not an architectural one |
| Placeholder config ships to production | Broken canonicals, unreachable contact | `siteUrlIsPlaceholder` flag, pre-launch checklist, smoke test |
| Static hosting terms disallow ads | Takedown | Documented host constraint (Vercel Hobby unsuitable) |

## 12. Release criteria

A release is shippable when:

1. `npm run check` passes (typecheck → 139 tests → static build).
2. Every new tool has logic + tests + data + component + registry entry.
3. No route returns a non-200 in the crawl (excluding the dev-only 500 for unknown slugs
   under `output: export`).
4. `grep -r "example.com" src` returns only intentional placeholders covered by the launch
   checklist.
5. No ad or analytics code is active without explicit environment configuration and consent.

## 13. Open questions for the operator

1. Real brand name and domain (blueprint flags "Toolora" as unverified).
2. Which jurisdiction's law the policy pages should be written against.
3. Whether a monitored contact mailbox exists, or contact should stay mailto-only.
4. Hosting provider with advertising-compatible terms.
5. Whether to invest in PDF tools given licence/bundle constraints, or prioritise image
   tools that are unambiguously client-side.
