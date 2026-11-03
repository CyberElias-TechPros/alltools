# Toolz

**Fast, free, privacy-first online tools that run entirely in your browser.**

This is a static Next.js app that hosts a growing catalogue of small utilities — text
cleaners, calculators, converters, developer helpers, SEO previews — with no sign-up, no
uploads and no server-side processing. Every tool is a pure TypeScript function wrapped in
a React component, so results are instant, work offline after first load, and can be
verified by automated tests.

- **Live tools:** 254 across 12 categories (plus 10 honestly labelled as planned)
- **Test suite:** 971 tests in 27 files (`npm test`) — logic, catalogue rules, a render smoke test over every tool, an interaction sweep that types/clicks through all 254, and known-answer checks through the real UI
- **First-load JS:** one route's worth of code per tool (each tool is code-split)
- **Domain:** toolz.name.ng
- **Hosting:** any static host — output is plain HTML/CSS/JS in `out/`

The original product plan (271-tool catalogue, policy rules, stack decisions, 90-day
roadmap) is preserved in [`docs/BLUEPRINT.md`](docs/BLUEPRINT.md). This README describes
what is actually built.

---

## Quick start

```bash
npm install
npm run dev          # http://localhost:3000
```

```bash
npm run check        # typecheck + tests + production build (run before every commit)
```

| Script | What it does |
| --- | --- |
| `npm run dev` | Next.js dev server with Turbopack |
| `npm run build` | Static export to `out/` (fails the build on type or lint-adjacent errors) |
| `npm start` | Serve the built app with `next start` (dev convenience only — production is the static `out/` folder) |
| `npm run typecheck` | `tsc --noEmit`, strict mode |
| `npm test` | Vitest, single run |
| `npm run test:watch` | Vitest in watch mode |
| `npm run check` | typecheck → test → build, in that order |

Node 20.9+ is required (Next.js 16). No database, no API keys, no paid services.

---

## Architecture

```
src/
├─ app/                     Route segments (App Router, static export)
│  ├─ page.tsx              Homepage: search, popular, recently added, categories, FAQ
│  ├─ tools/                Directory + [slug] tool pages (generateStaticParams)
│  ├─ categories/           Category index + [id] category pages
│  ├─ guides/               Editorial guides index + [slug] articles
│  ├─ roadmap/              Public build-status page, counts derived at build time
│  ├─ about/ contact/       Trust pages
│  ├─ privacy-policy/ terms/ disclaimer/ cookies/ accessibility/ editorial-policy/
│  ├─ sitemap.ts robots.ts manifest.ts not-found.tsx
│  ├─ llms.txt/route.ts     Plain-text index of every page (for AI assistants)
│  ├─ feed.xml/route.ts     RSS 2.0 feed of the guides
│  └─ globals.css           Design system: CSS variables, dark mode, components
├─ components/              Presentation only (no business logic)
│  ├─ ui.tsx                Button, Field, inputs, StatGrid, ResultCard, CopyButton…
│  ├─ site-header.tsx       Sticky nav + ⌘K search trigger
│  ├─ search-dialog.tsx     Client search, keyboard-driven, recents in localStorage
│  ├─ tool-card.tsx         Directory/category card
│  ├─ category-art.tsx      Inline SVG vignette per category (12 drawings)
│  ├─ tools/mode-hub.tsx    ModeHub/ModeCard/ModeResult — the "several calculators in one" grid
│  ├─ json-ld.tsx           Renders one or many schema.org graphs
│  ├─ ad-slot.tsx           Renders nothing unless ads are explicitly enabled
│  └─ analytics.tsx         Consent banner + consent-gated GA4 loader
├─ lib/
│  ├─ text.ts calc.ts finance.ts units.ts dev.ts regex.ts timezone.ts diff.ts
│  ├─ image.ts pdf.ts docx.ts format.ts tabular.ts xml.ts web.ts http.ts
│  ├─ passwords.ts security.ts education.ts everyday.ts business.ts currency.ts
│  │                        Pure, dependency-free logic — the part tests cover
│  ├─ search.ts            Scoring/ranking for the command palette
│  ├─ guides.ts             Editorial articles as structured data
│  ├─ site.ts               Site config, nav, footer links, env flags
│  ├─ seo.ts                pageMetadata/toolMetadata, keyword clusters, schema builders
│  └─ tools/
│     ├─ types.ts           ToolDefinition / CategoryDefinition models
│     ├─ categories.ts      12 categories; live and planned counts derived from the registry
│     ├─ registry.ts        Concatenates data files, derived helpers
│     └─ data/*.ts          Editorial content for each tool (SEO copy, examples, FAQs)
└─ tools/
   ├─ registry.tsx          slug → lazily imported React component
   ├─ text/ calculators/ finance/ developer/ everyday/ seo/ security/
   ├─ images/ pdf/ internet/ education/ business/
   └─                        One file per tool: inputs, state, live result
```

