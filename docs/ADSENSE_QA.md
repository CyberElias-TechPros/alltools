# AdSense readiness audit

Pre-application review of this repository against Google AdSense programme policies and the
content requirements in Google Search's helpful-content guidance.

**How to read the status column**

- ✅ **Pass** — true in the repository today, verifiable with the evidence given.
- 🟡 **Partial** — the repo side is done but the check needs a live deployment to confirm.
- ⛔ **Owner action** — cannot be done from code: needs the operator, a domain, an account,
  or a lawyer.

> ⚠️ **Do not apply for AdSense until every ⛔ row is closed and the site has been live and
> indexed for a few weeks.** Applying early is the most common rejection reason identified
> in the blueprint. This document is an internal audit, not an authorisation to apply.

---

## 1. Eligibility and site basics

| # | Requirement | Status | Evidence / action |
| --- | --- | --- | --- |
| 1.1 | Site is publicly reachable on a real domain | ⛔ | Nothing is deployed yet. Set `NEXT_PUBLIC_SITE_URL`, deploy `out/`, confirm HTTPS. |
| 1.2 | Site is old enough / has enough indexed pages | ⛔ | Wait until Search Console shows the 254 tool pages, 12 category pages, 4 guides and policy pages indexed. Indexing cannot start until the real domain is live (§1.1). |
| 1.3 | Every ad frame is gated by config | ✅ | `src/components/ad-slot.tsx` returns `null` unless ads are enabled (`NEXT_PUBLIC_ADS_ENABLED` ≠ `"false"`), a publisher ID exists *and* the placement has a unit id; the only AdSense script in the tree is the loader in `src/components/adsense-loader.tsx` (grep `adsbygoogle`). |
| 1.4 | No placeholder publisher ID or analytics ID in the codebase | ✅ | `src/lib/site.ts` reads env vars only; the only placeholder is the contact email/domain, tracked in §8. |
| 1.5 | Hosting terms permit advertising | ⛔ | Vercel Hobby does not permit commercial advertising. Choose Cloudflare Pages, Netlify (paid plan if required), or another host whose terms allow ads. |
| 1.6 | Site does not encourage invalid clicks | ✅ | No "click our ads", no ads layered over content, no ads in the tool result area. |
| 1.7 | A privacy policy is linked from every page | ✅ | `src/components/site-footer.tsx` links `/privacy-policy/` on all routes. |

## 2. Content quality (the usual rejection cause)

| # | Requirement | Status | Evidence / action |
| --- | --- | --- | --- |
| 2.1 | Original content, not copied or auto-spun | ✅ | All copy written for this site; guides in `src/lib/guides.ts` are original explainers. |
| 2.2 | Substantive pages, not thin doorway pages | ✅ | Every tool page carries about + how-to + method/formula + ≥2 worked examples + ≥2 limitations + ≥3 FAQs, enforced by `tests/catalogue.test.ts`. |
| 2.3 | No pages built solely to rank for a keyword | ✅ | No city/state/`-vs-` permutations; no auto-generated variants; no hidden text. Measured 3 Nov 2026: every tool page carries 391–1,411 words of visible text (median 571) and no two pages share an opening paragraph. |
| 2.4 | Content matches what the tool actually does | ✅ | Worked examples are derived from the implementation and pinned by unit tests (`tests/*.test.ts`). |
| 2.5 | Navigation is clear; every page reachable | ✅ | Header, footer, directory and an in-page "on this page" nav. Crawl of all 285 built pages (3 Nov 2026) followed 12,810 internal links: zero broken, one `<h1>` per page, unique title and description per page. |
| 2.6 | No misleading or unsupported claims | ✅ | Legal pages describe what the code does (localStorage keys, no uploads, consent-gated analytics). |
| 2.7 | No adult, violent, hateful, or otherwise restricted content | ✅ | Catalogue is utility-only; see `src/lib/tools/categories.ts`. |
| 2.8 | No fake tools, no "coming soon" pages presented as working | ✅ | Planned categories are marked planned and contain no tool entries; the roadmap page shows real counts. |
| 2.9 | Content is not behind a paywall or login | ✅ | Everything is static and public. |

## 3. Site structure and trust pages

