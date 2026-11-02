# Toolora

**Fast, free, privacy-first online tools that run entirely in your browser.**

Toolora is a static Next.js app that hosts a growing catalogue of small utilities — text
cleaners, calculators, converters, developer helpers, SEO previews — with no sign-up, no
uploads and no server-side processing. Every tool is a pure TypeScript function wrapped in
a React component, so results are instant, work offline after first load, and can be
verified by automated tests.

- **Live tools:** 41 across 7 categories
- **Test suite:** 139 tests in 7 files (`npm test`)
- **First-load JS:** one route's worth of code per tool (each tool is code-split)
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
│  └─ globals.css           Design system: CSS variables, dark mode, components
├─ components/              Presentation only (no business logic)
│  ├─ ui.tsx                Button, Field, inputs, StatGrid, ResultCard, CopyButton…
│  ├─ site-header.tsx       Sticky nav + ⌘K search trigger
│  ├─ search-dialog.tsx     Client search, keyboard-driven, recents in localStorage
│  ├─ tool-card.tsx         Directory/category card
│  ├─ ad-slot.tsx           Renders nothing unless ads are explicitly enabled
│  └─ analytics.tsx         Consent banner + consent-gated GA4 loader
├─ lib/
│  ├─ text.ts calc.ts finance.ts units.ts dev.ts regex.ts timezone.ts diff.ts
│  │                        Pure, dependency-free logic — the part tests cover
│  ├─ search.ts            Scoring/ranking for the command palette
│  ├─ guides.ts             Editorial articles as structured data
│  ├─ site.ts               Site config, nav, footer links, env flags
│  └─ tools/
│     ├─ types.ts           ToolDefinition / CategoryDefinition models
│     ├─ categories.ts      12 categories (7 live, 5 planned)
│     ├─ registry.ts        Concatenates data files, derived helpers
│     └─ data/*.ts          Editorial content for each tool (SEO copy, examples, FAQs)
└─ tools/
   ├─ registry.tsx          slug → lazily imported React component
   └─ text/ calculators/ finance/ developer/ everyday/ seo/ security/
                            One file per tool: inputs, state, live result
```

**Rule of thumb:** logic lives in `src/lib`, copy lives in `src/lib/tools/data`, and
`src/tools/*` only wires the two together. That is why the test suite can cover 41 tools
with no DOM or browser needed.

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
| `NEXT_PUBLIC_SITE_URL` | Canonical origin for canonicals, sitemap, robots, JSON-LD | `https://toolora.example.com` (placeholder) |
| `NEXT_PUBLIC_GA_ID` | GA4 measurement ID; analytics also requires cookie consent | empty — no analytics |
| `NEXT_PUBLIC_ADSENSE_CLIENT` | Publisher ID from Google after approval | empty — no ad script |
| `NEXT_PUBLIC_ADSENSE_SLOT_TOOL` | Ad unit id for the tool-page slot | empty — slot renders nothing |
| `NEXT_PUBLIC_ADS_ENABLED` | Must be exactly `"true"` for ad slots to render | `false` |

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
`/manifest.webmanifest` and a handful of tool pages all return 200, and canonicals point
at the real origin (view source and search for `example.com`).

---

## Documentation

| Document | Contents |
| --- | --- |
| [`docs/BLUEPRINT.md`](docs/BLUEPRINT.md) | Original product plan: catalogue, policies, stack, SEO strategy |
| [`ROADMAP.md`](ROADMAP.md) | Granular build roadmap: what is done, what is next, why, dependencies |
| [`docs/PRD.md`](docs/PRD.md) | Product requirements, audience, jobs to be done, quality bar |
| [`docs/TESTING.md`](docs/TESTING.md) | Test strategy, what each suite covers, manual QA script |
| [`docs/ADSENSE_QA.md`](docs/ADSENSE_QA.md) | Pre-AdSense-application audit with evidence and owner actions |

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
