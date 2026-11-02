# Testing & QA

The site's value is a **correct number or string**. Every tool's maths and parsing lives in a
pure TypeScript module under `src/lib/`, which is why 685 tests can cover 254 tools without a
browser, a DOM or a network.

```bash
npm test             # vitest run — 7 files, 139 tests
npm run test:watch   # watch mode while developing
npm run typecheck    # tsc --noEmit (strict)
npm run check        # typecheck → test → production build
```

Run `npm run check` before every commit. It is the same gate a CI job would run.

---

## 1. Test suite map

| File | Tests | Covers |
| --- | --- | --- |
| `tests/text.test.ts` | 38 | counts, reading time, case conversion, dedupe, sorting, whitespace, slugs, find & replace, lorem generation, diffing, keyword density |
| `tests/calc.test.ts` | 22 | percentages, percentage change, discount, VAT, calendar age, date spans, business days, mean/median/mode, variance, standard deviation, GPA |
| `tests/finance.test.ts` | 18 | loan payments and amortisation schedule, compound interest, profit margin, ROI, payoff totals |
| `tests/dev.test.ts` | 25 | JSON formatting/validation, Base64 (ASCII, UTF-8, URL-safe, padding), HTML entities, JWT decode/expiry, colour parsing and WCAG contrast, line and word diff, regex helpers |
| `tests/units.test.ts` | 13 | length, mass, temperature (including the offset conversions), volume, speed, data sizes, time zones |
| `tests/search.test.ts` | 9 | ranking, exact vs partial matches, keyword hits, case-insensitivity, empty query, planned tools excluded |
| `tests/catalogue.test.ts` | 14 | editorial + structural guardrails for all tools and guides |

### What each suite was written to catch

The suite is not decoration; each group exists because of a real defect or a real risk:

- **Percentage density denominator.** `keywordFrequency` originally divided by the filtered
  token list, inflating density (50% became 60%). The denominator is now every token, and the
  case is pinned.
- **HSL parsing.** `parseColor("hsl(243, 75%, 59%)")` returned `NaN` because `Number("75%")`
  is `NaN`. Percent signs are stripped, and a round-trip test asserts the RGB result within a
  rounding tolerance (HSL is a rounded representation, so an exact match would be a false
  requirement).
- **Inclusive date arithmetic.** `businessDaysBetween(Mon 3 Mar, Fri 21 Mar)` excluded the
  end date and returned 14 instead of 15. The loop is inclusive and the test asserts
  symmetry when the inputs are reversed.
- **Hand-written examples drifting from code.** The standard-deviation page claimed σ = 8.30
  while the implementation produced 8.70 (variance 75.76, sample s = 9.73). The copy was
  corrected *from* the code, and the test pins those numbers so the pair cannot diverge
  again.
- **Live tool with no component.** `gpa-calculator` was in the registry with no React
  component, so its page rendered a "still being built" panel. The catalogue test now
  enforces a strict bijection between live tools and registered components.
- **Wrong expectations.** Several first failures were the *test* being wrong, not the code
  (character count 28 not 27, "Over" capitalised by AP title case, the anchor "Jumps Over").
  The rule: when a test and the implementation disagree, decide which one is wrong from
  first principles and document it in the commit — do not "fix" the code to match a guess.

## 2. Catalogue guardrails (`tests/catalogue.test.ts`)

This suite is the editorial immune system. It fails the build if any of these break:

| Guard | Why it matters |
| --- | --- |
| `validateToolCatalogue()` returns no errors | structural sanity for every `ToolDefinition` |
| ≥40 live tools | the launch portfolio floor from the blueprint |
| every slug unique and URL-safe | canonical URLs must be stable |
| live tools ↔ registered components is a bijection | no missing tool, no orphan component |
| no components for non-live tools | planned tools must not be half-rendered |
| every tool's category exists | no dead category links |
| SEO title ≤ 65 chars, description 70–175 chars | search-result truncation |
| ≥3 how-to steps, ≥2 worked examples, ≥2 limitations, ≥3 FAQs | thin-content guard against AdSense and helpful-content penalties |
| no duplicate FAQ questions per tool | duplicate structured data is a quality signal against the site |
| related tools exclude the current tool | no self-links |
| per-category counts are consistent | homepage/category/footer counts must agree |
| search index covers every live tool | nothing is invisible to search |
| guides link only to live tools, and slugs are unique | no 404s from editorial pages |

