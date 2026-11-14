import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/** React Bits–style ShinyText: a light sweep across gradient text. */
export function ShinyText({
  children,
  className,
  speed = 3.2,
}: {
  children: ReactNode;
  className?: string;
  speed?: number;
}) {
  return (
    <span
      className={cn("shiny-text", className)}
      style={{ animationDuration: `${speed}s` }}
    >
      {children}
    </span>
  );
}

/** Gradient text (React Bits GradientText). */
export function GradientText({
  children,
  className,
  colors = ["#ff4b00", "#ff7a3d", "#c0a2ff", "#38bdf8"],
  animate = true,
}: {
  children: ReactNode;
  className?: string;
  colors?: string[];
  animate?: boolean;
}) {
  return (
    <span
      className={cn("gradient-text", animate && "gradient-text-animated", className)}
      style={
        {
          backgroundImage: `linear-gradient(90deg, ${colors.join(", ")}, ${colors[0]})`,
        } as React.CSSProperties
      }
    >
      {children}
    </span>
  );
}