**Rule of thumb:** logic lives in `src/lib`, copy lives in `src/lib/tools/data`, and
`src/tools/*` only wires the two together. That is why the test suite can cover 254 tools
with no DOM or browser needed.

### SEO layer

Everything a crawler needs is derived from `src/lib/site.ts` and `src/lib/tools/registry.ts`:

| Surface | Where | Contents |
| --- | --- | --- |
| Per-page metadata | `src/lib/seo.ts` → `pageMetadata()` / `toolMetadata()` | Title, description, canonical (absolute), keyword cluster, Open Graph, Twitter card, hreflang, RSS + `llms.txt` alternates |
| OG images | `public/og/*.png` | 1200×630 card per category, shared by every tool in it |
| Structured data | `layout.tsx` `@graph` + page-level `JsonLd` | WebSite (with SearchAction), Organization, WebPage, BreadcrumbList, CollectionPage/ItemList, SoftwareApplication + Offer, FAQPage, Article |
| `/sitemap.xml` | `src/app/sitemap.ts` | 13 static pages, 12 categories, every live tool, guides — with image entries and real last-modified dates |
| `/robots.txt` | `src/app/robots.ts` | Allows everything (including CSS/JS for rendering) and names the AI crawlers explicitly |
| `/llms.txt` | `src/app/llms.txt/route.ts` | Machine-readable summary: about, categories with counts, all 254 tools with taglines, guides, policies |
| `/feed.xml` | `src/app/feed.xml/route.ts` | RSS 2.0 of the guides, linked via `<link rel="alternate">` |

Set `NEXT_PUBLIC_SITE_URL` before deploying: canonicals, the sitemap, `robots.txt` and every
JSON-LD `@id` are built from it.

### Hub layouts for multi-mode tools

When a tool answers more than one question, show every answer at once instead of hiding two
of them behind a segmented control. `src/components/tools/mode-hub.tsx` provides:

- `ModeHub` — the grid (`columns={2}` or `{3}`), stacking to one column on phones.
- `ModeCard` — a titled card with an optional badge and one-line hint.
- `ModeResult` — the live answer inside a card, with `aria-live` and an error tone.

Twelve tools now use it — the pattern fits any tool whose modes are separate questions rather
than separate outputs:

| Tool | Cards |
| --- | --- |
| Percentage calculator | What is X% of Y · X is what % of Y · percentage change |
| VAT calculator | Add VAT · remove VAT, on one shared rate |
| Product pricing | Price from margin · price from markup · margin at a fixed price |
| Profit margin | Margin from cost & price · price for a target margin |
| Standard deviation | Population (÷ n) · sample (÷ n − 1) |
| BMI | Metric · imperial |
| Roman numerals | Number → Roman · Roman → number |
| Base64 | Text → Base64 · Base64 → text |
| URL encoder | Value · full URL · form data · decoded |
| HTML entities | Text → entities · entities → text |
| Text reverser | Characters · words · lines |
| Hash generator | SHA-1 · SHA-256 · SHA-384 · SHA-512, all four at once |

Tools whose segmented control picks one output format (JSON indent, gradient type, sort order)
keep the switch — there the modes are settings, not separate questions.

### Design system — "Studio"

A calm, modern catalogue with an editorial spine: warm off-white canvas, white cards with
soft depth, generous radii, colour-coded category tiles, and one signal orange reserved for
actions and results. Everything is defined once in `src/app/globals.css`.

| Token | Value (light / dark) | Used for |
| --- | --- | --- |
| `--page` | `#f7f6f2` / `#0b0c0e` | Page canvas (warm off-white / near-black) |
| `--surface` | `#ffffff` / `#15171a` | Cards, panels, inputs |
| `--surface-muted` | `#f2f1eb` / `#1d2024` | Inset rows, segmented controls, metadata |
| `--border`, `--border-strong` | hairline warm greys | Card rims and dividers |
| `--text`, `--text-muted`, `--text-subtle` | ink → grey | Body, secondary, mono metadata |
| `--ring` | `#ff4b00` / `#ff7a3d` | Signal: focus rings, fills, marks |
| `--accent-text` | `#b83500` / `#ff9166` | The same signal, darkened to pass 4.5:1 as *text* |
| `--result-bg` / `--result-border` | tinted signal | Live result cards |
| `--invert-bg` / `--invert-text` | ink on paper | Primary buttons and the CTA band |

