import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";
import Link from "next/link";
import { PageShell } from "@/components/page-shell";
import { siteConfig } from "@/lib/site";

export const metadata: Metadata = pageMetadata({
  title: "Terms & Conditions",
  description: "The terms and conditions that apply when you use the free tools on this site, including acceptable use, intellectual property and the limits of our liability.",
  path: "/terms/",
  keywords: ['terms and conditions', 'terms of service', 'usage terms', 'licence'],
});

export default function TermsPage() {
  return (
    <PageShell
      title="Terms & Conditions"
      intro="The terms and conditions for a free tool site. Using the site means you accept them."
      breadcrumbs={[{ href: "/terms/", label: "Terms & conditions" }]}
      updated="3 November 2026"
    >
      <h2>1. Agreement</h2>
      <p>
        These terms govern your use of {siteConfig.name} at {siteConfig.url} and any related pages.
        If you do not agree with them, please do not use the site.
      </p>

      <h2>2. What we provide</h2>
      <p>
        {siteConfig.name} provides free, browser-based utilities. The tools are provided on an
        &ldquo;as is&rdquo; and &ldquo;as available&rdquo; basis. We may add, change or remove tools
        at any time, and we do not guarantee that any particular tool will remain available.
      </p>

      <h2>3. Permitted use</h2>
      <p>You may use the tools for personal, educational and commercial work. You may not:</p>
      <ul>
        <li>attempt to disrupt, overload or gain unauthorised access to the site;</li>
        <li>automate requests in a way that degrades service for others;</li>
        <li>copy the site wholesale, or resell access to it as your own product;</li>
        <li>use the site to violate any law or the rights of another person;</li>
        <li>remove or conceal attribution, licence notices or legal pages.</li>
      </ul>

      <h2>4. Your content</h2>
      <p>
        You keep all rights to the text, numbers and files you process with the tools. Because
        processing happens in your browser, we never receive that content and therefore claim no
        licence over it. You are responsible for making sure you have the right to use anything you
        process.
      </p>

      <h2>5. Accuracy and no professional advice</h2>
      <p>
        We test our tools, but results can be wrong — through a bug, an unsupported edge case, or an
        assumption that does not match your situation. Calculations are provided for general
        information only. They are not financial, legal, medical, tax or engineering advice. See the{" "}
        <Link href="/disclaimer/">disclaimer</Link> for detail, and verify anything important against
        an authoritative source.
      </p>

      <h2>6. Intellectual property</h2>
      <p>
        The site&apos;s design, written content and code are owned by the operator and protected by
        copyright. Tool results that you generate are yours. Third-party names and logos remain the
        property of their owners and are used only for identification.
      </p>

      <h2>7. Limitation of liability</h2>
      <p>
        To the maximum extent permitted by law, the operator is not liable for indirect, incidental,
        special or consequential damages, or for lost profits, data or goodwill, arising from your
        use of the site. Where liability cannot be excluded, it is limited to the amount you paid to
        use the site — which is zero.
      </p>
      <p>
        Nothing in these terms excludes liability for fraud, or for death or personal injury caused
        by negligence, where such exclusion would be unlawful.
      </p>

      <h2>8. Availability</h2>
      <p>
        We aim for high availability but do not promise uninterrupted service. The site may be
        unavailable during maintenance, or because of a hosting outage outside our control.
      </p>

      <h2>9. Third-party services</h2>
      <p>
        The site may rely on third-party hosting, analytics or advertising providers. Their terms and
        privacy policies apply to their services. We are not responsible for third-party websites we
        link to.
      </p>

      <h2>10. Changes to these terms</h2>
      <p>
        We may update these terms as the site evolves. The review date at the top will change, and
        continuing to use the site after an update means you accept the revised terms.
      </p>

      <h2>11. Governing law</h2>
      <p>
        These terms are governed by the law that applies at the operator&apos;s place of
        establishment, without regard to conflict-of-law rules. If you use the site as a consumer,
        nothing in these terms removes the protection of mandatory consumer law in your country of
        residence, and you may bring proceedings in your local courts where the law allows it.
      </p>

      <h2>12. Contact us</h2>
      <p>
        Questions about these terms, or a request relating to any of our other legal pages, can be
        sent to{" "}
        <a href={`mailto:${siteConfig.email}`} className="link">
          {siteConfig.email}
        </a>{" "}
        or through the <Link href="/contact/">contact page</Link>. We aim to reply within five
        working days.
      </p>

      <h2>13. The rest of our legal pages</h2>
      <ul>
        <li>
          <Link href="/privacy-policy/">Privacy Policy</Link> — what is and is not collected,
          including third-party advertising cookies such as Google DoubleClick.
        </li>
        <li>
          <Link href="/cookies/">Cookie Policy</Link> — the cookies and local storage keys involved.
        </li>
        <li>
          <Link href="/disclaimer/">Disclaimer</Link> — the limits of the calculations and content.
        </li>
        <li>
          <Link href="/about/">About Us</Link> — who runs the site and how it is built.
        </li>
      </ul>
    </PageShell>
  );
}
