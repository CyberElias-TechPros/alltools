import type { Metadata } from "next";
import Link from "next/link";
import { PageShell } from "@/components/page-shell";

export const metadata: Metadata = {
  title: "Accessibility Statement",
  description:
    "How Toolora is built for keyboard, screen reader and low-vision users, what we test, and how to report a barrier.",
  alternates: { canonical: "/accessibility/" },
};

export default function AccessibilityPage() {
  return (
    <PageShell
      title="Accessibility Statement"
      intro="A tool that excludes people is not finished. Here is what we implement, what we test, and where we still fall short."
      breadcrumbs={[{ href: "/accessibility/", label: "Accessibility" }]}
      updated="2 November 2025"
    >
      <h2>Our approach</h2>
      <p>
        {`We aim to meet WCAG 2.2 level AA for the site's pages and tools. Accessibility is treated as a defect class — an inaccessible control is a bug, not a nice-to-have.`}
      </p>

      <h2>What is implemented</h2>
      <ul>
        <li>Semantic HTML landmarks, one <code>h1</code> per page and a logical heading order.</li>
        <li>A visible “Skip to content” link as the first focusable element.</li>
        <li>Full keyboard operation, including the search dialog (⌘K / Ctrl+K, arrows, Enter, Escape).</li>
        <li>Visible focus indicators that are not removed anywhere on the site.</li>
        <li>Every input has a programmatically associated label; errors are announced with <code>role="alert"</code>.</li>
        <li>Results regions use <code>aria-live</code> so screen readers hear updates without a page change.</li>
        <li>Colour contrast checked against WCAG ratios; contrast is displayed alongside tool results where colour is the subject.</li>
        <li>Touch targets of at least 40×40 CSS pixels on interactive controls.</li>
        <li><code>prefers-reduced-motion</code> respected — animations are effectively disabled.</li>
        <li>Light and dark themes, with the choice respected on return visits.</li>
        <li>Layouts reflow to 320 CSS pixels without horizontal scrolling.</li>
      </ul>

      <h2>Testing</h2>
      <p>
        Pages are checked with keyboard-only navigation, browser zoom to 200% and 400%, and
        automated checks for heading order, contrast and form labelling. Tools that produce visual
        output — colour conversion, diffing, time zones — are additionally reviewed for a
        non-colour-dependent reading, for example a sign or label alongside a colour.
      </p>

      <h2>Known limitations</h2>
      <ul>
        <li>
          The SERP preview deliberately reproduces Google&apos;s visual styling, which does not meet
          our own contrast targets; the same information is available as text measurements above the
          preview.
        </li>
        <li>
          Extremely large inputs (hundreds of thousands of lines) can slow the tab; we cap or warn
          where possible rather than letting the page freeze silently.
        </li>
        <li>
          Third-party content, if advertising is ever enabled, is outside our control — we will
          restrict placements to reduce interference with tools and navigation.
        </li>
      </ul>

      <h2>Reporting a barrier</h2>
      <p>
        If something is unusable with your assistive technology, please tell us via the{" "}
        <Link href="/contact/">contact page</Link>, choosing “Accessibility problem”. Include the
        tool, your browser and the assistive technology you use. Reported barriers are treated as
        defects with priority over new features, and we will tell you what we changed.
      </p>

      <h2>Feedback loop</h2>
      <p>
        This statement is reviewed whenever the design system changes. It describes our current
        implementation honestly rather than claiming certification we have not obtained.
      </p>
    </PageShell>
  );
}
