import { cn } from "@/lib/utils";

/**
 * React Bits–style CircularText: text on a rotating circular path.
 * Pure SVG + CSS rotation. Decorative (`aria-hidden`) — pair with a
 * real label nearby.
 */
export function CircularText({
  text,
  className,
  size = 110,
}: {
  text: string;
  className?: string;
  size?: number;
}) {
  const id = `circ-${text.replace(/\s+/g, "-").toLowerCase()}`;
  return (
    <div
      aria-hidden
      className={cn("circular-text relative shrink-0", className)}
      style={{ width: size, height: size }}
    >
      <svg viewBox="0 0 100 100" className="circular-text-spin h-full w-full">
        <defs>
          <path id={id} d="M 50,50 m -38,0 a 38,38 0 1,1 76,0 a 38,38 0 1,1 -76,0" />
        </defs>
        <text className="fill-current font-mono uppercase" style={{ fontSize: 8.2, letterSpacing: 2.2 }}>
          <textPath href={`#${id}`}>{text}</textPath>
        </text>
      </svg>
      <span className="absolute inset-0 flex items-center justify-center">
        <span className="size-2 rounded-full bg-[var(--ring)]" />
      </span>
    </div>
  );
}
