export function LogoMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      role="img"
      aria-label="Toolora logo"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect width="24" height="24" fill="currentColor" />
      {/* Calibration mark: a cross with one quadrant cut out. */}
      <path d="M4 11.25h16v1.5H4z" fill="var(--page)" />
      <path d="M11.25 4h1.5v16h-1.5z" fill="var(--page)" />
      <rect x="12.75" y="4" width="7.25" height="7.25" fill="var(--ring)" />
    </svg>
  );
}

export function Logo({ className }: { className?: string }) {
  return (
    <span className={className}>
      <span className="flex items-center gap-2.5">
        <LogoMark className="size-[22px] shrink-0 text-[var(--text)]" />
        <span className="font-display text-[1.28rem] font-bold leading-none tracking-[-0.05em] text-[var(--text)]">
          Toolora
        </span>
      </span>
    </span>
  );
}