Adding a tool without content, or removing a component, is a test failure — not a
"we'll fix it later".

## 3. Why there are no component tests (yet)

The React layer is intentionally thin: it formats inputs, calls a pure function, and renders
`{ value }` or `{ error }`. Testing it with a DOM would mostly test React. The higher-value
next step is end-to-end coverage of the actual user path (type → result → copy), which is
listed in [`ROADMAP.md`](../ROADMAP.md) as an open item because browser binaries are not
available in this build environment. Until then, section 4 is the compensating control.

## 4. Manual QA script

Run on every release, in a **private window** (so `localStorage` starts empty).

### 4.1 Site-wide

1. Homepage loads with one H1, the search box focused by click, and no layout shift after
   fonts load.
2. `⌘K` / `Ctrl-K` opens search; typing "percent" shows percentage tools; arrows move the
   highlight; `Enter` opens the tool; `Escape` closes and returns focus.
3. Search with no results shows a helpful empty state, not a blank panel.
4. Directory filter narrows live tools only — a planned tool never appears anywhere.
5. Every footer link, header link and policy page opens without a 404.
6. Theme toggle: dark → reload → still dark; system preference respected on first visit.
7. Cookie banner does not appear (no GA ID configured). With a GA ID set, declining leaves
   the Network panel free of third-party requests.
8. No ad frame anywhere (ads are inert by default).
9. Zoom the browser to 200%: no clipped text, no horizontal scroll on a 320 px viewport.

### 4.2 Per tool (repeat for each of the 41)

1. Page title, H1 and tagline match the tool.
2. The tool is the first interactive element — above all prose and any ad slot.
3. Type a realistic input; the result appears without pressing a button (where the
   computation is instant).
4. Copy the result; the button confirms; paste elsewhere and compare.
5. Clear the input: the tool shows a neutral empty state, not `NaN`, `undefined`, `0`, or a
   blank panel.
6. Enter invalid input: a message appears next to the offending field and is announced
   (`role="alert"` / `aria-live`); nothing throws in the console.
7. Check the worked example in the page against the tool's own output — identical numbers.
8. Tab through the whole tool: every control is reachable, focus is visible, order is
   logical.
9. On a phone (or 375 px viewport), the result is visible without scrolling past the input.

### 4.3 High-risk tools — extra cases

| Tool | Cases to try |
| --- | --- |
| percentage-calculator | zero whole, negative values, very small decimals |
| percentage-increase-decrease-calculator | 0 → 100 (no `Infinity`), decrease, negative baseline |
| discount-calculator | 100% discount, discount > price |
| vat-calculator | add vs remove VAT, 0% rate, rounding on `.005` |
| age-calculator | 29 Feb birthday in a non-leap year, birth date after today |
| days-between-dates-calculator | same day, reversed dates, a span crossing a month end |
| average / standard-deviation | single value (sample mode), all-identical values, large list |
| gpa-calculator | zero-credit course, no courses, 4.0 vs 5.0 vs 10-point scale |
| loan-calculator | 0% interest, 1-month term, rounding of the final payment |
| compound-interest-calculator | monthly vs annual compounding, zero rate, 0 years |
| json-formatter | invalid JSON, deeply nested input, non-ASCII and emoji |
| base64 | emoji and CJK text, URL-safe mode, missing padding |
| jwt-decoder | malformed token, expired token (no verification claimed) |
| hash-generator | empty string, 1 MB text, every offered algorithm |
| timestamp-converter | epoch 0, negative epoch, DST boundary in the visitor's zone |
| color-code-converter | 3-digit hex, `rgb()` with spaces, out-of-range values, contrast pairs |
| unit-converter | 0, negative, very large values, cross-family conversion attempt |
| temperature-converter | -40 (C = F), absolute zero, below absolute zero |
| time-zone-converter | half-hour offsets (IST), DST transition day, day rollover |
| password-generator | every option off, length extremes, ambiguous-character toggle |
| keyword-density-analyzer | empty text, one-word text, repeated phrase |
| serp-snippet-previewer | title too long, no description, emoji in title |
| robots-txt-generator | no rules (must not produce a block-everything file by accident) |