- **Type:** Bricolage Grotesque (`.display`, headings), Inter Tight (body), JetBrains Mono
  (`.eyebrow`, `.mono`, labels, counts). Self-hosted via `@fontsource-variable`, so there
  is no third-party font request.
- **Geometry:** `--radius-sm` 6 px → `--radius-3xl` 24 px; cards are 18 px with the
  `--shadow-soft` pair, and `.card-lift` adds a 2 px rise plus a deeper shadow on hover.
- **Category colour:** `.cat-*` classes carry a hue per category (`--tint`, `--tint-soft`),
  used by `CategoryTile` on cards, category grids and search results. The orange stays
  reserved for actions, live results and focus.
- **Signature components:** `.card` / `.card-lift` (white catalogue cards), `.panel-head`
  (mono caption strip), `.stat-number` (accent result numerals), `.chip` (pill metadata),
  `.index-row` (numbered list row that lifts on hover), and the directory sidebar with its
  colour-coded category rail.
- **Motion:** 160–200 ms colour, border and 2 px translations only, all of it disabled
  under `prefers-reduced-motion`.

Contrast is checked against the token pairs above: body text 16.7:1 on the canvas, secondary
text 6.8:1, mono metadata 4.5:1 at its smallest size, and category tints 4.5–9:1 on their own
soft backgrounds. The signal colour is never used for small text without `--accent-text`.

### Data model

A tool is a single `ToolDefinition` object (`src/lib/tools/types.ts`):

```ts
{
  slug, name, tagline, category, keywords, popularity, addedAt,
  status: "live" | "planned",
  seoTitle, seoDescription,
  content: {
    intro: string[], howTo: string[], method?: { title?, paragraphs, formula? },
    examples: { title, steps, result }[],
    limitations: string[], faqs: { q, a }[]
  }
}
```

`tests/catalogue.test.ts` enforces the editorial quality bar on every entry: SEO title
length, description length, ≥3 how-to steps, ≥2 worked examples, ≥2 limitations, ≥3 FAQs,
no duplicate FAQ questions, unique slugs, and a matching React component.

### Static export

`next.config.ts` sets `output: "export"` and `trailingSlash: true`. Consequences to keep
in mind:

- Every dynamic route needs `generateStaticParams()`; unknown params are a build-time
  error (`dynamicParams = false`). In `next dev` an unknown slug such as
  `/tools/merge-pdf/` returns a 500 instead of a 404 — that is expected dev behaviour for
  static export; the deployed static host serves `404.html`.
- No route handlers, server actions, middleware or `next/image` optimisation. Images are
  unoptimised and refer to files in `public/`.
- `params` is a Promise in Next 15+ — always `const { slug } = await params`.

---

## Adding a tool

1. **Write the logic** in the relevant `src/lib/*.ts` module as a pure function. Return a
   discriminated result (`{ value }` or `{ error }`) instead of throwing, so the UI can
   always render something helpful.
2. **Test it** in `tests/`. Include at least one boundary case (zero, empty string,
   negative, invalid input) and one realistic worked example.
3. **Add the `ToolDefinition`** to the matching file in `src/lib/tools/data/`, with copy
   that matches what the code actually does. Worked-example numbers must come from running
   the function — never hand-written.
4. **Build the component** in `src/tools/<category>/<slug>.tsx`, reusing `ui.tsx`
   primitives (labelled fields, instant result, copy button, error text tied to output).
5. **Register it** in `src/tools/registry.tsx` with `dynamic(() => import(...), { loading })`.
6. **Run `npm run check`**. The catalogue test fails if any of the editorial minimums or
   the slug↔component bijection is missing.
7. Visit `/tools/<slug>/` and `/sitemap.xml` — both are generated from the registry, so
   nothing else needs editing.

Do **not** add a tool that only links elsewhere, cannot produce a real result, or whose
copy is marketing filler. Planned tools stay out of the registry until they are usable.

---

## Environment variables

Everything is optional for development; see [`.env.example`](.env.example).

