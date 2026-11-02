"use client";

import { useEffect, useRef } from "react";
import { siteConfig } from "@/lib/site";

type Placement = keyof typeof siteConfig.adsenseSlots;

/**
 * Reserved advertising container.
 *
 * Rules this component enforces, so enabling ads cannot break layout or policy:
 *
 *  - Nothing renders unless ads are enabled, a publisher ID exists AND an ad
 *    unit id is configured for this placement. We never invent a unit id or
 *    show an empty ad frame.
 *  - The frame reserves a fixed height before the ad fills, so activating ads
 *    cannot shift the page.
 *  - The slot always sits between content blocks — never inside the tool's
 *    input/result area and never styled like a control.
 *
 * See docs/ADSENSE_QA.md §4 for the placement rules and the post-approval
 * checklist.
 */
export function AdSlot({
  placement,
  label = "Advertisement",
  minHeight = 250,
}: {
  placement: Placement;
  label?: string;
  minHeight?: number;
}) {
  const unitId = siteConfig.adsenseSlots[placement];
  const enabled = siteConfig.adsEnabled && Boolean(siteConfig.adsenseClient) && Boolean(unitId);
  const insRef = useRef<HTMLModElement>(null);
  const pushed = useRef(false);

  useEffect(() => {
    if (!enabled || pushed.current) return;
    const node = insRef.current;
    // AdSense marks a filled slot; skip if the browser already rendered it.
    if (!node || node.getAttribute("data-adsbygoogle-status")) return;
    pushed.current = true;
    try {
      const w = window as unknown as { adsbygoogle?: unknown[] };
      (w.adsbygoogle = w.adsbygoogle || []).push({});
    } catch {
      /* Ad blocker, or the loader script did not run — keep the reserved space. */
    }
  }, [enabled]);

  if (!enabled) return null;

  return (
    <aside aria-label={label} className="my-10">
      <p className="mb-2 text-center text-[0.65rem] font-semibold uppercase tracking-[0.14em] text-[var(--text-subtle)]">
        {label}
      </p>
      <div
        className="overflow-hidden rounded-lg border border-[var(--border)] bg-[var(--surface-muted)]"
        style={{ minHeight }}
      >
        <ins
          ref={insRef}
          className="adsbygoogle block"
          style={{ display: "block", minHeight }}
          data-ad-client={siteConfig.adsenseClient}
          data-ad-slot={unitId}
          data-full-width-responsive="true"
        />
      </div>
    </aside>
  );
}
