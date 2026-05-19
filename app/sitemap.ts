import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const routes = [
    "",
    "/about",
    "/academics",
    "/admissions",
    "/gallery",
    "/notices",
    "/alumni",
    "/contact",
    "/results",
    "/login",
  ];
  const lastModified = new Date();
  return routes.map((p) => ({
    url: `${base}${p}`,
    lastModified,
    changeFrequency: "weekly",
    priority: p === "" ? 1 : 0.7,
  }));
}
