export function LogoMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      role="img"
      aria-label="Tools logo"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect width="24" height="24" rx="6.5" fill="currentColor" />
      {/* Calibration cross, with one quadrant filled in the signal colour. */}
      <path d="M4 11.1h16v1.8H4z" fill="var(--page)" />
      <path d="M11.1 4h1.8v16h-1.8z" fill="var(--page)" />
      <path d="M13.6 4h3.9A2.5 2.5 0 0 1 20 6.5v3.9h-6.4z" fill="var(--ring)" />
    </svg>
  );
}

export function Logo({ className }: { className?: string }) {
  return (
    <span className={className}>
      <span className="flex items-center gap-2.5">
        <LogoMark className="size-[26px] shrink-0 text-[var(--text)]" />
        <span className="font-display text-[1.3rem] font-bold leading-none tracking-[-0.05em] text-[var(--text)]">
          Tools
        </span>
      </span>
    </span>
  );
}
