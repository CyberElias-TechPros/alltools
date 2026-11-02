import Link from "next/link";
import { ArrowLeft, Search } from "lucide-react";
import { popularTools } from "@/lib/tools/registry";
import { ToolCard } from "@/components/tool-card";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-6xl px-4 pb-16 pt-10 sm:px-6">
      <p className="outline-numeral text-[28vw] leading-none sm:text-[16rem]">404</p>
      <div className="-mt-4 border-t border-[var(--text)] pt-6">
        <h1 className="display text-[clamp(1.9rem,4.4vw,3rem)] text-[var(--text)]">
          That page does not exist
        </h1>
        <p className="lede mt-3">
          The link may be outdated, or the tool may not have shipped yet. Everything we have
          published is listed in the directory — nothing is hidden behind a placeholder.
        </p>
        <div className="mt-6 flex flex-wrap gap-2">
          <Link href="/tools/" className="btn btn-primary">
            <Search className="size-3.5" aria-hidden />
            Browse all tools
          </Link>
          <Link href="/" className="btn btn-secondary">
            <ArrowLeft className="size-3.5" aria-hidden />
            Back to home
          </Link>
        </div>
      </div>

      <section className="mt-14">
        <div className="border-b border-[var(--text)] pb-3">
          <h2 className="eyebrow">Popular tools</h2>
        </div>
        <ol className="mt-2">
          {popularTools.slice(0, 4).map((tool, index) => (
            <ToolCard key={tool.slug} tool={tool} variant="row" index={index + 1} />
          ))}
        </ol>
      </section>
    </div>
  );
}
