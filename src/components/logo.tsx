export function LogoMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 32 32"
      className={className}
      role="img"
      aria-label="Toolora logo"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect width="32" height="32" rx="9" fill="url(#toolora-gradient)" />
      <path
        d="M9.5 10.5h13M16 10.5v11"
        stroke="white"
        strokeWidth="2.6"
        strokeLinecap="round"
      />
      <circle cx="16" cy="16" r="2.2" fill="white" opacity="0.9" />
      <defs>
        <linearGradient id="toolora-gradient" x1="0" y1="0" x2="32" y2="32">
          <stop stopColor="#6366F1" />
          <stop offset="0.55" stopColor="#4F46E5" />
          <stop offset="1" stopColor="#0D9488" />
        </linearGradient>
      </defs>
    </svg>
  );
}

export function Logo({ className }: { className?: string }) {
  return (
    <span className={className}>
      <span className="flex items-center gap-2.5">
        <LogoMark className="size-8 shrink-0" />
        <span className="text-[1.15rem] font-bold tracking-[-0.03em] text-[var(--text)]">
          Toolora
        </span>
      </span>
    </span>
  );
}