| # | Requirement | Status | Evidence / action |
| --- | --- | --- | --- |
| 3.1 | About page explaining who runs the site and why | ✅ | `/about/` is titled **About Us**, describes who runs the site, how tools are built and tested, and links every other policy page. Linked from the footer legal row and the Company column. |
| 3.2 | Contact method that reaches a human | 🟡 | `/contact/` is titled **Contact Us**, shows the mailbox as text, and its form composes a `mailto:` — no server, no stored submissions. Owner action: confirm `hello@toolz.name.ng` is monitored (`src/lib/site.ts`) before applying. |
| 3.3 | Terms and conditions | ✅ | `/terms/` is titled **Terms & Conditions** and covers agreement, permitted use, your content, accuracy, IP, liability, availability, third parties, changes, governing law (with a consumer-law carve-out), contact and links to the other policies. The public placeholder sentence was removed; legal review of the governing-law wording still recommended. |
| 3.4 | Privacy policy covering analytics and ads | ✅ | `/privacy-policy/` §7 is now headed *Advertising and third-party cookies, including Google DoubleClick*. It carries the required sentence that third-party vendors, including Google, use cookies to serve ads based on prior visits; names the **DoubleClick cookie (DART)**; names other ad networks; links Google Ads Settings, Google Ad Center, `aboutads.info` and `policies.google.com/technologies/ads`; states ads are off until approval and that ad/analytics storage starts denied. |
| 3.5 | Cookie policy | ✅ | `/cookies/` §4 is headed *Advertising cookies, including Google DoubleClick*, explains what that cookie does, links the opt-outs, and keeps the `toolz:theme` / `toolz:recent` / `toolz:consent` inventory accurate. |
| 3.6 | Disclaimer | 🟡 | `/disclaimer/` covers informational use and is linked from every page; legal review still required. |
| 3.7 | Accessibility statement | ✅ | `/accessibility/` states the target, describes the built-in measures and how to report barriers. |
| 3.8 | Editorial policy | ✅ | `/editorial-policy/` explains sourcing, review and correction of tool content. |
| 3.9 | Public roadmap | ✅ | `/roadmap/` derives counts from the registry and marks planned work as planned. |
| 3.10 | Working 404 page | ✅ | `src/app/not-found.tsx`; static hosts serve `404.html`. |
| 3.11 | Sitemap and robots.txt | ✅ | `src/app/sitemap.ts` builds from the live registry; `robots.ts` points at it. Verify on the deployed domain (§6.1). |
| 3.12 | Legal pages reachable from every page | ✅ | `legalLinks` in `src/lib/site.ts` renders a labelled *Legal & policies* row in the footer (Privacy Policy, Terms & Conditions, Cookie Policy, Disclaimer, About Us, Contact Us). `tests/legal.test.tsx` asserts the links, the page titles and the DoubleClick wording. |

## 4. Advertising implementation rules

These are the rules that keep an approved account healthy; they are already enforced in
code so that switching ads on cannot break them by accident.

| # | Rule | Status | Evidence |
| --- | --- | --- | --- |
| 4.1 | Ads never adjacent to, or styled like, a control | ✅ | `AdSlot` placements are page-level slots with vertical spacing; submit/copy controls are inside the tool card. |
| 4.2 | Ads do not push content or cause layout shift | ✅ | Every slot reserves a fixed `min-height` (250 px) before fill; a slot with no configured ad unit id renders nothing at all. |
| 4.3 | Ads are not placed inside the tool result area | ✅ | Slots appear below the tool, never between input and output. |
| 4.4 | Ad density keeps content dominant | ✅ | At most two slots per route, both inert by default. |
| 4.5 | No ad script loads before consent in EEA/UK/CH | 🟡 | The AdSense loader and the `adsbygoogle.push()` call both run only after explicit consent (`src/components/analytics.tsx`), and the banner now appears whenever ads are enabled. A **certified CMP is still required** for personalised ads in those regions — owner action (roadmap 7.7). |
| 4.6 | `ads.txt` contains only real, authorised seller lines | ✅ | `public/ads.txt` is comment-only by design — an invented line is worse than an empty file. |
| 4.7 | No incentivised clicks, no ads in emails, no ads on error pages | ✅ | Not implemented anywhere. |
| 4.8 | Publisher ID only ever comes from Google | ✅ | Read from `NEXT_PUBLIC_ADSENSE_CLIENT`; no default, no example ID committed. |

### Placement map (when ads are eventually enabled)

| Route | Placement key | Position |
| --- | --- | --- |
| `/tools/<slug>/` | `toolPage` | Below the tool and its privacy note, above "About this tool" |

Each placement maps to an ad unit id via `siteConfig.adsenseSlots`
(`NEXT_PUBLIC_ADSENSE_SLOT_TOOL`). No unit id, no slot — by design.

Blog/guide and directory placements are intentionally left unused until traffic justifies
them; adding more slots is a template change, not a rebuild.

## 5. Technical quality signals

| # | Signal | Status | Evidence |
| --- | --- | --- | --- |
| 5.1 | Pages render without JavaScript for content | ✅ | Static HTML export; a crawl of all routes returns 200 with the full editorial content server-rendered. |
| 5.2 | No intrusive interstitials | ✅ | Only the optional analytics consent banner, which appears solely when a GA ID is configured. |
| 5.3 | Mobile usable | 🟡 | Responsive layout built for 320 px upward; needs a real-device pass (roadmap 5.10). |
| 5.4 | Fast | 🟡 | Code-split tool bundles; measure with Lighthouse on the production domain (roadmap 5.11). |
| 5.5 | No broken links | ✅ | 285-page internal crawl, 12,810 internal links: zero broken (3 Nov 2026). |
| 5.6 | Canonical URLs consistent | 🟡 | Every route sets a canonical from `siteConfig.url`; confirm the env var on production. |
| 5.7 | Structured data valid | 🟡 | `WebSite`+`SearchAction`, `Organization`, `WebPage`, `BreadcrumbList`, `CollectionPage`/`ItemList`, `SoftwareApplication`+`Offer`, `FAQPage`, `Article` present on the relevant routes; run the Rich Results Test once the real domain is live. |
| 5.8 | Crawlable and complete machine-readable surface | ✅ | `/sitemap.xml` (283 URLs, all resolving), `/robots.txt` (allows CSS/JS, names AI crawlers), `/llms.txt`, `/feed.xml`; a comment-only `/ads.txt` is served and must be replaced with the real seller line after approval. |

