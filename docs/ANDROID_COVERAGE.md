# Android coverage against the website

The Android app ships **87 tools**. The website ships **254**. This document maps
every web tool to its nearest Android equivalent, by *function* rather than by slug,
because the two codebases name the same job differently (`text-to-slug-converter`
on the web is `slug` in the app).

**Result: 119 of 254 web tools have an Android counterpart (99 identical, 20 partial). 135 have none.**

A web tool counts as covered when the app produces the same answer for the same
inputs. "Partial" means the app answers the core question but not every mode of the
web tool (for example the app's `unit-converter` covers length, mass, volume and
temperature, but the web has separate speed and area converters).

## By category

| Category | Web | In the app | Missing |
| --- | --- | --- | --- |
| business | 19 | 6 | 13 |
| calculators | 28 | 21 | 7 |
| developer | 30 | 16 | 14 |
| education | 18 | 9 | 9 |
| everyday | 25 | 15 | 10 |
| finance | 26 | 18 | 8 |
| images | 20 | 0 | 20 |
| internet | 10 | 3 | 7 |
| pdf | 19 | 0 | 19 |
| security | 12 | 7 | 5 |
| seo | 24 | 6 | 18 |
| text | 23 | 18 | 5 |
| **Total** | **254** | **119** | **135** |

## What is missing, and how hard it is

### business — 13 missing

Generators (letters, slogans, hashtags, captions) are template-driven string tools — portable, just not yet written.

`business-letter-generator`, `business-name-generator`, `content-calendar-generator`, `email-signature-generator`, `email-subject-line-analyzer`, `hashtag-generator`, `marketing-budget-calculator`, `meeting-cost-calculator`, `project-cost-calculator`, `proposal-template-generator`, `qr-business-card-generator`, `slogan-generator`, `social-media-caption-formatter`

### calculators — 7 missing

Pure maths, trivial ports.

`basic-calculator`, `fraction-calculator`, `matrix-calculator`, `probability-calculator`, `ratio-calculator`, `scientific-calculator`, `square-root-calculator`

### developer — 14 missing

QR needs a small encoder library. The CSS/JS/HTML/XML formatters and minifiers are pure string work — easy ports.

`box-shadow-generator`, `css-formatter`, `css-gradient-generator`, `css-minifier`, `html-formatter`, `html-minifier`, `javascript-formatter`, `javascript-minifier`, `json-to-csv-converter`, `qr-code-generator`, `qr-code-reader`, `regex-tester`, `xml-formatter`, `xml-validator`

### education — 9 missing

Formula tools port directly; bibliography/citation need style data.

`attendance-calculator`, `bibliography-formatter`, `citation-formatter`, `flashcard-generator`, `multiplication-table-generator`, `number-to-words-converter`, `random-quiz-generator`, `scientific-notation-converter`, `words-to-number-converter`

### everyday — 10 missing

Timers need foreground services; the health estimators are formulas and port easily.

`body-fat-estimator`, `calorie-estimator`, `countdown-timer`, `ovulation-date-estimator`, `pace-calculator`, `pomodoro-timer`, `pregnancy-due-date-calculator`, `running-speed-calculator`, `stopwatch`, `water-intake-estimator`

### finance — 8 missing

currency-converter needs a licensed rate feed, so it stays out until one is chosen. The rest are arithmetic.

`business-revenue-calculator`, `currency-converter`, `debt-payoff-calculator`, `inflation-calculator`, `overtime-calculator`, `percentage-of-ownership-calculator`, `rental-yield-calculator`, `stock-average-price-calculator`

### images — 20 missing

Needs native bitmap work (BitmapFactory, ExifInterface, WebP encode). All 20 are feasible on device with no network.

`base64-to-image-converter`, `exif-data-viewer`, `favicon-generator`, `image-background-color-changer`, `image-blur-tool`, `image-color-picker`, `image-compressor`, `image-cropper`, `image-dimension-calculator`, `image-dpi-calculator`, `image-format-converter`, `image-metadata-viewer`, `image-pixelator`, `image-resizer`, `image-resolution-checker`, `image-to-base64-converter`, `jpg-to-png-converter`, `png-to-jpg-converter`, `social-media-image-size-checker`, `webp-converter`

### internet — 7 missing

domain-name-analyzer and canonical-url-checker need DNS/HTTP; the rest are string parsers.

`canonical-url-checker`, `domain-name-analyzer`, `ipv4-subnet-calculator`, `meta-tag-generator`, `open-graph-preview-tool`, `sitemap-xml-generator`, `user-agent-parser`

### pdf — 19 missing

Needs a PDF library (PdfRenderer for reading, a writer for merging/creating). 14 of the 19 are feasible offline; docx→pdf is not.

`document-word-counter`, `docx-to-pdf-converter`, `jpg-to-pdf-converter`, `pdf-compressor`, `pdf-file-size-reducer`, `pdf-merger`, `pdf-metadata-viewer`, `pdf-page-counter`, `pdf-page-extractor`, `pdf-page-reorder-tool`, `pdf-rotator`, `pdf-splitter`, `pdf-to-jpg-converter`, `pdf-to-png-converter`, `pdf-to-text-extractor`, `pdf-watermark-tool`, `png-to-pdf-converter`, `text-to-pdf-converter`, `word-counter-for-pdf`

### security — 5 missing

The policy generators are long static templates; the encryption demo needs a cipher choice.

`cookie-policy-checklist-generator`, `privacy-policy-generator`, `terms-conditions-generator`, `text-encryption-demo`, `url-safety-syntax-checker`

### seo — 18 missing

Most are text generators and analysers that port directly; only the site-crawling ones (internal-link-checker, page-size-analyzer) need a fetcher and are deliberately out.

`breadcrumb-schema-generator`, `canonical-tag-generator`, `faq-schema-generator`, `heading-structure-checker`, `hreflang-generator`, `image-alt-text-checker`, `internal-link-checker`, `json-ld-validator`, `keyword-clustering-tool`, `page-size-analyzer`, `readability-checker`, `robots-txt-tester`, `schema-markup-generator`, `seo-checklist-generator`, `seo-text-analyzer`, `sitemap-validator`, `website-content-outline-generator`, `website-launch-checklist`

### text — 5 missing

Markdown renderers need a parser; the rest are string work.

`html-to-markdown-converter`, `markdown-previewer`, `markdown-to-html-converter`, `random-text-generator`, `slug-to-text-converter`

## Deliberate exclusions

- **currency-converter** — needs a licensed exchange-rate feed. Ship it with a rate
  source, or not at all; a bundled static table would be wrong within a day.
- **Internal-link-checker, page-size-analyzer, canonical-url-checker, robots-txt-tester,
  sitemap-validator, domain-name-analyzer** — these crawl a live site. On a phone that
  is slow, battery-hungry and privacy-hostile, so they stay web-only until there is a
  design that makes sense offline.
- **docx-to-pdf-converter** — needs a document renderer far beyond a phone-sized tool.

## Rule all of this obeys

Nothing is listed in the app until it computes a correct answer in a JVM test. The
counts on the home screen and in Settings are derived from `allTools`, so the app can
never advertise a tool it does not have.
