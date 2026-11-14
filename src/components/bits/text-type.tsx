"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

/**
 * React Bits–style TextType: types, pauses, deletes and cycles through
 * phrases with a blinking caret. `aria-hidden` — the static list of
 * phrases stays available via the parent's accessible text.
 */
export function TextType({
  texts,
  className,
  typingSpeed = 55,
  deletingSpeed = 32,
  pause = 1400,
}: {
  texts: string[];
  className?: string;
  typingSpeed?: number;
  deletingSpeed?: number;
  pause?: number;
}) {
  const [display, setDisplay] = useState(texts[0] ?? "");
  const stateRef = useRef({ index: 0, char: (texts[0] ?? "").length, deleting: false });

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setDisplay(texts[0] ?? "");
      return;
    }
    let timer: ReturnType<typeof setTimeout>;
    const tick = () => {
      const s = stateRef.current;
      const current = texts[s.index % texts.length] ?? "";
      if (!s.deleting) {
        s.char += 1;
        setDisplay(current.slice(0, s.char));
        if (s.char >= current.length) {
          s.deleting = true;
          timer = setTimeout(tick, pause);
          return;
        }
        timer = setTimeout(tick, typingSpeed + Math.random() * 30);
      } else {
        s.char -= 1;
        setDisplay(current.slice(0, Math.max(0, s.char)));
        if (s.char <= 0) {
          s.deleting = false;
          s.index += 1;
          timer = setTimeout(tick, 320);
          return;
        }
        timer = setTimeout(tick, deletingSpeed);
      }
    };
    timer = setTimeout(tick, pause);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [texts.join("|")]);

  return (
    <span aria-hidden className={cn("text-type inline-flex items-baseline", className)}>
      <span>{display}</span>
      <span className="text-type-caret ml-0.5 inline-block h-[1em] w-[2px] translate-y-[0.15em] bg-[var(--ring)]" />
    </span>
  );
}