## 6. Launch-day checks (⛔ until performed)

1. `NEXT_PUBLIC_SITE_URL` set to the real origin; `curl -I` shows the right canonical.
2. No `example.com` anywhere in the HTML source of the homepage, a tool page and a guide.
3. Contact mailbox receives a test message; reply works.
3a. **AdSense loader present in the page source.** `npm run build && npm run verify:adsense`
   must pass; it checks every exported page for
   `<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-9124992249317290" crossorigin="anonymous">`
   inside `<head>`, the `google-adsense-account` meta tag, and the `ads.txt` line.
   On the live domain, `curl -s https://toolz.name.ng/ | grep -c adsbygoogle` must print a
   number greater than zero — a 0 means the deployed build predates this fix.
4. `/sitemap.xml`, `/robots.txt`, `/manifest.webmanifest` return 200 and list only real URLs.
5. Search Console: property verified, sitemap submitted, coverage report clean.
6. Analytics consent banner appears only when `NEXT_PUBLIC_GA_ID` is set; decline path
   leaves the site script-free (check the network panel).
7. Privacy, cookie, terms and disclaimer pages reviewed and dated by the operator.
8. 30 days of stable, indexed operation before the application is submitted.

## 6a. "We couldn't find your site" — the four causes, in order

AdSense fetches the URL you typed and looks for the loader `<script>` (or the
`google-adsense-account` meta tag) in the returned HTML. Work down this list; each
step is a different failure with a different fix.

| # | Cause | How to tell | Fix |
| --- | --- | --- | --- |
| 1 | The loader was injected by JavaScript, so it is absent from the page source | View source (Ctrl+U) and search `adsbygoogle` — the raw HTML only had a `<link rel="preload">` | **Fixed in this repo**: `src/components/adsense-loader.tsx` renders a literal `<script>` inside `<head>`; `next/script` with `strategy="afterInteractive"` must never wrap it again |
| 2 | The deployed site is older than the fix, or the domain serves a different build | `curl -s https://toolz.name.ng/ \| grep -c adsbygoogle` prints 0 | Merge to `main`, trigger a production deploy, re-check |
| 3 | The URL is wrong: `www.` vs apex, `http://` vs `https://`, or a path instead of the root | The dashboard entry and the redirect chain disagree | Submit the exact canonical origin `https://toolz.name.ng/`; keep one hop of redirect only |
| 4 | The crawler is blocked: Vercel Deployment Protection, Cloudflare "Under Attack"/Bot Fight Mode, basic auth, or a firewall rule | `curl -I` shows 401/403, a challenge page, or a login | Allow public unauthenticated access to `/`, `/ads.txt` and `/robots.txt`; disable protection on the production alias |

After any of these, allow up to 24 hours for Google to re-crawl before concluding it
still fails.

## 7. After approval

1. `public/ads.txt` already carries the seller line `google.com, pub-9124992249317290, DIRECT,
   f08c47fec0942fa0`; confirm it stays exact if the account changes.
2. `NEXT_PUBLIC_ADSENSE_CLIENT` defaults to the live publisher id and ads are enabled
   unless `NEXT_PUBLIC_ADS_ENABLED=false`; override either in the host's environment
   rather than editing code.
3. Set `NEXT_PUBLIC_ADSENSE_SLOT_TOOL` to the tool-page unit id — or leave it empty and
   let Google's Auto ads (AdSense → Ads → By site) place ads, which needs only the loader.
   The `adsbygoogle.push()` call stays behind the consent gate, so no ad request fires
   before consent in regulated regions.
4. Enable one slot, review on mobile and desktop for layout shift and accidental clicks,
   then decide whether a second is warranted.
5. Monitor the Policy Centre weekly for the first month; a single "low value content"
   warning is a signal to add depth, not to add ad units.

## 8. Known placeholders (owner action; the code side is done)

| Placeholder | Location | Replace with |
| --- | --- | --- |
| `https://toolz.name.ng` | `src/lib/site.ts` fallback | Real origin via `NEXT_PUBLIC_SITE_URL` |
| `hello@toolz.name.ng` | `src/lib/site.ts` | A monitored mailbox |
| "pending legal review" notes | Policy pages | Confirmation after review |
| Operator identity on `/about/` | About page | Real, verifiable details |

## 9. Explicit non-goals

- No fake reviews, ratings or "as seen in" logos.
- No countdown timers, exit-intent modals or "your download is ready" patterns.
- No ads disguised as navigation or download buttons.
- No auto-refresh, no pop-unders, no sticky video.
- No buying traffic or incentivised clicks to "look active" for the review.
