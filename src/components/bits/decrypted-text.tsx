"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

const GLYPHS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789#%&@";

/**
 * React Bits–style DecryptedText: characters scramble into place when
 * the element scrolls into view (or on hover). The final string is
 * rendered in SSR HTML; the scramble is a progressive enhancement.
 */
export function DecryptedText({
  text,
  className,
  speed = 38,
  maxIterations = 14,
}: {
  text: string;
  className?: string;
  speed?: number;
  maxIterations?: number;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const [display, setDisplay] = useState(text);
  const started = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let interval: ReturnType<typeof setInterval> | null = null;
    const run = () => {
      if (started.current) return;
      started.current = true;
      let iteration = 0;
      interval = setInterval(() => {
        iteration += 1;
        const revealed = Math.floor(iteration / 2);
        setDisplay(
          text
            .split("")
            .map((ch, i) => {
              if (ch === " " || i < revealed) return ch;
              return GLYPHS[Math.floor(Math.random() * GLYPHS.length)];
            })
            .join(""),
        );
        if (revealed >= text.length || iteration > maxIterations * 2) {
          setDisplay(text);
          if (interval) clearInterval(interval);
        }
      }, speed);
    };

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          run();
          observer.disconnect();
        }
      },
      { threshold: 0.4 },
    );
    observer.observe(el);
    return () => {
      observer.disconnect();
      if (interval) clearInterval(interval);
    };
  }, [text, speed, maxIterations]);

  return (
    <span ref={ref} className={cn("decrypted-text", className)} aria-label={text}>
      <span aria-hidden>{display}</span>
    </span>
  );
}
