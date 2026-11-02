import type { CategoryId } from "@/lib/tools/types";
import { cn } from "@/lib/utils";

/**
 * Small line-art vignettes, one per category, drawn with the current text colour
 * so they inherit the category tint. They are decorative only: the category name
 * always sits next to them, so the `aria-hidden` figure adds no noise.
 */
const art: Record<CategoryId, React.ReactNode> = {
  text: (
    <>
      <path d="M14 24h56M14 36h72M14 48h44M14 60h62" />
      <rect x="84" y="52" width="4" height="16" rx="1" fill="currentColor" opacity=".55" />
    </>
  ),
  calculators: (
    <>
      <rect x="22" y="14" width="76" height="60" rx="8" />
      <path d="M32 26h40" />
      {[0, 1, 2].map((row) =>
        [0, 1, 2].map((col) => (
          <rect
            key={`${row}-${col}`}
            x={32 + col * 20}
            y={38 + row * 11}
            width="10"
            height="6"
            rx="2"
            fill="currentColor"
            opacity=".28"
          />
        )),
      )}
      <rect x="88" y="26" width="10" height="6" rx="3" fill="currentColor" opacity=".6" />
    </>
  ),
  finance: (
    <>
      <path d="M16 68h88" />
      <rect x="24" y="46" width="12" height="22" rx="3" fill="currentColor" opacity=".22" />
      <rect x="44" y="36" width="12" height="32" rx="3" fill="currentColor" opacity=".3" />
      <rect x="64" y="26" width="12" height="42" rx="3" fill="currentColor" opacity=".4" />
      <rect x="84" y="16" width="12" height="52" rx="3" fill="currentColor" opacity=".55" />
      <path d="M22 34l20-10 18 6 22-14" strokeDasharray="3 4" />
    </>
  ),
  developer: (
    <>
      <path d="M34 22L14 44l20 22M86 22l20 22-20 22M70 18L50 70" />
      <circle cx="60" cy="44" r="3" fill="currentColor" opacity=".5" />
    </>
  ),
  everyday: (
    <>
      <circle cx="48" cy="46" r="26" />
      <path d="M48 30v16l12 8" />
      <path d="M84 26a10 10 0 0 1 10 10M84 16a20 20 0 0 1 20 20" opacity=".5" />
    </>
  ),
  seo: (
    <>
      <circle cx="50" cy="40" r="22" />
      <path d="M66 56l18 18" strokeWidth="3" />
      <path d="M40 46v-8M50 46v-14M60 46v-4" strokeWidth="3" />
    </>
  ),
  security: (
    <>
      <path d="M50 14l30 10v22c0 18-12 30-30 36-18-6-30-18-30-36V24z" />
      <circle cx="50" cy="40" r="7" />
      <path d="M50 47v12" />
    </>
  ),
  images: (
    <>
      <rect x="14" y="18" width="88" height="56" rx="8" />
      <circle cx="40" cy="36" r="6" />
      <path d="M18 66l22-22 16 16 12-12 26 26" />
    </>
  ),
  pdf: (
    <>
      <path d="M28 12h34l20 20v46a6 6 0 0 1-6 6H28a6 6 0 0 1-6-6V18a6 6 0 0 1 6-6z" />
      <path d="M62 12v20h20" />
      <path d="M34 48h30M34 58h34M34 68h20" />
    </>
  ),
  education: (
    <>
      <path d="M54 26C44 18 30 18 20 20v48c10-2 24-2 34 6 10-8 24-8 34-6V20c-10-2-24-2-34 6z" />
      <path d="M54 26v48" />
      <path d="M32 36h12M64 36h12M32 48h12M64 48h12" opacity=".55" />
    </>
  ),
  internet: (
    <>
      <circle cx="50" cy="46" r="28" />
      <path d="M22 46h56M50 18c10 10 14 20 14 28s-4 18-14 28c-10-10-14-20-14-28s4-18 14-28z" />
      <path d="M84 26c6 4 10 10 12 16M84 66c6-4 10-10 12-16" opacity=".5" />
    </>
  ),
  business: (
    <>
      <rect x="14" y="32" width="80" height="46" rx="8" />
      <path d="M42 32v-8a8 8 0 0 1 8-8h8a8 8 0 0 1 8 8v8" />
      <path d="M14 52h80" opacity=".5" />
      <rect x="44" y="46" width="20" height="12" rx="4" fill="currentColor" opacity=".35" />
    </>
  ),
};

export function CategoryArt({
  id,
  className,
}: {
  id: CategoryId;
  className?: string;
}) {
  return (
    <svg
      viewBox="0 0 116 88"
      className={cn("text-[var(--tint)]", className)}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      {art[id]}
    </svg>
  );
}
