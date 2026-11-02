import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";
import Link from "next/link";
import { PageShell } from "@/components/page-shell";
import { liveTools } from "@/lib/tools/registry";
import { siteConfig } from "@/lib/site";

export const metadata: Metadata = pageMetadata({
  title: "About Tools",
  description: "Who runs Tools, why the tools exist, how they are built and tested, and what we will never do with your data.",
  path: "/about/",
  keywords: ['about tools', 'free online tools', 'privacy', 'how it works'],
});

export default function AboutPage() {
  return (
    <PageShell
      title="About Tools"
      intro="A small, independent tools platform built on a simple idea: a utility page should do one job well, explain itself, and get out of the way."
      breadcrumbs={[{ href: "/about/", label: "About" }]}
      updated="2 November 2025"
    >
      <h2>What this site is</h2>
      <p>
        {siteConfig.name} is a free collection of {liveTools.length} online tools for writing,
        calculating, converting, formatting and checking. Every tool runs in your browser. There is
        no account system, no subscription and no upload endpoint — the text, numbers and files you
        work with stay on your device.
      </p>
      <p>
        The site is an independent project. It is not affiliated with Google, Microsoft, any bank or
        any of the services whose formats it helps you work with.
      </p>

      <h2>Why these tools exist</h2>
      <p>
        Most online utilities are wrapped in obstacles: an upload step that is not necessary, a
        sign-up wall, three cookie banners, or a page that ranks for a query but does not actually
        answer it. We wanted the opposite — a page that loads instantly, does the job locally, and
        tells you how the answer was produced.
      </p>
      <p>
        The tools are chosen for genuine, recurring usefulness rather than search volume alone. Each
        one is documented with the formula or algorithm behind it, worked examples, and an honest
        statement of its limits.
      </p>

      <h2>How tools are built and checked</h2>
      <ul>
        <li>
          <strong>Calculation logic is separated from the interface.</strong> Maths and text
          processing live in small, pure modules that can be tested independently of the UI.
        </li>
        <li>
          <strong>Every tool is tested before publication.</strong> Worked examples on the page are
          checked against the implementation, and edge cases such as zero, empty input, negative
          numbers and leap days are covered.
        </li>
        <li>
          <strong>Nothing is published as a placeholder.</strong> A tool either works or it is
          listed on the <Link href="/roadmap/">roadmap</Link> as planned. We do not create empty
          pages to fill a category.
        </li>
        <li>
          <strong>Content is written for the tool.</strong> No page is a template with the name
          swapped out; each explains its own method, examples and limitations.
        </li>
      </ul>

      <h2>How the site is funded</h2>
      <p>
        {liveTools.length} tools cost nothing to use and there is no paywall. If the site meets the
        relevant requirements, we may display advertising through Google AdSense. Advertising will
        never be placed inside a tool&apos;s controls, results or download buttons, and we will not
        ask anyone to click an advert.
      </p>
      <p>
        If advertising is enabled, this page and the{" "}
        <Link href="/privacy-policy/">privacy policy</Link> will be updated to describe exactly what
        is loaded and how consent is handled before any ad code goes live.
      </p>

      <h2>Who runs it</h2>
      <p>
        {siteConfig.name} is operated by an independent developer. Contact details are on the{" "}
        <Link href="/contact/">contact page</Link>. Corrections and tool requests are genuinely
        welcome — the roadmap is shaped by what people actually need.
      </p>

      <h2>Principles we will not break</h2>
      <ol>
        <li>No fake tools and no placeholder functionality.</li>
        <li>No unnecessary collection of visitor data.</li>
        <li>No copied or spun content.</li>
        <li>No advertising presented as a tool control.</li>
        <li>No claims of accuracy we cannot support.</li>
      </ol>
    </PageShell>
  );
}
