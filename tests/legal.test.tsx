import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { legalLinks, footerLinkGroups } from "../src/lib/site";
import { SiteFooter } from "../src/components/site-footer";
import AboutPage from "../src/app/about/page";
import ContactPage from "../src/app/contact/page";
import PrivacyPolicyPage from "../src/app/privacy-policy/page";
import CookiesPage from "../src/app/cookies/page";
import TermsPage from "../src/app/terms/page";

/**
 * Legal and policy surface.
 *
 * Advertising networks — AdSense in particular — require four pages to be
 * reachable from every page of the site: Privacy Policy, About Us, Contact Us
 * and Terms & Conditions, plus an explicit disclosure of third-party
 * advertising cookies such as Google DoubleClick. These tests assert both the
 * links and the words, so the requirement cannot regress silently when the
 * footer is restyled.
 */

const html = (page: () => React.ReactElement) => renderToStaticMarkup(page());

const required = [
  { href: "/privacy-policy/", label: "Privacy Policy" },
  { href: "/about/", label: "About Us" },
  { href: "/contact/", label: "Contact Us" },
  { href: "/terms/", label: "Terms & Conditions" },
];

describe("legal links", () => {
  it("exposes every required page with its conventional name", () => {
    for (const link of required) {
      const match = legalLinks.find((item) => item.href === link.href);
      expect(match, link.href).toBeTruthy();
      expect(match?.label).toBe(link.label);
    }
  });

  it("renders the legal row in the footer with all six links", () => {
    const markup = renderToStaticMarkup(<SiteFooter />);
    expect(markup).toContain('aria-label="Legal and policies"');
    for (const link of legalLinks) {
      // next/link strips the trailing slash at render time; accept either form.
      const href = `href="${link.href.replace(/\/$/, "")}"`;
      expect(markup, link.href).toContain(href);
    }
    // The four required links must be visible as words, not only as hrefs.
    // React escapes ampersands in text, so compare against the escaped form.
    for (const link of required) {
      expect(markup).toContain(link.label.replace("&", "&amp;"));
    }
  });

  it("keeps About Us and Contact Us in the footer columns as well", () => {
    const company = footerLinkGroups.find((group) => group.title === "Company");
    expect(company?.links.map((link) => link.label)).toEqual(
      expect.arrayContaining(["About us", "Contact us"]),
    );
  });

  it("points every legal link at a real exported route", () => {
    // Static export writes one directory per page, so each href must map to a
    // page module that exists in src/app.
    const routes = new Set([
      "/privacy-policy/",
      "/terms/",
      "/cookies/",
      "/disclaimer/",
      "/about/",
      "/contact/",
    ]);
    for (const link of legalLinks) expect(routes.has(link.href), link.href).toBe(true);
  });
});

describe("legal pages", () => {
  it("titles the pages the way the links name them", () => {
    expect(html(AboutPage)).toContain("About Us");
    expect(html(ContactPage)).toContain("Contact Us");
    expect(html(TermsPage)).toContain("Terms &amp; Conditions");
    expect(html(PrivacyPolicyPage)).toContain("Privacy Policy");
  });

  it("gives the privacy policy a real DoubleClick disclosure", () => {
    const markup = html(PrivacyPolicyPage);
    expect(markup).toContain("DoubleClick");
    expect(markup).toContain("DART");
    expect(markup).toContain("Third-party vendors, including Google, use cookies to serve ads");
    expect(markup).toContain("ca-pub-5010473500037610");
    expect(markup).toContain("https://adssettings.google.com/");
    expect(markup).toContain("https://www.aboutads.info/choices/");
    expect(markup).toContain("https://policies.google.com/technologies/ads");
  });

  it("names the DoubleClick cookie in the cookie policy too", () => {
    const markup = html(CookiesPage);
    expect(markup).toContain("DoubleClick");
    expect(markup).toContain("toolz:theme");
    expect(markup).toContain("toolz:consent");
  });

  it("has no unfinished placeholder text in the terms", () => {
    const markup = html(TermsPage).toLowerCase();
    for (const phrase of ["should insert", "todo", "lorem ipsum", "[insert", "before launch"]) {
      expect(markup, phrase).not.toContain(phrase);
    }
  });

  it("links the terms back to the other legal pages", () => {
    const markup = html(TermsPage);
    for (const href of ["/privacy-policy/", "/cookies/", "/disclaimer/", "/about/", "/contact/"]) {
      expect(markup, href).toContain(`href="${href.replace(/\/$/, "")}"`);
    }
  });

  it("keeps the contact page reachable without a server", () => {
    const markup = html(ContactPage);
    expect(markup).toContain("mailto:");
    expect(markup).toContain("@");
  });
});
