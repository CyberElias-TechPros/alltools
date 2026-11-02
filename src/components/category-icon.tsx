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
import { cn } from "@/lib/utils";

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

/** CSS class that carries the category hue (see globals.css). */
const tints: Record<CategoryId, string> = {
  text: "cat-text",
  calculators: "cat-calculators",
  developer: "cat-developer",
  everyday: "cat-everyday",
  finance: "cat-finance",
  seo: "cat-seo",
  security: "cat-security",
  images: "cat-images",
  pdf: "cat-pdf",
  education: "cat-education",
  internet: "cat-internet",
  business: "cat-business",
};

export function categoryTone(id: CategoryId): string {
  return tints[id];
}

/** Bare icon, inheriting whatever colour the parent sets. */
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
 * The colour-coded rounded tile that gives the catalogue its visual rhythm —
 * one hue per category, used on tool cards, category grids and search results.
 */
export function CategoryTile({
  id,
  size = "md",
  className,
}: {
  id: CategoryId;
  size?: "sm" | "md" | "lg";
  className?: string;
}) {
  const Icon = icons[id];
  return (
    <span
      className={cn(
        "cat-tile",
        tints[id],
        size === "sm" && "size-8 rounded-[8px]",
        size === "md" && "size-10",
        size === "lg" && "size-12",
        className,
      )}
      aria-hidden
    >
      <Icon className={size === "lg" ? "size-[1.35rem]" : size === "sm" ? "size-4" : "size-[1.15rem]"} />
    </span>
  );
}
