import { cn } from "@/lib/utils";

/**
 * React Bits–style Aurora: layered, blurred gradient blobs drifting on
 * CSS keyframes. Pure CSS — no canvas, no JS, respects reduced motion
 * via the global stylesheet.
 */
export function Aurora({
  className,
  intensity = "normal",
}: {
  className?: string;
  intensity?: "soft" | "normal" | "strong";
}) {
  return (
    <div aria-hidden className={cn("aurora pointer-events-none absolute inset-0 overflow-hidden", className)}>
      <div className="aurora-blob aurora-1" />
      <div className="aurora-blob aurora-2" />
      <div className="aurora-blob aurora-3" />
      <div className="aurora-blob aurora-4" />
      {intensity === "strong" ? <div className="aurora-blob aurora-5" /> : null}
    </div>
  );
}
