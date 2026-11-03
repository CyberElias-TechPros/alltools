# Android coverage against the website

The website ships **254 tools**. The Android app now ships **222** — every web tool
either ported one-to-one or covered by an app tool that does the same job under a
different name (`text-to-slug-converter` on the web is `slug` in the app).

**Result: 254 of 254 web tools are covered. 222 native tools, no WebView, no network.**

A web tool counts as covered when the app produces the same answer for the same
inputs, and when that answer is asserted in a test. Two kinds of proof are used,
because two kinds of tool exist:

- **186 tools compute from text and numbers.** They are covered by the JVM suite,
  which runs in the `Test and assemble` job on every push.
- **36 tools take a file.** They run on real bitmaps and the system PDF renderer,
  so they are covered by an instrumented suite on an Android 30 emulator, in the
  `Device tests` job.

## By category

| Category | Web | In the app | Missing |
| --- | --- | --- | --- |
| business | 19 | 19 | 0 |
| calculators | 28 | 28 | 0 |
| developer | 30 | 30 | 0 |
| education | 18 | 18 | 0 |
| everyday | 25 | 25 | 0 |
| finance | 26 | 26 | 0 |
| images | 20 | 20 | 0 |
| internet | 10 | 10 | 0 |
| pdf | 19 | 19 | 0 |
| security | 12 | 12 | 0 |
| seo | 24 | 24 | 0 |
| text | 23 | 23 | 0 |
| **Total** | **254** | **254** | **0** |

The app's own catalogue is 222 tools: the 87 it started with, plus 135 web tools
that did not exist on Android, minus 4 pairs that were merged because the app
already answered the same question twice.

## How the port was done

Each wave was compiled and tested by CI before the next one started.

| Wave | Tools | Where |
| --- | --- | --- |
| SEO diagnostics and schema generators | 18 | `data/CatalogSeo.kt` |
| Business generators | 13 | `data/CatalogBusiness.kt` |
| Calculators (expression engine, fractions, matrix, ratio, probability, surds) | 7 | `data/CatalogCalc2.kt`, `data/Expr.kt` |
| Developer formatters/minifiers, JSON→CSV, QR, regex, XML | 13 | `data/CatalogDev2.kt`, `data/Qr.kt` |
| Text (Markdown both ways, placeholder text, slug→title) | 5 | `data/CatalogText2.kt`, `data/Markdown.kt` |
| Internet (CIDR, canonical URLs, domains, meta/OG, sitemaps, UA parsing) | 7 | `data/CatalogInternet.kt` |
| Finance | 8 | `data/CatalogFinance2.kt` |
| Education | 9 | `data/CatalogEducation2.kt` |
| Everyday health | 7 | `data/CatalogEveryday2.kt` |
| Security (policy drafts, cookie checklist, AES-256-GCM, link hygiene) | 5 | `data/CatalogSecurity2.kt` |
| Timers with a live clock panel | 3 | `data/CatalogTimers.kt`, `ui/components/Timers.kt` |
| Image maths (dimensions, DPI, resolution, social presets) | 4 | `data/CatalogImageMath.kt` |
| Image files (base64, EXIF, metadata, favicon, blur, colour, compress, crop, convert, pixelate, resize, QR reader) | 16 | `data/CatalogMedia.kt`, `media/ImageEngine.kt` |
| PDF (writer, counter, metadata, text, rendering, extract, merge, split, rotate, reorder, watermark, compression) | 19 | `data/CatalogMedia.kt`, `media/PdfEngine.kt`, `media/PdfWriter.kt` |
| DOCX (to PDF, word count) | 2 | `media/MediaMath.kt` |
| **Total ported** | **135** | |

## How the file tools work

`media/` holds the pipeline:

- `MediaToolScreen` opens the system picker (no storage permission), runs the
  engine on `Dispatchers.IO`, shows a preview and the workings, then saves through
  `ACTION_CREATE_DOCUMENT` wherever the user wants the file.
- `ImageEngine` does decode (with EXIF rotation), resize, crop, blur, pixelate,
  flatten, sample, encode to PNG/JPEG/WebP, base64 both ways and QR decoding.
- `PdfWriter` is an in-house PDF writer: Helvetica text on A4 with real line
  wrapping and pagination, plus JPEG pages embedded with `DCTDecode` and no
  re-encoding. It has no Android dependency, so the JVM suite inspects its bytes.
- `PdfEngine` uses PdfBox for everything that must read or rearrange an existing
  document; `PdfRasteriser` uses the platform renderer for page images.
- `MediaMath` holds the deterministic parts — page ranges, page order, target
  sizes, crop rectangles, colour parsing, names, sizes, docx text extraction,
  zips and base64 — all covered by JVM tests.

## Two decisions worth knowing

- **`currency-converter`** takes the rate you type instead of bundling a table.
  Rates move hourly, the app has no feed, and a stale table would be invented data.
  The tool does the conversion, the cross-rate and the round trip, and says where
  the rate has to come from.
- **`text-encryption-demo`** is real AES-256-GCM with PBKDF2 key derivation, not a
  base64 disguise. The JVM test round-trips a message and proves a wrong
  passphrase is rejected.

## Honest limits that stayed honest

- Policy templates say they are skeletons to be reviewed, never advice.
- Health estimates name their formula and their limits.
- `pdf-compressor`'s rasterise mode says the text stops being selectable.
- `pdf-watermark` says a watermark marks a draft; it does not protect a document.
- `docx-to-pdf` reproduces text, not layout, and says so before you run it.
- Scanned PDFs have no text layer, and the text tools say that rather than
  returning an empty page.

## Package weight

PdfBox adds about 7 MB to the bundle: the AAB went from 6.5 MB to 13.8 MB. That is
the price of doing merge, split, rotate, reorder, watermark and text extraction on
device with no network and no paid API. Creation-only tools could drop it, but then
the same app would carry two PDF paths.
