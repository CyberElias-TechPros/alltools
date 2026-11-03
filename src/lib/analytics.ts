/**
 * Privacy-respecting, opt-in product analytics.
 *
 * Two rules:
 *  1. Nothing loads until the visitor accepts optional analytics.
 *  2. We only ever record tool slugs and coarse outcomes — never the text a
 *     visitor pastes, never a file name, never a result value.
 */

type EventName =
  | "tool_used"
  | "tool_copied"
  | "tool_downloaded"
  | "search_used"
  | "category_viewed";

const CONSENT_KEY = "toolz:consent";

export type ConsentState = "granted" | "denied" | "unset";

export function getConsent(): ConsentState {
  if (typeof window === "undefined") return "unset";
  const value = window.localStorage.getItem(CONSENT_KEY);
  return value === "granted" || value === "denied" ? value : "unset";
}

export function setConsent(state: Exclude<ConsentState, "unset">): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(CONSENT_KEY, state);
  window.dispatchEvent(new CustomEvent("toolz:consent", { detail: state }));
}

/**
 * Record an anonymous product event. No-ops unless analytics consent has been
 * granted and a measurement ID is configured, so the default build sends
 * exactly zero network requests for analytics.
 */
export function track(event: EventName, properties: Record<string, string | number> = {}) {
  if (typeof window === "undefined") return;
  if (getConsent() !== "granted") return;

  const w = window as unknown as {
    gtag?: (...args: unknown[]) => void;
    dataLayer?: unknown[];
  };

  if (typeof w.gtag === "function") {
    w.gtag("event", event, properties);
    return;
  }
  if (Array.isArray(w.dataLayer)) {
    w.dataLayer.push({ event, ...properties });
  }
}
