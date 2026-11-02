"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { ArrowUpRight, Menu, X } from "lucide-react";
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
    <header className="sticky top-0 z-50 border-b border-[var(--border)] bg-[var(--page)]/85 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-6xl items-center gap-2 px-4 sm:px-6">
        <Link href="/" aria-label="Tools home" className="shrink-0 rounded-lg">
          <Logo />
        </Link>

        <nav aria-label="Main" className="ml-4 hidden items-center gap-0.5 md:flex">
          {navLinks.map((link) => {
            const active = pathname.startsWith(link.href.replace(/\/$/, ""));
            return (
              <Link
                key={link.href}
                href={link.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "rounded-lg px-3 py-2 text-[0.86rem] font-medium transition-colors",
                  active
                    ? "bg-[var(--surface)] text-[var(--text)] shadow-[0_1px_2px_rgb(20_22_26/0.06)]"
                    : "text-[var(--text-muted)] hover:bg-[var(--surface-muted)] hover:text-[var(--text)]",
                )}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        <div className="ml-auto flex items-center gap-2">
          <SearchDialog index={index} />
          <ThemeToggle />
          <Link
            href="/tools/"
            className="btn btn-primary hidden !min-h-9 !px-3.5 !text-[0.82rem] lg:inline-flex"
          >
            Browse tools
            <ArrowUpRight className="size-3.5" aria-hidden />
          </Link>
          <button
            type="button"
            onClick={() => setMobileOpen((value) => !value)}
            className="inline-flex size-10 items-center justify-center rounded-lg border border-[var(--border-strong)] bg-[var(--surface)] text-[var(--text)] transition-colors hover:border-[var(--text)] md:hidden"
            aria-expanded={mobileOpen}
            aria-controls="mobile-nav"
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
          >
            {mobileOpen ? <X className="size-4" aria-hidden /> : <Menu className="size-4" aria-hidden />}
          </button>
        </div>
      </div>

      {mobileOpen ? (
        <div id="mobile-nav" className="border-t border-[var(--border)] bg-[var(--surface)] md:hidden">
          <nav aria-label="Mobile" className="mx-auto max-w-6xl px-4 py-2 sm:px-6">
            {[...navLinks, { href: "/roadmap/", label: "Roadmap" }].map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="flex items-center justify-between border-b border-[var(--border)] px-1 py-3.5 text-[0.95rem] font-medium text-[var(--text)] last:border-b-0"
              >
                {link.label}
                <ArrowUpRight className="size-4 text-[var(--text-subtle)]" aria-hidden />
              </Link>
            ))}
          </nav>
        </div>
      ) : null}
    </header>
  );
}
