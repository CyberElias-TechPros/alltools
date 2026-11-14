"use client";

import { useEffect, useMemo, useRef, type ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * React Bits–style SplitText, rebuilt for this codebase.
 *
 * Splits text into words/chars and staggers them in with GSAP on mount
 * (or on scroll into view). The full string stays available to screen
 * readers via `aria-label`; the split spans are `aria-hidden`.
 *
 * Children may be a string or a ReactNode containing styled spans
 * (e.g. a serif-italic word). Node children are split at the top level
 * by walking the tree so styling survives the split.
 */

type SplitBy = "chars" | "words" | "chars,words";

function splitNode(node: ReactNode, splitBy: SplitBy, keyPrefix: string): ReactNode[] {
  const out: ReactNode[] = [];
  let key = 0;
  const push = (text: string, parentKey: string) => {
    if (splitBy === "words") {
      text.split(/(\s+)/).forEach((part) => {
        if (!part) return;
        if (/^\s+$/.test(part)) {
          out.push(
            <span key={`${parentKey}-s${key++}`} className="split-space" aria-hidden>
              {part}
            </span>,
          );
        } else {
          out.push(
            <span key={`${parentKey}-w${key++}`} className="split-word" aria-hidden>
              <span className="split-word-inner">{part}</span>
            </span>,
          );
        }
      });
    } else {
      // chars (and chars,words both animate chars inside word wrappers)
      text.split(/(\s+)/).forEach((part) => {
        if (!part) return;
        if (/^\s+$/.test(part)) {
          out.push(
            <span key={`${parentKey}-s${key++}`} className="split-space" aria-hidden>
              {part}
            </span>,
          );
        } else {
          out.push(
            <span key={`${parentKey}-w${key++}`} className="split-word" aria-hidden>
              <span className="split-word-inner">
                {[...part].map((ch, i) => (
                  <span key={i} className="split-char">
                    {ch}
                  </span>
                ))}
              </span>
            </span>,
          );
        }
      });
    }
  };

  const walk = (n: ReactNode, parentKey: string) => {
    if (typeof n === "string" || typeof n === "number") {
      push(String(n), parentKey);
      return;
    }
    if (Array.isArray(n)) {
      n.forEach((child, i) => walk(child, `${parentKey}-${i}`));
      return;
    }
    if (n && typeof n === "object" && "props" in (n as { props?: unknown })) {
      const el = n as { type: unknown; props: { children?: ReactNode; className?: string } };
      const cls = el.props.className ?? "";
      // Preserve the wrapper element so serif/gradient styling survives.
      const inner: ReactNode[] = [];
      const collect = (c: ReactNode) => {
        if (typeof c === "string" || typeof c === "number") {
          // split inside the styled wrapper
          const before = out.length;
          push(String(c), `${parentKey}-styled`);
          // move the just-pushed nodes into inner with the wrapper class
          const moved = out.splice(before);
          inner.push(...moved);
        } else if (Array.isArray(c)) {
          c.forEach(collect);
        } else if (c && typeof c === "object") {
          const before = out.length;
          walk(c, `${parentKey}-nested`);
          const moved = out.splice(before);
          inner.push(...moved);
        }
      };
      collect(el.props.children);
      const Wrapper = (typeof el.type === "string" ? el.type : "span") as "span";
      out.push(
        <Wrapper key={`${keyPrefix}-wrap-${key++}`} className={cn("split-styled", cls)} aria-hidden>
          {inner}
        </Wrapper>,
      );
      return;
    }
    out.push(<span key={`${parentKey}-x${key++}`}>{n}</span>);
  };

  walk(node, keyPrefix);
  return out;
}

export function SplitText({
  children,
  splitBy = "chars",
  delay = 0,
  stagger = 0.028,
  duration = 0.9,
  ease = "power4.out",
  scrollTrigger = false,
  className,
  textAlign = "center",
  onLetterAnimationComplete,
}: {
  children: ReactNode;
  splitBy?: SplitBy;
  delay?: number;
  stagger?: number;
  duration?: number;
  ease?: string;
  scrollTrigger?: boolean;
  className?: string;
  textAlign?: "left" | "center" | "right";
  onLetterAnimationComplete?: () => void;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const plain = useMemo(() => {
    const collect = (n: ReactNode): string => {
      if (typeof n === "string" || typeof n === "number") return String(n);
      if (Array.isArray(n)) return n.map(collect).join("");
      if (n && typeof n === "object" && "props" in (n as { props?: unknown })) {
        return collect((n as { props: { children?: ReactNode } }).props.children);
      }
      return "";
    };
    return collect(children);
  }, [children]);

  const parts = useMemo(
    () => splitNode(children, splitBy, "st"),
    [children, splitBy],
  );

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      onLetterAnimationComplete?.();
      return;
    }
    let ctx: { revert: () => void } | null = null;
    let cancelled = false;
    (async () => {
      try {
        const [{ gsap }, { ScrollTrigger }] = await Promise.all([
          import("gsap"),
          import("gsap/ScrollTrigger"),
        ]);
        if (cancelled || !ref.current) return;
        gsap.registerPlugin(ScrollTrigger);
        const targets =
          splitBy === "words"
            ? el.querySelectorAll(".split-word-inner")
            : el.querySelectorAll(".split-char");
        ctx = gsap.context(() => {
          gsap.set(targets, { yPercent: 140, rotate: 4, opacity: 0 });
          gsap.to(targets, {
            yPercent: 0,
            rotate: 0,
            opacity: 1,
            duration,
            delay,
            ease,
            stagger,
            overwrite: true,
            onComplete: () => onLetterAnimationComplete?.(),
            ...(scrollTrigger
              ? { scrollTrigger: { trigger: el, start: "top 88%", once: true } }
              : {}),
          });
        }, el);
      } catch {
        /* static fallback: ensure visible */
        el.querySelectorAll(".split-char,.split-word-inner").forEach((n) => {
          (n as HTMLElement).style.opacity = "1";
          (n as HTMLElement).style.transform = "none";
        });
      }
    })();
    return () => {
      cancelled = true;
      ctx?.revert();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [splitBy, delay, stagger, duration, ease, scrollTrigger]);

  return (
    <span
      ref={ref}
      className={cn("split-text", className)}
      style={{ textAlign, display: "inline-block" }}
    >
      {/* Screen readers get the intact string; the split glyphs are decorative. */}
      <span className="sr-only">{plain}</span>
      {parts}
    </span>
  );
}

/** Blur-in text (React Bits BlurText) — words rise out of a blur. */
export function BlurText({
  children,
  className,
  delay = 0,
  animateBy = "words",
}: {
  children: string;
  className?: string;
  delay?: number;
  animateBy?: "words" | "letters";
}) {
  const ref = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let ctx: { revert: () => void } | null = null;
    let cancelled = false;
    (async () => {
      try {
        const [{ gsap }, { ScrollTrigger }] = await Promise.all([
          import("gsap"),
          import("gsap/ScrollTrigger"),
        ]);
        if (cancelled || !ref.current) return;
        gsap.registerPlugin(ScrollTrigger);
        const targets = el.querySelectorAll(".blur-unit");
        ctx = gsap.context(() => {
          gsap.fromTo(
            targets,
            { opacity: 0, y: 14, filter: "blur(8px)" },
            {
              opacity: 1,
              y: 0,
              filter: "blur(0px)",
              duration: 0.8,
              delay,
              stagger: 0.04,
              ease: "power3.out",
              overwrite: true,
              scrollTrigger: { trigger: el, start: "top 90%", once: true },
            },
          );
        }, el);
      } catch {
        /* visible */
      }
    })();
    return () => {
      cancelled = true;
      ctx?.revert();
    };
  }, [delay, animateBy]);

  const units =
    animateBy === "letters"
      ? [...children].map((ch, i) =>
          ch === " " ? (
            <span key={i} className="blur-space"> </span>
          ) : (
            <span key={i} className="blur-unit inline-block">{ch}</span>
          ),
        )
      : children.split(/(\s+)/).map((part, i) =>
          /^\s+$/.test(part) ? (
            <span key={i} className="blur-space">{part}</span>
          ) : (
            <span key={i} className="blur-unit inline-block">{part}</span>
          ),
        );

  return (
    <span ref={ref} className={cn("blur-text", className)}>
      <span className="sr-only">{children}</span>
      <span aria-hidden>{units}</span>
    </span>
  );
}
