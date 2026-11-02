"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";
import { navLinks } from "@/lib/site";
import { cn } from "@/lib/utils";
import { Logo } from "./logo";
import { SearchDialog } from "./search-dialog";
import { ThemeToggle } from "./theme-toggle";
import type { SearchableTool } from "@/lib/search";

export function SiteHeader({ index }: { index: SearchableTool[] }) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  return (
    <header className="sticky top-0 z-50 border-b border-[var(--border)] bg-[var(--page)]/92 backdrop-blur-md">
      {/* Hairline masthead rule */}
      <div className="h-[3px] w-full bg-[var(--text)]" aria-hidden />

      <div className="mx-auto flex h-[68px] max-w-6xl items-center gap-4 px-4 sm:px-6">
        <Link href="/" aria-label="Toolora home" className="shrink-0">
          <Logo />
        </Link>

        <span className="ml-1 hidden h-5 w-px bg-[var(--border-strong)] md:block" aria-hidden />

        <nav aria-label="Main" className="hidden items-center gap-1 md:flex">
          {navLinks.map((link) => {
            const active = pathname.startsWith(link.href.replace(/\/$/, ""));
            return (
              <Link
                key={link.href}
                href={link.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "relative px-3 py-2 font-mono text-[0.68rem] uppercase tracking-[0.14em] transition-colors",
                  active
                    ? "text-[var(--text)]"
                    : "text-[var(--text-muted)] hover:text-[var(--text)]",
                )}
              >
                {active ? (
                  <span
                    className="absolute left-0 top-1/2 size-[5px] -translate-y-1/2 bg-[var(--ring)]"
                    aria-hidden
                  />
                ) : null}
                <span className={active ? "pl-2.5" : undefined}>{link.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="ml-auto flex items-center gap-2">
          <SearchDialog index={index} />
          <ThemeToggle />
          <button
            type="button"
            onClick={() => setMobileOpen((value) => !value)}
            className="inline-flex size-10 items-center justify-center border border-[var(--border-strong)] text-[var(--text)] transition-colors hover:bg-[var(--text)] hover:text-[var(--page)] md:hidden"
            aria-expanded={mobileOpen}
            aria-controls="mobile-nav"
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
          >
            {mobileOpen ? <X className="size-4" aria-hidden /> : <Menu className="size-4" aria-hidden />}
          </button>
        </div>
      </div>

      {mobileOpen ? (
        <div id="mobile-nav" className="border-t border-[var(--border)] bg-[var(--page)] md:hidden">
          <nav aria-label="Mobile" className="mx-auto max-w-6xl px-4 py-2 sm:px-6">
            {[...navLinks, { href: "/roadmap/", label: "Roadmap" }].map((link, index) => (
              <Link
                key={link.href}
                href={link.href}
                className="flex items-baseline justify-between border-b border-[var(--border)] py-3 font-display text-lg font-semibold tracking-[-0.02em] text-[var(--text)] last:border-b-0"
              >
                {link.label}
                <span className="font-mono text-[0.62rem] tracking-[0.14em] text-[var(--text-subtle)]">
                  {String(index + 1).padStart(2, "0")}
                </span>
              </Link>
            ))}
          </nav>
        </div>
      ) : null}
    </header>
  );
}
