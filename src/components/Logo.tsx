export function LogoMark({ className = "size-8" }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={className} aria-hidden>
      <rect width="32" height="32" rx="9" className="fill-primary" />
      <path d="M8 22V10l5 6 5-6v12" className="stroke-primary-foreground" strokeWidth="2.4" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M21 11.5l5 4.5-5 4.5z" className="fill-primary-foreground" />
    </svg>
  );
}

export function Logo() {
  return (
    <span className="flex items-center gap-2.5">
      <LogoMark />
      <span className="font-display text-[17px] font-bold tracking-tight">
        MOTION<span className="text-primary">REST</span>
      </span>
    </span>
  );
}
