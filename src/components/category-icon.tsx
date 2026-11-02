import {
  Braces,
  Calculator,
  FileText,
  Image as ImageIcon,
  Landmark,
  Languages,
  Search,
  ShieldCheck,
  Sparkles,
  Type,
  Wifi,
  Wrench,
} from "lucide-react";
import type { CategoryId } from "@/lib/tools/types";

const icons = {
  text: Type,
  calculators: Calculator,
  developer: Braces,
  everyday: Wrench,
  finance: Landmark,
  seo: Search,
  security: ShieldCheck,
  images: ImageIcon,
  pdf: FileText,
  education: Languages,
  internet: Wifi,
  business: Sparkles,
} satisfies Record<CategoryId, typeof Type>;

export function CategoryIcon({
  id,
  className,
}: {
  id: CategoryId;
  className?: string;
}) {
  const Icon = icons[id];
  return <Icon className={className} aria-hidden />;
}

/**
 * Category marks are deliberately monochrome: the system has one signal colour,
 * so a rainbow of per-category tints would fight the rest of the interface.
 * The parameter is kept so call sites stay stable if that decision changes.
 */
export function categoryTone(_accent: string): string {
  return "border border-[var(--border)] bg-transparent text-[var(--text)]";
}
