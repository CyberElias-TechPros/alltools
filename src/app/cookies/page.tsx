import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";
import Link from "next/link";
import { PageShell } from "@/components/page-shell";

export const metadata: Metadata = pageMetadata({
  title: "Cookie Policy",
  description: "How Tools uses cookies and local storage — and why the site works with none of them enabled.",
  path: "/cookies/",
  keywords: ['cookie policy', 'cookies', 'privacy'],
});

export default function CookiesPage() {
  return (
    <PageShell
      title="Cookie Policy"
      intro="The site is designed to work without tracking cookies. This page explains exactly what is stored and why."
      breadcrumbs={[{ href: "/cookies/", label: "Cookie policy" }]}
      updated="2 November 2025"
    >
      <h2>1. Do you use cookies?</h2>
      <p>
        Not by default. Loading any tool requires no cookie. We use your browser&apos;s local storage
        for preferences, which is functionally similar but stays on your device and is never sent to
        a server in a request header.
      </p>

      <h2>2. What is stored in your browser</h2>
      <ul>
        <li>
          <strong>tools:theme</strong> — your appearance choice (light, dark or system). Stored
          until you clear site data.
        </li>
        <li>
          <strong>tools:recent</strong> — the last six tool pages you opened, used to offer
          shortcuts in the search panel. Stored until cleared.
        </li>
        <li>
          <strong>tools:consent</strong> — your analytics choice, so we do not ask repeatedly. Only
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

      <h2>4. Advertising cookies</h2>
      <p>
        Advertising is not currently enabled, so no advertising cookies are set. If advertising is
        enabled in future, Google and its partners may set cookies to limit repetition, measure
        performance and — where consent has been obtained — personalise ads. Before that happens, a
        Google-certified consent management platform will be integrated for visitors in the EEA, UK
        and Switzerland.
      </p>

      <h2>5. Managing your choices</h2>
      <ul>
        <li>Use the cookie settings control in the footer to change an analytics choice.</li>
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
