import type { MetadataRoute } from "next";
import { categories } from "@/lib/tools/categories";
import { liveTools } from "@/lib/tools/registry";
import { guides } from "@/lib/guides";
import { siteConfig } from "@/lib/site";

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  const staticPages = [
    { path: "/", priority: 1, changeFrequency: "weekly" as const },
    { path: "/tools/", priority: 0.9, changeFrequency: "weekly" as const },
    { path: "/categories/", priority: 0.8, changeFrequency: "monthly" as const },
    { path: "/guides/", priority: 0.7, changeFrequency: "monthly" as const },
    { path: "/about/", priority: 0.5, changeFrequency: "yearly" as const },
    { path: "/contact/", priority: 0.5, changeFrequency: "yearly" as const },
    { path: "/roadmap/", priority: 0.5, changeFrequency: "monthly" as const },
    { path: "/privacy-policy/", priority: 0.3, changeFrequency: "yearly" as const },
    { path: "/terms/", priority: 0.3, changeFrequency: "yearly" as const },
    { path: "/disclaimer/", priority: 0.3, changeFrequency: "yearly" as const },
    { path: "/cookies/", priority: 0.3, changeFrequency: "yearly" as const },
    { path: "/accessibility/", priority: 0.3, changeFrequency: "yearly" as const },
    { path: "/editorial-policy/", priority: 0.3, changeFrequency: "yearly" as const },
  ];

  return [
    ...staticPages.map((page) => ({
      url: `${siteConfig.url}${page.path}`,
      lastModified: now,
      changeFrequency: page.changeFrequency,
      priority: page.priority,
    })),
    ...categories.map((category) => ({
      url: `${siteConfig.url}/categories/${category.id}/`,
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: 0.7,
    })),
    ...liveTools.map((tool) => ({
      url: `${siteConfig.url}/tools/${tool.slug}/`,
      lastModified: new Date(tool.addedAt),
      changeFrequency: "monthly" as const,
      priority: 0.8,
    })),
    ...guides.map((guide) => ({
      url: `${siteConfig.url}/guides/${guide.slug}/`,
      lastModified: new Date(guide.updated),
      changeFrequency: "yearly" as const,
      priority: 0.6,
    })),
  ];
}
