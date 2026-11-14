import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * React Bits–style Marquee: an infinite CSS scroll strip.
 * Content is duplicated once for a seamless loop; the duplicate is
 * `aria-hidden` so screen readers hear each item once.
 */
export function Marquee({
  children,
  className,
  speed = "normal",
  reverse = false,
}: {
  children: ReactNode;
  className?: string;
  speed?: "slow" | "normal" | "fast";
  reverse?: boolean;
}) {
  return (
    <div className={cn("marquee group relative overflow-hidden", className)}>
      <div
        className={cn(
          "marquee-track flex w-max items-center",
          speed === "slow" && "marquee-slow",
          speed === "fast" && "marquee-fast",
          reverse && "marquee-reverse",
        )}
      >
        <div className="flex shrink-0 items-center">{children}</div>
        <div className="flex shrink-0 items-center" aria-hidden>
          {children}
        </div>
      </div>
    </div>
  );
}
