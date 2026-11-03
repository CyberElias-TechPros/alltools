import { siteConfig } from "@/lib/site";

/**
 * The AdSense loader, written as a literal `<script>` in the document head.
 *
 * It must not be loaded with `next/script` (`strategy="afterInteractive"`).
 * That strategy ships the tag inside the client bootstrap payload and injects
 * it with JavaScript after hydration, so the static HTML only contains a
 * `<link rel="preload">`. AdSense's site-verification crawler reads the raw
 * HTML, finds no `<script src=".../adsbygoogle.js?client=...">`, and reports
 * "not found" — which is exactly the failure this component fixes.
 *
 * `crossorigin="anonymous"` matches Google's snippet and lets the loader report
 * errors instead of hiding them behind an opaque cross-origin response.
 *
 * Loading the loader does not display advertising: ad units only appear where
 * `AdSlot` is rendered with an enabled publisher ID and a configured slot, and
 * consent defaults keep ad storage denied until the visitor chooses.
 */
export function AdsenseLoader() {
  const client = siteConfig.adsenseClient;
  if (!client) return null;

  return (
    <script
      async
      src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${client}`}
      crossOrigin="anonymous"
    />
  );
}
