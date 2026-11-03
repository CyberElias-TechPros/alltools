"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getConsent, setConsent, type ConsentState } from "@/lib/analytics";
import { siteConfig } from "@/lib/site";

/** True when the site has anything optional to ask about. */
const asksForConsent = Boolean(siteConfig.gaId || siteConfig.adsEnabled);

function loadGoogleAnalytics(measurementId: string) {
  if (document.getElementById("tools-ga")) return;
  const script = document.createElement("script");
  script.id = "tools-ga";
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(measurementId)}`;
  document.head.appendChild(script);

  const inline = document.createElement("script");
  inline.id = "tools-ga-init";
  inline.textContent = `
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    gtag('js', new Date());
    gtag('consent', 'default', { ad_storage: 'denied', ad_user_data: 'denied', ad_personalization: 'denied', analytics_storage: 'denied' });
    gtag('consent', 'update', { analytics_storage: 'granted' });
    gtag('config', '${measurementId}', { anonymize_ip: true });
  `;
  document.head.appendChild(inline);
}

/**
 * AdSense loader. Only called after explicit consent, and only when both a
 * publisher ID and an ad unit id exist — so a default build loads no ad code
 * and makes no ad requests.
 *
 * Note: for personalised ads in the EEA, the UK and Switzerland, Google
 * requires a certified consent management platform. This consent gate is a
 * conservative first step, not a replacement for one — see
 * docs/ADSENSE_QA.md §4.5.
 */
function loadAdSense(clientId: string) {
  if (document.getElementById("tools-adsense")) return;
  const script = document.createElement("script");
  script.id = "tools-adsense";
  script.async = true;
  script.crossOrigin = "anonymous";
  script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${encodeURIComponent(clientId)}`;
  document.head.appendChild(script);
}

/**
 * Consent banner + gated analytics/ad loaders.
 *
 * With no NEXT_PUBLIC_GA_ID and no ads configured (the default) this renders
 * nothing and the site makes no third-party requests at all.
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
      if (siteConfig.gaId) loadGoogleAnalytics(siteConfig.gaId);
      if (siteConfig.adsEnabled) loadAdSense(siteConfig.adsenseClient);
    }

    function onOpen() {
      if (asksForConsent) setBannerOpen(true);
    }
    function onConsent(event: Event) {
      const detail = (event as CustomEvent<string>).detail as "granted" | "denied";
      setConsentState(detail);
      if (detail === "granted") {
        if (siteConfig.gaId) loadGoogleAnalytics(siteConfig.gaId);
        if (siteConfig.adsEnabled) loadAdSense(siteConfig.adsenseClient);
      }
    }
    window.addEventListener("tools:consent-open", onOpen);
    window.addEventListener("tools:consent", onConsent);
    return () => {
      window.removeEventListener("tools:consent-open", onOpen);
      window.removeEventListener("tools:consent", onConsent);
    };
  }, []);

  function choose(next: "granted" | "denied") {
    setConsent(next);
    setConsentState(next);
    setBannerOpen(false);
  }

  if (!ready || !asksForConsent || !bannerOpen) return null;

  const what = siteConfig.adsEnabled ? "analytics and advertising" : "analytics";

  return (
    <div
      role="dialog"
      aria-label="Cookie preferences"
      aria-live="polite"
      className="fixed inset-x-3 bottom-3 z-[85] mx-auto max-w-xl rounded-2xl border border-[var(--border)] bg-[var(--page-elevated)] p-4 shadow-2xl sm:inset-x-auto sm:right-6"
    >
      <p className="text-sm font-semibold text-[var(--text)]">Optional analytics</p>
      <p className="mt-1 text-sm leading-relaxed text-[var(--text-muted)]">
        We use aggregate {what} to see which tools are useful and to keep the site free. It
        never records the text you paste. Choose “Decline” to keep the site fully
        cookie-free.{" "}
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
        Current choice: {consent === "unset" ? "not set" : consent}
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
      onClick={() => window.dispatchEvent(new Event("tools:consent-open"))}
      className="text-left text-sm text-[var(--text-muted)] hover:text-[var(--text)]"
    >
      Cookie settings
    </button>
  );
}
