import Link from "next/link";
import { ArrowLeft, Search } from "lucide-react";
import { popularTools } from "@/lib/tools/registry";
import { ToolCard } from "@/components/tool-card";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
      <p className="font-mono text-sm font-semibold text-brand-600 dark:text-brand-300">404</p>
      <h1 className="mt-2 text-3xl font-bold tracking-[-0.03em] text-[var(--text)]">
        That page does not exist
      </h1>
      <p className="mt-2 max-w-lg text-[0.98rem] leading-relaxed text-[var(--text-muted)]">
        The link may be outdated, or the tool may not have shipped yet. Everything we have published
        is listed in the directory — nothing is hidden behind a placeholder.
      </p>
      <div className="mt-5 flex flex-wrap gap-2">
        <Link href="/tools/" className="btn btn-primary">
          <Search className="size-4" aria-hidden />
          Browse all tools
        </Link>
        <Link href="/" className="btn btn-secondary">
          <ArrowLeft className="size-4" aria-hidden />
          Back to home
        </Link>
      </div>

      <h2 className="mt-10 text-sm font-bold uppercase tracking-[0.08em] text-[var(--text-subtle)]">
        Popular tools
      </h2>
      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        {popularTools.slice(0, 4).map((tool) => (
          <ToolCard key={tool.slug} tool={tool} showCategory />
        ))}
      </div>
    </div>
  );
}
