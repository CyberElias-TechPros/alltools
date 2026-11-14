"use client";

import Link from "next/link";
import { ArrowDownRight, ArrowUpRight, Sparkles } from "lucide-react";
import { useEffect, useRef } from "react";
import { HeroSearch } from "@/components/hero-search";
import { Aurora } from "@/components/bits/aurora";
import { Beams } from "@/components/bits/beams";
import { Particles } from "@/components/bits/particles";
import { CircularText } from "@/components/bits/circular-text";
import { SplitText } from "@/components/motion/split-text";
import { Magnet } from "@/components/motion/magnetic";
import { HeroParallax } from "./hero-parallax";
import { readIntroFlag } from "@/components/motion/preloader";

const QUICK_LINKS = [
  { slug: "word-counter", label: "Word counter" },
  { slug: "percentage-calculator", label: "Percentage" },
  { slug: "json-formatter", label: "JSON" },
  { slug: "unit-converter", label: "Units" },
  { slug: "qr-code-generator", label: "QR codes" },
  { slug: "password-generator", label: "Passwords" },
];

const SPECIMEN = [
  { label: "JSON formatter", meta: "developer", slug: "json-formatter", depth: 14 },
  { label: "Word counter", meta: "text", slug: "word-counter", depth: -18 },
  { label: "Unit converter", meta: "everyday", slug: "unit-converter", depth: 22 },
  { label: "Password generator", meta: "security", slug: "password-generator", depth: -12 },
];

