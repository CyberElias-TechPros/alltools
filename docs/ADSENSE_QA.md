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
| 1.2 | Site is old enough / has enough indexed pages | ⛔ | Wait until Search Console shows the 41 tool pages, 4 guides and policy pages indexed. |
| 1.3 | No ads are shown before approval | ✅ | `src/components/ad-slot.tsx` returns `null` unless `NEXT_PUBLIC_ADS_ENABLED === "true"` *and* a publisher ID exists; no AdSense script is loaded anywhere else (grep `adsbygoogle`). |
| 1.4 | No placeholder publisher ID or analytics ID in the codebase | ✅ | `src/lib/site.ts` reads env vars only; the only placeholder is the contact email/domain, tracked in §8. |
| 1.5 | Hosting terms permit advertising | ⛔ | Vercel Hobby does not permit commercial advertising. Choose Cloudflare Pages, Netlify (paid plan if required), or another host whose terms allow ads. |
| 1.6 | Site does not encourage invalid clicks | ✅ | No "click our ads", no ads layered over content, no ads in the tool result area. |
| 1.7 | A privacy policy is linked from every page | ✅ | `src/components/site-footer.tsx` links `/privacy-policy/` on all routes. |

## 2. Content quality (the usual rejection cause)

| # | Requirement | Status | Evidence / action |
| --- | --- | --- | --- |
| 2.1 | Original content, not copied or auto-spun | ✅ | All copy written for this site; guides in `src/lib/guides.ts` are original explainers. |
| 2.2 | Substantive pages, not thin doorway pages | ✅ | Every tool page carries about + how-to + method/formula + ≥2 worked examples + ≥2 limitations + ≥3 FAQs, enforced by `tests/catalogue.test.ts`. |
| 2.3 | No pages built solely to rank for a keyword | ✅ | No city/state/`-vs-` permutations; no auto-generated variants; no hidden text. |
| 2.4 | Content matches what the tool actually does | ✅ | Worked examples are derived from the implementation and pinned by unit tests (`tests/*.test.ts`). |
| 2.5 | Navigation is clear; every page reachable | ✅ | Header, footer and directory; a full crawl of 71 pages found no broken internal links. |
| 2.6 | No misleading or unsupported claims | ✅ | Legal pages describe what the code does (localStorage keys, no uploads, consent-gated analytics). |
| 2.7 | No adult, violent, hateful, or otherwise restricted content | ✅ | Catalogue is utility-only; see `src/lib/tools/categories.ts`. |
| 2.8 | No fake tools, no "coming soon" pages presented as working | ✅ | Planned categories are marked planned and contain no tool entries; the roadmap page shows real counts. |
| 2.9 | Content is not behind a paywall or login | ✅ | Everything is static and public. |

## 3. Site structure and trust pages

| # | Requirement | Status | Evidence / action |
| --- | --- | --- | --- |
| 3.1 | About page explaining who runs the site and why | 🟡 | `/about/` exists and is substantive. It must be updated with the operator's real identity before applying. |
| 3.2 | Contact method that reaches a human | ⛔ | `/contact/` composes a mailto link, but `siteConfig.email` is `hello@toolora.example.com`. Replace with a monitored mailbox (`src/lib/site.ts`) or the form has no destination. |
| 3.3 | Terms of service | 🟡 | `/terms/` written and dated; needs legal review for the operator's jurisdiction. |
| 3.4 | Privacy policy covering analytics and ads | 🟡 | `/privacy-policy/` covers the current build (no ads, consent-gated analytics). **Must be updated before ads go live** to name Google, cookies, and the ad-serving purpose. |
| 3.5 | Cookie policy | 🟡 | `/cookies/` accurate for today's build; extend with ad cookies when ads are enabled. |
| 3.6 | Disclaimer | 🟡 | `/disclaimer/` covers informational use; legal review required. |
| 3.7 | Accessibility statement | ✅ | `/accessibility/` states the target, describes the built-in measures and how to report barriers. |
| 3.8 | Editorial policy | ✅ | `/editorial-policy/` explains sourcing, review and correction of tool content. |
| 3.9 | Public roadmap | ✅ | `/roadmap/` derives counts from the registry and marks planned work as planned. |
| 3.10 | Working 404 page | ✅ | `src/app/not-found.tsx`; static hosts serve `404.html`. |
| 3.11 | Sitemap and robots.txt | ✅ | `src/app/sitemap.ts` builds from the live registry; `robots.ts` points at it. Verify on the deployed domain (§6.1). |

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
| 5.5 | No broken links | ✅ | 71-page internal crawl: zero broken links. |
| 5.6 | Canonical URLs consistent | 🟡 | Every route sets a canonical from `siteConfig.url`; confirm the env var on production. |
| 5.7 | Structured data valid | 🟡 | `BreadcrumbList`, `SoftwareApplication`, `FAQPage`, `Article`, `Organization` present; run Rich Results Test on the live domain. |

## 6. Launch-day checks (⛔ until performed)

1. `NEXT_PUBLIC_SITE_URL` set to the real origin; `curl -I` shows the right canonical.
2. No `example.com` anywhere in the HTML source of the homepage, a tool page and a guide.
3. Contact mailbox receives a test message; reply works.
4. `/sitemap.xml`, `/robots.txt`, `/manifest.webmanifest` return 200 and list only real URLs.
5. Search Console: property verified, sitemap submitted, coverage report clean.
6. Analytics consent banner appears only when `NEXT_PUBLIC_GA_ID` is set; decline path
   leaves the site script-free (check the network panel).
7. Privacy, cookie, terms and disclaimer pages reviewed and dated by the operator.
8. 30 days of stable, indexed operation before the application is submitted.

## 7. After approval

1. Add the exact seller line supplied by Google to `public/ads.txt` (replacing the comment).
2. Set `NEXT_PUBLIC_ADSENSE_CLIENT` and `NEXT_PUBLIC_ADS_ENABLED=true` in the host's
   environment — never commit either value.
3. Set `NEXT_PUBLIC_ADSENSE_SLOT_TOOL` to the tool-page unit id. The loader and the
   `adsbygoogle.push()` call stay behind the consent gate, so no ad request fires before
   consent in regulated regions.
4. Enable one slot, review on mobile and desktop for layout shift and accidental clicks,
   then decide whether a second is warranted.
5. Monitor the Policy Centre weekly for the first month; a single "low value content"
   warning is a signal to add depth, not to add ad units.

## 8. Known placeholders (must be resolved before applying)

| Placeholder | Location | Replace with |
| --- | --- | --- |
| `https://toolora.example.com` | `src/lib/site.ts` fallback | Real origin via `NEXT_PUBLIC_SITE_URL` |
| `hello@toolora.example.com` | `src/lib/site.ts` | A monitored mailbox |
| "pending legal review" notes | Policy pages | Confirmation after review |
| Operator identity on `/about/` | About page | Real, verifiable details |
| Empty/comment-only `ads.txt` | `public/ads.txt` | Google's exact seller line |
| Toolora brand name | Site-wide | Only if the name is cleared, otherwise rewrite brand copy |

## 9. Explicit non-goals

- No fake reviews, ratings or "as seen in" logos.
- No countdown timers, exit-intent modals or "your download is ready" patterns.
- No ads disguised as navigation or download buttons.
- No auto-refresh, no pop-unders, no sticky video.
- No buying traffic or incentivised clicks to "look active" for the review.
