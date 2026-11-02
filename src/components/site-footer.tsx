import Link from "next/link";
import { ShieldCheck, Zap } from "lucide-react";
import { footerLinkGroups, siteConfig } from "@/lib/site";
import { tools } from "@/lib/tools/registry";
import { Logo } from "./logo";

export function SiteFooter() {
  const liveCount = tools.filter((tool) => tool.status === "live").length;
  const year = new Date().getFullYear();

  return (
    <footer className="mt-20 border-t border-[var(--border)] bg-[var(--page-elevated)]">
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
        <div className="grid gap-10 md:grid-cols-[1.4fr_repeat(3,1fr)]">
          <div>
            <Link href="/" aria-label="Toolora home">
              <Logo />
            </Link>
            <p className="mt-3 max-w-xs text-sm leading-relaxed text-[var(--text-muted)]">
              {siteConfig.tagline}. Every tool runs on your device — no uploads, no
              accounts, no waiting.
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              <span className="chip">
                <ShieldCheck className="size-3" aria-hidden /> Client-side processing
              </span>
              <span className="chip">
                <Zap className="size-3" aria-hidden /> {liveCount} live tools
              </span>
            </div>
          </div>

          {footerLinkGroups.map((group) => (
            <nav key={group.title} aria-label={group.title}>
              <h2 className="text-[0.72rem] font-bold uppercase tracking-[0.1em] text-[var(--text-subtle)]">
                {group.title}
              </h2>
              <ul className="mt-3 flex flex-col gap-2">
                {group.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-[var(--text-muted)] transition-colors hover:text-[var(--text)]"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>

        <div className="mt-10 flex flex-col gap-3 border-t border-[var(--border)] pt-6 text-xs text-[var(--text-subtle)] sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {year} {siteConfig.legalName}. Free to use, no sign-up required.
          </p>
          <p className="max-w-lg sm:text-right">
            Calculations and conversions are provided for general information only and are not
            professional, financial or medical advice. See our{" "}
            <Link href="/disclaimer/" className="link">
              disclaimer
            </Link>
            .
          </p>
        </div>
      </div>
    </footer>
  );
}
