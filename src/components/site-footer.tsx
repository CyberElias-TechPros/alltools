import Link from "next/link";
import { footerLinkGroups, siteConfig } from "@/lib/site";
import { liveTools } from "@/lib/tools/registry";
import { categories } from "@/lib/tools/categories";
import { CookieSettings } from "./analytics";
import { LogoMark } from "./logo";

export function SiteFooter() {
  const year = new Date().getFullYear();
  const liveCategories = categories.filter((category) => category.status === "live").length;

  return (
    <footer className="mt-24 border-t border-[var(--border)] bg-[var(--page)]">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        {/* Spec strip */}
        <div className="grid grid-cols-2 gap-2 border-b border-[var(--border)] py-8 sm:grid-cols-4">
          {[
            { label: "Tools live", value: String(liveTools.length) },
            { label: "Categories", value: String(liveCategories) },
            { label: "Uploads", value: "0" },
            { label: "Accounts", value: "0" },
          ].map((item) => (
            <div key={item.label} className="rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4 py-3">
              <p className="eyebrow">{item.label}</p>
              <p className="mt-1 font-display text-2xl font-bold tracking-[-0.04em] text-[var(--text)]">
                {item.value}
              </p>
            </div>
          ))}
        </div>

        <div className="grid gap-10 py-12 md:grid-cols-[1.5fr_repeat(3,1fr)]">
          <div>
            <div className="flex items-center gap-2.5">
              <LogoMark className="size-6 text-[var(--text)]" />
              <span className="font-display text-xl font-bold tracking-[-0.05em] text-[var(--text)]">
                {siteConfig.name}
              </span>
            </div>
            <p className="mt-3 max-w-xs text-sm leading-relaxed text-[var(--text-muted)]">
              {siteConfig.tagline}. Every calculation runs on your device — no uploads, no
              accounts, no waiting.
            </p>
            <p className="eyebrow mt-5">Processed locally · nothing stored</p>
          </div>

          {footerLinkGroups.map((group) => (
            <nav key={group.title} aria-label={group.title}>
              <h2 className="eyebrow">{group.title}</h2>
              <ul className="mt-4 flex flex-col gap-2.5">
                {group.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-[var(--text-muted)] transition-colors hover:text-[var(--accent-text)]"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>

        <div className="flex flex-col gap-3 border-t border-[var(--border)] py-6 text-xs text-[var(--text-subtle)] sm:flex-row sm:items-center sm:justify-between">
          <p className="font-mono text-[0.66rem] uppercase tracking-[0.1em]">
            © {year} {siteConfig.legalName} — free to use, no sign-up
          </p>
          <div className="flex items-center gap-4">
            <CookieSettings />
            <Link href="/contact/" className="hover:text-[var(--text)]">
              Report a problem
            </Link>
          </div>
        </div>

        <p className="max-w-2xl pb-10 text-xs leading-relaxed text-[var(--text-subtle)]">
          Calculations and conversions are provided for general information only and are not
          professional, financial or medical advice. See our{" "}
          <Link href="/disclaimer/" className="link">
            disclaimer
          </Link>
          .
        </p>
      </div>

      {/* Oversized wordmark */}
      <div className="overflow-hidden border-t border-[var(--border)] bg-[var(--page-elevated)]">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <p
            aria-hidden
            className="select-none whitespace-nowrap pt-6 text-center font-display text-[19vw] font-extrabold leading-[0.78] tracking-[-0.06em] text-[var(--text)] opacity-[0.05]"
          >
            TOOLORA
          </p>
        </div>
      </div>
    </footer>
  );
}
