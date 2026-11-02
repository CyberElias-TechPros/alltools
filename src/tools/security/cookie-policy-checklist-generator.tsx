"use client";

import { ChecklistTool } from "@/components/tools/checklist-tool";
import { COOKIE_CHECKLIST } from "@/lib/security";

export default function CookiePolicyChecklistGenerator() {
  return (
    <ChecklistTool
      id="cookie-checklist"
      storageKey="tools.cookie-checklist"
      intro="A consent setup fails on details: analytics firing before the banner, a reject button that does not exist, a cookie policy listing three cookies when the browser shows eleven. Work through these in order — the inventory comes first because everything else depends on it."
      sections={[
        {
          title: "Inventory and classification",
          items: COOKIE_CHECKLIST.filter((item) =>
            ["inventory", "classify", "third-parties", "expiry"].includes(item.id),
          ).map((item) => `${item.label} — ${item.detail}`),
        },
        {
          title: "Consent mechanics",
          items: COOKIE_CHECKLIST.filter((item) =>
            ["block-before-consent", "refuse-as-easy", "granular", "withdraw", "record"].includes(item.id),
          ).map((item) => `${item.label} — ${item.detail}`),
        },
        {
          title: "Disclosure and upkeep",
          items: COOKIE_CHECKLIST.filter((item) =>
            ["disclose", "review", "global"].includes(item.id),
          ).map((item) => `${item.label} — ${item.detail}`),
        },
      ]}
    />
  );
}
