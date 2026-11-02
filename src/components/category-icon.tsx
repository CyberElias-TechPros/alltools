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

const tones: Record<string, string> = {
  brand: "bg-brand-50 text-brand-700 dark:bg-brand-500/15 dark:text-brand-300",
  amber: "bg-amber-50 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300",
  emerald: "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300",
  sky: "bg-sky-50 text-sky-700 dark:bg-sky-500/15 dark:text-sky-300",
  violet: "bg-violet-50 text-violet-700 dark:bg-violet-500/15 dark:text-violet-300",
  rose: "bg-rose-50 text-rose-700 dark:bg-rose-500/15 dark:text-rose-300",
  slate: "bg-slate-100 text-slate-700 dark:bg-slate-500/15 dark:text-slate-300",
  cyan: "bg-cyan-50 text-cyan-700 dark:bg-cyan-500/15 dark:text-cyan-300",
  orange: "bg-orange-50 text-orange-700 dark:bg-orange-500/15 dark:text-orange-300",
  indigo: "bg-indigo-50 text-indigo-700 dark:bg-indigo-500/15 dark:text-indigo-300",
  teal: "bg-teal-50 text-teal-700 dark:bg-teal-500/15 dark:text-teal-300",
  fuchsia: "bg-fuchsia-50 text-fuchsia-700 dark:bg-fuchsia-500/15 dark:text-fuchsia-300",
};

export function categoryTone(accent: string): string {
  return tones[accent] ?? tones.brand;
}
