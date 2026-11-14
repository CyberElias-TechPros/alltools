"use client";

import { useRef, type ReactNode, type MouseEvent } from "react";
import { cn } from "@/lib/utils";

/**
 * React Bits–style SpotlightCard: a radial glow + border highlight that
 * follows the cursor via CSS variables (`--mx`, `--my`). Pure CSS/JS
 * mouse tracking — no animation library needed.
 */
export function SpotlightCard({
  children,
  className,
  spotlightColor = "rgba(255, 75, 0, 0.12)",
}: {
  children: ReactNode;
  className?: string;
  spotlightColor?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);

  function onMove(e: MouseEvent<HTMLDivElement>) {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    el.style.setProperty("--mx", `${e.clientX - rect.left}px`);
    el.style.setProperty("--my", `${e.clientY - rect.top}px`);
  }

  return (
    <div
      ref={ref}
      onMouseMove={onMove}
      className={cn("spotlight-card group/spot relative", className)}
      style={{ "--spot": spotlightColor } as React.CSSProperties}
    >
      {children}
    </div>
  );
}
