"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { ArrowUpRight, Menu, X } from "lucide-react";
import { navLinks } from "@/lib/site";
import { cn } from "@/lib/utils";
import { Logo } from "./logo";
import { SearchDialog } from "./search-dialog";
import { ThemeToggle } from "./theme-toggle";
import { Magnet } from "./motion/magnetic";
import { lenisStart, lenisStop } from "./motion/smooth-scroll";
import type { SearchableTool } from "@/lib/search";

export function SiteHeader({ index }: { index: SearchableTool[] }) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const mobileRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  useEffect(() => {
    let ticking = false;
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        setScrolled(window.scrollY > 24);
        ticking = false;
      });
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (mobileOpen) {
      lenisStop();
      document.body.style.overflow = "hidden";
    } else {
      lenisStart();
      document.body.style.overflow = "";
    }
    return () => {
      lenisStart();
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMobileOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <>
      <header
        className={cn(
          "sticky top-0 z-50 transition-[background-color,backdrop-filter,border-color,box-shadow] duration-500",
          scrolled
            ? "border-b border-[var(--border)] bg-[var(--page)]/72 backdrop-blur-2xl supports-[backdrop-filter]:bg-[var(--page)]/60"
            : "border-b border-transparent bg-transparent",
        )}
      >
        <div
          className={cn(
            "mx-auto flex max-w-[1180px] items-center gap-2 px-4 transition-[height] duration-500 sm:px-6",
            scrolled ? "h-14" : "h-[72px]",
          )}
        >
          <Link href="/" aria-label="Toolz home" className="group shrink-0 rounded-lg">
            <span className="flex items-center gap-2.5">
              <span className="logo-orbit relative inline-flex">
                <Logo />
              </span>
            </span>
          </Link>

          <nav aria-label="Main" className="ml-6 hidden items-center md:flex">
            {navLinks.map((link) => {
              const active = pathname.startsWith(link.href.replace(/\/$/, ""));
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "nav-link group relative px-3 py-2 text-[0.82rem] font-medium tracking-[-0.01em] transition-colors",
                    active ? "text-[var(--text)]" : "text-[var(--text-muted)] hover:text-[var(--text)]",
                  )}
                >
                  <span className="relative z-10">{link.label}</span>
                  <span
                    className={cn(
                      "absolute inset-x-2.5 bottom-1 h-px origin-left bg-[var(--text)] transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]",
                      active ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100",
                    )}
                    aria-hidden
                  />
                </Link>
              );
            })}
          </nav>

          <div className="ml-auto flex items-center gap-1.5">
            <SearchDialog index={index} />
            <ThemeToggle />
            <Magnet strength={0.2} padding={0} className="hidden lg:inline-block">
              <Link
                href="/tools/"
                className="btn btn-primary !min-h-9 !gap-1.5 !px-4 !text-[0.8rem] !font-medium"
              >
                Browse tools
                <ArrowUpRight className="size-3.5" aria-hidden />
              </Link>
            </Magnet>
            <button
              type="button"
              onClick={() => setMobileOpen((value) => !value)}
              className="ml-0.5 inline-flex size-10 items-center justify-center rounded-full border border-[var(--border-strong)] bg-[var(--surface)]/60 text-[var(--text)] backdrop-blur transition-colors hover:border-[var(--text)] md:hidden"
              aria-expanded={mobileOpen}
              aria-controls="mobile-nav"
              aria-label={mobileOpen ? "Close menu" : "Open menu"}
            >
              {mobileOpen ? <X className="size-4" aria-hidden /> : <Menu className="size-4" aria-hidden />}
            </button>
          </div>
        </div>
        <div
          className={cn(
            "h-px origin-left bg-gradient-to-r from-transparent via-[var(--ring)]/40 to-transparent transition-opacity duration-500",
            scrolled ? "opacity-100" : "opacity-0",
          )}
          aria-hidden
        />
      </header>

      {/* Full-bleed mobile overlay with staggered editorial links. */}
      <div
        id="mobile-nav"
        ref={mobileRef}
        className={cn(
          "fixed inset-0 z-40 md:hidden",
          mobileOpen ? "pointer-events-auto" : "pointer-events-none",
        )}
        aria-hidden={!mobileOpen}
        inert={!mobileOpen}
      >
        <div
          className={cn(
            "absolute inset-0 bg-[var(--page)]/95 backdrop-blur-2xl transition-opacity duration-500",
            mobileOpen ? "opacity-100" : "opacity-0",
          )}
          onClick={() => setMobileOpen(false)}
        />
        <nav
          aria-label="Mobile"
          className="relative flex h-full flex-col justify-between px-5 pb-8 pt-24"
        >
          <ul className="space-y-1">
            {[...navLinks, { href: "/roadmap/", label: "Roadmap" }].map((link, i) => (
              <li
                key={link.href}
                className={cn(
                  "transition-[opacity,transform] duration-500",
                  mobileOpen ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0",
                )}
                style={{ transitionDelay: mobileOpen ? `${90 + i * 55}ms` : "0ms" }}
              >
                <Link
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className="flex items-baseline justify-between border-b border-[var(--border)] py-3.5"
                >
                  <span className="font-display text-[1.9rem] font-semibold tracking-[-0.04em]">
                    {link.label}
                  </span>
                  <span className="font-mono text-[0.6rem] text-[var(--text-subtle)]">
                    0{i + 1}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
          <p className="font-mono text-[0.62rem] uppercase tracking-[0.2em] text-[var(--text-subtle)]">
            254 tools · nothing uploaded
          </p>
        </nav>
      </div>
    </>
  );
}
