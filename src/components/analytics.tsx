"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getConsent, setConsent, type ConsentState } from "@/lib/analytics";
import { siteConfig } from "@/lib/site";

/**
 * The banner is shown only when there is something optional to ask about *and*
 * the site is not deferring to Google's certified CMP. With
 * NEXT_PUBLIC_CMP_PROVIDER=google the AdSense message handles consent and this
 * component stays silent, so a visitor never gets two prompts.
 */
const asksForConsent =
  Boolean(siteConfig.gaId || siteConfig.adsenseClient) && siteConfig.cmpProvider === "builtin";

type Gtag = (command: string, action: string, params: Record<string, unknown>) => void;

function gtag(): Gtag | null {
  const fn = (window as unknown as { gtag?: Gtag }).gtag;
  return typeof fn === "function" ? fn : null;
}

/** Push the visitor's choice through Consent Mode v2. */
function applyConsent(state: "granted" | "denied") {
  gtag()?.("consent", "update", {
    ad_storage: state,
    ad_user_data: state,
    ad_personalization: state,
    analytics_storage: siteConfig.gaId ? state : "denied",
  });
}

function loadGoogleAnalytics(measurementId: string) {
  if (document.getElementById("toolz-ga")) return;
  const script = document.createElement("script");
  script.id = "toolz-ga";
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(measurementId)}`;
  document.head.appendChild(script);

  const inline = document.createElement("script");
  inline.id = "toolz-ga-init";
  inline.textContent = `
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    gtag('js', new Date());
    gtag('config', '${measurementId}', { anonymize_ip: true });
  `;
  document.head.appendChild(inline);
}

/**
 * Consent banner + consent-gated analytics.
 *
 * The AdSense tag itself is loaded once in the root layout (Google asks for it
 * to be present on every page), while Consent Mode defaults keep advertising
 * and analytics storage denied until the visitor chooses here.
 */
export function Analytics() {
  const [consent, setConsentState] = useState<ConsentState>("unset");
  const [ready, setReady] = useState(false);
  const [bannerOpen, setBannerOpen] = useState(false);

  useEffect(() => {
    const current = getConsent();
    setConsentState(current);
    setReady(true);
    if (asksForConsent && current === "unset") setBannerOpen(true);
    if (current === "granted") {
      applyConsent("granted");
      if (siteConfig.gaId) loadGoogleAnalytics(siteConfig.gaId);
    }

    function onOpen() {
      if (asksForConsent) setBannerOpen(true);
    }
    function onConsent(event: Event) {
      const detail = (event as CustomEvent<string>).detail as "granted" | "denied";
      setConsentState(detail);
      applyConsent(detail);
      if (detail === "granted" && siteConfig.gaId) loadGoogleAnalytics(siteConfig.gaId);
    }
    window.addEventListener("toolz:consent-open", onOpen);
    window.addEventListener("toolz:consent", onConsent);
    return () => {
      window.removeEventListener("toolz:consent-open", onOpen);
      window.removeEventListener("toolz:consent", onConsent);
    };
  }, []);

  function choose(next: "granted" | "denied") {
    setConsent(next);
    setConsentState(next);
    applyConsent(next);
    setBannerOpen(false);
    if (next === "granted" && siteConfig.gaId) loadGoogleAnalytics(siteConfig.gaId);
  }

  if (!ready || !asksForConsent || !bannerOpen) return null;

  const what = siteConfig.adsenseClient
    ? siteConfig.gaId
      ? "analytics and advertising"
      : "advertising"
    : "analytics";

  return (
    <div
      role="dialog"
      aria-label="Cookie preferences"
      aria-live="polite"
      className="fixed inset-x-3 bottom-3 z-[85] mx-auto max-w-xl rounded-2xl border border-[var(--border)] bg-[var(--page-elevated)] p-4 shadow-2xl sm:inset-x-auto sm:right-6"
    >
      <p className="text-sm font-semibold text-[var(--text)]">Cookies and ads</p>
      <p className="mt-1 text-sm leading-relaxed text-[var(--text-muted)]">
        The tools themselves never need a cookie — everything you type stays in your browser.
        Optional {what} helps keep the site free. Choose “Decline” and the site runs cookie-free.{" "}
        <Link href="/cookies/" className="link">
          Cookie policy
        </Link>
      </p>
      <div className="mt-3 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => choose("granted")}
          className="btn btn-primary !min-h-9 !text-[0.82rem]"
        >
          Accept
        </button>
        <button
          type="button"
          onClick={() => choose("denied")}
          className="btn btn-secondary !min-h-9 !text-[0.82rem]"
        >
          Decline
        </button>
      </div>
      <p className="mt-2 text-[0.7rem] text-[var(--text-subtle)]">
        Current choice: {consent === "unset" ? "not set" : consent}. You can change it any time in
        the footer.
      </p>
    </div>
  );
}

/** Footer control that reopens the consent panel (required for revisiting choices). */
export function CookieSettings() {
  if (!asksForConsent) {
    return (
      <Link href="/cookies/" className="text-sm text-[var(--text-muted)] hover:text-[var(--text)]">
        Cookie policy
      </Link>
    );
  }
  return (
    <button
      type="button"
      onClick={() => window.dispatchEvent(new Event("toolz:consent-open"))}
      className="text-left text-sm text-[var(--text-muted)] hover:text-[var(--text)]"
    >
      Cookie settings
    </button>
  );
}
