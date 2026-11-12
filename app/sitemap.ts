import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  // Keep this list tight — only pages a human would want to land on from
  // search results. Admin / portal / auth routes are disallowed in robots.ts
  // and must not appear here. Dynamic slug pages (/notices/[slug],
  // /gallery/[slug]) are intentionally omitted; they're discoverable via
  // internal links from their index pages.
  const routes: Array<{ path: string; priority: number; changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"] }> = [
    { path: "",             priority: 1.0, changeFrequency: "weekly" },
    { path: "/about",       priority: 0.8, changeFrequency: "monthly" },
    { path: "/academics",   priority: 0.9, changeFrequency: "monthly" },
    { path: "/campus-life", priority: 0.7, changeFrequency: "monthly" },
    { path: "/admissions",  priority: 0.9, changeFrequency: "weekly" },
    { path: "/gallery",     priority: 0.6, changeFrequency: "weekly" },
    { path: "/notices",     priority: 0.7, changeFrequency: "daily" },
    { path: "/alumni",      priority: 0.5, changeFrequency: "monthly" },
    { path: "/contact",     priority: 0.7, changeFrequency: "yearly" },
    { path: "/results",     priority: 0.8, changeFrequency: "weekly" },
  ];
  const lastModified = new Date();
  return routes.map(({ path, priority, changeFrequency }) => ({
    url: `${base}${path}`,
    lastModified,
    changeFrequency,
    priority,
  }));
}