| Variable | Purpose | Default |
| --- | --- | --- |
| `NEXT_PUBLIC_SITE_URL` | Canonical origin for canonicals, sitemap, robots, JSON-LD | `https://toolz.name.ng` (placeholder) |
| `NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION` | Google Search Console meta token | unset (tag omitted) |
| `NEXT_PUBLIC_BING_SITE_VERIFICATION` | Bing Webmaster `msvalidate.01` token | unset (tag omitted) |
| `NEXT_PUBLIC_GA_ID` | GA4 measurement ID; analytics also requires cookie consent | empty — no analytics |
| `NEXT_PUBLIC_ADSENSE_CLIENT` | AdSense publisher ID | `ca-pub-5010473500037610` (live) |
| `NEXT_PUBLIC_ADSENSE_SLOT_TOOL` | Ad unit id for the tool-page slot | empty — slot renders nothing |
| `NEXT_PUBLIC_ADS_ENABLED` | Must be exactly `"true"` for ad slots to render | `false` |
| `NEXT_PUBLIC_CMP_PROVIDER` | `google` once a Google-certified CMP is live in AdSense | `internal` |

Before launch, set `NEXT_PUBLIC_SITE_URL` to the real domain, replace the placeholder
contact address in `src/lib/site.ts`, and review the legal pages. See
[`docs/ADSENSE_QA.md`](docs/ADSENSE_QA.md) for the full pre-application checklist.

---

## Deploying

The build is a static folder, so any host works:

```bash
npm ci
npm run build        # emits out/
```

- **Cloudflare Pages / Netlify:** build command `npm run build`, output directory `out`,
  Node 20+.
- **GitHub Pages / S3 / nginx:** upload the contents of `out/`. Serve `404.html` for
  unknown paths and keep the trailing slashes (`trailingSlash: true`).
- **Vercel:** works, but the Hobby plan's terms do not permit commercial advertising —
  upgrade before enabling AdSense.

Checklist after the first deploy: `https://your-domain/sitemap.xml`, `/robots.txt`,
`/llms.txt`, `/feed.xml`,
`/manifest.webmanifest` and a handful of tool pages all return 200, and canonicals point
at the real origin (view source and search for `example.com`).

---

## Android app

A separate, fully native Kotlin + Jetpack Compose app lives in [`android/`](android/).
It is not a WebView: 186 tools are Kotlin functions compiled into the APK, so they
answer in a frame, work in aeroplane mode and never upload a value.

```bash
cd android
gradle wrapper --gradle-version 8.9   # once, if `gradlew` is not present
./gradlew :app:testDebugUnitTest      # catalogue tests, JVM only
./gradlew :app:assembleDebug          # app-debug.apk
./gradlew :app:bundleRelease          # app-release.aab  (Play)
./gradlew :app:assembleRelease        # app-release.apk  (Galaxy Store)
```

- Architecture, signing, AdMob setup and the release checklist: [`android/README.md`](android/README.md)
- Store listing copy, icon, feature graphic and submission checklist: [`android/store/`](android/store/)
- Builds run in CI via [`.github/workflows/android.yml`](.github/workflows/android.yml)

Signing keys, store submission and AdMob approval are owner actions — the repo never
contains credentials.

---

## Documentation

| Document | Contents |
| --- | --- |
| [`docs/BLUEPRINT.md`](docs/BLUEPRINT.md) | Original product plan: catalogue, policies, stack, SEO strategy |
| [`ROADMAP.md`](ROADMAP.md) | Granular build roadmap: what is done, what is next, why, dependencies |
| [`docs/PRD.md`](docs/PRD.md) | Product requirements, audience, jobs to be done, quality bar |
| [`docs/TESTING.md`](docs/TESTING.md) | Test strategy, what each suite covers, manual QA script |
| [`docs/ADSENSE_QA.md`](docs/ADSENSE_QA.md) | Pre-AdSense-application audit with evidence and owner actions |
| [`android/README.md`](android/README.md) | Native Android app: architecture, build, signing, AdMob |
| [`android/store/LISTING.md`](android/store/LISTING.md) | Play and Galaxy Store listing copy, data-safety answers |
| [`docs/ANDROID_COVERAGE.md`](docs/ANDROID_COVERAGE.md) | Which of the 254 web tools already exist in the app, and why the rest do not (yet) |

---

## Principles

1. **No fake tools.** Nothing is listed as live until it produces a real result.
2. **No uploads.** Text, files and numbers stay in the tab. The tool pages say so, and the
   code backs the claim up.
3. **No dark patterns.** No forced sign-up, no paywall teaser, no "download our app".
4. **No invented credentials.** Publisher IDs, analytics IDs and legal claims are only
   ever supplied by their owner.
5. **Copy matches code.** Worked examples are generated from the functions they describe;
   the catalogue test keeps the two honest.
