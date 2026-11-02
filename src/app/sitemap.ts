import type { MetadataRoute } from "next";
import { categories } from "@/lib/tools/categories";
import { liveTools } from "@/lib/tools/registry";
import { guides } from "@/lib/guides";
import { siteConfig } from "@/lib/site";

export const dynamic = "force-static";

/**
 * Every indexable URL, derived from the same registries that render the pages —
 * so the sitemap cannot list a 404 or miss a tool. `lastModified` comes from the
 * content itself (tool addedAt, guide updated) instead of "now", which would
 * make every URL look permanently fresh to crawlers.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const updated = new Date().toISOString().slice(0, 10);

  const staticPages = [
    { path: "/", priority: 1, changeFrequency: "daily" as const, lastModified: updated },
    { path: "/tools/", priority: 0.95, changeFrequency: "daily" as const, lastModified: updated },
    { path: "/categories/", priority: 0.85, changeFrequency: "weekly" as const, lastModified: updated },
    { path: "/guides/", priority: 0.7, changeFrequency: "monthly" as const, lastModified: updated },
    { path: "/about/", priority: 0.5, changeFrequency: "yearly" as const, lastModified: updated },
    { path: "/contact/", priority: 0.4, changeFrequency: "yearly" as const, lastModified: updated },
    { path: "/roadmap/", priority: 0.4, changeFrequency: "monthly" as const, lastModified: updated },
    { path: "/privacy-policy/", priority: 0.3, changeFrequency: "yearly" as const, lastModified: updated },
    { path: "/terms/", priority: 0.3, changeFrequency: "yearly" as const, lastModified: updated },
    { path: "/disclaimer/", priority: 0.3, changeFrequency: "yearly" as const, lastModified: updated },
    { path: "/cookies/", priority: 0.3, changeFrequency: "yearly" as const, lastModified: updated },
    { path: "/accessibility/", priority: 0.3, changeFrequency: "yearly" as const, lastModified: updated },
    { path: "/editorial-policy/", priority: 0.3, changeFrequency: "yearly" as const, lastModified: updated },
  ];

  return [
    ...staticPages.map((page) => ({
      url: `${siteConfig.url}${page.path}`,
      lastModified: page.lastModified,
      changeFrequency: page.changeFrequency,
      priority: page.priority,
      images: [`${siteConfig.url}/og/tools.png`],
    })),
    ...categories.map((category) => ({
      url: `${siteConfig.url}/categories/${category.id}/`,
      lastModified: updated,
      changeFrequency: "weekly" as const,
      priority: 0.8,
      images: [`${siteConfig.url}/og/${category.id}.png`],
    })),
    ...liveTools.map((tool) => ({
      url: `${siteConfig.url}/tools/${tool.slug}/`,
      lastModified: new Date(tool.addedAt).toISOString().slice(0, 10),
      changeFrequency: "monthly" as const,
      priority: 0.75,
      images: [`${siteConfig.url}/og/${tool.category}.png`],
    })),
    ...guides.map((guide) => ({
      url: `${siteConfig.url}/guides/${guide.slug}/`,
      lastModified: new Date(guide.updated).toISOString().slice(0, 10),
      changeFrequency: "yearly" as const,
      priority: 0.6,
      images: [`${siteConfig.url}/og/tools.png`],
    })),
  ];
}