## 5. Accessibility checks

- **Structure:** one `<h1>` per page; heading levels never skip; landmarks (`header`,
  `main`, `footer`, `nav`, `aside`) present.
- **Forms:** every input has a `<label>` or `aria-label`; errors are programmatically
  associated and announced; no placeholder is the only label.
- **Keyboard:** full tab path; visible focus ring everywhere; dialogs trap and restore focus;
  no keyboard trap in the tool tables (add/remove rows in the GPA tool).
- **Motion and colour:** results are not conveyed by colour alone; contrast meets 4.5:1 for
  body text in both themes (the colour tool can be used to check the palette itself).
- **Screen reader (pending):** VoiceOver on macOS and NVDA on Windows, focusing on the tool
  result region and the search dialog.

## 6. Cross-browser matrix

| Browser | Why it matters here |
| --- | --- |
| Chrome (desktop + Android) | largest share; clipboard API, `Intl` time zones |
| Safari (macOS + iOS) | different `Intl` data, stricter clipboard permissions, 16px input zoom |
| Firefox | `Intl` time zone support, `structuredClone` availability |
| Samsung Internet / Edge | mobile keyboards, shared Chromium behaviours |

Checks that differ per browser: clipboard copy feedback, number input spinners, date pickers,
`Intl.DateTimeFormat` time-zone names, `localStorage` in private mode.

## 7. Performance checks

- `npm run build` and read the route table: first-load JS must stay flat as tools are added.
- Lighthouse (mobile, throttled) on the production domain: performance ≥ 90, accessibility
  ≥ 95, no CLS from fonts, images or ad slots.
- Verify a tool page downloads only its own tool chunk (Network panel — a single
  `text/word-counter` style chunk rather than all 41).

## 8. Regression workflow

1. Reproduce with the smallest possible input.
2. Write a failing test in the matching suite (or a new one) that encodes the *expected*
   behaviour.
3. Fix the implementation, not the test — unless the test itself was wrong, in which case
   say so explicitly in the commit message.
4. If the bug was visible in copy (a worked example or a limitation), correct the data file
   in the same commit and re-run `tests/catalogue.test.ts`.
5. Run `npm run check`; commit.

## 9. Known gaps

| Gap | Consequence | Next step |
| --- | --- | --- |
| No browser in the build environment | Interactive behaviour verified structurally, not by clicking | Manual pass (§4) on a real device; add Playwright once browsers are available |
| No visual regression baselines | A CSS change can silently break a layout | Add screenshot tests per template (home, directory, tool, guide, policy) |
| No automated accessibility scan | Missed contrast/label regressions | Add axe-core to the E2E suite |
| No load/soak testing | Not applicable to a static site with no backend | — |
| Analytics events untested | A renamed event breaks reporting silently | Add unit tests around the event vocabulary in `src/lib/analytics.ts` |

## 10. Coverage expectations when adding a tool

For every new tool:

- 1 happy-path test with realistic input.
- 1 boundary test (empty, zero, negative, single element, or maximum).
- 1 invalid-input test proving an error object, not a throw.
- 1 pinned worked example that matches the copy in `src/lib/tools/data/*.ts`.

That is ~4 tests per tool. Today the logic suites average roughly three per tool, with the
heavier calculators and developer tools carrying five to seven each.
