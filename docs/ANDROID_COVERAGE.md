# Android coverage against the website

The website ships **254 tools**. The Android app shipped 87 when this audit was
first written; it now ships **186**. This document maps every web tool to its
Android counterpart by *function* rather than by slug, because the two codebases
name the same job differently (`text-to-slug-converter` on the web is `slug` in
the app).

**Result: 218 of 254 web tools now have an Android counterpart. 36 do not, and all
36 are file-in/file-out tools (19 PDF, 16 image, 1 QR reader).**

A web tool counts as covered when the app produces the same answer for the same
inputs, and when the app's JVM suite asserts that answer. "Partial" means the app
answers the core question but not every mode of the web tool (the app's
`unit-converter`, for example, covers length, mass, volume and temperature where
the web has separate speed and area converters).

## By category

| Category | Web | In the app | Missing |
| --- | --- | --- | --- |
| business | 19 | 19 | 0 |
| calculators | 28 | 28 | 0 |
| developer | 30 | 29 | 1 |
| education | 18 | 18 | 0 |
| everyday | 25 | 25 | 0 |
| finance | 26 | 26 | 0 |
| images | 20 | 4 | 16 |
| internet | 10 | 10 | 0 |
| pdf | 19 | 0 | 19 |
| security | 12 | 12 | 0 |
| seo | 24 | 24 | 0 |
| text | 23 | 23 | 0 |
| **Total** | **254** | **218** | **36** |

## What was ported, and how it is verified

Each wave below was compiled and tested by the `Android` workflow before the next
one started. Every tool is data plus one pure function in
`app/src/main/java/ng/name/toolz/data/`, and `CatalogTest` asserts two things
about all 186: the tool answers from its own defaults, and rubbish input never
throws. On top of that, per-tool assertions pin the actual answers.

| Wave | Tools | Where |
| --- | --- | --- |
| SEO diagnostics and schema generators | 18 | `CatalogSeo.kt` |
| Business generators (letters, names, slogans, signatures, costs, QR vCard) | 13 | `CatalogBusiness.kt` |
| Calculators (expression engine, fractions, matrix, ratio, probability, surds) | 7 | `CatalogCalc2.kt`, `Expr.kt` |
| Developer (CSS/HTML/JS/XML formatters and minifiers, JSON→CSV, QR, regex, XML check) | 13 | `CatalogDev2.kt`, `Qr.kt` |
| Text (Markdown both ways, placeholder text, slug→title) | 5 | `CatalogText2.kt`, `Markdown.kt` |
| Internet (CIDR, canonical URLs, domains, meta/OG, sitemaps, user agents) | 7 | `CatalogInternet.kt` |
| Finance (revenue, payoff, inflation, overtime, ownership, yield, cost averaging) | 8 | `CatalogFinance2.kt` |
| Education (attendance, number words, notation, tables, cards, quizzes, citations) | 9 | `CatalogEducation2.kt` |
| Everyday health (body fat, calories, ovulation, pregnancy dates, pace, speed, water) | 7 | `CatalogEveryday2.kt` |
| Security (privacy and terms drafts, cookie checklist, AES-256-GCM, link hygiene) | 5 | `CatalogSecurity2.kt` |
| Timers (countdown, pomodoro, stopwatch) with a live clock panel | 3 | `CatalogTimers.kt`, `ui/components/Timers.kt` |
| Image maths (dimensions, DPI, resolution, social presets) | 4 | `CatalogImageMath.kt` |
| **Total ported** | **99** | |

Two of these deserve a note, because the obvious implementation would have been
dishonest:

- **`currency-converter`** ships as a converter that takes *the rate your bank
  quotes*, not a bundled rate table. Exchange rates move every minute and this app
  has no network and no licensed feed; a stale table would be invented data. The
  tool does the conversion, the cross-rate and the round trip, and says plainly
  where the rate has to come from.
- **`text-encryption-demo`** is a real cipher (AES-256-GCM, PBKDF2-HMAC-SHA256 at
  120,000 rounds, random salt and IV), not a base64 disguise. The JVM test
  round-trips a message and proves a wrong passphrase fails.

## What is still missing

All 36 remaining tools take a file in and give a file back, so they cannot live in
the current `Map<String, String> → ToolResult` model. They need a picker, a
pipeline and an export path (Storage Access Framework plus MediaStore), which is a
separate subsystem, not a port.

### images — 16 missing

`base64-to-image-converter`, `exif-data-viewer`, `favicon-generator`,
`image-background-color-changer`, `image-blur-tool`, `image-color-picker`,
`image-compressor`, `image-cropper`, `image-format-converter`,
`image-metadata-viewer`, `image-pixelator`, `image-resizer`,
`image-to-base64-converter`, `jpg-to-png-converter`, `png-to-jpg-converter`,
`webp-converter`

All are feasible on device with `BitmapFactory` and `androidx.exifinterface`, with
no network and no paid API.

### pdf — 19 missing

`document-word-counter`, `docx-to-pdf-converter`, `jpg-to-pdf-converter`,
`pdf-compressor`, `pdf-file-size-reducer`, `pdf-merger`, `pdf-metadata-viewer`,
`pdf-page-counter`, `pdf-page-extractor`, `pdf-page-reorder-tool`, `pdf-rotator`,
`pdf-splitter`, `pdf-to-jpg-converter`, `pdf-to-png-converter`,
`pdf-to-text-extractor`, `pdf-watermark-tool`, `png-to-pdf-converter`,
`text-to-pdf-converter`, `word-counter-for-pdf`

Creation (text and image to PDF) can be done with an in-house writer and stays
JVM-testable. Manipulation (merge, split, rotate, reorder, watermark) needs a
parser; the honest options are a bundled library such as PdfBox-Android, which adds
roughly 10 MB to the bundle, or a purpose-built subset. `docx-to-pdf` can extract
text from the docx zip and write a text-only PDF, but it cannot preserve layout, and
the tool has to say so.

### developer — 1 missing

`qr-code-reader` — decoding needs pixels (a chosen image or a camera frame), so it
belongs to the same media pipeline. Generation already ships as `qr-code`.

## Deliberate design rules that survived the port

- Every tool computes on device. No tool in the app makes a network call.
- No tool appears in the catalogue until its maths is asserted in `CatalogTest`.
- Counts on the home screen are derived from `allTools`, never typed by hand.
- Templates that touch the law (privacy, terms) say what they are — a skeleton to
  be reviewed — and never claim to be legal advice.
- Health estimates name their formula and their limits instead of pretending to be
  diagnosis.
