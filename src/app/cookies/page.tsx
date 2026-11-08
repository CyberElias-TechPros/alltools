import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";
import Link from "next/link";
import { PageShell } from "@/components/page-shell";

export const metadata: Metadata = pageMetadata({
  title: "Cookie Policy",
  description: "How Toolz uses cookies and local storage, which third-party advertising cookies (including Google DoubleClick) may be set, and how to opt out.",
  path: "/cookies/",
  keywords: ['cookie policy', 'cookies', 'privacy', 'doubleclick cookie', 'advertising cookies'],
});

export default function CookiesPage() {
  return (
    <PageShell
      title="Cookie Policy"
      intro="The site is designed to work without tracking cookies. This page explains exactly what is stored and why."
      breadcrumbs={[{ href: "/cookies/", label: "Cookie policy" }]}
      updated="3 November 2026"
    >
      <h2>1. Do you use cookies?</h2>
      <p>
        The tools do not need a cookie, and none of the tools set one. The site carries advertising
        served by Google AdSense, so Google may set cookies for advertising purposes once you accept
        them — storage for ads and analytics starts denied and only changes when you choose.
        Separately, we keep a few preferences in your browser&apos;s local storage, which stays on
        your device and is never sent to a server in a request header.
      </p>

      <h2>2. What is stored in your browser</h2>
      <ul>
        <li>
          <strong>toolz:theme</strong> — your appearance choice (light, dark or system). Stored
          until you clear site data.
        </li>
        <li>
          <strong>toolz:recent</strong> — the last six tool pages you opened, used to offer
          shortcuts in the search panel. Stored until cleared.
        </li>
        <li>
          <strong>toolz:consent</strong> — your analytics choice, so we do not ask repeatedly. Only
          created if analytics are enabled and you make a choice.
        </li>
      </ul>
      <p>
        None of these values identify you, and none are transmitted anywhere. You can delete them by
        clearing site data for this domain in your browser settings.
      </p>

      <h2>3. Optional analytics cookies</h2>
      <p>
        If analytics are enabled, accepting them may create first-party cookies from Google
        Analytics, such as <code>_ga</code> and <code>_ga_*</code>, used to distinguish sessions and
        measure aggregate usage. These are only set after you accept, last up to two years, and can
        be revoked at any time from the cookie settings control in the footer.
      </p>

      <h2>4. Advertising cookies, including Google DoubleClick</h2>
      <p>
        Advertising is switched off until Google approves the publisher account, so no advertising
        cookie is set today. When it is on, this site is supported by advertising served through
        Google AdSense (publisher ID{" "}
        <code className="font-mono text-[0.85em]">ca-pub-9124992249317290</code>). Google and its
        partners may then set advertising cookies — for example to limit how often you see the same
        ad, measure performance, and, where you have consented, personalise ads. Ad storage is
        denied until you choose &ldquo;Accept&rdquo;, and the decision can be reversed at any time.
      </p>
      <p>
        The best-known of those cookies is the <strong>DoubleClick cookie</strong> (also referred to
        as the DART cookie). It identifies a browser, not a person, and lets Google and its partners
        serve adverts based on your visits to this and other websites, avoid showing the same advert
        repeatedly, and report how adverts performed. Third-party vendors and ad networks other than
        Google may set similar cookies when they serve here. You can opt out of the DoubleClick
        cookie in{" "}
        <a href="https://adssettings.google.com/" className="link" rel="noopener noreferrer nofollow" target="_blank">
          Google Ads Settings
        </a>{" "}
        and read Google&apos;s explanation at{" "}
        <a href="https://policies.google.com/technologies/ads" className="link" rel="noopener noreferrer nofollow" target="_blank">
          policies.google.com/technologies/ads
        </a>
        .
      </p>
      <p>
        For visitors in the EEA, the UK and Switzerland, consent is collected through a
        Google-certified consent management platform before any personalised advertising cookie is
        set. Where you decline, you may still see advertising, but it will not be personalised.
      </p>

      <h2>5. Managing your choices</h2>
      <ul>
        <li>Use the cookie settings control in the footer to change your consent choice.</li>
        <li>
          Block or delete cookies for this domain in your browser settings; the tools continue to
          work.
        </li>
        <li>
          Opt out of personalised advertising via{" "}
          <a href="https://myadcenter.google.com/" className="link" rel="noopener noreferrer nofollow" target="_blank">
            Google Ad Center
          </a>
          .
        </li>
      </ul>

      <h2>6. More information</h2>
      <p>
        The <Link href="/privacy-policy/">privacy policy</Link> explains what data is and is not
        collected overall. For questions, use the <Link href="/contact/">contact page</Link>.
      </p>
    </PageShell>
  );
}
