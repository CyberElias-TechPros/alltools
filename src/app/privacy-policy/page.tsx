import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";
import Link from "next/link";
import { PageShell } from "@/components/page-shell";
import { siteConfig } from "@/lib/site";

export const metadata: Metadata = pageMetadata({
  title: "Privacy Policy",
  description: "What Toolz collects (very little), what stays in your browser, how analytics and advertising cookies — including Google DoubleClick — work, and how to opt out.",
  path: "/privacy-policy/",
  keywords: ['privacy policy', 'data protection', 'no uploads', 'gdpr', 'doubleclick cookie'],
});

export default function PrivacyPolicyPage() {
  return (
    <PageShell
      title="Privacy Policy"
      intro="This policy describes the actual behaviour of this website. If a feature is not listed here, it is not running."
      breadcrumbs={[{ href: "/privacy-policy/", label: "Privacy policy" }]}
      updated="3 November 2026"
    >
      <h2>1. Summary</h2>
      <ul>
        <li>Tool input is processed in your browser and is not uploaded to us.</li>
        <li>There are no accounts, no logins and no user profiles.</li>
        <li>
          Optional analytics are disabled by default and only run if you explicitly accept them.
        </li>
        <li>
          Advertising is switched off until Google approves the publisher account. This policy
          already describes everything that runs once it is on, including the Google DoubleClick
          cookie.
        </li>
        <li>Preferences such as your theme choice are stored in your own browser.</li>
      </ul>

      <h2>2. Who we are</h2>
      <p>
        {siteConfig.name} is an independent website that provides free browser-based utilities. You
        can reach the operator at{" "}
        <a href={`mailto:${siteConfig.email}`} className="link">
          {siteConfig.email}
        </a>{" "}
        for any privacy question. The contact address is the data controller&apos;s contact point for
        privacy requests.
      </p>

      <h2>3. Information we do not collect</h2>
      <p>
        We do not ask for your name, email address, phone number or payment details to use the
        tools, because the tools do not require an account. The text, numbers and files you enter
        into a tool are processed by JavaScript on your device. There is no upload endpoint that
        receives them, and they are discarded when you close or reload the page.
      </p>

      <h2>4. Information processed automatically</h2>
      <p>
        Like any website, requests to our hosting provider necessarily include technical information
        such as your IP address, user agent, requested URL and timestamp. Our hosting provider
        processes that data to deliver the site and protect it from abuse, under its own terms and
        retention schedule. We do not combine it with any other information to identify individuals.
      </p>

      <h2>5. Cookies and local storage</h2>
      <p>
        The tools themselves set no cookies — everything you type is handled in your browser. We use
        your browser&apos;s local storage for two things:
      </p>
      <ul>
        <li>
          <strong>Theme preference</strong> — whether you chose light, dark or system appearance.
        </li>
        <li>
          <strong>Recently used tools</strong> — a short list of tool pages you opened, so the
          search panel can offer them again.
        </li>
      </ul>
      <p>
        Both values stay in your browser, are never sent to us, and can be cleared at any time
        through your browser settings. See the <Link href="/cookies/">cookie policy</Link> for detail.
      </p>

      <h2>6. Optional analytics</h2>
      <p>
        Analytics are not enabled by default. If the operator enables them, a consent banner appears
        and nothing is loaded until you accept. If you accept, we may use Google Analytics 4 to
        record aggregate information such as page views, device category and country, and anonymous
        product events such as &ldquo;a tool was used&rdquo;.
      </p>
      <p>
        Analytics events never include the content you type, file names, results, or anything that
        could identify you. IP addresses are anonymised. You can change your choice at any time
        through the cookie settings control in the footer, or by clearing site data.
      </p>

      <h2>7. Advertising and third-party cookies, including Google DoubleClick</h2>
      <p>
        Advertising is not live yet. The slots are built into the page but render nothing until the
        publisher account below is approved and advertising is switched on. Once it is, this site
        is supported by advertising served through Google AdSense (publisher ID{" "}
        <code className="font-mono text-[0.85em]">ca-pub-9124992249317290</code>).
      </p>
      <p>
        <strong>
          Third-party vendors, including Google, use cookies to serve ads based on your prior visits
          to this website or other websites.
        </strong>{" "}
        Google&apos;s use of advertising cookies enables it and its partners to serve ads to you
        based on your visit to this site and/or other sites on the internet. Those cookies include
        the <strong>DoubleClick cookie</strong> — historically documented by Google as the DART
        cookie — which records which adverts a browser has already been shown so the same one is
        not repeated, and which measures how an advert performed. It does not reveal your name,
        your email address, or anything you type into a tool.
      </p>
      <p>
        Other third-party vendors and ad networks may also serve adverts on this site, each under
        its own cookie policy. We do not pass the text you type, file names, results or calculated
        answers to any advertising system.
      </p>
      <p>
        Adverts are placed between content blocks, never inside a tool&apos;s input or result area,
        and never styled to look like a control. We do not pass the text you type into a tool, file
        names or results to an advertising system.
      </p>
      <p>
        Advertising and analytics storage start denied. They are only granted after you choose
        &ldquo;Accept&rdquo; in the cookie banner, and you can withdraw that choice at any time via
        &ldquo;Cookie settings&rdquo; in the footer. For visitors in the European Economic Area, the
        United Kingdom and Switzerland, consent is collected through a Google-certified consent
        management platform before any personalised advertising cookie is set.
      </p>
      <p>
        You can opt out of personalised advertising, and of the DoubleClick cookie specifically, in{" "}
        <a
          href="https://adssettings.google.com/"
          className="link"
          rel="noopener noreferrer nofollow"
          target="_blank"
        >
          Google Ads Settings
        </a>
        , review your choices in{" "}
        <a
          href="https://myadcenter.google.com/"
          className="link"
          rel="noopener noreferrer nofollow"
          target="_blank"
        >
          Google Ad Center
        </a>
        , or opt out of a third-party vendor&apos;s use of cookies for personalised advertising at{" "}
        <a
          href="https://www.aboutads.info/choices/"
          className="link"
          rel="noopener noreferrer nofollow"
          target="_blank"
        >
          aboutads.info
        </a>
        . How Google uses cookies in advertising is set out at{" "}
        <a
          href="https://policies.google.com/technologies/ads"
          className="link"
          rel="noopener noreferrer nofollow"
          target="_blank"
        >
          policies.google.com/technologies/ads
        </a>
        .
      </p>

      <h2>8. Third-party links</h2>
      <p>
        Pages may link to external websites, for example official documentation. Once you follow an
        external link, that site&apos;s privacy policy applies; we do not control it.
      </p>

      <h2>9. Legal bases and your rights</h2>
      <p>
        Where data protection law applies — for example the GDPR in the EEA and UK — we rely on
        legitimate interests for operating and securing the site, and on consent for optional
        analytics and advertising cookies. Depending on your location you may have the right to
        access, correct, delete or restrict processing of your personal data, to object to
        processing, and to data portability.
      </p>
      <p>
        Because we hold no account data, most requests will relate to analytics or advertising
        identifiers controlled by third parties. Contact us and we will explain what is available;
        you also have the right to complain to your local supervisory authority.
      </p>

      <h2>10. Children</h2>
      <p>
        The site is intended for general audiences and is not directed at children under 13. We do
        not knowingly collect personal information from children. Some tools — such as the BMI
        calculator — are intended for adults.
      </p>

      <h2>11. Data retention and security</h2>
      <p>
        We do not retain tool input. Server request logs held by our hosting provider are retained
        under its policy. The site is served over HTTPS and does not store credentials, because
        there are no accounts to store.
      </p>

      <h2>12. International transfers</h2>
      <p>
        Our hosting provider and any analytics or advertising provider may process data outside your
        country. Where required, those providers rely on recognised transfer mechanisms such as
        standard contractual clauses.
      </p>

      <h2>13. Changes to this policy</h2>
      <p>
        If the site&apos;s practices change — for example when analytics or advertising are enabled —
        this page will be updated before the change takes effect, and the review date at the top will
        change. Material changes will be described in plain language.
      </p>

      <h2>14. Contact</h2>
      <p>
        Privacy questions:{" "}
        <a href={`mailto:${siteConfig.email}`} className="link">
          {siteConfig.email}
        </a>
        . Include the page and, if relevant, the approximate date and time of your visit.
      </p>
    </PageShell>
  );
}
