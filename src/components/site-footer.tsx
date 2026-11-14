import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { footerLinkGroups, legalLinks, siteConfig } from "@/lib/site";
import { liveTools, popularTools } from "@/lib/tools/registry";
import { categories } from "@/lib/tools/categories";
import { CookieSettings } from "./analytics";
import { LogoMark } from "./logo";
import { Marquee } from "./bits/marquee";
import { BackToTop } from "./back-to-top";

const TICKER = [
  "Nothing uploaded",
  "No accounts",
  "No installs",
  "Works offline-first",
  "254 tools",
  "Built in your browser",
  "Free forever",
];

export function SiteFooter() {
  const year = new Date().getFullYear();
  const liveCategories = categories.filter((category) => category.status === "live").length;

  return (
    <footer className="relative mt-28 overflow-hidden border-t border-[var(--border)] bg-[var(--page)]">
      {/* Ticker strip */}
      <div className="border-b border-[var(--border)] bg-[var(--surface)] py-3">
        <Marquee speed="slow">
          {TICKER.map((item) => (
            <span key={item} className="flex items-center gap-5 pr-5">
              <span className="font-mono text-[0.62rem] uppercase tracking-[0.24em] text-[var(--text-subtle)]">
                {item}
              </span>
              <span className="size-1 rounded-full bg-[var(--ring)]" aria-hidden />
            </span>
          ))}
        </Marquee>
      </div>

      <div className="mx-auto max-w-[1180px] px-4 sm:px-6">
        {/* Spec strip */}
        <div className="grid grid-cols-2 gap-px overflow-hidden border-b border-[var(--border)] bg-[var(--border)] sm:grid-cols-4">
          {[
            { label: "Tools live", value: String(liveTools.length) },
            { label: "Categories", value: String(liveCategories) },
            { label: "Uploads", value: "0" },
            { label: "Accounts", value: "0" },
          ].map((item) => (
            <div key={item.label} className="bg-[var(--page)] px-4 py-6">
              <p className="eyebrow">{item.label}</p>
              <p className="mt-1.5 font-display text-[2rem] font-bold leading-none tracking-[-0.05em] text-[var(--text)]">
                {item.value}
              </p>
            </div>
          ))}
        </div>

        <div className="grid gap-12 py-14 md:grid-cols-[1.5fr_repeat(3,1fr)]">
          <div>
            <div className="flex items-center gap-2.5">
              <LogoMark className="size-6 text-[var(--text)]" />
              <span className="font-display text-xl font-bold tracking-[-0.05em] text-[var(--text)]">
                {siteConfig.name}
              </span>
            </div>
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-[var(--text-muted)]">
              {siteConfig.tagline}. Every calculation runs on your device — no uploads, no
              accounts, no waiting.
            </p>
            <Link
              href="/tools/"
              className="btn btn-secondary mt-6 !min-h-9 !rounded-full !px-4 !text-[0.8rem]"
            >
              Open the catalogue
              <ArrowUpRight className="size-3.5" aria-hidden />
            </Link>
            <p className="eyebrow mt-6">Processed locally · nothing stored</p>
          </div>

          <nav aria-label="Popular tools">
            <h2 className="eyebrow">Popular tools</h2>
            <ul className="mt-5 flex flex-col gap-2.5">
              {popularTools.slice(0, 8).map((tool) => (
                <li key={tool.slug}>
                  <Link
                    href={`/tools/${tool.slug}/`}
                    className="group/link inline-flex items-baseline gap-1 text-sm text-[var(--text-muted)] transition-colors hover:text-[var(--text)]"
                  >
                    <span className="bg-gradient-to-r from-[var(--ring)] to-[var(--ring)] bg-[length:0%_1px] bg-left-bottom bg-no-repeat pb-0.5 transition-[background-size] duration-300 group-hover/link:bg-[length:100%_1px]">
                      {tool.name}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {footerLinkGroups.map((group) => (
            <nav key={group.title} aria-label={group.title}>
              <h2 className="eyebrow">{group.title}</h2>
              <ul className="mt-5 flex flex-col gap-2.5">
                {group.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="group/link inline-flex items-baseline gap-1 text-sm text-[var(--text-muted)] transition-colors hover:text-[var(--text)]"
                    >
                      <span className="bg-gradient-to-r from-[var(--ring)] to-[var(--ring)] bg-[length:0%_1px] bg-left-bottom bg-no-repeat pb-0.5 transition-[background-size] duration-300 group-hover/link:bg-[length:100%_1px]">
                        {link.label}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>

        <nav
          aria-label="Legal and policies"
          className="flex flex-col gap-3 border-t border-[var(--border)] py-5 sm:flex-row sm:items-center sm:justify-between"
        >
          <h2 className="eyebrow">Legal &amp; policies</h2>
          <ul className="flex flex-wrap items-center gap-x-5 gap-y-2">
            {legalLinks.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="text-sm font-medium text-[var(--text-muted)] underline-offset-4 transition-colors hover:text-[var(--text)] hover:underline"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="flex flex-col gap-3 border-t border-[var(--border)] py-6 text-xs text-[var(--text-subtle)] sm:flex-row sm:items-center sm:justify-between">
          <p className="font-mono text-[0.66rem] uppercase tracking-[0.1em]">
            © {year} {siteConfig.legalName} — free to use, no sign-up
          </p>
          <div className="flex items-center gap-4">
            <CookieSettings />
            <Link href="/contact/" className="transition-colors hover:text-[var(--text)]">
              Report a problem
            </Link>
          </div>
        </div>

        <p className="max-w-2xl pb-12 text-xs leading-relaxed text-[var(--text-subtle)]">
          Calculations and conversions are provided for general information only and are not
          professional, financial or medical advice. See our{" "}
          <Link href="/disclaimer/" className="link">
            disclaimer
          </Link>
          .
        </p>
      </div>

      {/* Oversized wordmark with the accent period — full-bleed */}
      <div className="relative overflow-hidden border-t border-[var(--border)] bg-[var(--page-elevated)]">
        <div className="pointer-events-none absolute inset-x-0 -top-32 h-64 bg-[radial-gradient(ellipse_at_center,var(--ring-soft),transparent_70%)]" />
        <div className="relative px-2 pt-8">
          <p
            aria-hidden
            className="footer-wordmark select-none whitespace-nowrap text-center font-display text-[19vw] font-extrabold leading-[0.74] tracking-[-0.07em]"
          >
            TOOLZ<span className="text-[var(--ring)]">.</span>
          </p>
        </div>
        <div className="mx-auto flex max-w-[1180px] items-center justify-between px-4 pb-8 pt-6 sm:px-6">
          <p className="font-mono text-[0.56rem] uppercase tracking-[0.2em] text-[var(--text-subtle)]">
            Built in Lagos · used everywhere
          </p>
          <BackToTop />
        </div>
      </div>
    </footer>
  );
}
