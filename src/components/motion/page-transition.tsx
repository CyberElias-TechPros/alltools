"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

/**
 * Route-level entrance: keyed on the pathname so every navigation replays a
 * short, restrained rise. Deliberately starts at 30% opacity rather than 0 —
 * the content is painted immediately (no LCP penalty) while still settling
 * into place. Disabled by the global reduced-motion rules.
 */
export function PageTransition({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  return (
    <div key={pathname} className="page-in">
      {children}
    </div>
  );
}
