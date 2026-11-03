import type { Metadata, Viewport } from "next";
import "@fontsource-variable/bricolage-grotesque/standard.css";
import "@fontsource-variable/inter-tight/wght.css";
import "@fontsource-variable/jetbrains-mono/wght.css";
import "./globals.css";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { ToastProvider } from "@/components/ui";
import { Analytics } from "@/components/analytics";
import { AdsenseLoader } from "@/components/adsense-loader";
import { JsonLd } from "@/components/json-ld";
import { searchIndex } from "@/lib/tools/registry";
import { siteConfig, siteKeywords } from "@/lib/site";

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: `${siteConfig.name} — 254 Free Online Tools That Run in Your Browser`,
    template: `%s | ${siteConfig.name}`,
  },
  description: siteConfig.description,
  keywords: [...siteKeywords],
  applicationName: siteConfig.name,
  authors: [{ name: siteConfig.name, url: siteConfig.url }],
  creator: siteConfig.name,
  publisher: siteConfig.name,
  /**
   * Secondary proof of site ownership for AdSense. Google accepts either this
   * meta tag or the loader script in the head; both are shipped, so whichever
   * check the dashboard runs finds an answer.
   */
  other: {
    "google-adsense-account": siteConfig.adsenseClient,
  },
  category: "technology",
  classification: "Utilities, Online Tools, Productivity",
  alternates: {
    canonical: "/",
    languages: { "x-default": "/", en: "/" },
    types: {
      "application/rss+xml": [{ url: "/feed.xml", title: `${siteConfig.name} — guides` }],
      "text/markdown": [{ url: "/llms.txt", title: "Toolz — machine-readable index" }],
    },
  },
  openGraph: {
    type: "website",
    siteName: siteConfig.name,
    locale: siteConfig.locale,
    url: siteConfig.url,
    title: `${siteConfig.name} — free online tools that run in your browser`,
    description: siteConfig.description,
    images: [
      {
        url: "/og/tools.png",
        width: 1200,
        height: 630,
        alt: `${siteConfig.name} — free online tools that run in your browser`,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: `${siteConfig.name} — free online tools that run in your browser`,
    description: siteConfig.description,
    images: ["/og/tools.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  icons: {
    icon: [
      { url: "/icon.svg", type: "image/svg+xml" },
      { url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [{ url: "/icons/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
  },
  manifest: "/manifest.webmanifest",
  appleWebApp: { capable: true, title: siteConfig.name, statusBarStyle: "default" },
  formatDetection: { telephone: false, address: false, email: false },
  referrer: "strict-origin-when-cross-origin",
  ...(siteConfig.verification.google || siteConfig.verification.bing
    ? {
        verification: {
          ...(siteConfig.verification.google ? { google: siteConfig.verification.google } : {}),
          ...(siteConfig.verification.bing
            ? { other: { "msvalidate.01": siteConfig.verification.bing } }
            : {}),
        },
      }
    : {}),
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f7f6f2" },
    { media: "(prefers-color-scheme: dark)", color: "#0b0c0e" },
  ],
  colorScheme: "light dark",
};

const consentDefaultScript = `(function(){window.dataLayer=window.dataLayer||[];window.gtag=window.gtag||function(){window.dataLayer.push(arguments)};window.gtag('consent','default',{ad_storage:'denied',ad_user_data:'denied',ad_personalization:'denied',analytics_storage:'denied',wait_for_update:500});})();`;

const themeScript = `(function(){try{var t=localStorage.getItem('toolz:theme');var d=window.matchMedia('(prefers-color-scheme: dark)').matches;var dark=t==='dark'||((!t||t==='system')&&d);document.documentElement.classList.toggle('dark',dark);document.documentElement.style.colorScheme=dark?'dark':'light';}catch(e){}})();`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const websiteSchema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        "@id": `${siteConfig.url}/#website`,
        name: siteConfig.name,
        alternateName: ["Toolz online", "Free tools online"],
        url: siteConfig.url,
        description: siteConfig.description,
        inLanguage: siteConfig.language,
        publisher: { "@id": `${siteConfig.url}/#organization` },
        potentialAction: {
          "@type": "SearchAction",
          target: {
            "@type": "EntryPoint",
            urlTemplate: `${siteConfig.url}/tools/?q={search_term_string}`,
          },
          "query-input": "required name=search_term_string",
        },
      },
      {
        "@type": "Organization",
        "@id": `${siteConfig.url}/#organization`,
        name: siteConfig.legalName,
        url: siteConfig.url,
        slogan: siteConfig.slogan,
        email: siteConfig.email,
        logo: {
          "@type": "ImageObject",
          url: `${siteConfig.url}/icons/icon-512.png`,
          width: 512,
          height: 512,
        },
        knowsAbout: [...siteKeywords].slice(0, 20),
      },
      {
        "@type": "WebPage",
        "@id": `${siteConfig.url}/#homepage`,
        url: siteConfig.url,
        name: `${siteConfig.name} — free online tools that run in your browser`,
        isPartOf: { "@id": `${siteConfig.url}/#website` },
        about: { "@id": `${siteConfig.url}/#organization` },
        inLanguage: siteConfig.language,
        primaryImageOfPage: { "@type": "ImageObject", url: `${siteConfig.url}/og/tools.png` },
      },
    ],
  };

  return (
    <html lang="en" suppressHydrationWarning>
      {/*
        The head is written explicitly so that the AdSense loader is a real
        <script> element in the exported HTML of every page. AdSense verifies
        site ownership by fetching the page source, so anything injected later
        by JavaScript — including next/script with strategy="afterInteractive" —
        reads as "not found". See src/components/adsense-loader.tsx.
      */}
      <head>
        {/* Applies the stored theme before first paint, so there is no flash. */}
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
        {/*
          Consent Mode v2 defaults. Every storage signal starts denied, so no
          advertising or analytics cookie is set until the visitor chooses in
          the banner (or in Google's certified CMP when NEXT_PUBLIC_CMP_PROVIDER
          is "google"). Must run before the AdSense loader below.
        */}
        <script dangerouslySetInnerHTML={{ __html: consentDefaultScript }} />
        <AdsenseLoader />
      </head>
      <body className="min-h-dvh antialiased">
        <JsonLd data={websiteSchema} />
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-lg focus:bg-[var(--text)] focus:px-4 focus:py-2 focus:text-[0.85rem] focus:font-medium focus:text-[var(--page)]"
        >
          Skip to content
        </a>
        <ToastProvider>
          <SiteHeader index={searchIndex} />
          <main id="main">{children}</main>
          <SiteFooter />
          <Analytics />
        </ToastProvider>
      </body>
    </html>
  );
}
