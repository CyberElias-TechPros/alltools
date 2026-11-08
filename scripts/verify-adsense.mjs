#!/usr/bin/env node
/**
 * AdSense readiness check against the exported site.
 *
 * AdSense verifies site ownership by fetching page source, so the loader has to
 * be a real <script> element in the HTML the server sends — not something the
 * browser injects after hydration. This script walks `out/` and fails loudly if
 * any page is missing the tag, if the tag is outside <head>, or if `ads.txt`
 * does not name the publisher.
 *
 *   npm run build && npm run verify:adsense
 */
import { readdirSync, readFileSync, statSync, existsSync } from "node:fs";
import { join } from "node:path";

const PUB = "ca-pub-9124992249317290";
const PUB_NUMBER = "pub-9124992249317290";
const ROOT = process.argv[2] ?? "out";

if (!existsSync(ROOT)) {
  console.error(`✗ ${ROOT}/ not found — run "npm run build" first.`);
  process.exit(1);
}

function walk(dir) {
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    return statSync(path).isDirectory() ? walk(path) : [path];
  });
}

const files = walk(ROOT).filter((file) => file.endsWith(".html"));
const problems = [];

let withScript = 0;
let withMeta = 0;

for (const file of files) {
  const html = readFileSync(file, "utf8");
  const headEnd = html.indexOf("</head>");
  const head = headEnd === -1 ? "" : html.slice(0, headEnd);
  const scriptInHead = /<script[^>]+adsbygoogle\.js\?client=[^>]+>/i.test(head);

  if (scriptInHead) {
    withScript += 1;
    if (!head.includes(PUB)) problems.push(`${file}: loader does not name ${PUB}`);
  } else if (html.includes("adsbygoogle.js")) {
    problems.push(`${file}: loader present but NOT inside <head>`);
  } else {
    problems.push(`${file}: loader missing from page source`);
  }

  if (html.includes(`google-adsense-account" content="${PUB}`)) withMeta += 1;
}

const adsTxt = join(ROOT, "ads.txt");
if (!existsSync(adsTxt)) {
  problems.push("ads.txt missing from the export");
} else {
  const body = readFileSync(adsTxt, "utf8");
  if (!body.includes(`google.com, ${PUB_NUMBER}, DIRECT,`)) {
    problems.push("ads.txt does not declare google.com with the publisher ID");
  }
}

const robots = join(ROOT, "robots.txt");
if (existsSync(robots) && /^\s*Disallow:\s*\/\s*$/m.test(readFileSync(robots, "utf8"))) {
  problems.push("robots.txt disallows the whole site — AdSense cannot crawl it");
}

console.log(`pages checked:            ${files.length}`);
console.log(`loader inside <head>:     ${withScript}`);
console.log(`account meta tag:         ${withMeta}`);
console.log(`ads.txt:                  ${existsSync(adsTxt) ? "present" : "missing"}`);

if (problems.length) {
  console.error(`\n✗ ${problems.length} problem(s):`);
  for (const problem of problems.slice(0, 20)) console.error(`  - ${problem}`);
  if (problems.length > 20) console.error(`  … and ${problems.length - 20} more`);
  process.exit(1);
}

console.log(`\n✓ every page carries <script async src="…adsbygoogle.js?client=${PUB}" crossorigin="anonymous"> in <head>`);