export function Hero({ count, categories }: { count: number; categories: number }) {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    /*
     * If hydration landed late, the first paint already showed the settled
     * hero. Rewinding it now would read as a glitch, so skip the entrance
     * entirely and leave the page exactly as rendered.
     */
    if (performance.now() > 900) return;
    let ctx: { revert: () => void } | null = null;
    let cancelled = false;

    const play = async () => {
      if (cancelled) return;
      try {
        const [{ gsap }, { ScrollTrigger }] = await Promise.all([
          import("gsap"),
          import("gsap/ScrollTrigger"),
        ]);
        gsap.registerPlugin(ScrollTrigger);
        const root = rootRef.current;
        if (!root || cancelled) return;
        ctx = gsap.context(() => {
          const tl = gsap.timeline({ defaults: { ease: "power4.out" } });
          tl.fromTo(
            "[data-hero-eyebrow]",
            { opacity: 0, y: 12 },
            { opacity: 1, y: 0, duration: 0.7 },
          )
            .fromTo(
              "[data-hero-rule]",
              { scaleX: 0 },
              { scaleX: 1, duration: 0.9, ease: "expo.inOut", transformOrigin: "left" },
              "-=0.45",
            )
            .fromTo(
              "[data-hero-meta]",
              { opacity: 0, y: 16 },
              { opacity: 1, y: 0, duration: 0.8, stagger: 0.08 },
              "-=0.5",
            )
            .fromTo(
              "[data-hero-search]",
              { opacity: 0, y: 22, filter: "blur(8px)" },
              { opacity: 1, y: 0, filter: "blur(0px)", duration: 0.9 },
              "-=0.55",
            )
            .fromTo(
              "[data-hero-float]",
              { opacity: 0, scale: 0.9 },
              { opacity: 1, scale: 1, duration: 1, stagger: 0.09 },
              "-=0.6",
            );

          // Depth: the backdrop drifts slower than the page as the hero leaves.
          gsap.to("[data-hero-backdrop]", {
            yPercent: 14,
            ease: "none",
            scrollTrigger: {
              trigger: root,
              start: "top top",
              end: "bottom top",
              scrub: true,
            },
          });
        }, root);
      } catch {
        /* static */
      }
    };

    /*
     * The intro curtain runs once per tab session (see <Preloader/>). Mirror
     * that decision synchronously so the hero does not waste its entrance
     * behind the overlay: wait for the curtain when it is coming, otherwise
     * play immediately.
     */
    const willIntro = !readIntroFlag();

    if (!willIntro) {
      play();
      return () => {
        cancelled = true;
        ctx?.revert();
      };
    }

    const handler = () => play();
    window.addEventListener("toolz:intro-done", handler, { once: true });
    // Safety net in case the preloader errors out.
    const timeout = window.setTimeout(play, 2800);
    return () => {
      cancelled = true;
      window.removeEventListener("toolz:intro-done", handler);
      window.clearTimeout(timeout);
      ctx?.revert();
    };
  }, []);

  return (
    <section
      ref={rootRef}
      className="relative isolate overflow-hidden border-b border-[var(--border)] pt-6 sm:pt-10"
    >
      <div data-hero-backdrop className="pointer-events-none absolute inset-0 -z-10">
        <div className="hero-grid absolute inset-0 opacity-70" aria-hidden />
        <Aurora intensity="strong" className="opacity-90" />
        <Beams />
        <Particles className="opacity-70" count={60} />
      </div>

      <div className="mx-auto max-w-[1180px] px-4 pb-20 sm:px-6 sm:pb-24">
        <div className="flex items-center justify-between gap-4">
          <p
            data-hero-eyebrow
            className="flex items-center gap-2 font-mono text-[0.6rem] uppercase tracking-[0.28em] text-[var(--text-subtle)]"
          >
            <span className="inline-block size-1.5 animate-pulse rounded-full bg-[var(--ring)]" aria-hidden />
            {count} tools · {categories} categories · 0 uploads
          </p>
          <p className="hidden items-center gap-1.5 font-mono text-[0.6rem] uppercase tracking-[0.2em] text-[var(--text-subtle)] sm:flex">
            <Sparkles className="size-3 text-[var(--ring)]" aria-hidden />
            Runs entirely in your browser
          </p>
        </div>
        <div data-hero-rule className="mt-4 h-px w-full origin-left bg-[var(--border)]" aria-hidden />

        <div className="relative mt-10 grid gap-10 lg:mt-14 lg:grid-cols-[1fr_auto] lg:items-end">
          <div>
            <h1 className="display text-[clamp(3rem,10.5vw,7.4rem)] font-extrabold text-[var(--text)]">
              <SplitText splitBy="chars" stagger={0.022} duration={1.05} textAlign="left" className="block">
                Every tool
              </SplitText>
              <span className="mt-1 block sm:mt-2">
                <SplitText splitBy="chars" stagger={0.022} delay={0.12} duration={1.05} textAlign="left">
                  you need
                </SplitText>
              </span>
              <span className="mt-2 block font-normal sm:mt-4">
                <span className="serif-accent block text-[clamp(1.15rem,3.4vw,2.35rem)] leading-[1.1] text-[var(--accent-text)]">
                  <SplitText splitBy="words" stagger={0.05} delay={0.42} duration={0.9} textAlign="left">
                    — none of the uploads.
                  </SplitText>
                </span>
              </span>
            </h1>

            <p
              data-hero-meta
              className="mt-7 max-w-xl text-[1.02rem] leading-relaxed text-[var(--text-muted)]"
            >
              Count words, check percentages, format JSON, convert units or generate a password.
              {" "}
              {count} focused tools that run in your browser — instant results, no sign-up, and
              nothing you paste ever leaves your device.
            </p>

            <div data-hero-search className="mt-8 max-w-2xl">
              <HeroSearch count={count} />
            </div>

            <ul
              data-hero-meta
              className="mt-5 flex flex-wrap items-center gap-x-2 gap-y-2 text-[0.78rem] text-[var(--text-subtle)]"
            >
              {QUICK_LINKS.map((link) => (
                <li key={link.slug}>
                  <Link
                    href={`/tools/${link.slug}/`}
                    className="chip inline-flex items-center rounded-full border border-[var(--border)] bg-[var(--surface)]/70 px-3 py-1.5 transition-colors duration-300 hover:border-[var(--ring)]/45 hover:text-[var(--text)]"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Right rail: specimen panel — a live slice of the catalogue */}
          <div className="hidden w-[300px] shrink-0 flex-col gap-5 pb-1 lg:flex" data-hero-float>
            <div className="flex items-center justify-between border-b border-[var(--border)] pb-2.5">
              <span className="font-mono text-[0.56rem] uppercase tracking-[0.22em] text-[var(--text-subtle)]">
                Specimen · live
              </span>
              <span className="flex items-center gap-1.5 font-mono text-[0.56rem] uppercase tracking-[0.16em] text-[var(--text-subtle)]">
                <span className="size-1.5 animate-pulse rounded-full bg-[var(--ring)]" aria-hidden />
                ready
              </span>
            </div>

            <HeroParallax>
              <div className="flex flex-col gap-2">
                {SPECIMEN.map((item, i) => (
                  <Link
                    key={item.slug}
                    href={`/tools/${item.slug}/`}
                    data-parallax={item.depth}
                    className="glass group flex items-center gap-3 rounded-xl px-3.5 py-2.5 transition-colors duration-300 hover:border-[var(--ring)]/40"
                    style={{ marginLeft: i % 2 === 0 ? 0 : 14 }}
                  >
                    <span className="font-mono text-[0.6rem] tabular-nums text-[var(--text-subtle)]/70">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-[0.8rem] font-medium text-[var(--text)]">
                        {item.label}
                      </span>
                      <span className="block font-mono text-[0.6rem] uppercase tracking-[0.16em] text-[var(--text-subtle)]">
                        {item.meta}
                      </span>
                    </span>
                    <ArrowUpRight
                      className="size-3.5 shrink-0 text-[var(--text-subtle)] transition-all duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-[var(--ring)]"
                      aria-hidden
                    />
                  </Link>
                ))}
              </div>
            </HeroParallax>

            <div className="mt-1 flex items-center justify-between">
              <Magnet strength={0.3} padding={0}>
                <CircularText
                  text="LOCAL-FIRST · NO UPLOADS · NO ACCOUNTS · "
                  size={104}
                  className="text-[var(--text-muted)]"
                />
              </Magnet>
              <a
                href="#categories"
                className="group flex flex-col items-end gap-2 text-right text-[var(--text-subtle)]"
              >
                <span className="max-w-[110px] font-mono text-[0.6rem] uppercase leading-relaxed tracking-[0.18em]">
                  Scroll to explore
                </span>
                <span className="inline-flex size-9 items-center justify-center rounded-full border border-[var(--border-strong)] transition-colors group-hover:border-[var(--ring)] group-hover:text-[var(--ring)]">
                  <ArrowDownRight className="size-4 transition-transform group-hover:translate-y-0.5" aria-hidden />
                </span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
